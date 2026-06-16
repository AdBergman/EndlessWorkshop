# Codex Preview-Surface Audit

Status: active diagnostic report
Generated: current script run
Source: current local Codex imports in `local-imports/codex/`

## Purpose

This audit looks for future Codex preview-surface opportunities using only
exported Codex metadata and exact resolved keys. It does not recommend a
generic renderer, exporter contract changes, SEO work, or graph UI.

Preview-surface meanings:

- Inline clarification: exact mechanic references inside prose.
- Compact rendered preview: relations that explain what the current entry does.
- One-line summary/card: broad encyclopedia subjects such as factions or tech.
- Related Entries remain exploration, not repetition.

Already proven and covered:

- Ability -> applied Status inline links.
- Unit, Equipment, and Hero -> granted Ability compact previews.
- Tech -> exact Unlocks one-line summaries.
- Population -> exact threshold reward target summaries.
- Resource, Councilor Effect, and Partner Effect shallow reference category
  lists.

## Top 10 Candidate Ranking

| Rank | Source | Relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status | Examples |
| ---: | --- | --- | --- | ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | actions | Related Status/effect entries | compact rendered preview | 3 | 6/42 resolved, 36 unresolved, 3 duplicate structured refs | 6 | 5 | Both | Needs exporter/editorial context first | Mukag Light01 (EmpireActionTypeMukag_Light01)<br>Mukag Light02 (EmpireActionTypeMukag_Light02)<br>Mukag Light03 (EmpireActionTypeMukag_Light03) |
| 2 | factions | Related Status/effect entries | one-line summary/card | 1 | 2/6 resolved, 4 unresolved, 0 duplicate structured refs | 6 | 5 | Both | Needs product review to avoid bloat | Necrophages (Faction_Necrophage) |
| 3 | diplomatictreaties | Related Status/effect entries | compact rendered preview | 6 | 14/14 resolved, 0 unresolved, 6 duplicate structured refs | 5 | 6 | Both | Needs product review to avoid bloat | Close Borders (Declaration_CloseBorders)<br>Embrace Symbiosis (Declaration_EmbraceCoralSymbiosis)<br>Coral Siphon (Declaration_FactionQuest_Aspect_Chapter06AStep02) |
| 4 | units | Faction references | one-line summary/card | 101 | 202/202 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Skyscale (Unit_Aspect_Giant)<br>Brightscale (Unit_Aspect_Giant_SpecializationA)<br>Scales of Balance (Unit_Aspect_Giant_SpecializationA_Upgraded) |
| 5 | tech | Faction references | one-line summary/card | 60 | 120/134 resolved, 14 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Asceticism (Aspect_Technology_00)<br>Foreign Affairs (Aspect_Technology_MinorFaction_Protectorate_00)<br>The Strength of Garin (KinOfSheredyn_Technology_04) |
| 6 | heroes | Faction references | one-line summary/card | 41 | 82/82 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Polemephon, the Steadfast (Hero_Aspect_Archer_0)<br>Mitoxus of Agora (Hero_Aspect_Archer_1)<br>Xenos (Hero_Aspect_Archer_2) |
| 7 | councilors | Faction references | one-line summary/card | 10 | 20/20 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Diogen, the Inquisitive (Notable_CityManagement_Event018_Reward)<br>Axios, the Possessed (Notable_EndGameNarrative_Event012_Puppet)<br>Rzeld (Notable_FactionQuest_KinOfSheredyn_Chapter03_Rzeld) |
| 8 | populations | Faction references | one-line summary/card | 6 | 12/14 resolved, 2 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Aspect (Population_Aspect)<br>Kin of Sheredyn (Population_KinOfSheredyn)<br>Last Lord (Population_LastLord) |
| 9 | factions | Unlock relationships | no action | 2 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 2 | 7 | Exporter/editorial | Needs exact exported unlock refs before UI work | Kin of Sheredyn (Faction_KinOfSheredyn)<br>Tahuk (Faction_Mukag) |
| 10 | actions | Facts only, no player-facing mechanics | no action | 87 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context | Army Steal Territory (ActionTypeArmyStealTerritory)<br>Banish Population From Settlement (ActionTypeBanishPopulationFromSettlement)<br>Boost Cultural Economic Gain (ActionTypeBoostCulturalEconomicGain) |

## Recommended Next 3 Implementation Candidates

1. Diplomatic Treaty -> related Status/effect entries: prototype only if a
   focused treaty review still shows player confusion after direct Effects
   text and related chips. Prefer one-line effect summaries over inline
   expansion.
2. Actions -> related Status/effect entries: review only the entries that
   already have useful mechanics sections. Most remaining Action gaps are
   exporter/editorial-owned.
3. Faction and other large-subject references: keep as one-line summaries
   or related chips unless browser QA proves a specific hub needs promotion.

Diplomatic Treaty -> Status/effect preview remains lower priority: the local
data is narrow, several treaties already have direct Effects text, and the
risk of repeating or bloating treaty pages is higher than for granted
Ability surfaces.

## Category And Subcategory Audit

### abilities

Entries: 336

Common facts: Category (336), Kind (336), Range (100), Target (100), Cost (92)

Common sections: Effects (307), Battle mechanics (108)

Common section item labels: Applies status (89), Shield formula (33), Effect values (27), Health formula (16), Damage formula (6)

Related targets: statuses (84), abilities (6)

Resolved-vs-unresolved related entries: 5 unresolved public/reference keys observed.

Duplicated structured relationships: 89 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 307/336 entries.

Facts-only/no mechanics entries: 25/336 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Combat / Ability | 148 | Unstable Vitality (UnitAbility_AutoDestroyArmy)<br>Blood Mending I (UnitAbility_BloodMending_1)<br>Blood Mending II (UnitAbility_BloodMending_2) |
| Tactical / Ability | 100 | Corruption Burst (UnitAbility_CorruptionBurst)<br>Scoped Shot I (UnitAbility_Hero_ActiveSkill_Equipment_01_1)<br>Scoped Shot II (UnitAbility_Hero_ActiveSkill_Equipment_01_2) |
| Passive / Ability | 88 | Vengeful Spirit (UnitAbility_AlwaysRetaliate)<br>Collateral Damage I (UnitAbility_Aoe_1)<br>Collateral Damage II (UnitAbility_Aoe_2) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | inline clarification | 37 | 168/174 resolved, 6 unresolved, 37 duplicate structured refs | 0 | 1 | None | Already covered for exact Ability prose mentions |
| Facts only, no player-facing mechanics | no action | 25 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### actions

Entries: 139

Common facts: Category (139), Kind (139), Action type (12), UI category (5)

Common sections: Action mechanics (52)

Common section item labels: Influence cost multiplier (31), Money cost multiplier (15), Production cost (12), Cooldown (6), Duration (5), Empire project cost (5), Influence cost (5), Money cost (4)

Related targets: modifiers (57), populations (5), statuses (3)

Resolved-vs-unresolved related entries: 72 unresolved public/reference keys observed.

Duplicated structured relationships: 10 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/139 entries.

Facts-only/no mechanics entries: 87/139 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Action | 74 | Absorb City (ActionTypeAbsorbCity)<br>Army Steal Territory (ActionTypeArmyStealTerritory)<br>Assimilation (ActionTypeAssimilation) |
| Faction Action | 39 | Aspect Build Coral Spore (FactionActionTypeAspect_BuildCoralSpore)<br>Kin Of Sheredyn Build Chosen (FactionActionTypeKinOfSheredyn_BuildChosen)<br>Kin Of Sheredyn Economy01 (FactionActionTypeKinOfSheredyn_Economy01) |
| Empire Action | 14 | Kin Of Sheredyn Economy01 (EmpireActionTypeKinOfSheredyn_Economy01)<br>Kin Of Sheredyn Economy02 (EmpireActionTypeKinOfSheredyn_Economy02)<br>Kin Of Sheredyn Military01 (EmpireActionTypeKinOfSheredyn_Military01) |
| Constructible Action | 7 | Camp Relocation (ConstructibleAction_CampRelocationCenter)<br>Raze District (ConstructibleAction_ForestPlantation)<br>Raze District (ConstructibleAction_RazeDistrict) |
| Terraforming Action | 5 | Terraformation Biome Sand Banks (ConstructibleAction_TerraformationBiomeSandBanks)<br>Terraformation Deplete (ConstructibleAction_TerraformationDeplete)<br>Terraformation Enrich (ConstructibleAction_TerraformationEnrich) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | compact rendered preview | 3 | 6/42 resolved, 36 unresolved, 3 duplicate structured refs | 6 | 5 | Both | Needs exporter/editorial context first |
| Facts only, no player-facing mechanics | no action | 87 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### counciloreffects

Entries: 42

Common facts: Kind (42), Role (42)

Common sections: Effects (39), Council appointment cost modifiers (6)

Common section item labels: Influence -50% (1), Production -10% (1), Production -15 (1), Production -20% (1), Production -30 (1), Research -20% (1)

Related targets: improvements (13)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 39/42 entries.

Facts-only/no mechanics entries: 0/42 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Councilor Effect | 42 | Chosen of the Eye (CouncilorEffect_Clergy06)<br>Dauntless (CouncilorEffect_Defense02)<br>Scout Adept (CouncilorEffect_Defense03) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### councilors

Entries: 43

Common facts: Councilor effect (43), Partner effect (43), Role (43), Faction (33)

Common sections: Effects (40)

Common section item labels: -

Related targets: counciloreffects (43), partnereffects (43), minorfactions (32), factions (10)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 86 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 40/43 entries.

Facts-only/no mechanics entries: 3/43 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 43 | Diogen, the Inquisitive (Notable_CityManagement_Event018_Reward)<br>Javal Requ (Notable_CollectibleEvent_004_JavalRequ)<br>Pyr Leru (Notable_CollectibleEvent_015_Pyr) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Faction references | one-line summary/card | 10 | 20/20 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |
| Facts only, no player-facing mechanics | no action | 3 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### diplomatictreaties

Entries: 22

Common facts: Bilateral (22), Category (22), Kind (22), Duration (13)

Common sections: Effects (8), Applied statuses (6)

Common section item labels: War declared (2), Closed Borders declared (1), Surrender accepted (1), Victim of the Coral Siphon Declaration (1), You declared an Unjustified War on me (1), You embraced Coral Symbiosis (1)

Related targets: statuses (7)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 7 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 8/22 entries.

Facts-only/no mechanics entries: 11/22 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| War / Diplomatic Treaty | 6 | Force Truce (Declaration_ForceTruce)<br>Justified War (Declaration_JustifiedWar)<br>Unjustified War (Declaration_UnjustifiedWar) |
| Beneficial Defense / Diplomatic Treaty | 5 | Embrace Symbiosis (Declaration_EmbraceCoralSymbiosis)<br>Open Borders (Declaration_OpenBorders)<br>Keep your Called (Declaration_SendCalledAway) |
| Beneficial Discovery / Diplomatic Treaty | 4 | Deeper Collaboration (Treaty_ConjoinedResearch)<br>Cartography Exchange (Treaty_MapExchange)<br>Shared Research (Treaty_SharedResearch) |
| Beneficial Society / Diplomatic Treaty | 2 | Immigration Policy (Treaty_ImmigrationCustoms)<br>Shared Victory (Treaty_SharedVictory) |
| Hostile Defense / Diplomatic Treaty | 2 | Close Borders (Declaration_CloseBorders)<br>Coral Siphon (Declaration_FactionQuest_Aspect_Chapter06AStep02) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | compact rendered preview | 6 | 14/14 resolved, 0 unresolved, 6 duplicate structured refs | 5 | 6 | Both | Needs product review to avoid bloat |
| Facts only, no player-facing mechanics | no action | 11 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### districts

Entries: 167

Common facts: Kind (167), Category (159), Tier (138)

Common sections: Effects (76), Extracted resource (66)

Common section item labels: Archite (3), Auric Coral (3), Crystal Cap (3), Darkhorn (3), Dragon Root (3), Dream Haze (3), Dustwater (3), Eradione (3)

Related targets: resources (66)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 66 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 76/167 entries.

Facts-only/no mechanics entries: 47/167 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Resource / District | 67 | [Luxury01] Klax Extractor (Extractor_Luxury01)<br>[Luxury01] Advanced Klax Extractor (Extractor_Luxury01_Tier2)<br>[Luxury01] Grand Klax Extractor (Extractor_Luxury01_Tier3) |
| City / District | 17 | Divined Monument (DistrictDefinition_District_Tier1_DivinePopMonument)<br>Advanced Divined Monument (DistrictDefinition_District_Tier2_DivinePopMonument)<br>Camp (District_Camp_CampCenter) |
| Military / District | 9 | Keep (District_Tier1_Military)<br>Advanced Keep (District_Tier2_Military)<br>Grand Keep (District_Tier3_Military) |
| Money / District | 9 | Merchant's House (District_Tier1_Money)<br>Advanced Merchant's House (District_Tier2_Money)<br>Grand Merchant's House (District_Tier3_Money) |
| Science / District | 9 | Laboratory (District_Tier1_Science)<br>Advanced Laboratory (District_Tier2_Science)<br>Grand Laboratory (District_Tier3_Science) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 47 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### equipment

Entries: 160

Common facts: Rarity (160), Slot (160), Tier (160), Type (160), Value (160), Access pool (159)

Common sections: Granted abilities (152), Effects (149)

Common section item labels: Heavy Strike (22), Defense Expert II (21), Ranged IV (16), Ranged V (13), Defense Expert I (9), Power Slash II (7), Ranged VI (7), Warmaster (7)

Related targets: abilities (281)

Resolved-vs-unresolved related entries: 26 unresolved public/reference keys observed.

Duplicated structured relationships: 307 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 149/160 entries.

Facts-only/no mechanics entries: 0/160 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 160 | Scions' Charm (Equipment_Accessory_01_Definition)<br>Saiadhan Crystal (Equipment_Accessory_02_Definition)<br>Crimson Wing Rune (Equipment_Accessory_03_Definition) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Granted abilities | compact rendered preview | 152 | 281/307 resolved, 26 unresolved, 307 duplicate structured refs | 0 | 1 | None | Already covered by current preview pattern |

### factions

Entries: 5

Common facts: Affinity (5)

Common sections: Effects (5), Identity (5), Traits (5), Unlocks (2)

Common section item labels: -

Related targets: units (32), tech (10), districts (6), populations (6), heroes (5), resources (1), statuses (1)

Resolved-vs-unresolved related entries: 10 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 5/5 entries.

Facts-only/no mechanics entries: 0/5 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 5 | Aspects (Faction_Aspect)<br>Kin of Sheredyn (Faction_KinOfSheredyn)<br>Last Lords (Faction_LastLord) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | one-line summary/card | 1 | 2/6 resolved, 4 unresolved, 0 duplicate structured refs | 6 | 5 | Both | Needs product review to avoid bloat |
| Unlock relationships | no action | 2 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 2 | 7 | Exporter/editorial | Needs exact exported unlock refs before UI work |

### heroes

Entries: 79

Common facts: Class (79), Faction (79)

Common sections: Stats (79), Granted abilities (19)

Common section item labels: Flying (16), Swarm (5), Battlefield Meds (1), Beastly Summoning (1), Blossoming Wisdom (1), Counterattacking Instincts (1), Innate Agility (1), Ranged Retaliation (1)

Related targets: factions (41), minorfactions (33), abilities (27)

Resolved-vs-unresolved related entries: 9 unresolved public/reference keys observed.

Duplicated structured relationships: 31 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/79 entries.

Facts-only/no mechanics entries: 0/79 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 79 | Chiolite (Elder_MinorFaction_Ametrine)<br>Slem (Elder_MinorFaction_Blackhammer)<br>Goarim (Elder_MinorFaction_DaughterOfBor) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Granted abilities | compact rendered preview | 19 | 27/31 resolved, 4 unresolved, 31 duplicate structured refs | 0 | 1 | None | Already covered by current preview pattern |
| Faction references | one-line summary/card | 41 | 82/82 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |

### improvements

Entries: 123

Common facts: Category (123), Kind (123)

Common sections: Effects (100)

Common section item labels: -

Related targets: -

Resolved-vs-unresolved related entries: 16 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 100/123 entries.

Facts-only/no mechanics entries: 23/123 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Military / Improvement | 19 | Military Efficiency (DistrictImprovement_City_Center_03)<br>Watchman's Bell (DistrictImprovement_Military_00)<br>Garrison (DistrictImprovement_Military_01) |
| Science / Improvement | 18 | Beacon of Science (DistrictImprovement_City_Center_01)<br>Hydracorn's Moonhollow (DistrictImprovement_MinorFaction_00)<br>Foundling Apothecary (DistrictImprovement_MinorFaction_04) |
| Money / Improvement | 15 | Dust Blasting (DistrictImprovement_City_Center_05)<br>Ochlings' Den (DistrictImprovement_MinorFaction_03)<br>Ametrine Arcade (DistrictImprovement_MinorFaction_12) |
| City / Improvement | 12 | Sanctity of Nature (DistrictImprovement_City_Center_00)<br>City Center VI (DistrictImprovement_City_Center_06)<br>City Center VII (DistrictImprovement_City_Center_07) |
| Industry / Improvement | 12 | Spire of Industry (DistrictImprovement_City_Center_02)<br>Builders' Quarters (DistrictImprovement_Industry_00)<br>Lumber Yard (DistrictImprovement_Industry_01) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 23 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### minorfactions

Entries: 16

Common facts: Disposition (16), Faction affinity (16), Kind (16)

Common sections: Associated content (16), Identity (15), Traits (15)

Common section item labels: -

Related targets: units (47), traits (30), populations (16)

Resolved-vs-unresolved related entries: 18 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/16 entries.

Facts-only/no mechanics entries: 0/16 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| MinorFaction | 16 | Ametrine (MinorFaction_Ametrine)<br>Blackhammers (MinorFaction_Blackhammer)<br>Daughters of Bor (MinorFaction_DaughterOfBor) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### modifiers

Entries: 250

Common facts: Affected cost (250), Category (250), Kind (250), Modifier (250)

Common sections: Bonus mechanics (250), Effects (1)

Common section item labels: Production -25% (17), Research -50% (8), Production -10% (7), Production -15% (7), Influence -25% (6), Research -20% (6), Buyout -20% (5), Buyout -25% (5)

Related targets: actions (57), improvements (52), tech (49), districts (38), units (8), diplomatictreaties (7), populations (1)

Resolved-vs-unresolved related entries: 74 unresolved public/reference keys observed.

Duplicated structured relationships: 353 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 1/250 entries.

Facts-only/no mechanics entries: 0/250 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Cost Modifier | 250 | Worldmending (ActionCostModifer_CloseRift_Decree_Discovery_02_00)<br>Close Rift turn cost -33% (ActionCostModifer_CloseRift_Decree_Discovery_07_00)<br>Bribe Village money cost -25% (ActionCostModifer_FactionQuest_LastLord_Chapter03B) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### partnereffects

Entries: 39

Common facts: Kind (39)

Common sections: Effects (39)

Common section item labels: -

Related targets: -

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 39/39 entries.

Facts-only/no mechanics entries: 0/39 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Partner Effect | 39 | Steady Heart (PartnerEffect_Ametrine_PartnerTrait01)<br>Physiological Insight (PartnerEffect_Archimedias_PartnerTrait)<br>Spoiled Rotten (PartnerEffect_Blackhammer_PartnerTrait01) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### populations

Entries: 26

Common facts: Base food cost (26), Custom faction availability (26), Default population (26), Type (26), Faction (24)

Common sections: Threshold rewards (25), Worker effects (23)

Common section item labels: At 15 population (24), At 5 population (24), At 30 population (23), At 3 population (1), At 6 population (1), At 9 population (1)

Related targets: improvements (19), minorfactions (16), factions (6), districts (1), units (1)

Resolved-vs-unresolved related entries: 2 unresolved public/reference keys observed.

Duplicated structured relationships: 67 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/26 entries.

Facts-only/no mechanics entries: 1/26 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 26 | Aspect (Population_Aspect)<br>Called Population (Population_Called)<br>Divine Population (Population_Divined) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Threshold reward targets | one-line summary/card | 25 | 64/66 resolved, 2 unresolved, 66 duplicate structured refs | 0 | 1 | None | Implemented in EWShop for resolved exact Population threshold refs; unresolved refs need exporter/editorial cleanup |
| Faction references | one-line summary/card | 6 | 12/14 resolved, 2 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |
| Facts only, no player-facing mechanics | no action | 1 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### resources

Entries: 24

Common facts: Kind (24), Type (24), Booster (16), Trade (2)

Common sections: Extractors (22), Effects (16)

Common section item labels: [Luxury01] Advanced Klax Extractor (1), [Luxury01] Grand Klax Extractor (1), [Luxury01] Klax Extractor (1), [Luxury02] Advanced Hydromiel Extractor (1), [Luxury02] Grand Hydromiel Extractor (1), [Luxury02] Hydromiel Extractor (1), [Luxury03] Advanced Orchidia Extractor (1), [Luxury03] Grand Orchidia Extractor (1)

Related targets: districts (66)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 66 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 16/24 entries.

Facts-only/no mechanics entries: 2/24 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Resource | 24 | Klax (Resource_Luxury01)<br>Hydromiel (Resource_Luxury02)<br>Orchidia (Resource_Luxury03) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 2 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### statuses

Entries: 337

Common facts: Category (337), Kind (337), Scope (337), Status type (270), Duration (220)

Common sections: Status mechanics (301), Effects (47), Linked cost modifier (1)

Common section item labels: Public Opinion (63), Public Opinion Of Other Gain (41), Approval (29), Defense (16), Focus (15), Damage bonus (12), Land Speed (12), Damage Bonus Flat (11)

Related targets: modifiers (1)

Resolved-vs-unresolved related entries: 337 unresolved public/reference keys observed.

Duplicated structured relationships: 1 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 47/337 entries.

Facts-only/no mechanics entries: 34/337 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Status | 337 | Hero Status Loss (HeroStatus_Loss)<br>Hero Status Necro Egg Carrier (HeroStatus_NecroEggCarrier)<br>Sarcophagus Carrier (HeroStatus_SarcophagusCarrier) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 34 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### tech

Entries: 133

Common facts: Era (133), Kind (133), Quadrant (133), Tier (133), Faction (60)

Common sections: Unlocks (107), Effects (97)

Common section item labels: Laboratory (3), Altar (2), Bridge (2), Collections Bureau (2), Customs Inspector (2), Dust Blasting (2), Farm (2), Forum (2)

Related targets: units (107), improvements (78), factions (60), tech (27), districts (20)

Resolved-vs-unresolved related entries: 8 unresolved public/reference keys observed.

Duplicated structured relationships: 213 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 97/133 entries.

Facts-only/no mechanics entries: 3/133 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Technology | 133 | Asceticism (Aspect_Technology_00)<br>Foreign Affairs (Aspect_Technology_MinorFaction_Protectorate_00)<br>The Strength of Garin (KinOfSheredyn_Technology_04) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Unlock relationships | one-line summary/card | 107 | 205/213 resolved, 8 unresolved, 213 duplicate structured refs | 0 | 1 | None | Implemented in EWShop for exact Tech Unlocks refs |
| Faction references | one-line summary/card | 60 | 120/134 resolved, 14 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |
| Facts only, no player-facing mechanics | no action | 3 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### traits

Entries: 30

Common facts: Category (30), Kind (30)

Common sections: Effects (28)

Common section item labels: -

Related targets: minorfactions (30)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 28/30 entries.

Facts-only/no mechanics entries: 2/30 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Protectorate / Trait | 30 | Chant of the Rocks (ProtectorateTrait_Ametrine_Trait01)<br>Chant of the Rocks (ProtectorateTrait_Ametrine_Trait02)<br>Fierce Independence (ProtectorateTrait_DaughterOfBor_Trait01) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 2 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### units

Entries: 156

Common facts: Class (156), Kind (156), Spawn type (156), Tier (156), Faction (154)

Common sections: Stats (156), Granted abilities (155)

Common section item labels: Ranged III (29), Flying (27), Aware (20), Defense Expert II (17), Defense Expert I (15), Ranged IV (14), Can't Retaliate (10), Cruel (9)

Related targets: abilities (377), units (232), factions (101), minorfactions (45)

Resolved-vs-unresolved related entries: 9 unresolved public/reference keys observed.

Duplicated structured relationships: 377 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/156 entries.

Facts-only/no mechanics entries: 0/156 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Unit | 156 | Skyscale (Unit_Aspect_Giant)<br>Brightscale (Unit_Aspect_Giant_SpecializationA)<br>Scales of Balance (Unit_Aspect_Giant_SpecializationA_Upgraded) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Granted abilities | compact rendered preview | 155 | 377/377 resolved, 0 unresolved, 377 duplicate structured refs | 0 | 1 | None | Already covered by current preview pattern |
| Faction references | one-line summary/card | 101 | 202/202 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |

## Ignore For Now

- Faction references as inline expansion. They are large encyclopedia subjects;
  keep them as one-line summaries/cards or related chips.
- Modifiers top-level navigation or broad modifier preview work. Modifiers are
  intentionally hidden from navigation and should stay exact-link targets.
- Traits -> granted Ability preview unless future data shows a high-value
  exact structured ability relationship.
- Tech unlock and Population exact threshold preview work except for browser
  QA regressions. Those exact-ref surfaces are already implemented.
- Diplomatic Treaty previews unless a focused browser review finds concrete
  treaty pages where direct Effects plus related chips still fail the player.
- Facts-only entries with no mechanics sections. Preview UI cannot manufacture
  missing player context.

## Ownership Split

EWShop-owned opportunities:

- Compact preview rows where exact structured refs are resolved and explain the
  current entry.
- One-line summary/card treatment for exact unlock targets where the player is
  choosing a plan, especially Tech unlocks.
- Suppressing duplicate related cards only when the same target is already
  shown in a local preview surface.

DB exporter/editorial blockers:

- Unresolved structured refs, especially Traits -> granted Abilities.
- Facts-only entries with no player-facing mechanics or context.
- Raw/internal text in public fields, tracked separately by the content-quality
  diagnostic and exporter/editorial handoff.

## Regenerate

From `frontend/`:

```bash
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```
