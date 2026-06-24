# Codex Heroes Execution Plan

Target category: Heroes  
Internal kind: `heroes`  
Status: complete with follow-up recommended, uncommitted

## Status

Current Phase: Phase 6 - Closeout complete
Completed: Required docs read; durable evolution document created; durable execution plan created; local data audit completed; browse/navigation/main/detail/relationship/exporter audits completed; `HEROES-UI-001` implemented; validation passed; browser DOM smoke completed; product review completed; `HEROES-UI-002` row polish implemented; route screenshot smoke completed; refactor/stale-code review completed; exporter backlog updated.
Next: Commit review.
Open Issues: No blocking Hero issues remain. Future detail profile polish and explicit Hero portrait metadata remain deferred.

## Stop Conditions

Stop only for:

- validation failure that cannot be safely fixed
- unclear product decision
- backend/exporter contract change
- major architecture change
- destructive change
- explicit review checkpoint
- final closeout complete

## Validation Commands

Run from `frontend/` after implementation slices:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
```

Run from repo root:

```bash
git diff --check
```

## Exporter Backlog Rules

- Use `docs/active/db-exporter-ability-metadata-handoff.md` for non-blocking
  exporter/data-quality findings.
- Do not create category-specific exporter handoff docs.
- Do not switch into DB Exporter implementation work.
- Do not infer from keys, names, prose, or SVG filenames while waiting for
  exporter fixes.

## Planned Sequence

1. Phase 0 - Plan.
2. Phase 1 - Audit.
3. Phase 2 - Proposal review.
4. Phase 3 - Implement smallest justified slice.
5. Phase 4 - Product review.
6. Repeat implementation/product review if a small high-value follow-up is
   found.
7. Phase 5 - Refactor/stale-code review.
8. Phase 6 - Final closeout.

## Checklist

- [x] Read playbook/current priorities/frontend guidelines.
- [x] Create durable evolution document.
- [x] Create durable execution plan.
- [x] Complete data audit.
- [x] Complete browse audit.
- [x] Complete navigation audit.
- [x] Complete main panel audit.
- [x] Complete detail audit.
- [x] Complete relationship audit.
- [x] Complete exporter audit.
- [x] Complete proposal review.
- [x] Implement selected slice.
- [x] Validate selected slice.
- [x] Browser/product smoke selected slice.
- [x] Update docs after selected slice.
- [x] Product review after selected slice.
- [x] Complete refactor/stale-code review.
- [x] Validate final state.
- [x] Complete final closeout.
- [x] Reopen follow-up for `HEROES-UI-002`.
- [x] Implement compact Hero stat grid.
- [x] Move resolved granted ability links into compact metadata.
- [x] Replace faction text with exact resolved faction/minor-faction icon when safe.
- [x] Validate `HEROES-UI-002`.
- [x] Browser/product smoke `HEROES-UI-002`.
- [x] Re-run final closeout.

## Running Decision Log

- Phase 0: Created durable docs before implementation as requested. Category
  shape was left open because Heroes may not be an Archive.
- Phase 1: Local 0.82 audit found 79 Heroes, all with `Faction`, `Class`, and
  `Stats`; 19 have `Granted abilities` sections and 18 have resolved ability
  references. No explicit progression/recruitment data or per-Hero icon
  metadata exists.
- Phase 2: Heroes earns Archive classification for the current export. Selected
  `HEROES-UI-001`: Class/Faction rail plus stat-first archive rows with compact
  exact granted ability links.
- Phase 3: Implemented `HEROES-UI-001` with product-specific
  `codexHeroArchiveFilters`, `HeroArchiveRail`, Hero Archive mode wiring,
  stat-first Hero rows, Faction/Class metadata, and compact exact granted
  ability links.
- Phase 4: Initial product review found the slice materially improves browsing.
  No second implementation slice is justified before closeout unless browser
  smoke reveals a concrete issue.
- Phase 5: Refactor review found no stale Hero-specific code. The new helper
  and rail are product-specific and match existing category-mode boundaries.
- Phase 6: Browser DOM smoke rendered `/codex?category=heroes` with rail,
  stat-first rows, metadata, and exact granted ability links. Exporter backlog
  was updated. Completion decision: complete with follow-up recommended.
- Follow-up: Manual review reopened the pass for `HEROES-UI-002` because rows
  need a compact stat grid, less-prominent Flying/granted ability affordances,
  and exact faction identity icons where references resolve safely.
- Phase 3 follow-up: Implemented `HEROES-UI-002`. Hero stat previews now use a
  compact grid, exact granted ability links moved into row metadata, and exact
  faction/minor-faction identity icons render when safely resolvable through an
  exact related entry plus existing icon resolver. Fallback remains exported
  faction text.
- Row polish follow-up: Repeated generic Hero title icons were removed because
  they added no category-specific information. Hero row lessons were recorded
  in the category playbook for future stat-heavy categories such as Units.
- Phase 4 follow-up: Targeted tests and route screenshot smoke confirmed the
  overview/detail routes render. Full interactive browser filter smoke was not
  available without adding a browser automation dependency; class/faction and
  combined filter behavior remains covered by `CodexPage.test.tsx`.
- Phase 6 follow-up: Completion decision remains complete with follow-up
  recommended. No additional high-value Hero row slice is needed before commit.
