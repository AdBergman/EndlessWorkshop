# Exporter Handoff Status

Current as of 2026-06-10.

## Active Frontend Consumption

- Description token icons: `frontend/public/svg/description-token-icons.json`
  is consumed by `frontend/src/features/icons/descriptionTokenIcons.ts`.
- Ability icons: `frontend/public/svg/ability-icons.json` is consumed by
  `frontend/src/features/icons/abilityIconResolver.ts`.
- Unit card stat icons resolve through the description-token registry in
  `frontend/src/features/icons/unitStatIcons.ts`.
- Unit veterancy progression is wired into the Units page through the reusable
  `VeterancyLens` component and pure stat projection helper.
- Population Codex structured metadata is available from the exporter contract;
  future Codex UI should prefer `facts`, `sections`, and `publicContextKeys`
  when present, with `descriptionLines` as fallback.

## Completed Handoff Areas

- Description token icon registry.
- `DoubleArrow` formatting-token classification.
- SVG renderability filtering and diagnostics for frontend-safe contracts.
- Major-faction hero ownership context.
- Ability icon registry keyed by public `UnitAbility_*` keys.
- Unit veterancy progression metadata.
- Population structured Codex metadata.
- Export inventory diagnostics.

## Remaining Useful Follow-Ups

- Equipment: add richer metadata or a rich equipment export.
- Councilors: add richer metadata and clarify prototype/demo visibility.
- Traits: add richer metadata or a trait raw export.
- Hero skills: decide whether hero skills belong in Codex or remain future
  feature data.
- Codex UI: upgrade detail views incrementally to use structured metadata where
  exported.
- Units/art: run visual QA and polish card art, repeated/placeholder art,
  ability icon presentation, and faction accent consistency.

See `docs/current-action-priorities.md` for the current product-priority view.
Use `docs/active/db-exporter-codex-metadata-handoff.md` for the active DB
exporter/backend Codex metadata request.

## Archived Context

- Detailed backend/frontend exporter log:
  `docs/archive/exporter-handoffs/ewshop-handoff-2026-06.md`.
- Original description-token/icon request and analysis:
  `docs/archive/exporter-handoffs/description-token-icons-handoff-2026-06.md`.
- Compact SVG icon contract guidance:
  `docs/frontend/svg-icon-contracts.md`.
