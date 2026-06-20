# Codex Diplomacy Execution Plan

Target category: Diplomatic Treaties  
Durable evolution doc: `docs/active/codex-diplomacy-evolution.md`  
Current phase: closeout complete  
Status: complete with follow-up recommended

## Planned Sequence

1. Phase 0 - Plan.
2. Phase 1 - Audit.
3. Phase 2 - Proposal Review.
4. Phase 3 - Implement DIPLOMACY-UI-001.
5. Phase 3B - Implement DIPLOMACY-UI-002.
6. Phase 4 - Validate.
7. Phase 5 - Product Review.
8. Phase 6 - Refactor Review.
9. Phase 7 - Closeout.

## Stop Conditions

Stop only for:

- validation failure that cannot be safely fixed;
- unclear product decision;
- backend/exporter contract change;
- major architecture change;
- destructive change;
- explicit review checkpoint;
- final closeout.

## Validation Commands

Run from `frontend/` after implementation:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
git diff --check
```

## Exporter Backlog Rules

- Use `docs/active/db-exporter-ability-metadata-handoff.md` for non-blocking
  exporter findings.
- Do not create a new exporter handoff.
- Do not switch into DB Exporter implementation.
- At closeout, verify whether findings were appended or explicitly deferred.

## Checklist

- [x] Required docs read.
- [x] Durable evolution document created.
- [x] Durable execution plan created.
- [x] Data audit documented.
- [x] Browse audit documented.
- [x] Navigation audit documented.
- [x] Main panel audit documented.
- [x] Detail audit documented.
- [x] Relationship audit documented.
- [x] Exporter audit documented.
- [x] Proposal review documented.
- [x] Implement DIPLOMACY-UI-001.
- [x] Implement DIPLOMACY-UI-001A preview trust cleanup.
- [x] Validate.
- [x] Browser/product smoke review.
- [x] Refactor/stale-code review.
- [x] Closeout docs.
- [x] Reopened completion after row metadata review.
- [x] Implement DIPLOMACY-UI-002.
- [x] Validate DIPLOMACY-UI-002.
- [x] Browser/product smoke DIPLOMACY-UI-002.
- [x] Re-run refactor/stale-code review.
- [x] Update final closeout.

## Running Decision Log

- Diplomatic Treaties are a small Archive/Reference hybrid, not a heavy
  Ability-style archive.
- First slice should add a compact Treaty Category rail from exact exported
  `Category` facts.
- Keep current rows/details for the first slice.
- Use `Diplomacy` as the player-facing label while preserving the internal
  `diplomatictreaties` route/export kind.
- Do not infer diplomatic outcomes or faction relationships from prose/keys.
- Product/browser smoke found `Other empire` leaking into treaty archive row
  previews; fixed by preferring public description/effect text before applied
  Status target facts.
- Completion decision was reopened because DIPLOMACY-UI-001 improved
  orientation but left the archive rows too generic.
- DIPLOMACY-UI-002 should add quiet right-side row metadata from exported facts:
  simplified Category, Bilateral/One-sided, and Duration.
- DIPLOMACY-UI-002 completed the missing main-panel polish. The category is now
  complete with follow-up recommended, not fully final, because applied Status
  row links remain a product-review topic.
- DIPLOMACY-UI-004 added compact impact signals from exact exported treaty
  Effects and applied-status mechanics while keeping full applied Status cards
  out of archive rows.

## Validation Results

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`: passed.
- `npx tsc --noEmit --project tsconfig.json`: passed.
- `npm run build`: passed with existing large chunk warning only.
- `git diff --check`: passed.

## Browser / Route Smoke

- HTTP 200 route smoke:
  - `/codex?category=diplomatictreaties`
  - `/codex?category=diplomatictreaties&entry=Declaration_OpenBorders`
  - `/codex?category=diplomatictreaties&search=vision`
  - `/codex?category=abilities`
- Headless Chrome DOM smoke rendered `/codex?category=diplomatictreaties`.
- DIPLOMACY-UI-002 browser smoke confirmed the treaty archive rows retain
  public description/effect content and expose Category/Bilateral/Duration as
  quiet metadata.
- DIPLOMACY-UI-004 should be reviewed manually for:
  - Close Borders Public Opinion impact;
  - Embrace Symbiosis Public Opinion impact;
  - Shared Research/Deeper Collaboration Science token rendering.

## Recommended Commit Split

Expected one commit remains appropriate:

- `feat(codex): add diplomacy archive polish`
