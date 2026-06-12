# Codex Content Quality EWShop Backlog

Status: active EWShop backlog  
Created: 2026-06-12  
Related audit: `docs/active/codex-content-quality-audit.md`

## Scope

This backlog contains only EWShop-side fixes. It intentionally excludes
exporter content generation, exporter contract changes, SEO, graph
visualization, importer work, and Codex redesign.

The goal is to make current Codex pages feel less like database output while
preserving the existing Codex structure.

## Batch 1 - Highest Value, Lowest Risk

These are mostly display filters and ordering fixes. They should be small,
testable, and reversible.

1. Suppress duplicated fact-prefixed description lines.
   - Hide body lines like `Type: Accessory`, `Faction: ...`, `Cost: ...`,
     `Era: ...`, and `Category: ...` when the same label/value already appears
     in rendered facts.
   - Highest impact categories: Equipment, Abilities, Councilors, Tech, Units,
     Quests, Traits.
   - Acceptance: facts still render, but the Notes/body area no longer repeats
     exact fact rows.

2. Hide `Reference key` from normal Action detail.
   - Keep references available internally for linking/debugging.
   - Do not show `Reference key: ActionType...` to players.
   - Acceptance: Action pages no longer lead with internal action keys.

3. Suppress duplicate `Category` plus `Kind` pairs.
   - If both facts exist and normalize to the same public value, show one at
     most.
   - Highest impact categories: Actions, Statuses, Modifiers.
   - Acceptance: details do not show `Category: Status` and `Kind: Status`
     together.

4. Hide `Kind` when it restates the selected category.
   - Examples: `Kind: Unit`, `Kind: Technology`, `Kind: Improvement`.
   - Keep `Kind` only when it distinguishes a meaningful subtype.
   - Acceptance: fact grids prioritize gameplay facts over category labels.

5. Hide `Leader Priority` lines in Heroes and Units.
   - Treat leader-priority lines as internal ordering data.
   - Acceptance: hero/unit descriptions and stats no longer show `Leader
     Priority`.

6. Prefer friendly modifier display values.
   - When a modifier has `Display value`, use it instead of raw `Operation` and
     raw numeric `Value`.
   - Keep Modifiers hidden from top-level navigation.
   - Acceptance: linked/search-opened Modifier pages show less raw math.

7. Demote generic `Category` facts below gameplay facts.
   - Preserve category information, but do not let it outrank effects, costs,
     stats, duration, unlocks, or acquisition.
   - Acceptance: result rows and detail facts emphasize player-useful fields.

8. Hide duplicate Effects sections when they exactly repeat the body copy.
   - Highest impact category: Diplomatic Treaties.
   - Acceptance: a detail page does not show the same sentence as description
     and Effects unless the Effects section adds distinct lines.

## Batch 2 - Medium Complexity

These are still local EWShop presentation changes, but they need more
category-specific judgment and tests.

1. Add player-facing fact labels for common raw fields.
   - `Bilateral: No` -> diplomatic participation wording.
   - `Access pool: Marketplace` -> acquisition/source wording.
   - `Value` on Equipment -> price/value wording.
   - `Tier: 0` -> starter/base tier wording.

2. Convert public enum-looking class values.
   - Display `UnitClass_Infantry_Hero` as `Infantry Hero` when that value leaks
     into description text.
   - Display `UnitClass_Flying` as `Flying`.

3. Highlight category-critical sections.
   - Equipment: Granted abilities, Effects.
   - Traits: Unlocks, Exclusions, Granted abilities.
   - Heroes/Units: Stats.
   - Quests: Requirements, Rewards, Choices.
   - Acceptance: these sections appear before lower-value notes where possible.

4. Add category-specific empty-content messaging.
   - Actions with no description should say the action has no public gameplay
     summary yet, not look broken.
   - Districts and Improvements with no description should preserve facts while
     making the missing explanation obvious but quiet.

5. Clean result-row summaries for raw categories.
   - Avoid summaries dominated by `Category`, `Kind`, `Reference key`, raw
     modifier math, or duplicate values.
   - Acceptance: search results expose why an entry matters when the data
     permits it.

6. Treat zero-value effect lines as low-value display noise.
   - Hide obvious `+0` lines in normal detail unless the surrounding text makes
     the zero meaningful.
   - Acceptance: district and faction pages do not show empty bonuses as if
     they were benefits.

7. Add a small internal allow/block list for known non-player facts.
   - Candidate block list: `Reference key`, `Leader Priority`.
   - Candidate de-emphasis list: duplicate `Kind`, duplicate `Category`, raw
     modifier `Operation`.

## Batch 3 - Larger Improvements

These are still EWShop-only, but they create more product behavior and should
wait until Batch 1 and Batch 2 are reviewed.

1. Add category-specific fact ordering.
   - Equipment: abilities/effects/source before raw value.
   - Units/Heroes: class and stats before faction/internal fields.
   - Quests: objective/rewards/requirements before category/chapter.

2. Add lightweight "decision summary" rows where current metadata supports it.
   - Equipment: granted ability count plus strongest effect line.
   - Traits: unlock/exclusion summary.
   - Units/Heroes: role from class plus top stats.
   - Quests: requirement/reward presence.

3. Add comparison-friendly presentation for stats.
   - Keep within existing Codex detail pages.
   - Do not build a new compare tool.
   - Focus on making stat lists easier to scan.

4. Add friendly formatting for numeric economics.
   - Currency/resource formatting for value and cost.
   - Percent formatting for modifiers.
   - Turn formatting for durations.

5. Add safe category-specific hiding for low-value facts.
   - Hide generic facts only when better facts remain visible.
   - Never hide the only useful public content for sparse entries.

6. Add editorial QA diagnostics for raw-looking visible text.
   - Development-only report for strings containing `Definition`,
     `SpecificNN`, `UnitClass_`, `ActionType`, `Leader Priority`, `Value type`,
     `Target scope`, or `Reference key`.
   - The output should guide future cleanup without changing player UI.

## Recommended Batch 1 Slice

Start with one coherent EWShop slice:

1. duplicate fact-line suppression;
2. `Reference key` hiding;
3. duplicate `Category`/`Kind` suppression;
4. `Leader Priority` hiding.

This slice removes the most visible database-output artifacts across the most
categories without requiring exporter work or a Codex redesign.
