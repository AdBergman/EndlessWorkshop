# EWShop Aggregate Handoff: Codex Metadata Packet Phase

Status: phase handoff for completed packet work only  
Date: 2026-06-14  
Source packet doc:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`

This does not mean Codex export quality is complete. It summarizes the
validated DB Exporter packet phase so EWShop can import the latest Codex files,
run diagnostics, browser-QA the player-facing pages, and send focused feedback
back to DB Exporter.

## Completed Work

- `CDEX-EXP-001` Tech Unlock Exact Refs:
  canonical public unlock targets export as structured `Unlocks` items where
  provable.
- `CDEX-EXP-002` Major Faction Population Threshold Reward Refs:
  canonical public threshold rewards export exact item/fact refs, matching the
  minor population shape.
- `CDEX-EXP-003` Resource Entities And Extractor Refs:
  implemented as new generic Codex exportKind `resources`; extractor district
  rows exact-link to resources, and resource rows reverse-link to public
  extractors where proven.
- `CDEX-EXP-004` Thin Actions Gameplay Summaries:
  safe subset implemented from cached action cost/formula/target sources;
  unresolved actions remain facts-only/link-only.
- `CDEX-EXP-005` Diplomatic Treaty Effects And Public Text:
  safe partial implemented; canonical treaty text is preserved where available
  and broken placeholder/runtime-parameter text is suppressed.
- `CDEX-EXP-006` Status Scope Metadata:
  safe subset implemented from canonical status source fields.
- `CDEX-EXP-007` Trait Unlock And Ability Refs:
  exact trait granted ability, unlock, and related refs export where canonical
  public targets exist.
- `CDEX-EXP-008` Quest Reward And Requirement Public Refs:
  structured quest requirements/rewards export from canonical quest source data;
  unresolved or unsafe rows remain text-only.
- `CDEX-EXP-009` Modifier Public Labels:
  safe subset implemented for proven public modifier targets; unresolved
  descriptor/tag targets stay out of product JSON.
- `CDEX-EXP-010` Thin Public Entity Context:
  Slice A ability residual context/filter implemented; districts/improvements
  remain deferred.
- Councilor Effects Codex:
  implemented as new generic Codex exportKind `councilorEffects`, linked from
  existing `councilors` rows by canonical `CourtesanDefinition.CouncilorEffect`.
- Partner Effects Codex:
  implemented as new generic Codex exportKind `partnerEffects`, linked from
  existing `councilors` rows by canonical `CourtesanDefinition.PartnerEffect`.
- Partner effect one-hop mechanics fix:
  `PartnerEffectDefinition.Effects` now contributes direct one-hop public
  mechanics from canonical trait/status/ability/cost-modifier paths where safe.

## Deferred Or Known Gaps

- Resource deposits / POI pages:
  `ResourceDepositDefinition` and POI-style public pages remain deferred.
- Resources browse visibility:
  EWShop/product should decide whether resources are top-level browseable,
  nested under Extractors, or searchable/linkable only.
- Districts and improvements thin context:
  deferred from `CDEX-EXP-010`; do not invent copy from tags/descriptors.
- Browse suppression/searchable-only handling:
  product/navigation decision remains deferred.
- Actions:
  only proven cached mechanics were added; actions with no canonical public
  mechanics source remain thin.
- Diplomatic treaties:
  cleanup was intentionally safe partial; any missing values need source-backed
  follow-up.
- Statuses:
  scope metadata landed, but residual thin statuses remain facts-only unless a
  canonical mechanics source exists.
- Partner/councilor effects:
  partner effects now expose direct one-hop mechanics, but deeper graph
  traversal remains deferred. `CouncilorEffectDefinition` gain values were not
  exported because they appear AI/heuristic-oriented and need public-safety
  review before product use.
- Category presentation:
  EWShop should review new generic categories `resources`, `councilorEffects`,
  and `partnerEffects` for navigation, labels, grouping, and browse behavior.

## Current Docs To Use

- Active packet doc:
  `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`
- Active docs index:
  `docs/active/README.md`

## Return Handoffs

- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-packets-return-handoff-2026-06-13.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-referencekinds-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-actions-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-trait-refs-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-quest-refs-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-thin-entity-context-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-councilor-effects-return-handoff-2026-06-14.md`
- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-resources-return-handoff-2026-06-14.md`

## Latest Snapshots And Reports

- Tech/populations/treaties packet batch:
  - `export-snapshots/codex-packets-tech-pop-treaties-final-20260613`
  - `export-reports/codex-packets-tech-pop-treaties-final-20260613_validation.md`
- Status/modifier reference-kinds batch:
  - `export-snapshots/referencekinds-status-modifier-clean-20260614`
  - `export-reports/referencekinds-status-modifier-clean-20260614_validation.md`
- Actions safe subset:
  - `export-snapshots/actions-cdex-exp-004-safe-subset-20260614`
  - `export-reports/actions-cdex-exp-004-safe-subset-20260614_validation.md`
- Trait refs:
  - See `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-trait-refs-return-handoff-2026-06-14.md`
- Quest refs:
  - `export-snapshots/quest-refs-cdex-exp-008-merged-sections-20260614`
- Thin ability context:
  - `export-snapshots/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614`
  - `export-reports/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614_validation.md`
- Councilor/partner effects initial batch:
  - `export-snapshots/councilor-partner-effects-codex-filtered-20260614`
  - `export-reports/councilor-partner-effects-codex-filtered-20260614_validation.md`
- Resources final validated batch:
  - `export-snapshots/resources-cdex-exp-003-extractor-key-join-20260614`
  - `export-reports/resources-cdex-exp-003-extractor-key-join-20260614_validation.md`
- Partner effect one-hop mechanics:
  - `export-snapshots/partner-effects-one-hop-20260614`
  - `export-reports/partner-effects-one-hop-20260614_validation.md`

## Suggested EWShop Next Steps

- Import all latest Codex files from the latest validated export batch.
- Verify new generic categories import cleanly:
  - `resources`
  - `councilorEffects`
  - `partnerEffects`
- Run relationship/dead-ref diagnostics after import.
- Browser-QA these surfaces:
  - resources and extractor links
  - councilors, councilor effects, and partner effects
  - tech unlocks
  - population threshold rewards
  - diplomatic treaties
  - actions
  - statuses and modifiers
  - traits
  - quests
  - abilities
- Report frontend/category/navigation feedback back to DB Exporter, especially
  for browse visibility and category grouping of Resources and effect pages.
- Identify any remaining player-facing pages that still look like raw database
  output, with example `entryKey`s and the current rendered text.

## Suggested DB Exporter Next Step

Run a remaining Codex gap audit after EWShop imports and browser-QAs this phase.
The next exporter pass should prioritize EWShop-proven gaps rather than broad
metadata enrichment.
