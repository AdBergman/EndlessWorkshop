# Codex Relationship Value Gap Audit

Status: active generated diagnostic report
Generated: current script run
Source: current local Codex imports in `local-imports/codex/`

## Purpose

This report identifies player-important Codex relationships that are currently
missing, text-only, unresolved, or not linkable. It is not a UI
implementation plan, generic renderer proposal, exporter contract change, SEO
plan, or diagnostic framework.

EWShop should continue to use exact exported refs, `referenceKeys`,
`publicContextKeys`, facts, and sections. It should not infer links from prose.

## Top 10 Relationship And Value Gaps

| Rank | Area | Player question blocked | Current data shape | Owner | Product treatment |
| ---: | --- | --- | --- | --- | --- |
| 1 | Tech unlocks | What does this tech unlock? | 133 Tech entries; 107 have Unlocks sections; 195/203 unique Unlock refs resolve; 107 have unlock text. | Exporter/editorial for unresolved or text-only unlocks; EWShop exact-ref summaries are implemented | Keep Tech top-level; exact Unlock summaries are implemented for resolved refs only. |
| 2 | Major faction Population thresholds | What does this breakpoint reward actually unlock? | 74 threshold items; 22 exact unique refs are usable, 52 rewards remain text-only. | DB exporter/editorial for text-only rewards; EWShop exact-ref summaries are implemented | Keep Population top-level; exact threshold summaries are implemented for resolved refs only. |
| 3 | Extractor -> Resource | Which resource does this extractor produce? | 67 Resource-category extractor Districts; 132 resolved extractor refs; 24 Resource export entries. | EWShop/product, with exporter/editorial for thin entries | Keep Extractors under Districts; Resources are top-level shallow reference entries. |
| 4 | Resource Codex surface | What does this resource do? | 24 Resource export entries; 16 have direct Effects; 2 are facts-only/thin. | EWShop/product, with exporter/editorial for thin entries | Resources are top-level shallow reference entries; thin entries need exporter/editorial context. |
| 5 | Thin Actions | What does this action do and when should I use it? | 139 Actions; 87 have only facts and no public description/mechanics section. | DB exporter/editorial | Keep exact-link/search targets; avoid promoting thin Actions as rich browse content. |
| 6 | Action cost/mechanic context | Why is this cost modifier relevant? | 52 Actions have sections, mostly cost modifiers or formula notes. | Both | Exporter summaries first; EWShop can later group/highlight useful mechanics. |
| 7 | Diplomatic Treaty impact | What changes when I sign or declare this? | 22 Treaties; 8 direct Effects, 6 Status refs, 3 with both, 11 with neither. | Both | Keep browseable; preview only exact Status refs after product review. |
| 8 | Treaty placeholder/unfinished text | What tribute/cost/status is involved? | Some treaty text is incomplete, especially surrender tribute prose. | DB exporter/editorial | Fix public prose/data before EWShop polish. |
| 9 | Status grouping | Which statuses are combat, city, empire, public opinion, or hero effects? | 337 derived Status entries; 303 have mechanics, 32 are thin, and current subcategory is Status. | DB exporter/editorial, then EWShop | Keep Status top-level; add exported sub-kind before grouping redesign. |
| 10 | Thin browse rows | Why should I click or compare this entry? | actions: 87/139 thin (Army Steal Territory (ActionTypeArmyStealTerritory)<br>Banish Population From Settlement (ActionTypeBanishPopulationFromSettlement)<br>Boost Cultural Economic Gain (ActionTypeBoostCulturalEconomicGain)); districts: 41/167 thin (Temporary Bridge (District_Bridge)<br>Camp (District_Camp_BeforeCamp)<br>Dam (District_Dam)); improvements: 23/123 thin (Pile House (DistrictImprovement_Bridge_01)<br>Sentry Scopes (DistrictImprovement_Bridge_02)<br>Mirrored Defenses (DistrictImprovement_Bridge_03)); statuses: 32/337 thin (Hero Status Loss (HeroStatus_Loss)<br>Status Administrative Center Subjugation (Status_AdministrativeCenter_Subjugation)<br>Immobile (Status_Army_Map_Speed_Immobile)); resources: 2/24 thin (Corpses (Resource_Specific_Corpse)<br>Fallen Spirit (Resource_Specific_Spirit)); abilities: 19/336 thin (Vengeful Spirit (UnitAbility_AlwaysRetaliate)<br>Blossom I (UnitAbility_Blossom_1)<br>Blossom II (UnitAbility_Blossom_2)); diplomaticTreaties: 1/22 thin (Surrender Demand (Treaty_AskToSurrender)) | DB exporter/editorial | Valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces. |

## Area Reviews

### 1. Tech Unlocks

Player question blocked: "If I research this, what new unit, district, improvement, action, or mechanic becomes available?"

Current data shape: 133 Tech entries; 100 have unlock-like related targets, 107 have an Unlocks section, 195/203 unique Unlock refs resolve, and 107 contain unlock text.

Good or partially useful examples:
- Choral Amplifier (Aspect_Technology_Unit_Specialization_00) references several Unit targets.
- Keystones (Technology_District_Tier1_Bridge_00) references Bridge but lacks an explanatory Unlocks section.

Blocked examples:
- Deciphering Stone (Mukag_Technology_03) says "Unlocks an evolution of the Observatory" but lacks an exact unlock target ref.
- Observatory-like targets exist elsewhere (Build Observatory (ActionTypeBuildObservatory), Observatory Point (DistrictImprovement_Science_01)), but EWShop must not infer the link.

Remaining exact-ref gap: unresolved or text-only Unlock targets and optional unlock type/classification.
EWShop status: one-line summaries for exact resolved Unlock refs are implemented.
DB exporter/editorial request: fill unresolved or text-only Unlock refs where public targets exist.
Product treatment: keep top-level browseable; do not infer unresolved unlocks from prose.

### 2. Population Thresholds

Current data shape: 26 Population entries; 74 threshold items; 22 exact unique threshold refs; 52 text-only threshold rewards.

Good entries already suitable for EWShop:
- Daughter of Bor (Population_Minor_DaughterOfBor) resolves At 5 population to Bor’s Sparring Ring (DistrictImprovement_MinorFaction_06).
- Inferior Imitation (Population_Minor_Horatio) resolves At 5 population to Horatio Clone (Unit_HoratioBeta).

Blocked examples:
- Aspect (Population_Aspect) says "Nutrient Extractor" but has no exact target ref.
- Kin of Sheredyn (Population_KinOfSheredyn) says "Military Press"; Military Press (KinOfSheredyn_DistrictImprovement_01) exists but is not linked from the threshold item.
- Last Lord (Population_LastLord) says "Altar of Channeling"; Altar of Channeling (LastLord_DistrictImprovement_03) exists but is not linked from the threshold item.

EWShop status: one-line threshold summaries for exact resolved reward refs are implemented.
DB exporter/editorial request: add exact threshold reward refs where real targets exist.
Product treatment: keep Population top-level; exact refs can be previewed, text-only rewards wait for exporter data.

### 3. Extractors And Resources

Current data shape: 67 Extractor entries appear as Districts with category Resource; 132 resolved extractor refs; 24 Resource export/category entries.

Good entries:
- [Luxury01] Klax Extractor (Extractor_Luxury01) has Effects for Klax production and stock capacity.

Low-value/thin entries:
- [Luxury01] Advanced Klax Extractor (Extractor_Luxury01_Tier2) has no Effects lines.

Resolved exact refs or entity category: Resource entries now exist, Extractor -> Resource refs resolve, and Resource -> Extractor reverse refs are present.
EWShop status: Resources are top-level shallow reference entries and Extractor/Resource exact links are surfaced.
DB exporter/editorial request: fill thin Resource/Extractor entries where players need effect context.
Product treatment: keep Extractors as District entries; keep Resource rows dense and shallow rather than dossier-like.

### 4. Actions

Current data shape: 139 Action entries; 52 have sections; 87 are facts-only; no Actions have descriptionLines in the current import.

Good or partially useful examples:
- Absorb City (ActionTypeAbsorbCity) has a Cost modifiers section.
- Close Rift (ActionTypeCloseRift) has Turn cost modifiers.
- Raze District (ConstructibleAction_RazeDistrict) has Action mechanics and a Production cost item.

Low-value/thin examples:
- Build Observatory (ActionTypeBuildObservatory) is facts-only.
- Aspect Build Coral Spore (FactionActionTypeAspect_BuildCoralSpore) is facts-only.

Missing exact refs or entity category: player-facing purpose/availability summaries and exact affected-target refs.
EWShop frontend opportunity: after summaries exist, group/highlight useful cost and mechanics sections.
DB exporter/editorial request: add concise public gameplay summaries and exact affected-target refs.
Product treatment: keep searchable/linkable exact targets; avoid prominent browse promotion for thin generic Actions.

### 5. Diplomatic Treaties

Current data shape: 22 Diplomatic Treaty entries; 8 have direct Effects; 6 have related Status refs; 3 have both; 11 have neither.

Good entries:
- Shared Research (Treaty_SharedResearch) has a direct Effects section explaining Science bonuses and the 20% technology-cost interaction.
- Deeper Collaboration (Treaty_ConjoinedResearch) explains the extra Shared Research reduction.

Useful but preview-sensitive entries:
- Close Borders (Declaration_CloseBorders) has strong prose and a related Status ref, but no direct Effects section.

Low-value or incomplete examples:
- Surrender Demand (Treaty_AskToSurrender) has incomplete tribute text.
- Surrender Offer (Treaty_ProposeSurrender) has incomplete tribute text.
- Shared Victory (Treaty_SharedVictory) has useful prose but no Effects section or refs.

EWShop frontend opportunity: potential exact Status preview prototype only where prose does not already answer the question.
DB exporter/editorial request: add direct Effects summaries and fix incomplete public text.
Product treatment: keep Diplomatic Treaties browseable; avoid broad preview expansion.

### 6. Status Sub-Kinds

Current data shape: EWShop derives 337 Status entries from bonuses; 303 have mechanics; 32 are thin; current subcategory grouping is Status (337).

Good entries:
- Ahead in the Polls (Status_City_Approval_High) has player-facing Approval text and mechanics.

Low-value/thin examples:
- Hero Status Loss (HeroStatus_Loss) is thin.

Missing exact refs or entity category: exported Status sub-kind/scope, such as City, Army, Empire, Combat, Hero, Public Opinion, Map, or Treaty.
EWShop frontend opportunity: grouping/filtering after sub-kind appears.
DB exporter/editorial request: add player-facing sub-kind/scope and fill thin entries.
Product treatment: keep Status top-level; avoid broad grouping redesign until sub-kind data exists.

### 7. Thin Classification-Only Entries

Current data shape:
- Actions: 87/139 thin (Army Steal Territory (ActionTypeArmyStealTerritory)<br>Banish Population From Settlement (ActionTypeBanishPopulationFromSettlement)<br>Boost Cultural Economic Gain (ActionTypeBoostCulturalEconomicGain)).
- Districts: 41/167 thin (Temporary Bridge (District_Bridge)<br>Camp (District_Camp_BeforeCamp)<br>Dam (District_Dam)).
- Improvements: 23/123 thin (Pile House (DistrictImprovement_Bridge_01)<br>Sentry Scopes (DistrictImprovement_Bridge_02)<br>Mirrored Defenses (DistrictImprovement_Bridge_03)).
- Abilities: 19/336 thin (Vengeful Spirit (UnitAbility_AlwaysRetaliate)<br>Blossom I (UnitAbility_Blossom_1)<br>Blossom II (UnitAbility_Blossom_2)).
- Statuses: 32/337 thin (Hero Status Loss (HeroStatus_Loss)<br>Status Administrative Center Subjugation (Status_AdministrativeCenter_Subjugation)<br>Immobile (Status_Army_Map_Speed_Immobile)).
- Resources: 2/24 thin (Corpses (Resource_Specific_Corpse)<br>Fallen Spirit (Resource_Specific_Spirit)).

EWShop frontend opportunity: none for missing mechanics. EWShop can avoid over-promoting thin rows, but it should not create placeholder gameplay text.
DB exporter/editorial request: add minimal public mechanics summaries where entries are intended browse destinations.
Product treatment: valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces.

## Top 5 DB Exporter / Backend / Editorial Requests

1. Fill unresolved or text-only Tech Unlock refs where public targets exist.
2. Export exact Population threshold reward refs for major faction and other text-only rewards where targets already exist.
3. Fill thin Resource and Extractor entries where current facts do not explain player impact.
4. Add concise gameplay summaries and affected-target refs for thin Actions.
5. Add direct Effects summaries and fix incomplete public text for Diplomatic Treaties, especially surrender/tribute entries.

## Top 5 EWShop Frontend Opportunities

1. Browser-QA Population threshold summaries against current exact refs to catch regressions.
2. Review Diplomatic Treaty applied Status usefulness before any Treaty preview prototype.
3. Harden Quest Strategy Codex preview accessibility if keyboard or touch QA finds friction.
4. Browser-review Action mechanics presentation for entries that already have useful mechanics sections.
5. Continue keeping completed preview surfaces exact-ref-only and implementation-aware in diagnostics.

Use `docs/active/codex-current-audit-ticket-plan.md` for the current EWShop story order. No completed exact-ref surface should be reopened solely because it appears in relationship counts.

## Demote Or Avoid Promoting While Thin

- Generic thin Actions: keep searchable/linkable; avoid treating them as rich top-level browse destinations until summaries exist.
- Advanced/Grand Extractor entries with no Effects: keep under Districts or shallow Resource rows; do not invent missing mechanics.
- Resources: now top-level shallow references, not full dossier pages. Thin Resource rows remain exporter/editorial follow-up.
- Tech Unlock preview work: exact-ref summaries are implemented; never infer unresolved targets.
- Broad Status grouping redesign: wait for exported sub-kind/scope.
- Diplomatic Treaty preview expansion: avoid broad prototype; many pages need editorial Effects first.

## Suggested Next Path

Continue the EWShop loop from `docs/active/codex-current-audit-ticket-plan.md`.
The next implementation-backed checks are Population threshold summary browser QA,
Diplomatic Treaty applied Status usefulness review, Quest Strategy preview
accessibility, and Action mechanics browser review.

Exporter/editorial follow-up remains focused on unresolved/text-only Tech
Unlock refs, Population threshold refs, thin Resource/Extractor rows, and
thin Action/Treaty gameplay summaries.

## Regenerate

From `frontend/`:

```bash
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
```
