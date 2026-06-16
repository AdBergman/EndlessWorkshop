# DB Exporter Handoff: Missing Codex Reference Kinds

Status: archived superseded handoff request
Audience: DB exporter team, backend/API team, EWShop frontend
Created: 2026-06-10

Archived note: this handoff predates current EWShop support for Actions,
Diplomatic Treaties, and bonus-derived Statuses. Use
`docs/active/codex-db-exporter-definitive-handoff.md` for the current
DB exporter/editorial Codex handoff.

## Handoff Intent

This is a separate request from `db-exporter-codex-metadata-handoff.md`.

The existing metadata handoff asks for richer `facts`, `sections`, and
`publicContextKeys` on Codex kinds that already exist.

This handoff asks for new linkable Codex export kinds that do not currently
exist, but are already visible to users in Quest Strategy, tech unlocks,
population rewards, diplomacy, and faction systems.

The immediate frontend problem is not that these rows need prettier text. The
problem is that EWShop can only infer them from display strings, reward kinds,
target roles, or internal-looking keys. That is not strong enough for Codex
links, search, tooltips, SEO, or future comparison views.

## Product Goal

Make actions, bonuses, and diplomatic treaties first-class public Codex entries
so user-facing rows can link to the actual game concept instead of rendering a
generic diamond and plain text.

This is higher product value than enriching some existing Codex entries because
these concepts are currently unresolvable. Metadata enrichment makes existing
pages better; this work creates missing pages and stable references.

## Current Verified Gaps

Local 0.80 Codex payloads currently include:

- `abilities`
- `councilors`
- `districts`
- `equipment`
- `factions`
- `heroes`
- `improvements`
- `minorFactions`
- `populations`
- `quests`
- `tech`
- `traits`
- `units`

They do not include action, bonus/status-effect, or diplomatic treaty Codex
exports.

Quest Explorer currently exposes user-visible rows that cannot resolve to Codex:

- rewards such as `Unlock empire action: Mukag Light`
- requirements such as `Use faction action: Mukag Monsoon Festival twice`
- requirements such as `Use Build Bridge twice`
- rewards such as `Gain bonus: Ahead in the Polls`
- rewards such as `Gain bonus: Treaty cost reduction`
- requirements such as `Propose treaty: Vision Exchange once`
- requirements such as `Be in diplomatic state: Partnership twice`

Tech and population exports also expose many related keys:

- `ActionType*`
- `ConstructibleAction_*`
- `Effect_EmpireBonus_*`
- `Effect_PopulationCollection_*`
- `ActionCostModifier_*`
- `ConstructibleCostModifier_*`
- `Tag_Treaty_*`

These are useful discovery signals, not a frontend contract. The exporter should
decide canonical public entries and emit stable public keys.

## Requested Export Kinds

### 1. `actions`

Recommended public Codex export kind:

- `actions`

Reason: there are several action families, but they behave like one product
concept: player-executable actions. A single export kind with a `kind` or
`category` value keeps Codex search, Quest links, and future tooltips simpler
than splitting every action family into a separate top-level export.

Expected action categories when available:

- Army Action
- Empire Action
- Faction Action
- Settlement Action
- Observatory Action
- Constructible Action
- Terraforming Action

Accepted reference aliases from quest/tech/population exports:

- `Action`
- `ArmyAction`
- `EmpireAction`
- `FactionAction`
- `SettlementAction`
- `ObservatoryAction`
- `ConstructibleAction`
- `TerraformingAction`

Minimum useful entry shape:

- `exportKind`: `actions`
- `entryKey`: stable public action key
- `displayName`: player-facing action name
- `category` or `kind`: action family
- `descriptionLines`: readable fallback copy
- `facts`: only short useful facts, such as scope, cost, cooldown, target, owner
  faction, unlock source, or era when safely available
- `sections`: effects, requirements, availability, cost modifiers, restrictions
- `publicContextKeys`: related faction, tech, trait, district, unit, resource,
  treaty, or bonus keys when meaningful

### 2. `bonuses`

Recommended public Codex export kind:

- `bonuses`

Reason: quest rewards and tech unlocks already expose many public player effects
as "bonus", "status", "descriptor", or "cost modifier". EWShop needs a public
player-facing umbrella, not many frontend-inferred buckets.

Expected bonus categories when available:

- Empire Bonus
- City Bonus
- Army Bonus
- Unit Bonus
- Faction Bonus
- Minor Faction Assimilation Bonus
- Population Collection Bonus
- Status
- Cost Modifier

Accepted reference aliases from quest/tech/population exports:

- `Bonus`
- `Status`
- `Descriptor`
- `EmpireBonus`
- `CityBonus`
- `ArmyBonus`
- `UnitBonus`
- `FactionBonus`
- `MinorFactionBonus`
- `PopulationCollectionBonus`
- `CostModifier`
- `ActionCostModifier`
- `ConstructibleCostModifier`
- `PopulationCostModifier`
- `TechnologyCostModifier`

Minimum useful entry shape:

- `exportKind`: `bonuses`
- `entryKey`: stable public bonus/status/effect key
- `displayName`: concise player-facing name
- `category` or `kind`: bonus family/scope
- `descriptionLines`: readable fallback copy
- `facts`: short useful facts such as scope, affected resource/stat, magnitude,
  duration, stack behavior, source, or target restrictions when available
- `sections`: effects, requirements, granted modifiers, availability, sources
- `publicContextKeys`: related actions, techs, factions, traits, populations,
  resources, units, districts, or treaties when meaningful

Do not dump every internal descriptor into Codex. Include entries that are
public, player-facing, or referenced by public rewards, requirements, unlocks,
traits, techs, populations, factions, minor factions, or diplomacy.

### 3. `diplomaticTreaties`

Recommended public Codex export kind:

- `diplomaticTreaties`

Reason: treaties are a visible strategic system and already appear in
requirements, tech unlocks, diplomacy icons, and local static data. They should
not be inferred from text such as `Propose treaty: Vision Exchange once`.

Accepted reference aliases from quest/tech exports:

- `DiplomaticTreaty`
- `Treaty`

Minimum useful entry shape:

- `exportKind`: `diplomaticTreaties`
- `entryKey`: stable public treaty key
- `displayName`: player-facing treaty name
- `category` or `kind`: treaty/declaration category when available
- `descriptionLines`: readable fallback copy
- `facts`: short useful facts such as diplomatic state required, cost,
  participants, duration, unlock source, or availability when safely available
- `sections`: effects, requirements, restrictions, availability
- `publicContextKeys`: related techs, factions, resources, bonuses, actions, or
  diplomatic states when meaningful

Adjacent diplomacy concepts such as diplomatic states may need a future
`diplomaticStates` export, but they should not block the first treaty export.

## Quest/Unlock Reference Requirement

Adding new Codex exports is only half the work. Quest Strategy and future
tooltips also need typed references from the exports that mention these
concepts.

When a quest reward or requirement points to an action, bonus, or treaty, please
emit at least one of:

- `codexEntryKey`
- `referenceKind` plus `referenceKey`
- `assetKind` plus `assetKey`

Examples:

- `Unlock empire action: Mukag Light`
  - `referenceKind`: `EmpireAction`
  - `referenceKey`: canonical action key
- `Use faction action: Mukag Monsoon Festival twice`
  - `referenceKind`: `FactionAction`
  - `referenceKey`: canonical action key
- `Gain bonus: Ahead in the Polls`
  - `referenceKind`: `Bonus`
  - `referenceKey`: canonical bonus key
- `Propose treaty: Vision Exchange once`
  - `referenceKind`: `Treaty`
  - `referenceKey`: canonical treaty key

Do not require the frontend to infer references from display text.

## Scope Control

This request should stay minimal and pragmatic.

Include:

- player-facing entries;
- entries referenced by quests, tech unlocks, population rewards, factions,
  traits, minor factions, diplomacy, or public UI;
- stable public keys and names;
- enough metadata to support readable Codex details and compact tooltips.

Do not include:

- Unity internals;
- GUIDs;
- raw database paths;
- mapper names;
- diagnostics/debug fields;
- duplicate entries for implementation variants that collapse to one public
  concept;
- private helper descriptors that are never user-facing.

## Suggested Implementation Order

1. `actions`
2. `bonuses`
3. `diplomaticTreaties`
4. Typed quest reward/requirement references for these kinds
5. Typed tech/population/faction/trait references where these concepts are
   already exposed as public unlocks, rewards, or effects

Actions and bonuses are the first priority because they currently produce the
most visible unresolved Quest Strategy rows.

## Validation

After implementation, generate fresh exports and verify:

- new Codex files exist for `actions`, `bonuses`, and `diplomaticTreaties`;
- entries have stable keys and player-facing display names;
- Quest Strategy rows that mention actions, bonuses, or treaties emit typed
  references;
- sample references resolve without text inference:
  - Mukag Light
  - Mukag Land
  - Mukag Knowledge
  - Mukag Monsoon Festival
  - Last Lord Round Up Village
  - Ahead in the Polls
  - Treaty cost reduction
  - Vision Exchange
- no internal-only keys, mapper names, GUIDs, or raw paths leak into public
  facts/sections.
