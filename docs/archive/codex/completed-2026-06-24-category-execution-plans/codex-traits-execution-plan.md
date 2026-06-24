# Codex Traits Execution Plan

Target category: Traits  
Status: complete for current frontend pass, uncommitted  
Started: 2026-06-20

## Current Phase

TRAITS-UI-003 implemented and validated. Final closeout completed with route/API
smoke; automated pixel-level browser review was unavailable in this environment.

The previous completion decision was overstated. Full-width reference overview
was a good first correction, but 122-178 Trait rows is too many for a single
unfiltered overview, browse support remained open, and no pixel-level visual
review completed because browser automation was unavailable.

## Planned Sequence

1. Read required docs and current code.
2. Create durable evolution and execution-plan docs.
3. Audit Trait data from local Codex export.
4. Classify category and identify browse model.
5. Choose smallest safe UI slice.
6. Implement slice if justified.
7. Validate relevant tests, typecheck, build, and diff check.
8. Run browser smoke after visual/product changes.
9. Update durable docs after every slice.
10. Re-check missed/skipped playbook phases.
11. Implement TRAITS-UI-003 if the plan remains safe.
12. Validate relevant tests, typecheck, build, and diff check.
13. Run browser smoke after visual/product changes.
14. Update durable docs after the slice.
15. Run final category closeout.

## Stop Conditions

Stop only for:

- validation failure that cannot be fixed safely;
- unclear product decision;
- backend/exporter contract change requirement;
- major architecture change requirement;
- destructive change;
- explicit user review checkpoint;
- final closeout completion.

## Validation Commands

From `frontend/`:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
```

From repo root:

```bash
git diff --check
```

## Exporter Backlog Rules

- Active backlog: `docs/active/db-exporter-ability-metadata-handoff.md`.
- Append non-blocking exporter findings when appropriate.
- Do not create a new exporter handoff doc.
- Do not switch into DB Exporter implementation.
- Do not infer from keys, names, prose, or SVG filenames while waiting for
  exporter fixes.

## Current Checklist

- [x] Required docs read.
- [x] Durable docs created.
- [x] Data audit completed from local 0.82 Codex export.
- [x] Browse audit completed.
- [x] Navigation audit drafted.
- [x] Main panel audit drafted.
- [x] Detail audit drafted.
- [x] Relationship audit completed.
- [x] Exporter audit findings identified.
- [x] TRAITS-UI-002 implemented.
- [x] Validation run after implementation.
- [x] Browser smoke review attempted; route/API smoke completed, visual browser
  automation unavailable in this session.
- [x] Exporter backlog checked/updated.
- [x] Previous final category closeout completed, but completion decision was
  reopened after review.
- [x] Reopen planning docs before implementation.
- [x] Re-check playbook phases before implementation.
- [x] Implement TRAITS-UI-003 Trait Type Rail.
- [x] Validate after implementation.
- [x] Browser/product smoke after implementation.
- [x] Update docs after implementation.
- [x] Run final category closeout again.

## Playbook Phase Recheck

| Phase | Status | Notes |
| --- | --- | --- |
| Data audit | already satisfied | Local 0.82 export audit found 178 Traits, 148 Faction and 30 Protectorate; live backend smoke found 122 Traits. |
| Browse audit | satisfied after TRAITS-UI-003 | Audit correctly identified Faction vs Protectorate as the supported broad browse question; the rail now exposes it. |
| Navigation audit | satisfied after TRAITS-UI-003 | Type rail is implemented with `All`, `Faction`, `Protectorate`. Secondary categories remain deferred. |
| Main panel audit | already satisfied | Existing shallow reference rows are good content-first rows; preserve them. |
| Detail audit | intentionally deferred | Trait details are generic but not blocking this slice; revisit after overview/rail is visually reviewed. |
| Relationship audit | already satisfied | Exact outbound/inbound relationships were counted; no inference allowed. |
| Exporter audit | already satisfied | Non-blocking findings were appended to the active exporter backlog. |
| Premium review | satisfied with caveat | Route/API smoke passed and product review was updated. Pixel-level browser automation remained unavailable, so manual visual review is still recommended. |
| Final category closeout | complete | Re-run after TRAITS-UI-003 validation and route/API smoke. |

## TRAITS-UI-003 Implementation Checklist

- [x] Add a Trait-specific filter helper using exported category/type facts only.
- [x] Add a compact Trait Archive rail with `All`, `Faction`, and `Protectorate`.
- [x] Do not rename `Protectorate` to `Minor Faction` yet.
- [x] Do not add secondary category filters.
- [x] Preserve shallow reference row rendering.
- [x] Keep selected Trait detail routes split/detail.
- [x] Keep search-active Traits behavior sane.
- [x] Add tests for rail display, counts, filtering, clear/toggle behavior, and selected detail route behavior.
- [x] Update docs after implementation.

## Running Decision Log

- 2026-06-20: Traits data has 178 entries: 148 `Faction`, 30
  `Protectorate`.
- 2026-06-20: No thin Trait entries found in local 0.82 export.
- 2026-06-20: Traits have useful shallow content: Effects, Unlocks,
  Exclusions, Granted abilities, and exact Minor Faction links.
- 2026-06-20: Major faction ownership is not explicit enough for UI markers;
  do not infer it.
- 2026-06-20: Initial classification is Archive/Reference hybrid rather than
  generic split list.
- 2026-06-20: Generic left result list is likely the weakest current surface.
- 2026-06-20: TRAITS-UI-002 initially added `traits` to the explicit full-width
  reference overview allow-list. This was later superseded by TRAITS-UI-003
  because Traits still needed browse orientation.
- 2026-06-20: Non-blocking Trait exporter findings appended to
  `docs/active/db-exporter-ability-metadata-handoff.md`.
- 2026-06-20: Validation passed: targeted Codex tests, TypeScript, production
  build, and `git diff --check`.
- 2026-06-20: Browser automation was limited: in-app browser failed with a
  sandbox metadata error and headless Chrome exited with code 134. Route/API
  smoke succeeded against local Vite/backend.
- 2026-06-20: Initial final closeout completed, then reopened after product
  review found the full-width-only decision overstated.
- 2026-06-20: Reopened Traits after review. Completion was overstated because
  browse support remained unresolved and no pixel-level visual review completed.
- 2026-06-20: TRAITS-UI-003 selected as the next slice: a compact Type rail
  using exported `Category` facts only.
- 2026-06-20: TRAITS-UI-003 implemented with `codexTraitArchiveFilters`,
  `TraitArchiveRail`, and `traitArchive` category mode. The rail uses `All`,
  `Faction`, and `Protectorate`; secondary categories remain deferred.
- 2026-06-20: Validation passed after TRAITS-UI-003: targeted Codex tests,
  TypeScript, production build, and `git diff --check`.
- 2026-06-20: Route/API smoke passed against local Vite/backend. In-app browser
  control failed with a sandbox metadata error; Chrome headless exited with code
  134, so no pixel-level browser review was completed by Codex.
- 2026-06-20: Final closeout completed again. Traits are complete for the
  current frontend pass, pending manual visual review.

## What Is Next

Report the uncommitted result and recommended commit split.
