# Codex Improvements Evolution

Status: in progress  
Target category: Improvements  
Internal kind: `improvements`

## Purpose

This document is the durable working memory for evolving the Codex Improvements category using `docs/active/codex-category-evolution-playbook.md`.

Improvements contain city/district infrastructure entries that players compare for planning. The goal is to make the category easier to browse and scan without inventing data or changing exporter/backend contracts.

## Current State

- Improvements currently use the generic Codex split layout.
- The top-level category is visible as `Improvements`.
- The generic left pane lists entries directly.
- Main-panel overview/details use generic Codex rendering.
- Local 0.82 Codex export contains 123 Improvement entries.

## Phase 0 - Planning

### Classification Hypothesis

Improvements are likely an Archive or Archive/Reference hybrid:

- The category is large enough to need orientation.
- Entries are comparable by exported `Category`.
- Rows often contain concise effect lines.
- Some entries are intentionally thin and should remain honest rather than inferred.

This is only a hypothesis until the audit is complete.

### Audit Plan

- Count entries, facts, sections, references, icons, sparse rows, and outliers.
- Determine whether players browse by yield, era, economy, military value, city role, construction progression, or exported category.
- Review current row/detail presentation.
- Identify exact relationships only.
- Record exporter/data-quality findings in the active exporter backlog if non-blocking.

### Implementation Plan

No implementation is selected yet. The smallest justified slice will be chosen after audit and proposal review.

## Phase 1 - Audit Findings

### Data Audit

Local 0.82 Codex export:

- Entry count: 123.
- Fact labels: every entry has `Kind` and `Category`.
- Sections: 100 entries have an `Effects` section; 23 entries have no public effects/description.
- Effect line counts:
  - 1 line: 34
  - 2 lines: 42
  - 3 lines: 10
  - 4 lines: 9
  - 5 lines: 5
  - 0 lines: 23

Exported `Category` buckets:

- Military: 19
- Science: 18
- Money: 15
- City: 12
- Industry: 12
- Food: 10
- Resource: 10
- Influence: 9
- Bridge: 8
- PublicOrder: 6
- Population: 2
- Trade: 2

Representative entries:

- Rich: `Flood Plain` has 5 Bridge/yield effect lines.
- Rich: `Thermal Baths` has 5 PublicOrder/Approval effect lines.
- Normal: `Fish Farms` has 2 Bridge/River effect lines.
- Thin: `Pile House`, `Dust Blasting`, `Builders' Quarters`, and `Military School` have no exported public effects.

### Browse Audit

The most reliable player browse model is exported `Category`.

Hypotheses checked:

- Yield type: partially supported by `Food`, `Industry`, `Money`, `Science`, `Influence`, and `PublicOrder`.
- Economic specialization: partially supported, but not as a distinct exported fact.
- Military value: supported by `Military`.
- City role: supported by `City`, `Bridge`, `Population`, and `Trade`, but not enough for a separate safe taxonomy.
- Era/construction progression: not exported as Improvement facts.

### Navigation Audit

Recommended first navigation:

- compact Improvement Focus rail from exact exported `Category`
- `All`
- one option per category bucket

Player-facing label cleanup is acceptable for display only:

- `Money` -> `Dust`
- `PublicOrder` -> `Approval`

Filtering must still use exact exported `Category` values.

Navigation should not include:

- effect previews
- relationship cards
- inferred yield filters beyond exported category
- ownership/faction/era filters

### Main Panel Audit

The main panel should become a content-first Improvement Archive:

- left content: Improvement name and up to 5 exported effect lines
- right metadata: quiet category/focus label
- thin fallback: `No public improvement effects exported yet.`

Effects are the useful planning content. `Kind: Improvement` is redundant and should not dominate rows.

### Detail Audit

Selected Improvement detail pages already provide:

- permalink/share target
- full generic facts/sections
- exact related entries

No detail redesign is justified in the first slice. Detail pages remain useful for complete inspection and exact references.

### Relationship Audit

Exact inbound references exist:

- Tech: 234
- Bonuses: 58
- Populations: 57
- Traits: 26
- Councilor Effects: 13

These relationships are useful, but too broad for first-pass archive rows. They belong in detail or a later relationship polish pass.

### Exporter Audit

Non-blocking findings:

- 23 entries have no public Improvement effects. Existing DB Exporter docs already indicate some thin District/Improvement rows are intentional when public data is unavailable.
- No explicit era/progression/build-cost metadata is available in Improvement Codex facts.

No blocker found.

## Phase 2 - Proposal Review

### What Is This Category?

Improvements are an Archive:

- large enough to need orientation
- comparable by exported focus/category
- useful effects are usually available in row-sized form
- detail pages still matter for exact links and complete inspection

### How Does A 4X Player Browse It?

A player is most likely asking:

- Which Improvements improve my economy/yields?
- Which Improvements support military defense?
- Which Improvements support city/bridge/resource planning?
- Which Improvements have public effects worth comparing?

Exported `Category` is the safest first navigation model because it aligns with these questions without inference.

### Strongest Navigation Model

Use an Improvement Focus rail:

- All
- City
- Food
- Industry
- Dust
- Science
- Influence
- Approval
- Military
- Resource
- Bridge
- Population
- Trade

The rail uses exported `Category` facts only. `Dust` and `Approval` are display labels for exported `Money` and `PublicOrder`.

### What Remains Visible?

Archive rows should show:

- Improvement name
- exported effect lines, up to 5
- quiet category/focus metadata

### What Moves To Detail?

Detail retains:

- complete facts/sections
- exact relationship lists
- thin-entry provenance/context
- permalink/inspection value

### Smallest Meaningful Improvement

`IMPROVEMENTS-UI-001`:

1. Add Improvement Focus rail from exported `Category`.
2. Add content-first archive rows using exported `Effects`.
3. Keep detail pages unchanged.

### Challenge Review

UX designer:

- Objection: 12 rail options could feel busy.
- Response: 123 entries are too many for unfiltered scanning, and options are compact. Grouping small categories into `Other` would hide useful planning labels like `Population` and `Trade`.

Frontend tech lead:

- Objection: `CodexSummaryDetail` is already carrying many category row modes.
- Response: Follow the existing product-specific pattern now; review extraction during closeout if Improvement helpers become bulky. Do not introduce a generic archive row framework.

4X player:

- Objection: Category alone may not answer era/progression questions.
- Response: Era/progression is not exported. Category + effect rows improves planning without false precision.

Recommended slice: implement `IMPROVEMENTS-UI-001`.

## Implementation Results

### IMPROVEMENTS-UI-001 - Improvement Focus Rail And Archive Rows

Implemented:

- Added Improvement Archive mode for `improvements`.
- Added compact `Improvement Focus` rail.
- Rail options use exported `Category` facts only.
- Display labels:
  - `Money` -> `Dust`
  - `PublicOrder` -> `Approval`
- Selecting/deselecting/clearing focus filters from an Improvement detail route removes `entry` and returns to the archive list.
- Improvement archive rows now show:
  - name
  - up to 5 exact exported Effect lines
  - quiet right-side focus metadata
  - `No public improvement effects exported yet.` for thin entries

Preserved:

- selected Improvement detail pages
- search behavior
- backend/import/exporter contracts
- exact-reference behavior
- other Codex category modes

## Product Review

Browser/product smoke:

- Successful headless Chrome DOM smoke for `http://[::1]:5173/codex?category=improvements`.
- Verified rendered Improvement archive rows include `codex-summaryList__item--improvementArchive`, effect/token lines, right-side metadata, and thin fallback text.
- Multi-route scripted Chrome smoke hung after the successful overview DOM check, so this is not claimed as full pixel-level or interactive browser QA.
- Interaction behavior is covered by focused tests.

Reviewer assessment:

- UX designer: Improvement Focus rail provides needed orientation for 123 rows. Content-first rows make yield/effect scanning much stronger than generic rows.
- Frontend tech lead: Implementation follows existing category-specific helper/rail pattern. No generic framework was introduced.
- 4X player: Rows now answer "what does this Improvement do?" quickly. Category labels are useful enough for first-pass planning.

No additional small high-value slice is required before closeout.

## Refactor Review

- No stale/dead Improvement-specific code found.
- `CodexSummaryDetail` has many category branches, but this is existing architecture. A generic archive-row framework is not justified yet.
- New helper/rail names are product-specific and testable.

## Exporter Findings

Recorded in `docs/active/db-exporter-ability-metadata-handoff.md`:

- Improvement planning metadata such as era/progression/build cost is not exported.
- 23 Improvement entries have no public Effects/description; this is non-blocking and may be intentional.

## Final Closeout

Completion decision: Complete with follow-up recommended.

Completed:

- Data audit
- Browse audit
- Navigation audit
- Main panel audit
- Detail audit
- Relationship audit
- Exporter audit
- Product review
- Tech-lead/stale-code review
- Exporter backlog update
- Playbook history update

Accepted decisions:

- Improvements are an Archive.
- First navigation is exported `Category`, shown as `Improvement Focus`.
- `Money` displays as `Dust`; `PublicOrder` displays as `Approval`.
- Archive rows are content-first and use exported Effects.
- Thin entries remain visible with honest fallback text.
- Detail pages stay generic for now.
- Exact inbound relationship grouping is deferred.

Follow-up ideas:

- Consider grouped relationship sections in Improvement details if product review asks for unlock/source inspection.
- Consider per-Improvement icon strategy only if explicit exporter metadata appears.
- Consider era/build-cost/progression display only after exporter emits source-proven facts.
