# Codex Import Performance Implementation Plan

Updated: 2026-08-28

## Status

Implemented locally on 2026-08-28, stacked on the active Codex
identity-hydration branch. Automated verification is complete; production smoke
and the seven-day Neon observation remain pending deployment.

This plan addresses the measured Codex import slowdown without introducing an
asynchronous job system, distributed cache, scheduled cache warmer, or new
database representation. The intended implementation is one bounded backend
performance PR with focused frontend compatibility checks.

## Executive Decision

Keep Admin Import synchronous and keep Spring's existing process-local cache.
Change where and how the Codex catalog is reconstructed:

1. Remove the full-catalog cache warm from each individual Codex import POST.
2. Fetch the three ordered Codex element collections with targeted Hibernate
   subselect fetching so a full catalog read does not execute three queries per
   row.
3. Make the full raw Codex catalog the one canonical cached database read and
   use `sync = true` to collapse concurrent cold loads.
4. Derive summary, category, full-entry, and identity responses from that
   canonical in-memory catalog.
5. Preserve the frontend's one refresh after all selected files have imported.

The result should be one necessary database-active window for an import batch:
the writes wake Neon, the final catalog refresh happens during the same active
window, and later Codex reads remain in memory until an import or application
restart invalidates the cache.

## Why This Is The Practical Solution

An asynchronous import job would move the same database work to a background
thread. It would add job persistence, polling, cancellation, retry, and partial
failure semantics without fixing the query amplification. Scheduled warming
would be actively harmful to the Neon usage model because it could wake an idle
database when no user needs Codex data.

The measured problem is smaller and more specific:

- the Admin page already sends Codex files sequentially and refreshes once at
  the end;
- each backend POST currently evicts the Codex cache and immediately rebuilds
  the entire catalog;
- mapping one persisted Codex row initializes three lazy `@ElementCollection`
  lists;
- the current full read therefore behaves as `1 + (3 * row count)` selects;
- category cache keys can query Neon even when the complete catalog is already
  present in the same application process.

The current dataset is small enough to cache and filter in one application
process. It is large enough that thousands of database round trips are not
acceptable.

## Evidence And Current Call Flow

The smallest local Codex fixture used during the investigation was
`local-imports/codex/ewshop_victory_paths_codex_export_0.82.json`:

- file size: 5,463 bytes;
- imported entries: 2;
- persisted Codex rows at measurement time: approximately 2,519;
- SQL statements for one unchanged import POST: 7,562.

The dominant read shape was consistent with:

```text
1 root Codex query
+ N description_lines queries
+ N reference_keys queries
+ N public_context_keys queries
```

The import summary's `durationMs` did not expose this cost because
`CodexImportAdminFacadeImpl` captured the duration before calling
`codexService.getAllCodexEntries()`. The HTTP request still waited for that
call.

The pre-change runtime path was:

```text
Admin Import page
  -> sequential POST /api/admin/import/codex for every selected file
     -> ImportAdminController records per-file history
     -> CodexImportAdminFacadeImpl maps and validates the file
     -> CodexImportService writes the file snapshot and evicts all Codex keys
     -> CodexImportAdminFacadeImpl synchronously reads the full catalog
        -> CodexRepositoryAdapter.findAll()
        -> CodexMapper initializes three lazy collections per entity
  -> one final frontend loadEntries({ force: true })
```

This meant a 22-file import could rebuild the same full catalog 22 times in the
backend and then request it once more from the frontend.

## Implementation Results

Local verification on 2026-08-28 produced these results:

- the new 205-row persistence regression test failed against the old mapping at
  616 prepared statements;
- targeted `@Fetch(FetchMode.SUBSELECT)` reduced the same complete mapping to
  four prepared statements;
- concurrent full-entry and identity reads caused one repository `findAll()`;
- subsequent summary and previously unseen category reads caused no additional
  repository call;
- import eviction caused the next identity read to refill once and expose the
  replacement snapshot;
- multi-file Admin Import refreshed Codex once after success and did not refresh
  after a stopped/failed sequence;
- the ignored two-entry Codex fixture completed through the local Admin Import
  HTTP endpoint in 6 ms server-side (67 ms round trip), with both rows unchanged
  and no failures;
- the full Maven test suite, all 899 frontend tests, TypeScript compilation, and
  the production frontend build passed.

The persistence regression class is named `CodexRepositoryReadPlanTest`, not
`*IT`, so the repository's normal Surefire test run executes it in CI.

## Constraints

### Functional constraints

- Preserve the existing one-file-per-POST import contract and per-file history.
- Preserve snapshot semantics: each file remains authoritative for its
  `exportKind`.
- Preserve current validation, warning, inserted/updated/unchanged/deleted
  counts, stop-on-first-failed-Codex-file behavior, and final frontend refresh.
- Preserve public filtering, deterministic ordering, relation mapping, and the
  `statuses`/`modifiers` derivation from stored `bonuses` rows.
- Preserve route-scoped response payloads. A category request may build the
  full server-side cache, but it must still return only that category's DTOs.
- Preserve local startup-import behavior. A local startup import may leave the
  cache cold; the first real read can populate it.

### Operational constraints

- Production uses one application instance and Spring's `simple` cache.
- Neon can handle the short import burst. The priority is avoiding redundant
  wakes and extending neither the import nor later reads with unnecessary SQL.
- The cache must have no TTL and no scheduled refresh.
- Import or application restart are the only expected reasons to reconstruct
  the catalog.
- No Redis, Caffeine, queue, worker service, or new infrastructure dependency is
  justified for this change.

## Target Runtime Behavior

### Multi-file import

```text
file 1 POST -> write snapshot -> evict catalog -> return
file 2 POST -> write snapshot -> evict catalog -> return
...
file N POST -> write snapshot -> evict catalog -> return
final frontend refresh -> one cold catalog reconstruction -> cache populated
```

There is no backend read-after-write warm between files.

### Normal reads after the final refresh

```text
summary  ----\
category -----+-> canonical cached List<Codex> -> filter/map in memory
full     -----+
identities ---/
```

No category-specific repository call should occur while the canonical catalog
is cached. This matters for Neon: a category visit after more than five minutes
of database inactivity must not wake the database when the application already
holds the catalog.

### Concurrent cold reads

The frontend may request summary, category data, full entries, or identities at
nearly the same time. `@Cacheable(value = "codex", sync = true)` on the canonical
read must permit only one repository load. Other callers wait for that cache
population and then filter the cached list.

## Reviewed Technical Decisions

### 1. Use targeted subselect fetching first

Add Hibernate `@Fetch(FetchMode.SUBSELECT)` to these fields in `CodexEntity`:

- `descriptionLines`;
- `referenceKeys`;
- `publicContextKeys`.

Why this is preferable to three fetch joins:

- joining multiple ordered collections creates a cartesian product and can
  multiply transferred rows dramatically;
- the mapper needs all three collections, so leaving them lazy without a fetch
  strategy creates the measured N+1 pattern;
- subselect fetching should execute one collection query per collection for the
  parent result set, without changing the schema or response model.

Why this is preferable to `@BatchSize(size = 100)` as the first choice:

- for approximately 2,519 parents, batch size 100 still requires about 26
  queries per collection, or about 79 total reads including the root query;
- the full-catalog workload consumes every collection for every returned row,
  which is the workload where subselect fetching fits best.

Fallback: if the focused integration test cannot demonstrate stable subselect
behavior on the project's Hibernate version, use targeted
`@BatchSize(size = 100)` on the same three fields. Do not set a global Hibernate
batch-fetch property because that would change unrelated persistence behavior.

### 2. Cache the raw domain catalog, not response DTO variants

Keep `CodexService#getAllCodexEntries()` as the cache boundary. It returns the
complete domain list from `CodexRepository#findAll()`.

Do not introduce a cached snapshot DTO, precomputed search document, or map of
every response variant in this slice. Filtering and mapping roughly 2,500
in-memory objects is bounded and avoids additional cache invalidation rules.

### 3. Derive categories through the facade, not service self-invocation

`CodexFacadeImpl#getCodexEntriesByCategory()` should call the injected
`codexService.getAllCodexEntries()`, select the source export kind from that
cached list in memory, and then apply the existing public filter and normalized
category selection. The source prefilter preserves the current category-path
behavior and avoids mapping the complete catalog into DTOs for every category
response. `statuses` and `modifiers` must both prefilter stored `bonuses` rows
before their final normalized-kind filter.

Do not implement `CodexService#getCodexEntriesByExportKind()` by calling
`getAllCodexEntries()` inside the same service. That is Spring proxy
self-invocation and would bypass the `@Cacheable` interceptor.

After behavior tests pass, remove the unused category repository path:

- `CodexService#getCodexEntriesByExportKind()`;
- `CodexRepository#findAllByExportKind()`;
- `CodexRepositoryAdapter#findAllByExportKind()`;
- `CodexJpaRepository#findAllByExportKindIgnoreCase()`.

This leaves one explicit database read path rather than two competing cache
strategies.

### 4. Keep synchronous frontend import sequencing

The current sequential loop gives clear progress, deterministic snapshot
ordering, and stop-on-failure behavior. Parallel file POSTs would contend for
the same Codex tables, repeatedly evict the same cache, and make partial failure
harder to explain. A browser-side task queue would not reduce backend work.

The frontend should continue to call `refreshStoresAfterAdminImport("codex")`
once after all selected files succeed.

### 5. Do not warm on startup or on a timer

A timer conflicts directly with Neon scale-to-zero. A cache miss caused by an
application restart may wake Neon once; a recurring timer could wake it even
when nobody uses the application.

The import itself is an intentional database operation. Performing the one
final cache fill immediately afterward does not create a separate five-minute
active window.

## Implementation Work Packages

The work packages below are ordered. They should normally land together in one
reviewable PR so the query-plan fix, cache behavior, and warm removal cannot be
deployed independently in a misleading state.

### CIP-1: Add a persistence query-count regression test

Objective: make the N+1 failure measurable in an automated test before relying
on timing.

Files:

- add
  `infrastructure/src/test/java/ewshop/infrastructure/persistence/adapters/CodexRepositoryReadPlanTest.java`;
- use existing `CodexEntity`, `CodexJpaRepository`, `CodexRepositoryAdapter`,
  and `CodexMapper`.

Actions:

1. Use `@DataJpaTest` with
   `spring.jpa.properties.hibernate.generate_statistics=true` and SQL logging
   disabled for this test.
2. Import `CodexRepositoryAdapter` and `CodexMapper` into the test slice.
3. Persist at least 205 Codex entities. Give every entity one value in each of
   the three element collections so lazy collection reads cannot be optimized
   away as empty.
4. Flush and clear the persistence context.
5. Unwrap `SessionFactory`, clear Hibernate statistics, and call
   `CodexRepository#findAll()`.
6. Assert all entities and all three collection values were mapped correctly.
7. Assert an upper bound, not an exact implementation detail:
   - subselect target: no more than 6 prepared statements for the cold read;
   - batch-fetch fallback: no more than 10 prepared statements for 205 rows at
     batch size 100.

Acceptance criteria:

- the test fails against the current unbounded N+1 mapping;
- the test passes with the selected targeted fetch strategy;
- the assertion proves collection contents, not only parent-row count;
- no global JPA fetch setting is added.

Rollback point: removing the annotations must make this test fail. This proves
the test guards the actual regression.

### CIP-2: Apply the targeted collection fetch strategy

Objective: collapse full-catalog reconstruction from thousands of reads to a
small constant number.

Files:

- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/CodexEntity.java`;
- the CIP-1 integration test.

Actions:

1. Annotate the three element collections with
   `@Fetch(FetchMode.SUBSELECT)`.
2. Run the CIP-1 test on the real project Hibernate version.
3. Run the existing infrastructure tests to catch import/update/delete
   regressions.
4. If subselect fetching exceeds the test bound or changes import correctness,
   replace it with targeted `@BatchSize(size = 100)` and use the documented
   fallback bound.

Acceptance criteria:

- a cold full read on the 205-row fixture stays within the selected query
  bound;
- unchanged, updated, inserted, and obsolete-row import behavior remains
  correct;
- no fetch join, schema migration, JSON representation change, or global
  Hibernate property is introduced.

### CIP-3: Remove per-file cache reconstruction

Objective: make every import POST perform import work only, then return.

Files:

- `facade/src/main/java/ewshop/facade/impl/CodexImportAdminFacadeImpl.java`;
- `facade/src/main/java/ewshop/facade/config/FacadeConfig.java`;
- `facade/src/test/java/ewshop/facade/impl/CodexImportAdminFacadeImplTest.java`.

Actions:

1. Remove `CodexService` from `CodexImportAdminFacadeImpl`.
2. Remove `codexService.getAllCodexEntries()` from the successful import path.
3. Update the facade bean construction in `FacadeConfig`.
4. Remove `RecordingCodexService` and the assertions that expect one full read
   after success.
5. Add or rename a success test to state the intended contract explicitly:
   successful import returns the summary without reading the catalog.
6. Retain `@CacheEvict(allEntries = true)` on `CodexImportService#importCodex()`.

Acceptance criteria:

- successful, failed-validation, and empty-import paths never read Codex through
  `CodexService`;
- response counts and diagnostics are unchanged;
- in the absence of a concurrent reader, the cache remains empty after a
  successful file until a real reader requests the catalog;
- `durationMs` covers the import facade work that remains on the HTTP path.

### CIP-4: Consolidate reads behind one synchronized cache entry

Objective: ensure all Codex read shapes reuse one database result and concurrent
cold requests do not duplicate it.

Files:

- `domain/src/main/java/ewshop/domain/service/CodexService.java`;
- `domain/src/main/java/ewshop/domain/repository/CodexRepository.java`;
- `domain/src/test/java/ewshop/domain/service/CodexImportServiceTest.java`;
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/CodexRepositoryAdapter.java`;
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/repositories/CodexJpaRepository.java`;
- `facade/src/main/java/ewshop/facade/impl/CodexFacadeImpl.java`;
- `facade/src/test/java/ewshop/facade/impl/CodexFacadeImplTest.java`;
- add or extend a focused cache test such as
  `facade/src/test/java/ewshop/facade/impl/CodexCatalogCacheTest.java`.

Actions:

1. Change the full read annotation to
   `@Cacheable(value = "codex", sync = true)`.
2. Change category reads to start from
   `codexService.getAllCodexEntries()` in `CodexFacadeImpl`.
3. In memory, prefilter that list case-insensitively to the current source
   export kind (`bonuses` for `statuses` and `modifiers`, otherwise the
   normalized requested category).
4. Apply the existing `filterForCodexApi`, DTO mapping, bonus-derived kind
   normalization, and final requested-category filter to that source subset.
5. Rewrite the category facade tests to provide a mixed full catalog. Verify
   that unrelated export kinds are excluded from the response.
6. Cover ordinary categories, `statuses`, `modifiers`, unknown categories,
   invalid public rows, and deterministic order.
7. Remove the now-unused category repository/service methods listed in
   Technical Decision 3, including obsolete overrides in in-memory test
   repositories.
8. Add a cache test with a counting repository and coordinated concurrent
   callers. Start at least two different facade read shapes against an empty
   cache and assert one `findAll()` call.
9. Call summary and at least two categories again after the cache is populated
   and assert the repository count remains one.
10. Import a replacement snapshot, assert eviction, read again, and assert the
   repository count becomes two and the response contains the replacement.

Acceptance criteria:

- cold concurrent summary/category/full reads cause exactly one repository
  `findAll()` call;
- after that fill, all supported read shapes cause zero additional repository
  calls;
- import invalidation causes exactly one new fill on the next read;
- category response contents remain contract-equivalent to the current scoped
  query behavior;
- Spring's existing `ConcurrentMapCacheManager` remains the cache provider.

### CIP-5: Preserve frontend and identity-hydration behavior

Objective: ensure one final client refresh is the only deliberate read after a
multi-file import and integrate safely with the pending identity directory.

Files to verify on current `main`:

- `frontend/src/components/AdminImport/ImportModuleRow.tsx`;
- `frontend/src/components/AdminImport/adminImportRefresh.ts`;
- `frontend/src/components/AdminImport/adminImportRefresh.test.ts`.

Actions on current `main`:

1. Do not change the sequential Codex import loop.
2. Keep one `loadEntries({ force: true })` after the loop completes.
3. Add an `ImportModuleRow` behavior assertion if one does not already prove
   refresh is called once after multiple successful files and is not called
   after a stopped/failed sequence.

Actions if Codex identity hydration lands first:

1. Keep the existing final `Promise.all` of forced entry and identity loads.
2. Extend the backend cache concurrency test to call full entries and identities
   concurrently and assert one canonical repository read.
3. Preserve the derived identity cache key and confirm import's `allEntries`
   eviction clears it.
4. Remove the obsolete `findAllByExportKind` override from the identity cache
   test repository when the domain repository method is removed.
5. Rebase the performance implementation onto the identity branch before
   editing overlapping facade and frontend tests. Do not merge two independently
   edited versions of `CodexFacadeImpl` or `adminImportRefresh.ts` blindly.

Acceptance criteria:

- N successful file POSTs lead to one final frontend refresh action;
- a failed Codex file still stops later files and does not report full success;
- with identity hydration present, the two final HTTP requests share one
  synchronized cold database load;
- existing route-hydration and direct-link semantics are unchanged.

### CIP-6: Update architecture documentation

Objective: make the post-change runtime contract discoverable.

Files:

- `docs/active/codex-hydration-performance-investigation.md`;
- this implementation plan;
- `docs/active/README.md` if status or routing language changes.

Actions:

1. Replace the statement that category endpoints use a category repository
   query with the new distinction: response hydration is category-scoped, but
   the server derives it from one canonical cached catalog.
2. Document that the first read after restart/import can load the full server
   catalog while still returning a small category response.
3. Record the final selected fetch strategy and measured query counts.
4. Mark CIP items complete only after code and production smoke evidence exist.

Acceptance criteria:

- active docs do not claim category-specific database queries remain;
- frontend route-scoped payload behavior is still described accurately;
- measured values are labeled by environment and date.

## Verification Matrix

### Automated backend verification

Run focused tests during implementation:

```sh
./mvnw -pl infrastructure -am test \
  -Dtest=CodexRepositoryReadPlanTest \
  -Dsurefire.failIfNoSpecifiedTests=false

./mvnw -pl facade -am test \
  -Dtest=CodexImportAdminFacadeImplTest,CodexFacadeImplTest,CodexCatalogCacheTest \
  -Dsurefire.failIfNoSpecifiedTests=false
```

Then run the full backend suite:

```sh
./mvnw test
```

### Automated frontend verification

If frontend code or tests change, run from `frontend/`:

```sh
npm test -- --run
npx tsc --noEmit --project tsconfig.json
npm run build
```

The key behavioral assertions are:

- multiple selected Codex files are still posted sequentially;
- refresh occurs once after all success responses;
- no refresh occurs after a failed/stopped sequence;
- identity and entry refresh both remain present if the identity work has
  landed.

### Local end-to-end performance verification

Use the ignored local fixtures; never commit them.

1. Start the backend with local Codex data imported.
2. Record the persisted Codex row count.
3. Clear the application cache by restarting or by performing the test import.
4. POST the same smallest unchanged fixture used for the baseline.
5. Record HTTP wall time and confirm the import POST does not execute a full
   catalog read.
6. Request summary and a category concurrently from a cold cache.
7. Confirm one full repository read, bounded collection queries, and
   category-scoped response content.
8. Wait longer than Neon's five-minute idle interval only in an appropriate
   staging/production smoke window, then request a different category while the
   application process is unchanged. Confirm there is no Codex SQL and no new
   database wake attributable to that request.

Expected statement bounds for the current approximately 2,519-row dataset:

| Scenario | Current | Target |
| --- | ---: | ---: |
| unchanged 2-entry import POST | 7,562 total statements | import/history statements only; no full-catalog read |
| first full catalog reconstruction | about 7,558 selects | at most 6 selects with subselect fetching |
| first full reconstruction with batch fallback | about 7,558 selects | at most 100 selects |
| later summary/category/full read | varies by cache key | 0 Codex SQL |

The batch fallback bound is deliberately rounded above the theoretical
approximately 79 reads so the test does not depend on exact Hibernate statement
grouping.

### Production smoke and observation

Perform one controlled Admin Import using the normal production UI:

1. Capture start/end time and number of files.
2. Confirm every per-file history result and the final frontend success notice.
3. Confirm the final Codex refresh succeeds and public counts match the import.
4. Check application request timing for the import POSTs and final Codex GETs.
5. Check Neon activity around the import. One continuous active window is
   expected; repeated later category-driven wakes are not.
6. Observe for seven normal days. Compare Neon compute usage and Codex request
   errors to the previous baseline; do not infer success from local H2 timing
   alone. Separate Codex traffic from any database-aware health probe before
   attributing a wake to this cache path.

## Rollout And Rollback

No feature flag is required. The change is local to Codex persistence fetch
annotations, cache usage, and removal of a redundant read.

Recommended rollout order:

1. Merge or rebase the Codex identity-hydration work.
2. Implement CIP-1 through CIP-5 in one task branch.
3. Run the full verification matrix.
4. Update active docs under CIP-6 with actual results.
5. Deploy normally and run the production smoke.

Rollback triggers:

- category/full/identity response mismatch;
- import snapshot deletion or update regression;
- collection query count exceeds the documented bound;
- materially higher memory pressure or application instability;
- cache does not invalidate after import.

Rollback action: revert the performance PR as one unit. There is no database
migration or external state to undo. If only subselect fetching is unstable,
replace it with the documented targeted batch-fetch fallback and rerun the same
query-count test.

## Explicitly Deferred Alternatives

These are not part of the implementation unless new measurements satisfy the
listed trigger.

| Alternative | Why deferred | Reconsider only when |
| --- | --- | --- |
| Async import jobs / Spring Batch | Does not fix query amplification; adds durable job and retry semantics | corrected synchronous imports still exceed an agreed operator timeout |
| Parallel frontend uploads | Adds write contention and confusing partial failure | independent import kinds are proven safe and latency is dominated by network serialization |
| Redis or distributed cache | One application instance and one small catalog do not need distribution | the application runs multiple instances requiring shared invalidation |
| Caffeine | Existing simple cache already supports the required permanent entry and synchronized load | bounded eviction, memory sizing, or cache metrics become a measured requirement |
| Scheduled/delayed cache warming | Can wake Neon without demand | database compute is no longer scale-to-zero constrained and demand evidence supports it |
| Startup warming | Couples availability to database readiness and wakes Neon on every app restart | cold first-request latency remains unacceptable after the query-plan fix |
| Dedicated projection/native aggregate query | More mapping and H2/PostgreSQL compatibility work | subselect/batch fetching still misses the query or latency target |
| JSONB/schema redesign | High migration risk for a problem caused by fetch strategy | the aggregate model itself becomes the measured storage bottleneck |
| File-hash skip | Useful but separate from full-cache reconstruction | repeated identical writes remain a material share after this fix |
| Multi-file transactional API | Changes history, retry, payload, and failure contracts | per-file request overhead remains material after cache reconstruction is removed |

## Definition Of Done

The approach is complete when all of the following are true:

- [x] A query-count integration test guards all three Codex element
  collections.
- [x] A cold full catalog read meets the subselect bound, or the documented
  batch fallback bound is selected with evidence.
- [x] A successful Codex import POST never warms the full catalog in the
  backend facade.
- [x] The frontend performs one final refresh after all selected Codex files.
- [x] Full, summary, category, and identity reads share one synchronized raw
  catalog cache.
- [x] A warm request for a previously unseen category performs zero Codex SQL.
- [x] Import eviction causes the next reader to see the newly imported data.
- [x] Ordinary and bonus-derived category responses are contract-equivalent to
  the current behavior.
- [x] Backend and affected frontend verification pass.
- [x] Active hydration documentation describes the new server-side cache
  behavior.
- [ ] Production smoke confirms correct import results and one expected Neon
  activity window.
