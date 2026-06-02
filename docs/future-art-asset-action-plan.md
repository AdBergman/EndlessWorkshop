# Future Art And Asset Action Plan

## Scope

This file tracks work that should not be included in the next SVG-only implementation pass.

The next pass should use existing SVG icons only. Do not block it on `.webp`, portraits, hero/councilor art, unit render art, or new generated imagery.

## Future Asset Areas

### Unit Art

Current state:

- `UnitCard` supports `artId` and loads unit images through `getUnitImageUrl`.
- Some units use placeholders or fallback art.

Future action points:

1. Audit unit `artId` coverage by faction, major/minor, hero/chosen, and evolution tier.
2. Produce a missing-unit-art report with:
   - `unitKey`
   - display name
   - faction
   - tier
   - current `artId`
   - expected asset path
3. Decide source of truth for unit art:
   - exporter-provided art ids
   - backend-transformed asset registry
   - checked-in frontend asset manifest
4. Add visual QA for carousel and evolution tree after art changes.

### Hero Art

Current state:

- hero codex entries exist, but no dedicated hero visual treatment is planned in the SVG pass.

Future action points:

1. Audit hero entries and available hero portrait/art exports.
2. Add hero art registry separate from SVG icon registry.
3. Decide if hero art appears in:
   - codex detail header
   - hero/unit cards
   - tooltip previews
4. Keep hero icons/portrait art distinct from small SVG class icons.

### Councilor Art

Current state:

- councilor codex entries exist.
- SVG category identity can use `/svg/common/UI_Common_Council.svg`, but portrait art is separate.

Future action points:

1. Audit councilor entries for stable keys and available artwork.
2. Define councilor art contract:
   - `entryKey`
   - display name
   - portrait path
   - optional faction/role metadata
3. Decide where councilor art should render in Codex.

### Codex Large Visuals

Current SVG pass should add kind icons only.

Future action points:

1. Decide which codex kinds deserve large visual previews:
   - heroes
   - councilors
   - units
   - factions
   - equipment
2. Keep text-heavy codex kinds lean:
   - traits
   - abilities
   - tech
   - quests
3. Avoid adding generic stock-like images. Visuals should show the real game object/person/place.

### Backend Or Exporter Contract

Future action points:

1. Keep SVG icon registry and art registry separate.
2. Prefer small frontend-ready registries over importing large raw manifests in shared UI paths.
3. Include only browser-ready public paths, not Unity paths, GUIDs, or exporter internals.
4. Validate every emitted asset path at export/import time.

