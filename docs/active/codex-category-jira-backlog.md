# Codex Category Jira-Style Backlog

Status: active planning backlog
Created: 2026-06-13
Source: `docs/active/codex-category-review-matrix.md`

## Backlog Rules

- Do not implement frontend inference from display names, prose, fuzzy matching,
  or apparent labels.
- Do not promote Modifiers to top-level navigation.
- Do not redesign all Codex pages.
- Do not create a generic renderer ticket unless at least three proven
  relationship patterns require the same implementation shape.
- Group repeated issues by root cause instead of creating tickets for every
  entry.
- Mark frontend tickets blocked when exact refs or public content are missing.

## Summary

| Owner | Tickets |
| --- | ---: |
| DB exporter/editorial | 9 |
| EWShop frontend | 6 |
| Backend/product/exporter mixed | 1 |
| Product/navigation mixed | 1 |

| Priority | Tickets |
| --- | ---: |
| P0 | 5 |
| P1 | 8 |
| P2 | 4 |

## Top 10 Tickets

1. `CDEX-CAT-001` - Export exact Tech unlock refs.
2. `CDEX-CAT-003` - Export exact major faction Population threshold reward refs.
3. `CDEX-CAT-004` - Establish Resource Codex entities and Extractor -> Resource refs.
4. `CDEX-CAT-005` - Add gameplay summaries and affected targets for thin Actions.
5. `CDEX-CAT-006` - Clean Diplomatic Treaty Effects and public text.
6. `CDEX-CAT-007` - Export Status sub-kind/scope metadata.
7. `CDEX-CAT-009` - Resolve Trait unlock and granted Ability references.
8. `CDEX-CAT-011` - Clean Quest reward/requirement public refs and labels.
9. `CDEX-CAT-012` - Decide category demotion/searchable-only treatment for thin surfaces.
10. `CDEX-CAT-013` - Faction package browser QA and restrained polish.

## Tickets

### CDEX-CAT-001 - Export Exact Tech Unlock Refs

- Category: tech
- Owner: DB exporter/editorial
- Priority: P0
- Problem: Tech pages answer effects reasonably but do not safely answer "what
  does this unlock?" Related entries cannot distinguish unlocks from broad
  context.
- Player value: lets players plan research without opening unrelated entries.
- Requirements:
  - Export exact Unlocks section target refs for units, districts,
    improvements, actions, traits, upgrades, and other public unlock targets.
  - Include public display labels and target type where available.
  - Keep text-only unlocks text-only if no exact target exists.
- Acceptance criteria:
  - Tech Unlocks section items include exact `referenceKey` fields when targets
    exist.
  - Examples such as Choral Amplifier, Keystones, and Deciphering Stone no
    longer require display-name/prose inference.
- Validation commands or browser review targets:
  - Regenerate `npm run diagnostics:codex-relationship-gaps`.
  - Review sample Tech pages in EWShop Codex.
- Do not / guardrails:
  - Do not ask EWShop to infer unlocks from related entries or prose.
- Dependencies: exporter access to canonical unlock sources.

### CDEX-CAT-002 - Render Tech Unlock Summaries After Exact Refs

- Category: tech
- Owner: EWShop frontend
- Priority: P1, blocked
- Problem: Once exact unlock refs exist, Tech pages should summarize unlocks
  instead of burying them in generic Related Entries.
- Player value: answers "why research this?" at the point of decision.
- Requirements:
  - Render exact Unlocks targets as restrained one-line summaries.
  - Keep Related Entries available for exploration.
  - Do not infer unlock semantics from broad refs.
- Acceptance criteria:
  - A Tech page with exported Unlock refs shows linked summaries.
  - Text-only unlocks remain plain.
  - Tests cover resolved and unresolved unlock items.
- Validation commands or browser review targets:
  - Targeted Codex tests, full frontend test/build, browser review on 2-3 Tech
    pages.
- Do not / guardrails:
  - No prose matching, no generic renderer, no graph UI.
- Dependencies: `CDEX-CAT-001`.
- Suggested implementation prompt:
  - "Prototype Tech exact Unlock summaries using only exported Unlock section
    item refs. Keep scope to Tech pages, preserve Related Entries, leave
    text-only unlocks plain, and add focused tests."

### CDEX-CAT-003 - Export Exact Major Faction Population Threshold Reward Refs

- Category: populations
- Owner: DB exporter/editorial
- Priority: P0
- Problem: Major faction Population threshold rewards are text-only and cannot
  be linked safely by EWShop.
- Player value: lets players understand what important population breakpoints
  unlock without guessing.
- Requirements:
  - Add exact target refs on `sections[].items[].referenceKey` and/or Reward
    fact `referenceKey` for major faction threshold rewards.
  - Match the working Bor’s Sparring Ring /
    `DistrictImprovement_MinorFaction_06` shape.
  - Leave rewards text-only when no public target exists.
- Acceptance criteria:
  - Military Press, Altar of Channeling, Larval Pulp, and Astronomy Club have
    exact refs if those are canonical targets.
  - Nutrient Extractor is either exported as a Codex entry with exact ref or
    remains text-only with no implied link.
- Validation commands or browser review targets:
  - Regenerate relationship gap diagnostic.
  - Review major faction Population pages.
- Do not / guardrails:
  - Do not rely on EWShop display-name matching.
- Dependencies: canonical target mapping in exporter/editorial source.

### CDEX-CAT-004 - Establish Resource Codex Entities And Extractor Refs

- Category: districts/extractors/resources
- Owner: backend/product/exporter mixed
- Priority: P0
- Problem: Extractor pages show production text but cannot link to Resource
  Codex entries because no Resource surface/entities are established.
- Player value: answers "which resource does this extractor produce and what is
  that resource for?"
- Requirements:
  - Decide whether Resources become a Codex export category or backend-supported
    entity surface.
  - Export exact Extractor -> Resource refs.
  - Add public Resource labels and useful descriptions/effects.
- Acceptance criteria:
  - Extractor entries resolve exact resource targets.
  - Resource entries are public-safe and browse/search-compatible.
- Validation commands or browser review targets:
  - Relationship gap diagnostic shows extractor/resource refs resolved.
  - Browser review on Klax Extractor and tiered extractor pages.
- Do not / guardrails:
  - Do not create Resource pages in EWShop before Resource entities exist.
- Dependencies: product decision on Resource category visibility.

### CDEX-CAT-005 - Add Gameplay Summaries And Affected Targets For Thin Actions

- Category: actions
- Owner: DB exporter/editorial
- Priority: P0
- Problem: 87/139 Actions are facts-only and do not explain effect, cost,
  source, or target.
- Player value: lets players understand actions as gameplay tools instead of
  database rows.
- Requirements:
  - Add short public gameplay summaries where canonical source exists.
  - Add exact affected-target refs, availability/source, cost, duration, or
    requirement context when known.
  - Suppress or keep link-only entries that cannot be made public-safe.
- Acceptance criteria:
  - Representative generic, faction, empire, constructible, and terraforming
    actions show player-facing purpose.
  - Thin-row diagnostic count drops for Actions.
- Validation commands or browser review targets:
  - `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
  - Browser review of Build Observatory, Aspect Build Coral Spore, Close Rift,
    Absorb City, Raze District.
- Do not / guardrails:
  - Do not request EWShop-generated summaries.
- Dependencies: exporter/editorial access to action mechanics source.

### CDEX-CAT-006 - Clean Diplomatic Treaty Effects And Public Text

- Category: diplomaticTreaties
- Owner: DB exporter/editorial
- Priority: P0
- Problem: Many treaties lack direct Effects and some surrender/tribute text is
  incomplete or not player-facing.
- Player value: answers "what happens if I sign or declare this?"
- Requirements:
  - Add direct Effects summaries where impact is canonical.
  - Fix incomplete surrender/tribute public text.
  - Add exact Status refs only where the Status explains the treaty impact.
- Acceptance criteria:
  - Treaty pages no longer rely on facts-only display for high-value treaties.
  - Shared Research-style pages remain concise; Close Borders-style pages have
    clear effect/status context.
- Validation commands or browser review targets:
  - Browser review Shared Research, Close Borders, Surrender Demand, Surrender
    Offer, Shared Victory.
- Do not / guardrails:
  - Do not ask EWShop to invent treaty mechanics.
- Dependencies: canonical treaty effect data.

### CDEX-CAT-007 - Export Status Sub-Kind And Scope Metadata

- Category: statuses
- Owner: DB exporter/editorial
- Priority: P1
- Problem: Statuses are useful but currently lack exported grouping/scope, so
  EWShop cannot safely group by City, Army, Combat, Hero, Empire, Map, Treaty,
  or Public Opinion.
- Player value: lets players find relevant statuses by gameplay context.
- Requirements:
  - Export a public status scope/sub-kind field.
  - Fill thin statuses with effect/source/duration context where public.
- Acceptance criteria:
  - Status entries expose stable public scope metadata.
  - Thin status diagnostic count drops.
- Validation commands or browser review targets:
  - Preview-surface/content diagnostics.
  - Browser review of Ahead in the Polls, Immobile, Hero Status Loss, Despises
    Kin.
- Do not / guardrails:
  - Do not expect EWShop to infer scope from keys.
- Dependencies: exporter taxonomy decision.

### CDEX-CAT-008 - Add Status Grouping After Scope Metadata Lands

- Category: statuses
- Owner: EWShop frontend
- Priority: P2, blocked
- Problem: Status browse becomes noisy without scope filters/grouping.
- Player value: improves scanability for a large 336-entry category.
- Requirements:
  - Use exported scope metadata only.
  - Add restrained category filtering/grouping if browser review supports it.
- Acceptance criteria:
  - Statuses can be browsed by exported scope.
  - Hidden Modifiers stay hidden from navigation.
- Validation commands or browser review targets:
  - Frontend tests/build and browser review of Status category.
- Do not / guardrails:
  - No key-name parsing, no modifier promotion.
- Dependencies: `CDEX-CAT-007`.
- Suggested implementation prompt:
  - "Prototype Status category grouping using only exported Status scope
    metadata. Keep Modifiers hidden, preserve search/link behavior, and add
    tests for scope filtering and fallback."

### CDEX-CAT-009 - Resolve Trait Unlock And Granted Ability References

- Category: traits
- Owner: DB exporter/editorial
- Priority: P1
- Problem: Trait Unlocks and Granted abilities exist as concepts, but exact ref
  coverage is too thin for safe EWShop previews.
- Player value: explains what traits actually grant, unlock, or exclude.
- Requirements:
  - Resolve public Ability refs in Granted abilities.
  - Add exact Unlock target refs.
  - Replace raw quest/action keys in public lines with labels or typed refs.
- Acceptance criteria:
  - Trait granted Ability and Unlock refs resolve in diagnostics.
  - Public raw-key examples are cleaned.
- Validation commands or browser review targets:
  - Preview-surface diagnostic.
  - Browser review Harmonious Tactics, Deadly Corals, Radiance, Chant of the
    Rocks.
- Do not / guardrails:
  - Do not ask frontend to infer trait unlocks.
- Dependencies: exporter source mapping.

### CDEX-CAT-010 - Review Trait Preview Surfaces After Refs Improve

- Category: traits
- Owner: EWShop frontend
- Priority: P2, blocked
- Problem: Traits could benefit from one-line unlock or granted Ability
  summaries, but current exact-ref coverage is not strong enough.
- Player value: helps players compare traits without opening every related
  entry.
- Requirements:
  - Re-run preview-surface audit after `CDEX-CAT-009`.
  - Prototype only if exact refs are broad enough and duplicate Related Entries
    can be suppressed safely.
- Acceptance criteria:
  - Product review approves one scoped trait surface.
  - Tests cover unresolved refs remaining plain.
- Validation commands or browser review targets:
  - Targeted Codex tests and browser review on 3-5 trait pages.
- Do not / guardrails:
  - No broad generic renderer; no prose/display-name inference.
- Dependencies: `CDEX-CAT-009`.
- Suggested implementation prompt:
  - "Investigate Trait exact Unlock/Granted Ability previews after exporter ref
    coverage improves. Do not implement unless refs are resolved and player
    value is clear."

### CDEX-CAT-011 - Clean Quest Reward And Requirement Public Refs

- Category: quests
- Owner: DB exporter/editorial
- Priority: P1
- Problem: Quest pages are navigable, but unresolved refs and raw generic
  reward/requirement text weaken strategy use.
- Player value: helps players understand quest choices, requirements, and
  rewards without decoding internal labels.
- Requirements:
  - Resolve public reward/requirement refs where canonical targets exist.
  - Replace raw generated labels with public copy or suppress unsafe fields.
  - Preserve branching/progression metadata.
- Acceptance criteria:
  - Unresolved quest reference count drops.
  - Reward/requirement rows use public labels or typed refs.
- Validation commands or browser review targets:
  - Quest diagnostics and Codex browser review on major, minor, curiosity, and
    endgame quest examples.
- Do not / guardrails:
  - Do not flatten quest branching or invent reward mechanics.
- Dependencies: exporter quest source cleanup.

### CDEX-CAT-012 - Decide Thin Category Demotion/Searchable-Only Treatment

- Category: actions, modifiers, thin districts/improvements/statuses/abilities
- Owner: product/navigation mixed
- Priority: P1
- Problem: Some categories contain valuable exact link targets but poor browse
  destinations.
- Player value: keeps Codex feeling like a strategy companion rather than a
  database dump.
- Requirements:
  - Decide which thin subgroups remain top-level browseable, which become
    searchable/linkable only, and which wait for exporter content.
  - Keep Modifiers hidden from top-level navigation.
  - Document category treatment in current priorities.
- Acceptance criteria:
  - Product decision exists for generic facts-only Actions and other thin rows.
  - EWShop navigation behavior matches the decision.
- Validation commands or browser review targets:
  - Browser review Codex overview and category pages.
- Do not / guardrails:
  - Do not hide units/heroes/populations.
  - Do not expose Modifiers.
- Dependencies: human product review.

### CDEX-CAT-013 - Faction Package Browser QA And Restrained Polish

- Category: factions
- Owner: EWShop frontend
- Priority: P1
- Problem: Faction package is now implemented, but it should be reviewed across
  real faction pages for density, caps, group labels, and accidental database
  dump feel.
- Player value: improves faction pages as the natural strategy starting point.
- Requirements:
  - Browser-review Aspects, Kin of Sheredyn, Last Lords, Tahuk, and Necrophages.
  - Adjust only local labels/caps/presentation if QA finds concrete issues.
  - Keep Related Entries unchanged unless a safe duplicate rule is obvious.
- Acceptance criteria:
  - Faction package remains compact and exact-ref-only.
  - Text-only traits/actions/resources are not promoted.
- Validation commands or browser review targets:
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - Browser review on all five major factions.
- Do not / guardrails:
  - No inferred links, no full faction hub redesign.
- Dependencies: none.
- Suggested implementation prompt:
  - "Run browser QA on the Major Faction package section across all visible
    factions. Implement only local label/cap/readability fixes if exact-ref
    behavior stays intact."

### CDEX-CAT-014 - Codex Related Entries And Preview-Surface Consistency Pass

- Category: all categories
- Owner: EWShop frontend
- Priority: P2
- Problem: Multiple scoped preview surfaces now exist; Related Entries should
  remain exploration, not repetition.
- Player value: reduces duplicate cards and helps players distinguish quick
  answers from deeper exploration.
- Requirements:
  - Audit current dedupe rules for Ability inline links, granted Ability
    previews, Population threshold summaries, and Faction package.
  - Do not generalize unless at least three proven patterns require the same
    exact rule.
  - Document any consistency decision.
- Acceptance criteria:
  - No current pages repeat the same exact relation in a distracting way.
  - Existing non-duplicate Related Entries remain available.
- Validation commands or browser review targets:
  - Browser review Units, Equipment, Heroes, Populations, Factions, Abilities.
- Do not / guardrails:
  - No broad graph-link work, no generic renderer without evidence.
- Dependencies: current preview surfaces.
- Suggested implementation prompt:
  - "Review Related Entries duplication across existing preview surfaces. Make
    only local exact-key dedupe fixes where player value is obvious and tests
    can stay focused."

### CDEX-CAT-015 - Clean Modifier Public Labels Where They Appear As Targets

- Category: modifiers
- Owner: DB exporter/editorial
- Priority: P1
- Problem: Modifiers are correctly hidden from navigation, but related chips or
  exact links can still expose generated/internal modifier names.
- Player value: exact modifier targets become understandable when encountered.
- Requirements:
  - Provide public labels for Modifiers that appear as related targets.
  - Suppress or mark diagnostics-only modifiers that should not be public.
- Acceptance criteria:
  - Modifier related chips use public labels and useful mechanics text.
  - Top-level navigation remains hidden.
- Validation commands or browser review targets:
  - Content-quality diagnostic and browser review from Actions/Tech/Treaties
    that link to modifiers.
- Do not / guardrails:
  - Do not promote Modifiers to top-level navigation.
- Dependencies: exporter/editorial label policy.

### CDEX-CAT-016 - Fill Thin District, Improvement, Ability, And Status Entries

- Category: districts, improvements, abilities, statuses
- Owner: DB exporter/editorial
- Priority: P1
- Problem: Several entries are valid entities but lack player-facing mechanics
  or purpose.
- Player value: keeps category browsing useful and reduces dead-end pages.
- Requirements:
  - Add minimal public effect/source/usage context where canonical data exists.
  - Suppress public export for entries that cannot be made player-facing.
- Acceptance criteria:
  - Thin diagnostic counts drop for affected categories.
  - Public examples no longer read as classification rows only.
- Validation commands or browser review targets:
  - Content-quality diagnostic and browser review of representative thin
    entries.
- Do not / guardrails:
  - Do not request EWShop placeholder text.
- Dependencies: exporter/editorial source review.

### CDEX-CAT-017 - Verify Frontend Quick Wins After New Export Batches

- Category: all categories
- Owner: EWShop frontend
- Priority: P2
- Problem: Current EWShop-owned diagnostic findings are zero, but new exporter
  batches may create exact-ref opportunities or browser regressions.
- Player value: keeps EWShop responsive without inventing work.
- Requirements:
  - After a new import batch, run content-quality, preview-surface, and
    relationship-gap diagnostics.
  - Implement only tiny exact-ref or browser QA fixes with clear player value.
  - Update matrix/backlog if priorities change.
- Acceptance criteria:
  - New EWShop work is evidence-backed by diagnostics or browser QA.
  - Docs stay current.
- Validation commands or browser review targets:
  - `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
- Do not / guardrails:
  - Do not reopen frontend polish without concrete evidence.
- Dependencies: new exporter/import batch.
- Suggested implementation prompt:
  - "Run the Codex diagnostics against the latest local imports, compare with
    the category matrix/backlog, and implement only one tiny EWShop-owned fix if
    it is exact-ref-backed, local, and high value."
