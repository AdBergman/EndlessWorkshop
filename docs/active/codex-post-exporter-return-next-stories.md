# Codex Post-Exporter-Return Next Stories

Status: active planning note  
Current as of 2026-06-16

This note captures the next practical EWShop Codex stories after the completed
2026-06-14 DB Exporter return verification. Source evidence:

- `docs/active/codex-exporter-return-progress.md`
- `docs/current-action-priorities.md`
- current Codex diagnostics commands and browser QA notes from the RET-001
  through RET-006 batch

Do not reopen archived June 13 planning items unless current imports,
diagnostics, or browser QA reproduce the problem.

## Recommended Order

1. Done - `EW-CODEX-NEXT-005` - Exporter Feedback Handoff From Current Diagnostics
2. Done - `EW-CODEX-NEXT-001` - Review Tech Unlock Summary UX
3. Done - `EW-CODEX-NEXT-002` - Decide Resource Top-Level Category Treatment
4. Done - `EW-CODEX-NEXT-004` - Quest Strategy Codex Reference QA
5. Next - `EW-CODEX-NEXT-006` - Investigate Bonuses Import Failed Rows
6. Then - `EW-CODEX-NEXT-003` - Clean Effect Detail Context Labels

Recommended next implementation story: `EW-CODEX-NEXT-006`.

Post-plan updates:

- `EW-CODEX-NEXT-002` was resolved by promoting `resources`,
  `councilorEffects`, and `partnerEffects` to top-level shallow reference
  categories. Modifiers remain hidden from top-level navigation.
- Shallow reference list rows now emphasize at-a-glance effects and exact
  source/extractor links instead of generic dossier previews.
- The effect label cleanup already done for shallow list rows does not complete
  `EW-CODEX-NEXT-003`; that story is specifically about effect detail-page
  context labels.

## EW-CODEX-NEXT-001 - Review Tech Unlock Summary UX

Owner: EWShop frontend/product  
Priority: P1

Why it matters to a 4X player:
Tech pages should answer "what do I get if I research this?" without forcing
the player to open every unlock target.

Scope:
- Investigate and, only if clearly useful, prototype one-line summaries for
  exact `Unlocks` section refs.
- Review examples from current QA: `Aspect_Technology_00`,
  `KinOfSheredyn_Technology_04`, and `LastLord_Technology_08`.

Acceptance criteria:
- Exact resolved unlock refs can show compact target summaries.
- Unresolved or text-only unlocks remain plain.
- Related Entries remain available.
- Row density remains readable on real Tech pages.

Validation/browser targets:
- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- Browser QA `Aspect_Technology_00`, `KinOfSheredyn_Technology_04`, and
  `LastLord_Technology_08`.

Do not / guardrails:
- Do not infer unlocks from prose, names, or display text.
- Do not create a generic renderer.
- Do not start SEO or graph UI.

Dependencies:
- Current exact Tech `Unlocks` refs.

Suggested Codex prompt:
```text
Goal:
Investigate and prototype Tech unlock one-line summaries using exact `Unlocks`
section refs only.

Scope:
Review current Tech pages and implement only if row density and player value are
clear. Preserve Related Entries and leave unresolved/text-only unlocks plain.

Do not:
Do not infer unresolved targets, create a generic renderer, start SEO, or change
exporter contracts.

Validation:
Run targeted Codex tests, frontend typecheck, browser QA the Tech examples, and
git diff --check.

Report:
UX decision, files changed, tests run, risks, and suggested commit message.
```

## EW-CODEX-NEXT-002 - Decide Resource Top-Level Category Treatment

Owner: EWShop product/frontend  
Priority: P1
Status: completed

Why it matters to a 4X player:
Resources are now real Codex entries, but top-level navigation only helps if
players naturally browse by resource rather than by extractor or search.

Scope:
- Product/browser review only.
- Compare current searchable-only Resources against possible top-level
  promotion.
- Use `Resource_Luxury01`, `Resource_Strategic01`, and `Extractor_Luxury01`.

Acceptance criteria:
- Explicit product decision: keep searchable-only, promote top-level, or defer.
- Decision is recorded with browser evidence.

Validation/browser targets:
- `/codex` category navigation.
- Search `Klax`.
- `Resource_Luxury01`, `Resource_Strategic01`, `Extractor_Luxury01`.

Do not / guardrails:
- Do not promote Resources during investigation.
- Do not change extractor grouping.
- Do not infer resource links.

Dependencies:
- None.

Suggested Codex prompt:
```text
Goal:
Review Resource Codex browse value after exporter return. Do not implement.

Scope:
Compare searchable-only Resources versus top-level navigation using Klax,
Titanium, and extractor pages.

Report:
Decision recommendation, browser evidence, player value score, and whether a
follow-up implementation story is justified.
```

Completion evidence:

- Commit `c22a2ff8` promoted Resources, Councilor Effects, and Partner Effects
  as top-level shallow reference categories.
- Commit `5396e67e` improved shallow row hierarchy and exact source/extractor
  presentation.
- Commit `0bab089d` removed repeated category words from shallow row labels.
- Modifiers remain hidden from top-level navigation.

## EW-CODEX-NEXT-003 - Clean Effect Detail Context Labels

Owner: EWShop frontend  
Priority: P2

Why it matters to a 4X player:
Councilor Effect and Partner Effect pages render useful mechanics, but
technical suffixes such as `Effect Defense21` make the detail header feel like
database output.

Scope:
- Local display cleanup for `councilorEffects` and `partnerEffects` context
  lines only, if safe.

Acceptance criteria:
- Effect pages keep readable kind labels.
- Technical key suffixes are suppressed or replaced by exported role/kind
  context.
- Search, direct links, Related Entries, and mechanics rendering are unchanged.

Validation/browser targets:
- `Notable_Elder_MinorFaction_Hydracorn`
- `CouncilorEffect_Defense21`
- `PartnerEffect_Hydracorn_PartnerTrait01`
- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`

Do not / guardrails:
- Do not promote effect categories.
- Do not rewrite mechanics text.
- Do not create a generic label system.

Dependencies:
- None.

Suggested Codex prompt:
```text
Goal:
Fix only the effect detail context-label roughness for Councilor Effects and
Partner Effects.

Scope:
Keep categories searchable/linkable only, preserve mechanics and related links,
add focused tests, and stop if the fix becomes broad.

Validation:
Run targeted Codex tests, frontend typecheck, browser QA the Hydracorn/Atea
effect path, and git diff --check.
```

## EW-CODEX-NEXT-004 - Quest Strategy Codex Reference QA

Owner: EWShop frontend/product  
Priority: P1
Status: completed

Why it matters to a 4X player:
Exporter quest refs are not visible as a generic Codex `quests` category in
current local imports, so Strategy reward/requirement links need their own QA
path.

Scope:
- Browser-review Quest Strategy rows with exact Codex previews.
- Verify rewards and requirements resolve safely.

Acceptance criteria:
- Exact refs link and preview as intended.
- Unresolved refs stay plain.
- No Lore expansion and no fake links.

Validation/browser targets:
- Quest Strategy pages with known requirement/reward refs.
- Existing Quest Codex reference tests.

Do not / guardrails:
- Do not redesign Quest Explorer.
- Do not expand into Lore.
- Do not infer links.

Dependencies:
- Current Quest Explorer data.

Suggested Codex prompt:
```text
Goal:
Run Quest Strategy Codex reference QA using current imports.

Scope:
Verify exact requirement/reward refs, hover/focus previews, unresolved plain
text, and no inferred links. Implement only tiny proven fixes.

Validation:
Run relevant Quest/Codex tests, browser QA Strategy examples, and git diff
--check.
```

Completion evidence:

- Browser QA on `/quests/FactionQuest_Mukag_Chapter02_Step01?mode=strategy`
  found exact `ArmyAction` metadata for `ActionTypeBuildBridge` stayed plain
  before the fix.
- The Quest Codex resolver now maps exact `ArmyAction` / `ArmyActionType`
  refs to Codex Actions.
- Build Bridge, Hydromatic Laboratory, and Mukag Monsoon Festival all expose
  exact Codex open links after the fix.
- `Bonus` references remain unresolved and are tracked by
  `EW-CODEX-NEXT-006`.

## EW-CODEX-NEXT-005 - Exporter Feedback Handoff From Current Diagnostics

Owner: EWShop docs/product; DB Exporter/editorial as consumer  
Priority: P1

Why it matters to a 4X player:
The remaining high-impact Codex issues are mostly missing player-facing context,
not frontend rendering bugs. A focused handoff lets the exporter team improve
the data instead of EWShop adding local hacks.

Scope:
- Create a concise public-safe handoff from current diagnostics and QA notes.
- Cover thin Actions, thin Districts/Improvements, raw population faction key
  facts, thin Resource/Extractor entries, and the bonuses import failed-row
  risk if it can be described safely.

Acceptance criteria:
- Examples are public-safe and include entry keys where safe.
- EWShop-fixed items are called out so they are not reopened.
- Exporter/editorial-owned issues are separated from EWShop-owned issues.

Validation/browser targets:
- Rerun content diagnostic only if updating counts:
  `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
- `git diff --check`

Do not / guardrails:
- Do not create exporter tickets without evidence.
- Do not include hidden or unreleased names.
- Do not request frontend hacks for exporter-owned data issues.

Dependencies:
- Current diagnostics and `docs/active/codex-exporter-return-progress.md`.

Suggested Codex prompt:
```text
Goal:
Prepare the current Codex exporter/editorial feedback handoff.

Use:
- docs/active/codex-exporter-return-progress.md
- docs/current-action-priorities.md
- current diagnostics output
- active exporter return bundle

Scope:
Create a concise public-safe handoff for DB Exporter/editorial covering only
current evidence: thin Actions, thin Districts/Improvements, raw population
faction key facts, thin Resource/Extractor entries, and bonuses import
failed-row risk if safely describable.

Do not:
Do not implement code, infer links, expose hidden names, reopen old June 13
backlog, or request frontend hacks.

Validation:
Rerun content diagnostic only if updating numbers, then run git diff --check.

Report:
Handoff path, summary, top exporter asks, EWShop blockers, and suggested commit
message.
```

## EW-CODEX-NEXT-006 - Investigate Bonuses Import Failed Rows

Owner: EWShop backend  
Priority: P2

Why it matters to a 4X player:
The local startup import reports two failed bonus rows. If those rows are public
statuses or modifiers, related links may silently disappear.

Scope:
- Investigate failed-row details without changing release gates.
- Determine whether the failures are duplicates, filtered hidden content,
  invalid data, or real public missing entries.

Acceptance criteria:
- Cause is documented.
- No hidden names are printed.
- Fix is made only if the issue is public, low-risk, and not a release-safety
  gate change.

Validation/browser targets:
- Targeted backend import test if code changes.
- Dead-ref diagnostics if available.

Do not / guardrails:
- Do not loosen release-safety gates.
- Do not print hidden or unreleased names.
- Do not expose hidden content.

Dependencies:
- Local startup import logs or importer diagnostics.

Suggested Codex prompt:
```text
Goal:
Investigate the two failed bonuses Codex rows reported during local startup
import.

Scope:
Do not change release gates or print hidden names. Classify cause, add a
targeted test/fix only for public low-risk issues, otherwise document.

Validation:
Run targeted backend tests and git diff --check.
```

## Stories To Defer Or Skip

- Trait granted Ability previews: no current evidence that exact refs are strong
  enough to justify UI work.
- Treaty Status/effect preview: browser QA found `Close Borders` works and
  `Shared Research` is acceptable; broad treaty previews risk bloat.
- Action page UI treatment: many Actions remain exporter/editorial-thin.
- Status scope filtering: wait until scope metadata quality is product-reviewed.
- Generic preview renderer: not justified by current evidence.
- Modifier top-level promotion: explicitly out of scope and not useful.

## Human Decisions Needed

- Whether to close the DB Exporter feedback loop first
  (`EW-CODEX-NEXT-005`) or continue frontend value work with Tech unlock summary
  UX (`EW-CODEX-NEXT-001`).
- Whether Resources should remain searchable-only permanently or receive a
  focused top-level-navigation product review.
- Whether cosmetic effect context labels are worth a small P2 cleanup before
  larger Codex work.

## Suggested Commit Message

```text
docs(codex): add post-exporter-return story plan
```
