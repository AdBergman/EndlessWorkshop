# Codex Relationship Value Gap Audit

Status: active generated diagnostic report
Generated: 2026-06-13
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
| 1 | Tech unlocks | What does this tech unlock? | 133 Tech entries; 80 have unlock-like related targets, but only 1 Unlocks section and 5 unlock-text entries. | DB exporter/editorial | Keep Tech top-level; add exact unlock refs before preview UI. |
| 2 | Major faction Population thresholds | What does this breakpoint reward actually unlock? | 74 threshold items; 16 exact unique refs are usable, 58 rewards remain text-only. | DB exporter/editorial | Keep Population top-level; EWShop can only summarize exact refs. |
| 3 | Extractor -> Resource | Which resource does this extractor produce? | 67 Resource-category extractor Districts; 0 resolved extractor refs; 0 Resource export entries. | DB exporter/backend/editorial | Keep Extractors under Districts; do not promote Resource Codex until entries exist. |
| 4 | Resource Codex surface | What does this resource do? | Resource tokens/icons exist in text, but no standalone Resource Codex export/category exists. | DB exporter/backend/product | Wait for Resource entities before EWShop creates resource pages. |
| 5 | Thin Actions | What does this action do and when should I use it? | 139 Actions; 87 have only facts and no public description/mechanics section. | DB exporter/editorial | Keep exact-link/search targets; avoid promoting thin Actions as rich browse content. |
| 6 | Action cost/mechanic context | Why is this cost modifier relevant? | 52 Actions have sections, mostly cost modifiers or formula notes. | Both | Exporter summaries first; EWShop can later group/highlight useful mechanics. |
| 7 | Diplomatic Treaty impact | What changes when I sign or declare this? | 22 Treaties; 8 direct Effects, 6 Status refs, 3 with both, 11 with neither. | Both | Keep browseable; preview only exact Status refs after product review. |
| 8 | Treaty placeholder/unfinished text | What tribute/cost/status is involved? | Some treaty text is incomplete, especially surrender tribute prose. | DB exporter/editorial | Fix public prose/data before EWShop polish. |
| 9 | Status grouping | Which statuses are combat, city, empire, public opinion, or hero effects? | 336 derived Status entries; 303 have mechanics, 31 are thin, and current subcategory is Status. | DB exporter/editorial, then EWShop | Keep Status top-level; add exported sub-kind before grouping redesign. |
| 10 | Thin browse rows | Why should I click or compare this entry? | actions: 87/139 thin (Army Steal Territory (ActionTypeArmyStealTerritory)<br>Banish Population From Settlement (ActionTypeBanishPopulationFromSettlement)<br>Boost Cultural Economic Gain (ActionTypeBoostCulturalEconomicGain)); districts: 85/167 thin (Temporary Bridge (District_Bridge)<br>Camp (District_Camp_BeforeCamp)<br>Dam (District_Dam)); improvements: 23/123 thin (Pile House (DistrictImprovement_Bridge_01)<br>Sentry Scopes (DistrictImprovement_Bridge_02)<br>Mirrored Defenses (DistrictImprovement_Bridge_03)); statuses: 31/336 thin (Hero Status Loss (HeroStatus_Loss)<br>Status Administrative Center Subjugation (Status_AdministrativeCenter_Subjugation)<br>Immobile (Status_Army_Map_Speed_Immobile)); abilities: 20/336 thin (Blossom I (UnitAbility_Blossom_1)<br>Blossom II (UnitAbility_Blossom_2)<br>Deft Accessorizer (UnitAbility_Hero_Aspect03)) | DB exporter/editorial | Valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces. |

## Area Reviews

### 1. Tech Unlocks

Player question blocked: "If I research this, what new unit, district, improvement, action, or mechanic becomes available?"

Current data shape: 133 Tech entries; 80 have unlock-like related targets, 1 have an Unlocks section, and 5 contain unlock text. Related entries cannot safely distinguish unlocked targets from broad context.

Good or partially useful examples:
- Choral Amplifier (Aspect_Technology_Unit_Specialization_00) references several Unit targets.
- Keystones (Technology_District_Tier1_Bridge_00) references Bridge but lacks an explanatory Unlocks section.

Blocked examples:
- Deciphering Stone (Mukag_Technology_03) says "Unlocks an evolution of the Observatory" but lacks an exact unlock target ref.
- Observatory-like targets exist elsewhere (Build Observatory (ActionTypeBuildObservatory), Observatory Point (DistrictImprovement_Science_01)), but EWShop must not infer the link.

Missing exact refs or entity category: exact Unlocks section item refs and optional unlock type/classification.
EWShop frontend opportunity: one-line unlock summaries after exact refs exist.
DB exporter/editorial request: export exact unlock target refs inside Tech Unlocks sections.
Product treatment: keep top-level browseable; wait for exporter data before new preview surfaces.

### 2. Population Thresholds

Current data shape: 26 Population entries; 74 threshold items; 16 exact unique threshold refs; 58 text-only threshold rewards.

Good entries already suitable for EWShop:
- Daughter of Bor (Population_Minor_DaughterOfBor) resolves At 5 population to Bor’s Sparring Ring (DistrictImprovement_MinorFaction_06).
- Inferior Imitation (Population_Minor_Horatio) resolves At 5 population to Horatio Clone (Unit_HoratioBeta).

Major faction blocker confirmed on 2026-06-13: major faction Population
threshold rewards do not currently have a safe exact frontend resolver. Their
threshold items contain text reward names only, with no threshold item
`referenceKey`, no reward fact `referenceKey`, no `descriptionLineKeys`, and no
`descriptorKeys`. Their population-level `referenceKeys` and
`publicContextKeys` point to the owning faction, not the threshold reward
target.

Safe EWShop resolver rule:

- resolve a threshold reward only when `sections[].items[].referenceKey` points
  to an exact Codex `entryKey`; or
- resolve a threshold reward only when the Reward fact has `referenceKey`
  pointing to an exact Codex `entryKey`.

Text-only reward names must remain plain. EWShop must not match by display name,
fuzzy text, or prose.

Blocked major faction examples:

- Aspect (Population_Aspect) says "Nutrient Extractor"; no exact target ref is
  exported and no matching Codex entry exists in current local imports.
- Kin of Sheredyn (Population_KinOfSheredyn) says "Military Press"; Military
  Press (KinOfSheredyn_DistrictImprovement_01) exists but is currently
  display-name-only from the threshold reward.
- Last Lord (Population_LastLord) says "Altar of Channeling"; Altar of
  Channeling (LastLord_DistrictImprovement_03) exists but is currently
  display-name-only from the threshold reward.
- Necrophage (Population_Necrophage) says "Larval Pulp"; Larval Pulp
  (Necrophage_DistrictImprovement_01) exists but is currently display-name-only
  from the threshold reward.
- Tahuk (Population_Mukag) says "Astronomy Club"; Astronomy Club
  (Mukag_DistrictImprovement_06) exists but is currently display-name-only from
  the threshold reward.

Desired exporter shape, matching the working minor/special population model:

```json
{
  "label": "At 5 population",
  "referenceKey": "DistrictImprovement_MinorFaction_06",
  "facts": [
    {
      "label": "Reward",
      "value": "Bor’s Sparring Ring",
      "referenceKey": "DistrictImprovement_MinorFaction_06"
    }
  ]
}
```

EWShop frontend opportunity: already scoped to exact refs only; no prose inference.
DB exporter/editorial request: add exact threshold reward refs on the threshold item and/or Reward fact where real targets exist.
Product treatment: keep Population top-level; exact refs can be previewed, text-only rewards wait for exporter data.

### 3. Extractors And Resources

Current data shape: 67 Extractor entries appear as Districts with category Resource; 0 resolved extractor refs; 0 Resource export/category entries.

Good entries:
- [Luxury01] Klax Extractor (Extractor_Luxury01) has Effects for Klax production and stock capacity.

Low-value/thin entries:
- [Luxury01] Advanced Klax Extractor (Extractor_Luxury01_Tier2) has no Effects lines.

Missing exact refs or entity category: Resource entities, Extractor -> Resource refs, and optional Resource -> Extractor reverse refs.
EWShop frontend opportunity: none until Resource entries or exact refs exist.
DB exporter/backend/editorial request: export Resource Codex entries or a backend-supported resource category, then connect extractors with exact refs.
Product treatment: keep Extractors as District entries; do not promote Resource Codex surfaces until data exists.

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

Current data shape: EWShop derives 336 Status entries from bonuses; 303 have mechanics; 31 are thin; current subcategory grouping is Status (336).

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
- Districts: 85/167 thin (Temporary Bridge (District_Bridge)<br>Camp (District_Camp_BeforeCamp)<br>Dam (District_Dam)).
- Improvements: 23/123 thin (Pile House (DistrictImprovement_Bridge_01)<br>Sentry Scopes (DistrictImprovement_Bridge_02)<br>Mirrored Defenses (DistrictImprovement_Bridge_03)).
- Abilities: 20/336 thin (Blossom I (UnitAbility_Blossom_1)<br>Blossom II (UnitAbility_Blossom_2)<br>Deft Accessorizer (UnitAbility_Hero_Aspect03)).
- Statuses: 31/336 thin (Hero Status Loss (HeroStatus_Loss)<br>Status Administrative Center Subjugation (Status_AdministrativeCenter_Subjugation)<br>Immobile (Status_Army_Map_Speed_Immobile)).

EWShop frontend opportunity: none for missing mechanics. EWShop can avoid over-promoting thin rows, but it should not create placeholder gameplay text.
DB exporter/editorial request: add minimal public mechanics summaries where entries are intended browse destinations.
Product treatment: valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces.

## Top 5 DB Exporter / Backend / Editorial Requests

1. Export exact Tech Unlocks section refs for Units, Districts, Improvements, Actions, Traits, and upgrades.
2. Export exact Population threshold reward refs for major faction and other text-only rewards where targets already exist.
3. Add Resource Codex entities or a backend-supported resource category, then link Extractors to Resources.
4. Add concise gameplay summaries and affected-target refs for thin Actions.
5. Add direct Effects summaries and fix incomplete public text for Diplomatic Treaties, especially surrender/tribute entries.

## Top 5 EWShop Frontend Opportunities

1. Tech unlock summaries after exact Unlock refs exist.
2. Treaty -> Status preview prototype for exact high-value Status refs, limited to pages where prose does not already answer the question.
3. Status grouping/filtering after exporter provides Status sub-kind/scope.
4. Extractor -> Resource summaries after Resource entries and exact refs exist.
5. Continue suppressing duplicate Related Entries only when a local exact-ref preview already shows the target.

No immediate frontend-only UI change is recommended from this audit. The remaining high-value work is mostly exporter/editorial data shape.

## Demote Or Avoid Promoting While Thin

- Generic thin Actions: keep searchable/linkable; avoid treating them as rich top-level browse destinations until summaries exist.
- Advanced/Grand Extractor entries with no Effects: keep under Districts; do not present as Resource pages.
- Resource Codex category: do not create or promote until actual Resource entries exist.
- Tech Unlock preview work: wait for exact Unlock refs.
- Broad Status grouping redesign: wait for exported sub-kind/scope.
- Diplomatic Treaty preview expansion: avoid broad prototype; many pages need editorial Effects first.

## Suggested Next Path

Prepare an exporter/editorial handoff from this report, focused on exact Tech
Unlock refs, Population threshold refs, Resource entities/Extractor refs, and
thin Action/Treaty gameplay summaries.

EWShop should pause new preview-surface UI until one of those exact-ref data
improvements lands, except for small bug fixes or browser QA regressions.

## Regenerate

From `frontend/`:

```bash
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
```
