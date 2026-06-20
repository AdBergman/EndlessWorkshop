# Codex Improvements Execution Plan

Target category: Improvements  
Internal kind: `improvements`  
Status: active, uncommitted

## Status

Current Phase: Phase 6 - Closeout  
Completed: Phase 0 planning; Phase 1 audit; Phase 2 proposal review; Phase 3 implementation of `IMPROVEMENTS-UI-001`; validation; browser smoke attempt; product review; refactor/stale-code review; exporter backlog update.  
Next: Final validation and final report.  
Open Issues: Detail relationship grouping remains deferred; no blocking issue remains.

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
- [ ] Validate final state.
- [x] Complete final closeout.

## Running Decision Log

- Phase 0: Improvements start as an Archive or Archive/Reference hybrid hypothesis because 123 rows are too many for a plain generic list and exported `Category` facts appear available.
- Phase 1: Local 0.82 audit found 123 Improvements, 12 exported `Category` buckets, 100 entries with Effects, and 23 thin entries. Exact inbound references exist, but row relationships would likely distract from improvement effects.
- Phase 2: Selected `IMPROVEMENTS-UI-001` as a combined rail + row slice. Rail-only would be insufficient because Improvements have reliable row effects, and the playbook warns against closing out navigation-only slices too early.
- Phase 3: Implemented `IMPROVEMENTS-UI-001` with an Improvement Focus rail and content-first archive rows. Focus rail uses exact exported `Category`; rows show effect lines with quiet category metadata and honest thin fallback.
- Phase 4: Product review found the category materially improved and no small high-value follow-up needed before closeout. Detail relationship grouping is useful but not small enough for this pass.
- Phase 5: Refactor review found no stale Improvement-specific code. The existing `CodexSummaryDetail` category branching remains a known pattern, but extracting a generic row framework would be premature.
- Phase 6: Exporter backlog was updated with non-blocking Improvement metadata findings.
