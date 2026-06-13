# EWShop Current Export Handoff

Status: ready for EWShop product/import review
Updated: 2026-06-13

## Purpose

This is the short handoff for the EWShop Spring Boot importer, API, and React
Vite frontend team.

EWShop does not need exporter implementation history to review the current
batch. The practical question is:

- can the JSON import cleanly;
- can the backend serve the records without migration;
- does the frontend show useful, player-facing Codex content;
- what should EWShop report back as remaining product/data quality gaps.

## Current Export Batch

Use the current generated export JSON files from the latest validated export.

Validated snapshot:

- `export-snapshots/bonuses-descriptor-target-correction-final-20260613`

Validation report:

- `export-reports/bonuses-descriptor-target-correction-final-20260613_validation.md`

Validation result:

- all registered export kinds passed with 0 errors;
- `bonuses-codex` passed with 0 errors and 0 warnings;
- `bonuses-codex-mechanics` passed with 0 errors;
- export completed with `succeeded=18`, `failed=0`.

## Import / Contract Notes

- No Codex root JSON shape changed.
- No `exportKind` values changed.
- No fields were removed or renamed.
- No EWShop importer migration is expected for this batch.
- Existing consumers can ignore optional `facts`, `sections`, and
  `publicContextKeys` if needed, but the frontend should prefer them when
  present.
- `descriptionLines` remain fallback display text.
- Rich exports remain canonical where they exist; Codex exports remain public
  projections for generic encyclopedia/search/detail pages.

## Important Frontend Display Notes

- Preserve square-bracket icon tokens such as `[FoodColored]`,
  `[IndustryColored]`, `[DustColored]`, `[ScienceColored]`, and
  `[PublicOrderColored]`. EWShop uses these to render SVG icons.
- Do not display diagnostics JSON as product Codex content.
- Runtime UI should prefer frontend-safe icon contracts such as
  `description-token-icons.json` and `ability-icons.json`.
- Bonus modifier rows may remain searchable/linkable even when not shown as
  top-level browsing categories.
- Do not infer gameplay relationships from prose if a stable exported key or
  `publicContextKeys` relationship exists.

## What Changed Recently

### Bonus Target Cleanup

Product bonuses Codex no longer exposes descriptor/tag source wording such as:

- `Constructibles matching descriptor`;
- `Constructible With Descriptor`;
- `Descriptor_*`;
- `Tag_*`;
- `UnitClass_*`;
- `Class_*`.

If a descriptor/tag-backed constructible target can be proven from public
constructible rows, the exporter emits public target labels. If it cannot be
proven, the target fact is omitted from product Codex and the unresolved
relationship is reported only in diagnostics.

Diagnostics from the latest export:

- `constructibleDescriptorTargetResolvedRows=43`;
- `constructibleDescriptorTargetUnresolvedRows=2`;
- `suppressedTechnicalReferences=4`.

These diagnostics are evidence for exporter follow-up only. They should not be
rendered in the React UI.

Known unresolved product examples now intentionally omit unproven target facts:

- `ConstructibleCostModifier_BridgeDistrictCostReduction_00`;
- `ConstructibleCostModifier_PopulationDistrictCostReduction_00`.

### Unit Ability / Retaliation Links

Unit and hero Codex now exposes public ability ownership through:

- `referenceKeys`;
- `publicContextKeys`;
- `sections[].title = "Granted abilities"`;
- `sections[].items[].referenceKey`.

Validated examples:

- `Unit_LastLord_Thrall` links to `UnitAbility_BreakRetaliate`;
- `Unit_Mukag_Ranged` links to `UnitAbility_Cumbersome`,
  `UnitAbility_NoRetaliate`, and `UnitAbility_Ranged_5`;
- `Unit_MinorFaction_Ochling` links to `UnitAbility_RangedRetaliate`;
- `Unit_Necrophage_Behemoth_SpecializationB` links to
  `UnitAbility_AlwaysRetaliate`.

### Broad Codex Content Quality

The exporter now provides broad structured Codex metadata across current
categories using the existing generic fields:

- `facts`;
- `sections`;
- `publicContextKeys`;
- `descriptionLines`.

The current work is no longer baseline metadata plumbing. Remaining work is
player-facing content quality: names, labels, readable effects, missing context,
and whether some thin rows should be displayed differently.

## What EWShop Should Review

1. Import the latest JSON batch into the Spring Boot app.
2. Confirm no backend importer migration is required.
3. Open the React/Vite Codex UI and review:
   - `actions`;
   - `bonuses` / status and modifier links;
   - `diplomaticTreaties`;
   - retaliation-related ability/unit pages;
   - districts/improvements/traits with formula-like effect text.
4. Identify what is still bad for end users:
   - generated names;
   - empty or thin cards;
   - formula text that needs clearer wording;
   - missing hard stats;
   - rows that should be hidden from top-level navigation;
   - category labels that should be display-mapped, such as
     `diplomaticTreaties` -> `Treaties`.

## React / Vite AI Review Instructions

If this handoff is given to an AI working in the EWShop frontend, ask it to:

1. Use the imported Codex API/data as the source of truth.
2. Review rendered Codex pages and category navigation, not exporter source.
3. Prefer exported structured fields over parsing `descriptionLines`.
4. Preserve icon tokens and existing SVG/icon rendering behavior.
5. Report bad player-facing output with `category`, `entryKey`, visible text,
   expected display, and whether the fix belongs to frontend display,
   backend/API import, or DBExporter data.
6. Avoid inventing missing game mechanics or replacing stable keys with labels.
7. Avoid treating diagnostics files as product content.

## Recommended EWShop Feedback Format

For each issue, send back:

- category;
- `entryKey`;
- current displayed text or screenshot;
- why it is bad for a player;
- expected public-facing behavior;
- whether EWShop thinks it is:
  - importer/API issue;
  - frontend display issue;
  - exporter data issue;
  - product/navigation decision.

## Recommended Next Decisions

Do not start more exporter work until EWShop reviews the current imported batch.

Likely next tickets, depending on EWShop feedback:

1. Actions thin-row quality:
   improve labels/descriptions/effects only where a cheap canonical source is
   proven.
2. Quest generic text:
   improve unresolved reward/requirement labels only where public labels are
   provable without expensive runtime probing.
3. Bonus/modifier editorial naming:
   polish generated cost-modifier display names and decide which modifier rows
   should be browsable versus link-only.
4. Category display mapping:
   EWShop-side presentation labels such as `diplomaticTreaties` -> `Treaties`.

## Extra Detail If Needed

Use these only if EWShop wants deeper background:

- `docs/active/codex-content-quality-exporter-review.md`
- `docs/active/codex-content-quality-exporter-handoff.md`
- `docs/active/unit-ability-spreadsheet-audit.md`
