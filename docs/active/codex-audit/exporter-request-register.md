# DBExporter Request Register

Only proven or explicitly source-confirmation-gated exporter requests belong
here. Do not add "React does not show X" as an exporter request unless source
JSON was checked.

## DBX-CODEX-VICTORY-001 - Clarify or Emit the `Master` Victory Path

Affected categories: Victory Conditions, Victory Paths
Priority: P1
Blocking EWShop stories: `EW-CODEX-VICTORY-001`
Exporter-blocked: yes

Player-facing need: Victory Conditions should link to a complete, trustworthy
set of public Victory Paths before Victory becomes public top-level navigation.

Evidence information is not already available:

- Current Victory Conditions include `Master` as a path value for Supremacy and
  Insights per active release-readiness findings.
- `victorypaths-codex` currently has only 2 rows and no matching
  `VictoryPath_Master` public entry/reference.
- EWShop imports the files generically; this is not an EWShop filter/config
  issue.

Existing related fields/keys:

- `VictoryPath_Enrich` resolves for Enlightenment/Impress-style examples.
- Victory Conditions carry `Victory path` facts and exact path refs where
  exported.

Requested shape:

- If `Master` is public: emit a public `victorypaths-codex` row with stable
  `entryKey`, display name, description, path facts, and exact references from
  affected Victory Conditions.
- If `Master` is not public: mark/document affected Victory Condition path value
  as non-public/internal or emit a public replacement path value.

Why EWShop cannot derive it: path identity and public/non-public status are
source-truth decisions; deriving from string values would risk shipping a false
public victory taxonomy.

Intended EWShop use: unblock product review for public Victory categories and
exact path links.

Validation expectation: importing new Victory Codex files yields no public
Victory Condition path value without a matching public Victory Path entry or an
explicit non-public caveat.

## DBX-CODEX-MODIFIERS-001 - Emit Modifier Provenance Metadata

Affected categories: Modifiers, Actions, Traits, Diplomacy
Priority: P2
Blocking EWShop stories: none; supports future modifier detail usefulness
Exporter-blocked: yes

Player-facing need: when a player opens a Modifier via exact link/search, EWShop
should be able to say what grants or owns the modifier.

Evidence information is not already available:

- Modifier rows are imported from `bonuses-codex` and hidden from top-level
  browsing.
- EWShop can resolve many Action -> Modifier and Modifier -> affected target
  relationships, but source/granting provenance is not a stable public field.

Existing related fields/keys:

- `referenceKeys` and `publicContextKeys` on modifier rows.
- Category/kind classify cost modifiers.

Requested shape:

- For each public modifier where source is known and public-safe, emit:
  - `sourceKind`
  - `sourceKey`
  - `sourceDisplayName`
  - `sourceReferenceKey` when it resolves to a public Codex entry
  - optional `sourceVisibility` if source is intentionally non-public

Why EWShop cannot derive it: key prefixes and relationship direction are not a
safe source-of-truth provenance model.

Intended EWShop use: improve hidden Modifier detail pages and diagnostics while
keeping Modifiers out of top-level navigation.

Validation expectation: representative action/trait/diplomacy modifiers import
with exact source metadata or an explicit non-public/unknown source caveat.

## DBX-CODEX-ACTIONS-001 - Emit Action Ownership and Public Purpose Metadata

Affected categories: Actions
Priority: P2
Blocking EWShop stories: `EW-CODEX-ACTIONS-001`
Exporter-blocked: yes

Player-facing need: Action archive rows should explain who can use an action and
why a player should care about it, without elevating hidden Modifier mechanics
or inferring ownership from implementation keys.

Evidence information is not already available:

- `ewshop_actions_codex_export_0.82.json` has 139 raw Action rows.
- All 139 rows have `Category`, `Action type`, and `Kind` facts.
- Only 10 rows have exact `Origin faction` facts.
- No public-purpose or strategic-use fact is present in the local Action Codex
  export.
- Many rows have no public description and rely on `Action mechanics` sections
  that link hidden Modifiers.

Existing related fields/keys:

- `Category`, `Action type`, `Kind`, and sparse `Origin faction` facts.
- `Action mechanics` section items and `referenceKeys`, often pointing to
  hidden Modifier rows.

Requested shape:

- For each public action where source-truth information exists, emit:
  - `ownerKind`
  - `ownerKey`
  - `ownerDisplayName`
  - `ownerReferenceKey` when it resolves to a public Codex entry
  - `publicPurpose` or equivalent concise player-facing strategic role
  - optional `availabilityContext` for shared/faction/empire/army contexts
  - optional explicit unknown/non-public caveat when ownership or purpose is
    intentionally absent

Why EWShop cannot derive it: Action key prefixes, display names, categories,
and hidden Modifier relationships are not a stable public ownership or
player-purpose model.

Intended EWShop use: add safe Action row/filter polish while keeping hidden
Modifier mechanics secondary.

Validation expectation: representative faction, empire, army, constructible,
and terraforming actions import with exact owner/purpose metadata or explicit
unknown/non-public caveats.

## DBX-CODEX-ABILITIES-001 - Clean Ability Role and Ownership Metadata

Affected categories: Abilities, Units, Heroes, Equipment, Statuses
Priority: P2
Blocking EWShop stories: future Ability archive refinements
Exporter-blocked: yes

Player-facing need: ability filtering and comparison should distinguish public
combat roles, ownership/source, and status application/removal without noisy
engine labels.

Evidence information is not already available:

- Public `abilities-codex` has strong mechanics/effects/icons, but ownership is
  not explicit and role cleanup remains a known exporter follow-up.
- Rich abilities export exists but is not imported and contains internal/helper
  diagnostics; EWShop should not expose it wholesale.

Existing related fields/keys:

- Codex facts such as ability mechanic, target, range, cost, role-like values.
- `svgIcon` with `ability-icons` source.
- Exact refs from units/heroes/equipment/statuses where available.

Requested shape:

- Canonical public role labels.
- Explicit public owner/source metadata where source-proven:
  - `ownerKind`
  - `ownerKey`
  - `ownerDisplayName`
  - `ownerReferenceKey`
  - `availabilityContext` if shared/class/equipment/faction.

Why EWShop cannot derive it: ownership from key prefixes, display names, or
ability filenames is unreliable and may leak internal/helper abilities.

Intended EWShop use: safer Ability filters, row metadata, detail profile, and
cross-category relationship summaries.

Validation expectation: representative unit, hero, equipment, and status-linked
abilities have canonical role/owner facts or explicit unknown/non-public caveats.

## DBX-CODEX-EQUIPMENT-001 - Emit Equipment Icon Metadata and Public Ability Target Coverage

Affected categories: Equipment, Abilities
Priority: P2
Blocking EWShop stories: `EW-CODEX-EQUIPMENT-001`
Exporter-blocked: yes

Player-facing need: equipment rows/details should show item identity and granted
ability links without guessing from filenames.

Evidence information is not already available:

- `equipment-codex` has 160 rows with clean Type/Slot/Rarity/Tier/Value facts,
  Effects, and Granted abilities.
- No per-item `svgIcon` metadata is exported.
- Some granted ability references do not resolve to current public Ability
  Codex rows.

Existing related fields/keys:

- Granted ability section item `referenceKey`.
- Type/Slot/Rarity/Tier/Value facts.

Requested shape:

- Optional `svgIcon` or equivalent explicit icon metadata per equipment entry:
  - `source`
  - `key`
- For granted abilities, emit only public-safe exact ability refs or include a
  reason/caveat when the granted effect intentionally has no public Ability row.

Why EWShop cannot derive it: item icons and granted ability target identity from
equipment keys/SVG filenames would be visual/key inference.

Intended EWShop use: render equipment identity icons and improve ability
preview coverage.

Validation expectation: sample common/uncommon/rare/legendary equipment rows
resolve item icons and granted ability targets from explicit exported metadata.

## DBX-CODEX-REFERENCES-001 - Classify Unresolved Public Codex Reference Targets

Affected categories: Abilities, Factions, Heroes, Minor Factions, Populations,
Tech, Units
Priority: P2
Blocking EWShop stories: future reference-integrity hardening
Exporter-blocked: source-confirmation gated

Player-facing need: public Codex records should not imply relationships to
nonexistent, internal, obsolete, or rich-only targets. When a referenced target
is public, EWShop needs an exact public Codex row/ref; when it is non-public,
EWShop needs a source-backed caveat or omission policy.

Evidence information is not already available:

- `npm run diagnostics:codex-references` on 2026-08-19 checked 9,992 refs in
  current `local-imports/codex`.
- The upgraded diagnostic found 61 unique public-source unresolved
  relationships; after expected internal/effect and Quest-policy buckets, 34
  unique public unresolved relationships remain `unresolved pending further
  evidence`.
- The unresolved public set is not explained by EWShop top-level filters:
  target rows such as `Faction_Tormented`, `Faction_Hero`,
  `MinorFaction_GreenScions`, `MinorFaction_Dungeon`,
  `MinorFaction_MangroveOfHarmony_Elder`,
  `ProtectorateTrait_Blackhammer_Trait01/02`, selected Status keys, and
  selected Tech constructible aliases are absent from current public Codex
  targets.
- Rich/source exports prove some adjacent canonical rows exist, for example
  `MinorFaction_GreenScion` exists while Units reference
  `MinorFaction_GreenScions`; `Necrophage_District_Base_CityCenter_Tier1`
  exists while Factions reference `Necrophage_District_Base_CityCenter_Tier1_v2`.

Existing related fields/keys:

- `referenceKeys` and `publicContextKeys` in generic Codex entries.
- Current exact public Codex targets by `entryKey`.
- Rich/domain exports for Units, Heroes, Factions, Districts, Improvements, and
  Tech, where available, for source comparison only.

Requested shape:

- For each unresolved public relationship, classify the referenced target as:
  - public Codex;
  - rich-only/source-truth data;
  - internal/prototype;
  - obsolete/renamed alias;
  - unavailable/deferred.
- If public, emit a matching public Codex row or change the relationship to an
  exact public target key.
- If non-public, omit the relationship from public Codex refs or emit an
  explicit non-public/unknown caveat that diagnostics can classify without
  treating it as a player-facing missing target.

Why EWShop cannot derive it: pluralization, faction prefixes, `_v2` suffixes,
status aliases, and constructible aliases are not safe public identity rules.
EWShop must not invent canonical targets from key similarity.

Intended EWShop use: keep public relationship rendering exact and fail-closed,
reduce diagnostic false positives/false negatives, and support future
raw-fallback hardening without losing legitimate relationships.

Validation expectation: a future `diagnostics:codex-references` run shows no
public unresolved relationship in this set unless it carries an explicit
non-public/source-unavailable classification.

## DBX-CODEX-QUESTS-001 - Public Questline Encyclopedia Projection

Affected categories: Quests, Quest Explorer
Priority: P3
Blocking EWShop stories: `EW-CODEX-QUESTS-001`
Exporter-blocked: yes

Player-facing need: if Quests return to public top-level Codex, the category
should show questlines/chapters as encyclopedia records, not raw branch rows or
duplicate titles.

Evidence information is not already available:

- `quests-codex` has 300 rows, but repeated titles and branch/step records are
  unsafe for grouping.
- Rich `quest_explorer` is route-owned and not a safe Codex grouping source.

Existing related fields/keys:

- Codex Quest rows with facts/sections/referenceKeys.
- Quest Explorer entries with branches/navigation/strategy/lore data.

Requested shape:

- Public Questline Codex projection records with:
  - `questlineKey`
  - display name
  - public visibility
  - faction/reference key
  - chapter count and quest count when source-truth
  - short public summary
  - stable related Quest Explorer entry/root key
  - caveats for unresolved/internal variants

Why EWShop cannot derive it: duplicate titles, branch topology, aliases, and
Quest Explorer route semantics are not equivalent to public encyclopedia
identity.

Intended EWShop use: future top-level Quest Codex archive that links into
`/quests` without recreating Quest Explorer.

Validation expectation: no top-level questline row depends on title grouping,
key prefix parsing, or frontend branch reconstruction.

## DBX-CODEX-PUBLIC-CONTENT-001 - Fill or Classify Public Records Missing Gameplay Content

Affected categories: Abilities, Actions, Diplomatic Treaties, Equipment,
Improvements, Resources, Statuses, Traits
Priority: P2
Blocking EWShop stories: future Codex content-quality polish
Exporter-blocked: yes for source-thin aggregates; EWShop-owned ability rich
render gaps are excluded from this exporter ask

Player-facing need: public Codex records should satisfy small category-aware
semantic expectations. Traits, Abilities, and Statuses should normally expose
effect/mechanical content; Equipment should expose effects or granted
abilities; constructibles should expose effects, unlocks, requirements,
level-up rules, or placement constraints. Records that only show
classification/bookkeeping facts, or only context/provenance without category
gameplay content, are structurally present but not useful.

Evidence information is not already available:

- `npm run diagnostics:codex-player-content -- --input ../local-imports/codex
  --rich-input ../local-imports/exports --limit 160` on 2026-08-20 scanned
  2,588 Codex entries and 2,030 public entries.
- The category-aware run found 196 diagnostic candidates: Abilities 23, Actions
  84, Diplomatic Treaties 11, Equipment 2, Improvements 20, Resources 2,
  Statuses 20, Traits 34.
- These are not 196 exporter requests. Twelve Ability candidates are proven
  EWShop rich/import/render gaps because rich ability export rows contain
  nonzero effect lines, for example `Master of Arrows` has `+20% Damage on
  Units of this Ranged class` while generic public Codex shows only
  classification facts.
- The remaining 184 current candidates classify as `no-richer-source-found`
  after checking current generic Codex exports and available rich sidecars. This
  automatic status is intentionally less absolute than source-proven absence;
  sampled categories provide aggregate exporter/content evidence. Individual
  automatic findings retain unresolved ownership until manual evidence review
  establishes an exporter/content-side gap.
- `Feeding Frenzy`
  (`FactionTrait_LastLord_Chapter06AChoice01_FactionQuest`) is a live
  `missing-category-gameplay-content` Trait candidate: it has `Cost: 1`, `Kind:
  Trait`, `Trait type: Faction`, and quest reward/objective context, but no
  trait effect, granted ability, unlock, or requirement. Quest provenance is not
  mechanical/player-useful trait content.
- Ability shape-only examples such as `Collateral Damage I` have rich ability
  rows marked with `exclusionReason: missingUsefulDescription` and only provide
  labels such as `Shape: AoE 1`; EWShop should not treat that as useful rich
  enrichment.
- Sample no-richer-source-found examples include `Apotheosis Dirge` equipment,
  `Frenzied` status, `Builders' Quarters` improvement, `Surrender Demand`
  diplomatic treaty, and `Corpses` resource.
- Actions overlap with `DBX-CODEX-ACTIONS-001`; keep that request as the
  detailed ownership/purpose ask for Action rows.

Existing related fields/keys:

- Generic Codex `descriptionLines`, `facts`, `sections`, `referenceKeys`, and
  `publicContextKeys`.
- Rich/domain sidecars for abilities, districts, improvements, factions, heroes,
  populations, tech, units, and Quest Explorer, used only as evidence.

Requested shape:

- Address this as aggregate semantic needs by category, not per-row asks:
  - Traits/Abilities/Statuses: effect/mechanics, granted abilities,
    interactions, requirements, or explicit absent/internal semantics.
  - Equipment: effects, granted abilities, consumable use, or explicit
    unavailable/internal semantics.
  - Improvements/constructibles: effects, unlocks, requirements, level-up
    rules, placement constraints, or explicit absent/internal semantics.
  - Diplomatic Treaties/Resources/Actions: public purpose, effect, use,
    requirement/consequence, or explicit absent/internal semantics.
- If a row is internal/support data, mark or omit it so EWShop can keep it out
  of public Codex navigation and direct search results as appropriate.

Why EWShop cannot derive it: EWShop must not invent gameplay meaning from
classification labels, key names, cost values, faction prefixes, descriptors,
quest reward provenance, or rich diagnostic scaffolding.

Intended EWShop use: keep the player-facing content-quality diagnostic separate
from reference-integrity diagnostics and use it to distinguish EWShop render
gaps from genuine source/editorial thinness.

Validation expectation: a future `diagnostics:codex-player-content` run shows no
public records missing category-relevant gameplay content unless they carry an
explicit source-unavailable/internal/deferred classification that the diagnostic
can classify without opening a new exporter request.

## Gated / Not Yet Registered

### Councilor Completeness

Do not create a numbered DBExporter request yet.

Current evidence:

- EWShop imports 43 `councilors-codex` rows.
- No Councilor-specific EWShop filters were found.
- All Councilor references resolve locally.
- No rich Councilor export exists for comparison.
- `EW-CODEX-COUNCILORS-001` revalidated this on 2026-08-18 and found zero
  unresolved Councilor-sourced refs in `diagnostics:codex-references`.

Needed before request:

- DBExporter/source confirmation of expected public Councilor count and any
  omitted example records.

### District Adjacency / Placement

Do not create a broad exporter request yet.

Current evidence:

- Rich district/exporter JSON already contains terrain, river, POI/resource
  deposit constraints and level-up adjacent district counts.
- `EW-CODEX-DISTRICTS-001` fixed EWShop preservation/rendering for the existing
  rich `placementPrerequisites.neighbourTiles`, `terrain`, `river`, and
  `pointOfInterest` fields.

Needed before request:

- Re-audit whether any needed structured adjacency/placement information is
  still absent from source JSON.
