# Codex Districts Evolution

Status: in progress  
Target category: Districts  
Internal kind: `districts`

## Purpose

This document is the durable working memory for evolving the Codex Districts category using `docs/active/codex-category-evolution-playbook.md`.

Districts are city tiles, exploitations, resource extractors, and special infrastructure. The goal is to make the category useful for player planning without inferring from keys, names, prose, or SVG filenames.

## Current State

- Districts currently use the generic Codex split layout.
- The top-level category is visible as `Districts`.
- The generic left pane lists entries directly.
- Main-panel overview/details use generic Codex rendering.
- Local 0.82 Codex export contains 167 District entries.

## Phase 0 - Planning

### Classification Hypothesis

Districts are likely an Archive:

- 167 rows are too many for a plain generic list.
- Exported `Category` facts provide a safe browse model.
- Many entries have concise exported `Effects` lines.
- Resource extractor Districts have exact resource references.
- Some entries are intentionally thin and need an honest fallback.

This is only a hypothesis until the audit is complete.

### Audit Plan

- Count entries, facts, sections, references, icons, sparse rows, and outliers.
- Determine whether players browse by district type, yield focus, tier, city role, terrain/adjacency value, fortification/military value, or progression chain.
- Review current row/detail presentation.
- Identify exact resource relationships and other references.
- Record exporter/data-quality findings in the active exporter backlog if non-blocking.

### Implementation Plan

No implementation is selected yet. The smallest justified slice will be chosen after audit and proposal review.

## Phase 1 - Audit Findings

### Data Audit

Local 0.82 Codex export:

- Entry count: 167.
- Fact labels:
  - `Kind`: 167
  - `Category`: 159
  - `Tier`: 138
- Sections:
  - `Effects`: 76
  - `Extracted resource`: 66

Exported `Category` buckets:

- Resource: 67
- City: 17
- Science: 9
- Money: 9
- Military: 9
- Trade: 6
- Population: 6
- Influence: 6
- Industry: 6
- Food: 6
- Bridge: 6
- Foundation: 5
- ArtificialWonder: 4
- Anomaly: 3
- Missing Category: 8

Exported `Tier` buckets:

- Tier 2: 52
- Tier 3: 51
- Tier 1: 30
- Tier 0: 4
- Tier 4: 1
- Missing Tier: 29

Representative entries:

- Rich: `Farm` has four Food effect lines.
- Rich: `Keep` has fortification and new-unit Experience effects.
- Rich: `Matriarch's Lair (City Hall)` has broad city yield/fortification effects.
- Resource: `[Luxury01] Klax Extractor` has an `Extracted resource` exact reference plus resource yield/capacity effects.
- Thin: `Temporary Bridge`, `Dam`, `Shanty`, `Grand Bridge`, and many advanced/grand upgrades have no public effects.

### Browse Audit

The strongest safe player browse model is exported `Category`.

Hypotheses checked:

- District type/yield focus: strongly supported by `Category`.
- Tier/progression: exported and useful, but secondary; a tier rail would be less player-focused as a first orientation layer.
- City role: partially represented by `City`, `Foundation`, `Population`, `Trade`, and `Bridge`, but not as a distinct safe taxonomy.
- Terrain/adjacency value: appears in effect text, not as a structured fact.
- Fortification/military value: supported by `Military` category and effect lines.
- Upgrade chain: visible through names/tier, but no explicit chain relationship is exported.

### Navigation Audit

Recommended first navigation:

- compact District Focus rail from exact exported `Category`
- `All`
- one option per major category bucket, with display cleanup only

Safe display cleanup:

- `Money` -> `Dust`
- `PublicOrder` is not present in District categories.
- `ArtificialWonder` -> `Wonder`

Navigation should not include:

- effect previews
- extracted resource links
- inferred yield filters beyond exported category
- faction/ownership
- terrain/adjacency filters
- upgrade-chain grouping

### Main Panel Audit

District archive rows should be content-first:

- left content: District name and exported effect lines, up to 5
- resource rows: show exact extracted resource reference compactly when present
- right metadata: quiet Category and Tier
- thin fallback: `No public district effects exported yet.`

Effects and extracted resource references are the useful planning content. `Kind: District` is redundant.

### Detail Audit

Selected District detail pages already provide:

- permalink/share target
- full generic facts/sections
- exact related entries

No detail redesign is justified in the first slice. Detail pages remain useful for complete inspection and exact references.

### Relationship Audit

Exact outbound resource references exist for 66 resource extractor Districts via `Extracted resource` items/reference keys.

Other exact relationships are available through generic related-entry resolution, especially from Tech/Quest contexts, but row-level relationship cards would distract from District effects in this pass.

### Exporter Audit

Non-blocking findings:

- 8 District entries lack exported `Category`.
- 29 District entries lack exported `Tier`.
- Many tier-upgrade and special District entries have no public `Effects`.
- No explicit upgrade-chain/progression relationship is exported.

No blocker found.

## Phase 2 - Proposal Review

### What Is This Category?

Districts are an Archive:

- large enough to need orientation
- comparable by safe exported `Category`
- row-sized effect content exists for many public entries
- detail pages still matter for exact resources, complete metadata, and permalink inspection

### How Does A 4X Player Browse It?

A player is likely asking:

- Which Districts improve Food, Industry, Dust, Science, Influence, Military, or Population?
- Which Districts are resource extractors?
- Which Districts are city foundations, bridges, or special wonders?
- What does this District do at a glance?

### Strongest Navigation Model

Use a District Focus rail from exported `Category`:

- All
- City
- Food
- Industry
- Dust
- Science
- Influence
- Military
- Resource
- Bridge
- Population
- Trade
- Foundation
- Wonder
- Anomaly

Filtering must use exact exported `Category` values. Display labels can be cleaned up for player readability.

### What Remains Visible?

Archive rows should show:

- District name
- exported effect lines, up to 5
- exact extracted resource reference when present
- quiet category/tier metadata

### What Moves To Detail?

Detail retains:

- complete facts/sections
- exact relationship lists
- full extracted resource section
- thin-entry provenance/context
- permalink/inspection value

### Smallest Meaningful Improvement

`DISTRICTS-UI-001`:

1. Add District Focus rail from exported `Category`.
2. Add content-first District archive rows using exported `Effects`.
3. Show exact extracted resource references compactly for extractor rows.
4. Keep detail pages unchanged.

### Challenge Review

UX designer:

- Objection: Category rail has many options.
- Response: 167 rows need orientation, and category labels are meaningful. Grouping small categories would hide planning concepts like `Anomaly` and `Wonder`.

Frontend tech lead:

- Objection: `CodexSummaryDetail` keeps accumulating category row branches.
- Response: Follow existing category-specific helper/rail pattern now. Avoid generic archive frameworks until repeated row logic becomes painful enough to extract deliberately.

4X player:

- Objection: Tier/progression is important for District planning.
- Response: Tier should be row metadata first. A Tier rail could be a later slice if product review shows category rail is insufficient.

Recommended slice: implement `DISTRICTS-UI-001`.

## Implementation Results

### DISTRICTS-UI-001 - District Focus Rail And Archive Rows

Implemented:

- Added District Archive mode for `districts`.
- Added compact `District Focus` rail.
- Rail options use exported `Category` facts only.
- Display labels:
  - `Money` -> `Dust`
  - `ArtificialWonder` -> `Wonder`
- Selecting/deselecting/clearing focus filters from a District detail route removes `entry` and returns to the archive list.
- District archive rows now show:
  - name
  - up to 5 exact exported Effect lines
  - exact `Extracted resource` links when the referenced Resource resolves
  - quiet right-side Category/Tier metadata
  - `No public district effects exported yet.` for thin entries

Preserved:

- selected District detail pages
- search behavior
- backend/import/exporter contracts
- exact-reference behavior
- other Codex category modes

## Product Review

Browser/product smoke:

- Successful escalated headless Chrome DOM smoke for `http://[::1]:5174/codex?category=districts`.
- Verified rendered District archive rows include `codex-summaryList__item--districtArchive`, the `District Focus` rail, effect/token lines, right-side metadata, and thin fallback text.
- The running app snapshot rendered 101 District entries, while the local 0.82 file audit contains 167 District entries. The UI is data-driven and handles either snapshot, but the discrepancy is recorded as a data-snapshot observation.
- A second bounded Chrome dump attempt hung and was stopped. This closeout does not claim full pixel-level or multi-route interactive browser QA.
- Interaction behavior is covered by focused tests.

Reviewer assessment:

- UX designer: District Focus rail provides needed orientation for a large category. Effect-first rows are much more useful than generic rows, and extracted resource links stay compact enough not to overpower the District itself.
- Frontend tech lead: Implementation follows the existing explicit category-mode pattern with a product-specific helper and rail. No generic archive framework was introduced.
- 4X player: Rows now answer "what does this District do?" quickly. Category and Tier metadata help planning without becoming the primary content.

No additional small high-value slice is required before closeout. A future Tier/progression pass may be useful only after exporter/product review.

## Refactor Review

- No stale/dead District-specific code found.
- The added helper and rail match existing category-specific boundaries.
- `CodexSummaryDetail` continues to carry several row-mode branches; this is existing architecture pressure, but extracting a generic row framework is still premature.

## Exporter Findings

Recorded in `docs/active/db-exporter-ability-metadata-handoff.md`:

- 8 local 0.82 District entries lack exported `Category`.
- 29 local 0.82 District entries lack exported `Tier`.
- Many District upgrade/special entries have no public `Effects`.
- No explicit District upgrade-chain/progression relationship is exported.

These findings are non-blocking for District Archive v1.

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

Deferred follow-ups:

- Tier/progression rail only if product review proves District Focus is not enough.
- Detail relationship grouping for exact tech/quest/resource relationships.
- Exporter-provided upgrade-chain/progression metadata.

Lessons:

- Districts are an Archive because the useful player question is "what does this tile/infrastructure do?" rather than "what raw record is this?"
- Exact extracted resource links can appear in archive rows as compact inline affordances.
- Tier is useful row metadata but not strong enough as first navigation.
- Thin District rows need honest fallbacks rather than inferred descriptions.
