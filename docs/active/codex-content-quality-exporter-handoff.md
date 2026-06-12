# Codex Content Quality Exporter Handoff

Status: active exporter/editorial handoff
Created: 2026-06-12
Source diagnostic: `npm run diagnostics:codex-content -- --limit 80`

This is the current DB exporter/editorial Codex handoff. Older Codex metadata
coverage and reference-kind handoffs are archived under `docs/archive/codex/`
and should be treated as historical context only.

## Purpose

EWShop can now render and polish the current Codex metadata, but the next
quality gains require source/exporter improvements. This handoff lists the
highest-signal content issues found by the Codex content-quality diagnostic.

Do not treat this as a request for new EWShop UI. The immediate goal is cleaner
public Codex data: public names, readable effect text, useful metadata, and no
placeholder entries.

## Diagnostic Summary

Current local imports scanned:

- Entries: `2468`
- Findings: `5271`
- Critical: `13`
- High: `2198`
- Medium: `3060`

Owner split:

- EWShop presentation cleanup: `2949`
- Exporter/editorial: `651`
- Both EWShop and exporter/editorial: `1671`

Highest-signal issue counts:

- `placeholder-text`: `13`
- `raw-internal-text`: `436`
- `raw-internal-label`: `1629`
- `missing-player-context`: `133`
- `formula-like-text`: `69`
- `no-op-effect`: `42`

## Requested Exporter / Editorial Actions

1. Replace or suppress placeholder/generated public names.
2. Replace raw internal keys with player-facing labels or typed references.
3. Replace raw mechanics labels with public fact labels.
4. Add gameplay effect/source context for entries that only have classification
   facts.
5. Translate formula-like effect lines into readable public effect text.
6. Stop exporting zero-value effects as public benefits or costs unless the
   zero itself is meaningful and explained.

## Representative Critical Placeholders

These entries should be fixed before treating the current Codex content as
release-quality:

| Category | Entry | Field | Current value | Request |
| --- | --- | --- | --- | --- |
| bonuses | `ConstructibleCostModifierDefinition_Custom_Specific05_RemoveUnitIndustry` | display name | `Constructible Cost Modifier Definition Custom Specific05 Remove Unit Industry` | Use a public modifier name or suppress from public Codex. |
| bonuses | `ConstructibleCostModifierDefinition_Custom_Specific08_FoundationPopCost` | display name | `Constructible Cost Modifier Definition Custom Specific08 Foundation Pop Cost` | Replace `SpecificNN` generated naming with player-facing copy. |
| bonuses | `ConstructibleCostModifierDefinition_Custom_Specific16_FoundationDustCost` | display name | `Constructible Cost Modifier Definition Custom Specific16 Foundation Dust Cost` | Export public name and affected cost/resource metadata. |
| bonuses | `TechnologyCostModifierDefinition_Custom_Specific28_CheapMilitaryTech` | display name | `Technology Cost Modifier Definition Custom Specific28 Cheap Military Tech` | Export public name and affected tech/cost metadata. |
| councilors | `Notable_CollectibleEvent_015_TBD` | display name | `Notable_CollectibleEvent_015_TBD` | Replace placeholder notable/councilor name or suppress entry. |

## Representative Raw Internal Text

These are player-visible strings that still look like database output:

| Category | Entry | Field | Current value | Request |
| --- | --- | --- | --- | --- |
| actions | `ActionTypeAbsorbCity` | fact value | `ActionTypeAbsorbCity` | Do not export action key as public content; use public action name or typed reference. |
| bonuses | `ConstructibleCostModifier_BridgeDistrictCostReduction_00` | section item fact value | `Constructibles: Constructible With Descriptor` | Replace descriptor wording with affected constructible category or public target. |
| councilors | `Notable_CollectibleEvent_015_TBD` | display name | `Notable_CollectibleEvent_015_TBD` | Export player-facing notable/councilor name. |
| districts | `MangroveOfHarmony_District_Tier1_Money` | display name | `MangroveOfHarmony_District_Tier1_Money` | Export localized/public district variant name. |
| heroes | `Elder_MinorFaction_Ametrine` | description line | `Class: UnitClass_Infantry_Hero` | Export readable class label such as `Infantry Hero`. |
| units | `Unit_Aspect_Giant` | description line | `Class: UnitClass_Flying` | Export readable class label such as `Flying`. |
| traits | `FactionTrait_Custom_Specific_MukagAffinityQuestBundle` | section line | `Mukag_Light01` | Export public action/quest label or typed reference. |

## Representative Raw Mechanics Labels

EWShop can hide or relabel some cases, but the source data should avoid making
these labels public:

| Category | Entry | Field | Current label | Request |
| --- | --- | --- | --- | --- |
| actions | `ActionTypeAbsorbCity` | fact label | `Reference key` | Keep as internal reference only; do not emit as public fact. |
| actions | `ActionTypeBuildPartnerDen` | section item fact label | `Value type` | Export public label such as cost, duration, yield, or requirement. |
| bonuses | `ActionCostModifer_CloseRift_Decree_Discovery_02_00` | fact label | `Operation` | Export human-readable effect metadata instead of operation name. |
| bonuses | cost/status modifier entries | fact label | `Display value` | Prefer public `Effect` or a typed effect section. |
| bonuses | modifier entries | fact label | `Target scope` | Export public target/affected entity label. |

## Missing Player Context

Some entries have only classification facts. They need gameplay impact, source,
or effect context before they feel useful in Codex.

Representative examples:

- `abilities:UnitAbility_AlwaysRetaliate`
- `abilities:UnitAbility_BreakRetaliate`
- `abilities:UnitAbility_Cumbersome`
- `abilities:UnitAbility_NoRetaliate`
- `abilities:UnitAbility_RangedRetaliate`
- `bonuses:Status_AdministrativeCenter_Subjugation`
- `districts:District_Bridge`
- `improvements:DistrictImprovement_Bridge_01`

Requested metadata:

- short public description;
- effect section;
- source/unlock context when known;
- relevant target or unit/building category;
- typed related references where available.

## Formula-Like Text Needing Translation

Formula-like lines are useful data, but they need public phrasing or richer
metadata so EWShop can render them as player-facing effects.

Representative examples:

- `abilities:UnitAbility_Blossom_1`: `+0% Specialization Cost if %Effect_UnitVeterancy_Level2`
- `bonuses:Status_Courtesan_HeartBroken`: `*0 [FoodColored] Food on Haven`
- `districts:MangroveOfHarmony_District_Tier1_Money`: `+2 [FoodColored] Food on %neighbourtiles if Tile adjacent to Coastal or Ocean Tiles`
- `factions:Faction_LastLord`: `*0 [HealthRegen] Health Regeneration on Unit`
- `improvements:DistrictImprovement_Bridge_00`: `*2 [FoodColored] Food if adjacent to Foundation on Bridge`
- `populations:Population_Called`: `*0.3 [DustColored] Dust on Sacred Flames cost`
- `traits:FactionTrait_Custom_Specific01`: `*0 [ScienceColored] Science on Cities`

Requested output:

- readable public effect sentence;
- numeric value plus operation metadata if the raw operation still matters;
- affected resource/stat;
- condition/target metadata;
- typed references instead of `%Tag_*`, `%Effect_*`, or `%Tiles` placeholders.

## Zero-Value Effects

EWShop suppresses exact no-op lines in normal detail rendering, but exporter
should avoid sending them as public effects unless they mean "removed", "free",
or another player-relevant state.

Representative examples:

- `abilities:UnitAbility_Hero_Aspect03`: `+0 [Might] Might on Heroes`
- `bonuses:Status_Unit_DefensivePosture_1`: `+0 [Defense] Defense`
- `districts:District_Camp_CampCenter`: `+0 [Experience] Experience on new Units on Districts of this City`
- `factions:Faction_LastLord`: `+0 [DustColored] Dust on City`
- `tech:Aspect_Technology_DistrictImprovement_Money_03`: `+0 [DustColored] Dust on [FoodColored] Farms Districts`
- `traits:FactionTrait_LastLord_Chapter06AChoice02_FactionQuest`: `+0% Rebellion odds on %villageontop per Lord's Estate`

## EWShop Issues Intentionally Not Requested Here

The diagnostic also reports duplicate fact-prefixed description lines across
many categories. That is an EWShop presentation concern and has already been
handled in the current renderer path where structured facts exist.

Do not use this handoff to request exporter changes for exact duplicate
description lines unless a duplicate is the only available public content or the
source copy itself is wrong.

## Validation

After exporter/editorial changes land, rerun from `frontend/`:

```bash
npm run diagnostics:codex-content -- --limit 80
```

Expected improvement:

- `placeholder-text` approaches `0`;
- `raw-internal-text` decreases for public names, facts, and sections;
- `missing-player-context` decreases for abilities, statuses, districts, and
  improvements;
- `formula-like-text` decreases or is backed by clearer structured metadata;
- `no-op-effect` decreases unless explicitly meaningful.
