# Codex Current Audit Ticket Plan

Status: active ticket source  
Current as of 2026-06-16

This plan replaces the exhausted post-exporter-return NEXT list with a fresh
audit against the current local Codex JSON files, current EWShop implementation,
and the 2026-06-14 DB Exporter return handoff.

Use this as the source for the next self-sustaining Codex loop. Do not reopen
archived June 13 tickets unless a current diagnostic, browser QA note, or local
import reproduces the issue.

## Evidence Used

- Current local Codex imports in `local-imports/codex/`.
- DB Exporter aggregate handoff:
  `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`.
- Current EWShop progress:
  `docs/active/codex-exporter-return-progress.md`.
- Current self-sustaining worklog:
  `docs/active/codex-self-sustaining-worklog.md`.
- Regenerated diagnostics:
  - `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`

## Current Audit Summary

- Current local Codex JSON contains 2,127 entries across current visible and
  searchable/linkable categories.
- Content-quality diagnostic reports 178 high findings, all
  Exporter/editorial-owned:
  - 170 missing-player-context findings.
  - 8 raw-internal-text findings.
  - Affected categories: actions 87, districts 41, improvements 23,
    abilities 19, populations 7, councilors 1.
- Current content-quality diagnostic reports 0 EWShop-owned findings.
- Preview/relationship diagnostics still identify high-value relationship
  areas, but several are already implemented in EWShop. Treat generated
  recommendations as candidates to review, not as current implementation
  status.

## Current EWShop Implementation Baseline

Done in EWShop for current imports:

- Generic Codex metadata preservation/rendering.
- Actions, Diplomatic Treaties, Statuses, hidden/linkable Modifiers.
- Related links and Quest Strategy baseline links.
- Equipment, Unit, and Hero granted Ability previews with local Related
  Entries dedupe.
- Ability inline Status links.
- Population exact threshold reward summaries for exact resolved refs.
- Tech exact unlock one-line summaries.
- Resource, Councilor Effect, and Partner Effect shallow top-level categories.
- Shallow row label cleanup and effect detail context-label cleanup.
- Quest Strategy exact `ArmyAction` refs to Codex Actions.

Still true:

- EWShop must not infer links from display names, prose, fuzzy matching, or
  "looks like it should match".
- Modifiers remain hidden from top-level navigation.
- Thin entries should stay searchable/linkable, not promoted as rich strategy
  surfaces.

## Recommended EWShop Order

1. `EW-CODEX-AUDIT-001` - Make diagnostics implementation-aware. Completed
   in the current loop; generated reports now mark completed exact-ref
   surfaces as implemented.
2. `EW-CODEX-AUDIT-002` - Browser-QA Population threshold summaries against
   current exact refs.
3. `EW-CODEX-AUDIT-003` - Review Diplomatic Treaty applied Status usefulness.
4. `EW-CODEX-AUDIT-004` - Harden Quest Strategy Codex preview accessibility.
5. `EW-CODEX-AUDIT-005` - Browser-review Action mechanics presentation.

Stop the self-sustaining loop if a story requires exporter data, release-gate
changes, broad redesign, or display-name/prose inference.

## EWShop Tickets

### EW-CODEX-AUDIT-001 - Make Codex Diagnostics Implementation-Aware

Owner: EWShop frontend/tooling  
Priority: P1
Status: completed

Why this matters to a 4X player:
The diagnostics currently keep recommending some already-implemented surfaces.
That wastes review time and can send the team back into completed work instead
of finding the next real player-value gap.

Scope:
- Review `codex-preview-surface-audit.ts` and
  `codex-relationship-value-gap-audit.ts`.
- Add a small implementation-status overlay for known completed EWShop
  surfaces:
  - Tech exact unlock summaries.
  - Population exact threshold reward summaries.
  - Unit/Equipment/Hero granted Ability previews.
  - Ability inline Status links.
  - Resource/Councilor Effect/Partner Effect shallow categories.
- Keep diagnostics deterministic and rerunnable.
- Regenerate active reports.

Acceptance criteria:
- Generated reports no longer present completed EWShop work as the top "next"
  implementation story.
- Reports still show unresolved/exporter-owned gaps.
- No UI behavior changes.

Validation:
- `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
- `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
- `npx tsc --noEmit --project tsconfig.json`
- `git diff --check`

Do not:
- Do not hide genuine current gaps.
- Do not create a generic diagnostic framework.
- Do not change Codex UI.

Suggested Codex prompt:

```text
Goal:
Make the Codex preview-surface and relationship-gap diagnostics aware of
currently implemented EWShop surfaces.

Scope:
Update only diagnostic scripts and regenerated active reports. Mark already
implemented surfaces as completed so reports stop recommending stale next
stories.

Do not:
Do not change UI, exporter contracts, release gates, or Modifiers navigation.

Validation:
Run both diagnostics with --output to docs/active, run frontend typecheck, and
git diff --check.

Report:
Files changed, stale recommendations removed, remaining top candidates, tests,
and suggested commit message.
```

### EW-CODEX-AUDIT-002 - Browser-QA Population Threshold Summaries

Owner: EWShop frontend/product  
Priority: P1

Why this matters to a 4X player:
Population pages are breakpoint planning surfaces. The player should understand
exact reward targets without opening every related card, but text-only rewards
must remain plain.

Scope:
- Browser-QA current Population pages after the exporter return:
  - one major faction population with exact refs,
  - one major faction population with text-only rewards,
  - `Population_Minor_DaughterOfBor`,
  - `Population_Minor_Horatio`,
  - one Mangrove/created/special population if present.
- Verify exact resolved threshold summaries render.
- Verify text-only rewards stay plain.
- Verify duplicate Related Entries are hidden only for shown summaries.
- Make only tiny local fixes if current exact refs are not surfaced correctly.

Acceptance criteria:
- Current exact threshold refs behave as intended.
- No display-name/prose inference is added.
- Browser QA notes are recorded in the worklog.

Validation:
- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build` if frontend code changes
- `git diff --check`

Do not:
- Do not fix text-only major faction rewards locally.
- Do not change exporter contracts.
- Do not create a generic renderer.

Suggested Codex prompt:

```text
Goal:
Browser-QA Population threshold reward summaries against current exact refs.

Scope:
Verify exact threshold summaries, text-only reward behavior, and Related
Entries dedupe on representative Population pages. Implement only tiny EWShop
fixes if current exact refs fail to render.

Do not:
Do not infer links from reward names/prose or change exporter contracts.

Validation:
Run targeted Codex tests, typecheck, build if code changes, browser QA, and
git diff --check.

Report:
QA targets, findings, fixes if any, tests, player value, and commit hash.
```

### EW-CODEX-AUDIT-003 - Review Diplomatic Treaty Applied Status Usefulness

Owner: EWShop frontend/product  
Priority: P2

Why this matters to a 4X player:
Some Treaty pages have exact applied Status refs. A player may need the Status
effect near the treaty decision, but many treaties already explain themselves
and should not get noisy duplicate previews.

Scope:
- Browser-review treaty pages with exact applied Status refs:
  - `Declaration_CloseBorders`
  - `Declaration_EmbraceCoralSymbiosis`
  - `Declaration_FactionQuest_Aspect_Chapter06AStep02`
  - `Treaty_SharedResearch`
- Decide whether a local Status preview helps, or whether Related Entries are
  enough.
- Prototype only if one restrained pattern is clearly useful and local.

Acceptance criteria:
- A product decision is documented.
- Any implementation uses exact resolved refs only.
- No broad Treaty redesign.

Validation:
- Browser QA.
- If code changes: `npm test -- --run src/pages/CodexPage.test.tsx`,
  `npx tsc --noEmit --project tsconfig.json`, `npm run build`,
  `git diff --check`.

Do not:
- Do not duplicate Status details where treaty Effects text already answers the
  player question.
- Do not infer status links from prose.
- Do not create a generic renderer.

Suggested Codex prompt:

```text
Goal:
Review Diplomatic Treaty applied Status usefulness with current exact refs.

Scope:
Browser-QA treaty examples and decide whether a restrained exact Status preview
is worth prototyping. Implement only if clearly local and high value.

Do not:
Do not infer links, redesign Treaty pages, create a generic renderer, or change
exporter contracts.

Validation:
Browser QA and, if code changes, targeted Codex tests, typecheck, build, and
git diff --check.

Report:
Decision, evidence, fixes if any, remaining exporter blockers, and commit hash.
```

### EW-CODEX-AUDIT-004 - Harden Quest Strategy Codex Preview Accessibility

Owner: EWShop frontend  
Priority: P2

Why this matters to a 4X player:
Quest Strategy now links exact Codex refs. The next player-value question is
whether hover/focus previews work well enough on keyboard and touch/mobile.

Scope:
- Review current Quest Strategy Codex preview links on desktop and narrow
  layouts.
- Verify keyboard focus, click/tap behavior, and preview dismissal.
- Improve only if there is a concrete accessibility friction point.

Acceptance criteria:
- Keyboard and touch behavior are documented.
- Any fix stays within Quest Strategy Codex preview/link components.

Validation:
- Targeted Quest Strategy tests.
- `npm test -- --run src/pages/CodexPage.test.tsx` if Codex shared behavior is
  touched.
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build` if code changes
- `git diff --check`

Do not:
- Do not redesign Quest Explorer.
- Do not expand Codex links into Lore.
- Do not infer missing refs.

Suggested Codex prompt:

```text
Goal:
Review and harden Quest Strategy Codex preview accessibility.

Scope:
Check keyboard/focus and touch/narrow behavior for exact Codex preview links.
Implement only concrete local fixes.

Do not:
Do not redesign Quest Explorer, expand into Lore, or infer missing refs.

Validation:
Run targeted Quest Strategy tests, frontend typecheck, browser QA, build if
code changes, and git diff --check.

Report:
QA notes, accessibility findings, fixes if any, tests, and commit hash.
```

### EW-CODEX-AUDIT-005 - Browser-Review Action Mechanics Presentation

Owner: EWShop frontend/product  
Priority: P3

Why this matters to a 4X player:
Most Actions are exporter-thin, but 52 Actions do have mechanics sections.
There may be a small EWShop presentation win for entries with current exact
sections, while facts-only Actions should stay plain.

Scope:
- Browser-review Actions with current mechanics sections:
  - `ActionTypeAbsorbCity`
  - `ActionTypeCloseRift`
  - `ConstructibleAction_RazeDistrict`
  - one thin action such as `ActionTypeBuildObservatory`
- Decide whether generic structured rendering is already sufficient.
- Implement only tiny local presentation cleanup if the current page is
  unnecessarily hard to scan.

Acceptance criteria:
- Facts-only actions remain searchable/linkable but not artificially enriched.
- Any improvement uses existing facts/sections only.

Validation:
- Browser QA.
- If code changes: targeted Codex tests, typecheck, build, `git diff --check`.

Do not:
- Do not invent action summaries.
- Do not promote thin Actions as rich browse surfaces.
- Do not change release-safety gates.

Suggested Codex prompt:

```text
Goal:
Browser-review Action mechanics presentation for entries that already have
exported mechanics sections.

Scope:
Compare mechanics-rich and facts-only Action pages. Implement only tiny
EWShop-owned scanability fixes if current structured rendering is not enough.

Do not:
Do not invent summaries, infer mechanics, promote thin Actions, or touch
release gates.

Validation:
Browser QA and, if code changes, targeted Codex tests, typecheck, build, and
git diff --check.

Report:
Decision, evidence, fixes if any, tests, and commit hash.
```

## DB Exporter / Editorial Tickets

### DB-CODEX-GAP-001 - Add Public Gameplay Context To Thin Actions

Owner: DB Exporter/editorial  
Priority: P1

Why this matters to a 4X player:
Action pages should answer what the action does, when it is available, what it
costs, and what it targets. Current facts-only Action pages feel like database
stubs.

Evidence:
- Content diagnostic: 87 Action entries have classification facts only.
- Relationship audit: 139 Actions total, 52 with sections, 87 facts-only.
- Examples: `ActionTypeArmyStealTerritory`,
  `ActionTypeBanishPopulationFromSettlement`, `ActionTypeBuildObservatory`.

Expected fix:
- Add concise public gameplay summaries/effects/costs/source/availability and
  exact affected-target refs where canonical public data exists.
- Leave entries thin when no public canonical source exists.

Do not:
- Do not export guessed mechanics.
- Do not expose hidden/unreleased content.

### DB-CODEX-GAP-002 - Add Public Context To Thin Districts And Improvements

Owner: DB Exporter/editorial  
Priority: P1

Why this matters to a 4X player:
District and Improvement pages are planning surfaces. Facts-only rows do not
answer what the building does or why the player should care.

Evidence:
- Content diagnostic: 41 District entries and 23 Improvement entries have
  classification facts only.
- Examples: `District_Bridge`, `District_Tier0_Bridge`,
  `DistrictImprovement_Bridge_01`, `DistrictImprovement_Extractor_01`.

Expected fix:
- Export effects, unlocks, requirements, source, and exact target refs where
  canonical public data exists.

Do not:
- Do not ask EWShop to infer from names, tags, or descriptors.

### DB-CODEX-GAP-003 - Fill Thin Ability Mechanics Where Public

Owner: DB Exporter/editorial  
Priority: P1

Why this matters to a 4X player:
Ability pages are consulted from Units, Heroes, Equipment, and Quest Strategy.
Facts-only Ability pages break the preview-surface model because EWShop cannot
summarize a missing effect.

Evidence:
- Content diagnostic: 19 Ability entries have classification facts only.
- Examples: `UnitAbility_AlwaysRetaliate`, `UnitAbility_Blossom_1`,
  `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`.

Expected fix:
- Add public effects/mechanics/source context where canonical data exists.
- Preserve exact Status/Ability refs when effects apply or grant other entries.

Do not:
- Do not export AI-only/private heuristic text.

### DB-CODEX-GAP-004 - Replace Raw Population Keys And Complete Threshold Refs

Owner: DB Exporter/editorial  
Priority: P1

Why this matters to a 4X player:
Population pages are breakpoint-planning pages. Raw faction keys and text-only
threshold rewards block safe links and make pages feel like database output.

Evidence:
- Content diagnostic: 7 Population raw-internal-text findings.
- Relationship audit: 74 threshold items; 22 exact unique refs usable, 52
  rewards text-only.
- Examples:
  - `Population_Aspect` fact value exposes `Faction_Aspect`.
  - `Population_KinOfSheredyn` fact value exposes `Faction_KinOfSheredyn`.
  - `Population_Minor_MangroveOfHarmony` threshold fact value exposes
    `MangroveOfHarmony_District_Tier1_Money`.

Expected fix:
- Export public display labels for player-facing fact values.
- Attach exact `referenceKey` to threshold items or reward facts where the
  target is a public Codex entry.

Do not:
- Do not rely on EWShop display-name matching.

### DB-CODEX-GAP-005 - Improve Resource, Extractor, And Deposit Context

Owner: DB Exporter/editorial  
Priority: P2

Why this matters to a 4X player:
Resources are now top-level shallow references in EWShop. Thin resource or
extractor rows leave players without clear source/use information.

Evidence:
- Relationship audit: 24 Resource entries, 16 with direct Effects, 2 thin.
- Relationship audit: advanced/grand extractor rows often lack effect lines.
- Exporter handoff defers Resource deposits / POI pages.
- Examples: `Resource_Specific_Corpse`, `Resource_Specific_Spirit`,
  `Extractor_Luxury01_Tier2`.

Expected fix:
- Add public use/source/effect/availability context where canonical.
- Add ResourceDeposit/POI pages only when public and useful.

Do not:
- Do not export raw private source names as public prose.

### DB-CODEX-GAP-006 - Add Treaty Effects And Fix Incomplete Public Text

Owner: DB Exporter/editorial  
Priority: P2

Why this matters to a 4X player:
Treaties are decision pages. Players need the direct impact before accepting or
declaring them.

Evidence:
- Relationship audit: 22 Treaties; 8 direct Effects, 6 Status refs, 11 with
  neither.
- Examples: `Treaty_AskToSurrender`, `Treaty_ProposeSurrender`,
  `Treaty_SharedVictory`.

Expected fix:
- Add direct public Effects summaries and exact Status refs where canonical.
- Fix incomplete tribute/surrender public text.

Do not:
- Do not ask EWShop to infer treaty values from prose or runtime placeholders.

### DB-CODEX-GAP-007 - Add Status Sub-Kind/Scope And Fill Thin Statuses

Owner: DB Exporter/editorial  
Priority: P2

Why this matters to a 4X player:
Status pages are numerous. Without public sub-kind/scope, EWShop cannot group
or filter them in a way that answers "is this combat, city, empire, public
opinion, or hero?"

Evidence:
- Relationship audit: 337 Status entries, 303 with mechanics, 32 thin.
- Current subcategory is still broad `Status`.
- Example thin entries include `HeroStatus_Loss` and
  `Status_AdministrativeCenter_Subjugation`.

Expected fix:
- Export public sub-kind/scope labels and fill mechanics where canonical.

Do not:
- Do not expose hidden/internal scope names.

### DB-CODEX-GAP-008 - Omit Or Fix Deprecated Bonus Placeholder Rows

Owner: DB Exporter/editorial  
Priority: P3

Why this matters to a 4X player:
Deprecated placeholder bonus rows currently surface as import failed-row noise.
They do not appear to block visible player content, but they make QA less clear.

Evidence:
- EWShop local startup import: bonuses `received=587`, `inserted=583`,
  `failed=2`.
- Failed rows are `ConstructibleCostModifier_UnitCostReduction03` and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- Both display names are `[DEPRECATED]`.

Expected fix:
- Omit deprecated placeholder bonus rows from public Codex exports, or provide
  real player-facing names/context if they are still useful.

Do not:
- Do not treat this as a release blocker unless dead-ref diagnostics show a
  missing public target.

### DB-CODEX-GAP-009 - Replace One Raw Councilor Description Key

Owner: DB Exporter/editorial  
Priority: P3

Why this matters to a 4X player:
A raw description key in public Councilor content breaks the encyclopedia feel.

Evidence:
- Content diagnostic: `Notable_FactionQuest_Mukag_Chapter05_Perisai` has
  `descriptionLines[1]` value
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.

Expected fix:
- Export readable public copy or omit the raw internal key.

Do not:
- Do not expose private narrative/source identifiers as player-facing text.

## Tickets To Skip For Now

- Broad Status grouping in EWShop: wait for exported public sub-kind/scope.
- Broad Treaty preview renderer: investigate narrowly first; many pages need
  data/editorial improvements.
- Generic renderer: current patterns are scoped and should stay scoped.
- Modifier promotion: explicitly out of scope.
- SEO, graph visualization, Quest Explorer redesign, Units route work.
