# Codex Units Evolution

Status: in progress  
Target category: Units  
Internal kind: `units`

## Purpose

This document is the durable working memory for evolving the Codex Units category
using `docs/active/codex-category-evolution-playbook.md`.

Units are one of the largest and most strategically important Codex categories.
The goal is to make the Codex Units view useful for player comparison while not
duplicating the richer dedicated `/units` experience or inferring data from keys,
names, prose, or SVG filenames.

## Current State

- Units currently use the generic Codex split layout.
- The top-level Codex category is visible as `Units`.
- The generic left pane lists entries directly.
- Generic rows show context/preview text but do not help compare combat stats.
- Local 0.82 Codex export contains 156 Unit entries.
- `docs/current-action-priorities.md` says not to work on Units or unit art,
  but this category pass is explicitly requested and will avoid unit art.

## Phase 0 - Planning

### Classification Hypothesis

Units may be an Explorer, Archive, Reference Sheet, or a hybrid.

Initial hypothesis before audit:

- Units might be an Explorer because the product already has a dedicated Units
  page and raw export data contains progression/evolution fields.
- Units might still need a Codex Archive because the generic Codex export has
  clean facts and stat sections that can support a compact comparison surface.

The category shape must be earned from exported Codex data, not copied from
Heroes or the dedicated Units page.

### Audit Plan

- Count entries, facts, sections, references, icons, sparse rows, and outliers.
- Determine whether players browse by faction, unit class, battlefield role,
  melee/ranged, flying, cavalry, swarm, juggernaut, progression/evolution, stats,
  recruitment source, or granted abilities.
- Review current row/detail presentation.
- Audit exact relationships to factions, minor factions, units, and abilities.
- Classify exporter/data-quality findings as frontend action, exporter backlog,
  or intentionally deferred.

### Implementation Plan

No implementation was selected before audit. The smallest justified slice will
be chosen after proposal review.

## Phase 1 - Audit Findings

### Data Audit

Local sources:

- `local-imports/codex/ewshop_units_codex_export_0.82.json`
- `local-imports/exports/ewshop_units_export_0.82.json` for audit-only
  comparison against raw unit fields.

Codex entry shape:

- Entry count: 156.
- Facts:
  - `Kind`: 156
  - `Tier`: 156
  - `Class`: 156
  - `Spawn type`: 156
  - `Faction`: 154
- Sections:
  - `Stats`: 156
  - `Granted abilities`: 155
- `Spawn type` is `Land` for every current entry, so it is not useful
  navigation.

Fact distributions:

- Class:
  - Infantry: 34
  - Ranged: 31
  - Juggernaught: 22
  - Cavalry: 19
  - Flying: 15
  - Swarm: 9
  - Cavalry Ranged: 8
  - Flying Ranged: 6
  - Flying Swarm: 6
  - Juggernaught Ranged: 6
- Tier:
  - Tier 0: 40
  - Tier 1: 55
  - Tier 2: 53
  - Tier 3: 8
- Faction:
  - Major faction rosters: Kin of Sheredyn 24, Last Lords 21, Aspects 20,
    Tahuk 20, Necrophages 16.
  - Minor/protectorate-style rosters are mostly 1-5 entries each.
  - 2 entries lack a `Faction` fact.

Stats:

- Every unit has a `Stats` section.
- Most units have 6-8 stat lines.
- Common stat labels include Health, Damage, Movement Points, Dust Upkeep,
  Defense, Vision Range, Attack Range, Critical, and Defense while Defending.
- `Leader Priority` is absent from Codex stat sections and already filtered
  before public rendering.

Granted abilities:

- 155 entries have a `Granted abilities` section.
- Common ability labels include Ranged III/IV, Flying, Aware, Defense Expert,
  Can't Retaliate, Cruel, Leeching Strike, and class tags such as Swarm.
- Exact references resolve to Ability entries for many granted abilities.

References:

- Outbound exact references from Units resolve to:
  - Abilities: 377
  - Units: 232
  - Factions: 101
  - Minor Factions: 45
- Unresolved unique references in local data:
  - `Faction_Tormented`
  - `MinorFaction_Dungeon`
  - `MinorFaction_GreenScions`
  - `Unit_MinorFaction_MangroveOfHarmony_Final`

Raw-only progression evidence:

- Raw Units export has `previousUnitKey`, `nextEvolutionUnitKeys`, and
  `evolutionTierIndex`.
- Codex entries include unit `referenceKeys`, but they do not expose a dedicated
  `Evolution` section/fact that the frontend can safely treat as a progression
  model without additional interpretation.

### Browse Audit

Supported browse models:

- Class: strong first browse model. Present on every Unit and maps to combat
  comparison.
- Faction: strong identity browse model. Present on nearly every Unit and maps
  to roster planning.
- Tier: useful progression/comparison metadata. Present on every Unit.

Deferred browse models:

- Evolution/upgrade chain: raw data supports it, but Codex does not expose it
  as a safe structured fact/section.
- Battlefield role such as melee/ranged/flying/cavalry/swarm/juggernaut:
  mostly covered by exact `Class`; do not create another inferred taxonomy.
- Recruitment source: not exported as a public Codex fact.
- Granted ability navigation: exact but too noisy for first rail; belongs as
  compact row metadata/content and detail inspection.
- Combat-stat filters: useful someday, but would require deriving numeric stats
  from text/icon lines and is not appropriate for this pass.

### Navigation Audit

Recommended first navigation:

- Units-specific left rail.
- Groups:
  - Class
  - Faction
  - Tier

Navigation should not include:

- Spawn type, because all current entries are Land.
- Granted abilities, because the list would be noisy.
- inferred unit roles beyond exported Class.
- raw evolution/progression references.

### Main Panel Audit

Unit archive rows should optimize for comparison.

Primary content:

- Unit name.
- Compact stat grid from exact exported `Stats` lines.

Supporting metadata:

- Faction identity when exact related Faction/Minor Faction reference resolves.
- Class.
- Tier.

Compact relationships:

- Exact granted ability links when they resolve. Show them as compact chips/text,
  not full cards and not a separate dominant `Grants:` block.

Exporter/noise:

- `Kind: Unit` is redundant.
- `Spawn type: Land` is currently not useful.
- unresolved references should remain hidden.

### Detail Audit

Unit detail pages currently provide:

- complete Stats
- complete Granted abilities section
- related exact entries
- permalink/share target

No detail redesign is required for the first slice. A future detail pass could
make stats/evolution/abilities more profile-like, but Codex should not attempt
that before the archive rows are accepted.

### Relationship Audit

Exact relationships available:

- Unit -> Ability through `Granted abilities` section items and reference keys.
- Unit -> Faction/Minor Faction through exact references.
- Unit -> Unit through exact unit references that often represent evolution
  adjacency, but direction is not explicitly labeled in Codex.

Use unit-to-unit references cautiously. They are useful in details through
generic related entries, but row-level progression UI should wait for an
explicit Codex evolution relationship.

### Exporter Audit

Non-blocking findings:

- 2 Unit entries lack exported `Faction`.
- Several exact references do not resolve in current local Codex data:
  `Faction_Tormented`, `MinorFaction_Dungeon`, `MinorFaction_GreenScions`, and
  `Unit_MinorFaction_MangroveOfHarmony_Final`.
- Raw Units progression fields are useful, but generic Codex entries do not
  expose an explicit public evolution section/fact.

No blocker found.

## Phase 2 - Proposal Review

### What Is This Category?

Units should be treated as a Codex Archive for the current generic Codex export.

The dedicated `/units` route remains the richer Explorer experience. Codex Units
should be a compact comparison archive and permalink layer, not a second
progression explorer built from raw-only fields.

### How Does A 4X Player Browse It?

A player likely asks:

- What units does this faction have?
- Which units are Infantry, Ranged, Flying, Cavalry, Swarm, or Juggernaught?
- What tier/progression level is this unit?
- How do Health, Damage, Defense, Range, Movement, and upkeep compare?
- Which special abilities does this unit bring?

### Strongest Navigation Model

Use a Units rail with:

- Class
- Faction
- Tier

This is safe because those are exported facts. Counts help orientation. Filters
can combine, matching Hero archive behavior.

### What Remains Visible?

Rows should show:

- Unit name.
- stat grid from exported `Stats`.
- quiet right-side Faction/Class/Tier metadata.
- compact exact granted ability links in metadata or supporting row area.

### What Moves To Detail?

Detail should keep:

- complete Stats
- complete Granted abilities
- generic related entries, including exact Unit/Faction/Ability relationships
- raw provenance/context if currently rendered by shared detail components

### Smallest Meaningful Improvement

`UNITS-UI-001`:

1. Add Unit Archive mode.
2. Add Unit left rail with Class, Faction, and Tier groups.
3. Filter Units by selected Class/Faction/Tier.
4. Selecting/clearing Unit filters from a Unit detail route removes `entry` and
   returns to the Unit archive list.
5. Add stat-first Unit archive rows with quiet metadata and compact exact
   granted ability links.
6. Keep Unit detail pages generic for this first slice.

### Persona Challenge

UX designer:

- The rail must not become a second content surface. It should orient by roster
  and class, then let rows carry comparison.
- Faction rail may be long. This is acceptable because faction roster is a
  primary Units question, but it needs calm styling and dynamic counts.

Frontend tech lead:

- Follow existing explicit category-mode pattern used by Heroes/Equipment.
- Prefer `codexUnitArchiveFilters` and `UnitArchiveRail`; do not introduce a
  generic faceted framework.
- Keep raw-only evolution fields out of implementation.

4X player:

- The archive is useful only if stats are visible directly.
- Class/Faction/Tier are the right first browse knobs.
- Ability chips are helpful, but full ability cards or a noisy grants block
  would compete with the unit itself.

## Accepted Decisions

- Units is a Codex Archive for the current generic Codex export.
- The dedicated `/units` route remains the richer Explorer surface.
- First navigation uses exported Class, Faction, and Tier facts.
- Row primary content is exported Stats.
- Faction/Class/Tier are supporting metadata.
- Exact granted abilities may be compact metadata/relationship links.
- Do not infer unit roles or evolution chains.
- Unit detail pages may use exact rich Unit resolver data for compact
  previous/evolves-into inspection, but Codex must not recreate the dedicated
  `/units` evolution explorer.

## Implementation Results

### UNITS-UI-001 - Unit Archive Foundation

Implemented:

- Added Unit Archive mode for `category=units`.
- Added Unit left rail with Class, Faction, and Tier groups.
- Filters combine and clear without URL params.
- Selecting or clearing Unit filters from a Unit detail route removes `entry`
  and returns to the Unit archive list.
- Unit archive rows now show exported Stats as primary comparison content in a
  compact grid.
- Faction identity, Class, Tier, and exact resolved granted abilities render as
  quiet supporting metadata.
- Repeated generic Unit row icons are not rendered.
- Unresolved granted ability references stay hidden.

Validation:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`
  passed.
- `npx tsc --noEmit --project tsconfig.json` passed.
- `npm run build` passed with the existing large-chunk warning.

Browser/product smoke:

- Attempted to run a local browser/data smoke.
- Existing local frontend/backend ports were not serving usable routes.
- Starting the local backend jar failed because another local process owns H2
  TCP port `9092`.
- No pixel-level browser review is claimed for this pass.

### CODEX-RICH-002 - Unit Detail Evolution Enrichment

Implemented:

- Added a Unit-specific Codex rich resolver over existing `useUnitStore` data
  from `/api/units`.
- Exact matching uses selected Codex Unit `entryKey` to rich Unit `unitKey`.
- Runtime Unit DTO fields used:
  - `previousUnitKey`
  - `nextEvolutionUnitKeys`
  - `evolutionTierIndex` inspected but not surfaced
  - `abilityKeys` intentionally not rendered by this slice
- Added a compact Unit detail `Evolution` section with:
  - `Previous`
  - `Evolves into`
- Links render only when exact public Codex Unit targets resolve.
- Existing Codex inline link/tooltip behavior is reused.
- Missing rich data or unresolved targets fail closed with no placeholder.
- Unit archive rows, Unit filters, `/units`, backend/API/importer/exporter
  contracts, and local JSON import boundaries are unchanged.

Intentionally not implemented:

- no Unit archive row changes
- no evolution tree/graph inside Codex
- no key parsing or inferred evolution
- no rich ability grouping, because Codex detail already renders public
  `Granted abilities` and the current Unit DTO does not expose raw grouped
  helper/internal ability fields safely
- no generic rich resolver framework

Validation:

- `npm test -- --run src/lib/codex/codexUnitRichEnrichment.test.ts src/pages/CodexPage.test.tsx`
  passed during implementation.
- `npx tsc --noEmit --project tsconfig.json` passed during implementation.

## Product Review

UX designer:

- Class/Faction/Tier rail gives Units meaningful orientation without duplicating
  row content.
- Stat-grid rows are more scannable than generic context text.
- Faction rail is long, but acceptable because roster identity is a primary
  Units planning question.

Frontend tech lead:

- The implementation follows existing explicit category-mode boundaries.
- `codexUnitArchiveFilters` and `UnitArchiveRail` are product-specific rather
  than generic framework abstractions.
- `CodexSummaryDetail` continues to accumulate category row branches; a future
  extraction pass may be useful if more categories add rich row modes.

4X player:

- The archive now answers the first roster questions: faction, class, tier, and
  combat stat profile.
- Compact granted ability links are useful without letting relationships
  dominate the unit.
- Evolution chains remain the obvious missing planning layer, but they should
  wait for explicit Codex metadata rather than frontend inference.

## Refactor / Stale-Code Review

- No stale Unit-specific code was introduced.
- No generic filter framework was added.
- Existing Ability, Status, Equipment, Hero, and reference-sheet behavior is
  preserved by tests.
- Broader extraction of `CodexSummaryDetail` category row renderers is deferred
  because it would be a larger architectural refactor than this category slice.

## Open Questions

- Should Unit details eventually receive a comparison/profile layout?
- Should exporter add an explicit Codex Evolution section for Units?
- Should faction/minor-faction grouping be represented in the rail later?
- Should future row metadata use exact faction icons like Heroes once visually
  reviewed?

## Exporter Findings Recorded

Non-blocking Units findings were appended to
`docs/active/db-exporter-ability-metadata-handoff.md` during closeout.

## Future Roadmap

- `UNITS-UI-001` - Unit Archive foundation.
- `UNITS-UI-002` - Optional Unit detail/profile polish if product review finds
  detail pages too generic.
- `UNITS-UI-003` - Optional exact evolution presentation if exporter exposes
  public structured evolution metadata.

## Closeout

Completion decision: **complete with follow-up recommended**.

Justification:

- The first Codex Units Archive pass now provides player-facing browse,
  comparison rows, exact ability links, and stable route behavior.
- The category should not be called fully complete in an absolute sense because
  pixel-level browser review did not complete and evolution-chain UI remains
  exporter-dependent.
- No additional safe frontend-only slice is justified before review/commit.

Commit recommendation:

- Single commit: `feat(codex): add unit archive experience`
