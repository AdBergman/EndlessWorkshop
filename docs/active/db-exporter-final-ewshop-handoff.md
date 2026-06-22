# DB Exporter Final EWShop Handoff

Status: final handoff for EWShop import, backend/frontend implementation, and QA
Created: 2026-06-22

This handoff is supporting implementation memory. The active contract docs remain authoritative:

- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`
- `docs/active/db-exporter-next-phase-priorities.md`
- `docs/active/db-exporter-remaining-work-audit.md`

If this handoff conflicts with those docs, the active contract docs win.

## Executive Summary

- Final snapshot ID: `20260622-055736`
- Game/exporter JSON version: `0.82`
- Validation report: `export-reports/20260622-055736_validation.md`
- Result: all registered checks passed with 0 validation errors. Some known warnings/info remain for intentionally thin or pre-existing rows.
- Runtime export status: `last-export-status.json` reported `succeeded=true`, `succeededCount=25`, `failedCount=0`, `durationMs=4849`.
- F8 needed now: no. The final snapshot is already post-F8 and validated.

## What EWShop Should Import

Rich/source-truth exports:

- `districts`
- `improvements`
- `tech`
- `units`
- `heroes`
- `populations`
- `abilities`
- `skills`
- `factions`
- `quest_explorer`

Codex/public reference exports:

- `districts-codex`
- `improvements-codex`
- `tech-codex`
- `units-codex`
- `heroes-codex`
- `populations-codex`
- `abilities-codex`
- `equipment-codex`
- `councilors-codex`
- `councilorEffects-codex`
- `partnerEffects-codex`
- `resources-codex`
- `victorypaths-codex`
- `victoryconditions-codex`
- `naturalwonders-codex`
- `minorFactions-codex`
- `traits-codex`
- `quests-codex`
- `actions-codex`
- `bonuses-codex`
- `diplomaticTreaties-codex`

Diagnostics-only exports, not for normal public Codex import:

- `quest_explorer_branch_diagnostics`
- `actions-codex-inventory`
- `bonuses-codex-mechanics`
- `victorycondition-threshold-diagnostics`
- `BepInEx/reports/diagnostics/last-export-status.json`

## Major New Rich/Source-Truth Data

Heroes and Skills:

- `heroes` keeps exact identity, class, origin, grouped ability keys, default skill keys, and applicable skill-tree keys.
- `skills` adds `publicDisplayName` and validates source-backed prerequisite, inhibited, and locked relationships.
- No public Skills Codex category was created.

Units:

- `units` now carries static stats and `dustUpkeep`, grouped visible/hidden ability refs, class/specialization metadata, evolution integrity, and retaliation guardrails.
- Static `dustUpkeep` existed as source data but was newly populated into the rich export during this cycle.
- Ability refs were validated and grouped; public Codex ability refs were not broadened from hidden helper rows.

Technologies:

- `tech` now exposes source-proven faction gates, required/excluded faction trait keys, exact unlock target kinds, exact equipment unlock refs, protectorate slot unlocks, and faction trait unlocks.
- Key-prefix faction inference was removed.

Factions:

- New `factions` rich export provides major/minor faction join points: traits, populations, units, base units, heroes, gated technologies, quests, protectorate traits, affinity, and public labels/lore where available.

Populations:

- `populations` now normalizes identity, `populationKind`, public label, growth food cost, faction/affinity refs, worker descriptor keys, threshold rewards, public reward refs, and reward classifications.

Districts and Improvements:

- `districts` and `improvements` now share constructible source-truth fields: `familyKey`, `constructibleLevel`, static `constructionCost`, `unlockTechnologyKeys`, and `placementPrerequisites`.
- `districts` also carries `levelUp` metadata.

Quest Explorer:

- `quest_explorer.chapterRootEvidence` adds direct-source chapter/root evidence:
  `chapters`, `majorFactionRoots`, `minorFactionSpecificRoots`, `scenarioRootSlots`, `legacyInferredFields`, and `evidenceCounts`.
- Quest Explorer remains the authoritative quest browsing route. No generic Questline Codex pages were added.

## Major Codex/Public Metadata Improvements

Abilities:

- `abilities-codex` now derives `Combat role` from public text/mechanics rather than low-level mechanic tags.
- Role labels use player-facing terms such as `Apply Status`, `Remove Status`, `Damage`, `Heal`, `Movement`, `Shield`, and `Teleport`.
- Ability `svgIcon` metadata is emitted only when exact AssetExporter `ability-icons` registry evidence exists.
- Direct ability ownership/origin remains absent when not source-proven.

Equipment:

- `equipment-codex` suppresses non-public granted ability refs instead of linking to missing Ability pages.
- Equipment-to-Ability reference validation is registered.

Traits:

- `traits-codex` adds exactly one `Trait type` fact per row, secondary `Category` only when source-backed, source-proven `Origin faction` facts, and public reference cleanup.

Actions:

- `actions-codex` adds consistent `Action type`, keeps source-backed `UI category` where present, adds source-proven `Origin faction` facts for the small proven subset, and suppresses visual/category/state implementation refs.

Statuses / Bonuses:

- Status-like `bonuses-codex` rows now expose source-proven `Polarity` and public-safe `Status interactions` sections for `Inhibited by` and `Cancels on apply`.
- StatusGroup implementation keys are suppressed from public refs.

Victory and Natural Wonders:

- `victorypaths-codex` adds public Victory Path rows.
- `victoryconditions-codex` is public again with formula/value metadata and caveats.
- `naturalwonders-codex` adds public Natural Wonder rows without live map placement, ownership, or discovery state.

## Victory Conditions Special Note

Victory Conditions are public again.

Each `victoryconditions-codex` row exposes:

- public requirement formula;
- source-proven scaling inputs;
- current exported-game value;
- required hold-duration formula;
- current exported-game hold duration;
- caveat text that the exact threshold depends on game setup or generated map/game setup.

Exact Small/Normal/Huge threshold tables are not exported because no source-proven static table was found. Raw RPN definition keys, raw/effective RPN values, and world constants remain diagnostics-only in `victorycondition-threshold-diagnostics`.

EWShop may later derive approximate map-size examples in frontend/docs, but those must be labeled as examples or approximations, not as exported static source truth.

## Asset/Icon Note

DBExporter currently emits ability `svgIcon` metadata only:

```json
{
  "svgIcon": {
    "source": "ability-icons",
    "key": "UnitAbility_AlwaysRetaliate"
  }
}
```

Other art/icon/portrait work is deferred to the AssetExporter/art-contract workflow. EWShop must not infer icons from names, keys, filenames, Unity paths, GUIDs, raw SVG manifests, mapper names, or prose.

## Known Deferred Items

EWShop/product decision:

- public Skills Codex category;
- Equipment and Trait rich exports;
- Actions rich export;
- richer public District/Improvement planning facts from already-exported rich source truth;
- public ResourceDeposit, generic POI/anomaly, terrain, biome, or separate buildable-wonder pages;
- broader Questline Codex route while Quest Explorer owns quest browsing.

AssetExporter/art contract:

- hero portraits, unit art, skill icons, faction icons, equipment item art, trait icons, action icons, status icons, resource semantic icons, diplomacy icons, councilor portraits, population art, technology art, constructible art.

Runtime-only:

- live victory progress/countdown/enabled state;
- live natural wonder placement, discovery, ownership, settlement, territory, or world position;
- live status duration/initiator/target state;
- action pathfinding, cooldown, failure reasons, and availability;
- treaty surrender/tribute values;
- researched/queue state, live costs, current empire legality, live upkeep, current population counts.

Blocked by missing source evidence:

- ability ownership/origin where no direct owner field exists;
- generic Questline identity/title/faction ownership independent of Quest Explorer;
- exact Small/Normal/Huge victory threshold tables;
- any ownership, grouping, progression, mechanics, labels, icons, art, portraits, or refs that require key/name/prose/path/GUID/SVG inference.

Monitor/QA only:

- thin Actions rows with no public description/sections;
- thin Status rows whose safe public mechanics require a future parameter-aware UI renderer;
- known duplicate display-name info in some Codex categories;
- existing validation warnings with 0 errors.

## Import/QA Checklist For EWShop

- Import all public Codex exports listed above.
- Import rich exports used by resolvers, especially `tech`, `units`, `heroes`, `skills`, `populations`, `districts`, `improvements`, `factions`, `abilities`, and `quest_explorer`.
- Do not public-import diagnostics-only exports unless EWShop adds explicit diagnostic handling.
- Verify relationship refs resolve across Codex and rich stores.
- Verify ability `svgIcon` refs resolve against AssetExporter `ability-icons`.
- Verify Victory Condition pages render formula, scaling inputs, current exported-game value, hold duration, and caveat clearly.
- Verify Quest Explorer still owns quest browsing and Codex does not recreate branch/chapter navigation.
- Verify no empty public export kind causes deletion. Current public `victoryconditions-codex` has 6 rows.
- Treat absent ownership/icon/art fields as intentional absence unless a future exporter pass adds source evidence.

## Frontend/Backend Field Map Appendix

Review result: the handoff is accurate against the active response docs and final snapshot. This appendix makes it more implementation-ready for EWShop by naming the exact fields and fallback rules to use.

| Export kind | New/important fields | Consumer guidance | Fallback rule |
| --- | --- | --- | --- |
| `abilities-codex` | `svgIcon`, public `Combat role` facts | Use `svgIcon.source=ability-icons` and `svgIcon.key` only as emitted. Render `Combat role` as browse/filter metadata. | If `svgIcon` is absent, show no inferred icon. Do not derive icons from filenames or keys. |
| `units` | `stats`, `stats.dustUpkeep`, grouped ability arrays, `nextEvolutionUnitKeys` | Use rich `stats` for roster/profile display and rich evolution refs for upgrade navigation. | If a stat/ref is absent, leave it absent; do not compute live upkeep or infer missing evolution targets. |
| `skills` | `publicDisplayName`, `primaryAbilityKey`, relationship arrays | Use `publicDisplayName` for Hero skill UI. Keep `displayName` as a stable/source diagnostic key. | If `publicDisplayName` is absent, avoid substituting parsed key text. |
| `factions` | `populationKeys`, `unitKeys`, `heroKeys`, `gatedTechnologyKeys`, quest/protectorate fields | Use as the central rich join point for faction detail pages and resolver enrichment. | Missing arrays mean no source-proven join; do not backfill from key prefixes. |
| `districts` / `improvements` | `constructionCost`, `unlockTechnologyKeys`, `placementPrerequisites`, `levelUp` on districts | Use rich data for planning/resolver enrichment; public Codex can stay shallow unless product asks for planning facts. | Do not execute RPN costs or infer unlock timing from era/tier/prose. |
| `quest_explorer` | `chapterRootEvidence` | Use in Quest Explorer and link context only. It is not a generic Questline Codex identity model. | Keep legacy inferred fields classified as inferred; do not group by duplicate titles or parsed quest keys. |
| `victoryconditions-codex` | formula facts, scaling inputs, current exported-game values, hold duration facts, caveat | Render formulas and caveats directly. Treat current values as current exported-game evidence. | Do not create exact Small/Normal/Huge tables unless a future exporter emits source-proven values. |
| `naturalwonders-codex` | public facts and `Effects` section | Render as public reference pages. | Do not show live placement, owner, discovery, settlement, territory, GUID, or tile data. |
| `bonuses-codex` status rows | `Polarity`, `Status interactions` | Render polarity and relationship refs where present. | Thin status rows stay thin unless future source-safe mapping exists. |
| `traits-codex` | `Trait type`, `Category`, `Origin faction` | Use `Trait type` as the broad type and `Category` only as secondary source category. | If `Origin faction` is absent, do not infer ownership. |
| `actions-codex` | `Action type`, `UI category`, `Origin faction` | Use `Action type` for consistent display/filtering; use origin only when emitted with a ref. | Do not infer owner/category from raw action names or implementation refs. |

Trimmed sample snippets from snapshot `20260622-055736`:

Ability `svgIcon`:

```json
{
  "entryKey": "UnitAbility_AlwaysRetaliate",
  "displayName": "Vengeful Spirit",
  "svgIcon": {
    "source": "ability-icons",
    "key": "UnitAbility_AlwaysRetaliate"
  }
}
```

Unit `stats`:

```json
{
  "unitKey": "Unit_Aspect_Giant",
  "displayName": "Skyscale",
  "factionKey": "Faction_Aspect",
  "unitClassKey": "UnitClass_Flying",
  "nextEvolutionUnitKeys": [
    "Unit_Aspect_Giant_SpecializationA",
    "Unit_Aspect_Giant_SpecializationB"
  ],
  "stats": {
    "source": "UnitPropertiesEvaluationFromDescriptors",
    "health": 250.0,
    "defense": 15.0,
    "damage": 70.0,
    "damageMax": 70.0,
    "movement": 3.0,
    "vision": 3.0,
    "dustUpkeep": 15.0
  }
}
```

Skill `publicDisplayName`:

```json
{
  "skillKey": "HeroSkill_Archer02",
  "displayName": "HeroSkill_Archer02",
  "resolvedDisplayName": "Terrain Logistics",
  "publicDisplayName": "Terrain Logistics",
  "primaryAbilityKey": "UnitAbility_Hero_Archer02"
}
```

Faction join data:

```json
{
  "factionKey": "Faction_Aspect",
  "publicDisplayName": "Aspects",
  "factionKind": "major",
  "populationKeys": ["Population_Aspect"],
  "unitKeys": ["Unit_Aspect_Scout", "Unit_Aspect_Giant"],
  "heroKeys": ["Hero_Aspect_Archer_0", "Hero_Aspect_Caster_0"],
  "gatedTechnologyKeys": ["Aspect_Technology_00"],
  "startingFactionQuestKey": "FactionQuest_Aspect_Chapter01_Step01"
}
```

Constructible `constructionCost` / `unlockTechnologyKeys`:

```json
{
  "districtKey": "District_Tier1_Anomaly",
  "displayName": "Altar",
  "constructibleLevel": 0,
  "constructionCost": {
    "productionCostType": "Production",
    "resourcePrerequisites": [
      {
        "resourceType": "Resource04",
        "amount": 10.0
      }
    ]
  },
  "unlockTechnologyKeys": [
    "Necrophage_Technology_DistrictImprovement_CityCenter_00",
    "Technology_CampTerraformation_00_era3"
  ]
}
```

Quest `chapterRootEvidence`:

```json
{
  "chapterKey": "FactionQuest_Aspect_Chapter01",
  "chapterNumber": 1,
  "publicChapterTitle": "The Great Dieback",
  "orderedQuestKeys": [
    "FactionQuest_Aspect_Chapter01_Step01",
    "FactionQuest_Aspect_Chapter01_Step02"
  ],
  "questExplorerEntryKeys": ["FactionQuest_Aspect_Chapter01_Step01"],
  "sourceEvidence": {
    "orderedQuestKeys": "direct source",
    "questExplorerEntryKeys": "route-owned"
  }
}
```

Victory condition formula/value/caveat:

```json
{
  "entryKey": "VictoryCondition_EndGameDefinition_Standard_TerritoriesControlled_03",
  "displayName": "Supremacy",
  "facts": [
    {
      "label": "Required territories formula",
      "value": "Min(Map Territories Count, Map Territories Count / Major Empires Count) + 10 * Map Territories Count / 100 * World Difficulty"
    },
    {
      "label": "Requirement scaling inputs",
      "value": "Map Territories Count, Major Empires Count, World Difficulty"
    },
    {
      "label": "Current exported-game value",
      "value": "85"
    },
    {
      "label": "Threshold note",
      "value": "Exact threshold depends on generated map/game setup."
    }
  ]
}
```

Natural Wonder row:

```json
{
  "entryKey": "NaturalWonder_00",
  "displayName": "Crash Site",
  "facts": [
    {
      "label": "Footprint",
      "value": "4 tiles"
    }
  ],
  "sections": [
    {
      "title": "Effects",
      "lines": [
        "+3 [ScienceColored] Science on [ScienceColored] Science Tiles in Camp or City's Territories"
      ]
    }
  ]
}
```

Status polarity/interactions:

```json
{
  "entryKey": "Status_City_ApprovalLoss_High",
  "displayName": "Approval Failure",
  "facts": [
    {
      "label": "Polarity",
      "value": "Malus"
    }
  ],
  "sections": [
    {
      "title": "Status interactions",
      "items": [
        {
          "label": "Ahead in the Polls",
          "referenceKey": "Status_City_Approval_Medium",
          "facts": [
            {
              "label": "Interaction",
              "value": "Inhibited by"
            }
          ]
        }
      ]
    }
  ]
}
```

Trait type / origin faction:

```json
{
  "entryKey": "ProtectorateTrait_Ametrine_Trait01",
  "displayName": "Chant of the Rocks",
  "facts": [
    {
      "label": "Trait type",
      "value": "Protectorate"
    },
    {
      "label": "Origin faction",
      "value": "Ametrine",
      "referenceKey": "MinorFaction_Ametrine"
    }
  ]
}
```

Action type / origin faction:

```json
{
  "entryKey": "EmpireActionTypeKinOfSheredyn_Economy01",
  "displayName": "Kin Of Sheredyn Economy01",
  "facts": [
    {
      "label": "Action type",
      "value": "Kin Of Sheredyn Economy01"
    },
    {
      "label": "Origin faction",
      "value": "Kin of Sheredyn",
      "referenceKey": "Faction_KinOfSheredyn"
    }
  ]
}
```

## Suggested EWShop Implementation Priorities

Backend importer:

- Register any newly added public Codex kinds: `victorypaths-codex`, `victoryconditions-codex`, and `naturalwonders-codex`.
- Register/import `factions` rich export and the expanded rich fields for Units, Tech, Populations, Districts, Improvements, Heroes, Skills, and Quest Explorer.
- Keep diagnostics-only files out of normal public import.
- Add null-safe handling for intentionally absent owner/icon/art fields.

Frontend display:

- Add Victory Condition formula/caveat rendering.
- Surface Natural Wonders as public reference pages only from `naturalwonders-codex`.
- Use `factions` rich joins for faction profile/detail enrichment.
- Use `skills.publicDisplayName` for Hero skill displays.
- Prefer exact exported refs over resolver inference.

QA sample pages:

- Ability with SVG icon and cleaned `Combat role`.
- Equipment item whose non-public granted ability refs were removed.
- Trait with `Trait type`, `Category`, and `Origin faction`.
- Action with `Action type` and `Origin faction`.
- Status row with `Polarity` and `Status interactions`.
- Victory Conditions: Stature, Supremacy, Enlightenment.
- Natural Wonder page.
- Major faction and minor faction profile from `factions`.
- Unit with stats, `dustUpkeep`, evolution, and retaliation.
- Quest Explorer chapter/root evidence page or route panel.

## No-Inference Rules

EWShop must not infer ownership, origin, grouping, progression, labels, mechanics, icons, portraits, art, references, questline identity, or victory thresholds from keys, names, prose, duplicate titles, raw key fragments, SVG filenames, Unity paths, GUIDs, mapper names, or fuzzy matching.

Absence should remain absence unless a future DBExporter or AssetExporter contract emits source-proven data.

## Suggested Commit Message

```text
Add final EWShop DB Exporter handoff
```
