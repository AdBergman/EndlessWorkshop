# Codex Category Review Matrix

Status: active product/implementation planning matrix
Created: 2026-06-13
Source: current local Codex imports, active diagnostics, and current EWShop UI

## Purpose

This matrix is the self-documenting loop for category-by-category Codex review.
It consolidates current evidence from:

- `docs/active/codex-content-quality-current-diagnostic-handoff.md`
- `docs/active/codex-preview-surface-audit.md`
- `docs/active/codex-relationship-value-gap-audit.md`
- `docs/current-action-priorities.md`

This is planning evidence, not implementation. EWShop must use exact exported
or resolved metadata only. Do not infer links from display names, prose, fuzzy
matching, or "looks like this should match."

## Review Loop

For each category pass:

1. Start from this matrix and the current diagnostics.
2. Verify current local imports if the data batch changed.
3. Decide whether the gap is EWShop-owned, exporter/editorial-owned, backend
   contract-owned, mixed, or no-action.
4. Update `docs/active/codex-category-jira-backlog.md` instead of opening a
   one-off prompt trail.
5. Implement EWShop work only when exact refs already exist and player value is
   clear.
6. Keep text-only rewards, unlocks, traits, actions, resources, and mechanics
   plain until exact metadata exists.

## Category Matrix

### abilities

- Current frontend presentation: visible top-level category with structured
  facts, Effects, Battle mechanics, result-row summaries, related chips, and
  scoped inline links for exact applied Status mentions.
- Main player question: "What does this ability do, and what status/effect does
  it apply?"
- Current answer quality: strong for the 306/336 entries with Effects; weak for
  classification-only abilities.
- Useful exact metadata: facts for category/kind/range/target/cost, Effects
  sections, applied Status section item refs, related Status refs.
- Weak patterns: 26 facts-only/no-mechanics entries; some unresolved public or
  reference keys.
- Preview opportunities: applied Status inline clarification is already
  implemented; no broad new Ability preview surface is recommended.
- Missing exact refs/entity categories: exporter/editorial context for thin
  abilities.
- EWShop-owned work: bug fixes only unless new exact relationship evidence
  appears.
- Exporter/editorial work: add public effect/source/target context for thin
  abilities.
- Recommended treatment: keep top-level browseable.
- Examples: Corruption Burst, Scoped Shot I, Always Retaliate, Blossom I.
- Risk: low for current UI; high if EWShop tries to infer missing mechanics.
- Player value score: 8/10.

### actions

- Current frontend presentation: visible category with facts and any exported
  Action mechanics or cost modifier sections.
- Main player question: "What does this action do, when can I use it, and what
  does it cost or affect?"
- Current answer quality: mixed; 52/139 entries have sections, 87/139 are
  facts-only.
- Useful exact metadata: action facts, Action mechanics sections, Cost
  modifiers, exact modifier links where present.
- Weak patterns: many classification-only rows, raw/generated action names, no
  description lines in current import.
- Preview opportunities: none until public summaries and exact affected-target
  refs exist.
- Missing exact refs/entity categories: affected targets, source/availability,
  cost context, player-facing purpose.
- EWShop-owned work: avoid over-promoting thin rows; keep release gates intact.
- Exporter/editorial work: add gameplay summaries and affected-target refs.
- Recommended treatment: keep top-level browseable but demote thin subgroups in
  product surfaces; keep exact link/search value.
- Examples: Absorb City, Close Rift, Raze District, Build Observatory, Aspect
  Build Coral Spore.
- Risk: high if frontend invents purpose from action names.
- Player value score: 4/10 today, 8/10 after summaries.

### councilors

- Current frontend presentation: visible category with facts, Effects sections,
  and related faction/minor faction chips.
- Main player question: "What role/effect does this councilor provide and who
  are they associated with?"
- Current answer quality: good for 40/43 entries with Effects.
- Useful exact metadata: councilor effect, partner effect, role, faction, exact
  faction/minor faction refs.
- Weak patterns: 3 facts-only entries and occasional generated/raw public text
  in quest reward rows.
- Preview opportunities: faction/minor faction references should stay one-line
  summaries or related chips.
- Missing exact refs/entity categories: resolved public copy for raw quest
  reward councilor rows.
- EWShop-owned work: no current category UI work.
- Exporter/editorial work: replace raw generated descriptions and fill the few
  thin entries.
- Recommended treatment: keep top-level browseable.
- Examples: Diogen, the Inquisitive; Axios, the Possessed; Javal Requ.
- Risk: low.
- Player value score: 7/10.

### diplomaticTreaties

- Current frontend presentation: visible category with facts, direct Effects
  sections when exported, related Status chips, and structured previews.
- Main player question: "What changes when I sign, declare, or enforce this?"
- Current answer quality: uneven; 8/22 have direct Effects, 6 have Status refs,
  and several have neither.
- Useful exact metadata: treaty facts, duration, Effects lines, exact Status
  refs for some treaties.
- Weak patterns: incomplete surrender/tribute text, facts-only treaties, Status
  refs that may duplicate or bloat pages if previewed blindly.
- Preview opportunities: focused Treaty -> Status/effect one-line preview only
  after browser/product review; not a broad rollout.
- Missing exact refs/entity categories: direct Effects summaries and clean
  public text for thin/incomplete treaties.
- EWShop-owned work: maybe prototype one treaty Status preview later; not ready
  as a default category pass.
- Exporter/editorial work: fill Effects and fix incomplete public text.
- Recommended treatment: keep top-level browseable; wait for data cleanup before
  richer previews.
- Examples: Shared Research, Deeper Collaboration, Close Borders, Surrender
  Demand, Surrender Offer.
- Risk: medium; easy to repeat related chips or overstate treaty impact.
- Player value score: 5/10 today, 8/10 after Effects cleanup.

### districts and extractors

- Current frontend presentation: Districts and Extractors are browseable
  surfaces; entries show facts, Effects sections where present, and structured
  summaries.
- Main player question: "What does this district/extractor provide, where does
  it fit, and what resource does it produce?"
- Current answer quality: mixed; 76/167 District entries have Effects, and
  Extractor -> Resource relationships are not exact-linked.
- Useful exact metadata: category/kind/tier facts and Effects lines.
- Weak patterns: 91 facts-only/no-mechanics District entries; 67 resource
  extractor entries lack Resource entity refs; advanced extractor entries can be
  thin.
- Preview opportunities: Extractor -> Resource summaries only after Resource
  entries and exact refs exist.
- Missing exact refs/entity categories: Resource Codex entities, Extractor ->
  Resource refs, source/unlock context for thin Districts.
- EWShop-owned work: keep Extractors discoverable but do not invent Resource
  pages.
- Exporter/backend/editorial work: add Resource category or supported resource
  entities and exact extractor refs.
- Recommended treatment: keep Districts/Extractors browseable; wait for Resource
  data for extractor preview work.
- Examples: Klax Extractor, Advanced Klax Extractor, Temporary Bridge, Camp,
  Dam.
- Risk: high for Resource inference; medium for thin-row promotion.
- Player value score: 5/10 today, 8/10 with Resource refs.

### equipment

- Current frontend presentation: visible top-level category with equipment
  facts, Effects, Granted Ability compact preview rows, and duplicate granted
  Ability related cards hidden when previewed.
- Main player question: "What does this item grant and who can use it?"
- Current answer quality: strong; 159/159 have facts and sections.
- Useful exact metadata: access pool, rarity, slot, tier, type, value, Effects,
  Granted abilities with exact refs.
- Weak patterns: 25 unresolved granted Ability/public refs remain.
- Preview opportunities: current granted Ability preview pattern is complete for
  this category.
- Missing exact refs/entity categories: resolve remaining ability refs in
  exporter/editorial data.
- EWShop-owned work: bug/browser QA only.
- Exporter/editorial work: fix unresolved ability refs.
- Recommended treatment: keep top-level browseable.
- Examples: Scions' Charm, Saiadhan Crystal, Crimson Wing Rune.
- Risk: low.
- Player value score: 9/10.

### factions

- Current frontend presentation: visible top-level category with faction dossier
  plus a scoped Faction package section built from exact outbound refs and exact
  reverse refs; Related Entries remain available.
- Main player question: "What is this faction about, and what should I inspect
  next?"
- Current answer quality: good for orientation; still depends on exporter
  quality for exact trait/action/resource relationships.
- Useful exact metadata: affinity, Identity, Traits, Effects, safe outbound
  units/tech/population/heroes, reverse quests/councilors/statuses.
- Weak patterns: trait/action/resource mentions in prose are text-only; some
  faction unlock language lacks exact unlock metadata.
- Preview opportunities: Faction package follow-up polish and browser QA; do
  not expand into full faction hub or infer text-only traits/actions/resources.
- Missing exact refs/entity categories: exact trait/action/resource/unique
  mechanic refs if product wants those in the package.
- EWShop-owned work: small Faction package consistency/QA fixes only.
- Exporter/editorial work: provide exact refs for faction unlocks and
  text-only trait/action/resource relationships where public.
- Recommended treatment: keep top-level browseable.
- Examples: Aspects, Kin of Sheredyn, Last Lords, Tahuk, Necrophages.
- Risk: medium; reverse refs can become a Related Entries clone if uncapped.
- Player value score: 8/10.

### heroes

- Current frontend presentation: visible category with stats, faction facts,
  and Granted Ability compact preview rows for resolved refs.
- Main player question: "What are this hero's stats, faction, and abilities?"
- Current answer quality: strong for stats and resolved abilities; weaker where
  hero granted abilities remain unresolved.
- Useful exact metadata: class/faction facts, Stats section, Granted abilities.
- Weak patterns: 4 unresolved hero granted Ability refs.
- Preview opportunities: granted Ability previews already implemented; faction
  references should stay one-line.
- Missing exact refs/entity categories: resolve remaining granted Ability refs.
- EWShop-owned work: bug/browser QA only.
- Exporter/editorial work: resolve missing Ability refs.
- Recommended treatment: keep top-level browseable.
- Examples: Polemephon, Mitoxus of Agora, Chiolite, Duke Unwin Weybridge.
- Risk: low.
- Player value score: 8/10.

### improvements

- Current frontend presentation: visible category with facts, Effects sections,
  structured summaries, and related chips if exact refs exist.
- Main player question: "What does this improvement do, and why build it?"
- Current answer quality: good for 100/123 with Effects; weak for 23
  facts-only entries.
- Useful exact metadata: category/kind facts, Effects sections.
- Weak patterns: bridge/city-center style improvements with classification only
  and no player-facing purpose.
- Preview opportunities: none without new exact relationships.
- Missing exact refs/entity categories: unlock/source refs and effect summaries
  for thin entries.
- EWShop-owned work: no current UI work.
- Exporter/editorial work: add effect/source/unlock context for thin entries.
- Recommended treatment: keep top-level browseable; avoid promoting thin
  subgroups as rich surfaces.
- Examples: Military Efficiency, Watchman's Bell, Pile House, Sentry Scopes.
- Risk: medium if frontend invents purpose.
- Player value score: 6/10.

### minorFactions

- Current frontend presentation: visible category with identity, traits,
  associated content, and exact related units/populations/traits/quests.
- Main player question: "What does this minor faction provide or connect to?"
- Current answer quality: good orientation; no immediate UI gap.
- Useful exact metadata: disposition, faction affinity, kind, Associated
  content, Identity, Traits, related units/traits/populations/quests.
- Weak patterns: 3 unresolved refs; some trait text still depends on exporter
  prose quality.
- Preview opportunities: keep as one-line summaries and related chips.
- Missing exact refs/entity categories: resolve remaining refs if they are
  public.
- EWShop-owned work: no current category UI work.
- Exporter/editorial work: clean unresolved refs/public trait text.
- Recommended treatment: keep top-level browseable.
- Examples: Ametrine, Blackhammers, Daughters of Bor, Noquensii.
- Risk: low.
- Player value score: 7/10.

### modifiers

- Current frontend presentation: bonus-derived Modifiers are hidden from
  top-level navigation but remain searchable/linkable as exact targets.
- Main player question: "What internal cost modifier is this exact link talking
  about?"
- Current answer quality: acceptable as link targets; poor as browse content.
- Useful exact metadata: affected cost, category, kind, modifier value, Bonus
  mechanics, exact related targets.
- Weak patterns: generated cost-modifier names, raw/internal flavor, unresolved
  refs.
- Preview opportunities: none for top-level navigation. Keep exact-link
  support only.
- Missing exact refs/entity categories: cleaner public names if these must be
  shown; otherwise keep link-only.
- EWShop-owned work: preserve hidden navigation behavior.
- Exporter/editorial work: clean public labels where Modifiers appear as related
  targets.
- Recommended treatment: keep searchable/linkable only; do not promote to
  top-level.
- Examples: Worldmending, Turn -33% cost modifier, Money -25% cost modifier.
- Risk: high if promoted; low as link-only.
- Player value score: 3/10 as browse, 6/10 as exact context.

### populations

- Current frontend presentation: visible category with facts, Worker effects,
  Threshold rewards, exact threshold target one-line summaries when item/fact
  refs exist, and plain text for unresolved/text-only rewards.
- Main player question: "What do population workers do, and what threshold
  rewards matter?"
- Current answer quality: good for minor/special exact threshold targets; major
  faction 5-population rewards are blocked by text-only data.
- Useful exact metadata: faction/minor faction facts, Worker effects, Threshold
  rewards, 16 exact reward refs.
- Weak patterns: 58 text-only threshold rewards; major faction reward names
  lack item/fact refs; raw faction keys in some facts.
- Preview opportunities: current exact threshold summary pattern is correct; no
  display-name matching.
- Missing exact refs/entity categories: major faction threshold reward refs,
  public display labels for raw faction keys.
- EWShop-owned work: keep exact-only resolver rule and plain text fallback.
- Exporter/editorial work: add exact major faction reward refs and clean raw
  faction key labels.
- Recommended treatment: keep top-level browseable.
- Examples: Daughter of Bor, Inferior Imitation, Aspect, Kin of Sheredyn, Tahuk.
- Risk: high if frontend matches reward names; low for current exact refs.
- Player value score: 8/10 for exact refs, 5/10 for major faction thresholds.

### quests

- Current frontend presentation: visible category with quest grouping,
  progression, objective/choice/requirement/reward sections, and related chips.
- Main player question: "Where am I in this questline, what are the choices, and
  what do they require or reward?"
- Current answer quality: good for navigation and grouping; many refs remain
  unresolved and some rewards/requirements need exporter cleanup.
- Useful exact metadata: Category/Kind/Mandatory/Chapter facts, Objective,
  Choices, Requirements, Rewards, related quest/faction/equipment/tech refs.
- Weak patterns: 492 unresolved keys, repeated quest-node display names, raw
  generic text in some reward/requirement paths.
- Preview opportunities: faction refs should remain one-line; avoid inline
  faction dossiers.
- Missing exact refs/entity categories: better public labels and exact refs for
  quest reward/requirement targets.
- EWShop-owned work: existing Strategy links are in place; future work should be
  browser QA/product-review driven.
- Exporter/editorial work: resolve raw text and missing refs.
- Recommended treatment: keep top-level browseable.
- Examples: The Great Dieback, The Missing Youth, A Bloody Trail, The Day of
  Reckoning.
- Risk: medium due branching/progression complexity.
- Player value score: 7/10.

### statuses

- Current frontend presentation: bonus-derived Statuses are visible as a
  top-level category with facts, Status mechanics, Effects, related chips, and
  inline links from Ability pages where exact applied Status mentions resolve.
- Main player question: "What does this status do, how long does it last, and
  where does it come from?"
- Current answer quality: good for 303 mechanics-rich statuses; weak for 33
  facts-only entries and poor sub-kind grouping.
- Useful exact metadata: category/kind/duration facts, Status mechanics,
  Effects, occasional linked modifier.
- Weak patterns: no exported sub-kind/scope; 336 unresolved self-like keys in
  the diagnostic; thin statuses.
- Preview opportunities: Status sub-kind grouping/filtering only after exporter
  provides scope.
- Missing exact refs/entity categories: exported scope such as City, Army,
  Empire, Combat, Hero, Public Opinion, Map, Treaty.
- EWShop-owned work: keep visible category and inline exact Ability links.
- Exporter/editorial work: add status scope/sub-kind and fill thin statuses.
- Recommended treatment: keep top-level browseable; wait for sub-kind metadata
  before grouping redesign.
- Examples: Ahead in the Polls, Hero Status Loss, Immobile, Despises Kin.
- Risk: medium if frontend derives scope from names.
- Player value score: 7/10.

### tech

- Current frontend presentation: visible category with facts, Effects sections,
  related chips, and structured previews.
- Main player question: "What does this technology do or unlock?"
- Current answer quality: useful for effects; weak for unlocks because exact
  Unlock refs are mostly missing.
- Useful exact metadata: era/kind/quadrant/tier/faction facts, Effects, related
  units/factions/improvements/tech/districts.
- Weak patterns: 36 facts-only entries, text-only unlock wording, only 1
  Unlocks section in current audit.
- Preview opportunities: unlock summaries after exact refs exist.
- Missing exact refs/entity categories: exact Unlocks section item refs and
  unlock type/classification.
- EWShop-owned work: no unlock preview until refs exist.
- Exporter/editorial work: export exact tech unlock refs.
- Recommended treatment: keep top-level browseable; wait for exporter data for
  unlock previews.
- Examples: Choral Amplifier, Keystones, Deciphering Stone, Common Rights.
- Risk: high if frontend infers unlocks from related entries.
- Player value score: 6/10 today, 9/10 with unlock refs.

### traits

- Current frontend presentation: visible category with facts, Effects, Unlocks,
  Granted abilities, Exclusions, and related chips.
- Main player question: "What does this trait change, unlock, exclude, or grant?"
- Current answer quality: mixed; Effects are useful, but unlock/granted ability
  exact-ref coverage is thin.
- Useful exact metadata: category/kind/cost/required affinity facts, Effects,
  Unlocks, Exclusions, some related traits/units/districts/tech/improvements.
- Weak patterns: 48 facts-only entries, unresolved granted ability refs, raw
  quest/action keys in public lines.
- Preview opportunities: unlock relationship one-line summaries only after
  product review and better ref coverage; granted Ability previews are blocked
  by unresolved refs.
- Missing exact refs/entity categories: resolved Ability refs, exact unlock
  target refs, public labels for raw quest/action keys.
- EWShop-owned work: no current UI pass.
- Exporter/editorial work: resolve ability/unlock refs and clean raw text.
- Recommended treatment: keep top-level browseable; wait for exporter data
  before preview expansion.
- Examples: Harmonious Tactics, Deadly Corals, Chant of the Rocks, Radiance.
- Risk: high if frontend infers unlocks from names/prose.
- Player value score: 6/10.

### units

- Current frontend presentation: visible category with stats, facts, Granted
  Ability compact preview rows, duplicate granted Ability cards hidden from
  Related Entries, and clickable exact refs.
- Main player question: "What are this unit's stats and abilities?"
- Current answer quality: strong; unit granted Ability refs resolve in current
  data.
- Useful exact metadata: class/kind/spawn/tier/faction facts, Stats, Granted
  abilities, related faction/minor faction/unit refs.
- Weak patterns: large related unit/specialization sets can be noisy if not
  capped elsewhere.
- Preview opportunities: current granted Ability pattern is complete; faction
  refs stay one-line.
- Missing exact refs/entity categories: none blocking current unit pages.
- EWShop-owned work: bug/browser QA only.
- Exporter/editorial work: keep ability refs stable.
- Recommended treatment: keep top-level browseable.
- Examples: Skyscale, Brightscale, Sentry, Archer, Palanquin of the Profane.
- Risk: low.
- Player value score: 9/10.

### bonus-derived Statuses and Modifiers taxonomy

- Current frontend presentation: `bonuses` is a source export. EWShop promotes
  bonus-derived Statuses to visible `statuses` and keeps bonus-derived
  Modifiers hidden from top-level navigation while preserving exact search/link
  targets.
- Main player question: "Is this public gameplay state or an internal modifier?"
- Current answer quality: correct taxonomy for current imports.
- Useful exact metadata: bonus facts, Status mechanics, Bonus mechanics, public
  context keys.
- Weak patterns: some raw modifier names and thin status entries.
- Preview opportunities: none until Status sub-kind/scope exists; Modifiers
  should not be top-level.
- Missing exact refs/entity categories: status scope/sub-kind and cleaner public
  modifier labels.
- EWShop-owned work: preserve taxonomy and navigation gates.
- Exporter/editorial work: improve Status scope and Modifier display labels.
- Recommended treatment: Statuses top-level browseable; Modifiers
  searchable/linkable only.
- Examples: Ahead in the Polls, Immobile, Worldmending, Money -25% cost
  modifier.
- Risk: high if Modifiers are promoted or Status scope is inferred.
- Player value score: Statuses 7/10, Modifiers 3/10 as browse.

## Searchable-Only / Demotion Recommendations

- Modifiers: keep hidden from top-level navigation; searchable/linkable only.
- Generic facts-only Actions: keep searchable/linkable, but avoid presenting as
  rich browse destinations until exporter summaries exist.
- Thin Districts/Improvements/Statuses/Abilities: keep category membership, but
  do not create special preview surfaces from classification-only data.
- Resource pages: do not create or promote a Resource category until Resource
  Codex entities exist.
- Tech unlock previews: do not surface until exact Unlock refs exist.

## Open Product Questions

- Should Diplomatic Treaty -> Status previews be attempted for a tiny set of
  confusing treaty pages after exporter/editorial Effects cleanup?
- Should Faction package groups eventually include exact traits/actions/resources
  if exporter metadata lands, or should those remain in Related Entries?
- Should thin Actions remain top-level browseable as a category, or should the
  overview de-emphasize generic facts-only action subgroups?
- What public status scopes should DB exporter expose for Status grouping:
  City, Army, Empire, Combat, Hero, Public Opinion, Map, Treaty, or another
  taxonomy?
