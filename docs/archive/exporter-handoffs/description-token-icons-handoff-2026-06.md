# DB Exporter Handoff: Description Token Icon Registry

## Current Status - 2026-06-10

This document is now an archived request/analysis note, not an active open
handoff.

The exporter work requested here has landed and EWShop frontend now consumes
the delivered narrow runtime contracts directly:

- `frontend/public/svg/description-token-icons.json` is imported by
  `frontend/src/features/icons/descriptionTokenIcons.ts`.
- `frontend/public/svg/ability-icons.json` is imported by
  `frontend/src/features/icons/abilityIconResolver.ts`.
- Unit card stat icons resolve through the description-token registry in
  `frontend/src/features/icons/unitStatIcons.ts`, not through
  `semantic-manifest.json` or `manifest.json`.
- `[DoubleArrow]` is classified as a formatting marker and is intentionally not
  resolved as a gameplay icon.

Obsolete-as-active-work sections below:

- `Goal`, `New File`, `Contract`, and `Validation Requested` are fulfilled for
  `description-token-icons.json`.
- `Separate Investigation: [DoubleArrow] Formatting Token` is fulfilled; keep
  the notes only as background.
- `SVG Renderability Audit Addendum` is fulfilled by exporter renderability
  diagnostics and frontend-safe manifest filtering; keep as historical evidence.
- `Hero Codex Faction Context Addendum` is fulfilled for major-faction hero
  ownership.
- `Unit Ability Icon Contract Addendum` is fulfilled by the generated
  `ability-icons.json` contract.
- `DBX-CODEX-003` and `DBX-CODEX-008` are fulfilled by population structured
  metadata and the export inventory diagnostics report.

Still useful/open from this note:

- `DBX-CODEX-004`: richer equipment metadata or a rich equipment export.
- `DBX-CODEX-005`: richer/cleaner councilor metadata and prototype visibility.
- `DBX-CODEX-006`: richer trait metadata or a trait raw export.
- `DBX-CODEX-007`: product decision on whether hero skills belong in Codex.
- Frontend Codex follow-up remains useful, but should prefer exporter-provided
  `facts`, `sections`, and `publicContextKeys` when present instead of building
  broad new parsers first.

## Goal

Please add a small frontend-ready icon registry for bracket description tokens.

The frontend currently can resolve icons from `semantic-manifest.json`, but importing that full manifest into shared tooltip rendering adds unnecessary bundle weight. We want the exporter to keep producing the full manifests for diagnostics and fallback, while also producing one slim runtime file for UI text rendering.

## New File

Produce this file beside the SVG manifests:

```txt
frontend/public/svg/description-token-icons.json
```

This file should be generated from the same source data as `semantic-manifest.json`.

## Contract

The file is a JSON object keyed by the bracket token without brackets:

```json
{
  "FoodColored": {
    "path": "/svg/constructibles/UI_Common_Resource_Food.svg",
    "color": "#88C03FFF"
  },
  "Health": {
    "path": "/svg/units/UI_UnitItem_Health.svg"
  },
  "Damage": {
    "path": "/svg/heroes/UI_UnitItem_Damage.svg",
    "color": "#C872FCFF"
  },
  "AttackRange": {
    "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg",
    "variants": {
      "1": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_1.svg" },
      "2": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_2.svg" },
      "3": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg" },
      "4": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_4.svg" },
      "5": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_5.svg" },
      "6": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_6.svg" },
      "7": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg" }
    }
  }
}
```

### Entry Fields

- `path` is required.
  - Must be the browser path used by the frontend, for example `/svg/resources/UI_Common_Resource_Science.svg`.
  - Do not emit filesystem paths, Unity asset paths, GUIDs, mapper names, or exporter internals.
- `color` is optional.
  - Include it when the selected semantic entry has a meaningful color.
  - It is only a rendering hint. The frontend may override some economy token colors for visual consistency.
- `variants` is optional.
  - Use it for one bracket token that has multiple icon variants based on a numeric value in the same description line.
  - Keys should be the numeric values as strings.
  - Variant entries currently only need `path`; `color` may be included if meaningful.

No other fields are required for frontend runtime use.

## What To Include

Include unique semantic entries that have a `symbol` suitable for bracket-token rendering.

Normalize each `symbol` by stripping one surrounding bracket pair:

- `[FoodColored]` becomes `FoodColored`
- `[Health]` becomes `Health`
- `[MovementPoints]` becomes `MovementPoints`

Expected important coverage includes:

- Economy/resource tokens:
  - `FoodColored`
  - `IndustryColored`
  - `DustColored`
  - `MoneyColored`
  - `ScienceColored`
  - `CultureColored`
  - `InfluenceColored`
  - `PublicOrderColored`
- Unit/stat tokens:
  - `Health`
  - `HealthPoints`
  - `Damage`
  - `Defense`
  - `AttackRange`
  - `MovementPoints`
  - `VisionRange`
  - `Focus`
  - `Shield`
  - `Experience`
  - `HealthRegen`
- Common semantic tokens seen in descriptions:
  - `Population`
  - `Cadavers`
  - `Curiosity`
  - `Fortification`
  - `PublicOpinion`
  - `Turn`

It is fine to include all unique semantic `symbol` tokens from the manifest, as long as the file remains a small token-to-icon registry and does not include exporter internals.

## Numeric Variant Tokens

`AttackRange` is a numeric variant token.

It appears in player-facing descriptions like:

- `+1 [AttackRange] Attack Range`
- `+3 [AttackRange] Attack Range`
- `+7 [AttackRange] Attack Range`

The right icon depends on the range value. Please emit `AttackRange` with variants for every ranged ability icon that exists in the export:

```json
{
  "AttackRange": {
    "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg",
    "variants": {
      "1": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_1.svg" },
      "2": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_2.svg" },
      "3": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg" },
      "4": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_4.svg" },
      "5": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_5.svg" },
      "6": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_6.svg" },
      "7": { "path": "/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg" }
    }
  }
}
```

Generation source:

- `UnitAbility_Ranged_1` through `UnitAbility_Ranged_7`
- Their descriptions are `+N [AttackRange] Attack Range`
- Their raw icon paths are currently available as `unitAbility_Ranged_N` in `manifest.json`

Use `3` as the base `path` fallback if the frontend cannot infer a numeric variant from the line. This is a safe default because current unit exports most commonly use range 3, and fallback should only apply when the line lacks a value.

## Duplicate Token Precedence

Some symbols appear in multiple semantic sections. Pick one deterministically.

Use this precedence:

1. `resources`
2. `stats`
3. `statuses`
4. `armyActions`
5. `diplomacyStates`
6. `diplomacyActions`
7. `diplomacyTreaties`

Within a section, keep exporter ordering deterministic. If the source structure is map-like, sort keys alphabetically before selecting the first duplicate.

Examples:

- `FoodColored` should resolve to the resource food icon, not a city status variant.
- `ScienceColored` should resolve to the resource science icon.
- `CultureColored` should resolve to the resource influence icon.
- `Health` should resolve to the unit health icon.
- `Damage` should resolve to the unit damage icon.

## Validation Requested

Please verify the generated file contains working paths for:

- `FoodColored`
- `IndustryColored`
- `DustColored`
- `ScienceColored`
- `CultureColored`
- `PublicOrderColored`
- `Health`
- `Damage`
- `Defense`
- `AttackRange`
- `AttackRange.variants.1`
- `AttackRange.variants.3`
- `AttackRange.variants.7`
- `MovementPoints`
- `VisionRange`

Also verify every emitted `path` exists under the exported `frontend/public/svg/` asset tree.

## Separate Investigation: `[DoubleArrow]` Formatting Token

Please investigate `[DoubleArrow]` separately from normal bracket-token icon coverage.

Frontend observed many exported ability and trait descriptions that use `[DoubleArrow]` as a line-leading marker after an embedded newline, for example:

```txt
When using this Active Skill:
[DoubleArrow] Gains [Shield] Shield
```

This appears to be a formatting/control marker for "result line" or "effect bullet", not a gameplay icon token like `[Shield]`, `[Damage]`, or `[MovementPoints]`.

Important: do not map `[DoubleArrow]` to `TechnologyWindow_Link_Prerequisite` or `TechnologyWindow_Link_PrerequisiteUnlocked`. Those SVGs appear to represent tech prerequisite lock/unlock state, which is semantically wrong inside ability tooltips.

Requested exporter investigation:

1. Confirm whether `[DoubleArrow]` is intended as a layout marker rather than a player-facing icon token.
2. If it is only formatting, either omit it from `description-token-icons.json` or emit it in a separate formatting-token contract, not the normal icon registry.
3. If the game has a real visual asset for this marker, expose that specific asset with clear semantics, for example `descriptionFormatting.resultMarker`, instead of borrowing a tech prerequisite/link icon.
4. Consider whether exporter descriptions should preserve it as structured text metadata, for example separate rule/effect lines, rather than embedding `[DoubleArrow]` in raw copy.

Frontend workaround for now:

- Unit card skill tooltips split embedded newlines and strip a leading `[DoubleArrow]`.
- General bracket-token icon resolution no longer aliases `[DoubleArrow]` to a lock/unlock tech icon.

## SVG Renderability Audit Addendum

Frontend performed a full audit of the current checked-in SVG set after discovering that Tahuk/Mukag had an SVG path in the manifest but did not render in the browser.

This is not just a macOS Preview/Quick Look issue. Some SVG files exist on disk and are referenced by manifests, but every drawable element in the file resolves to no visible paint:

```xml
fill="none" stroke="none"
```

Important nuance: `fill="none"` or `stroke="none"` on an individual path is not automatically a bug. Many valid SVGs contain helper paths, masks, duplicate geometry, or outline-only shapes. The bug is when the entire SVG has drawable geometry but zero visible fill/stroke after resolving direct attributes and inline styles.

### Current Audit Result

Audited all `852` exported SVG files under `frontend/public/svg`.

- `34` files are present but blank: they contain drawable elements, but no visible painted element.
- `34` files contain explicit no-paint drawable elements; in this export all such files were fully blank.
- No audited SVG files were missing drawable elements entirely.

Blank files by category:

| Category | Total SVGs | Blank SVGs |
| --- | ---: | ---: |
| `battle-abilities` | 247 | 1 |
| `common` | 46 | 1 |
| `constructibles` | 177 | 9 |
| `equipment` | 7 | 2 |
| `factions` | 28 | 7 |
| `heroes` | 18 | 2 |
| `populations` | 9 | 3 |
| `quests` | 25 | 1 |
| `status-effects` | 23 | 3 |
| `technologies` | 37 | 5 |

Known blank files and raw manifest keys:

| Path | Raw manifest key |
| --- | --- |
| `/svg/battle-abilities/UI_ArmyActionTypeClearMountain.svg` | `battleAbility_Add_Bodyguarded` |
| `/svg/common/UI_Common_Rename.svg` | `armyActionTypeRename` |
| `/svg/constructibles/UI_ArmyActionTypeCreateCamp.svg` | `district_Camp_BeforeCamp` |
| `/svg/constructibles/UI_City_Repair.svg` | `constructibleAction_RepairDistrict` |
| `/svg/constructibles/UI_Settlement_CapitalPicto_Fill.svg` | `districtImprovementFamily_CityCenterUpgrade_Tier1` |
| `/svg/constructibles/UI_Settlement_Crisis.svg` | `district_ShantyTown` |
| `/svg/constructibles/UI_Terraformation_Deepmine.svg` | `constructibleAction_TerraformationDeplete` |
| `/svg/constructibles/UI_Terraformation_Enrich.svg` | `constructibleAction_TerraformationEnrich` |
| `/svg/constructibles/UI_Terraformation_HealTerrain.svg` | `constructibleAction_TerraformationHeal` |
| `/svg/constructibles/UI_Terraformation_Nurture.svg` | `constructibleAction_TerraformationNurture` |
| `/svg/constructibles/UI_icon_DistrictAction_MatriachTail.svg` | `necrophage_District_Appendage01_Tier2_v2` |
| `/svg/equipment/NecroArmor.svg` | `equipmentType_Chitin` |
| `/svg/equipment/NecroWeapon.svg` | `equipmentType_Coating` |
| `/svg/factions/UI_DiplomaticState_Peace.svg` | `minorFactionAffinityTypePacifist` |
| `/svg/factions/UI_DiplomaticState_Unknown.svg` | `factionUnknown` |
| `/svg/factions/UI_Faction_Lesser_Pilgrim.svg` | `lesserFaction_Pilgrim` |
| `/svg/factions/UI_Faction_Mukag.svg` | `factionTrait_Mukag_Units_EffectFeedbackOverride` |
| `/svg/factions/UI_Faction_Unknown.svg` | `factionDummy` |
| `/svg/factions/UI_MinorFactionAffinityType_Hostile.svg` | `minorFactionAffinityTypeHostile` |
| `/svg/factions/UI_SettlementActionType_AssimilateMinorFaction.svg` | `settlementAssimilateButton` |
| `/svg/heroes/EntourageRelationTypeNemesis_Picto.svg` | `heroGainedNemesisNotificationData` |
| `/svg/heroes/UI_EndTurn_CrownPicto.svg` | `simulationEventEffect_DrawHeroes` |
| `/svg/populations/UI_PopulationCategory_1.svg` | `populationCategory_01` |
| `/svg/populations/UI_PopulationCategory_2.svg` | `populationCategory_02` |
| `/svg/populations/UI_PopulationCategory_Homeless.svg` | `populationCategory_Homeless` |
| `/svg/quests/UI_icon_narrativeChoiceArchetype_Population.svg` | `factionQuest_LastLord_Chapter03B_Step01ChoiceDefinition` |
| `/svg/status-effects/UI_ArmyActionTypeBuildDam.svg` | `effect_EmpireBonus_Money_OnDam_00` |
| `/svg/status-effects/UI_DiplomacyIcon.svg` | `simulationEventEffect_AddEmpireExoticDiplomaticAbility_Aspects_ForceTreaty` |
| `/svg/status-effects/UI_MovementPoints.svg` | `simulationEventEffect_UpgradeAllRoads` |
| `/svg/technologies/TechnologyWindow_Link_Facilitating.svg` | `technologyWindowLinkFacilitating` |
| `/svg/technologies/TechnologyWindow_Link_Prerequisite.svg` | `technologyWindowLinkPrerequisite` |
| `/svg/technologies/UI_ArmyActionTypeBribe.svg` | `actionCostModifier_LastLord_Technology_01_ReducedBribeCost_01` |
| `/svg/technologies/UI_Technology_UnlockCategory_CityCap.svg` | `effect_EmpireBonus_CityCap4` |
| `/svg/technologies/UI_Technology_UnlockCategory_Extractor_Luxury.svg` | `technology_Extractor_Luxury_01_EffectOverride` |

Blank paths currently referenced by `semantic-manifest.json`:

| Semantic path | SVG path |
| --- | --- |
| `armyActions.typeClearMountain` | `/svg/battle-abilities/UI_ArmyActionTypeClearMountain.svg` |
| `armyActions.typeRename` | `/svg/common/UI_Common_Rename.svg` |
| `armyActions.typeRenameUnit` | `/svg/common/UI_Common_Rename.svg` |
| `diplomacyStates.peace` | `/svg/factions/UI_DiplomaticState_Peace.svg` |
| `diplomacyStates.unknown` | `/svg/factions/UI_DiplomaticState_Unknown.svg` |

### Tahuk/Mukag Case

The frontend expected public Tahuk to resolve to the raw/internal Mukag faction icon.

The raw mapping existed:

```txt
factionTrait_Mukag_Units_EffectFeedbackOverride -> /svg/factions/UI_Faction_Mukag.svg
```

But `/svg/factions/UI_Faction_Mukag.svg` is blank: every path has `fill="none"` and `stroke="none"`.

Frontend workaround for now:

```txt
factionAffinity_Mukag_210fe287 -> /svg/hero-skills/UI_EmpireSymbol_Mukag01.svg
```

That file renders visibly and is used as the Tahuk/Mukag icon until the exporter emits a valid `/svg/factions/UI_Faction_Mukag.svg` or an explicit semantic alias.

### Exporter Recommendations

Please add renderability validation to SVG generation before writing manifests.

For each exported SVG, classify it as renderable when it has at least one drawable element (`path`, `circle`, `rect`, `polygon`, `polyline`, `ellipse`, or `line`) with visible paint after resolving direct attributes and inline style:

- visible `fill`, or
- visible `stroke` with non-zero `stroke-width`, and
- effective `opacity`, `fill-opacity`, or `stroke-opacity` greater than `0`.

Treat these as non-renderable:

- all drawable elements have `fill="none"` and `stroke="none"`;
- all visible candidates have opacity `0`;
- stroke-only candidates have `stroke-width="0"`;
- the file has geometry but no visible painted element.

Recommended exporter behavior:

1. Do not select non-renderable SVG paths for `semantic-manifest.json`.
2. Do not select non-renderable SVG paths for `description-token-icons.json`.
3. If a raw manifest entry points to a non-renderable SVG, either:
   - repair the SVG by applying the intended source color/default white paint, or
   - map that raw key to a validated visible fallback, or
   - keep it in raw diagnostics only and mark it as non-renderable.
4. Emit a small diagnostics section or file with:
   - `path`
   - raw manifest keys that reference it
   - semantic entries that reference it
   - reason, for example `no_visible_paint`
5. Add an exporter acceptance test that fails when any frontend-ready contract path is non-renderable.

The frontend does not need the exporter to force every SVG to white. Colored assets are fine. We only need every chosen contract path to draw something in a normal browser without relying on Unity runtime materials.

## Hero Codex Faction Context Addendum

The Codex hero entries currently do not carry enough faction context for major-faction heroes.

Observed in `local-imports/codex/ewshop_heroes_codex_export_0.80.json`:

- Minor faction heroes are inferable because their keys and description text contain the faction, for example `Elder_MinorFaction_Ametrine` and `Faction: Ametrine`.
- Major faction heroes use keys such as `Hero_Aspect_Archer_0`, `Hero_KinOfSheredyn_Archer_0`, `Hero_Mukag_Archer_0`, and `Hero_Necrophage_Archer_0`.
- Those major hero Codex entries currently have generic context such as `Faction: Hero`, empty `referenceKeys`, empty `category`, and empty `kind`.

Observed in `local-imports/exports/ewshop_heroes_export_0.80.json`:

- The richer raw hero export also emits generic major-hero faction metadata, for example `faction: "Hero"` and `factionKey: "Faction_Hero"` for `Hero_Aspect_Archer_0`.
- That means the frontend cannot depend on the current raw hero export to recover major-faction ownership either.

Required exporter changes:

1. For major-faction heroes, emit the real owning faction in the raw hero export.
   - `Hero_Aspect_*` -> `Faction_Aspect`
   - `Hero_KinOfSheredyn_*` -> `Faction_KinOfSheredyn`
   - `Hero_LastLord_*` -> `Faction_LastLord`
   - `Hero_Mukag_*` -> `Faction_Mukag` with public label Tahuk
   - `Hero_Necrophage_*` -> `Faction_Necrophage`
2. In the heroes Codex export, include stable faction context through `referenceKeys`, for example `Faction_Aspect`, and/or a public context field/description such as `Faction: Aspects`.
3. Do not emit `Faction: Hero` as the faction context for major-faction heroes unless the hero is intentionally generic/world-owned.
4. Keep the frontend contract generic and simple: Codex rows should not need to parse Unity-style hero keys to discover faction ownership.

Frontend workaround for now:

- EWShop can temporarily infer major faction context from `Hero_<Faction>_...` entry keys.
- This is a bridge only. The long-term contract should come from the exporter as explicit Codex `referenceKeys` or context fields.

## Unit Ability Icon Contract Addendum

The current raw SVG manifest contains many ability icons, but they are not keyed by the same IDs the frontend receives for unit/codex abilities. This makes the frontend repair mappings through naming heuristics.

Observed examples:

| Frontend ability key | Public label | Current raw SVG key | Path |
| --- | --- | --- | --- |
| `UnitAbility_TeamPlayer_1` | Coordinated Attack I | `battleAbility_Descriptor_TeamPlayer_1` | `/svg/battle-abilities/UI_UnitAbility_TeamPlayer_1.svg` |
| `UnitAbility_TeamPlayer_2` | Coordinated Attack II | `battleAbility_Descriptor_TeamPlayer_2` | `/svg/battle-abilities/UI_UnitAbility_TeamPlayer_2.svg` |
| `UnitAbility_Momentum_2` | Fearless Charge II | `battleAbility_Descriptor_Momentum_2` | `/svg/battle-abilities/UI_UnitAbility_Momentum_2.svg` |
| `UnitAbility_Warmaster` | Warmaster | `battleAbility_Descriptor_Warmaster` | `/svg/battle-abilities/UI_UnitAbility_Warmaster.svg` |
| `UnitAbility_Cruel` | Cruel | `battleAbility_Descriptor_Cruel` | `/svg/battle-abilities/UI_UnitAbility_Cruel.svg` |
| `UnitAbility_SeismicSlash` | Seismic Slash | `activeSkill_Unit_SeismicSlash` | `/svg/battle-abilities/UI_UnitAbility_SeismicSlash.svg` |
| `UnitAbility_ProtectiveOversight` | Protective Oversight | `activeSkill_Unit_ProtectiveOversight` | `/svg/battle-abilities/UI_UnitAbility_ProtectiveOversight.svg` |
| `UnitAbility_DefensivePlate` | Defensive Plate | `battleAbility_Defend_A` | `/svg/battle-abilities/UI_UnitAbility_DefensivePlate.svg` |

Preferred exporter change, if the exporter can join unit/codex ability keys to presentation/icon records:

Emit a frontend-safe ability icon registry keyed by the exact ability IDs exposed in unit exports and codex ability exports.

Suggested file:

```txt
frontend/public/svg/ability-icons.json
```

Suggested shape:

```json
{
  "schemaVersion": 1,
  "abilities": {
    "UnitAbility_TeamPlayer_1": {
      "path": "/svg/battle-abilities/UI_UnitAbility_TeamPlayer_1.svg",
      "displayName": "Coordinated Attack I",
      "kind": "passive"
    },
    "UnitAbility_SeismicSlash": {
      "path": "/svg/battle-abilities/UI_UnitAbility_SeismicSlash.svg",
      "displayName": "Seismic Slash",
      "kind": "active"
    }
  }
}
```

Contract requirements when this join is feasible:

1. Key entries by frontend-visible ability keys such as `UnitAbility_TeamPlayer_1`, not by raw mapper keys such as `battleAbility_Descriptor_TeamPlayer_1`.
2. Include only stable UI fields: `path`, optional `displayName`, optional `kind`, optional `color`.
3. Do not expose Unity mapper names, source GUIDs, presentation definition names, or exporter internals.
4. Validate that every selected `path` exists and is renderable.
5. Prefer one deterministic icon per ability key. If several source records map to the same icon, collapse them before writing this contract.
6. Keep raw manifest rows for diagnostics, but do not require frontend UI code to infer ability icons from raw key naming patterns.

If this join is not feasible from exporter-available data:

1. Keep emitting the raw SVG manifest.
2. Add a lightweight diagnostics section for ability-like raw entries with:
   - raw icon key
   - path
   - source category when known, for example `unitAbility`, `battleAbility`, `activeSkill`, or `status`
   - renderability status
3. Do not guess public ability ownership in the exporter when the source data does not prove it.
4. Tell EWShop which source relationships are available, for example whether `UnitAbility_* -> PresentationAbilityDefinition_* -> SVG` can be followed.

In that fallback world, the frontend will keep a small resolver that bridges known raw naming patterns and explicit one-off aliases.

Frontend workaround for now:

- EWShop resolves common raw naming patterns in `abilityIconResolver`.
- This is acceptable as a temporary bridge, but broad ability coverage should move to a generated `ability-icons.json` contract once exporter support exists.

## Codex Encyclopedia Enrichment Addendum

EWShop reviewed the current generic Codex exports against the richer raw exports in `local-imports/exports`.

Goal: make the `/codex` encyclopedia feel like a richer reference workbench without forcing EWShop to infer relationships from Unity-style names or import every raw exporter field.

Recommended direction:

1. Keep the generic Codex contract backwards-compatible.
2. Add optional frontend-safe structured metadata to Codex entries.
3. Preserve `descriptionLines` as fallback text.
4. Prefer explicit public relationship keys over frontend key parsing.
5. Do not expose Unity internals, GUIDs, filesystem paths, mapper names, or exporter-only diagnostics in public Codex contracts.

### Current Coverage Snapshot

Generic Codex exports currently cover:

| Codex kind | Entries | Notes |
| --- | ---: | --- |
| `abilities` | 326 | Has `kind`; rich raw abilities export has 362 entries. |
| `councilors` | 47 | No rich raw export found; includes prototype-looking rows such as `Demo_01`. |
| `districts` | 164 | Rich raw districts export exists and is already imported elsewhere. |
| `equipment` | 159 | No rich raw equipment export found; Codex lines carry type/slot/rarity/tier/value. |
| `factions` | 5 | Codex-only structured text; no rich raw faction export found. |
| `heroes` | 79 | Rich raw heroes export exists and joins 1:1 by `entryKey == unitKey`. |
| `improvements` | 121 | Rich raw improvements export exists and is already imported elsewhere. |
| `minorFactions` | 17 | Codex-only structured text; no rich raw minor faction export found. |
| `populations` | 26 | Rich raw populations export exists and joins 1:1 by `entryKey == populationKey`. |
| `quests` | 285 | Separate rich quest explorer export exists. |
| `tech` | 133 | Rich raw tech export exists and is already imported elsewhere. |
| `traits` | 178 | No rich raw trait export found. |
| `units` | 157 | Rich raw units export exists and is already imported elsewhere. |

Rich raw exports currently found:

| Raw export kind | Rows | Public Codex relationship |
| --- | ---: | --- |
| `abilities` | 362 | Codex has 326; all Codex ability keys match raw entries. |
| `districts` | 217 | Codex is a public filtered subset. |
| `heroes` | 79 | Codex joins 1:1 by `entryKey == unitKey`. |
| `improvements` | 158 | Codex is a public filtered subset. |
| `populations` | 26 | Codex joins 1:1 by `entryKey == populationKey`. |
| `skills` | 147 | Not present in generic Codex. |
| `tech` | 219 | Codex is a public filtered subset. |
| `units` | 159 | Codex is a public filtered subset. |
| `battleAbilities` | 216 | Not present in generic Codex. |
| `battleSkills` | 131 | Not present in generic Codex. |
| `descriptorEvaluations` | 2348 | Diagnostic/source material, not public Codex by itself. |

### Current Generic Codex Structure Already Worth Preserving

Many Codex entries already encode useful facts in description lines:

- Heroes: `Faction:`, `Class:`, stat lines.
- Equipment: `Type:`, `Slot:`, `Rarity:`, `Tier:`, `Access pool:`, `Value:`.
- Populations: `Faction:`, `Type:`, `Base food cost:`, `Worker:`, `At N population:`.
- Councilors: `Faction:`, `Councilor effect:`, `Partner effect:`, `Role:`.
- Minor factions: `Disposition:`, `Faction affinity:`, `Population:`, `Unit:`, `Trait:`.
- Traits: `Category:`, `Cost:`, `Required affinity:`, `Excludes:`.
- Tech: `Faction:`, `Era:`, `Quadrant:`.
- Units: `Faction:`, `Class:`, `Spawn type:`.
- Quests: `Category:`, `Objective:`, `Requirements:`, `Rewards:`, `Choices:`.

EWShop can parse some of these lines as a temporary frontend-only enrichment, but the long-term contract should expose structured metadata so the app does not depend on fragile text parsing.

### DBX-CODEX-001: Add Stable Codex Metadata Fields For Structured Rendering

Please add optional frontend-safe metadata to generic Codex entries without replacing `descriptionLines`.

Suggested optional fields:

```json
{
  "facts": [
    { "label": "Faction", "value": "Aspects", "referenceKey": "Faction_Aspect" },
    { "label": "Class", "value": "Infantry Hero", "referenceKey": "UnitClass_Infantry_Hero" }
  ],
  "sections": [
    {
      "title": "Worker effects",
      "lines": ["+1 [CultureColored] Influence per Population Type in the same category"]
    }
  ],
  "publicContextKeys": ["Faction_Aspect", "Population_Aspect"]
}
```

Contract requirements:

1. `facts`, `sections`, and `publicContextKeys` are optional.
2. Existing `entryKey`, `displayName`, `descriptionLines`, and `referenceKeys` remain unchanged.
3. Unknown fields must remain safe for EWShop to ignore.
4. `referenceKey` values should be frontend-visible game-data keys, not exporter internals.
5. Do not emit Unity GUIDs, mapper names, filesystem paths, source object paths, or private diagnostics in public Codex entries.

Acceptance:

- EWShop can render structured details when metadata exists and fall back to `descriptionLines` when it does not.
- Existing generic Codex import remains backwards-compatible.
- Metadata ordering is deterministic.

### DBX-CODEX-002: Enrich Hero Codex Entries From Raw Hero Data

Raw heroes export already joins 1:1 with Codex heroes:

```txt
Codex heroes: 79
Raw heroes: 79
Join: codex.entryKey == raw.unitKey
```

Please enrich hero Codex entries with public-safe data from the raw hero export.

Fields to expose:

- real owning faction key and public faction label;
- class key and class display label;
- spawn type;
- ability keys;
- player-facing descriptor keys when meaningful;
- visible stat/bonus lines;
- hidden/prototype/internal flags only as diagnostics, not public detail fields.

Acceptance:

1. Major-faction heroes do not emit `Faction: Hero`.
2. Major-faction heroes include explicit faction context, for example `Faction_Aspect`, `Faction_KinOfSheredyn`, `Faction_LastLord`, `Faction_Mukag`, or `Faction_Necrophage`.
3. Hero `referenceKeys` include useful faction and ability references where available.
4. EWShop does not need to parse `Hero_<Faction>_...` keys to discover hero ownership.

Related existing handoff section:

- `Hero Codex Faction Context Addendum`

### DBX-CODEX-003: Enrich Population Codex Entries With Threshold Rewards

Raw populations export already joins 1:1 with Codex populations:

```txt
Codex populations: 26
Raw populations: 26
Join: codex.entryKey == raw.populationKey
```

Please preserve rich population structure in Codex metadata.

Fields to expose:

- faction key and faction name;
- population type flags, such as major/minor/default/created-by-action/custom-faction availability;
- base food cost;
- worker description lines;
- threshold rewards with amount, label, reward type, reward key, reward display name, and description lines;
- forbidden faction trait keys.

Acceptance:

1. Threshold rewards remain ordered by threshold amount.
2. Reward keys are included when they resolve to public Codex entries or public game-data entities.
3. Existing population description lines continue to render as fallback.
4. EWShop can render a population detail page with a facts panel, worker effects, and threshold reward timeline.

### DBX-CODEX-004: Add Raw Equipment Export Or Structured Equipment Codex Metadata

No rich raw equipment export was found in `local-imports/exports`.

Current equipment Codex entries already include useful line prefixes:

- `Type:`
- `Slot:`
- `Rarity:`
- `Tier:`
- `Access pool:`
- `Value:`

Please provide either a raw rich equipment export or structured equipment metadata in the generic Codex export.

Fields to expose:

- equipment type;
- slot;
- rarity;
- tier;
- access pool;
- value;
- stat/effect lines;
- related ability, descriptor, quest, resource, or reward keys where provable.

Acceptance:

1. All 159 equipment Codex entries expose structured facts matching the current description prefixes.
2. Equipment `referenceKeys` include meaningful related keys when available.
3. Internal-only equipment rows do not leak into public Codex.
4. EWShop can render equipment as a structured item card rather than generic paragraphs.

### DBX-CODEX-005: Add Rich Councilor Export Or Clean Councilor Codex Contract

No rich raw councilor export was found.

Current councilor Codex entries include useful line prefixes:

- `Faction:`
- `Councilor effect:`
- `Partner effect:`
- `Role:`

But at least one prototype-looking row appears:

```txt
Courtesan_Demo_01 -> Demo_01
```

Please clarify and enrich the councilor Codex contract.

Fields to expose:

- faction or minor-faction ownership;
- role;
- councilor effect;
- partner effect;
- player-facing stat/effect lines;
- visibility/prototype exclusion status.

Acceptance:

1. Prototype/demo rows are either excluded or clearly flagged as non-public.
2. Councilor entries have stable public display names.
3. Councilor `referenceKeys` include owning faction or minor faction when available.
4. EWShop can render councilors as structured profile cards.

### DBX-CODEX-006: Add Trait Rich Metadata Or Trait Raw Export

No rich raw trait export was found.

Current traits Codex entries include useful line prefixes:

- `Category:`
- `Cost:`
- `Required affinity:`
- `Excludes:`

Please provide trait metadata beyond generic description text.

Fields to expose:

- trait category;
- trait kind;
- cost;
- required affinity;
- exclusions;
- linked abilities/effects;
- player-facing effect description.

Acceptance:

1. Current trait Codex entries can render cost/category/effect as structured UI.
2. Internal quest-only traits are excluded or clearly flagged.
3. References resolve to public abilities, factions, tech, or other traits where available.

### DBX-CODEX-007: Decide Whether Hero Skills Belong In Codex

Raw `skills` export exists with 147 rows, but `HeroSkill_*` and `BattleSkill_*` entries are effectively absent from generic Codex.

Please decide whether hero skills should become a Codex category or remain future feature data.

If included in Codex, expose:

- skill key;
- display name;
- active/passive;
- tree/class;
- tier and level prerequisite;
- prerequisite skills;
- locked-by and inhibited-by skills;
- default hero keys;
- unit ability and battle ability links.

Acceptance:

1. Hero skills are either intentionally absent from Codex with a documented reason, or exported as a public Codex category.
2. Raw skill-tree implementation noise does not leak into player-facing UI.
3. EWShop can link heroes to default skills if hero detail UI needs it.

### DBX-CODEX-008: Add Missing Rich Export Inventory

Please document which rich exports exist and which are intentionally absent.

Categories to classify:

| Category | Current observed status |
| --- | --- |
| `equipment` | Missing raw rich export; generic Codex only. |
| `councilors` | Missing raw rich export; generic Codex only. |
| `traits` | Missing raw rich export; generic Codex only. |
| `factions` | Missing raw rich export; generic Codex only. |
| `minorFactions` | Missing raw rich export; generic Codex only. |
| `heroSkills` / `skills` | Raw export exists; not generic Codex. |
| `battleSkills` | Raw export exists; not generic Codex. |
| `battleAbilities` | Raw export exists; not generic Codex. |
| `descriptorEvaluations` | Raw diagnostic/source export exists; not generic Codex. |

Suggested status values:

- `public codex only`
- `rich raw export exists`
- `planned`
- `not exportable`
- `intentionally internal`

Acceptance:

1. Each category has one explicit status.
2. EWShop does not need to infer missing relationships from naming conventions.
3. Missing exports needed for UI are visible as planned work rather than accidental gaps.

### EWShop Frontend Recommendation

EWShop should first enrich `/codex`, not create new top-level pages.

Recommended EWShop follow-up tickets:

1. `CODEX-001`: Add frontend-only structured renderers from current `descriptionLines` for heroes, equipment, populations, traits, councilors, minor factions, and abilities.
2. `CODEX-002`: Add tests for structured Codex parsing and rendering using current local Codex fixtures.
3. `CODEX-003`: After exporter enrichment lands, extend `CodexDto` with optional structured metadata.
4. `CODEX-004`: Add backend import/storage for optional Codex metadata without breaking old generic imports.
5. `CODEX-005`: Upgrade Codex detail UI to prefer structured metadata and fall back to parsed `descriptionLines`.
6. `CODEX-006`: Re-evaluate `/heroes` as a standalone page only after hero Codex data includes faction ownership, ability references, skill/default hero relationships, and preferably art/icon support.

Default product decision for now:

- Do not create a standalone Heroes tab yet.
- Keep Heroes inside Codex.
- Make hero Codex detail much richer first.

Rationale:

- Current hero data is enough for better encyclopedia detail pages.
- It is not yet enough for a `/heroes` page comparable to `/units` or `/tech`.
- A standalone Heroes page becomes valuable only if it supports hero browsing by faction/class, skill/default relationships, equipment synergies, and visual identity.
