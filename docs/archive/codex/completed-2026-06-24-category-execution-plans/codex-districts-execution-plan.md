# Codex Districts Execution Plan

Target category: Districts  
Internal kind: `districts`  
Status: closeout complete, uncommitted

## Status

Current Phase: Phase 6 - Closeout  
Completed: Phase 0 planning; Phase 1 audit; Phase 2 proposal review; Phase 3 implementation of `DISTRICTS-UI-001`; validation; browser DOM smoke; product review; refactor/stale-code review; exporter backlog update.  
Next: Final report and user review.  
Open Issues: Full pixel-level browser QA was not completed; future Tier/progression relationship work remains deferred.

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

- Use `docs/active/db-exporter-ability-metadata-handoff.md` for non-blocking exporter/data-quality findings.
- Do not create category-specific exporter handoff docs.
- Do not switch into DB Exporter implementation work.
- Do not infer from keys, names, prose, or SVG filenames while waiting for exporter fixes.

## Planned Sequence

1. Phase 0 - Plan.
2. Phase 1 - Audit.
3. Phase 2 - Proposal review.
4. Phase 3 - Implement smallest justified slice.
5. Phase 4 - Product review.
6. Repeat implementation/product review if a small high-value follow-up is found.
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

## Running Decision Log

- Phase 0: Districts start as an Archive hypothesis because 167 rows are too many for a generic list, exported `Category` facts are available, and many rows have public effect lines.
- Phase 1: Local 0.82 audit found 167 Districts, 159 with `Category`, 138 with `Tier`, 76 with `Effects`, and 66 with `Extracted resource`.
- Phase 2: Selected `DISTRICTS-UI-001` as the smallest meaningful slice: District Focus rail plus content-first rows. Tier remains row metadata; a Tier rail is deferred.
- Phase 3: Implemented `DISTRICTS-UI-001` with a District Focus rail, effect-first archive rows, right-side Category/Tier metadata, compact exact Extracts links, and thin fallback copy.
- Phase 4: Product review found the category materially improved. No small high-value follow-up is required before closeout; Tier/progression should wait for explicit metadata/product need.
- Phase 5: Refactor review found no stale District-specific code. The implementation follows existing explicit category-mode patterns.
- Phase 6: Exporter backlog was updated with non-blocking District metadata findings.
