# Backend Vertical Slice Review

Date: 2026-06-07

Status: active backend improvement backlog

## Summary

This review uses the same panel model as the unit vertical-slice review:

- Java/Spring Boot Tech Lead A: architecture and layering
- Java/Spring Boot Tech Lead B: maintainability and code-review usefulness
- Java/Spring Boot Tech Lead C: AI-agent usability
- Senior Backend Engineer: practical ownership, duplication, and stale-risk
- Spring Boot Advocate: framework correctness and modern project hygiene

Scope: backend vertical slices except SEO. SEO is reviewed separately in
`docs/backend/seo-backend-review.md`.

Consensus: the backend architecture is in good shape. The pragmatic hexagonal
shape is visible across the application: thin API controllers, facades for use
case orchestration and DTO mapping, domain services for policy, repositories as
domain ports, and infrastructure adapters for JPA mechanics. The biggest
opportunities are uniformity, destructive-import guardrails, targeted tests,
and reducing repeated import-admin boilerplate without creating a generic
framework.

## How To Use This Backlog

- Treat tickets as implementation slices, not one giant refactor.
- Prefer one vertical slice per commit unless a shared helper is already proven.
- Run focused tests for the touched slice, then `./mvnw -B test`.
- Run frontend checks only when public API response shape or error contract changes.
- Do not change exporter handoff contracts unless explicitly coordinated.

Recommended wave order:

1. Import safety and admin error consistency.
2. Read API contract guardrails.
3. Persistence adapter cleanup and repeated upsert patterns.
4. Quest Explorer hardening.
5. Nice-to-have maintainability cleanup.

## Implementation Status

Updated: 2026-06-07

- `BE-VS-002`: done. Admin import endpoints now have structured bad-request JSON tests for tech, units, districts, improvements, codex, and quest explorer.
- `BE-VS-003`: done. `ImportAdminSupport` remains package-private and intentionally small.
- `BE-VS-004`: done for tech, units, districts, improvements, and codex diagnostics; quest explorer diagnostics remain covered separately by quest-specific tickets.
- `BE-VS-020`: done. Tech import now has a facade -> DB -> public DTO guardrail, including unlocks, descriptions, factions, coords, prereq, and exclusion links.
- `BE-VS-030`: done. `/api/units` has a controller contract test for Mangrove of Harmony as an imported minor faction.
- `BE-VS-040`: done. District import has a facade -> DB -> public DTO guardrail, including obsolete-row deletion.
- `BE-VS-041`: done. District all-invalid rows return a failed summary and do not write/delete; this is intentionally less strict than tech/unit because there is no release filter that can turn valid input into zero public rows.
- `BE-VS-042`: done. District warning codes are pinned by facade diagnostics tests.
- `BE-VS-050`: done. Improvement import has a facade -> DB -> public DTO guardrail, including obsolete-row deletion.
- `BE-VS-051`: done. Improvement import validation now uses `constructibleKey` wording.
- `BE-VS-052`: done. Improvement duplicate-key behavior is pinned at facade and API error boundaries.
- `BE-VS-060`: done. Codex import has a facade -> DB -> public DTO guardrail proving one `exportKind` import does not delete another kind.
- `BE-VS-090`: done for current read controllers. Controller JSON contract tests cover tech, units, districts, improvements, codex, quest explorer, and saved builds.
- `BE-VS-091`: done. Backend style guidance now states facade response DTOs are the backend/frontend contract.
- `BE-VS-092`: done as review/documentation. Import/admin writes evict matching read caches; import facades warm tech, units, districts, improvements, and codex caches. Quest explorer import evicts `questExplorer`. Saved builds are immutable by UUID and have no public list cache; missing UUID cache behavior remains tracked separately by `BE-VS-083`.
- `BE-VS-001`: done. Import controllers now delegate import-file validation to facades; API error advice still returns structured `400`.
- `BE-VS-010`: pragmatic skip. `LocalStartupImportRunner` is large but currently well covered; splitting file discovery now would be mechanical churn without behavior pressure.
- `BE-VS-011`: done. Existing startup tests cover supported exports, generic codex `entries[]`, unsupported files, malformed supported-looking files, diagnostics skips, and missing folders.
- `BE-VS-012`: done. Startup tests cover one and multiple quest explorer files; zero files is covered by missing/empty folder behavior.
- `BE-VS-013`: done. `LocalStartupImportSummary` now returns imported/skipped/failed counts from `runStartupImport`.
- `BE-VS-021`: done. Tech import now persists prereq/exclusion links and tests clearing relationships before deleting obsolete techs.
- `BE-VS-022`: done by existing unit-style import rejection coverage and tech import service guard; all-hidden/no-available-faction writes are rejected as `IMPORT_REJECTED`.
- `BE-VS-023`: pragmatic skip. `TechRepositoryAdapter` gained a focused relationship helper; broader extraction is deferred until more adapter behavior changes are needed.
- `BE-VS-024`: already covered by `TechAdminFacadeTest`; placement updates preserve import-owned fields.
- `BE-VS-031`: done. `UnitRepositoryAdapterIT` covers empty/no-keep-key inputs not deleting existing units and `artId` preservation on re-import.
- `BE-VS-032`: done. Unit duplicate-key structured API error is pinned.
- `BE-VS-033`: done as review. Current key-based evolution shape matches frontend tree needs; no backend consistency diagnostics added until broken-chain data appears in imports.
- `BE-VS-061`: done. Codex filter reason names and totals are pinned.
- `BE-VS-062`: pragmatic skip. `CodexFilterService` remains cohesive; extraction would be line-count churn while tests are readable.
- `BE-VS-063`: pragmatic skip/update. Public codex API intentionally keeps duplicate-slug entries and preserves key-based references; alias rewrite is not current frontend contract.
- `BE-VS-064`: done. Codex import metadata warning now uses `MISSING_EXPORTER_VERSION` like the other import families.
- `BE-VS-070`: done by `QuestControllerTest`, which pins top-level metadata, entries, navigation, progression fields, and null omission.
- `BE-VS-071`: done by `QuestExplorerRepositoryAdapterIT`, which roundtrips nested quest explorer import data through JPA and the domain read model.
- `BE-VS-072`: done by service/repository guards and existing invalid-entry facade coverage; empty snapshots do not delete, and empty keep keys are refused.
- `BE-VS-073`: pragmatic skip. Do not split `QuestExplorerImportMapper` until a behavior change needs it; current tests protect import mapping.
- `BE-VS-074`: done as review. Enrichment stays in domain read/projection services because it is semantic quest/faction meaning, not DTO formatting.
- `BE-VS-075`: done by existing progression projector golden tests for grouping, variants, links, numeric collapse, tutorial placement, missing positions, and diagnostics.
- `BE-VS-076`: pragmatic skip. Projector split is deferred; broad extraction would be high-risk churn without new behavior.
- `BE-VS-077`: pragmatic skip. Diagnostic reporter output is deterministic and tested; split only if report formats expand.
- `BE-VS-078`: pragmatic skip/review. Nested Quest Explorer JPA model stays together for now; ordering/cascade behavior is covered by repository roundtrip tests.
- `BE-VS-080`: done. Saved build requests validate request presence, selected faction, `techIds`, null entries, and max list size.
- `BE-VS-081`: done. Saved build tech IDs are trimmed, blank IDs dropped, order preserved, and duplicates intentionally preserved.
- `BE-VS-082`: done. Saved build payload list size and per-tech-id length are guarded.
- `BE-VS-083`: done. GET cache now caches only successful `200` responses; POST/GET roundtrip and missing UUID behavior are tested.
- `BE-VS-084`: done. Saved build integration tests verify tech ID ordering through DB roundtrip.
- `BE-VS-100`: done as decision. Keep local adapter helpers/tests over a generic upsert/delete framework.
- `BE-VS-101`: done through vertical-slice and adapter tests covering tech, unit, saved-build, codex, district, improvement, and quest ordered collections.
- `BE-VS-102`: done through adapter/import tests for tech, unit, district, improvement, codex, and quest full-snapshot safety.
- `BE-VS-103`: pragmatic skip. Production migrations are historical schema evidence and should not be churned in this cleanup batch.
- `BE-VS-110`: done as strategy. API bad requests use structured JSON; global exception handling remains plain fallback for resources/status/500 to avoid browser/SEO drift.
- `BE-VS-111`: done by `AdminTokenFilterAdminEndpointsTest` covering import, tech admin, and SEO admin endpoint families for missing, invalid, disabled, and valid tokens.
- `BE-VS-112`: done. Backend style guidance documents unknown exporter tolerance and validation ownership.
- `BE-VS-113`: done by existing Spring Boot 4 post-deploy checklist doc; keep it as the canonical runtime smoke checklist.

Wave 1 verification:

- `./mvnw -B -pl api,facade -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='ImportAdminControllerTest,CodexControllerTest,UnitControllerTest,DistrictImportAdminFacadeImplTest,ImprovementImportAdminFacadeImplTest,TechImportAdminFacadeTest,DistrictFacadeTest,ImprovementFacadeTest,CodexFacadeIntegrationTest' test`
- `./mvnw -B -pl api -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=ImportAdminControllerTest test`
- `./mvnw -B -pl api,facade -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='SavedTechBuildControllerTest,SavedTechBuildFacadeTest,TechImportAdminFacadeTest' test`
- `./mvnw -B -pl api,infrastructure,facade -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='ImportAdminControllerTest,UnitRepositoryAdapterIT,SavedTechBuildControllerTest,SavedTechBuildFacadeTest' test`
- `./mvnw -B -pl facade -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='CodexFacadeImplTest,CodexImportAdminFacadeImplTest,CodexFacadeIntegrationTest' test`
- `./mvnw -B -pl app -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=LocalStartupImportRunnerTest test`

## Cross-Cutting Findings

- Controllers are appropriately thin.
- Facades mostly orchestrate; import facades also build diagnostics and warnings.
- Domain services are generally small and policy-focused.
- Infrastructure adapters are where most persistence complexity lives, which is
  correct, but upsert/delete mechanics are repeated.
- Full-snapshot imports are powerful and need consistent safety behavior.
- Import DTOs are now intentionally limited to useful fields; keep that policy.
- `ApiExceptionHandler` now uses structured bad-request JSON for import errors.
- `ImportAdminSupport` is a good small helper; avoid expanding it into a broad
  import framework.

## Admin Import Shell

Reviewed flow: `ImportAdminController` -> import admin facade -> mapper -> domain
import service -> repository adapter.

Panel verdict: healthy but still repetitive. The controller performs null/empty
checks that facades also perform. This is not dangerous, but it can create
message drift. The new structured `ApiErrorDto` is a good direction.

### Jira Tickets

**BE-VS-001: Standardize Import Empty-File Validation Ownership**

- Move final empty-file validation ownership to import facades.
- Keep controller checks only if they add HTTP-specific value.
- Preserve current status codes and messages unless tests are updated.
- Acceptance: import controller tests prove empty arrays return structured `400`.

**BE-VS-002: Add Import Error Contract Tests For Every Admin Import Endpoint**

- Cover wrong `exportKind`, empty rows, duplicate keys, and all-invalid rows where applicable.
- Verify `code`, `message`, and `path` in `ApiErrorDto`.
- Acceptance: tech, units, districts, improvements, codex, and quest explorer all have bad-request JSON tests.

**BE-VS-003: Keep ImportAdminSupport Small And Document Its Boundary**

- Keep only generic checks that do not know any import domain.
- Do not add mapping, result building, or persistence policy to it.
- Acceptance: helper remains package-private and under roughly 100 lines.

**BE-VS-004: Create Import Diagnostics Snapshot Tests**

- Add tests that pin `ImportSummaryDto` counts, diagnostics, and warnings.
- Cover at least tech, units, districts, improvements, and codex.
- Acceptance: future changes cannot silently rename warning codes or count semantics.

## Local Startup Import

Reviewed flow: local file discovery -> JSON kind classification -> admin import
facade dispatch -> logging.

Panel verdict: useful and well guarded by profile/property, but
`LocalStartupImportRunner` is a large orchestration class. It mixes file
discovery, classification, dispatch, quest explorer special handling, and log
formatting.

### Jira Tickets

**BE-VS-010: Split Local Startup Import File Discovery From Dispatch**

- Extract file listing and folder classification into a small collaborator.
- Keep behavior and logs equivalent.
- Acceptance: existing `LocalStartupImportRunnerTest` passes unchanged or with only setup renames.

**BE-VS-011: Add Local Startup Import Dispatch Matrix Tests**

- Cover supported `exports` kinds, generic codex `entries[]`, unsupported files, malformed JSON, and missing `exportKind`.
- Acceptance: dispatch behavior is pinned without needing real DB writes.

**BE-VS-012: Preserve Quest Explorer Single-File Startup Import Rule**

- Keep the current exactly-one quest explorer file rule.
- Add explicit tests for zero, one, and multiple quest explorer files.
- Acceptance: multiple files fail as controlled startup import failure, not partial import.

**BE-VS-013: Add Startup Import Summary Object**

- Return an internal summary object from `runStartupImport` logic.
- Keep public behavior as logs only.
- Acceptance: tests assert imported/skipped/failed counts without parsing logs.

## Tech Import And Read API

Reviewed flows:

- Import: `/api/admin/import/techs` -> `TechImportAdminFacadeImpl` -> `TechImportMapper` -> `TechImportService` -> `TechRepositoryAdapter`.
- Read: `/api/techs` -> `TechFacadeImpl` -> `TechService` -> repository -> `TechDto`.
- Admin placement: `TechAdminController` -> `TechAdminFacadeImpl` -> `TechService`.

Panel verdict: strong policy ownership. `TechImportService` has the right
destructive-import guard and release-safety gating. `TechRepositoryAdapter` is
one of the larger non-Quest persistence adapters and has delicate relationship
cleanup before deleting obsolete techs.

### Jira Tickets

**BE-VS-020: Add Tech Import Full-Slice DB-To-API Guardrail**

- Import representative tech payload through admin facade.
- Read through `TechFacade` or `/api/techs`.
- Assert era, type, factions, description lines, unlocks, and relationships.
- Acceptance: frontend-relevant `TechDto` shape remains stable.

**BE-VS-021: Pin Tech Delete Relationship Cleanup**

- Add infrastructure test for obsolete tech deletion clearing prereq/exclusion refs.
- Acceptance: deleting obsolete techs does not leave FK or dangling relation failures.

**BE-VS-022: Add Tech Import Zero-Public-Tech Bad-Request API Test**

- Verify all-hidden/no-available-faction import returns structured `400`.
- Acceptance: response uses `IMPORT_REJECTED` and does not write/delete.

**BE-VS-023: Review TechRepositoryAdapter For Behavior-Based Extraction**

- Consider extracting upsert outcome application into a private nested updater or package-private helper.
- Do not change persistence behavior.
- Acceptance: adapter is easier to scan and tests still pass.

**BE-VS-024: Add Tech Admin Placement Contract Tests**

- Verify placement update only changes era/coords and preserves imported fields.
- Acceptance: admin placement cannot accidentally rewrite import-owned data.

## Unit Import And Read API

Reviewed flow: unit import JSON -> facade import admin -> domain import policy
-> infrastructure upsert/delete -> DB -> `/api/units`.

Panel verdict: recently hardened. Unit import policy is now domain-owned,
destructive all-filtered imports are refused, and DB-to-API ordering/artId
guardrails exist.

### Jira Tickets

**BE-VS-030: Add Unit API Controller Contract Test For Imported Minor Faction**

- Assert `/api/units` returns Mangrove of Harmony display name and minor flag.
- Acceptance: controller-level JSON contract covers the same behavior as facade integration.

**BE-VS-031: Add Unit Repository Adapter Import Safety Test**

- Verify repository adapter refuses empty keep keys and preserves `artId`.
- Acceptance: persistence safety is tested independently of facade.

**BE-VS-032: Add Unit Import Duplicate-Key API Error Test**

- Verify duplicate `unitKey` returns structured `400`.
- Acceptance: duplicate key behavior is pinned at admin API boundary.

**BE-VS-033: Review Unit Evolution Data Shape With Frontend Expectations**

- Confirm imported `previousUnitKey`, `nextEvolutionUnitKeys`, and `evolutionTierIndex` support current `/units` tree behavior.
- Acceptance: document whether backend should add any consistency diagnostics for broken evolution chains.

## District Import And Read API

Reviewed flow: district import JSON -> facade -> mapper -> domain service ->
repository adapter -> `/api/districts`.

Panel verdict: good baseline. This is the simplest import/read slice and should
remain boring. Domain service is tiny because there is little domain policy.

### Jira Tickets

**BE-VS-040: Add District Import DB-To-API Guardrail**

- Import districts through facade and read through `DistrictFacade`.
- Assert key, display name, category, description line ordering, and deletion of obsolete rows.
- Acceptance: district public JSON is pinned.

**BE-VS-041: Add District Zero-Valid-Rows Safety Decision**

- Decide whether all rows failing mapper should return summary or reject import.
- Match tech/unit style only if deletion risk exists.
- Acceptance: documented and tested behavior.

**BE-VS-042: Review District Import Warning Codes**

- Pin warning code names for empty category, empty descriptions, and missing exporter metadata.
- Acceptance: codes are covered by tests and safe for admin UI/tooling.

## Improvement Import And Read API

Reviewed flow: improvement import JSON -> facade -> mapper -> domain service ->
repository adapter -> `/api/improvements`.

Panel verdict: mirrors district well. It is a good candidate for shared tests or
fixture style, not shared business abstraction.

### Jira Tickets

**BE-VS-050: Add Improvement Import DB-To-API Guardrail**

- Import improvements through facade and read through `ImprovementFacade`.
- Assert constructible key, display name, category, description ordering, and obsolete deletion.
- Acceptance: improvement public JSON is pinned.

**BE-VS-051: Align Improvement Mapper Naming With DTO Field**

- The error message says `improvementKey` while DTO uses `constructibleKey`.
- Prefer consistent wording unless frontend/admin tooling depends on the old message.
- Acceptance: tests cover the chosen message.

**BE-VS-052: Add Improvement Duplicate-Key API Error Test**

- Verify duplicate `constructibleKey` returns structured `400`.
- Acceptance: bad import behavior matches district/unit/tech style.

## Codex Import, Filter, And Read API

Reviewed flows:

- Import: generic codex `entries[]` import by `exportKind`.
- Read: `/api/codex` -> facade filtering -> duplicate relation alias resolution.
- Domain: `CodexFilterService` owns public filtering and duplicate slug rules.

Panel verdict: useful and pragmatic, but filter behavior is complex enough to
be treated as product policy. `CodexFilterService` is large but cohesive. The
main risk is silent drift in filtering reasons and duplicate alias behavior.

### Jira Tickets

**BE-VS-060: Add Codex Import DB-To-API Guardrail**

- Import at least two export kinds.
- Verify only the imported kind deletes obsolete rows for that kind.
- Read via `CodexFacade`.
- Acceptance: generic `exportKind` contract remains stable.

**BE-VS-061: Pin Codex Filter Reason Contract**

- Add tests for invalid display names, weak descriptions, duplicate slug, and filtered-out totals.
- Acceptance: filter reason names are stable for SEO/admin diagnostics.

**BE-VS-062: Split CodexFilterService Internals Only If Tests Become Hard**

- Consider extracting slug/display-name normalization and skip recording.
- Do not split by line count alone.
- Acceptance: behavior remains identical and tests are clearer.

**BE-VS-063: Add Codex Duplicate Relation Alias Integration Test**

- Cover duplicate slug row skipped/aliased and references rewritten to canonical entry.
- Acceptance: related-entry frontend behavior is protected.

**BE-VS-064: Align Codex Import Metadata Warning Names**

- Codex uses `MISSING_SOURCE_VERSION` while other imports use `MISSING_EXPORTER_VERSION`.
- Decide whether codex intentionally differs.
- Acceptance: documented or renamed with tests.

## Quest Explorer Import And Read API

Reviewed flows:

- Import: quest explorer v3 JSON -> `QuestExplorerImportMapper` -> import service -> nested JPA graph.
- Read: repository -> domain model -> display-name enrichment -> progression projector -> DTO.

Panel verdict: architecture direction is right, but this is the largest and
riskiest non-SEO slice. The mapper, read service, persistence mapper/entity,
progression projector, and diagnostics reporter all deserve targeted review.
Do not broad-refactor without guardrail tests.

### Jira Tickets

**BE-VS-070: Add Quest Explorer API Contract Snapshot Test**

- Pin top-level metadata, entry ordering, navigation fields, branches, objectives, requirements, rewards, and progression summary.
- Acceptance: `/api/quests/explorer` JSON cannot drift silently.

**BE-VS-071: Add Quest Explorer Import DB-To-API Roundtrip Test**

- Import a small graph with branch, continuation, convergence, requirement, and reward.
- Read through `QuestExplorerFacade`.
- Acceptance: imported nested data roundtrips through JPA and DTO mapping.

**BE-VS-072: Add Quest Explorer Destructive Import Safety Test**

- Verify empty keep keys and all-invalid imports do not delete existing quest explorer rows.
- Acceptance: behavior is consistent with other full-snapshot imports.

**BE-VS-073: Split QuestExplorerImportMapper By Nested Concern**

- Extract only after tests exist.
- Candidate slices: metadata, navigation/link validation, lore, strategy/objectives, branch mapping.
- Acceptance: no behavior change and mapper responsibilities are easier to review.

**BE-VS-074: Review QuestExplorerReadService Enrichment Ownership**

- Decide whether faction/questline display-name enrichment belongs in domain read service or facade mapper.
- Recommendation: keep as domain read enrichment if it is semantic, not DTO formatting.
- Acceptance: decision documented and tested.

**BE-VS-075: Add Progression Projector Golden Tests**

- Cover true choice, mandatory continuation, setup rows, topology forks, variants, convergence, unresolved continuations.
- Acceptance: tests mirror canonical semantics doc.

**BE-VS-076: Split QuestExplorerProgressionProjector Behind Golden Tests**

- Extract named policies/steps only after BE-VS-075.
- Avoid mechanical line-count split.
- Acceptance: projector behavior remains identical and reviewability improves.

**BE-VS-077: Split QuestExplorerProgressionDiagnosticReporter**

- Separate data collection from markdown/json/report rendering if current tests become brittle.
- Acceptance: diagnostics output remains stable.

**BE-VS-078: Review QuestExplorerEntryEntity Nested JPA Model**

- Evaluate whether nested entity classes should stay together or be split by aggregate section.
- Do not change DB schema unless clearly needed.
- Acceptance: recommendation plus tests for ordering and cascade behavior.

## Saved Tech Builds

Reviewed flow: `/api/builds` POST/GET -> facade -> domain service -> repository
adapter -> DB.

Panel verdict: compact and effective. The main gap is validation. The system
accepts very permissive payloads, which is convenient but may store bad share
data.

### Jira Tickets

**BE-VS-080: Add Saved Build Request Validation**

- Validate request presence, faction presence, tech IDs not null, and max list size.
- Decide whether empty tech list is allowed.
- Acceptance: bad requests return structured `400`.

**BE-VS-081: Normalize Saved Build Tech IDs**

- Trim, drop blanks, preserve order, and optionally de-duplicate.
- Acceptance: tests pin chosen behavior.

**BE-VS-082: Add Saved Build Payload Size Guard**

- Protect DB and API from very large copy-link payloads.
- Acceptance: over-limit request returns structured `400`.

**BE-VS-083: Review Saved Build GET Cache Semantics**

- Confirm caching not-found responses is avoided and saved builds can be fetched immediately after POST.
- Acceptance: tests cover POST/GET roundtrip and missing UUID behavior.

**BE-VS-084: Add Saved Build DB Contract Test For Tech ID Ordering**

- Verify persisted element collection preserves selected tech order.
- Acceptance: share links roundtrip exactly for UI selection.

## Public Read APIs

Reviewed public read endpoints: `/api/techs`, `/api/units`,
`/api/districts`, `/api/improvements`, `/api/codex`, `/api/quests/explorer`,
`/api/builds/{uuid}`.

Panel verdict: read controllers are thin and consistent. Contract tests should
be broadened to prevent frontend surprises.

### Jira Tickets

**BE-VS-090: Add Public API JSON Contract Tests For All Read Endpoints**

- Pin field names, null behavior, ordering where relevant, and nested arrays.
- Acceptance: controller tests cover every public read endpoint.

**BE-VS-091: Document Public API DTO Ownership**

- State that facade response DTOs are the backend/frontend contract.
- Acceptance: backend style guide or architecture doc updated briefly.

**BE-VS-092: Review Read Cache Eviction Consistency**

- Verify every import/admin write evicts or warms the matching public read cache.
- Acceptance: tech, units, districts, improvements, codex, quest explorer, saved builds documented/tested.

## Persistence And Flyway

Reviewed adapters, entities, and migrations at a high level.

Panel verdict: persistence follows the ports/adapters shape. Upsert/delete
logic is repeated but understandable. The most important thing is consistent
full-snapshot safety and ordering tests for element collections.

### Jira Tickets

**BE-VS-100: Add Shared Upsert/Delete Pattern Review**

- Compare tech, unit, district, improvement, codex, and quest explorer adapters.
- Decide whether a tiny internal helper is worth it.
- Recommendation: prefer tests and local private helpers over generic repository framework.
- Acceptance: written decision and one optional pilot refactor.

**BE-VS-101: Add Element Collection Ordering Tests**

- Cover tech unlocks/description lines, unit abilities/evolutions/descriptions, saved-build tech IDs, codex references, district/improvement lines.
- Acceptance: ordering is protected through DB roundtrip.

**BE-VS-102: Add Full-Snapshot Delete Safety Tests Per Adapter**

- Verify empty keep keys do not delete all rows.
- Acceptance: every full-snapshot adapter has a safety test.

**BE-VS-103: Review Old Seed/Migration Artifacts**

- Identify legacy unit/tech seed migrations no longer representative of current importer-driven data.
- Do not delete production migrations.
- Acceptance: docs note which migrations are historical versus active schema.

## API Security And Runtime Config

Reviewed `AdminTokenFilter`, filter registration, Jackson config, global
exception handling, and OpenAPI/prod behavior at a high level.

Panel verdict: admin endpoints fail closed, Jackson 3 unknown-field tolerance is
explicit, and prod Swagger behavior was already hardened. Error handling now has
two paths: API import advice and global app advice.

### Jira Tickets

**BE-VS-110: Align ApiExceptionHandler And GlobalExceptionHandler Strategy**

- Decide whether structured JSON should be API-wide or admin-import-only.
- Avoid changing browser fallback/SEO responses accidentally.
- Acceptance: tests prove stale API routes remain 404 and import bad requests remain JSON.

**BE-VS-111: Add Admin Token Filter Contract Tests For All Admin Prefixes**

- Cover `/api/admin/import/**` and `/api/admin/seo/**`.
- Acceptance: missing token, invalid token, disabled token, and valid token cases pass.

**BE-VS-112: Document Jackson Unknown-Field Policy**

- State that importer DTOs tolerate unknown exporter fields via global Jackson config.
- Acceptance: style/architecture docs mention policy without adding annotations.

**BE-VS-113: Add Runtime Smoke Checklist To Backend Docs**

- Keep health, core reads, saved build POST/GET, import smoke, Swagger disabled in prod.
- Acceptance: one canonical backend smoke checklist exists.

## Panel Conclusion

The backend should not be rewritten. The pragmatic hexagonal style is already
working. The best next move is to build confidence and uniformity through
vertical-slice tests, small helpers, and explicit policy ownership. Quest
Explorer needs its own hardening wave. SEO should stay separate until it has
been reviewed and reshaped behind tests.
