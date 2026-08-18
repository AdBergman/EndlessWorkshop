# Codex Faction Strategy Profile Decision

Status: active decision
Created: 2026-08-18
Related: `EW-CODEX-FACTIONS-001`

## Decision

Use the existing Codex Faction detail page as the Faction strategy/profile
surface. The next implementation slice should improve the first-screen
information hierarchy inside Faction detail, not create a new `/factions` route
and not wait for an art/icon contract.

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

`EW-CODEX-FACTIONS-002 - Faction Strategy Profile Header`

Scope:

- Add a compact detail-only strategy profile section above the existing Faction
  dossier/package sections.
- Use only exact Codex facts, parsed Faction trait lines, and exact rich faction
  package counts/links already available in `buildCodexRichFactionPackageGroups`.
- Surface high-signal planning dimensions: affinity, population, core-unit
  count, faction-tech count, hero count, questline presence, and trait count.
- Preserve existing Faction package caps and related-entry hiding.
- Preserve minor-faction package behavior; adjust only where the same strategy
  profile model has exact minor-faction data.

Non-goals:

- no new route;
- no faction planner/dashboard;
- no inferred ownership from key names;
- no art/portrait work;
- no uncapped relationship wall;
- no changes to rich import/API contracts.

Verification:

- focused `codexFactionPackage` and Faction detail render tests;
- direct-link `/codex?entry=Faction_Aspect` browser QA;
- standard frontend type/build checks at PR close.

## Later Questions

- Whether a route-owned `/factions` strategy planner is worth building after the
  Codex profile proves its information hierarchy.
- Whether exporter-provided art/portrait metadata should become part of a future
  visual faction identity contract.
- Whether package groups should become expandable once exact relationship
  diagnostics show which unresolved links are source gaps versus hidden support
  policy.
