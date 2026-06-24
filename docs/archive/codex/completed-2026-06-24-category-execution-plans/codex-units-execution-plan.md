# Codex Units Execution Plan

Target category: Units  
Internal kind: `units`  
Status: CODEX-RICH-002 implemented, uncommitted

## Status

Current Phase: CODEX-RICH-002 validation/browser smoke

Completed: Required docs read; durable evolution document created; durable execution plan created; local data audit completed; browse/navigation/main/detail/relationship/exporter audits completed; proposal review completed; `UNITS-UI-001` implemented; closeout completed; `CODEX-RICH-002` Unit detail rich resolver implemented with focused helper/page tests and TypeScript passing.

Next: Full validation, browser/product smoke if local services cooperate, final report.

Open Issues: Full progression/evolution-tree UI remains deferred because Codex should not duplicate `/units`; pixel-level browser smoke may still be limited by local service/port state.

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

- Phase 0: Created durable docs before implementation as requested. Units category shape was left open because Units may be an Explorer, Archive, Reference Sheet, or a new type.
- Phase 1: Local 0.82 audit found 156 player-facing Unit Codex entries. Every entry has `Kind`, `Tier`, `Class`, `Spawn type`, and `Stats`; 154 have `Faction`; 155 have `Granted abilities`. Raw Units export has evolution fields, but Codex entries do not expose a stable progression section/fact.
- Phase 2: Units earns an Archive classification inside Codex for the current generic Codex export. The dedicated `/units` route remains the richer Explorer surface; Codex should provide a compact comparison archive, not rebuild the progression explorer from raw-only fields.
- Phase 2: Selected `UNITS-UI-001`: Class/Faction/Tier rail plus stat-first Unit archive rows with quiet metadata and compact exact granted ability links.
- Phase 3: Implemented `UNITS-UI-001` with product-specific
  `codexUnitArchiveFilters`, `UnitArchiveRail`, Unit Archive mode wiring,
  Class/Faction/Tier filters, stat-grid Unit rows, quiet Faction/Class/Tier
  metadata, and compact exact granted ability links.
- Phase 4: Product review found the category materially improved. Evolution
  chain UI is high-value but exporter-dependent; no second frontend-only slice
  is justified before review.
- Browser/product smoke: Attempted but did not complete. Existing frontend and
  backend ports were not serving usable routes, and starting the backend jar was
  blocked by H2 TCP port `9092` already being in use.
- Phase 5: Refactor review found no stale Unit-specific code. Broader
  `CodexSummaryDetail` row-renderer extraction is deferred as a separate
  architecture cleanup.
- Phase 6: Exporter backlog was updated with non-blocking Units findings.
  Completion decision: complete with follow-up recommended.
- CODEX-RICH-002: Reopened Units for rich-import detail enrichment. Added
  compact Codex Unit detail `Evolution` links from existing `useUnitStore`
  records. Runtime fields used are `unitKey`, `previousUnitKey`, and
  `nextEvolutionUnitKeys`; `evolutionTierIndex` was inspected but not surfaced.
  Rich `abilityKeys` were intentionally not rendered because existing Codex
  detail already owns public granted ability previews and the current API DTO
  does not expose raw grouped/helper ability buckets safely.
