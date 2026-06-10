# EWShop Backend/Frontend Hand-Off

This document is the living hand-off log for exporter changes that affect the
EWShop backend and frontend teams. Append to it as work lands so the final
handoff has implementation notes, contract changes, validation results, and
open follow-ups in one place.

## Update Rules

- Add a new dated entry for each implementation pass.
- Include only externally useful details: changed contracts, new files, changed
  meanings, validation status, known limitations, and migration notes.
- Keep raw Unity paths, GUIDs, internal mapper names, and other exporter-only
  implementation details out of frontend-facing contract summaries unless they
  are explicitly part of diagnostics.
- Record whether the change was build-only verified, snapshot-validated, or
  validated from a fresh in-game export.

## Entries

### 2026-06-10 - EWShop Frontend Consumption Status and Handoff Cleanup

Status: implemented in EWShop frontend; documentation cleanup only.

Current frontend consumption:

- `description-token-icons.json` is consumed by
  `frontend/src/features/icons/descriptionTokenIcons.ts`.
- `ability-icons.json` is consumed by
  `frontend/src/features/icons/abilityIconResolver.ts`.
- Unit card stat icons now resolve through the description-token registry in
  `frontend/src/features/icons/unitStatIcons.ts`.
- Unit veterancy progression is consumed in the Units UI through a reusable
  `VeterancyLens` control and a pure stat projection helper.
- Population Codex structured metadata is available in the exporter contract;
  EWShop should prefer `facts`, `sections`, and `publicContextKeys` when
  building richer population Codex presentation.

Obsolete-as-active-work handoff areas:

- The original description-token icon request is complete.
- The `DoubleArrow` investigation is complete; it remains a formatting marker,
  not a gameplay icon.
- The SVG renderability request is complete for frontend-safe contracts; use
  diagnostics for QA rather than product UI imports.
- The hero major-faction ownership request is complete for the covered
  major-faction hero families.
- The ability icon registry request is complete; frontend should not infer
  ability icon paths from raw manifest naming patterns.
- The unit veterancy progression contract is complete and has been wired into
  the Units page.

Still useful/open follow-ups:

- Richer equipment metadata or a rich equipment export.
- Richer/cleaner councilor metadata and prototype visibility.
- Richer trait metadata or a trait raw export.
- Product decision on whether hero skills belong in Codex.
- Frontend Codex detail UI can be upgraded incrementally to prefer structured
  metadata where exported and fall back to `descriptionLines`.

### 2026-06-09 - SVG Renderability Diagnostics and Contract Guardrails

Status: implemented and validated from a fresh staged in-game `F5` export.

Files changed:

- `EL2.AssetExporter/EL2.AssetExporter/EL2.AssetExporter.csproj`
- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetExportPaths.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SemanticSvgManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SvgRenderabilityDiagnosticsExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/SvgRenderabilityDiagnosticsDto.cs`

Contract changes:

- Added diagnostics-only `diagnostics/svg/svg-renderability.json`.
- Product SVG contracts remain unchanged in shape:
  `manifest.json`, `semantic-manifest.json`, `description-token-icons.json`,
  and `ability-icons.json`.
- `semantic-manifest.json` remains a broader technical/diagnostic-ish manifest
  that can include exporter evidence fields such as source mapper names. It is
  not the preferred frontend runtime lookup surface.
- Frontend runtime code should prefer the narrower frontend-safe registries:
  `description-token-icons.json` for description token icons and
  `ability-icons.json` for ability icons.
- Existing renderability filtering remains the guardrail for frontend-safe
  contracts. Exported SVG rows must exist, contain drawable geometry, and have
  at least one drawable element with visible paint after fill/stroke,
  stroke-width, opacity, fill-opacity, and stroke-opacity checks.
- Non-renderable SVGs are not selected by frontend-safe contracts.
- Fallbacks are only reported/applied when the relationship is proven. The
  Mukag/Tahuk fallback remains the validated visible
  `/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg` symbol.

Diagnostics shape:

```json
{
  "schemaVersion": 1,
  "reportKind": "svg_renderability",
  "exportedAtUtc": "...",
  "nonRenderableAssetCount": 34,
  "nonRenderableAssets": [
    {
      "path": "/svg/factions/UI_Faction_Mukag.svg",
      "reason": "no_visible_paint",
      "referencedBy": [],
      "blockedFrom": ["frontend-svg-manifest"],
      "fallbackApplied": true,
      "fallbackPath": "/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg"
    }
  ]
}
```

Validation:

- Build: `dotnet build EL2.AssetExporter.csproj -c Debug` passed with 0
  warnings and 0 errors before install and again after runtime validation.
- Install: copied rebuilt `EL2.AssetExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the staged in-game `F5` workflow.
- Runtime log evidence: semantic SVG manifest completed with 456 entries, 596
  description token icons, 358 ability icons, and 4 ability diagnostics;
  validation summary passed; staged export completed with 14 phases.
- Asset validation summary:
  `export_validation_summary_20260609-044735.json`.
- `svg-renderability.json` validation: `schemaVersion=1`,
  `reportKind=svg_renderability`, 34 non-renderable assets, all with public
  `/svg/...` paths and no filesystem paths, GUID-like values, mapper names,
  Unity/Amplitude internals, or raw asset paths.
- Specific target validation:
  `UI_Faction_Mukag.svg`, `UI_DiplomaticState_Peace.svg`,
  `UI_DiplomaticState_Unknown.svg`, `UI_Common_Rename.svg`, and
  `TechnologyWindow_Link_Prerequisite.svg` are diagnosed as
  `no_visible_paint`.
- Product contract validation: the five named non-renderable targets are not
  referenced by `manifest.json`, `semantic-manifest.json`,
  `description-token-icons.json`, or `ability-icons.json`, and do not exist in
  product SVG output.
- SVG path validation: semantic manifest had 456 paths,
  description-token icons had 603 paths including variants, ability icons had
  358 paths, 472 unique selected public paths existed on disk, and missing path
  count was 0.
- Export validation summary confirmed `missingSvgFilesCount=0`,
  `nonRenderableSvgFilesCount=0`,
  `descriptionTokenIconMissingPathCount=0`,
  `descriptionTokenIconNonRenderablePathCount=0`,
  `abilityIconMissingPathCount=0`, and
  `abilityIconNonRenderablePathCount=0`.

Backend/frontend impact:

- EWShop can treat frontend-safe SVG contracts as render-safe and use
  `svg-renderability.json` for QA/debugging only.
- EWShop frontend runtime should use `description-token-icons.json` and
  `ability-icons.json` before consulting `semantic-manifest.json`.
- `semantic-manifest.json` should be treated as technical/diagnostic-ish
  exporter context rather than as the primary safe runtime contract.
- The diagnostics file is not a product import contract and requires no
  backend importer migration.
- Frontend should not infer arbitrary substitutions for non-renderable SVGs.
  Only explicit fallback fields in diagnostics should be treated as proven.

Known limitations / follow-ups:

- Some non-renderable assets remain in diagnostics because no safe visible
  fallback is proven. They are intentionally omitted from frontend-safe
  contracts rather than guessed.
- Do not remove mapper/evidence fields from `semantic-manifest.json` in the
  current contract. If EWShop still needs a broader safe projection later, add
  a separate `semantic-manifest.public.json` contract instead.

### 2026-06-09 - Hero Faction Context and Tahuk Naming

Status: implemented and validated from a fresh in-game `F8` export.

Files changed:

- `EL2.DBExporter/EL2.DBExporter/Units/UnitDatabaseExporter.cs`

Contract changes:

- Rich heroes export keeps the existing root shape and `exportKind="heroes"`.
- Heroes Codex export keeps the existing root shape and `exportKind="heroes"`.
- Major-faction hero families now use explicit public faction ownership:
  `Hero_Aspect_* -> Faction_Aspect / Aspects`,
  `Hero_KinOfSheredyn_* -> Faction_KinOfSheredyn / Kin of Sheredyn`,
  `Hero_LastLord_* -> Faction_LastLord / Last Lords`,
  `Hero_Mukag_* -> Faction_Mukag / Tahuk`, and
  `Hero_Necrophage_* -> Faction_Necrophage / Necrophages`.
- Rich hero rows expose the corrected `faction`, `factionKey`,
  `originKind="majorFaction"`, and `originFactionKey`.
- Heroes Codex rows expose ownership without frontend key parsing through the
  existing `Faction: ...` description line and `referenceKeys`.
- Mukag remains the stable exported identity key (`Faction_Mukag`), while Tahuk
  is the public-facing label.

Before / after example:

- Before this pass, `Hero_Necrophage_Archer_2` exported
  `faction="Hero"`, `factionKey="Faction_Hero"`, and Codex
  `Faction: Lesser Faction Pilgrim`.
- After this pass, `Hero_Necrophage_Archer_2` exports
  `faction="Necrophages"`, `factionKey="Faction_Necrophage"`,
  `originKind="majorFaction"`, `originFactionKey="Faction_Necrophage"`, and
  Codex `Faction: Necrophages` with `referenceKeys` containing
  `Faction_Necrophage`.

Validation:

- Build: `dotnet build EL2.DBExporter.csproj -c Debug` passed with 0 warnings
  and 0 errors before install and again after runtime validation.
- Static validation: source contains the five required hero-prefix mappings and
  public labels, and did not change heroes root shapes or `exportKind`.
- Install: copied rebuilt `EL2.DBExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the normal in-game `F8` workflow.
- Runtime log evidence: heroes export wrote 79 rows, heroes Codex export wrote
  79 rows, hero diagnostics reported `majorFactionOrigins=41`, and overall DB
  export completed with `succeeded=15, failed=0`.
- Rich validation: all required families had zero bad ownership rows:
  8 Aspect heroes, 8 Kin of Sheredyn heroes, 9 Last Lord heroes, 9 Mukag
  heroes, and 7 Necrophage heroes.
- Codex validation: all required families had zero bad rows; each row has the
  expected public `Faction: ...` line and expected `Faction_*` reference key,
  with no `Faction_Hero` reference.
- Sample validation confirmed:
  `Hero_Aspect_Archer_0`, `Hero_KinOfSheredyn_Archer_0`,
  `Hero_LastLord_Caster_0`, `Hero_Mukag_Archer_0`, and
  `Hero_Necrophage_Archer_2`.
- Product safety check found no absolute filesystem paths, GUID-like values,
  mapper names, Unity/Amplitude internals, or raw DB object paths in the rich
  heroes and heroes Codex payloads.
- `tools/export_snapshot.py validate` exited successfully against the current
  export set.

Backend/frontend impact:

- EWShop no longer needs to infer these major-faction hero owners from
  `Hero_<Faction>_*` keys.
- EWShop can continue using stable faction keys for identity and public labels
  for display.
- Existing importer compatibility is preserved: no fields were removed or
  renamed, root shapes are unchanged, and `exportKind` values are unchanged.

Known limitations / follow-ups:

- Generic/world-owned heroes such as `Hero_World_*` may still emit
  `faction="Hero"` / `factionKey="Faction_Hero"`; that is intentionally outside
  this major-faction hero family fix.

### 2026-06-09 - Ability Icon Registry Public Key Casing

Status: implemented and validated from a fresh staged in-game `F5` export.

Files changed:

- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/AbilityIconRegistryExporter.cs`

Contract changes:

- `ability-icons.json` remains at the product SVG root and keeps the existing
  `schemaVersion=1` / `abilities` object shape.
- Ability registry keys are now emitted as frontend/DBExporter public keys such
  as `UnitAbility_TeamPlayer_1`, not runtime-lowercased `unitAbility_*` keys
  and not raw manifest keys such as `battleAbility_*` or `activeSkill_*`.
- Entry payload remains frontend-safe: `path`, optional `displayName`,
  optional `kind`, and optional `color`.
- Paths remain browser public `/svg/...` paths only. No filesystem paths,
  mapper names, GUIDs, Unity internals, presentation paths, or raw DB object
  paths are part of the product contract.
- Diagnostics remain in
  `diagnostics/svg/ability-icon-diagnostics.json` for visible ability rows that
  cannot be joined to a renderable SVG.

Validation:

- Build: `dotnet build EL2.AssetExporter.csproj -c Debug` passed with 0
  warnings and 0 errors.
- Install: copied rebuilt `EL2.AssetExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the staged in-game `F5` workflow.
- Runtime log evidence: `Semantic SVG manifest complete` reported
  `abilityIcons=358` and `abilityIconDiagnostics=4`; validation summary
  reported `passed=True`; staged export completed with `phases=14`.
- Asset validation summary:
  `export_validation_summary_20260609-041956.json`.
- Asset validation result: passed.
- `ability-icons.json` validation: `schemaVersion=1`, 358 entries,
  358 keys matching `UnitAbility_*`, 0 keys matching `unitAbility_*`, 0 raw
  `battleAbility_*` / `activeSkill_*` keys, 0 unexpected entry fields, 0
  missing paths, 0 non-`/svg` paths, 0 absolute path leaks, and 0 display names
  containing markup.
- Required sample entries confirmed with existing paths:
  `UnitAbility_TeamPlayer_1`, `UnitAbility_TeamPlayer_2`,
  `UnitAbility_Momentum_2`, `UnitAbility_Warmaster`, `UnitAbility_Cruel`,
  `UnitAbility_SeismicSlash`, `UnitAbility_ProtectiveOversight`, and
  `UnitAbility_DefensivePlate`.
- Export validation summary confirmed `abilityIconsExists=true`,
  `abilityIconCount=358`, `abilityIconDiagnosticCount=4`,
  `abilityIconMissingPathCount=0`, `abilityIconNonRenderablePathCount=0`,
  `missingSvgFilesCount=0`, and `nonRenderableSvgFilesCount=0`.

Backend/frontend impact:

- EWShop can key ability icon lookup directly by public exported ability keys
  already present in rich/Codex/unit exports.
- Existing `ability-icons.json` consumers should treat `UnitAbility_*` as the
  stable key casing going forward.
- The four unresolved visible abilities remain diagnostics-only and should not
  be inferred by the frontend.

### 2026-06-08 - Frontend Icon Contracts and Hero Faction Context

Status: implemented and validated from fresh in-game exports.

Files changed:

- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetExportPaths.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/AbilityIconDiagnosticsExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/DescriptionTokenIconRegistryExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SemanticSvgManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SvgCatalogExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SvgCatalogSummaryBuilder.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/Art/ExportValidationSummaryDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/AbilityIconDiagnosticsDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/DescriptionTokenIconEntryDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/SemanticSvgExportResult.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SvgCatalogExportResult.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SvgCatalogIndexRowDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SvgCatalogSummaryDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Svg/SvgRenderabilityValidator.cs`
- `EL2.AssetExporter/EL2.AssetExporter/EL2.AssetExporter.csproj`
- `EL2.DBExporter/EL2.DBExporter/Units/UnitDatabaseExporter.cs`

Contract changes:

- Asset export now writes `frontend/public/svg/description-token-icons.json`
  equivalent output at the product SVG root as `description-token-icons.json`.
  Entries contain only frontend-safe `path`, optional `color`, and optional
  `variants`.
- `description-token-icons.json` is built from the validated semantic SVG data,
  with duplicate token precedence following resources, stats, statuses,
  armyActions, diplomacyStates, diplomacyActions, diplomacyTreaties.
- `AttackRange` variants are emitted for `1` through `7` when matching
  renderable SVGs exist.
- Asset export now validates reconstructed SVG files before they can enter
  frontend-ready manifests. Non-renderable SVGs are marked failed and omitted
  from `manifest.json`, `semantic-manifest.json`, and
  `description-token-icons.json`.
- SVG validation summary now counts non-renderable SVGs and checks
  `description-token-icons.json` paths for missing/non-renderable targets.
- Asset export writes diagnostics-only
  `diagnostics/svg/ability-icon-diagnostics.json` for ability-like raw icon
  rows. `ability-icons.json` is not emitted because this pass did not prove a
  stable `UnitAbility_*` to SVG join from exporter-owned data.
- Mukag/Tahuk raw manifest aliases now point to the validated
  `UI_EmpireSymbol_Mukag01.svg` fallback when that fallback is available.
- A post-validation correction restricted Mukag/Tahuk fallback aliasing to
  aliases that actually contain Mukag or Tahuk. This prevents unrelated mapper
  aliases from being rewritten just because their asset path was shared with
  the Mukag fallback SVG.
- Hero rich/Codex exports now infer major-faction origin from proven hero key
  prefixes when runtime data reports generic hero ownership. Public labels use
  Aspects, Kin of Sheredyn, Last Lords, Tahuk, and Necrophages while stable
  keys remain `Faction_*`.

Validation:

- AssetExporter build: passed with `dotnet build EL2.AssetExporter.sln`.
- DBExporter build: passed with
  `dotnet build EL2.DBExporter.csproj -c Debug`.
- Install: copied rebuilt `EL2.AssetExporter.dll` and `EL2.DBExporter.dll` to
  the EL2 BepInEx plugins folder.
- Fresh DB export: completed by manual `F8` export.
- DB snapshot: created
  `export-snapshots/20260608-193824`.
- DB snapshot validation: passed with zero errors across districts,
  improvements, tech, units, heroes, abilities, skills, minor factions, traits,
  quest explorer, branch diagnostics, and quests Codex exports.
- DB diff: generated
  `export-reports/20260601-192003_to_20260608-193824_diff.md`. Diff warnings
  are stale-baseline warnings for the older before snapshot, not validation
  errors in the fresh export.
- Fresh asset export: completed by manual `F5` export, then repeated after the
  Mukag/Tahuk aliasing correction.
- Asset validation summary:
  `export_validation_summary_20260608-194607.json`.
- Asset validation result: passed.
- SVG validation result: `missingSvgFilesCount=0`,
  `nonRenderableSvgFilesCount=0`.
- `description-token-icons.json` validation:
  `descriptionTokenIconsExists=true`, `descriptionTokenIconCount=596`,
  `descriptionTokenIconMissingPathCount=0`,
  `descriptionTokenIconNonRenderablePathCount=0`.
- Required token coverage confirmed for `FoodColored`, `IndustryColored`,
  `DustColored`, `ScienceColored`, `CultureColored`, `PublicOrderColored`,
  `Health`, `Damage`, `Defense`, `AttackRange`, `MovementPoints`, and
  `VisionRange`.
- `AttackRange` variants `1`, `3`, and `7` confirmed:
  `/svg/unit-abilities/UI_UnitAbility_Ranged_1.svg`,
  `/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg`,
  `/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg`.
- `ScienceColored` confirmed as
  `/svg/resources/UI_Common_Resource_Science.svg`.
- Mukag/Tahuk fallback confirmed as
  `/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg`.
- Major hero faction context confirmed on 41 hero rows. Sample verified:
  `Hero_Mukag_Archer_0` exports `faction="Tahuk"`,
  `factionKey="Faction_Mukag"`, `originKind="majorFaction"`, and
  `originFactionKey="Faction_Mukag"`.
- Hero Codex context confirmed for Mukag heroes with `Faction: Tahuk` and
  `referenceKeys` containing `Faction_Mukag`.

Backend/frontend impact:

- Frontend can use `description-token-icons.json` instead of guessing bracket
  token icons from raw manifest names.
- Frontend should treat `ability-icon-diagnostics.json` as investigation data,
  not runtime contract data.
- Hero consumers should use `originFactionKey` / `factionKey` for stable hero
  faction identity and public faction labels from the export/Codex context for
  display.

Known limitations / follow-ups:

- Ability icon runtime contract was diagnostics-only in this pass. It was
  superseded by the later decompile-backed ability icon contract entry below.

### 2026-06-08 - Decompile-Backed Ability Icon Registry

Status: implemented and validated from a fresh staged in-game `F5` export.

Files changed:

- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetExportPaths.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Art/ExportValidationSummaryExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/AbilityIconRegistryExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SemanticSvgManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/Art/ExportValidationSummaryDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/AbilityIconRegistryDto.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/SemanticSvgExportResult.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SvgCatalogExportResult.cs`
- `EL2.AssetExporter/EL2.AssetExporter/EL2.AssetExporter.csproj`

Decompile findings:

- `Amplitude.Mercury.UI.UnitAbilityItem.Bind(StaticString abilityName, bool isActive)`
  resolves the icon from `Utils.DataUtils.GetUIMapper<UIMapperWithSortPriority>(unitAbilityName)`
  and then calls `unitAbilityMapper.GetImage(UIMapperImageKeys.Format.Picto)`.
- `Amplitude.Mercury.UI.UnitEvolutionAbilityItem.Bind(...)` follows the same
  icon path for ability or skill names with `Utils.DataUtils.GetUIMapper(...)`
  and `GetImage(UIMapperImageKeys.Format.Picto)`.
- This proves the stable frontend registry join for visible unit abilities:
  `UnitAbility.Name` -> matching `UnitAbilityUIMapper` -> `Picto` SVG.
- `BattleAbilityDefinition`, `BattleSkillDefinition`, and
  `PresentationAbilityDefinition` were inspected and treated as behavior/VFX
  references rather than the ability icon contract.
- No runtime probe exporter was created for this investigation.

Contract changes:

- Asset export now writes `ability-icons.json` at the SVG output root.
- `ability-icons.json` has `schemaVersion=1` and an `abilities` object keyed by
  exact `UnitAbility.Name`.
- Each emitted ability entry contains a frontend-safe `/svg/...` `path`,
  optional cleaned `displayName`, `kind`, and optional `color`.
- `kind` is `active` when the visible `UnitAbility` has a battle skill
  reference; otherwise it is `passive`.
- Display names are stripped of the game's simple anchor markup before export.
- `diagnostics/svg/ability-icon-diagnostics.json` remains available for visible
  ability rows that cannot be joined to a renderable SVG.
- Asset validation summary now checks `ability-icons.json` existence, entry
  count, missing paths, and non-renderable paths.

Validation:

- AssetExporter build: passed with `dotnet build EL2.AssetExporter.sln`.
- Install: copied rebuilt `EL2.AssetExporter.dll` to the EL2 BepInEx plugins
  folder.
- Fresh asset export: completed through the staged `F5` workflow. Log markers
  confirmed `F5 staged export started`, two staged pause/resume transitions,
  `Validation summary complete. passed=True`, and
  `F5 staged export complete. elapsedMs=30627, phases=14`.
- Asset validation summary:
  `export_validation_summary_20260608-202315.json`.
- Asset validation result: passed.
- `ability-icons.json` validation: `abilityIconsExists=true`,
  `abilityIconCount=358`, `abilityIconDiagnosticCount=4`,
  `abilityIconMissingPathCount=0`,
  `abilityIconNonRenderablePathCount=0`.
- Registry inspection confirmed 358 emitted ability entries, zero bad `/svg`
  paths, and zero display names containing `<` or `>` markup.
- Sample ability paths confirmed:
  `UnitAbility_TeamPlayer_1`,
  `UnitAbility_TeamPlayer_2`,
  `UnitAbility_Momentum_2`,
  `UnitAbility_Warmaster`,
  `UnitAbility_Cruel`,
  `UnitAbility_SeismicSlash`,
  `UnitAbility_ProtectiveOversight`, and
  `UnitAbility_DefensivePlate`.

Backend/frontend impact:

- Frontend can now resolve ability icons directly from `ability-icons.json`
  using exact exported unit ability keys.
- Backend/front-end consumers should not derive ability icons from battle skill
  or presentation ability definitions.
- `displayName` is convenience display text only. Stable identity remains the
  ability key.

Known limitations / follow-ups:

- Four visible ability rows remain diagnostic-only:
  `UnitAbility_Blossom_1`, `UnitAbility_Blossom_2`, and
  `UnitAbility_CompletedBlossom` have non-SVG `Picto` references;
  `UnitAbility_Hero_BattleAbility_Equipment_Passive_09` has no renderable
  exported SVG path.

### 2026-06-08 - DoubleArrow Formatting Token Classification

Status: implemented and validated from a fresh staged in-game `F5` export.

Files changed:

- `EL2.AssetExporter/EL2.AssetExporter/EL2.AssetExporter.csproj`
- `EL2.AssetExporter/EL2.AssetExporter/Export/AssetExportPaths.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/DescriptionFormattingTokenDiagnosticsExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/DescriptionTokenIconRegistryExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Catalog/SemanticSvgManifestExporter.cs`
- `EL2.AssetExporter/EL2.AssetExporter/Export/Models/SemanticSvg/DescriptionFormattingTokenDiagnosticsDto.cs`

Contract changes:

- `DoubleArrow` is explicitly excluded from `description-token-icons.json`.
- Asset export now writes diagnostics-only
  `diagnostics/svg/description-formatting-token-diagnostics.json`.
- The diagnostics file records `DoubleArrow` as a `formattingMarker`, with
  `emittedInDescriptionTokenIcons=false`,
  `dedicatedIconAssetProven=false`, and frontend fallback
  `stripWhenLineLeading`.
- No product/root JSON shape changed. Existing `descriptionLines`,
  `description-token-icons.json`, `semantic-manifest.json`, and import-facing
  file names remain backwards-compatible.

Evidence:

- Current DB exports contain `[DoubleArrow]` in abilities, skills, abilities
  Codex, factions Codex, and traits Codex text.
- Current `description-token-icons.json` does not contain `DoubleArrow`.
- Decompile evidence found `[DoubleArrow]` used in formatted UI text/cost
  composition, not as a proven gameplay icon token.
- No dedicated DoubleArrow SVG marker asset was proven in AssetExporter's
  semantic icon contract.
- The tech prerequisite/link SVGs were not used because they represent a
  different technology prerequisite semantic.

Validation:

- AssetExporter build: passed with `dotnet build EL2.AssetExporter.sln`.
- Install: copied rebuilt `EL2.AssetExporter.dll` to the EL2 BepInEx plugins
  folder.
- Fresh asset export: completed through the staged `F5` workflow. Log markers
  confirmed `F5 staged export started`,
  `Validation summary complete. passed=True`, and
  `F5 staged export complete. elapsedMs=31076, phases=14`.
- Asset validation summary:
  `export_validation_summary_20260608-213404.json`.
- Asset validation result: passed.
- `description-token-icons.json` validation: 596 entries and
  `DoubleArrow` absent.
- `description-formatting-token-diagnostics.json` validation: one entry,
  `token=DoubleArrow`, `classification=formattingMarker`,
  `emittedInDescriptionTokenIcons=false`,
  `dedicatedIconAssetProven=false`,
  `frontendFallback=stripWhenLineLeading`.
- Diagnostics payload checked for public-contract leaks: no GUID-like values,
  filesystem paths, mapper names, Unity/Amplitude internals, or tech
  prerequisite asset names.

Backend/frontend impact:

- Frontend should continue to strip line-leading `[DoubleArrow]` as formatting
  metadata.
- Frontend should not resolve `[DoubleArrow]` through the normal icon registry
  and should not alias it to technology prerequisite arrows.
- The diagnostics file is for handoff/QA only and is not a product UI contract.

Known limitations / follow-ups:

- This pass does not restructure DB `descriptionLines`; it preserves existing
  rich/Codex text for import compatibility.
- A future rich text-shaping pass may split result-marker lines into structured
  metadata, but that would be a separate contract decision.

### 2026-06-08 - Rich Export Inventory Gap Report

Status: implemented and validated from a fresh in-game `F8` export.

Files changed:

- `EL2.DBExporter/EL2.DBExporter/.gitignore`
- `EL2.DBExporter/EL2.DBExporter/DBExporterPlugin.cs`
- `EL2.DBExporter/EL2.DBExporter/EL2.DBExporter.csproj`
- `EL2.DBExporter/EL2.DBExporter/Export/ExportInventoryModels.cs`
- `EL2.DBExporter/EL2.DBExporter/Export/ExportInventoryReporter.cs`
- `EL2.DBExporter/EL2.DBExporter/Export/ExportPaths.cs`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/core/constants.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/core/data.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/json_validation/codex.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/json_validation/contracts.py`

Contract changes:

- Added a diagnostics-only inventory report at
  `reports/diagnostics/export_inventory_report_<version>.json`.
- The report declares exporter coverage by category using public-safe category
  names, safe file names, status values, recommended next tickets, and notes.
- No product export root shape changed.
- No existing import file changed.
- No `exportKind` value changed.
- No EWShop importer migration is required.
- Rich exports remain canonical. Generic Codex exports remain derived public
  projections.

Inventory classification:

- `abilities`: `rich_and_codex`.
- `battleAbilities`: `intentionally_internal`.
- `battleSkills`: `intentionally_internal`.
- `councilors`: `codex_only`.
- `descriptorEvaluations`: `diagnostics_only`.
- `districts`: `rich_and_codex`.
- `equipment`: `codex_only`.
- `factions`: `codex_only`.
- `heroes`: `rich_and_codex`.
- `heroSkills / skills`: `rich_export_exists`.
- `improvements`: `rich_and_codex`.
- `minorFactions`: `codex_only`.
- `populations`: `rich_and_codex`.
- `quests`: `rich_and_codex`.
- `tech`: `rich_and_codex`.
- `traits`: `codex_only`.
- `units`: `rich_and_codex`.

Validation:

- Build: `dotnet build EL2.DBExporter.csproj -c Debug` passed with 0 warnings
  and 0 errors.
- Install: copied rebuilt `EL2.DBExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the normal in-game `F8` workflow.
- Runtime log evidence: `Export Inventory Diagnostics export done` and overall
  DB export completed with `succeeded=15, failed=0`.
- Report written:
  `reports/diagnostics/export_inventory_report_0.80.json`.
- Report validation: `schemaVersion=1`, `reportKind=export_inventory`,
  `contractSurface=diagnostics-only`, and 17 categories.
- Safety validation: no absolute filesystem paths, GUID-like values, mapper
  names, Unity internals, Amplitude internals, or raw DB object paths were found
  in the report payload.
- Follow-up wording validation: corrected the report notes so equipment,
  councilors, traits, factions, and minor factions are clearly described as
  exported today in public generic Codex, not absent from EWShop.
- Snapshot validation: `tools/export_snapshot.py snapshot` and
  `tools/export_snapshot.py validate` passed on snapshot `20260609-023433`
  with 0 errors across the current product export batch.

Backend/frontend impact:

- EWShop can use this diagnostics report to plan exporter coverage without
  treating it as a product import contract.
- Equipment, councilors, traits, factions, and minor factions are explicitly
  marked `codex_only`; that means they are present in the public generic Codex
  today and do not currently have a separate canonical rich export.
- The report now only recommends follow-up work for equipment, councilors, and
  traits as Codex metadata/rich-export decision tickets from the handoff, not
  as missing EWShop domains.
- Descriptor evaluations are explicitly marked diagnostics/source material.
- Battle abilities and battle skills remain intentionally internal/source
  material and are not dumped into generic Codex.
- `descriptionLines` remains the fallback text surface for existing consumers.

Known limitations / follow-ups:

- The inventory report is a coverage declaration, not a row-level completeness
  proof.
- The snapshot tool validates the established export batch; the new inventory
  report was validated separately because it is emitted under
  `reports/diagnostics`, not the product import paths.
- Recommended next tickets from the inventory report: `DBX-CODEX-004`,
  `DBX-CODEX-005`, `DBX-CODEX-006`, `DBX-HEROSKILLS-DECISION`, and
  `DBX-POPULATIONS-METADATA`.

### 2026-06-09 - Population Codex Structured Metadata

Status: implemented and validated from a fresh in-game `F8` export.

Files changed:

- `EL2.DBExporter/EL2.DBExporter/Common/CodexExportModels.cs`
- `EL2.DBExporter/EL2.DBExporter/Populations/PopulationDatabaseExporter.cs`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/core/constants.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/core/data.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/json_validation/codex.py`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/json_validation/contracts.py`

Contract changes:

- Added optional generic Codex metadata fields to entries:
  `facts`, `sections`, and `publicContextKeys`.
- Existing `entryKey`, `displayName`, `descriptionLines`, and
  `referenceKeys` remain unchanged.
- Population Codex entries now populate public-safe metadata derived from the
  canonical rich populations export.
- `descriptionLines` remain the fallback text surface for EWShop.
- No `exportKind` changed and no existing field was removed or renamed.

Population metadata emitted:

- Facts: population type, default-population flag, custom-faction availability,
  base food cost, and faction when a public faction key/name is available.
- Sections: worker effects and threshold rewards.
- Threshold reward items are ordered by threshold amount and expose threshold
  amount, threshold label, reward type, public reward reference when available,
  and player-facing reward description lines.
- Public context keys include the population key and other public-safe related
  keys when available.

Validation:

- Build: `dotnet build EL2.DBExporter.csproj -c Debug` passed with 0 warnings
  and 0 errors.
- Install: copied rebuilt `EL2.DBExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the normal in-game `F8` workflow.
- Runtime log evidence: populations rich and Codex exports wrote 26 rows each;
  overall DB export completed with `succeeded=15, failed=0`.
- Population Codex validation: 26 entries; 26 with `facts`; 26 with
  `publicContextKeys`; 25 with metadata `sections`; 25 with threshold reward
  sections; 23 with worker effect sections.
- Structured metadata safety validation: no absolute filesystem paths,
  GUID-like values, mapper names, Unity internals, Amplitude internals, raw
  `FactionAffinity_*` fact values, or raw `Effect_*` / cost-modifier reward
  fact values were found.
- Snapshot validation: `tools/export_snapshot.py snapshot` and
  `tools/export_snapshot.py validate` passed on snapshot `20260609-023433`
  with 0 errors, including `populations` and `populations-codex`.

Backend/frontend impact:

- EWShop can render population detail facts, worker effects, and threshold
  reward timelines from structured optional metadata.
- Existing Codex import remains backwards-compatible if EWShop ignores unknown
  optional fields.
- EWShop should prefer structured metadata when present and fall back to
  `descriptionLines` otherwise.

Known limitations / follow-ups:

- Two action-created populations, `Population_Called` and `Population_Divined`,
  have no public faction key/name in the rich export, so no faction fact is
  invented for them.
- Non-public reward identifiers are not exposed as structured display values;
  their player-facing reward lines remain available in the threshold item
  `lines` and legacy `descriptionLines`.

### 2026-06-09 - Unit Veterancy Progression Root Metadata

Status: implemented and validated from a fresh in-game `F8` export.

Files changed:

- `EL2.DBExporter/EL2.DBExporter/Units/UnitExportModels.cs`
- `EL2.DBExporter/EL2.DBExporter/Units/UnitDatabaseExporter.cs`
- `EL2.DBExporter/EL2.DBExporter/tools/export_snapshot_lib/json_validation/rich.py`

Contract changes:

- Added root-level `veterancyProgression` to
  `ewshop_units_export_<version>.json`.
- Existing root fields remain unchanged: `game`, `gameVersion`,
  `exporterVersion`, `exportedAtUtc`, `exportKind`, `diagnostics`, and
  `units`.
- Existing unit rows are not mutated for projected veterancy stats.
- `exportKind` remains `units`.
- No EWShop importer migration is required if unknown root fields are ignored.

Exported shape:

```json
{
  "appliesTo": "nonHeroUnits",
  "stacking": "cumulative",
  "source": "VeterancyLevelDefinition",
  "displayLevelOffset": "unverified",
  "levels": [
    {
      "level": 1,
      "effects": [
        {
          "statKey": "Defense",
          "displayName": "Defense",
          "operation": "Add",
          "value": 2,
          "formatted": "+2 [Defense] Defense"
        },
        {
          "statKey": "Damage",
          "displayName": "Damage",
          "operation": "Percent",
          "value": 0.05,
          "formatted": "+5% [Damage] Damage"
        },
        {
          "statKey": "Health",
          "displayName": "Health",
          "operation": "Percent",
          "value": 0.05,
          "formatted": "+5% [Health] Health"
        }
      ]
    }
  ]
}
```

Validation:

- Build: `dotnet build EL2.DBExporter.csproj -c Debug` passed with 0 warnings
  and 0 errors.
- Static validation: `tools/export_snapshot_lib/json_validation/rich.py`
  compiled with Python.
- Install: copied rebuilt `EL2.DBExporter.dll` into the EL2 BepInEx plugins
  folder before runtime validation.
- Fresh export: completed through the normal in-game `F8` workflow.
- Runtime log evidence: units export wrote 159 rows; unit veterancy probe wrote
  5 authored levels and 6 cumulative probe rows; overall DB export completed
  with `succeeded=15, failed=0`.
- Generated `veterancyProgression` validation:
  `appliesTo=nonHeroUnits`, `stacking=cumulative`,
  `source=VeterancyLevelDefinition`, `displayLevelOffset=unverified`,
  and 5 levels.
- Each level has exactly three public effects:
  `+2 [Defense] Defense`, `+5% [Damage] Damage`, and
  `+5% [Health] Health`.
- Safety validation: no descriptor keys, raw property names
  `DamageReductionFlat`, `DamageBonusModifier`, or `HealthPoints`, Unity
  internals, GUID-like values, mapper names, or filesystem paths were found
  inside `veterancyProgression`.
- Snapshot validation: `tools/export_snapshot.py snapshot` and
  `tools/export_snapshot.py validate` passed on snapshot `20260609-031523`
  with 0 errors, including the rich units export.

Backend/frontend impact:

- EWShop can read one global non-hero unit veterancy progression table from the
  rich units export root.
- The table is cumulative: each authored level adds the listed effects on top
  of prior applied levels.
- Heroes are intentionally excluded because they use separate hero progression.
- No per-unit levelled final stats are exported; EWShop should not treat these
  as per-unit projected stat rows.

Known limitations / follow-ups:

- `displayLevelOffset` remains `unverified`; do not infer player-facing level
  labels beyond the exported authored/internal level numbers.
- The diagnostics/probe files still exist separately for investigation, but
  their descriptor/property internals are not part of the public rich units
  contract.

## Entry Template

### YYYY-MM-DD - Short Change Title

Status: planned | implemented | validated | blocked.

Files changed:

- `path/to/file`

Contract changes:

- Describe added, removed, or changed exported fields/files.

Validation:

- Build:
- Install:
- Fresh export:
- Snapshot validation:
- Notes:

Backend/frontend impact:

- Describe any expected consumer changes or compatibility notes.

Known limitations / follow-ups:

- List unresolved items.
