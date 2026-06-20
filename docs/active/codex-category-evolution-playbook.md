# Codex Category Evolution Playbook

Status: Living document  
Purpose: Repeatable process for evolving Codex categories into premium player-facing experiences.

## How to Use This Playbook

- Read this before evolving any Codex category.
- Run the phases in order; do not jump straight to UI.
- Investigate data, browsing behavior, and relationships before implementing.
- Update this document after each category so the next pass starts smarter.
- Do not copy Ability UI blindly; each category earns its own shape.

## Assertive Uncommitted Workflow

Category evolution should move sequentially through safe, scoped slices. Do not stop after every small slice just to ask permission.

Default workflow:
- keep work uncommitted unless explicitly told to commit
- after each slice, validate the touched behavior
- run browser smoke review when visual/product behavior materially changed
- update the category evolution document
- continue to the next planned slice

Stop only for:
- failing validation that cannot be fixed within the slice
- unclear product decisions
- large architecture changes
- backend/exporter contract changes
- destructive changes
- explicit user review checkpoints

If something is visually imperfect but reversible, document it and continue unless it blocks the next slice. Manual review happens at the end or at explicit visual checkpoints.

## Core Principle

Do not redesign a category. Understand the category first.

Every Codex category must earn its UI through player behavior, not exporter structure.

Goals:
- fast player understanding
- premium presentation
- low cognitive load
- accurate metadata
- scalable maintenance

## Category Types

### Reference Sheet

Examples:
- Resources
- Councilor Effects
- Partner Effects

Use:
- full-width reference sheet
- minimal navigation
- compact rows where the overview itself is the product

### Archive

Examples:
- Abilities
- Statuses
- Equipment

Use:
- left browse/filter rail only when it helps player planning
- rich archive rows
- inspection/permalink detail pages

### Explorer

Examples:
- Quests
- Technologies
- Units

Use:
- custom progression-focused experience
- stronger mode-specific interaction
- avoid forcing these into generic Codex layouts

## Phase 1 - Data Audit

Audit:
- entry count
- facts and sections
- references and relationship direction
- icons
- sparse entries
- outliers and noisy metadata

Ask:
- What exists?
- What is useful?
- What is noisy?
- What is missing?
- Which problems belong to the exporter?

## Phase 2 - Browse Audit

Ask: how would a 4X player browse this category?

The answer becomes navigation. Do not use internal taxonomy unless it matches a player planning question.

## Phase 3 - Navigation Audit

Navigation should contain:
- browse categories
- filters
- discovery tools

Navigation should not contain:
- effect previews
- large metadata blocks
- row content duplicated from the main panel

Rule: icons generally belong in content, not navigation.

## Phase 4 - Main Panel Audit

Determine:
- What is content?
- What is metadata?
- Which fields help scanning?
- Which fields should move to detail?

Content should dominate. Metadata should classify and support content.

Do not treat duplicate display names as identity. Archive grouping should use
exported canonical identifiers whenever possible. If grouping requires title
heuristics or key parsing, defer grouping and request exporter metadata instead.

Before designing archive rows, classify row elements as:
- primary content
- supporting metadata
- compact relationships
- exporter/internal noise

Primary entity must dominate linked entities. Archive rows may surface exact linked
entities as compact inline affordances, but full relationship cards belong in
detail pages unless the linked entity is the primary content of that category.
Use exact references only, never infer linked entities, prefer existing
link/tooltip affordances when available, and avoid lifting whole related-entry or
preview-card sections into archive rows by default.

Do not render every exact relationship with equal prominence. Some exact
relationships are row content, some are compact metadata/chips, and some belong
only in detail.

Repeated generic icons that add no category-specific information should be
removed from archive rows. For stat-heavy categories, optimize rows for
comparison: prefer compact stat grids over long vertical stat lists, preserve
token/icon rendering, and avoid visual clutter.

## Phase 5 - Detail Audit

Ask: what additional value is gained by clicking?

Detail pages should become:
- inspection layer
- trust layer
- permalink layer
- relationship layer

They should not feel like raw database records.

## Phase 6 - Relationship Audit

Identify exact links to:
- abilities
- statuses
- units/heroes/equipment
- technologies/actions/treaties
- resources/traits/factions

Use exact references only. Never infer from names, keys, or prose.

## Phase 7 - Exporter Audit

Frontend rules:
- do not infer
- do not parse keys
- do not parse prose
- do not invent metadata

Create DB Exporter handoffs only when actual data proves a missing or noisy fact.

## Exporter Findings Workflow

During category audits, acknowledge and record exporter/data-quality issues.

Do not switch into DB Exporter implementation work during frontend category evolution unless the issue is a hard blocker.

If the issue does not block current frontend progress, append it to the active exporter backlog:

`docs/active/db-exporter-ability-metadata-handoff.md`

Despite the filename, treat that file as the active DB Exporter metadata backlog for now. Future cleanup may rename it.

Category audit summaries should include an `Exporter Findings Recorded` section, for example:
- Status type taxonomy appears noisy.
- Diplomatic Ambassy spelling issue.
- Some status relationships may be missing.

The goal is to accumulate related exporter issues across Abilities, Statuses, Equipment, Heroes, and other categories. Later, in a separate ChatGPT session and DB Exporter Codex project, process the backlog as one focused DB Exporter workstream.

Do not create new exporter handoff docs for every category unless the current backlog becomes unmanageable.

Frontend must continue to avoid inference from keys, names, prose, or SVG filenames while waiting for exporter fixes.

Final closeout must verify exporter findings handling:
- check whether exporter/data-quality findings were discovered during the category
- if non-blocking findings exist, confirm they were appended to the active exporter backlog
- if they were not appended, append them or explicitly report why not
- do not start DB Exporter implementation from frontend category work
- do not create new exporter handoff docs unless the active backlog is too large or structurally unsuitable

## Phase 8 - Premium Review

Visual designer:
- hierarchy
- readability
- premium feel

Frontend tech lead:
- architecture
- maintainability
- category-specific boundaries

4X gamer:
- discoverability
- planning value
- trust

## Final Category Closeout

Mandatory before calling any long-running category evolution complete.

Do not enter final closeout immediately after the first implementation slice,
especially when that slice is navigation, rail, or filter work. First re-review
the main archive rows, detail pages, relationship presentation, player-facing
category naming, and refactor/stale-code needs. If UX designer, frontend tech
lead, or 4X player review identifies a small high-value follow-up slice,
implement it before closeout. Traits and Diplomacy both showed that orientation
alone is not always enough.

At the end of the category pass, Codex must:

1. Run a full browser/product review.
2. Review the implementation against `AGENTS.md`.
3. Review the implementation against `docs/frontend/frontend-architecture-guidelines.md`.
4. Check project coding style and existing component patterns.
5. Refactor obvious overgrown or duplicated category code.
6. Remove stale or dead code introduced during the category pass.
7. Validate with tests, typecheck, build, and `git diff --check`.
8. Update the category evolution doc with final decisions, lessons, and follow-up work.
9. Update this playbook if the process changed.
10. Confirm exporter findings were checked and appended to the active exporter backlog when appropriate.
11. Document whether the assertive uncommitted workflow was followed or where it intentionally deviated.
12. Recommend commit/split strategy.

This phase is required even when the UI feels visually accepted. Category evolution is not complete until product quality, architecture quality, documentation, and commit strategy are all closed out.

## Category Completion Checklist

- Data audit
- Browse audit
- Navigation audit
- Main panel audit
- Detail audit
- Relationship audit
- Exporter audit
- Visual review
- Tech lead review
- 4X gamer review
- Post-first-slice row/detail/relationship/naming review completed
- Assertive workflow followed or deviations documented
- Exporter backlog checked or updated
- Final category closeout

## Future Categories

Run this playbook before:
- Statuses; append exporter findings to the active exporter backlog.
- Equipment; use the same exporter findings workflow.
- Heroes; use the same exporter findings workflow.
- Traits
- any future archive category

## Category Evolution History

### Abilities

Lessons:
- Effects are content.
- Metadata must support content, not dominate it.
- Detail pages are trust/permalink/inspection pages.
- Source metadata was not player-facing.
- Combat role looked useful, but exporter quality was noisy.
- Faction ownership must be exporter-provided.
- Exact references enable links and tooltips.

### Statuses

Lessons:
- Scope was the strongest first browse model.
- Tiny metadata buckets should be grouped only when it preserves orientation; `Other` worked for tiny Scope buckets.
- Mechanics/effect lines are Status content.
- Scope and Duration are orientation metadata and should not compete with mechanics.
- Thin entries can stay valuable when they are exact search/link targets and have an honest empty-mechanics state.
- Generic icons can be worse than no icon when they imply false specificity.
- Exact inbound references belong in detail first; row source hints should wait for product need.
- `Status type` looked tempting but was too noisy for primary navigation.
- Non-blocking exporter findings should remain in the active exporter backlog.

### Equipment

Lessons:
- Equipment is an Archive, not a Reference Sheet, because players browse by gear type and compare rows.
- `Type` is stronger than `Slot` as first navigation because `Slot` collapses most items into `Weapon`.
- `Rarity` works as secondary navigation and orientation metadata.
- Equipment effects are row content; Type/Rarity/Tier/Value are supporting metadata.
- Exact granted ability references are content for Equipment rows, not just relationship metadata.
- Archive rows may surface exact linked entities as compact inline affordances, but full relationship cards should stay in detail pages unless the linked entity is the primary content.
- Inline linked entities in archive rows should reuse existing Codex link/tooltip behavior before introducing new presentation systems.
- Unresolved granted ability references should remain honest missing data, not frontend-inferred cards.
- Inbound Quest/Trait relationships are better detail follow-ups than first-pass archive row content.
- Per-item Equipment icon identity needs explicit exporter metadata before frontend should show specific icons.
- The assertive workflow worked well when durable execution docs were updated after each phase.

### Traits

Lessons:

- Traits were already strong shallow-reference rows, but 122-178 entries were
  too many for an unfiltered reference sheet.
- A shallow-row category can still need a compact orientation rail. For Traits,
  exported broad Type values (`Faction`, `Protectorate`) were enough for a
  small rail without inventing a generic framework.
- Selected entry routes and search-active routes should stay split when the
  result list still helps direct navigation.
- Missing explicit ownership metadata should not be patched with key/name/prose
  inference.
- Browser automation may be unavailable; record the limitation honestly and use
  route/API smoke plus tests instead of claiming visual verification.

### Actions

Lessons:

- Sparse categories can still deserve Archive orientation. Actions had 128-139
  rows, but many lacked public mechanics, so rail-first was safer than rich row
  redesign.
- Broad exported category/type facts can be enough for first-pass navigation
  when deeper metadata is sparse.
- Do not promote sparse facts such as partial `Action type` or `UI category`
  into filters just because they exist.
- Removing the generic left result list changes old detail-browsing tests; keep
  detail coverage through direct routes and explicit route-reset behavior.
- Complete-with-follow-up is the right closeout state when orientation is fixed
  but richer row/detail presentation depends on exporter/product review.

### Diplomacy

Lessons:

- Small categories can still need orientation when entries span distinct
  strategic postures.
- Player-facing category naming can be a separate product decision from the
  first implementation slice. Diplomacy kept `diplomatictreaties` internally
  while changing the visible label from `Diplomatic Treaties`.
- Archive row previews should prefer player-facing public copy/effects before
  section target facts. Exact applied Status target facts such as `Other empire`
  can be useful in detail but weak as row preview content.
- Exact linked mechanics may be surfaced as compact archive-row signal lines
  when they improve planning value, but do not promote linked entities into full
  cards unless the linked entity is the primary row content.
- Do not close out a rail-only slice too early when the category has reliable
  small row metadata. Diplomatic Treaties needed Category/Bilateral/Duration
  metadata before the main archive felt intentional.
- Browser DOM smoke is useful after tests pass because it can reveal scan-value
  problems that are technically correct but visually/product-wise poor.

### Quests

Lessons:

- Categories with a dedicated rich route can remain direct-linkable/searchable
  in Codex without being top-level Codex browse destinations.
- If duplicate display names make top-level browsing misleading and grouping
  requires exporter metadata, hide the category from top-level navigation rather
  than inventing frontend heuristics.
- Direct routes and exact references can preserve permalink/search value while
  the dedicated route owns the primary browsing experience.

### Improvements

Lessons:

- Improvements are an Archive because players compare city/district
  infrastructure by planning focus and public effect lines.
- Exported `Category` was strong enough for first navigation when paired with
  player-facing display labels such as Dust and Approval.
- Rail-only would have been insufficient because most Improvements already have
  concise exported Effects that deserve row-level presentation.
- Thin Improvement entries should stay visible with an honest fallback rather
  than inferred descriptions.
- Broad inbound relationships from Tech, Populations, Traits, Councilor Effects,
  and Bonuses are detail/future-polish material, not first-pass row content.

### Districts

Lessons:

- Districts are an Archive because players compare city tiles, exploitations,
  resource extractors, and special infrastructure by planning focus and effects.
- Exported `Category` is strong first navigation; `Tier` is useful row metadata
  but not automatically a left-rail filter.
- Exact linked resources can appear as compact `Extracts:` row affordances when
  the reference resolves; full relationship presentation belongs in detail.
- Thin District rows should stay visible with an honest fallback rather than
  inferred descriptions.
- File-export audits and running-app browser snapshots may differ; record the
  data source used for counts instead of pretending they match.

### Heroes

Lessons:

- Heroes are an Archive for the current export: exact `Faction` and `Class`
  facts plus complete `Stats` sections support comparison, while no
  progression/recruitment structure exists yet.
- Faction can be a valid first-pass browse group, but major/minor faction
  grouping needs explicit exported metadata or exact relationship confidence.
- Stats are Hero primary row content and should use compact comparison grids
  rather than long vertical lists.
- Faction/Class are supporting metadata.
- Exact ability/class tags such as `Flying` and `Swarm` are compact
  metadata/relationship chips, not full `Grants:` row content.
- The generic Hero icon repeated on every archive row was visual noise and was
  removed. Per-Hero portraits/icons still require exporter-provided metadata.
- Unresolved ability references should remain hidden.
- Per-Hero portraits/icons and recruitment/progression browsing require
  exporter-provided metadata, not frontend inference.

Update this history after every category evolution. The playbook is product memory.
