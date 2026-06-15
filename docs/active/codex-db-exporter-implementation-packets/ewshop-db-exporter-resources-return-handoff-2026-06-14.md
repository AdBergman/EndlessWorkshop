# EWShop Return Handoff: CDEX-EXP-003 Resource Codex Entities

Status: implemented and F8-validated
Date: 2026-06-14
Source packet:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`

## Implemented

- Added new generic Codex exportKind `resources`.
- Resource entries are built from canonical `ResourceDefinition` rows only.
- Public resource keys use `Resource_` plus the stable `ResourceDefinition.Name`
  suffix, for example `Resource_Luxury01` and `Resource_Strategic01`.
- Resource display names use canonical localization/title resolution.
- Resource facts include public-safe fields:
  - `Type`
  - `Booster`, when boosters are allowed
  - `Trade`, when explicitly not tradable
  - `Stock limit`, when stock cap is ignored
- Resource `Effects` sections are populated only from descriptor text that
  resolves to public-safe player-facing lines.
- Existing extractor district Codex rows now exact-link to resources through
  `ArtificialDepositDistrictDefinition.ResourceType`.
- If a live extractor row does not expose a resolved `ResourceType` element
  name, the exporter falls back to the exact canonical key pattern
  `Extractor_<ResourceDefinition.Name>` and tier variants. This fallback is not
  based on display names, prose, or icons.
- Resource rows include reverse extractor `referenceKeys` when the exact
  relationship is proven. Reverse `Extractors` section items are emitted only
  when a clean public extractor label is available.

## Not Implemented

- Resource deposit / POI Codex pages.
- Resource entries created from icon tokens alone.
- Core yield token Resources such as Food, Industry, Dust, or Science unless
  backed by canonical `ResourceDefinition` rows.
- Browse/top-level navigation decisions for Resources.
- Hidden, prototype, base, debug, or non-player-facing extractor refs.

## Public Contract

- Generic Codex root shape is unchanged.
- Existing exportKinds and file paths are unchanged.
- New file:
  - `ewshop_resources_codex_export_<version>.json`
- No EWShop importer migration should be required beyond accepting another
  generic Codex exportKind.

## Validation Plan

Validated snapshot:

- `export-snapshots/resources-cdex-exp-003-extractor-key-join-20260614`
- `export-reports/resources-cdex-exp-003-extractor-key-join-20260614_validation.md`

Validated results:

- `resources-codex`: 24 rows.
- `districts-codex`: 66 extractor rows have `Resource_*` refs.
- `resources-codex`: 22 resource rows have `Extractor_*` reverse refs.
- Dead `Resource_*` refs: 0.
- Dead `Extractor_*` refs: 0.
- `resources-codex` validation: 0 errors, 0 warnings.
- Product leak scan passed for `Extractor_Base*`, descriptor/tag/internal keys,
  mapper names, Unity paths, GUIDs, and debug/provenance text.
- Spot-checked:
  - `Resource_Luxury01` / Klax
  - `Resource_Strategic01` / Titanium
  - `Extractor_Luxury01`
  - strategic extractor refs through `Resource_Strategic01`
  - Klax booster/category effect line

## Pending EWShop Decisions

- Whether Resources should be top-level browseable, nested under Extractors, or
  searchable/linkable only.
- Whether resource deposits/POIs should become public Codex entities in a
  future packet.
