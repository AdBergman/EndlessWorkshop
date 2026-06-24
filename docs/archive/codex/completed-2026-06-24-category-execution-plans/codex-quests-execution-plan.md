# Codex Quests Execution Plan

Target category: Quests  
Status: complete with follow-up recommended  
Owner process: `docs/active/codex-category-evolution-playbook.md`

## Progress

Current Phase: Post-closeout polish complete after `QUESTS-UI-003`
Completed: Phase 0 Plan, Phase 1 Audit, Phase 2 Proposal Review, `QUESTS-UI-001`, `QUESTS-UI-002`, validation, product review, stale-code review, closeout, Quest archive grouping investigation, `QUESTS-UI-003`
Next: Commit review  
Open Issues:

- Full browser rendering smoke could not be completed because headless Chrome
  exited with code 134 in this environment.
- Route smoke confirmed `/codex?category=quests` served through Vite with HTTP
  200.
- Do not touch `/quests` unless shared route/link behavior is accidentally
  affected.
- `QUESTS-UI-001` was good but incomplete; `QUESTS-UI-002` finished the safe
  archive browse/row polish pass.
- Quest-step archive grouping remains rejected. Duplicate display titles are not
  safe identity; do not group by title, title plus chapter, or restored
  key-derived progression logic.
- Quests are hidden from top-level Codex navigation because `/quests` owns rich
  quest browsing. If Quests return to top-level Codex, use encyclopedia-style
  Questline entries backed by exporter source-truth metadata. Quest records
  remain searchable and direct-routeable.

## Planned Sequence

1. Phase 0 - Plan.
2. Phase 1 - Data/browse/navigation/main/detail/relationship/exporter audit.
3. Phase 2 - Proposal review.
4. Phase 3 - Implement smallest justified slice.
5. Phase 4 - Product review.
6. Phase 5 - Refactor/stale code cleanup.
7. Phase 6 - Final closeout.

## Completed Slice: QUESTS-UI-002

Goal:

- Keep exported Quest Category grouping.
- Split Major Faction quests into specific major factions only when safely
  supported by exported `Faction` facts or exact resolved references.
- Enrich Quest archive rows with safe exported public content and compact exact
  reference links.
- Remove premature right-side row metadata.
- Preserve detail pages as inspection/permalink pages, not a Quest Explorer.
- Preserve `/quests`.

Checklist:

- [x] Reopen Quest durable docs before implementation.
- [x] Recheck browse/navigation/main/detail/relationship/product phases.
- [x] Add safe specific-major-faction rail support when exact data proves it.
- [x] Keep generic Major Faction fallback for unproven ownership.
- [x] Remove Quest archive right-side metadata.
- [x] Add content-first Quest archive row preview.
- [x] Surface compact exact linked rewards/unlocks/references where available.
- [x] Preserve search + rail filtering and detail-route filter return behavior.
- [x] Update tests.
- [x] Run validation.
- [x] Attempt browser/product smoke.
- [x] Update evolution document and closeout.

## Phase Recheck For QUESTS-UI-002

- Browse audit: needs update. Quest Category is safe, but Major Faction is too
  broad for 227 rows when explicit `Faction` facts/references can prove a
  smaller subset.
- Navigation audit: needs update. Add specific major-faction shelves only for
  exact exported facts/references; keep generic Major Faction for the rest.
- Main panel audit: needs update. Generic rows are not enough for a Quest
  archive; rows should show exported public summary/objective/reward signals
  and compact exact links.
- Detail audit: satisfied with caution. Detail should keep exported structured
  sections and related entries but must not reintroduce branch/path/progression
  UI.
- Relationship audit: needs update. Exact rewards/unlocks/references can be
  surfaced compactly in rows, while richer grouped relationship inspection can
  remain in detail.
- Product review: needs update after row/nav polish. The boundary with
  `/quests` remains accepted.

## Previous Slice: QUESTS-UI-001

Goal:

- Add a Quest Category rail using exported `Category` facts.
- Remove/simplify Codex-only Quest grouping/progression rendering.
- Preserve Codex search/detail/routes.
- Preserve `/quests`.

Checklist:

- [x] Add Quest category filter helpers.
- [x] Add Quest archive rail component.
- [x] Register `questArchive` category mode.
- [x] Wire rail state/filtering in `CodexPage`.
- [x] Stop grouping Quest rows into synthetic quest-node groups.
- [x] Remove Quest progression rendering from Codex detail.
- [x] Update tests.
- [x] Run validation.
- [x] Product review.
- [x] Update evolution document.

## Validation Commands

Run from `frontend/`:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts src/lib/codex/codexPresentation.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
git diff --check
```

Run Quest Explorer tests only if `/quests` or shared Quest Explorer code is
touched.

## Browser Smoke

Attempt:

- `/codex?category=quests`
- `/codex?category=quests` with one Quest Category selected.
- one Codex Quest detail route.
- search-active Codex Quest route.
- `/quests` only if shared Quest code is touched.

If browser automation fails, document the limitation.

Result:

- Vite route smoke passed for `/codex?category=quests`.
- Vite route smoke passed for a selected Quest detail route.
- In-app browser automation could not initialize because the browser bridge
  reported missing sandbox metadata.
- No pixel-level browser review was completed in this environment.

## Stop Conditions

Stop only for:

- validation failure that cannot be safely fixed;
- unclear product decision;
- backend/exporter contract change;
- major architecture change;
- destructive change;
- explicit review checkpoint;
- final closeout complete.

## Exporter Backlog Rules

Use `docs/active/db-exporter-ability-metadata-handoff.md` for non-blocking
exporter/data-quality findings if they become concrete requests.

Do not create new exporter handoff docs. Do not start DB Exporter work from
this frontend category pass.

## Running Decision Log

- 2026-06-20: Classified Quests as existing route-owned Explorer with Codex
  archive support.
- 2026-06-20: Selected Quest Category rail from exported `Category` facts as
  first navigation slice.
- 2026-06-20: Decided to remove Codex-only Quest progression rendering because
  `/quests` owns branch/path/step semantics.
- 2026-06-20: Implemented `QUESTS-UI-001`.
- 2026-06-20: Removed stale Codex-only Quest grouping/progression components,
  helpers, CSS, and tests.
- 2026-06-20: Reopened Quests for `QUESTS-UI-002` after deciding
  `QUESTS-UI-001` left row and navigation polish incomplete.
- 2026-06-20: Implemented `QUESTS-UI-002`: exact major-faction shelves,
  content-first Quest rows, compact exact row links, and no right-side Quest
  metadata.
- 2026-06-20: Closeout decision is complete with follow-up recommended.
- 2026-06-20: Quest archive grouping investigation confirmed repeated display
  titles are not true duplicates. Frontend grouping would require title
  heuristics or key parsing, so grouping is rejected. Later follow-up should be
  Questline encyclopedia metadata, not Codex reconstruction of quest steps.
- 2026-06-20: Implemented `QUESTS-UI-003`: hide Quests from top-level Codex
  navigation while preserving global search, direct `/codex?category=quests`
  routes, selected Quest detail routes, and exact Quest links.
