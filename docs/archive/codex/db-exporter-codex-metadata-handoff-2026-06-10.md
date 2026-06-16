# DB Exporter Handoff: Codex Structured Metadata Coverage

Status: archived superseded handoff request
Audience: DB exporter team, backend/API team, EWShop frontend
Created: 2026-06-10

Archived note: this handoff predates the current local Codex imports with broad
metadata coverage. Use
`docs/active/codex-db-exporter-definitive-handoff.md` for the current
DB exporter/editorial Codex handoff.

## Handoff Intent

This document is the EWShop-side handoff for DB exporter work. It should be
reviewed before asking the DB exporter team to implement anything.

The recommended kickoff is intentionally small:

1. Review this handoff against the current exporter data.
2. Confirm or adjust the metadata shape for `equipment`.
3. Implement `equipment` metadata only.
4. Validate generated examples.
5. Report findings before moving to `councilors` or `traits`.

Councilors and traits are important, but they should not be bundled into the
first implementation pass unless equipment is already complete and validated.

## Product Goal

Make Codex detail pages feel like a premium strategy companion instead of a
searchable dump of description text.

The frontend can already import, store, serve, and render optional Codex
metadata fields:

- `facts`
- `sections`
- `publicContextKeys`

These fields should be treated as canonical optional fields on generic Codex
entries across all Codex export kinds.

All Codex exporters should preserve the same field names and shapes. Export
kinds may emit empty arrays when no meaningful public metadata is available,
but they should not invent kind-specific metadata shapes or treat populations
as a separate special contract.

Population is the reference implementation, not a one-off metadata contract.

Canonical does not mean exhaustive. EWShop wants minimal, pragmatic,
high-signal metadata that improves Codex reading and linking. Do not mirror full
rich exports into generic Codex metadata.

The remaining gap is exporter coverage. In the current local 0.80 Codex
payloads, only `populations` emits these fields. Other Codex kinds still expose
useful information only as `descriptionLines`, which forces the frontend to
parse prose or render generic paragraphs.

The objective is not to invent more game data. The objective is to make
existing exported data more structured, navigable, linkable, readable, and
SEO-friendly for Codex detail pages.

Structured metadata is valuable because it lets EWShop:

- show compact facts panels instead of long text blocks;
- group effects, unlocks, requirements, and relationships into readable
  sections;
- link related Codex entries through stable public keys;
- support richer search/filter/summaries without fragile text parsing;
- improve generated SEO pages with better semantic density;
- keep `descriptionLines` as readable fallback copy rather than the only data
  contract.

Metadata should earn its place. Prefer fewer useful facts and sections over
large payloads that make Codex feel noisy or duplicate richer domain pages.

## What The Frontend Wants To Render

The frontend does not only want the fields to exist. It wants enough structure
to render Codex entries as readable dossiers without parsing player-facing prose.

The fields have distinct meanings. Please do not use them interchangeably.

| Field | Frontend meaning | Put here | Do not put here |
| --- | --- | --- | --- |
| `facts` | Scannable key/value facts about the entry itself | Short labels and short display values | Long effect text, prose paragraphs, raw identifiers as labels, diagnostic counts |
| `sections` | Titled readable groups below the facts | Effects, requirements, unlocks, availability, repeated structured items | Duplicated facts, ungrouped copies of every description line, empty sections |
| `publicContextKeys` | Curated public relationship graph | Stable public keys for related Codex/game-data entries | Raw descriptors, mapper names, Unity paths, GUIDs, helper/internal keys, noisy implementation references |

If a value is useful for a human to scan directly, it is usually a `fact`.
If it explains what the entry does, unlocks, grants, requires, or modifies, it
is usually a `section`.
If it is a relationship target for navigation/linking/SEO, it is usually a
`publicContextKeys` entry.

### `facts`

Frontend use: a compact key/value facts grid near the top of the Codex detail.

Put information here when it is:

- short;
- stable;
- useful for quick scanning;
- a property of the entry itself.
- one of the few facts a player would expect to see first.

Examples:

- Equipment: `Type`, `Slot`, `Rarity`, `Tier`, `Access pool`, `Value`
- Councilors: `Faction`, `Role`, `Councilor effect`, `Partner effect`
- Traits: `Category`, `Cost`, `Required affinity`
- Heroes: `Faction`, `Class`, `Spawn type`
- Factions/minor factions: `Kind`, `Affinity`, `Population`, `Unit`, `Trait`

Avoid long effect text in facts. Long effect text belongs in `sections`.
Most entries should only need a small facts set, often 3-8 items.

### `sections`

Frontend use: titled blocks below the facts grid. Sections should turn prose
clusters into readable groups.

Use `section.lines` for simple grouped lines. Use `section.items` when the
section contains repeated structured rows, such as population thresholds,
requirements, unlocks, or grouped rewards.

Examples:

- `Effects`: stat/effect lines with bracket tokens preserved.
- `Granted abilities`: ability names/keys when provable.
- `Requirements`: prerequisites, restrictions, or required affinities.
- `Availability`: access pool, faction, quest, era, or tier constraints.
- `Threshold rewards`: repeated population threshold items.
- `Associated content`: related unit/population/trait/faction rows.

Avoid empty sections and avoid dumping every description line into one generic
section. If structure is not provable, leave the line in `descriptionLines`.
Most entries should only need 0-3 sections.

### `publicContextKeys`

Frontend use: stable relationship graph for future related-entry links,
summaries, filtering, and SEO entity relationships.

Include keys only when they are:

- public-facing;
- stable across exports;
- meaningful to a user;
- resolvable or likely resolvable by EWShop/Codex.

Good examples:

- owning faction keys;
- related ability keys;
- related trait keys;
- related equipment keys;
- related tech/district/improvement keys;
- related population/minor-faction keys.

Do not include raw descriptors, helper definitions, source object paths,
mapper names, GUIDs, or keys that are only useful to exporter diagnostics.

`referenceKeys` can continue to carry existing broad references. Use
`publicContextKeys` for curated, high-signal relationships that are suitable
for product UI and SEO.

Do not include every technically related key. A small set of meaningful
relationships is better than a noisy graph.

## Current Coverage Verification

Checked against `local-imports/codex/*_codex_export_0.80.json`.

| Codex kind | Entries | With facts | With sections | With public context keys |
| --- | ---: | ---: | ---: | ---: |
| `populations` | 26 | 26 | 25 | 26 |
| `abilities` | 326 | 0 | 0 | 0 |
| `councilors` | 47 | 0 | 0 | 0 |
| `districts` | 167 | 0 | 0 | 0 |
| `equipment` | 159 | 0 | 0 | 0 |
| `factions` | 5 | 0 | 0 | 0 |
| `heroes` | 79 | 0 | 0 | 0 |
| `improvements` | 123 | 0 | 0 | 0 |
| `minor_factions` | 16 | 0 | 0 | 0 |
| `quests` | 292 | 0 | 0 | 0 |
| `tech` | 133 | 0 | 0 | 0 |
| `traits` | 178 | 0 | 0 | 0 |
| `units` | 157 | 0 | 0 | 0 |

Example already working shape from populations:

```json
{
  "facts": [
    { "label": "Faction", "value": "Faction_Aspect", "referenceKey": "Faction_Aspect" },
    { "label": "Base food cost", "value": "60" }
  ],
  "sections": [
    { "title": "Worker effects", "lines": ["+1 [CultureColored] Influence"] },
    {
      "title": "Threshold rewards",
      "items": [
        {
          "label": "At 5 population",
          "facts": [{ "label": "Reward", "value": "Nutrient Extractor" }]
        }
      ]
    }
  ],
  "publicContextKeys": ["Population_Aspect", "Faction_Aspect"]
}
```

Preferred first target shape for equipment:

```json
{
  "entryKey": "Equipment_Accessory_01_Definition",
  "displayName": "Scions' Charm",
  "descriptionLines": [
    "The tangle of roots appears worthless...",
    "Type: Accessory",
    "Slot: Accessory",
    "Rarity: Common",
    "Tier: 0",
    "Access pool: Marketplace",
    "Value: 50.00",
    "+1 [Determination] Determination"
  ],
  "facts": [
    { "label": "Type", "value": "Accessory" },
    { "label": "Slot", "value": "Accessory" },
    { "label": "Rarity", "value": "Common" },
    { "label": "Tier", "value": "0" },
    { "label": "Access pool", "value": "Marketplace" },
    { "label": "Value", "value": "50.00" }
  ],
  "sections": [
    {
      "title": "Effects",
      "lines": ["+1 [Determination] Determination"]
    }
  ],
  "publicContextKeys": ["Equipment_Accessory_01_Definition"]
}
```

This example is illustrative. The exporter should derive the final equipment
shape from actual source data and include additional public relationships only
when they are proven.

## Population Prototype Review

Population metadata proves the framework is useful, but it should not be copied
blindly.

What is working well:

- Population facts create a useful Codex facts grid: type, faction, default
  status, custom-faction availability, and base food cost.
- `Worker effects` maps cleanly to a readable section.
- `Threshold rewards` maps cleanly to a timeline-style presentation.
- `publicContextKeys` gives EWShop useful relationship anchors such as
  population, faction, minor-faction, unit, and improvement keys.
- EWShop frontend already prefers exported `facts` and `sections` over
  fallback text parsing when metadata is present.

What should be improved or avoided in future kinds:

- Generic values such as `Reward: Descriptor`, `Reward: Cost modifier`, or
  `Reward: Constructible` are not useful display metadata by themselves.
- If a generic reward type has a player-facing `lines[]` value, the line is the
  useful UI value and should be preserved.
- If the exporter cannot expose a meaningful public reward name or display
  line, it is better to omit the low-value reward fact than to emit a generic
  placeholder.
- Do not treat population's noisier threshold internals as the standard for new
  metadata. Treat its facts/sections/timeline shape as the useful pattern, and
  tighten value quality for new domains.

Frontend usage today:

- `facts` render as the Codex structured facts grid.
- `sections.lines` render as titled content blocks.
- population threshold `sections.items` render as timeline entries.
- `publicContextKeys` are imported, stored, and served by the API, but are not
  yet broadly rendered as related links. They are still useful future-facing
  relationship data and should remain curated.

For equipment Phase 1, EWShop expects this minimum mapping when values are
available:

| Source meaning | Target field | Label/title |
| --- | --- | --- |
| Equipment type/category | `facts[]` | `Type` |
| Equipment slot | `facts[]` | `Slot` |
| Rarity | `facts[]` | `Rarity` |
| Tier | `facts[]` | `Tier` |
| Access pool | `facts[]` | `Access pool` |
| Value/cost | `facts[]` | `Value` |
| Stat/effect lines | `sections[]` | `Effects` |
| Granted ability rows | `sections[]` | `Granted abilities` |
| Proven requirements or restrictions | `sections[]` | `Requirements` or `Availability` |
| Equipment key itself | `publicContextKeys[]` | raw value only, no label |
| Related public ability/faction/trait/tech/resource keys | `publicContextKeys[]` | raw value only, no label |

If a row only has facts and effects, that is acceptable. Do not invent
requirements, relationships, or sections to fill space.

Equipment Phase 1 anti-examples:

- Do not emit `{ "label": "Descriptor", "value": "Descriptor_..." }`.
- Do not emit `{ "label": "Internal Descriptor Count", "value": "17" }`.
- Do not put `+1 [Determination] Determination` in `facts`.
- Do not put `Type: Accessory` in an `Effects` section.
- Do not include Unity object paths, GUIDs, mapper names, or raw descriptor
  keys in `publicContextKeys`.
- Do not create an empty `Granted abilities` section when no granted ability is
  proven.

## Recommended Exporter Priority

The long-term goal is broad Codex metadata coverage across all generic Codex
exports. Phase 1 should remain small so the exporter/backend/frontend teams can
validate the framework before expanding it.

Recommended expansion order:

1. `equipment`
2. `abilities`
3. `councilors`
4. `traits`
5. `factions` and `minor_factions`
6. `heroes`
7. `tech`, `districts`, and `improvements`
8. `quests`
9. `units`

Kinds that already have rich dedicated pages or imports, such as `tech`,
`districts`, `improvements`, and `units`, should still keep the canonical Codex
metadata shape, but their Codex metadata can be thinner unless a Codex detail
use case needs more structure.

## Coverage Policy By Codex Kind

| Codex kind | Current metadata coverage | Recommended coverage level | Notes |
| --- | --- | --- | --- |
| `populations` | populated | reference implementation | Keep as-is and use as the model for shape and safety. |
| `equipment` | empty | focused P0 | Best first slice: stable visible facts and effect sections already exist in current text. |
| `abilities` | empty | focused P1 | High linking value across units, traits, heroes, equipment, and Codex; keep relationships curated. |
| `councilors` | empty | focused P1 | Profile-style Codex content; clarify prototype/demo visibility. |
| `traits` | empty | focused P1 | Important for build identity; expose cost/category/effects/requirements when public-safe. |
| `factions` | empty | moderate P1 | Navigation anchor content; public identity and related content matter more than many facts. |
| `minor_factions` | empty | moderate P1 | Navigation anchor content; useful for disposition, affinity, population, unit, and trait relationships. |
| `heroes` | empty | moderate P1 | Keep in Codex for now; structure ownership/class/stats/abilities without starting a Heroes page. |
| `tech` | empty | thin/moderate P2 | Rich Tech page/import already exists; Codex metadata should improve detail pages and links without duplicating the full tech tree. |
| `districts` | empty | thin/moderate P2 | Rich district import exists; Codex metadata can expose type/category/effects/requirements where useful. |
| `improvements` | empty | thin/moderate P2 | Rich improvement import exists; Codex metadata can expose category/effects/requirements where useful. |
| `quests` | empty | thin P2 | Keep Quest Explorer as the topology/strategy source. Codex metadata should remain encyclopedia/search oriented. |
| `units` | empty | thin P2 | Units page owns rich unit comparison. Codex metadata should stay lightweight unless a Codex detail use case needs more. |

### DBX-CODEX-META-001: Equipment Metadata

Priority: P0 kickoff slice

Reason: Equipment is high-value Codex content and current rows already contain
stable player-facing prefixes such as `Type`, `Slot`, `Rarity`, `Tier`,
`Access pool`, and `Value`. This should be the easiest meaningful slice after
populations.

Suggested facts:

- `Type`
- `Slot`
- `Rarity`
- `Tier`
- `Access pool`
- `Value`

Suggested sections:

- `Effects`: stat/effect description lines, preserving bracket tokens.
- `Granted abilities`: ability keys/display names when provable.
- `Requirements` or `Availability`: faction, quest, tier, or pool constraints
  when public-safe and provable.

Suggested context keys:

- equipment key
- related ability keys
- related faction, resource, trait, quest, or reward keys when available

Acceptance:

- All public equipment Codex rows emit structured facts for the stable visible
  prefixes when source data is available.
- Effect lines remain in `descriptionLines` and are also grouped in a section
  when possible.
- Metadata remains compact: do not add low-value facts or broad relationship
  graphs just because the exporter can find them.
- No Unity internals, GUIDs, filesystem paths, mapper names, raw DB object
  paths, or private diagnostics are emitted.
- Existing generic Codex root shape and `exportKind` remain backward-compatible.
- Population Codex metadata remains unchanged.
- Generated examples are reviewed manually; compilation alone is not enough.

### DBX-CODEX-META-002: Ability Metadata

Priority: P1 after equipment, before or alongside councilors depending on
exporter confidence.

Reason: Abilities are heavily reused across Codex, units, heroes, traits, and
equipment. Better ability metadata improves linking and tooltip/detail quality
without requiring frontend naming heuristics.

Suggested facts:

- ability kind, such as active/passive, when public-safe
- category or family when player-facing
- source/domain when useful, such as unit ability or hero ability

Suggested sections:

- `Effects`
- `Requirements`
- `Related abilities`
- `Granted by`, when provable through public keys

Acceptance:

- Ability rows expose effect text and stable public relationships where
  available.
- Public ability keys remain the stable identity.
- Battle-skill, descriptor, presentation, or mapper internals do not leak.

### DBX-CODEX-META-003: Councilor Metadata

Priority: P0 after equipment

Reason: Councilors are personality/decision content. Better metadata would let
EWShop render them as profile cards instead of plain text rows.

Suggested facts:

- faction or minor-faction ownership
- role
- councilor effect
- partner effect
- public visibility/prototype status if needed

Suggested sections:

- `Councilor effect`
- `Partner effect`
- `Additional effects`

Acceptance:

- Prototype/demo-looking rows are either excluded from public Codex or clearly
  flagged as non-public/test content.
- Public councilor rows have stable display names and ownership context where
  available.
- `referenceKeys` or `publicContextKeys` include owning faction/minor-faction
  keys when provable.

### DBX-CODEX-META-004: Trait Metadata

Priority: P1

Reason: Traits are build/identity decisions. Structured cost/category/effect
data would materially improve browsing and comparison.

Suggested facts:

- category
- kind
- cost
- required affinity
- exclusions

Suggested sections:

- `Effects`
- `Exclusions`
- `Requirements`
- `Granted abilities`

Acceptance:

- Public trait rows expose cost/category/effect as structured metadata.
- Internal quest-only or implementation traits are excluded or clearly flagged.
- References resolve only to public abilities, factions, tech, traits, or other
  public Codex/game-data keys.

### DBX-CODEX-META-005: Factions And Minor Factions Metadata

Priority: P1

Reason: Faction and minor-faction Codex rows are navigation anchors for many
other domains. Better context improves linking and summaries across the app.

Suggested facts:

- faction kind
- affinity/disposition
- population
- unit
- trait
- public label

Suggested sections:

- `Identity`
- `Associated content`
- `Effects`

Acceptance:

- Major/minor faction rows expose stable public keys and labels.
- Related public keys are included only when provable.

### DBX-CODEX-META-006: Hero Metadata

Priority: P1, separate from Units work

Reason: Heroes belong in Codex now. Structured metadata would improve hero
detail pages without starting a dedicated Heroes page.

Suggested facts:

- owning faction
- class
- spawn type
- role/archetype when public-safe

Suggested sections:

- `Stats`
- `Abilities`
- `Starting traits`
- `Default skills`, only if product decides hero skills should be public Codex
  data

Acceptance:

- Major-faction hero ownership uses explicit exporter context, not frontend key
  parsing.
- Generic/world-owned heroes remain clearly distinct from major-faction heroes.

### DBX-CODEX-META-007: Tech, District, And Improvement Metadata

Priority: P2

Reason: These domains already have richer imports or dedicated UI surfaces, but
their Codex entries still benefit from lightweight facts and public context
keys for encyclopedia browsing, generated SEO, and cross-linking.

Suggested facts:

- category/type
- faction or availability when public-safe
- era/tier/quadrant for tech when available
- cost or unlock category when player-facing

Suggested sections:

- `Effects`
- `Unlocks`
- `Requirements`
- `Related content`

Acceptance:

- Codex metadata does not duplicate entire rich-domain DTOs.
- Metadata stays concise and useful for Codex detail pages.
- Rich pages remain the canonical source for deep domain-specific interaction.

### DBX-CODEX-META-008: Quest Metadata

Priority: P2, encyclopedia-only

Reason: Quest Explorer is the canonical topology, lore, and strategy surface.
Quest Codex metadata should improve encyclopedia browsing and linking without
recreating Quest Explorer semantics.

Suggested facts:

- quest category/type
- owning faction or questline when public-safe
- chapter/step labels only when exporter semantics are explicit

Suggested sections:

- `Objective`
- `Requirements`
- `Rewards`
- `Related quests`

Acceptance:

- Do not infer topology from quest titles or prose.
- Do not duplicate Quest Explorer branch/lore/strategy structures.
- Exact links to Quest Explorer can be added later through explicit keys or
  aliases.

### DBX-CODEX-META-009: Unit Metadata

Priority: P2, lightweight only for now

Reason: Units already have a dedicated page and rich unit import. Codex unit
metadata should help encyclopedia browsing without becoming a second unit
comparison system.

Suggested facts:

- faction
- class
- spawn type
- tier/evolution family when public-safe

Suggested sections:

- `Stats`
- `Abilities`
- `Progression`, only when based on public exported metadata

Acceptance:

- Do not duplicate the Units page interaction model.
- Do not introduce new unit art or unit-card behavior from this handoff.
- Keep metadata concise and stable for Codex detail/search.

## Metadata Design Rules

Use populations as the reference implementation. The metadata should feel like
one coherent Codex framework, not custom one-off schemas per export kind.

Every generic Codex export should follow the same metadata contract:

```json
{
  "facts": [],
  "sections": [],
  "publicContextKeys": []
}
```

If an exporter has no meaningful public metadata for a given row or kind yet,
empty arrays are acceptable. The important contract point is that the meaning
and shape stay consistent across Codex kinds.

Validation rule of thumb:

- A frontend engineer should be able to render `facts` directly as a key/value
  grid without rewriting labels.
- A frontend engineer should be able to render each `section.title` as a visible
  heading without it sounding like exporter internals.
- A frontend engineer should be able to use each `publicContextKeys` value as a
  possible product relationship without filtering out implementation noise.
- A product reviewer should not feel like the Codex detail has become a raw
  data dump.
- If any of those are false, the value probably belongs in diagnostics or should
  remain only in `descriptionLines`.

### Facts

Use facts for compact, high-value information users scan first.

Good fact examples:

```json
{ "label": "Slot", "value": "Accessory" }
```

```json
{ "label": "Rarity", "value": "Common" }
```

Avoid facts that expose exporter implementation details or internal counts.

### Sections

Use sections for grouped readable information, such as:

- `Effects`
- `Granted abilities`
- `Requirements`
- `Availability`
- `Councilor effect`
- `Partner effect`
- `Exclusions`

Avoid giant walls of text. Keep `descriptionLines` as fallback copy, but use
sections to expose structure when the exporter can do so safely.

### Public Context Keys

Use `publicContextKeys` for stable user-facing relationships that can support
future navigation, summaries, and SEO entity relationships.

Include only keys that are meaningful and public-safe, such as related:

- factions
- minor factions
- abilities
- traits
- equipment
- resources
- tech
- improvements/districts

Do not include helper keys, raw descriptors, internal mapper names, GUIDs, file
paths, or noisy implementation references.

Quality matters more than quantity.

## Suggested DB Exporter Kickoff Prompt

```md
Please review and implement the first bounded slice of Codex structured
metadata coverage for EWShop.

Historical source:
docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md

Goal:
Extend the existing generic Codex metadata fields `facts`, `sections`, and
`publicContextKeys` beyond populations.

Important context:
- EWShop backend/frontend already imports, stores, serves, and renders these fields.
- Current verified state: only `populations` emits structured metadata.
- Populations are the reference implementation.
- These fields are canonical optional fields for all generic Codex export kinds,
  not a population-only feature.
- Metadata should be minimal and high-signal. Do not mirror full rich exports
  into Codex.
- The first target is `equipment` only.
- Do not change the generic Codex root shape.
- Do not add new metadata fields.
- Keep `descriptionLines` as fallback copy.
- Do not expose Unity internals, GUIDs, mapper names, raw DB paths, raw
  descriptors, or diagnostics.

Task:
1. Inspect population metadata and current equipment Codex output.
2. Confirm or adjust the equipment metadata shape.
3. Implement equipment metadata only.
4. Generate a fresh export.
5. Review real generated examples.
6. Confirm no internal/exporter-only data leaks.
7. Report fields that are unavailable, unsafe, or need a later contract decision.

Please stop after equipment and report findings before moving to councilors or
traits.
```

## Backend/API Impact

EWShop backend already has support for the optional metadata fields:

- import DTOs accept `facts`, `sections`, and `publicContextKeys`;
- persistence stores facts/sections as JSON and context keys separately;
- API response DTOs return the fields;
- frontend types and store normalization preserve the fields.

Backend work after exporter delivery should be limited to fixture/contract
tests unless the exporter adds a new shape beyond the existing optional fields.

## Frontend Impact

EWShop frontend should:

- prefer exporter-provided metadata when present;
- keep text-prefix parsing only as fallback for older exports;
- render facts and sections consistently in Codex detail pages;
- use `publicContextKeys` and `referenceKeys` for links only when exact and
  public-safe.

## Non-Goals

- Do not redesign the whole Codex UI as part of exporter metadata delivery.
- Do not start Quest Explorer behavior work from this handoff.
- Do not start Units or unit art work from this handoff.
- Do not expose exporter internals, Unity paths, GUIDs, mapper names, or raw DB
  object paths.
- Do not remove `descriptionLines`; they remain fallback and readable copy.
