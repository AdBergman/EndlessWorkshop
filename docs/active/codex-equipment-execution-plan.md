# Codex Equipment Execution Plan

Status: EQUIPMENT-UI-003B complete; awaiting review
Target category: Equipment  
Started: 2026-06-20

## Current Phase

EQUIPMENT-UI-003B review/reporting.

## Planned Sequence

1. Setup durable memory.
2. Read required project rules and playbook.
3. Audit Equipment data.
4. Audit player browse model.
5. Audit navigation model.
6. Audit main-panel row model.
7. Audit detail model.
8. Audit exact relationships.
9. Audit exporter/data-quality findings.
10. Decide and implement safe scoped UI slices when justified.
11. Validate after each implementation slice.
12. Browser smoke after visual/product changes.
13. Update Equipment evolution docs after each phase/slice.
14. Run Final Category Closeout.
15. Report final state and recommended commit split.

## Stop Conditions

Stop only for:

- validation failure that cannot be fixed within the slice
- genuinely unclear product decision
- backend/exporter contract change requirement
- major architecture change requirement
- destructive change requirement
- explicit user review checkpoint
- final closeout completion

If something is visually imperfect but reversible, document it and continue unless it blocks the next slice.

## Validation Commands

Run relevant tests after every implementation slice.

Minimum final frontend validation from `frontend/`:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
```

Repository-level check from the repo root:

```bash
git diff --check
```

## Browser Smoke Targets

After Equipment visual/product changes, review:

- `/codex?category=equipment`
- representative Equipment detail route
- Equipment search
- any new Equipment navigation/filter behavior
- `/codex?category=abilities` sanity
- `/codex?category=statuses` sanity
- `/codex?category=resources` sanity

## Exporter Backlog Rules

Use the active exporter backlog:

- `docs/active/db-exporter-ability-metadata-handoff.md`

Rules:

- Record exporter/data-quality findings during audit.
- Do not switch into DB Exporter implementation.
- Do not create new exporter handoff docs.
- Append concrete non-blocking findings when appropriate.
- Hard blockers stop Equipment implementation until clarified.
- At closeout, verify exporter findings were handled or explicitly explain why not.

## Current Checklist

- [x] Required docs identified.
- [x] Equipment evolution doc created.
- [x] Equipment execution plan created.
- [x] Equipment data audit complete.
- [x] Browse audit complete.
- [x] Navigation audit complete.
- [x] Main panel audit complete.
- [x] Detail audit complete.
- [x] Relationship audit complete.
- [x] Exporter audit complete.
- [x] UI slices implemented if justified.
- [x] Validation complete.
- [x] Browser smoke complete.
- [x] Final category closeout complete.
- [x] EQUIPMENT-UI-003A validation complete.
- [x] EQUIPMENT-UI-003A browser smoke complete.
- [x] EQUIPMENT-UI-003B validation complete.
- [x] EQUIPMENT-UI-003B browser smoke complete.

## Running Decision Log

- 2026-06-20: Created durable Equipment evolution and execution plan docs before implementation, per user request.
- 2026-06-20: Classified Equipment as an Archive after data audit. Accepted exported `Type` as primary browse model and `Rarity` as secondary browse model.
- 2026-06-20: Accepted archive row direction: Equipment rows should prioritize `Effects` lines and exact granted ability previews; Type/Rarity/Tier/Value are supporting metadata.
- 2026-06-20: Recorded non-blocking exporter findings: unresolved granted ability refs, missing explicit Equipment icon metadata, and one missing `Access pool`.
- 2026-06-20: Implemented combined Equipment archive foundation: explicit `equipmentArchive` mode, Type/Rarity left rail, filters returning from detail to list, Effects-first rows, exact granted ability preview cards, and quiet Type/Rarity/Tier/Value metadata.
- 2026-06-20: Focused validation passed: `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`; `npx tsc --noEmit --project tsconfig.json`.
- 2026-06-20: Browser smoke passed for Equipment root, Type/Rarity filtering, Equipment search/no-results, detail-to-filter return, and Abilities/Statuses/Resources sanity pages.
- 2026-06-20: Final closeout completed. Equipment is complete for the first archive evolution pass; detail polish, inbound Quest/Trait relationships, and per-item icon metadata remain deferred follow-ups.
- 2026-06-20: Started EQUIPMENT-UI-003A after manual visual review. Decision: Equipment archive rows should show exact granted abilities as compact inline `Grants:` links; full granted ability cards stay in detail pages.
- 2026-06-20: EQUIPMENT-UI-003A validation passed. Browser smoke confirmed compact `Grants:` links in Equipment archive rows, no full granted ability cards in archive rows, exact Ability navigation from a grant link, and full granted ability cards still present in Equipment detail.
- 2026-06-20: Started EQUIPMENT-UI-003B after manual visual review. Decision: compact granted ability links should reuse `CodexInlineEntityLink` for tooltip parity.
- 2026-06-20: EQUIPMENT-UI-003B validation passed. Browser smoke confirmed compact grant links, no full grant cards in archive rows, exact Ability navigation, detail cards preserved, and Abilities/Statuses sanity. Tooltip behavior is covered by the component/page test using the shared inline link path; headless synthetic mouse movement did not surface the portal tooltip reliably during smoke.
- 2026-06-20: Follow-up review confirmed Type/Rarity/Tier/Value belong in quiet right-side Equipment row metadata, not the left content column. Restored `Value` to that metadata block.
