# Codex Preview-Surface Audit

Status: active diagnostic report
Generated: 2026-06-13
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

Already proven and covered: Ability -> applied Status inline links, Unit ->
granted Ability compact previews, and Equipment -> granted Ability compact
previews. Hero -> granted Ability compact previews are now also implemented for
resolved Ability refs; unresolved Hero ability refs remain exporter/editorial
follow-up rather than frontend inference work.

## Top 10 Candidate Ranking

| Rank | Source | Relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status | Examples |
| ---: | --- | --- | --- | ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | populations | Exact threshold reward targets | one-line summary/card | 16 | 16/16 unique exact targets resolved; remaining threshold rewards are text-only | 7 | 3 | EWShop | Candidate for exact reward-target summaries only | Daughter of Bor (Population_Minor_DaughterOfBor)<br>Demons of Pashm (Population_Minor_DemonsOfPashm)<br>Inferior Imitation (Population_Minor_Horatio) |
| 2 | factions | Related Status/effect entries | one-line summary/card | 1 | 2/4 resolved, 2 unresolved, 0 duplicate structured refs | 6 | 5 | Both | Needs product review to avoid bloat | Necrophages (Faction_Necrophage) |
| 3 | traits | Unlock relationships | one-line summary/card | 44 | 1/11 resolved, 10 unresolved, 11 duplicate structured refs | 5 | 4 | EWShop | Candidate after preview-surface product review | Harmonious Tactics (FactionTrait_Aspects_BattleAffinity)<br>Deadly Corals (FactionTrait_Aspects_Chapter05AStep01_FactionQuest)<br>Radiance (FactionTrait_Aspects_Chapter05AStep02_FactionQuest) |
| 4 | diplomatictreaties | Related Status/effect entries | compact rendered preview | 6 | 14/35 resolved, 21 unresolved, 0 duplicate structured refs | 5 | 6 | Both | Needs product review to avoid bloat | Close Borders (Declaration_CloseBorders)<br>Embrace Symbiosis (Declaration_EmbraceCoralSymbiosis)<br>Coral Siphon (Declaration_FactionQuest_Aspect_Chapter06AStep02) |
| 5 | quests | Faction references | one-line summary/card | 166 | 332/810 resolved, 478 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | The Great Dieback (FactionQuest_Aspect_Chapter01_Step01)<br>The Great Dieback (FactionQuest_Aspect_Chapter01_Step02)<br>Not of the Chorus (FactionQuest_Aspect_Chapter02_Step01) |
| 6 | units | Faction references | one-line summary/card | 101 | 202/202 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Skyscale (Unit_Aspect_Giant)<br>Brightscale (Unit_Aspect_Giant_SpecializationA)<br>Scales of Balance (Unit_Aspect_Giant_SpecializationA_Upgraded) |
| 7 | tech | Faction references | one-line summary/card | 60 | 120/122 resolved, 2 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Asceticism (Aspect_Technology_00)<br>Foreign Affairs (Aspect_Technology_MinorFaction_Protectorate_00)<br>The Strength of Garin (KinOfSheredyn_Technology_04) |
| 8 | heroes | Faction references | one-line summary/card | 41 | 82/82 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Polemephon, the Steadfast (Hero_Aspect_Archer_0)<br>Mitoxus of Agora (Hero_Aspect_Archer_1)<br>Xenos (Hero_Aspect_Archer_2) |
| 9 | councilors | Faction references | one-line summary/card | 10 | 20/20 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers | Diogen, the Inquisitive (Notable_CityManagement_Event018_Reward)<br>Axios, the Possessed (Notable_EndGameNarrative_Event012_Puppet)<br>Rzeld (Notable_FactionQuest_KinOfSheredyn_Chapter03_Rzeld) |

## Recommended Next Implementation Candidates

1. Populations -> exact threshold reward targets: light one-line summaries for
   the 16 exact resolved reward refs. This helps players compare minor faction
   and special population breakpoints without inferring links from text-only
   rewards.
2. Diplomatic Treaty -> related Status/effect entries: prototype only if a
   focused treaty review still shows player confusion after direct Effects
   text and related chips. Prefer one-line effect summaries over inline
   expansion.
3. Traits -> unlock relationships: review before implementation. Current
   exact-key coverage is thin, so this may become an exporter/editorial
   follow-up rather than EWShop UI work.

Diplomatic Treaty -> Status/effect preview remains lower priority: the local
data is narrow, several treaties already have direct Effects text, and the
risk of repeating or bloating treaty pages is higher than for granted
Ability surfaces.

## Category And Subcategory Audit

### abilities

Entries: 336

Common facts: Category (336), Kind (336), Range (100), Target (100), Cost (92)

Common sections: Effects (306), Battle mechanics (108)

Common section item labels: Applies status (89), Shield formula (33), Effect values (27), Health formula (16), Damage formula (6)

Related targets: statuses (84), abilities (6)

Resolved-vs-unresolved related entries: 5 unresolved public/reference keys observed.

Duplicated structured relationships: 89 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 306/336 entries.

Facts-only/no mechanics entries: 26/336 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Combat / Ability | 148 | Unstable Vitality (UnitAbility_AutoDestroyArmy)<br>Blood Mending I (UnitAbility_BloodMending_1)<br>Blood Mending II (UnitAbility_BloodMending_2) |
| Tactical / Ability | 100 | Corruption Burst (UnitAbility_CorruptionBurst)<br>Scoped Shot I (UnitAbility_Hero_ActiveSkill_Equipment_01_1)<br>Scoped Shot II (UnitAbility_Hero_ActiveSkill_Equipment_01_2) |
| Passive / Ability | 88 | Always Retaliate (UnitAbility_AlwaysRetaliate)<br>Collateral Damage I (UnitAbility_Aoe_1)<br>Collateral Damage II (UnitAbility_Aoe_2) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | inline clarification | 37 | 168/174 resolved, 6 unresolved, 37 duplicate structured refs | 0 | 1 | None | Already covered for exact Ability prose mentions |
| Facts only, no player-facing mechanics | no action | 26 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### actions

Entries: 139

Common facts: Category (139), Kind (139), Action type (12), UI category (5)

Common sections: Action mechanics (34), Cost modifiers (20)

Common section item labels: Influence cost multiplier (30), Money cost multiplier (15), Production cost (12), Cooldown (6), Duration (5), Empire project cost (5), Influence cost (5), Money cost (4)

Related targets: modifiers (56)

Resolved-vs-unresolved related entries: 72 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

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
| Facts only, no player-facing mechanics | no action | 87 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### councilors

Entries: 43

Common facts: Councilor effect (43), Partner effect (43), Role (43), Faction (33)

Common sections: Effects (40)

Common section item labels: -

Related targets: minorfactions (32), factions (10)

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

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

Common sections: Effects (8)

Common section item labels: -

Related targets: statuses (7)

Resolved-vs-unresolved related entries: 66 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 8/22 entries.

Facts-only/no mechanics entries: 14/22 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| War / Diplomatic Treaty | 6 | Force Truce (Declaration_ForceTruce)<br>Justified War (Declaration_JustifiedWar)<br>Unjustified War (Declaration_UnjustifiedWar) |
| Beneficial Defense / Diplomatic Treaty | 5 | Embrace Symbiosis (Declaration_EmbraceCoralSymbiosis)<br>Open Borders (Declaration_OpenBorders)<br>Keep your Called (Declaration_SendCalledAway) |
| Beneficial Discovery / Diplomatic Treaty | 4 | Deeper Collaboration (Treaty_ConjoinedResearch)<br>Cartography Exchange (Treaty_MapExchange)<br>Shared Research (Treaty_SharedResearch) |
| Beneficial Society / Diplomatic Treaty | 2 | Immigration Policy (Treaty_ImmigrationCustoms)<br>Shared Victory (Treaty_SharedVictory) |
| Hostile Defense / Diplomatic Treaty | 2 | Close Borders (Declaration_CloseBorders)<br>Coral Siphon (Declaration_FactionQuest_Aspect_Chapter06AStep02) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | compact rendered preview | 6 | 14/35 resolved, 21 unresolved, 0 duplicate structured refs | 5 | 6 | Both | Needs product review to avoid bloat |
| Facts only, no player-facing mechanics | no action | 14 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### districts

Entries: 167

Common facts: Kind (167), Category (159), Tier (138)

Common sections: Effects (76)

Common section item labels: -

Related targets: -

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 76/167 entries.

Facts-only/no mechanics entries: 91/167 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Resource / District | 67 | [Luxury01] Klax Extractor (Extractor_Luxury01)<br>[Luxury01] Advanced Klax Extractor (Extractor_Luxury01_Tier2)<br>[Luxury01] Grand Klax Extractor (Extractor_Luxury01_Tier3) |
| City / District | 17 | Divined Monument (DistrictDefinition_District_Tier1_DivinePopMonument)<br>Advanced Divined Monument (DistrictDefinition_District_Tier2_DivinePopMonument)<br>Camp (District_Camp_CampCenter) |
| Military / District | 9 | Keep (District_Tier1_Military)<br>Advanced Keep (District_Tier2_Military)<br>Grand Keep (District_Tier3_Military) |
| Money / District | 9 | Merchant's House (District_Tier1_Money)<br>Advanced Merchant's House (District_Tier2_Money)<br>Grand Merchant's House (District_Tier3_Money) |
| Science / District | 9 | Laboratory (District_Tier1_Science)<br>Advanced Laboratory (District_Tier2_Science)<br>Grand Laboratory (District_Tier3_Science) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 91 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### equipment

Entries: 159

Common facts: Access pool (159), Rarity (159), Slot (159), Tier (159), Type (159), Value (159)

Common sections: Granted abilities (151), Effects (149)

Common section item labels: Heavy Strike (22), Defense Expert II (21), Ranged IV (16), Ranged V (13), Defense Expert I (9), Power Slash II (7), Ranged VI (7), Warmaster (7)

Related targets: abilities (281)

Resolved-vs-unresolved related entries: 25 unresolved public/reference keys observed.

Duplicated structured relationships: 306 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 149/159 entries.

Facts-only/no mechanics entries: 0/159 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 159 | Scions' Charm (Equipment_Accessory_01_Definition)<br>Saiadhan Crystal (Equipment_Accessory_02_Definition)<br>Crimson Wing Rune (Equipment_Accessory_03_Definition) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Granted abilities | compact rendered preview | 151 | 281/306 resolved, 25 unresolved, 306 duplicate structured refs | 0 | 1 | None | Already covered by current preview pattern |

### factions

Entries: 5

Common facts: Affinity (5)

Common sections: Effects (5), Identity (5), Traits (5), Unlocks (2)

Common section item labels: -

Related targets: units (32), tech (9), populations (6), districts (5), heroes (5), statuses (1)

Resolved-vs-unresolved related entries: 9 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 5/5 entries.

Facts-only/no mechanics entries: 0/5 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 5 | Aspects (Faction_Aspect)<br>Kin of Sheredyn (Faction_KinOfSheredyn)<br>Last Lords (Faction_LastLord) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Related Status/effect entries | one-line summary/card | 1 | 2/4 resolved, 2 unresolved, 0 duplicate structured refs | 6 | 5 | Both | Needs product review to avoid bloat |
| Unlock relationships | no action | 2 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 2 | 7 | Exporter/editorial | Needs exact exported unlock refs before UI work |

### heroes

Entries: 79

Common facts: Class (79), Faction (79)

Common sections: Stats (79), Granted abilities (19)

Common section item labels: Flying (16), Evasive Maneuvers (5), Battlefield Meds (1), Beastly Summoning (1), Blossoming Wisdom (1), Counterattacking Instincts (1), Innate Agility (1), Ranged Retaliation (1)

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
| Granted abilities | compact rendered preview | 19 | 27/31 resolved, 4 unresolved, 31 duplicate structured refs | 0 | 1 | None | Implemented by current granted Ability preview pattern; unresolved refs remain exporter/editorial follow-up |
| Faction references | one-line summary/card | 41 | 82/82 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |

### improvements

Entries: 123

Common facts: Category (123), Kind (123)

Common sections: Effects (100)

Common section item labels: -

Related targets: -

Resolved-vs-unresolved related entries: 0 unresolved public/reference keys observed.

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

Related targets: units (47), traits (30), populations (16), quests (15)

Resolved-vs-unresolved related entries: 3 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 0/16 entries.

Facts-only/no mechanics entries: 0/16 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| MinorFaction | 16 | Ametrine (MinorFaction_Ametrine)<br>Blackhammers (MinorFaction_Blackhammer)<br>Daughters of Bor (MinorFaction_DaughterOfBor) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### modifiers

Entries: 249

Common facts: Affected cost (249), Category (249), Kind (249), Modifier (249)

Common sections: Bonus mechanics (249), Effects (1)

Common section item labels: Research -50% (26), Production -25% (23), Influence -50% (16), Influence -25% (15), Production -20% (8), Research -20% (8), Influence -100% (7), Money -25% (7)

Related targets: actions (56), improvements (52), tech (49), districts (37), units (8), diplomatictreaties (7), populations (1)

Resolved-vs-unresolved related entries: 75 unresolved public/reference keys observed.

Duplicated structured relationships: 248 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 1/249 entries.

Facts-only/no mechanics entries: 0/249 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Cost Modifier | 249 | Worldmending (ActionCostModifer_CloseRift_Decree_Discovery_02_00)<br>Turn -33% cost modifier (ActionCostModifer_CloseRift_Decree_Discovery_07_00)<br>Money -25% cost modifier (ActionCostModifer_FactionQuest_LastLord_Chapter03B) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |

### populations

Entries: 26

Common facts: Base food cost (26), Custom faction availability (26), Default population (26), Type (26), Faction (24)

Common sections: Threshold rewards (25), Worker effects (23)

Common section item labels: At 15 population (24), At 5 population (24), At 30 population (23), At 3 population (1), At 6 population (1), At 9 population (1)

Related targets: minorfactions (16), improvements (15), factions (6), units (1)

Resolved-vs-unresolved related entries: 1 unresolved public/reference keys observed.

Exact threshold reward targets: 16 unique resolved refs: 15 improvements and
1 unit. The remaining threshold rewards are text-only in the current export and
should stay plain in EWShop until exporter/editorial data supplies exact refs.

Duplicated structured relationships: the 16 exact threshold reward targets also
appear in public/reference keys and can repeat in Related Entries when surfaced
inline.

Direct Effects section coverage: 0/26 entries.

Facts-only/no mechanics entries: 1/26 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| (none) | 26 | Aspect (Population_Aspect)<br>Called Population (Population_Called)<br>Divine Population (Population_Divined) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Exact threshold reward targets | one-line summary/card | 16 | 16/16 unique exact targets resolved; text-only rewards remain unlinked | 7 | 3 | EWShop | Candidate for exact reward-target summaries only |
| Text-only threshold rewards | no action | 58 | No exact target refs in current export | 4 | 8 | Exporter/editorial | Frontend should not infer reward links from prose |
| Faction references | one-line summary/card | 6 | 12/12 resolved, 0 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |
| Facts only, no player-facing mechanics | no action | 1 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### quests

Entries: 292

Common facts: Category (292), Kind (292), Mandatory (231), Chapter (195), Faction (15), Key narrative beat (1)

Common sections: Objective (283), Choices (280), Requirements (85), Rewards (64), Effects (6)

Common section item labels: -

Related targets: quests (215), factions (166), equipment (85), tech (19), heroes (17), minorfactions (15), populations (7), abilities (6)

Resolved-vs-unresolved related entries: 492 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 6/292 entries.

Facts-only/no mechanics entries: 0/292 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| MajorFaction / Quest | 227 | The Great Dieback (FactionQuest_Aspect_Chapter01_Step01)<br>The Great Dieback (FactionQuest_Aspect_Chapter01_Step02)<br>Not of the Chorus (FactionQuest_Aspect_Chapter02_Step01) |
| MinorFaction / Quest | 31 | Night Terrors (MinorFaction_GenericQuest_01)<br>The Missing (MinorFaction_GenericQuest_02)<br>A Fine Feast (MinorFaction_GenericQuest_03) |
| Curiosity / Quest | 30 | A Bloody Trail (Collectible_Quest_001)<br>Trespassers! (Collectible_Quest_002)<br>Remains of the Ancients (Collectible_Quest_003) |
| EndGame / Quest | 4 | The Day of Reckoning (EndGameQuest_Event013)<br>The Day of Reckoning (EndGameQuest_GlorifyToElse01)<br>The Day of Reckoning (EndGameQuest_ImpressToElse01) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Faction references | one-line summary/card | 166 | 332/810 resolved, 478 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |

### statuses

Entries: 336

Common facts: Category (336), Kind (336), Duration (220)

Common sections: Status mechanics (301), Effects (47), Linked cost modifier (1)

Common section item labels: Public Opinion (63), Public Opinion Of Other Gain (41), Approval (29), Defense (16), Focus (15), Damage bonus (12), Land Speed (12), Damage Bonus Flat (11)

Related targets: modifiers (1)

Resolved-vs-unresolved related entries: 336 unresolved public/reference keys observed.

Duplicated structured relationships: 1 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 47/336 entries.

Facts-only/no mechanics entries: 33/336 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Status | 336 | Hero Status Loss (HeroStatus_Loss)<br>Hero Status Necro Egg Carrier (HeroStatus_NecroEggCarrier)<br>Sarcophagus Carrier (HeroStatus_SarcophagusCarrier) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Facts only, no player-facing mechanics | no action | 33 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### tech

Entries: 133

Common facts: Era (133), Kind (133), Quadrant (133), Tier (133), Faction (60)

Common sections: Effects (97), Unlocks (1)

Common section item labels: -

Related targets: units (107), factions (60), improvements (60), tech (15), districts (12)

Resolved-vs-unresolved related entries: 2 unresolved public/reference keys observed.

Duplicated structured relationships: 0 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 97/133 entries.

Facts-only/no mechanics entries: 36/133 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Technology | 133 | Asceticism (Aspect_Technology_00)<br>Foreign Affairs (Aspect_Technology_MinorFaction_Protectorate_00)<br>The Strength of Garin (KinOfSheredyn_Technology_04) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Unlock relationships | no action | 1 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 2 | 7 | Exporter/editorial | Needs exact exported unlock refs before UI work |
| Faction references | one-line summary/card | 60 | 120/122 resolved, 2 unresolved, 0 duplicate structured refs | 3 | 3 | EWShop | Usually already served by related-entry chips; avoid inline dossiers |
| Facts only, no player-facing mechanics | no action | 36 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### traits

Entries: 178

Common facts: Category (252), Kind (178), Cost (125), Required affinity (5)

Common sections: Effects (105), Unlocks (44), Granted abilities (9), Exclusions (3)

Common section item labels: Harmonious Tactics I (2), Illuminated Foes I (2), Aware (1), Beast Slayers (1), Gifts of the Fallen (1), Harmonious Tactics II (1), Illuminated Foes II (1), Stand United (1)

Related targets: minorfactions (30), traits (28), units (19), districts (10), tech (10), improvements (8), heroes (5), abilities (1)

Resolved-vs-unresolved related entries: 20 unresolved public/reference keys observed.

Duplicated structured relationships: 11 structured reference keys also appear in public/reference keys.

Direct Effects section coverage: 105/178 entries.

Facts-only/no mechanics entries: 48/178 entries.

| Useful subcategory | Entries | Example entries |
| --- | ---: | --- |
| Faction / Trait | 148 | Harmonious Tactics (FactionTrait_Aspects_BattleAffinity)<br>Saiadhan Spore (FactionTrait_Aspects_Chapter03Step01_FactionQuest)<br>Tendrils' Dance (FactionTrait_Aspects_Chapter03Step03A_FactionQuest) |
| Protectorate / Trait | 30 | Chant of the Rocks (ProtectorateTrait_Ametrine_Trait01)<br>Chant of the Rocks (ProtectorateTrait_Ametrine_Trait02)<br>Fierce Independence (ProtectorateTrait_DaughterOfBor_Trait01) |

| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| Granted abilities | no action | 9 | 1/11 resolved, 10 unresolved, 11 duplicate structured refs | 3 | 7 | Exporter/editorial | Blocked by unresolved Ability refs |
| Unlock relationships | one-line summary/card | 44 | 1/11 resolved, 10 unresolved, 11 duplicate structured refs | 5 | 4 | EWShop | Candidate after preview-surface product review |
| Facts only, no player-facing mechanics | no action | 48 | 0/0 resolved, 0 unresolved, 0 duplicate structured refs | 1 | 8 | Exporter/editorial | Preview UI cannot create missing player context |

### units

Entries: 156

Common facts: Class (156), Kind (156), Spawn type (156), Tier (156), Faction (153)

Common sections: Stats (156), Granted abilities (155)

Common section item labels: Ranged III (29), Flying (27), Aware (20), Defense Expert II (17), Defense Expert I (15), Ranged IV (14), Can't Retaliate (10), Cruel (9)

Related targets: abilities (377), units (226), factions (101), minorfactions (44)

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
- Traits -> granted Ability preview until exporter/editorial resolves more
  granted Ability keys. Current resolution is too low for a UI-first pass.
- Tech unlock previews until exact unlock target refs are exported in the
  Unlocks section. Current tech unlock text is useful but not linkable.
- Diplomatic Treaty previews unless a focused browser review finds concrete
  treaty pages where direct Effects plus related chips still fail the player.
- Facts-only entries with no mechanics sections. Preview UI cannot manufacture
  missing player context.

## Ownership Split

EWShop-owned opportunities:

- One-line summary/card treatment where exact structured refs are resolved and
  answer planning questions, especially exact Population threshold reward
  targets.
- Suppressing duplicate related cards only when the same target is already
  shown in a local preview surface.

DB exporter/editorial blockers:

- Unresolved structured refs, especially Traits -> granted Abilities and the
  remaining unresolved Hero granted Abilities.
- Facts-only entries with no player-facing mechanics or context.
- Raw/internal text in public fields, tracked separately by the content-quality
  diagnostic and exporter/editorial handoff.

## Regenerate

From `frontend/`:

```bash
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```
