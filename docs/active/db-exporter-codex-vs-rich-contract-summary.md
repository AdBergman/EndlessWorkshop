# DB Exporter Codex vs Rich Export Contract Summary

Status: active DB exporter contract packet  
Created: 2026-06-21  
Related:

- `docs/active/codex-rich-vs-codex-import-architecture-decision.md`
- `docs/active/codex-export-vs-rich-export-boundary.md`
- `docs/active/codex-rich-import-enrichment-audit.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`

## Purpose

This packet explains what EWShop needs from rich/domain exports versus Codex
projection exports, and records a deeper review of the current local rich JSON
exports under `local-imports/exports/`.

The important priority is source truth: if rich/domain exports are missing
important domain data, that is usually more important than a missing Codex fact.
Codex JSON can be adjusted later as a public projection of exporter source
truth.

## Core Rule

- Rich/domain export is the source-truth domain model.
- Codex export is the public encyclopedia/search/archive projection.
- EWShop frontend resolvers may optionally enrich Codex from already-imported
  rich data, but that is not a replacement for source-truth rich exports.
- DB Exporter should generally extract source truth into rich exports first,
  then project public Codex facts, sections, and references from that source
  where useful.

## Rich/Domain Export Should Contain

- Stable domain identity keys and public display labels.
- Structured relationship fields with direction and stable target keys.
- Progression/tree/graph fields for route-owned systems.
- Costs, prerequisites, unlocks, requirements, rewards, stats, effects,
  thresholds, and tactical profiles where they are domain source truth.
- Ownership/source/faction fields when source data proves them.
- Asset/icon/portrait identifiers when those are part of the rich route/domain
  model.
- Diagnostics and internal/debug fields, clearly separated from public data.

## Codex Export Should Contain

- Stable Codex entry identity and permalink key.
- Public display name, category/kind, shallow browse facts, and player-facing
  descriptions/effects.
- Row/detail-ready facts and sections for search, archive rows, and inspection.
- Exact references to public Codex targets.
- Canonical public metadata such as ownership, grouping, identity, and stable
  public icon references when those should be API-visible.

## Frontend Resolver May Use

- Existing imported rich stores and helpers.
- Exact sibling identity such as `entryKey`, `unitKey`, `techKey`, or explicit
  reference keys.
- Optional detail/profile enrichment that fails closed.

Resolvers must not infer from names, prose, duplicate titles, raw key fragments,
or SVG filenames. Resolvers must not copy route-owned UI, trees, branches, or
debug views into Codex.

## DB Exporter Backlog Owns

- Missing rich source-truth data.
- Canonical public metadata missing from both rich and Codex exports.
- Public grouping/ownership/identity/reference coverage.
- Stable public icon/art/portrait contracts.
- Projection gaps where Codex lacks public facts/sections that already exist in
  exporter source truth.

## What Not To Do

- Do not treat Codex export as the source-truth domain model.
- Do not flatten every rich graph into Codex.
- Do not make EWShop infer ownership, grouping, progression, or icons from
  keys/names/prose.
- Do not expose diagnostics/internal helper rows as public archive content.
- Do not delete existing exporter backlog items just because a resolver could
  solve a small EWShop detail display.

## Category Decision Table

| Category | Rich export state | Codex projection state | Contract decision |
| --- | --- | --- | --- |
| Tech | Strong imported source-truth graph: prerequisites, exclusives, faction prereqs, structured unlocks. | Good public archive; detail enriched by resolver. | Keep rich as graph source. Project shallow public prereq/unlock facts only if they should be API-visible Codex metadata. |
| Units | Strong imported source-truth identity, faction/class, stats, abilities, evolution fields. | Good archive rows/details. | Keep evolution/profile source truth in rich. Codex projection may add canonical public evolution facts if needed beyond EWShop resolver. |
| Heroes | Rich file exists but is not imported. Good identity/faction/class/skill-tree links. | Good archive rows; detail could become richer. | Source-truth priority is Hero/Skills import quality, especially skill labels/icons/portraits/defaults. Codex projection should stay public profile/reference layer. |
| Skills | Rich sidecar exists but no Codex category and not imported. | No Codex projection. | Rich export owns skill trees, tiers, placements, prereqs, effects, ability links. Do not create Codex projection unless a public Skills surface is approved. |
| Populations | Rich file exists but is not imported. Good food/worker/threshold data. | Codex already projects useful worker/threshold sections. | Rich export is future source truth for Population detail/profile. Improve labels/refs in rich before creating richer UI. |
| Abilities | Rich file exists but is not imported; tactical profiles and battle summaries are mixed with internal diagnostics. | Mature public archive; role/ownership gaps remain. | Split. Rich should own tactical source truth; Codex/exporter owns public roles, ownership, references. |
| Districts | Imported rich file with category/tier/faction flags, diagnostics, descriptors. | Good archive rows from Effects and Extracted resource. | Split. Rich owns source truth and diagnostics; exporter owns public planning facts/progression if they become canonical. |
| Improvements | Imported rich file with constructible/faction/category/effects. | Good archive rows from Effects. | Split. Rich owns constructible source truth; exporter owns public planning facts if source-proven. |
| Quests | Quest Explorer rich route export exists and is imported, but it is route-owned rather than Codex-owned. | Codex Quest records are hidden from top-level browsing and remain direct/search only. | Route export owns `/quests`; exporter should only provide source-truth questline/visibility metadata if Codex later adds encyclopedia-style Questline entries. |
| Equipment | No rich export. | Codex-only archive. | Exporter backlog owns public item icons and unresolved granted ability reference coverage. |
| Traits | No rich export. | Codex-only archive. | Exporter backlog owns public ownership/type/category semantics and reference coverage. |
| Actions | No rich export. | Codex-only archive. | Exporter backlog owns sparse public browse/ownership/reference metadata if source-proven. |
| Diplomacy | No rich export. | Codex-only archive. | Exporter backlog owns runtime/static treaty values, relationship direction, and icon metadata if source-proven. |
| Resources/Statuses | No rich export. | Codex-only/reference/archive. | Keep Codex-owned unless source data proves richer exporter metadata is needed. |

## Rich Export Gap Review

### Tech

Looks like a real domain model. Stable keys, display names, lore, era/quadrant,
faction specificity, prerequisite arrays, exclusive arrays, faction trait
prerequisites, and structured unlocks are present.

Gaps/weaknesses:

- Public faction references are raw-ish keys in rich data; Codex projection must
  remain responsible for player-facing faction labels/references.
- Full art/icon contracts are not visible in the rich export.
- Some unlock targets do not resolve to current public Codex targets; this is a
  projection/reference coverage issue, not a reason to parse names in EWShop.

### Units

Looks like a real domain model. Stable keys, faction/class, stats/effects via
description lines, grouped ability keys, and previous/next evolution fields are
present.

Gaps/weaknesses:

- Faction keys include some rough source values, for example a minor-faction key
  with trailing whitespace in the local data sample.
- Unit art/icon references are not visible.
- Upkeep/build/recruitment costs are not present if future roster/build tools
  need them.
- Many references are domain refs rather than public Codex targets; that is fine
  in rich export but requires explicit projection for Codex links.

### Heroes

Looks like useful source-truth profile data but is not imported by EWShop today.
Stable hero keys, faction/origin keys, class keys, grouped ability keys, default
skill keys, and applicable skill tree keys are present.

Gaps/weaknesses:

- Hero portrait/art/icon references are not visible.
- Five heroes have `originKind: unknown` in the local sample.
- Rich Skills sidecar is required for meaningful skill/profile enrichment, so
  Hero import without Skills is incomplete.
- Skill/public presentation metadata is still weak enough that importer work
  should be gated by player value.

### Skills

Looks like a real skill-tree source model. Skill trees, tiers, placements,
prerequisite/inhibited relationships, effects, primary ability links, and
resolved summaries are present.

Gaps/weaknesses:

- `displayName` often remains the raw skill key; `resolvedDisplayName` is the
  player-facing label.
- No explicit `iconKey` field was found in the skill entries.
- Only a few prerequisite/inhibited links are populated; confirm whether this is
  source-true or a missing relationship extraction.
- Skill import should preserve internal diagnostics but expose public labels and
  exact public ability refs separately.

### Populations

Looks like a compact domain model. Population keys, food cost, faction/affinity,
availability flags, worker lines, and threshold rewards are present.

Gaps/weaknesses:

- Major-faction `factionName` values are sometimes raw keys rather than display
  labels.
- Only one population has lore in the local sample.
- Threshold rewards include public-looking reward labels plus descriptor keys;
  Codex projection must keep unresolved/internal reward targets explicit.
- No explicit portrait/icon/art contract is visible.

### Abilities

Contains valuable tactical source-truth fields, but it also carries internal and
diagnostic concepts. Tactical profiles include target/range/shape/effect
categories, and battle summaries include low-level effect formulas.

Gaps/weaknesses:

- Explicit faction/origin ownership is still missing.
- `Combat role`-style public browse semantics should not be sourced directly
  from low-level `effectCategories`/mechanic tags.
- Rich export has 28 extra entries beyond Codex, including class/helper/internal
  rows. Importers/resolvers must keep public/internal separation strict.
- Ability icon/ownership/presentation contracts remain exporter-owned.

### Districts

Looks like a useful source model for canonical district rows and diagnostics.
Category, tier, faction specificity, descriptor keys, effect lines, and
excluded prototype/variant diagnostics are present.

Gaps/weaknesses:

- No adjacency/placement/upgrade-chain source-truth fields are visible.
- Faction keys are compact source keys, not necessarily public Codex references.
- Many district rows have no description lines; exporter notes should clarify
  when that is source-true.
- No icon/art contract is visible.

### Improvements

Looks like a useful source model for constructible rows. Constructible key/kind,
category, faction specificity, descriptor keys, and effect lines are present.

Gaps/weaknesses:

- Build costs, era/unlock timing, placement rules, and construction progression
  are not visible.
- No icon/art contract is visible.
- Duplicate display names exist and should not be treated as identity.
- Thin rows remain source/projection follow-up only when public mechanics exist.

### Quest Explorer

Looks like route-owned rich data: questline entry identity, navigation,
aliases, branches, lore view, strategy view, objectives, requirements, rewards,
and choices.

Gaps/weaknesses:

- It is not a 1:1 sibling of Codex Quest records.
- It should not be used to solve Codex duplicate-title grouping by itself.
- Codex should not recreate Quest Explorer. If Quests return to top-level
  Codex, they should be encyclopedia-style Questline entries backed by
  exporter source truth, not grouped quest-step records.
- EWShop owns any future projection from exported questline metadata into
  Codex rows/detail links. Exporter-owned fields should stay limited to
  canonical questline identity, public visibility, faction/chapter/count
  summaries, and stable links into Quest Explorer.

### Missing Rich Exports

Equipment, Traits, Actions, Diplomacy, Resources, Statuses, Factions, Minor
Factions, Councilors, Councilor Effects, and Partner Effects have no rich export
in `local-imports/exports/` today. They should remain Codex-only unless a future
rich route/profile need justifies source-truth exports.

## Codex Projection Gap Review

| Category | Rich export gaps | Codex projection gaps | Should fix rich first? | Should fix Codex projection? | Notes |
| --- | --- | --- | --- | --- | --- |
| Tech | Mostly strong; no art/icon contract visible. | Some rich unlock targets do not resolve publicly. | No major blocker. | Yes, if public unlock/prereq metadata should be API-visible. | Existing resolver is fine. |
| Units | Art/cost/upkeep absent; some rough faction keys. | Public evolution facts remain resolver-only. | Maybe, if future roster/build UI needs costs/art. | Maybe, if evolution should be public Codex metadata. | Do not rebuild `/units` in Codex. |
| Heroes | Not imported; portrait/icon absent; unknown origins; needs Skills sidecar. | Detail could use richer skills/profile refs. | Yes. | Later. | Rich Hero/Skills source quality should come before more Codex projection. |
| Skills | Display labels/icons need cleanup; relationship sparsity should be confirmed. | No Codex projection. | Yes. | No unless public Skills category approved. | Best treated as Hero sidecar first. |
| Abilities | Ownership absent; public/internal split must stay strict. | `Combat role` noisy; ownership missing. | Yes for tactical/ownership source truth. | Yes for role/ownership public facts. | Existing backlog remains valid. |
| Populations | Labels/lore/icon coverage weak. | Current Codex projection is already useful. | Yes before richer Population UI. | Minor. | Small dataset; defer unless category evolves. |
| Districts | Missing adjacency/placement/upgrade-chain/art if future planner needs it. | Category/tier/effect projection is mostly useful. | Yes for future planner. | Maybe for public progression facts. | Current archive good enough. |
| Improvements | Missing build cost/unlock timing/placement/art. | Current Effect projection good; thin rows remain. | Yes for future planning UI. | Maybe for public planning facts. | Current archive good enough. |
| Quests | Route export rich but not Codex sibling. | Future Questline encyclopedia metadata missing. | No; `/quests` already owns rich browsing. | Yes, only for source-truth public questline metadata. | Do not use title/key grouping or rebuild Quest Explorer in Codex. |

## Priority Requests For DB Exporter

### P0 - Rich Source-Truth Gaps

1. Hero + Skills rich export readiness: preserve exact Hero identity/origin,
   skill-tree, default-skill, skill relationship, and public label fields in a
   form EWShop can import without guessing. Add explicit portrait/icon keys only
   if those are stable public/domain asset contracts.
2. Ability rich/public split: keep tactical profiles and battle summaries as
   source truth, but add explicit ability ownership/origin metadata where
   source-proven and keep internal/helper rows clearly separated from public
   ability records.
3. Questline encyclopedia metadata: if Quests return to top-level Codex, export
   source-truth public questline identity, visibility, faction, chapter/count
   summaries, and Quest Explorer link targets. Do not expect EWShop to group by
   title, parse keys, or recreate Quest Explorer behavior in Codex.

### P1 - Codex Projection Gaps

1. Ability `Combat role` cleanup and future labels `Apply Status` /
   `Remove Status`.
2. Equipment granted ability reference coverage and per-item icon metadata if
   stable public icons exist.
3. Trait ownership/type/category semantics and reference coverage.
4. Action ownership/reference/browse metadata if source-proven.
5. Diplomacy relationship direction/runtime-static metadata and treaty icons if
   source-proven.
6. District/Improvement public planning facts only when source-proven and useful
   in Codex: progression, build cost, tier, unlock timing, or placement.

### P2 - Future Polish

1. Unit art/icon/upkeep/recruitment metadata if EWShop builds a richer roster or
   comparison tool.
2. Population icons/lore/public labels if Populations evolves beyond a reference
   sheet.
3. Stable portrait/icon contracts across Heroes, Units, Skills, Equipment,
   Traits, and Diplomacy as a separate asset-contract packet.

## Open Questions

- Should Hero and Skills rich exports be imported together as one feature slice,
  or should Skills remain a sidecar behind a future Hero detail resolver?
- Are sparse Skill prerequisite/inhibited relationships source-true?
- Which rich exports should own build/recruitment/upkeep costs, and are those
  values static enough for export?
- Should public icon/portrait contracts be standardized in one future exporter
  packet rather than category by category?
- Should the active exporter backlog be renamed later now that it covers more
  than abilities?

## Recommended Next Actions

1. Ask DB Exporter to prioritize rich/source-truth readiness for Heroes +
   Skills before EWShop builds more Hero detail enrichment.
2. Keep Ability role/ownership cleanup as an exporter-owned Codex projection
   request, but clarify that rich Ability tactical data is a separate
   source-truth concern.
3. Replace Quest archive-grouping asks with a narrower Questline encyclopedia
   metadata request; do not implement frontend grouping without exported
   questline identifiers, and do not recreate Quest Explorer in Codex.
4. Pause additional EWShop rich resolver work unless the decision template
   scores player value at least 6/10.
5. Keep Equipment, Traits, Actions, Diplomacy, Resources, and Statuses
   Codex-only for now.
6. Rename the active exporter backlog later if it becomes confusing, but do not
   rename it in this packet.
7. Treat art/icon/portrait contracts as a future focused packet unless a route
   implementation needs them immediately.
