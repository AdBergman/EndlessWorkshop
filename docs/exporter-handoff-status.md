# Exporter Handoff Status

Current as of 2026-06-12.

## Active Frontend Consumption

- Description token icons: `frontend/public/svg/description-token-icons.json`
  is consumed by `frontend/src/features/icons/descriptionTokenIcons.ts`.
- Ability icons: `frontend/public/svg/ability-icons.json` is consumed by
  `frontend/src/features/icons/abilityIconResolver.ts`.
- Unit card stat icons resolve through the description-token registry in
  `frontend/src/features/icons/unitStatIcons.ts`.
- Unit veterancy progression is wired into the Units page through the reusable
  `VeterancyLens` component and pure stat projection helper.
- Codex structured metadata is broadly available from current local imports.
  EWShop imports, preserves, serves, and renders `facts`, `sections`, and
  `publicContextKeys`, with `descriptionLines` as fallback.
- Actions and Diplomatic Treaties are visible Codex categories.
- Bonus-derived Statuses are visible Codex entries. Bonus-derived Modifiers stay
  hidden from top-level navigation while remaining searchable/linkable as exact
  targets.

## Completed Handoff Areas

- Description token icon registry.
- `DoubleArrow` formatting-token classification.
- SVG renderability filtering and diagnostics for frontend-safe contracts.
- Major-faction hero ownership context.
- Ability icon registry keyed by public `UnitAbility_*` keys.
- Unit veterancy progression metadata.
- Codex structured metadata preservation and generic rendering.
- Actions, Diplomatic Treaties, Statuses, hidden/linkable Modifiers, and current
  Codex category presentation polish.
- Export inventory diagnostics.

## Remaining Useful Follow-Ups

- Codex content quality: replace placeholder names, raw internal labels, raw
  mechanics text, formula-like effect text, and missing player context in public
  Codex data.
- Codex diagnostics: rerun content-quality diagnostics against current local
  imports before each exporter/editorial handoff.
- Hero skills: decide whether hero skills belong in Codex or remain future
  feature data.
- Codex search/discovery and related-entry behavior: review with real imported
  data before expanding links.
- Units/art: run visual QA and polish card art, repeated/placeholder art,
  ability icon presentation, and faction accent consistency.

See `docs/current-action-priorities.md` for the current product-priority view.
Use `docs/active/codex-content-quality-exporter-handoff.md` for the current DB
exporter/editorial Codex content-quality request.
Use `docs/active/codex-content-quality-diagnostics.md` for the current
diagnostic workflow.

## Archived Context

- Detailed backend/frontend exporter log:
  `docs/archive/exporter-handoffs/ewshop-handoff-2026-06.md`.
- Original description-token/icon request and analysis:
  `docs/archive/exporter-handoffs/description-token-icons-handoff-2026-06.md`.
- Superseded Codex metadata/reference-kind handoffs and implementation audits:
  `docs/archive/codex/`.
- Compact SVG icon contract guidance:
  `docs/frontend/svg-icon-contracts.md`.
