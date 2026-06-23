# DB Exporter Response EWShop Reconciliation

Status: archived closed reconciliation record
Current as of 2026-06-17
Source:
`docs/archive/codex/completed-2026-06-23-db-exporter-response-records/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`

This note translates the DB Exporter definitive response into EWShop import,
QA, and ownership decisions. It is not a new exporter request list. Do not
reopen rows that DB Exporter marked unavailable, obsolete, unsafe, internal,
runtime-only, or product/export-scope deferred without new source evidence.

Final accepted snapshot for EWShop import/QA: `20260616-210540`.
Import/QA result: pass. No EWShop-owned DB-exporter-response implementation
issues are currently open; use
`docs/archive/codex/completed-2026-06-23-db-exporter-response-records/codex-db-exporter-response-import-qa-results.md`
for the validation outcome.

## DB-CODEX-DEF-001 - Thin Actions

DB Exporter status: partially implemented.

What changed:

- `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`, and
  `ActionTypeStripTile` gained source-backed `Action mechanics` sections.
- `ActionTypeMove` now exists as a thin public Army Action target.
- `ActionTypeBanishPopulationFromSettlement` is no longer exported because the
  current DLL marks it obsolete and excluded from UI mapper generation.
- `ActionTypeArmyStealTerritory` remains a thin public target.

EWShop validation:

- Confirm imported Action pages preserve `sections[]`, item facts, exact
  `referenceKey`, `referenceKeys`, and `publicContextKeys`.
- Browser-QA `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`,
  `ActionTypeStripTile`, `ActionTypeMove`, and
  `ActionTypeArmyStealTerritory`.
- Confirm `ActionTypeBanishPopulationFromSettlement` is absent from public
  Codex output and no stale local import keeps it alive.

Frontend/API work: none expected unless imported generic sections or exact refs
fail to render.

Remaining gap: DB Exporter/editorial-owned for richer mechanics on still-thin
public Actions; runtime-only for `ActionTypeMove` pathfinding/movement
behavior; closed until source changes for obsolete
`ActionTypeBanishPopulationFromSettlement`.

Permanent decision notes:

- Do not infer action purpose from keys, names, or prose.
- Thin Action rows remain searchable/linkable exact targets, not EWShop bugs.

## DB-CODEX-DEF-002 - Districts And Improvements

DB Exporter status: partially implemented.

What changed:

- Extractor District rows exact-link to Resources where the relationship is
  proven.
- Bridge-related rows remain thin public targets when current public data only
  proves identity/category/tier and filtered descriptor output.
- `Aspect_DistrictImprovement_00` is not a current public Codex target.

EWShop validation:

- Browser-QA `District_Bridge`, `DistrictImprovement_Bridge_01`, one extractor
  such as `Extractor_Luxury01_Tier2`, and its Resource page.
- Confirm extractor rows keep exact `Resource_*` refs and Resource pages link
  back to extractors where exported.

Frontend/API work: none expected unless exact Resource/Extractor refs fail to
preserve or render.

Remaining gap: DB Exporter/editorial-owned for richer bridge or thin
District/Improvement mechanics if a public source is later found; closed
deferred for the current checked data shape.

Permanent decision notes:

- Do not request strategic-purpose summaries inferred from bridge names,
  categories, tags, or descriptor prose.
- Keep thin District/Improvement entries plain when exported data is thin.

## DB-CODEX-DEF-003 - Ability Mechanics

DB Exporter status: partially implemented.

What changed:

- `UnitAbility_AlwaysRetaliate` now has source-backed fallback semantics.
- `UnitAbility_RangedRetaliate` and `UnitAbility_BreakRetaliate` have
  source-backed battle mechanics.
- `abilities-codex` gained additive facts for `Ability mechanic`,
  `Ability source`, and `Combat role` where source-backed.
- `UnitAbility_Blossom_1`,
  `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`, and similar unsafe
  placeholder-text rows remain text-thin.

EWShop validation:

- Confirm ability facts render and can be used only as exported data, not
  inferred taxonomy.
- Browser-QA `UnitAbility_AlwaysRetaliate`,
  `UnitAbility_RangedRetaliate`, `UnitAbility_BreakRetaliate`,
  `UnitAbility_Blossom_1`, and
  `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`.

Frontend/API work: none expected unless new ability facts are dropped by the
import/API/rendering path.

Remaining gap: DB Exporter/editorial-owned and closed/deferred for current
unsafe placeholder sources; product/export-scope decision for any broader
ability subtype taxonomy.

Permanent decision notes:

- Do not export or infer `%Effect_*`, `%Tag_*`, hero equipment labels, or raw
  internal ability subtype text.
- Do not treat thin Blossom or equipment passive rows as EWShop bugs.

## DB-CODEX-DEF-004 - Population Threshold Refs

DB Exporter status: partially implemented.

What changed:

- Population facts prefer localized faction labels while preserving exact
  public faction refs.
- Major faction threshold rewards keep exact refs where the target is a current
  public Codex entry.
- `Population_Aspect` keeps visible `Unlocks Nutrient Extractor` text but no
  longer emits invalid `Aspect_DistrictImprovement_00` refs.
- `Population_Minor_MangroveOfHarmony` keeps exact public ref
  `MangroveOfHarmony_District_Tier1_Money`.
- `Population_Called` remains text-only where no canonical exact targets exist.

EWShop validation:

- Browser-QA `Population_Aspect`,
  `Population_Minor_MangroveOfHarmony`, `Population_Called`, and
  `Population_KinOfSheredyn`.
- Confirm resolved exact threshold refs get summaries and text-only/unresolved
  rewards stay plain.
- Confirm `Aspect_DistrictImprovement_00` is gone from `referenceKeys` and
  `publicContextKeys`.

Frontend/API work: none expected unless exact threshold refs no longer resolve
or text-only rewards are incorrectly linked.

Remaining gap: closed until source data changes for non-public
`Aspect_DistrictImprovement_00`; DB Exporter/editorial-owned for future exact
targets if public source data appears.

Permanent decision notes:

- Do not create placeholder entries for missing Population threshold targets.
- Do not link Population rewards by visible text.

## DB-CODEX-DEF-005 - Resources And Extractors

DB Exporter status: partially implemented.

What changed:

- Generic Codex exportKind `resources` exists.
- Resource rows come from canonical `ResourceDefinition` rows only.
- Extractor/resource exact refs are exported where proven.
- ResourceDeposit/POI pages are not exported in the current contract.

EWShop validation:

- Browser-QA `Resource_Specific_Corpse`, `Resource_Luxury01`,
  `Extractor_Luxury01_Tier2`, and one related extractor/resource pair.
- Confirm Resources remain a shallow top-level reference category.
- Confirm icon tokens alone do not become Resource pages.

Frontend/API work: none expected unless the existing `resources` shallow
category, exact links, or related entries regress.

Remaining gap: product/export-scope decision for ResourceDeposit/POI pages;
DB Exporter/editorial-owned for richer resource/extractor context where public
source data exists.

Permanent decision notes:

- Do not request Codex pages for `[FoodColored]`, `[DustColored]`, or other
  icon tokens without backing `ResourceDefinition` data.
- Keep ResourceDeposit/POI pages closed until product asks for a new export
  surface and import contract.

## DB-CODEX-DEF-006 - Treaty Effects And Public Text

DB Exporter status: partially implemented.

What changed:

- `diplomaticTreaties` exports category/bilateral/duration facts.
- Complete public treaty descriptions are preserved.
- Incomplete runtime-parameter placeholder text is suppressed.
- Applied `Status_*` exact refs are exported where present.
- `Treaty_AskToSurrender` and `Treaty_ProposeSurrender` remain missing static
  surrender/tribute values.

EWShop validation:

- Browser-QA `Treaty_AskToSurrender`, `Treaty_ProposeSurrender`,
  `Treaty_SharedResearch`, and `Declaration_CloseBorders`.
- Confirm exact applied Status summaries render where refs resolve.
- Confirm suppressed tribute placeholder prose does not reappear from stale
  imports.

Frontend/API work: none expected unless applied Status refs are not preserved
or rendered.

Remaining gap: runtime-only for surrender/tribute values; DB
Exporter/editorial-owned for direct treaty Effects where safe public text or
exact public refs exist.

Permanent decision notes:

- Do not invent static tribute amounts from runtime diplomatic state.
- Do not expose private descriptor, cost, tag, or placeholder treaty sources.

## DB-CODEX-DEF-007 - Status Scope And Thin Statuses

DB Exporter status: partially implemented.

What changed:

- Public Status targets continue through `bonuses`.
- `Scope`, `Status type`, and `Duration` facts are exported where canonical.
- Public mechanics sections are added where descriptor/cost-modifier mechanics
  collapse to safe public text.
- `Status_PublicOpinion_YouClosedBorders` exports Public Opinion mechanics.
- `HeroStatus_Loss` and `Status_Army_Map_Speed_Immobile` remain thin public
  exact targets.

EWShop validation:

- Browser-QA `HeroStatus_Loss`,
  `Status_PublicOpinion_YouClosedBorders`, and
  `Status_Army_Map_Speed_Immobile`.
- Confirm Status grouping/filtering uses exported facts only.

Frontend/API work: none expected unless exported facts/sections are dropped or
Status summaries regress.

Remaining gap: DB Exporter/editorial-owned and closed/deferred for current
descriptor-only thin Statuses; product/export-scope decision for broader
Status taxonomy.

Permanent decision notes:

- Do not infer Status scope or subtype from `Status_*` or `HeroStatus_*` keys.
- Thin Statuses remain exact searchable/linkable targets.

## DB-CODEX-DEF-008 - Deprecated Bonus Placeholder Rows

DB Exporter status: implemented.

What changed:

- Generic Codex metadata and ReferenceKinds public identity filtering suppress
  `[DEPRECATED]` public text.
- ReferenceKinds validation now fails if `[DEPRECATED]` display names leak.
- Known deprecated rows remain omitted:
  `ConstructibleCostModifier_UnitCostReduction03` and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.

EWShop validation:

- After fresh import, confirm local startup/import no longer reports those two
  deprecated rows as failed public rows.
- Confirm neither row is searchable/linkable as a public Codex page.

Frontend/API work: none expected.

Remaining gap: closed until source data changes.

Permanent decision notes:

- Do not request public pages for deprecated placeholder rows unless game
  source later provides real public display names and mechanics.

## DB-CODEX-DEF-009 - Councilor Description Key

DB Exporter status: implemented.

What changed:

- Councilor descriptions resolve through shared public localization cleanup.
- Raw biography keys shaped like `EntryKeyDescription` /
  `Notable_*Description` are suppressed.
- `Notable_FactionQuest_Mukag_Chapter05_Perisai` keeps the resolved public
  description plus exact `CouncilorEffect_*` and `PartnerEffect_*` refs.

EWShop validation:

- Browser-QA `Notable_FactionQuest_Mukag_Chapter05_Perisai`.
- Confirm no raw `Notable_*Description` token renders publicly.
- Confirm linked Councilor/Partner Effect refs still resolve.

Frontend/API work: none expected unless description/effect refs are dropped.

Remaining gap: closed until source data changes for missing descriptions.

Permanent decision notes:

- Render resolved public description text, not raw biography keys.
- Do not invent public biography text when localization is missing.

## DB-CODEX-DEF-010 - Modifier Public Targets

DB Exporter status: partially implemented.

What changed:

- Safe public modifier rows remain exported through `bonuses` when public
  target keys and mechanics are proven.
- Descriptor/tag/private/internal modifier targets remain omitted or
  diagnostics-only.
- Deprecated modifier rows with `[DEPRECATED]` identity remain suppressed.

EWShop validation:

- Browser-QA direct exact URL `/codex?entry=ActionCostModifier_CutForest_Decrease_00`.
- Confirm Modifiers remain hidden from top-level navigation.
- Confirm valid exact modifier rows remain reachable through search/exact
  links.

Frontend/API work: none expected. Do not promote Modifiers.

Remaining gap: product/export-scope decision for any broader Modifier category
or navigation; DB Exporter/editorial-owned only for source-backed public
modifier mechanics/refs.

Permanent decision notes:

- Hidden top-level Modifier navigation is an EWShop product/UX decision, not a
  data absence.
- Do not broaden Modifier pages from descriptors, tags, class names, generated
  source names, or private/internal mechanics.

## Cross-Cutting EWShop Decisions

- Use the generic Codex contract only: `descriptionLines`, `facts[]`,
  `sections[]`, `sections[].items[]`, exact `referenceKey`, `referenceKeys`,
  and `publicContextKeys`.
- Preserve exact-ref-only behavior. Do not infer links from names, prose,
  display labels, or key shapes.
- Keep `resources`, `councilorEffects`, `partnerEffects`, and `traits` shallow.
- Keep Modifiers hidden from top-level navigation.
- Treat thin entries as valid exact targets when DB Exporter marks richer data
  unavailable, unsafe, runtime-only, obsolete, internal, or deferred.
- Create EWShop frontend/API work only from fresh import evidence that EWShop
  fails to preserve, serve, or render exported data.
