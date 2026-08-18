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

## Gated / Not Yet Registered

### Councilor Completeness

Do not create a numbered DBExporter request yet.

Current evidence:

- EWShop imports 43 `councilors-codex` rows.
- No Councilor-specific EWShop filters were found.
- All Councilor references resolve locally.
- No rich Councilor export exists for comparison.

Needed before request:

- DBExporter/source confirmation of expected public Councilor count and any
  omitted example records.

### District Adjacency / Placement

Do not create a broad exporter request yet.

Current evidence:

- Rich district/exporter JSON already contains terrain, river, POI/resource
  deposit constraints and level-up adjacent district counts.
- EWShop currently drops terrain/river/POI placement fields by DTO/domain/API
  shape.

Needed before request:

- Implement `EW-CODEX-DISTRICTS-001`.
- Re-audit whether any needed structured adjacency/placement information is
  still absent from source JSON.
