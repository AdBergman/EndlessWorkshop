# Codex Actions Execution Plan

Target category: Actions  
Status: complete with follow-up recommended, uncommitted  
Started: 2026-06-20

## Current Phase

ACTIONS-UI-001 implemented and validated. Final closeout completed with
route/API smoke; automated pixel-level browser review was unavailable in this
environment.

## Planned Sequence

1. Read required docs.
2. Create durable evolution and execution-plan docs.
3. Audit Actions data, browse model, navigation, rows, detail, relationships,
   and exporter issues.
4. Document findings as frontend action, exporter backlog, or intentionally
   deferred.
5. Run proposal review before code.
6. Select the smallest justified implementation slice.
7. Implement only if the slice is safe and bounded.
8. Validate targeted Codex tests, TypeScript, production build, and diff check.
9. Run product review, using browser smoke if available.
10. Refactor touched code only if the slice creates duplication or stale paths.
11. Update durable docs and exporter backlog when appropriate.
12. Make a final completion decision: complete, complete with follow-up
    recommended, or not complete.

## Stop Conditions

Stop only for:

- validation failure that cannot be safely fixed;
- unclear product decision;
- backend/exporter contract change requirement;
- major architecture change requirement;
- destructive change;
- explicit review checkpoint;
- final closeout.

## Validation Strategy

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
- [x] Durable evolution doc created.
- [x] Durable execution plan created.
- [x] Category classification hypothesis recorded.
- [x] Audit plan recorded.
- [x] Implementation plan recorded.
- [x] Data audit completed.
- [x] Browse audit completed.
- [x] Navigation audit completed.
- [x] Main panel audit completed.
- [x] Detail audit completed.
- [x] Relationship audit completed.
- [x] Exporter audit completed.
- [x] Proposal review completed.
- [x] Implementation slice selected.
- [x] Implementation completed if justified.
- [x] Validation passed.
- [x] Product review completed.
- [x] Refactor review completed.
- [x] Final closeout completed.

## Running Decision Log

- 2026-06-20: Initial hypothesis is Archive, pending data audit.
- 2026-06-20: Durable docs created before implementation. No code changes yet.
- 2026-06-20: Data audit found 139 Actions, 84 without sections, and one
  reliable broad `Category`/`Kind` taxonomy.
- 2026-06-20: Rejected full-width reference overview and rich row redesign for
  the first slice because Actions are too sparse.
- 2026-06-20: Selected ACTIONS-UI-001 - compact Action Type rail using exported
  `Category` facts only.
- 2026-06-20: ACTIONS-UI-001 implemented with `codexActionArchiveFilters`,
  `ActionArchiveRail`, and `actionArchive` category mode.
- 2026-06-20: Validation passed: targeted Codex tests, TypeScript, production
  build, and `git diff --check`.
- 2026-06-20: Route/API smoke passed. Chrome headless exited with code 134, so
  no pixel-level browser review was completed by Codex.
- 2026-06-20: Final decision is Complete with follow-up recommended. Rich row
  and detail redesign should wait for product review and exporter cleanup.

## What Is Next

Report the uncommitted result and recommended commit split.
