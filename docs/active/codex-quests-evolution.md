# Codex Quests Evolution

Status: complete with follow-up recommended  
Category: Quests  
Started: 2026-06-20  
Process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

This document is the durable working memory for evolving the Codex Quests
category into a player-facing archive without relying on chat history.

Quests have a special boundary:

- `/quests` owns the rich Quest Explorer experience: progression, branch
  topology, lore/strategy reading, and path semantics.
- Codex Quests should be a searchable encyclopedia/archive surface for quest
  identity, concise public context, exact references, and detail/permalink
  inspection.

Do not rebuild Quest Explorer inside Codex. Use
`docs/quest_explorer_canonical_semantics_v1.md` as the authority for Quest
Explorer semantics.

## Phase 0 - Plan

### Category Classification Hypothesis

Initial classification: Existing route-owned Explorer with Codex archive
support.

Reasoning:

- Quest progression and topology already have a dedicated `/quests` route.
- Codex Quests should help users search and inspect quest records without
  competing with Quest Explorer.
- Existing Codex-only quest grouping/path rendering appears to expose
  key-derived chapter/step/choice concepts that are explicitly sensitive in
  the canonical Quest semantics.

### Audit Plan

Audit Quests for:

- entry count;
- exported facts and sections;
- exact references;
- safe browse models;
- relationship value;
- existing Codex Quest grouping/path/detail behavior;
- boundary with `/quests`;
- exporter/data quality issues.

Classify every finding as:

- frontend action;
- exporter backlog;
- intentionally deferred.

### Implementation Plan

Do not implement until audit and proposal review are recorded.

Likely first slice:

- add a compact Quest Category rail using exported `Category` facts;
- simplify Codex Quest archive/detail presentation so it no longer behaves like
  a mini progression/path reader;
- preserve `/quests` untouched.

## Phase 1 - Audit

Source: local Codex export
`local-imports/codex/ewshop_quests_codex_export_0.82.json`.

### Data Audit

- Entry count: 300.
- Exported categories:
  - `MajorFaction`: 227.
  - `MinorFaction`: 31.
  - `Curiosity`: 30.
  - `Awakening`: 12.
- Facts:
  - `Kind`: 300.
  - `Category`: 300.
  - `Mandatory`: 297.
  - `Chapter`: 195.
  - `Faction`: 15.
- Sections:
  - `Choices`: 288.
  - `Objective`: 283.
  - `Rewards`: 136.
  - `Requirements`: 93.
  - `Effects`: 6.
- Exact references:
  - 563 total reference keys.
  - Major reference families include `FactionQuest`, `Faction`, `Equipment`,
    `Hero`, `Technology`, `District`, `MinorFaction`, `Population`,
    `UnitAbility`, and `Unit`.
- Data shape:
  - Quest rows often contain useful public descriptions plus Objective,
    Requirements, Rewards, and Choices lines.
  - Major-faction rows carry `Chapter`, but chapter/progression semantics are
    subtle and should not be expanded into a Codex path reader.
  - Only a small number of rows carry explicit `Faction` facts; broad faction
    ownership should not be inferred.

Finding classification:

- Frontend action: `Category` is complete and safe for first-pass navigation.
- Frontend action: Quest rows can surface public description/objective/reward
  content as archive content.
- Frontend action: existing Codex Quest grouping/progression should be removed
  or simplified because it is key-derived and competes with `/quests`.
- Intentionally deferred: faction/chapter navigation. Chapter is useful in
  detail context but not a safe primary rail without Quest Explorer semantics.
- Exporter backlog: no blocker found for first slice.

### Browse Audit

Supported 4X browse questions:

- Is this a Major Faction, Minor Faction, Curiosity, or Awakening quest?
- What is the quest asking me to do?
- What requirements/rewards are visible?
- What exact entries does the quest reference?

Unsupported or unsafe first-pass browse questions:

- Which exact major-faction story arc does every row belong to, unless exported
  as exact facts/references and not inferred from keys.
- Which branch/path/choice topology applies. That belongs to `/quests`.
- Which lore/strategy path is optimal. That belongs to Quest Explorer.

### Navigation Audit

Recommended first navigation:

- Quest Category
  - All
  - Major Faction
  - Minor Faction
  - Curiosity
  - Awakening

Rationale:

- Uses exported `Category` facts only.
- Gives orientation for 300 rows.
- Avoids inferred faction/chapter/path navigation.

Do not use yet:

- Chapter as a rail: it applies mainly to Major Faction quests and could imply
  progression semantics.
- Faction as a rail: sparse explicit fact coverage.
- Choices/path/branch: Quest Explorer-owned.

### Main Panel Audit

Current issues:

- Codex Quest rows can collapse multiple internal nodes into grouped quest
  chapters.
- The grouped overview says "quest nodes" and points to compact progression in
  the detail view.
- This is too close to the Quest Explorer progression model and is based on
  `entryKey` parsing.

Recommended:

- Keep rows content-first.
- Show public quest description/objective/reward/requirement signals.
- Move orientation metadata to quiet right-side row metadata where possible.
- Do not render grouped quest nodes or a mini progression path.

### Detail Audit

Current issue:

- Codex detail renders `Quest Progression` for grouped Quest entries.
- This competes with `/quests`, and it uses key-derived step/choice labels that
  the canonical semantics warns against treating as user progression.

Recommended:

- Remove Codex-only Quest progression rendering.
- Keep normal structured detail sections for Objective, Requirements, Rewards,
  Choices, Effects, and exact Related entries.
- Treat detail as permalink/inspection, not a Quest Explorer substitute.

### Relationship Audit

Exact references are valuable in detail:

- outbound Quest links to next quest rows;
- exact Faction references;
- exact Equipment/Hero/Technology/District/MinorFaction/Population/UnitAbility
  references.

Recommendation:

- Keep existing exact Related entries.
- Do not add row relationship chips in first slice.
- Do not infer relationships from quest titles, keys, or prose.

### Exporter Audit

No blocking exporter findings for first slice.

Potential non-blocking findings:

- Explicit faction/questline ownership facts are sparse compared with key
  patterns and references.
- Some descriptions include old classification lines such as `Category:` and
  `Mandatory quest`, which frontend can suppress in archive previews.

Do not append to exporter backlog yet; these do not block the first UI slice
and need a broader exporter review before becoming requests.

## Phase 2 - Proposal Review

### What This Category Is

Codex Quests is a searchable archive/permalink support surface for the
Quest system. It is not the Quest Explorer.

### How a 4X Player Browses It

A player likely asks:

- "Which quests are Major Faction vs Minor Faction vs Curiosity?"
- "What does this quest require?"
- "What reward or exact referenced entity is connected?"
- "Can I find the quest quickly from search and share a detail URL?"

### Strongest Navigation Model

Quest Category is strongest because it is complete, exported, and maps to
player mental models without touching progression semantics.

### What Should Remain Visible

- Quest name.
- Public summary/description.
- Objective/requirement/reward signal where exported.
- Quiet category/chapter/mandatory metadata.
- Exact related entries in detail.

### What Should Move To `/quests`

- Branch/path rendering.
- Step progression visualization.
- Lore/strategy reading modes.
- Choice topology and path planning.

### Smallest Meaningful Improvement

Implement `QUESTS-UI-001`:

- Quest Category rail.
- Remove/simplify Codex Quest grouping/progression rendering.
- Keep current structured detail and exact related entries.

### Review Challenges

UX designer:

- A 300-row generic list needs orientation.
- "Quest nodes" and a mini path create visual and conceptual noise.

Frontend tech lead:

- Existing grouping and labels are driven by `entryKey` parsing, violating the
  current no-inference posture for category evolution.
- Removing the special progression path reduces category-specific complexity.

4X player:

- Codex should answer "what is this quest and what does it touch?"
- If I want branches and strategy/lore, I should use `/quests`.

Decision: implement `QUESTS-UI-001`.

## Implementation Results

### QUESTS-UI-001 - Quest Category Archive Rail

Implemented 2026-06-20.

What changed:

- Added a Quest Category rail for Codex Quests using exported `Category` facts.
- Supported category shelves:
  - All.
  - Major Faction.
  - Minor Faction.
  - Curiosity.
  - Awakening.
- Selecting a Quest Category filters the Codex Quest archive list.
- Selecting/clearing a category from a Quest detail route returns to the archive
  list and removes the `entry` query param.
- Search continues to combine with the Quest Category rail.
- Registered Quests as a dedicated Codex `questArchive` mode.

What was removed:

- Codex-only synthetic quest grouping.
- Codex-only `Quest Progression` detail widget.
- Key-derived quest path/node/variant display in Codex.
- Quest-specific grouping CSS and tests that preserved the old mini-progress
  behavior.

What stayed:

- `/quests` Quest Explorer route and progression semantics are untouched.
- Codex Quest detail still shows exported sections and exact related entries.
- Quest category/chapter/mandatory detail context now comes from exported facts.

Validation:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts src/lib/codex/codexPresentation.test.ts`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

Browser/product smoke:

- Started the local frontend with `npm start -- --host 127.0.0.1 --port 5173`.
- Confirmed `/codex?category=quests` served through Vite with HTTP 200.
- Headless Chrome product smoke was attempted twice but the local Chrome process
  exited with code 134 before rendering. No pixel-level browser review was
  completed in this environment.

### Product Review

UX designer:

- Improved orientation for a 300-entry category without introducing a heavy
  filter panel.
- Removing the Codex progression widget reduces conceptual competition with
  Quest Explorer.
- Remaining visual risk: generic Quest rows may still benefit from a later row
  preview polish pass, but the first archive correction is clear and stable.

Frontend tech lead:

- Removed stale, key-derived Codex Quest grouping code instead of suppressing it
  at render time.
- Kept the new rail product-specific rather than introducing a generic facet
  framework.
- Preserved shared Codex route/search/detail behavior and `/quests`.

4X player:

- The category now answers "what kind of quest is this?" before asking the
  player to scan 300 entries.
- Quest Explorer remains the right place for branch, lore, and strategy
  progression.

### Refactor / Stale Code Review

Removed stale Codex-only Quest files:

- `frontend/src/components/Codex/CodexQuestGroupRow.tsx`
- `frontend/src/components/Codex/CodexQuestProgression.tsx`
- `frontend/src/lib/codex/codexQuestGrouping.ts`
- `frontend/src/lib/codex/codexQuestGrouping.test.ts`

Removed obsolete Quest grouping/progression branches from:

- `CodexPage.tsx`
- `CodexResultList.tsx`
- `CodexEntryDetail.tsx`
- `CodexSummaryDetail.tsx`
- `codexPresentation.ts`
- `CodexPage.css`

No unrelated Quest Explorer code was changed.

## Accepted Decisions

- Codex Quests is archive support for `/quests`, not a replacement.
- Quest Category rail is safe because it uses exported `Category` facts.
- Do not infer faction, chapter, or path semantics from quest keys.
- Remove Codex-only quest progression/path rendering.
- Keep exact references only.

## Rejected Directions

- Rebuilding branch/path/step progression inside Codex.
- Faction rail from key parsing.
- Chapter rail as first-pass navigation.
- Row relationship chips before product review proves they help.

## Open Questions

- Should Codex Quests eventually show a compact "Open in Quest Explorer"
  affordance for exact major-faction entries?
- Should exact outbound Quest references be grouped separately in detail?
- Should exporter provide richer questline/faction metadata as facts?
- Should Quest archive rows get a content-first row polish pass, or is the
  generic Codex row enough because `/quests` owns the premium Quest experience?

## Exporter Findings

None appended during the first audit.

Closeout check: no non-blocking exporter finding was concrete enough to append
to `docs/active/db-exporter-ability-metadata-handoff.md`.

## Future Follow-Ups

- `QUESTS-UI-003`: detail relationship grouping if exact references are useful
  but visually noisy.
- Optional: a compact "Open in Quest Explorer" affordance, only if exact
  routing from Codex entry to Quest Explorer entry is already stable.

## Lessons Learned

- Categories that already have a dedicated Explorer route should not duplicate
  that route's mental model inside Codex.
- Exact references can support detail inspection without becoming row content.
- Removing stale category-specific UI paths is safer than layering suppression
  logic over old inferred presentation.

## Reopen Decision Before QUESTS-UI-002

Reopened for `QUESTS-UI-002`.

Rationale:

- The mandatory boundary correction is complete: Codex Quests is now an archive
  support category instead of a mini Quest Explorer.
- The first navigation layer is complete and uses exported facts only.
- The largest stale implementation path was removed.
- However, the category is not complete enough yet. `QUESTS-UI-001` removed the
  wrong Codex progression UI, but it did not finish the archive browse model,
  generic rows are not enriched enough, right-side metadata is premature/noisy,
  and exact reward/unlock references are not surfaced enough.

## QUESTS-UI-002 - Quest Archive Row And Navigation Polish

Implemented 2026-06-20.

### Phase Recheck

- Browse audit: needs update. Quest Category is safe, but Major Faction is too
  broad for the bulk of the dataset when exact `Faction` facts or resolved
  references can prove more specific shelves.
- Navigation audit: needs update. Keep exported Category grouping, split Major
  Faction only where exact exported facts/references prove faction ownership,
  and keep all unproven Major Faction rows under generic Major Faction.
- Main panel audit: needs update. Quest rows should behave like useful
  encyclopedia rows with exported public summary/objective/reward/effect
  snippets and compact exact links.
- Detail audit: satisfied with caution. Detail pages may show richer exported
  sections and exact references, but must not become Quest Explorer or
  reintroduce branch/path/progression UI.
- Relationship audit: needs update. Exact equipment, technology, unit, hero,
  resource, status, trait, and related Quest references may be surfaced as
  compact row links when already resolved.
- Product review: needs update after implementation. The boundary with `/quests`
  remains accepted.

### Implementation Intent

- Keep the `Category` rail.
- Add specific major-faction shelves only from exact exported `Faction` facts or
  exact resolved Faction references.
- Remove premature right-side Quest row metadata until the category earns a
  stable metadata model.
- Enrich row content with exported public quest content and compact exact links.
- Keep detail as inspection/permalink support, not branch/path/progression UI.

### Implementation Results

Navigation:

- Kept exported Quest Category grouping:
  - Major Faction.
  - Minor Faction.
  - Curiosity.
  - Awakening.
- Added a second Major Faction rail group when exact data proves faction
  ownership.
- Current local export safely resolves five major-faction shelves from exact
  Faction references:
  - Aspects.
  - Kin of Sheredyn.
  - Last Lords.
  - Mukag.
  - Necrophages.
- Major Faction quest rows without exact faction facts/references remain under
  generic Major Faction.
- Search continues to combine with both category and specific-faction filters.
- Changing Quest filters from a selected Quest detail route returns to the
  archive list and removes `entry`.

Rows:

- Added a Quest-specific archive row hierarchy.
- Removed the premature right-side Quest metadata from rows.
- Rows now show:
  - quest name;
  - best public description/readable preview;
  - compact exported Objective/Requirements/Rewards/Effects snippets when
    available;
  - compact exact `Links:` affordances for resolved planning-useful references.
- Exact row links use existing `CodexInlineEntityLink`, preserving click and
  hover/focus tooltip behavior.
- Full relationship cards remain detail-only.
- No branch/path/progression UI was reintroduced.

Details:

- Detail pages keep exported structured sections and existing exact Related
  entries.
- Detail remains permalink/inspection support, not Quest Explorer.

Validation:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts src/lib/codex/codexPresentation.test.ts`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`

Browser/product smoke:

- Local Vite route smoke returned HTTP 200 for `/codex?category=quests`.
- Local Vite route smoke returned HTTP 200 for a selected Quest detail route.
- In-app browser automation could not initialize in this environment because
  the browser bridge reported missing sandbox metadata. No pixel-level browser
  review was completed.

### Product Review

UX designer:

- The rail is now more useful for Major Faction browsing without exposing
  inferred questline/path semantics.
- Row hierarchy is more archive-like: public content first, compact links
  second, no right-side metadata noise.

Frontend tech lead:

- The implementation stays product-specific: `QuestArchiveRail` and
  `codexQuestArchiveFilters`, not a generic facet framework.
- Specific major-faction filters are exact-data-only and do not parse keys,
  titles, prose, old branch/path data, or SVG filenames.
- Row links reuse existing Codex inline link/tooltip infrastructure.

4X player:

- It is easier to browse all quests, a broad Quest Category, or a proven major
  faction shelf.
- Rows now answer more of "what is this quest about and what does it touch?"
  without needing to open every detail page.
- `/quests` remains the right route for branch/lore/strategy progression.

### Final Closeout

Accepted final decisions:

- Codex Quests remains archive/permalink support for `/quests`.
- Quest Category and exact major-faction shelves are the safe browse model.
- Quest rows should be content-left with compact exact links; no right-side
  metadata until a stable player-facing metadata model is proven.
- Detail pages keep exact structured sections and relationships, but no Codex
  progression/path widget.

Remaining issues:

- Pixel-level browser review remains user-owned/blocked in this environment.
- A future compact "Open in Quest Explorer" affordance may be useful if a
  stable exact route mapping is available.
- Detail relationship grouping may be worth revisiting later if exact Related
  entries feel too broad.

Completion decision: complete with follow-up recommended.

Rationale:

- The category now has safe orientation, useful archive rows, compact exact
  links, and a clean boundary with `/quests`.
- Remaining ideas are enhancements rather than blockers.

## Quest Archive Grouping Investigation

Status: investigated and deferred pending exporter metadata.

Summary:

- Repeated Quest titles are common in the current Codex Quest export.
- Example: `A Bitter Truth` appears 18 times.
- These rows are not true duplicates. They differ in objectives, requirements,
  rewards, references, and choice content.
- Display name is not a canonical grouping key.
- The current Codex Quest export does not provide canonical archive grouping
  metadata such as stable questline, chapter, variant, record-role, or archive
  group identifiers.
- Frontend grouping would require title heuristics, title-plus-chapter
  heuristics, or key parsing.
- Restoring the previous grouping behavior would reintroduce key-derived
  progression reconstruction and overlap with the dedicated `/quests`
  experience.

Decision:

- Do not implement Quest archive grouping in frontend.
- Do not group by title.
- Do not group by title plus chapter.
- Do not restore key-derived progression logic.
- Leave Quest archive rows as exported records.
- Defer cleaner archive grouping until exporter metadata provides stable
  canonical grouping identifiers.

Exporter follow-up:

- `Quests - Canonical Archive Grouping Metadata` was appended to the active DB
  Exporter metadata backlog:
  `docs/active/db-exporter-ability-metadata-handoff.md`.

## QUESTS-UI-003 - Hide Quest Archive From Top-Level Codex Navigation

Implemented 2026-06-20.

Rationale:

- Top-level Codex Quest browsing is currently noisy because repeated Quest
  titles are common and safe grouping is not available yet.
- `/quests` already owns primary Quest browsing, lore, strategy, branching,
  progression, paths, and questline exploration.
- Codex Quest records still have value as searchable records, exact references,
  direct links, and permalink/detail targets.

What changed:

- Quests are hidden from top-level Codex category navigation and landing
  category cards.
- Quest records remain available from global Codex search.
- `/codex?category=quests` remains direct-routable and intentionally opens the
  Quest archive support view.
- Selected Quest detail routes remain direct-routable.
- `/quests` remains untouched and continues to own the rich Quest Explorer
  experience.

Decision:

- Keep Quest Codex data handling.
- Do not delete Quest records from the store/API.
- Do not implement title grouping, title-plus-chapter grouping, or key parsing.
- Canonical Quest archive grouping remains exporter-backed follow-up work.
