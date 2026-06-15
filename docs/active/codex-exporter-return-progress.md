# Codex Exporter Return Progress

Status: active QA tracker  
Current as of 2026-06-15

Use this note for the bounded EWShop QA pass after the 2026-06-14 DB Exporter
Codex metadata return. Source handoff:
`docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`.

## Completed Baseline

- `EW-CODEX-RET-001`: backend/import/API compatibility for `resources`,
  `councilorEffects`, and `partnerEffects` verified by tests.
- `EW-CODEX-RET-002`: frontend labels/searchability treatment implemented for
  `resources`, `councilorEffects`, and `partnerEffects`; all three remain out
  of top-level navigation.
- `EW-CODEX-RET-003`: Codex diagnostics rerun against current local imports and
  updated where old static wording contradicted current exporter-return data.

## Current Batch

### EW-CODEX-RET-004 - Resources And Extractors Browser QA

Status: completed

Scope:
- Verify resource detail pages are reachable by direct Codex selection/search.
- Verify extractor district pages link to resource entries and resource pages
  link back to extractors where exact refs exist.
- Keep Resources searchable/linkable only; do not promote top-level navigation.

QA notes:
- `Resource_Luxury01` / Klax renders as `Resources` with Extractors and
  Related Entries for Klax extractors; Resources are not shown in top-level
  navigation.
- `Resource_Strategic01` / Titanium renders as `Resources` with Titanium
  extractor links and readable resource facts.
- `Extractor_Luxury01` / Klax Extractor renders an exact `Extracted resource`
  link to Klax; clicking the linked Klax target selects `Resource_Luxury01`.
- Search for `Klax` surfaces the Resource entry and related extractor entries
  without promoting Resources to top-level navigation.

### EW-CODEX-RET-005 - Councilors And Effect Pages Browser QA

Status: completed

Scope:
- Verify Councilor pages expose linked `councilorEffects` and `partnerEffects`.
- Verify effect detail pages render readable facts/sections and are reachable
  from Councilor related links/search.
- Keep effect exportKinds searchable/linkable only; do not promote top-level
  navigation.

QA notes:
- `Notable_Elder_MinorFaction_Hydracorn` / Atea renders linked Councilor
  Effect and Partner Effect rows and Related Entries for `Travels Well` and
  `Hopeless Romantic`.
- Clicking `Travels Well` selects `CouncilorEffect_Defense21`; clicking
  `Hopeless Romantic` selects `PartnerEffect_Hydracorn_PartnerTrait01`.
- Both effect detail pages render readable mechanics text and the frontend
  labels `Councilor Effects` / `Partner Effects`.
- Searching for `Hopeless Romantic` finds the Partner Effect and Atea without
  promoting effect exportKinds to top-level navigation.
- Follow-up candidate: effect detail context lines still expose technical
  suffixes such as `Effect Defense21`; this is cosmetic and did not block the
  exporter-return QA pass.

### EW-CODEX-RET-006 - Exporter Return Regression QA

Status: completed

Scope:
- Spot-check improved exporter refs and public text for Tech unlocks, major
  faction Population thresholds, Treaties, Actions, Statuses, Traits, Quests,
  and Modifiers.
- Record only evidence-backed EWShop or exporter/editorial follow-ups.

QA notes:
- Tech unlock refs render in structured Unlocks sections. Examples:
  `Aspect_Technology_00` -> `Ascetic Existence` and
  `KinOfSheredyn_Technology_04` -> `Martial Discipline`.
- Major faction Population first-threshold refs now render compact target
  summaries where exact refs exist. Examples: `Population_KinOfSheredyn`
  shows `Military Press`; `Population_Aspect` now links the first threshold
  target while later text-only rewards remain plain.
- `Declaration_CloseBorders` renders an Applied Status and related Status
  entry for `Status_PublicOpinion_YouClosedBorders`.
- `Treaty_SharedResearch` remains facts/effects-only; no EWShop issue was found
  because no exact additional relation is exported for this page.
- `ActionTypeCutForest` renders public action mechanics. `ActionTypeBuildObservatory`
  intentionally shows the generic missing-summary message because no public
  gameplay summary exists in current data.
- Status pages render scope/type/duration/mechanics. Example:
  `Status_PublicOpinion_YouClosedBorders`.
- Modifier pages remain hidden from top-level navigation but are searchable and
  linkable after allowing meaningful percentage display names through the API
  filter. Example: `ActionCostModifier_CutForest_Decrease_00`.
- Trait pages render improved effect text and exact related minor faction refs.
  Example: `ProtectorateTrait_DaughterOfBor_Trait01`.
- No generic Codex `quests` exportKind is present in the current local Codex
  imports; Quest refs in the return bundle should be validated through Quest
  Explorer data/workflows, not Codex category browser QA.
- Remaining risk: the bonuses Codex import still reports two failed rows during
  local startup import. No player-visible missing page was identified in this
  QA pass, but the failed-row detail should be checked if dead-ref diagnostics
  point at missing bonus/status/modifier entries.
