# Final Snapshot Technical Refactor Review

Status: active technical review for post-adoption cleanup planning  
Created: 2026-06-23

## Executive Summary

The final DB Exporter adoption cycle left EWShop in a releasable technical
posture, assuming the currently uncommitted constructible planning slice is
either committed or deliberately excluded before release. I found no refactor
that should block release by itself.

The codebase is showing predictable pressure from many successful vertical
slices:

- Backend rich import foundations are mostly consistent and testable.
- Frontend Codex detail enrichment is accumulating in generic detail rendering.
- Exact-key resolver logic is repeated across several enrichment helpers.
- `CodexPage.test.tsx` and `CodexPage.css` are now too large to keep scaling
  comfortably.
- Some architecture docs predate the rich Factions/Heroes/Skills work and now
  need a small post-release accuracy pass.

Recommendation: ship after the release-readiness caveats are handled, then take
one focused technical cleanup pass before the next major feature track.

## Backend Findings

### Rich import verticals are consistent enough to keep

The current rich import foundations for Factions, Heroes, Skills, Districts, and
Improvements follow the same broad backend shape:

- domain models under `domain/src/main/java/ewshop/domain/model/`
- import snapshots under `domain/src/main/java/ewshop/domain/command/`
- import/response DTOs under `facade/src/main/java/ewshop/facade/dto/`
- import and response mappers under `facade/src/main/java/ewshop/facade/mapper/`
- repository adapters/entities/mappers under `infrastructure/src/main/java/ewshop/infrastructure/persistence/`
- API controller tests under `api/src/test/java/ewshop/api/controller/`

This is not a place for a broad framework rewrite. The repeated vertical-slice
shape makes contract review easy and matches existing mature imports.

### Constructible planning mapping has local duplication

The uncommitted constructible slice adds the same placement fields to Districts
and Improvements:

- `domain/src/main/java/ewshop/domain/model/ConstructiblePlacementPrerequisites.java`
- `domain/src/main/java/ewshop/domain/model/ConstructibleNeighbourPlacement.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/DistrictEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/ImprovementEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/DistrictRepositoryAdapter.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/ImprovementRepositoryAdapter.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/mappers/DistrictMapper.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/mappers/ImprovementMapper.java`

The duplication is understandable for the first slice because Districts also
have `DistrictLevelUp`. After the constructible slice lands, a small shared
constructible persistence/helper mapper would reduce future drift if more
planning fields are added.

### Startup import behavior is explicit

`app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java` now
imports rich `factions`, `heroes`, and `skills` alongside existing `tech`,
`districts`, `improvements`, `units`, and `quest_explorer`. It also keeps a
diagnostics-only Codex deny-list. This is clear enough for release.

One small cleanup opportunity: keep diagnostics deny-list tests close to each
new final-snapshot diagnostics addition, because diagnostics files are easy to
mistake for public Codex files.

### Migration naming is acceptable

Recent migrations are sequential and readable:

- `V3_4_8__add_codex_svg_icon.sql`
- `V3_4_9__add_rich_factions.sql`
- `V3_5_0__add_rich_heroes_and_skills.sql`
- `V3_5_1__add_constructible_planning_fields.sql`

Do not rename committed migrations. The uncommitted constructible migration
should only be revised if the slice itself changes before commit.

## Frontend Findings

### `CodexEntryDetail` is becoming an enrichment orchestrator

`frontend/src/components/Codex/CodexEntryDetail.tsx` now coordinates:

- Faction package enrichment
- Tech prerequisite enrichment
- Unit evolution enrichment
- Hero profile/skill enrichment
- Constructible planning enrichment
- Status relationship rendering
- Related-entry suppression for already-rendered exact links
- Store loading for factions, heroes, skills, districts, and improvements

At 307 lines it is not huge, but its responsibility is broader than its name:
the component is both a generic detail renderer and a rich-enrichment loader.
This is the highest-value frontend refactor because more enrichment slices will
otherwise keep adding `useStore`, `useEffect`, `useMemo`, and hidden-related-key
logic to the same component.

Preferred cleanup: extract a small `useCodexDetailEnrichments` hook or a
`CodexDetailEnrichmentSections` component that owns store loading, enrichment
construction, and hidden related-entry keys. Keep rendering behavior unchanged.

### Exact-key resolver logic is repeated

The enrichment helpers repeat the same exact-key pattern:

- `frontend/src/lib/codex/codexTechRichEnrichment.ts`
- `frontend/src/lib/codex/codexUnitRichEnrichment.ts`
- `frontend/src/lib/codex/codexHeroRichEnrichment.ts`
- `frontend/src/lib/codex/codexConstructibleRichEnrichment.ts`

Common repeated pieces include key trimming, public Codex entry indexing,
same-entry suppression, duplicate suppression, and exact link resolution. This
logic is safety-critical because EWShop's no-inference rule depends on it.

Preferred cleanup: add a tiny helper for kind-filtered exact Codex entry
resolution. Do not create a generic enrichment framework.

### Store normalization is starting to repeat

`frontend/src/stores/districtStore.ts` and
`frontend/src/stores/improvementStore.ts` now both normalize
`unlockTechnologyKeys` and `placementPrerequisites`. The duplication is small
and acceptable in the current slice. If another constructible/planning field is
added, extract a shared constructible normalization helper.

### `CodexSummaryDetail` remains the biggest component risk

`frontend/src/components/Codex/CodexSummaryDetail.tsx` is 2,573 lines. It
contains many category-specific archive row and detail-adjacent presentation
paths. It has been successful as the category-evolution workbench, but it is now
the most likely place for accidental cross-category regressions.

Do not rewrite it wholesale. Instead, extract only stable, already-proven
category row models when touching that category again.

### CSS is centralized and large

`frontend/src/pages/CodexPage.css` is 3,130 lines. It currently holds base
Codex layout, category rows, detail enrichments, and many final-snapshot classes
such as:

- `.codex-techPrerequisites__*`
- `.codex-unitProfile__*`
- `.codex-heroProfile__*`
- `.codex-constructiblePlanning__*`
- `.codex-factionPackage__*`

This is not a release blocker. Post-release, split only along stable ownership
boundaries, such as detail enrichment sections versus core page layout. Avoid a
large CSS move that changes cascade order without product value.

## Test Coverage Findings

### Page-level Codex tests are too large

`frontend/src/pages/CodexPage.test.tsx` is 9,940 lines. It still provides useful
integration confidence, but it violates the repo guidance to keep frontend test
specs reviewable and split/extract fixtures as they approach roughly 1,000
lines.

This is a maintenance risk, not a release blocker. The next Codex test work
should extract shared fixtures/builders and split final-snapshot behavior into
focused specs by behavior area.

### New constructible fields have focused tests

The uncommitted constructible slice includes API/controller, facade import,
facade mapper, infrastructure mapper, frontend store, Codex page, and helper
tests for planning fields. Examples:

- `api/src/test/java/ewshop/api/controller/DistrictControllerTest.java`
- `api/src/test/java/ewshop/api/controller/ImprovementControllerTest.java`
- `facade/src/test/java/ewshop/facade/mapper/DistrictMapperTest.java`
- `facade/src/test/java/ewshop/facade/mapper/ImprovementMapperTest.java`
- `frontend/src/lib/codex/codexConstructibleRichEnrichment.test.ts`
- `frontend/src/stores/districtStore.test.ts`
- `frontend/src/stores/improvementStore.test.ts`

Before release, make sure this slice is either committed with its tests passing
or excluded. If it is committed, a startup import smoke test remains valuable
because it exercises the final local-import shape end to end.

### Rich import tests are reasonable, but cross-vertical coverage is uneven

Factions, Heroes, and Skills have controller/facade/store tests. They are good
enough for the import foundation already landed. The mature Tech/Unit verticals
still have the stronger historical coverage footprint, so future rich import
foundations should keep matching that direction rather than reducing coverage to
only API-client/store tests.

## Documentation / Process Findings

### Active final-snapshot docs are current

The current source of truth is in:

- `docs/active/final-snapshot-codex-ticket-plan.md`
- `docs/active/final-snapshot-ticket-execution-playbook.md`
- `docs/active/final-snapshot-release-readiness-review.md`
- `docs/current-action-priorities.md`

These are aligned enough for release planning.

### Older rich-import architecture docs now contain stale statements

Some older active architecture docs still describe Heroes/Skills as not imported
or Factions as Codex-only:

- `docs/active/codex-rich-vs-codex-import-architecture-decision.md`
- `docs/active/codex-rich-import-enrichment-audit.md`
- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`

This is expected after the final-snapshot adoption cycle, but it can mislead
future work if read out of order. Do a small post-release doc refresh or add
clear "superseded by final snapshot adoption" notes.

## High-Priority Refactor Tickets

### FS-REF-001 - Extract Codex Detail Enrichment Orchestration

Scope: `frontend/src/components/Codex/CodexEntryDetail.tsx`.

Acceptance:

- Store loading and enrichment construction move out of the generic detail
  component.
- Detail UI and related-entry suppression behavior stay unchanged.
- Tests still cover Tech, Unit, Hero, Faction, Status, and Constructible detail
  behavior.

Priority: high, post-release cleanup.

### FS-REF-002 - Add Shared Exact Codex Entry Resolver Helper

Scope: rich enrichment helpers under `frontend/src/lib/codex/`.

Acceptance:

- Shared helper handles key trimming, kind filtering, same-entry suppression,
  and duplicate suppression.
- Existing no-inference behavior is preserved.
- Tech, Unit, Hero, and Constructible enrichment tests still pass.

Priority: high, post-release cleanup.

### FS-REF-003 - Split `CodexPage.test.tsx`

Scope: `frontend/src/pages/CodexPage.test.tsx`.

Acceptance:

- Extract shared Codex fixtures/builders.
- Split tests by user-facing behavior area, such as category visibility,
  archive rows, detail enrichments, and search/routing.
- No behavior changes.

Priority: high, because the test file is now the main reviewability drag.

### FS-REF-004 - Consolidate Constructible Planning Mapping

Scope: District/Improvement constructible planning mapping after
`FS-CODEX-011` lands.

Acceptance:

- Shared mapping/normalization is introduced only for repeated constructible
  placement code.
- District-specific `levelUp` behavior remains explicit.
- Backend and frontend constructible tests still pass.

Priority: high if more constructible planning fields are added; medium if this
slice remains stable.

### FS-REF-005 - Refresh Superseded Rich-Import Docs

Scope: older active architecture/audit docs that predate Factions/Heroes/Skills
import foundations.

Acceptance:

- Stale "not imported" statements are corrected or marked superseded.
- The final-snapshot ticket plan and release readiness review remain the active
  adoption-cycle source of truth.

Priority: high for process clarity, post-release.

## Medium-Priority Refactor Tickets

### FS-REF-006 - Split Stable Codex CSS Sections

Scope: `frontend/src/pages/CodexPage.css`.

Acceptance:

- Split only stable detail enrichment/category sections from core page layout.
- Preserve cascade order and visual behavior.
- No broad restyling.

Priority: medium.

### FS-REF-007 - Extract Proven Category Row Components Opportunistically

Scope: `frontend/src/components/Codex/CodexSummaryDetail.tsx`.

Acceptance:

- Extract one category row at a time only when it is being touched for product
  work.
- Keep category-specific behavior local and avoid a generic archive framework.

Priority: medium.

### FS-REF-008 - Document Rich Store Naming Conventions

Scope: frontend/backend rich import naming.

Acceptance:

- Document when a store/type should be plain (`heroStore`, `skillStore`) versus
  explicitly rich (`RichFaction`) because of public Codex naming overlap.
- Avoid renaming for consistency alone.

Priority: medium/low.

## Things Not Worth Refactoring

- Do not build a generic archive-row framework. Category-specific rows are still
  appropriate.
- Do not rename committed Flyway migrations.
- Do not move all Codex CSS at once.
- Do not create a public Skills category as a refactor.
- Do not collapse Codex and rich import APIs into a single DTO shape.
- Do not refactor Quest Explorer ownership or route behavior during Codex
  cleanup.
- Do not rewrite `CodexSummaryDetail.tsx` wholesale without a category-specific
  product reason.

## Suggested Sequencing

1. Before release: commit or exclude `FS-CODEX-011`; run focused browser QA from
   the release readiness review.
2. Immediately after release: `FS-REF-001` and `FS-REF-002` together or back to
   back, because they reduce risk for future enrichment work.
3. Then `FS-REF-003`, because the test file size is now slowing review.
4. If constructible planning continues, do `FS-REF-004`.
5. Refresh stale rich-import docs with `FS-REF-005`.
6. Defer CSS/component extraction until the next touched category or detail
   enrichment slice.

## Release Blockers, If Any

No technical refactor in this review should block release.

Release still depends on the caveats already documented in
`docs/active/final-snapshot-release-readiness-review.md`:

- the current constructible planning slice must be committed or excluded;
- Victory Paths and Victory Conditions must remain local/dev-only;
- focused browser QA should cover the listed Codex and Quest Explorer routes.
