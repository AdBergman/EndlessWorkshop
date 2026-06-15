# EWShop Return Handoff: CDEX-EXP-010 Thin Entity Context Slice A

Status: implemented and F8-validated
Date: 2026-06-14
Source handoff:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`
DBExporter snapshot: `export-snapshots/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614`
Validation report: `export-reports/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614_validation.md`

## Scope

Implemented `CDEX-EXP-010` Slice A only:

- Abilities residual thin rows now preserve existing public-safe rich tooltip
  context when that context was already present in the ability export.
- The shared public-text sanitizer no longer rejects ordinary words containing
  `unity`, such as `opportunity`, while still rejecting Unity internal shapes
  such as `UnityEngine` or Unity asset/path fragments.
- `[IconToken]` style tokens and `[DoubleArrow]` tokens are preserved.

Not implemented:

- District context.
- Improvement context.
- Resource Codex entities / `CDEX-EXP-003`.
- Browse suppression or searchable-only product decisions.
- New status product metadata beyond the existing canonical status scope and
  bonus mechanics paths.

## Contract Compatibility

No Codex root shape changed.
No `exportKind` changed.
No filenames or import paths changed.
No existing fields were removed or renamed.
No EWShop importer migration should be required.

The pass uses existing generic Codex fields only:

- `descriptionLines`
- existing metadata builder `sections`
- existing `facts`
- existing `referenceKeys` / `publicContextKeys`

## Source Rules

Ability context is exported only from already-flattened rich ability
`descriptionLines`. No new Unity/Game DB source probing was added.

The exporter suppresses ability tooltip lines containing obvious technical or
non-public fragments:

- `%Tag_*`
- `%Effect_*`
- `Tag_`
- `UnitClass_`
- `Class_`
- `Descriptor`
- mapper/provenance/debug wording
- additive zero-value public lines after existing public-effect normalization

Rows whose only available context is unsafe remain facts-only/link-only.

## Expected Example Outcomes

Gained public-safe context after F8. These remain multiline tooltip blocks in
`descriptionLines`; EWShop should render the embedded line breaks as it does for
other existing ability tooltips.

- `UnitAbility_Quickfooted` / Evasive Maneuvers:
  - `When moving during Battle:`
  - `[DoubleArrow] Ignores all attacks of opportunity`
- `UnitAbility_Hero_Stellar_Defender_01` / Quick Step:
  - `When attacking:`
  - `[DoubleArrow] Refills 1 [MovementPoints] Movement Point`
  - `[DoubleArrow] Ignores all attacks of opportunity`

Remained unresolved/facts-only because no canonical clean source was exported in
this slice:

- `UnitAbility_Blossom_1` / Blossom I, because current rich text contains
  `%Effect_UnitVeterancy_Level2` and zero-value wording.
- `UnitAbility_Blossom_2` / Blossom II, because current rich text contains
  `%Effect_UnitVeterancy_Level3` and zero-value wording.
- `UnitAbility_Hero_BattleAbility_Equipment_Passive_12` / Master of Arrows,
  because current rich text contains `%Tag_UnitClass_Ranged`.

Status validation targets remained facts-only. No new status product metadata was
added in this slice:

- `HeroStatus_Loss`
- `Status_Army_Map_Speed_Immobile`
- `Status_Unit_CavalryCharge`
- `Status_Unit_PreparedBreakRetaliation`

## Validation Results

Build and install:

- `dotnet build EL2.DBExporter.csproj -c Debug`: passed with 0 warnings and 0 errors.
- Python validation syntax check: passed.
- DLL installed to BepInEx before the final F8.

Runtime export:

- Snapshot: `export-snapshots/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614`
- Validation: all registered checks passed.
- `abilities-codex`: 336 rows, 0 errors, 23 warnings for intentionally unresolved ability rows.
- Diff from the last accepted baseline changed exactly 2 `abilities-codex` rows:
  - `UnitAbility_Quickfooted`
  - `UnitAbility_Hero_Stellar_Defender_01`
- `abilities` rich export row count stayed 362.
- `bonuses-codex` row count stayed 585 and changed 0 rows.
- Export log: `succeeded=18`, `failed=0`, `totalMs=3948`.
- Abilities timing: rich rows built in 21ms, Codex entries built in 111ms,
  total Abilities DB elapsed 263ms.

## Open Notes

Remaining thin districts and improvements still need source investigation before
product enrichment. The current evidence suggests many only expose tags,
descriptors, or no public lines, so no copy should be invented in EWShop or the
exporter.
