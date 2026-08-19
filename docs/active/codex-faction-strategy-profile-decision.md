# Codex Faction Strategy Profile Decision

Status: implemented and revised 2026-08-19
Created: 2026-08-18
Related: `EW-CODEX-FACTIONS-001`, `EW-CODEX-FACTIONS-002`

## Decision

Use the existing Codex Faction category as the Faction strategy/profile surface.
The winning shape is a full-width category archive for Major and Minor Factions,
with richer detail on click. Do not create a new `/factions` route and do not
wait for an art/icon contract.

## Why

Current evidence supports a compact Codex profile:

- 5 public major Faction Codex entries are available.
- 21 rich faction-like records are imported through `/api/factions`.
- Existing detail enrichment already joins rich Faction records by exact
  `factionKey`.
- Existing package groups already cap exact trait, population, unit, hero, tech,
  and quest links to avoid a link wall.
- Faction pages are high-value strategy hubs, but the current generic dossier
  shape makes the strongest planning signals compete with ordinary related
  entries.

## Alternatives

### New `/factions` Route

Defer. A route-owned Faction planner may make sense later, but creating it now
would duplicate Codex detail, rich faction store behavior, and cross-category
link handling before the desired planner workflow is proven.

### Defer Until Art/Icon Contracts

Reject for the next slice. Faction identity icons already resolve safely, and
existing exact rich keys are enough to improve scanability without portraits,
key-derived icons, or new asset contracts.

### Add More Raw Related Links

Reject. More uncapped links would make Factions less useful for expert scanning.
Faction detail should organize the existing exact links into strategy-relevant
groups and preserve progressive disclosure.

## First Implementation Slice

`EW-CODEX-FACTIONS-002 - Faction Codex Archive and Detail Pass`

Scope:

- Use the established full-width Codex reference overview pattern for the small
  Major Faction and Minor Faction category archives.
- Use only exact Codex facts, exported sections, parsed public description
  lines, and exact rich faction package links already available in
  `buildCodexRichFactionPackageGroups`.
- Surface high-signal row content: affinity/disposition, faction-defining
  mechanics, minor-faction identity, units, and traits.
- Keep detail pages richer than rows, but avoid duplicating Core Effects in a
  separate branded profile section.
- Preserve existing Faction package caps and related-entry hiding.
- Preserve minor-faction package behavior and avoid implementation facts such
  as `Kind=MinorFaction`.

Non-goals:

- no new route;
- no faction planner/dashboard;
- no inferred ownership from key names;
- no art/portrait work;
- no uncapped relationship wall;
- no changes to rich import/API contracts.

Verification:

- focused `codexFactionPackage` and Faction detail render tests;
- `/codex?category=factions&entry=Faction_Aspect` / representative clicked
  browser QA;
- standard frontend type/build checks at PR close.

Result:

- The initial detail-first `Strategy profile` section was browser-reviewed and
  rejected as too much frontend-created count telemetry and duplicated effect
  text. It was removed.
- Major and Minor Faction category routes now use the established full-width
  overview pattern instead of a left result rail, giving the small archives the
  space they need.
- Major Faction overview rows now lead with affinity plus one or two exported
  strategic effect hooks rather than trait-name summaries.
- Minor Faction overview rows now lead with disposition, affinity, sourced
  identity text, unit identity, and trait identity.
- Major Faction detail now puts `Core Effects` before the trait list and removes
  the redundant standalone Affinity block.
- The old `Faction package` section is now `Faction systems`, and capped group
  overflow copy no longer exposes implementation wording such as `exact refs`.
- Minor Factions keep their structured dossier body and exact Faction systems
  links. Redundant `Kind=MinorFaction` structured facts are hidden as
  implementation noise.
- Browser review covered all five Major Factions, representative Minor Factions
  including Ametrine, Blackhammers, Hydracorns, and Mangrove of Harmony, desktop
  and mobile-width archive layouts. A metric-grid/layout direction from the
  first pass was removed rather than defended.

Closeout classification:

- Still actionable in EWShop now: none discovered within the Faction category
  after the full-width archive, sourced row-preview, package-label, Minor
  Faction noise, and duplicate-profile fixes.
- Exporter/source blocked: richer faction art/portrait contracts and stronger
  canonical ownership metadata for unrelated categories such as Actions/Traits
  remain exporter-owned if future Faction pages need them.
- Deliberately deferred because another EWShop route owns the experience:
  full Tech trees, Unit evolution/planner flows, and Quest Explorer branch
  traversal remain summarized and linked rather than recreated inside Codex.
- Optional future enhancement: a route-owned `/factions` planner can be
  reconsidered only after the Codex profile shape proves insufficient.

## Later Questions

- Whether a route-owned `/factions` strategy planner is worth building after the
  Codex profile proves its information hierarchy.
- Whether exporter-provided art/portrait metadata should become part of a future
  visual faction identity contract.
- Whether package groups should become expandable once exact relationship
  diagnostics show which unresolved links are source gaps versus hidden support
  policy.
