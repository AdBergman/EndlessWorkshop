# Active DB Exporter Docs

Status: current AI working index
Updated: 2026-06-14

## Current Source Of Truth

Use this document for the packet requests that DBExporter implemented during
the 2026-06-14 phase:

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`

It contains the original EWShop implementation packets, current/desired JSON
shapes, validation expectations, and guardrails. Treat it as implemented phase
context, not as a fresh active request list.

Use this document for the latest aggregate DB Exporter -> EWShop phase handoff:

- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`

It summarizes completed packet work only, including Resources, Councilor
Effects, Partner Effects, and the partner effect one-hop mechanics follow-up. It
does not mean Codex export quality is complete.

## For AI Agents

- Start with `ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`
  for EWShop import/browser-QA planning.
- Treat `codex-db-exporter-implementation-packets.md` as packet-level context
  only when you need exact requested JSON shapes or guardrails.
- Do not resurrect archived metadata, reference-kind, content-quality, or
  chronological handoff docs as active implementation instructions.
- Read `../exporter-performance-playbook.md` before implementing exporter
  changes that touch runtime export paths.
- Read `../code-style-guidelines.md` before adding or refactoring exporter
  classes.

## Current Packet Status

Latest aggregate handoff:

- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`

Give this aggregate handoff plus the specific return handoff files below to
EWShop when they need phase context for importing and browser-QA.

Current return handoffs:

- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-packets-return-handoff-2026-06-13.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-referencekinds-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-actions-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-trait-refs-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-quest-refs-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-thin-entity-context-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-councilor-effects-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-resources-return-handoff-2026-06-14.md`

- `CDEX-EXP-001` Tech Unlock Exact Refs: implemented for canonical public
  unlock targets in tech Codex `Unlocks` section items.
- `CDEX-EXP-002` Major Faction Population Threshold Reward Refs: implemented
  for canonical public threshold reward targets, matching the minor population
  section-item/fact reference shape.
- `CDEX-EXP-004` Thin Actions Gameplay Summaries: safe subset implemented and
  F8-validated from cached/proven mechanics only.
- `CDEX-EXP-005` Diplomatic Treaty Effects And Public Text: safe subset
  implemented. Public treaty descriptions are preserved when canonical and
  incomplete runtime-parameter placeholders are suppressed.
- `CDEX-EXP-006` Status Scope Metadata: safe subset implemented and
  F8-validated.
- `CDEX-EXP-007` Trait Unlock And Ability Refs: implemented and F8-validated.
- `CDEX-EXP-008` Quest Reward And Requirement Public Refs: implemented and
  F8-validated.
- `CDEX-EXP-009` Modifier Public Labels: safe subset implemented and
  F8-validated.
- `CDEX-EXP-010` Thin Public Entity Context: Slice A ability residual context
  implemented and F8-validated; districts/improvements remain deferred.
- Councilor/Partner Effects Codex: implemented and F8-validated as new generic
  Codex exportKinds `councilorEffects` and `partnerEffects`.
- `CDEX-EXP-003` Resource Entities And Extractor Refs: implemented and
  F8-validated as generic Codex exportKind `resources`.

## Archived Historical Context

Superseded handoff/review docs are archived under:

- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`

Use archived docs only when a user explicitly asks for historical context.
