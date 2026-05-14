# EWShop Importer and Exporter Handoff Investigation

Date: 2026-05-14

## Executive Summary

EWShop's current import posture is mostly coherent: raw imports intentionally hydrate only the typed app domains (`tech`, `districts`, `improvements`, `units`), while codex imports hydrate a generic encyclopedia graph for ten export kinds. Unsupported raw files are not failures; they are local evidence for possible future domains or exporter improvements.

The strongest EWShop-side work available now is narrow:

- Preserve enough tech unlock detail to avoid silently dropping 9 constructible-like unlocks that already have descriptor text in `ewshop_tech_export_0.78.json`.
- Improve diagnostics classification so expected/internal unit ability references do not crowd out real exporter gaps.
- Consider a bounded codex filtering/related-link fix for entries that exist locally but are filtered out as duplicate slugs or placeholder display names.
- Add focused tests around those behaviors before touching broader import architecture.

The strongest exporter handoff items are separate:

- Emit codex/raw entries for minor factions referenced as `MinorFaction_*`.
- Decide whether class/prototype/hero-tradition `UnitAbility_*` references should become real ability codex entries, be omitted from `referenceKeys`, or be marked internal.
- Emit stable domain metadata for non-building tech unlocks such as actions, converters, cost modifiers, influence/science/money gain mappers, terraformation actions, and empire progression effects.
- Emit canonical typed references, or at least consistent key shapes, so EWShop does not have to infer whether `District_Tier1_Food` is a prototype, a district key, or a display duplicate.

## Current Import Support Matrix

| Area | Supported kinds | Entry point | Notes |
| --- | --- | --- | --- |
| Raw exports | `tech`, `units`, `districts`, `improvements` | `/api/admin/import/techs`, `/units`, `/districts`, `/improvements`; startup `local-imports/exports/` | Exact `exportKind` dispatch. Unsupported raw files are skipped with a warning in startup import. |
| Codex exports | `abilities`, `councilors`, `districts`, `equipment`, `factions`, `heroes`, `improvements`, `populations`, `tech`, `units` | `/api/admin/import/codex`; startup `local-imports/codex/` | Generic `entries[]` shape only: `entryKey`, `displayName`, `descriptionLines`, `referenceKeys`. |
| Frontend admin bulk raw | `districts`, `improvements`, `units`, `techs` | `AdminImportPage.tsx` | Mirrors backend raw support. |
| Frontend admin bulk codex | Same ten codex kinds | `AdminImportPage.tsx` | Validates `exportKind` against the same allowed list. |
| Public codex API | Same ten codex kinds after filtering | `/api/codex` via `CodexFacadeImpl` | Uses `CodexFilterService`; filtered entries cannot be related-link targets. |

Relevant code evidence:

- `api/src/main/java/ewshop/api/controller/ImportAdminController.java`
- `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java`
- `facade/src/main/java/ewshop/facade/impl/CodexImportAdminFacadeImpl.java`
- `frontend/src/components/AdminImport/AdminImportPage.tsx`

## Local File Inventory

### Raw Exports

| File | `exportKind` | Top-level arrays | Imported by EWShop? | Codex sibling? |
| --- | --- | ---: | --- | --- |
| `ewshop_abilities_export_0.78.json` | `abilities` | `entries`: 357 | No | Yes |
| `ewshop_battle_abilities_export_0.78.json` | `battleAbilities` | `battleAbilities`: 210 | No | No |
| `ewshop_battle_skills_export_0.78.json` | `battleSkills` | `battleSkills`: 131 | No | No |
| `ewshop_descriptor_evaluations_export_0.78.json` | `descriptors` | `descriptorEvaluations`: 2322; `descriptorMappers`: 338 | No | No |
| `ewshop_districts_export_0.78.json` | `districts` | `districts`: 217 | Yes | Yes |
| `ewshop_heroes_export_0.78.json` | `heroes` | `units`: 79 | No | Yes |
| `ewshop_improvements_export_0.78.json` | `improvements` | `improvements`: 158 | Yes | Yes |
| `ewshop_populations_export_0.78.json` | `populations` | `populations`: 26 | No | Yes |
| `ewshop_tech_export_0.78.json` | `tech` | `techs`: 219 | Yes | Yes |
| `ewshop_units_export_0.78.json` | `units` | `units`: 159 | Yes | Yes |

### Codex Exports

| File | `exportKind` | Top-level arrays | Imported by EWShop? |
| --- | --- | ---: | --- |
| `ewshop_abilities_codex_export_0.78.json` | `abilities` | `entries`: 357 | Yes |
| `ewshop_councilors_codex_export_0.78.json` | `councilors` | `entries`: 47 | Yes |
| `ewshop_districts_codex_export_0.78.json` | `districts` | `entries`: 217 | Yes |
| `ewshop_equipment_codex_export_0.78.json` | `equipment` | `entries`: 159 | Yes |
| `ewshop_factions_codex_export_0.78.json` | `factions` | `entries`: 5 | Yes |
| `ewshop_heroes_codex_export_0.78.json` | `heroes` | `entries`: 79 | Yes |
| `ewshop_improvements_codex_export_0.78.json` | `improvements` | `entries`: 158 | Yes |
| `ewshop_populations_codex_export_0.78.json` | `populations` | `entries`: 26 | Yes |
| `ewshop_tech_codex_export_0.78.json` | `tech` | `entries`: 219 | Yes |
| `ewshop_units_codex_export_0.78.json` | `units` | `entries`: 159 | Yes |

## Importer and DTO Observations

Raw DTOs intentionally accept only a subset of each raw file:

- Tech import consumes keys, display/lore/hidden, era/quadrant, prereq keys, faction trait prerequisites, unlock type/category/element, and descriptor lines. It drops `descriptorKeys` and `descriptorLineKeys` after using descriptor lines to build tech description text. The response `TechUnlockDto` contains only `unlockType`, `unlockKey`, and `unlockCategory`.
- Unit import consumes faction, hero/chosen flags, evolution keys, class/attack skill, ability keys, and description lines. It explicitly accepts but drops `ownDescriptorKeys` and `descriptorKeys`.
- District import consumes key, display name, category, and description lines. It drops prototype and descriptor keys.
- Improvement import consumes key, display name, category, and description lines. It drops prototype, descriptor keys, and `constructibleKind`.
- Codex import is intentionally generic and only persists display/description/reference data.

This is mostly fine for the current app. The notable EWShop gap is tech unlock detail: raw tech unlocks already contain enough descriptor text for currently unresolvable constructible-like unlocks, but the public tech DTO cannot carry it to the frontend as a fallback.

## Frontend and Backend Usage

User-visible imported domains:

- Tech tree, tech tooltips, selected-tech sheets, and CSV export use raw imported `tech`, `districts`, `improvements`, and `units`.
- Tech unlock rendering resolves only `Constructible` and `Unit` unlocks through `resolveConstructibleUnlock`.
- Unit cards and unit sheets show ability chips only when the unit ability key resolves to a visible `abilities` codex entry.
- Codex search/detail/related entries use the public `/api/codex` result, not every imported codex row. Public filtering removes invalid display names, weak descriptions, and duplicate slugs.
- SEO generation uses the same filtered codex candidates, so filtered entries also disappear as SEO related-link targets.

Important files:

- `frontend/src/utils/unlocks.ts`
- `frontend/src/components/Tooltips/TechTooltip.tsx`
- `frontend/src/components/Tech/views/UnlockLine.tsx`
- `frontend/src/components/Units/UnitCard/UnitCard.tsx`
- `frontend/src/components/Tech/views/UnitSheetView.tsx`
- `frontend/src/stores/codexStore.ts`
- `domain/src/main/java/ewshop/domain/service/CodexFilterService.java`
- `app/src/main/java/ewshop/app/seo/audit/CodexMissingReferenceAuditService.java`

## Diagnostics and Missing-Reference Evidence

Local codex files contain 1426 entries. Applying the backend public codex filter leaves 1218 included entries and filters out:

- `duplicate-slug`: 124
- `invalid-display-name`: 81
- `weak-description-lines`: 3

On the public-codex/SEO view:

- Reference keys scanned: 2426
- Resolved references: 1306
- Unresolved references: 1120
- Resolution: 53.8%
- Unresolved categories: `UnitAbility` 1051, `MinorFaction` 50, `District` 10, `Technology` 4, `DistrictImprovement` 3, `Unit` 2

On the unfiltered local codex files:

- Reference keys scanned: 2514
- Resolved by raw entry key: 1450
- Unresolved: 1064
- Unique unresolved keys: 40
- Unresolved references by source kind: `heroes` 548, `units` 454, `councilors` 35, `populations` 17, `factions` 5, `abilities` 3, `equipment` 1, `tech` 1

Tech unlock resolution evidence from raw `tech` plus currently imported raw domain files:

- Frontend-visible unlock candidates (`Constructible` or `Unit`): 259
- Resolved to current domain entries: 250
- Unresolved: 9

The 9 unresolved frontend-visible constructible-like unlocks are:

| Tech | Unlock key | Existing descriptor text? |
| --- | --- | --- |
| `Technology_CampTerraformation_00` | `ConstructibleAction_TerraformationEnrich` | Yes |
| `Technology_DistrictImprovement_Food_00` | `Converter_IndustryToFood` | Yes |
| `Aspect_Technology_DistrictImprovement_Money_01` | `Converter_IndustryToMoney` | Yes |
| `Technology_CampTerraformation_00_era3` | `ConstructibleAction_TerraformationEnrich` | Yes |
| `Technology_DistrictImprovement_Military_01` | `Converter_IndustryToApproval` | Yes |
| `Technology_DistrictImprovement_Money_01` | `Converter_IndustryToMoney` | Yes |
| `Technology_CampTerraformation_01` | `ConstructibleAction_TerraformationDeplete` | Yes |
| `Technology_CampTerraformation_02` | `ConstructibleAction_TerraformationNurture` | Yes |
| `Technology_DistrictImprovement_Science_04` | `Converter_IndustryToScience` | Yes |

These are not absent from the current raw tech file; they are absent from the typed constructible/unit domains EWShop uses for hoverable unlock links.

## Cross-Reference Findings

### 1. Unit ability references dominate missing codex links

The largest unresolved group is `UnitAbility_*`, especially from unit and hero codex reference keys. Seventeen ability keys are referenced by raw units/heroes but are absent from the raw abilities export and codex abilities export. Top examples:

- `UnitAbility_LandMovement`: 233 public unresolved references
- `UnitAbility_Class_BonusVsInfantry`: 83
- `UnitAbility_BreakRangedUnitDamage`: 81
- `UnitAbility_Class_BonusVsFlying`: 81
- `UnitAbility_Hero_ConstitutionTrad`: 78
- `UnitAbility_Hero_DexterityTrad`: 78
- `UnitAbility_Hero_IntellectTrad`: 78
- `UnitAbility_Hero_StrengthTrad`: 78

Classification: mostly exporter gap or intentional internal reference leakage. EWShop cannot import entries that are not present in either raw abilities or codex abilities. EWShop can improve diagnostic classification for class/prototype/hero tradition keys so they do not look like actionable missing pages.

### 2. Some ability entries exist but are filtered out

Examples:

- `UnitAbility_Fly` exists in codex abilities but is filtered as `duplicate-slug`.
- `UnitAbility_SeismicSlash` exists but is filtered as `duplicate-slug`.
- `UnitAbility_Infection` exists but is filtered as `duplicate-slug`.

Classification: EWShop filter/SEO/codex presentation gap. The raw data exists. The current duplicate-slug rule protects generated pages, but it also removes legitimate related-link targets from public codex.

### 3. Minor faction references are not backed by faction codex entries

`MinorFaction_*` keys appear in population raw/codex `factionKey` or `referenceKeys`, and in councilor reference keys, but they do not exist as codex entries. Examples include:

- `MinorFaction_Noquensii`
- `MinorFaction_TheConsortium`
- `MinorFaction_Ametrine`
- `MinorFaction_DaughterOfBor`
- `MinorFaction_GreenScion`
- `MinorFaction_HoyAndLadhran`
- `MinorFaction_Foundling`
- `MinorFaction_Oneiroi`
- `MinorFaction_Sollusk`
- `MinorFaction_UnseeingSeer`
- `MinorFaction_Xavius`

Classification: exporter gap. EWShop has only 5 major faction codex entries; minor factions are referenced but not exported as codex/faction entries.

### 4. District, technology, improvement, and unit references often exist but are filtered

Public unresolved examples that exist in current codex/raw data but are filtered:

- District keys such as `District_Tier1_Food`, `District_Tier2_Food`, and `District_Base_CityCenter_Tier4`
- Tech keys such as `Technology_District_Tier1_Industry` and `Technology_District_Tier1_Money`
- Improvement keys such as `DistrictImprovement_City_Center_08` and `DistrictImprovement_TradingPost_03`
- Unit key `Unit_MinorFaction_MangroveOfHarmony_Final`

Most of these are filtered because of duplicate display-name slugs or invalid/placeholder display names. This is not an importer absence. It is a public presentation/SEO filtering tradeoff.

### 5. Raw skipped files are useful evidence, but not all should become domains

- `ewshop_abilities_export_0.78.json` has richer ability metadata than codex (`battleAbilityKeys`, `battleSkillKeys`, `attackShapeKey`, visibility/class-tag fields), but it does not contain the biggest missing class/prototype ability keys.
- `battleAbilities` and `battleSkills` are detailed combat internals. They may support future ability tooltips, but importing them now would be a new domain with unclear user-facing payoff.
- `descriptorEvaluations` has broad descriptor text coverage and could help diagnostics/explanations, but it should not be casually promoted into a public domain.
- Raw `heroes` has unit-shaped data. EWShop already imports codex heroes, but it does not have a typed hero domain. There is not enough current evidence that a typed hero importer is the next best EWShop change.
- Raw `populations` is richer than codex populations, but current UI only consumes generic codex population entries.

## EWShop Work We Can Do Now

### P0: Preserve/render fallback text for unresolved constructible-like tech unlocks

Evidence: 9 `Constructible` unlocks are currently frontend-visible candidates but cannot resolve to district/improvement/unit records. Their raw tech unlocks already include useful descriptor lines.

Suggested bounded implementation:

- Add descriptor lines to the backend response `TechUnlockDto`, or add a deliberately named fallback field such as `descriptionLines`.
- Map it from `TechImportUnlockDto.descriptorLines`.
- In `TechTooltip`, `TechSheetView`, and spreadsheet export, render unresolved constructible-like unlocks as non-hoverable text rows instead of dropping them.
- Test `resolveConstructibleUnlock`/unlock rendering around unresolved but described constructible unlocks.

This does not require exporter changes.

### P1: Diagnose public codex links against filtered entries

Evidence: public codex/SEO reports unresolved refs whose targets exist in imported codex but are filtered for duplicate slug or invalid display name.

Suggested bounded implementation:

- Extend diagnostics to distinguish `absent-from-import` from `present-but-filtered`.
- Include filter reason in admin/SEO diagnostics for present-but-filtered targets.
- Decide separately whether public related links should be allowed to target filtered entries in-app, while SEO pages still avoid duplicate/thin pages.

### P1: Improve diagnostic classification for internal ability keys

Evidence: `UnitAbility_LandMovement`, class bonus keys, hero tradition keys, and prototype/class keys account for most unresolved reference volume but are not necessarily user-facing missing pages.

Suggested bounded implementation:

- Expand `codexDiagnosticClassification.ts` patterns and/or backend SEO category notes to bucket class/prototype/hero tradition ability keys as internal/mechanical unless exporter declares them public.
- Keep true missing user-facing ability names in a separate exporter-gap bucket.

### P1: Add tests around startup skip behavior and public codex filter impacts

The startup runner already skips unsupported raw files. Add/maintain tests that make this intentional behavior obvious for `abilities`, `battleAbilities`, `battleSkills`, `descriptors`, `heroes`, and `populations`.

### P3: Clean frontend/backend type drift

`frontend/src/types/dataTypes.ts` still types `Improvement` with `unique` and `cost`, while the backend response has `category` and `descriptionLines`. The current UI does not appear to rely heavily on `unique`/`cost`, but this is contract drift and should be cleaned in a small type-only pass.

## EWShop Work That Should Wait

- Do not add typed `abilities`, `battleAbilities`, `battleSkills`, `descriptors`, `heroes`, or `populations` domains only because raw files exist.
- Do not deep-refactor startup import orchestration, GameDataProvider, route hydration, share hydration, or tooltip timing as part of this work.
- Do not build public pages for descriptor/effect/tag/shape internals until the exporter can mark stable public/internal semantics.
- Do not implement minor faction pages in EWShop until exporter provides minor faction entries or a clear canonical source shape.
- Do not change the C# exporter in this EWShop session.

## Exporter Project Handoff Backlog

### P2: Emit minor faction codex entries

Problem: `MinorFaction_*` keys are referenced by councilors and populations but no codex entries exist. EWShop currently has only 5 major faction codex entries.

Evidence: public unresolved category `MinorFaction`: 50 references.

Requested exporter outcome:

- Add codex entries for minor factions with stable `entryKey`, display name, description, and relations to populations/heroes/councilors where available.
- Preserve canonical key spelling, including singular/plural forms such as `MinorFaction_TheConsortium` vs display "Consortium".

### P2: Decide public/internal policy for unit ability references

Problem: Unit and hero codex entries reference many `UnitAbility_*` keys that are not present in raw/codex ability exports.

Evidence: public unresolved category `UnitAbility`: 1051 references. Seventeen referenced ability keys are absent from the ability exports, including class bonus keys, hero tradition keys, and `UnitAbility_LandMovement`.

Requested exporter outcome:

- Either emit entries for these keys with display/description and a public/internal flag, or omit them from codex `referenceKeys` when they are purely mechanical.
- If they are internal, consider emitting a structured relationship field separate from public `referenceKeys`.
- If class/prototype keys are needed for UI grouping, emit category metadata so EWShop can classify them without regex-only inference.

### P2: Emit richer tech unlock domain metadata

Problem: Tech unlocks include actions, converters, cost modifiers, influence/science/money gain mappers, terraformation actions, and empire progression effects. EWShop can display descriptor text, but cannot link or classify them as stable domains.

Evidence: 332 non-descriptor raw tech unlocks; 82 do not resolve to current unit/district/improvement/ability data. Of the frontend-visible `Constructible`/`Unit` subset, 9 constructible-like unlocks are unresolved but have useful descriptor lines.

Requested exporter outcome:

- Add a stable `unlockDomain` or `constructibleKind` for converter/constructible-action unlocks.
- Emit display names for converter and terraformation constructibles instead of only keys like `Converter_IndustryToFood`.
- Keep descriptor lines, descriptor keys, and element keys together so EWShop can show both label and effect.

### P2: Emit canonical typed references

Problem: Current `referenceKeys` are raw keys. EWShop must infer kind from prefixes and exact entry-key matches, which breaks when a key is a prototype, duplicate slug, or filtered entry.

Requested exporter outcome:

- Prefer typed refs such as `{ kind, key }`, or string refs with stable kind prefix semantics.
- Avoid mixing prototype keys and entry keys in the same untyped array when possible.
- Emit a relationship reason/type where useful, for example `prerequisite`, `unlocks`, `belongsToFaction`, `usesAbility`, `prototypeOf`.

### P3: Separate raw ability metadata from codex text

Problem: Raw abilities contain richer combat metadata (`battleAbilityKeys`, `battleSkillKeys`, `attackShapeKey`), while codex abilities contain display-oriented text. EWShop should not invent a combat domain until exporter declares which fields are stable and public.

Requested exporter outcome:

- Document whether ability metadata is stable enough for typed import.
- Add visibility/public flags for battle abilities and battle skills.
- Preserve links from ability to battle ability/skill in a structured way.

## Prioritized Next Steps

| Priority | Owner | Recommendation |
| --- | --- | --- |
| P0 | EWShop | Preserve and render fallback descriptor text for the 9 unresolved constructible-like tech unlocks. |
| P1 | EWShop | Add diagnostics that split missing references into absent, present-but-filtered, and present-only-as-non-key. |
| P1 | EWShop | Expand internal ability diagnostic classification for class/prototype/hero-tradition refs. |
| P1 | EWShop | Add focused tests for import skip behavior and public codex filter impacts. |
| P2 | Exporter | Emit minor faction codex entries. |
| P2 | Exporter | Decide and encode public/internal policy for missing `UnitAbility_*` references. |
| P2 | Exporter | Emit richer typed tech unlock metadata for converters/actions/cost modifiers/empire effects. |
| P2 | Exporter | Emit canonical typed references or relationship objects. |
| P3 | EWShop | Clean frontend/backend `Improvement` type drift. |

## Open Questions

- Should public `/api/codex` remain SEO-filtered, or should the in-app codex receive a broader result set than generated SEO pages?
- Are class bonus and hero tradition abilities intended to be visible game concepts or internal mechanics?
- Should converter and terraformation unlocks become typed EWShop domains, or should they remain tech unlock fallback text?
- Should minor factions live under codex `factions`, a new codex `minorFactions` kind, or existing `populations` relationships?
- Should duplicate display-name codex entries get disambiguated slugs/labels from exporter metadata instead of being filtered by EWShop?
