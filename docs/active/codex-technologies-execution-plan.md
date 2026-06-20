# Codex Technologies Execution Plan

## Target Category

Technologies

## Current Phase

PHASE 6 — Closeout complete

## Completed

- PHASE 0 — Plan.
- PHASE 1 — Audit.
- PHASE 2 — Proposal Review.
- PHASE 3 — Implementation.
- PHASE 4 — Validation.
- PHASE 5 — Product Review / Refactor Review.
- PHASE 6 — Closeout.

## Next

- Commit review.

## Open Issues

- No blockers.
- Browser smoke was attempted but not completed because the in-app browser connector failed during setup and the local `127.0.0.1:5173` app refused connection during headless Chrome fallback.

## Planned Sequence

1. Read required project/playbook/frontend guidance.
2. Audit Technology Codex and raw Tech data.
3. Classify the category.
4. Select the smallest meaningful implementation slice.
5. Implement Technology Codex Archive support.
6. Validate with targeted tests, TypeScript, build, and diff check.
7. Browser/product smoke if local services are available.
8. Update Technologies evolution docs.
9. Run closeout review.

## Stop Conditions

- Validation failure that cannot be safely fixed.
- Unclear product decision.
- Backend/exporter contract change required.
- Major architecture change required.
- Destructive change required.
- Explicit user review checkpoint.
- Final closeout complete.

## Validation Commands

Run from `frontend/`:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
git diff --check
```

## Exporter Backlog Rules

- Record exporter/data-quality issues as findings.
- Do not switch into DB Exporter implementation.
- Append non-blocking findings to `docs/active/db-exporter-ability-metadata-handoff.md` only when they are concrete enough to be actionable.
- Do not infer frontend behavior from keys, names, prose, or SVG filenames while waiting for exporter fixes.

## Audit Findings

- 133 Technology Codex entries.
- Every Technology has `Era`, `Tier`, `Quadrant`, and `Kind`.
- 60 Technology entries have a `Faction` fact.
- `Effects` and `Unlocks` sections are common and player-facing.
- The dedicated `/tech` route already owns progression/tree exploration.

## Category Classification

Technologies are an **Existing route-owned Explorer with Codex Archive support**.

The `/tech` route remains the primary Explorer. Codex Technologies should provide a searchable archive/reference companion, not a second tech tree.

## Proposal Review

### Smallest Meaningful Slice

Implement TECHNOLOGIES-UI-001:

- Technology archive mode.
- Era/Quadrant/Faction rail filters.
- Effect-first rows.
- Compact exact unlock links.
- Quiet metadata on the right.

### UX Designer

The generic split list is too flat for 133 entries. Era/Quadrant/Faction gives orientation without competing with the existing Tech route.

### Frontend Tech Lead

Use existing product-specific archive patterns. Avoid a generic category framework. Keep state in `CodexPage`, pure filter helpers in `lib/codex`, and a Technology-specific rail component.

### 4X Player

Players want to answer: what era is this, what branch/quadrant is it in, what does it unlock, and what public effect does it have. Deep progression planning belongs in `/tech`.

## Running Decision Log

- Use exported facts only: `Era`, `Quadrant`, `Faction`.
- Keep visible category label as `Tech` for now.
- Keep Tech detail pages unchanged.
- Do not expose prerequisites in Codex archive rows unless exporter later provides explicit Codex facts.
- TECHNOLOGIES-UI-001 added Tech Archive mode, Era/Quadrant/Faction rail filters, effect-first rows, and compact exact `Unlocks:` links.
- Completion decision: complete with follow-up recommended.

## Validation Result

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`: passed.
- `npx tsc --noEmit --project tsconfig.json`: passed.
- `npm run build`: passed.
- `git diff --check`: pending final run.

## Refactor Review

- No broad refactor needed.
- Tech-specific helper and rail follow existing evolved-category boundaries.
- `CodexPage` gained another archive mode branch, consistent with current architecture but still a future extraction pressure point.
