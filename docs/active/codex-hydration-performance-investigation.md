# Codex Hydration Performance Investigation

Date: 2026-06-24

## Executive Summary

Codex currently hydrates from one all-entries endpoint:

- `GET /api/codex`
- backend returns the full public encyclopedia as `List<CodexDto>`
- frontend normalizes every entry, builds global reference indexes, and then
  computes route-specific lists from that full set

This is simple and reliable, but it means `/codex`, category routes, and direct
entry routes all wait on the same full encyclopedia payload.

The smallest safe improvement is **not pagination**. Codex needs stable direct
links, category browsing, global search, and exact reference resolution.
Pagination would add complexity without matching player behavior.

Recommended first slice:

1. Verify production compression for `/api/codex`.
2. If absent, enable JSON compression for API responses.
3. Add a lightweight `/api/codex/summary` endpoint and use it for the `/codex`
   landing state so landing can render category cards/counts without waiting
   for full entry detail.

Keep category/detail routes on the full endpoint for the first structural
slice unless measurements prove that category routes remain the dominant pain.

## Measurements

Local live API timing could not be captured in this pass because no backend was
listening on `127.0.0.1:8080`, and starting the dev app from the sandbox hit
Maven cache/network access restrictions. Static measurements from
`local-imports/codex/*.json` are still useful because they represent the final
snapshot input shape.

Final snapshot Codex source files:

- Codex files: 22
- Codex entries: 2,588
- Source JSON size across Codex files: 4.1 MB
- Merged all-entry API-shaped payload: about 2.46 MB raw
- Merged all-entry API-shaped payload gzipped: about 195 KB

Largest source contributors:

| Kind | Entries | Raw size | Gzip size |
| --- | ---: | ---: | ---: |
| bonuses | 587 | 1,104 KB | 41 KB |
| quests | 300 | 570 KB | 35 KB |
| abilities | 335 | 486 KB | 24 KB |
| units | 156 | 351 KB | 14 KB |
| equipment | 160 | 290 KB | 22 KB |
| tech | 133 | 248 KB | 21 KB |
| traits | 178 | 210 KB | 19 KB |
| actions | 139 | 168 KB | 9 KB |
| districts | 167 | 149 KB | 8 KB |
| heroes | 79 | 122 KB | 5 KB |

Approximate payload field contribution in the merged entry array:

| Field group | Approx size |
| --- | ---: |
| sections | 721 KB |
| facts | 419 KB |
| descriptionLines | 404 KB |
| scalar identity/category fields | 357 KB |
| publicContextKeys | 204 KB |
| referenceKeys | 135 KB |
| svgIcon | 31 KB |

Interpretation:

- If production is not compressing API JSON, transport is a clear bottleneck:
  2.46 MB is too much for every Codex first visit.
- If production is compressing, network bytes are likely less important than
  the full-data dependency and route-level synchronous work.
- `sections`, `facts`, and description lines are the bulk of the payload. Those
  are useful for detail pages and search, but landing category cards do not
  need them.

## Current Backend Flow

Backend path:

- `api/src/main/java/ewshop/api/controller/CodexController.java`
  - exposes only `GET /api/codex`
  - no category, entry, or summary endpoints currently exist
- `facade/src/main/java/ewshop/facade/impl/CodexFacadeImpl.java`
  - calls `CodexService.getAllCodexEntries()`
  - filters public API entries through `CodexFilterService`
  - resolves duplicate-slug relation aliases
  - maps every entry to `CodexDto`
- `domain/src/main/java/ewshop/domain/service/CodexService.java`
  - `@Cacheable("codex")`
  - loads all entries from `CodexRepository.findAll()`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/CodexRepositoryAdapter.java`
  - uses `codexJpaRepository.findAll()`

Existing backend cache:

- Domain service caches the complete Codex entry list.
- No evidence of HTTP ETag/Last-Modified handling for `/api/codex`.
- No Spring API compression setting was found in app configuration.
- Static frontend shell/assets have cache headers, but API responses are not
  covered by `FrontendCacheHeaderFilter`.

## Current Frontend Flow

Global provider:

- `frontend/src/context/GameDataProvider.tsx`
  - eagerly loads districts, improvements, units, and tech on app mount
  - also eagerly calls `useCodexStore.loadEntries()` on app mount

Codex page:

- `frontend/src/pages/CodexPage.tsx`
  - also calls `loadEntries()` on mount
  - duplicate network calls are guarded by the Codex store inflight promise
  - builds category options from the full entry set
  - builds route-specific archive filter options from filtered entries
  - resolves selected/related entries from global indexes

Codex store:

- `frontend/src/stores/codexStore.ts`
  - fetches `apiClient.getCodex()`
  - normalizes every entry
  - builds:
    - `entriesByKey`
    - `entriesByKind`
    - `entriesByKindKey`

Search:

- `frontend/src/lib/codex/codexSearch.ts`
  - builds per-entry search documents lazily through a `WeakMap`
  - caches search documents per entry object
  - no global search index is eagerly built, which is good
  - first real search still scans all entries and scores/sorts matches

Rich enrichment stores:

- Rich faction, hero, and skill stores are not loaded by `GameDataProvider`.
- `CodexEntryDetail` loads:
  - factions only for Faction/Minor Faction entries
  - heroes and skills only for Hero entries
  - districts only for District entries
  - improvements only for Improvement entries
- This means rich Hero/Faction enrichment is not the main blocker for the
  `/codex` landing page, but it can add a second network phase on direct Hero,
  Faction, District, or Improvement detail routes.

## Bottleneck Diagnosis

Primary bottleneck:

- **Route-independent full Codex hydration.**
  - Landing needs category cards/counts, but waits for all detail sections.
  - Category routes need one category and global metadata, but fetch all kinds.
  - Direct entry routes need one entry plus neighbor/category context, but fetch
    all entries.

Secondary bottlenecks:

- Potentially uncompressed `/api/codex` response.
- Synchronous per-render sorting/filtering in `CodexPage`.
- Full entry detail fields sent to routes that only need summary rows.
- Eager `GameDataProvider` Codex load makes non-Codex routes pay Codex cost too.

Not currently the primary bottleneck:

- Rich hero/skill/faction stores on `/codex` landing. They load only when
  matching detail entries are selected.
- Search-document construction on landing. It is lazy and query-triggered.

## Route-Specific Needs

`/codex` landing:

- Needs visible category list, counts, labels, and data freshness.
- Does not need full `facts`, `sections`, `referenceKeys`, or detail payloads.

`/codex?category=heroes`:

- Needs category entries, category counts/nav, filter options, and row preview
  fields for Heroes.
- Does not need full detail payload for unrelated categories.
- Exact links/tooltips become harder if only Heroes are loaded.

`/codex?category=heroes&entry=Hero_Necrophage_Warrior_1`:

- Needs selected Hero entry, Hero category neighbors/results, exact reference
  resolution, and rich heroes/skills data.
- Can tolerate staged loading if selected entry is fetched first and related
  links enrich after indexes arrive.

Global search:

- Needs all searchable documents.
- Does not necessarily need full detail payload on first paint.
- A lightweight search document endpoint would be cleaner than paginating full
  entries.

## Options Review

### A. Keep Full `/api/codex`, Improve Frontend Memoization

Value:

- Low risk.
- Can reduce repeated sorting/filtering after data is loaded.

Limits:

- Does not reduce first network payload.
- Does not let landing paint before full detail data arrives.

Use when:

- Profiling shows main-thread render/sort/filter is dominant after compression.

### B. Add `/api/codex/summary` For Landing

Value:

- Good first structural improvement.
- Landing can show category cards/counts without full entry detail.
- Keeps existing full endpoint for category/detail/search while reducing the
  most common first Codex impression.

Risks:

- Requires careful route-gated loading in `CodexPage`.
- Must avoid breaking `/codex` search activation: typing a global search should
  trigger full Codex load or a future search-doc load.

Recommendation:

- Best first structural slice after compression verification.

### C. Add `/api/codex?category=heroes`

Value:

- Helps category routes.
- Better fit than pagination for archive browsing.

Risks:

- Exact related links and tooltips often point outside the active category.
- Hidden/direct-link categories and search behavior need careful fallback.
- Requires frontend store state that can merge category slices safely.

Recommendation:

- Worth considering after summary endpoint.
- Do not start here unless category routes remain the measured pain after
  landing is fixed.

### D. Add `/api/codex/{category}/{entryKey}`

Value:

- Helps direct detail routes.
- Allows selected entry to render before category/global context.

Risks:

- Detail pages rely on related entry resolution and category neighbors.
- Needs explicit loading states for unresolved relations.

Recommendation:

- Useful second or third slice, paired with category/search metadata.

### E. Add Backend Pagination

Value:

- Familiar backend pattern.

Risks:

- Poor fit for Codex.
- Breaks global search/reference assumptions unless paired with separate search
  and reference indexes.
- Adds paging UI questions that players do not need.

Recommendation:

- Reject for now.

### F. Add HTTP Compression/Caching

Value:

- Very low product risk.
- If not already compressed in production, reduces `/api/codex` payload from
  about 2.46 MB to about 195 KB.

Risks:

- Does not solve full hydration or render work.
- Need production header verification because a reverse proxy may already
  compress.

Recommendation:

- First tiny transport slice: verify and enable if absent.
- Consider ETag/Last-Modified after import freshness/history can provide a
  stable version token.

### G. Split Search Index Documents From Full Entries

Value:

- Strong long-term architecture for global search.
- Lets search load all lightweight documents without full detail payload.

Risks:

- Larger design and test surface.
- Needs careful search result -> entry detail fetch behavior.

Recommendation:

- Defer until after `/api/codex/summary` and category/detail route measurements.

## Recommended First Implementation Slice

### Slice 1: Transport And Landing Summary

Part 1 - verify or enable compression:

- Check production response headers for `/api/codex`.
- If absent, enable Spring response compression for JSON API responses.
- Add a small backend test or documented curl check for `Content-Encoding` where
  practical.

Part 2 - add summary endpoint:

- Backend:
  - add `GET /api/codex/summary`
  - return public-safe category summaries:
    - `kind`
    - player-facing label if backend owns it, otherwise raw kind/count only
    - `count`
  - omit facts, sections, descriptions, refs, svgIcon
- Frontend:
  - add API client/type for summary
  - use summary on `/codex` landing before full Codex load
  - keep full `loadEntries()` for category, detail, and search-active states
  - ensure global search triggers full data load if not loaded
- Tests:
  - landing renders category cards from summary without full Codex entries
  - category route still loads full Codex and preserves current behavior
  - direct entry route still loads full Codex and resolves exact links
  - search-active `/codex` still loads full data
  - hidden/local-only category visibility still follows frontend config

Why this slice:

- It improves perceived initial `/codex` load without changing entry/detail
  semantics.
- It avoids partial-reference problems.
- It does not require search index redesign.

## Deferred Follow-Ups

Category-scoped fetch:

- Add only after landing summary and compression are measured.
- Requires merged partial store state or separate category cache.

Entry-scoped fetch:

- Useful for direct links, but should come with a relation loading strategy.

Search document endpoint:

- Good long-term shape for fast global search.
- Avoid until first summary/category split proves the new load model.

ETag/Last-Modified:

- Worth considering once import history exposes a stable latest successful
  import token.
- Public freshness API already exists, but no HTTP cache validator is wired to
  Codex responses yet.

Removing Codex load from `GameDataProvider`:

- Likely valuable for non-Codex routes.
- Treat carefully because Quest reward metadata and other cross-route Codex
  links may rely on global store hydration.
- Do this as a separate route-hydration-focused slice with tests.

## What Not To Change Yet

- Do not add pagination.
- Do not lazy-load missing data in a way that silently hides unresolved exact
  links.
- Do not split the Codex store into partial caches without a direct-link and
  search test plan.
- Do not remove global Codex provider loading until all non-Codex consumers are
  audited.
- Do not make rich hero/skill/faction loading eager to compensate for detail
  enrichment; it would slow the landing path.

## Validation Plan

For the recommended implementation:

- Backend:
  - controller/facade tests for `/api/codex/summary`
  - verify public API does not include detail fields
  - verify summary counts follow the same public filter rules as `/api/codex`
- Frontend:
  - `CodexPage` tests for landing summary render
  - category route behavior unchanged
  - direct entry route behavior unchanged
  - search-active behavior unchanged
  - hidden/local-only category visibility unchanged
- Performance:
  - capture `/api/codex` and `/api/codex/summary` response size and timing
  - browser Network waterfall for:
    - `/codex`
    - `/codex?category=heroes`
    - `/codex?category=heroes&entry=Hero_Necrophage_Warrior_1`
  - verify rich `/api/heroes` and `/api/skills` are not requested on `/codex`
    landing

## Open Questions

- Is production currently compressing `/api/codex` through Spring, reverse proxy,
  or CDN? Source configuration does not show Spring API compression, but
  production headers should be checked before making a config change.
- How often do users land on `/codex` versus direct category/detail routes?
- Is slow load mostly network transfer, backend serialization, or frontend main
  thread work in production browsers?
- Should the summary endpoint return backend-owned labels, or should frontend
  continue owning player-facing category labels?

