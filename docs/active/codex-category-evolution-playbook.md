# Codex Category Evolution Playbook

Status: Living document  
Purpose: Repeatable process for evolving Codex categories into premium player-facing experiences.

## How to Use This Playbook

- Read this before evolving any Codex category.
- Run the phases in order; do not jump straight to UI.
- Investigate data, browsing behavior, and relationships before implementing.
- Update this document after each category so the next pass starts smarter.
- Do not copy Ability UI blindly; each category earns its own shape.

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

To be filled after category audit. Append non-blocking exporter findings to `docs/active/db-exporter-ability-metadata-handoff.md`.

### Equipment

To be filled after category audit. Use the same exporter findings workflow.

Update this history after every category evolution. The playbook is product memory.
