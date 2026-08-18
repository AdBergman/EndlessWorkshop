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

## 2026-08-17 District UX Implementation Update

Implemented after product review, superseded by the 2026-08-18 archive IA
pass below:

- District Archive filters were grouped as `Tier` and `Focus`.
- `Tier 1` was temporarily the default District archive view.
- There is no District `All` filter chip.
- Tier counts and result rows collapse duplicate public variants by display name,
  Tier, Category, and public Effects, while preserving direct-linked variants.
- Tierless legacy/thin Codex rows temporarily fell into the default Tier 1 view
  so they did not disappear when no `All` bucket existed. This was removed in
  the player-intent IA pass; tierless rows are now visible by default but do not
  count as Tier 1.
- District archive rows now include a compact yield summary before Category/Tier
  metadata when public Effect lines expose yields. This was later replaced with
  additive Type/Yield/Faction/Progression metadata.
- Rich District import/API/store data now carries the richer district profile
  fields needed by detail pages:
  - tier;
  - constructible level;
  - construction cost;
  - descriptor/reference keys;
  - faction-specific/variant/player-facing flags;
  - richer level-up neighbour/faction-trait metadata.

## 2026-08-18 District Audit Remediation Update

Implemented after the comprehensive Codex category audit:

- Rich District and Improvement placement data now preserves terrain, river,
  point-of-interest/resource-deposit, and neighbour constraints through import,
  domain, persistence, API, frontend stores, and Codex detail Planning
  enrichment.
- Rich District import now accepts the current exporter object-shaped
  `constructionCost` value and turns it into stable player-facing cost lines,
  for example `Production` and `10 Resource02`.
- Internal production RPN keys remain importer/reference metadata, not visible
  cost copy.

Verification:

- Targeted District facade import tests cover current exporter construction
  cost shape plus terrain/river/POI placement.
- Browser QA on a fresh local startup import confirmed Divined Monument renders
  cost and placement Planning lines.

Verification:

- Focused Codex/District frontend tests passed.
- Frontend TypeScript passed.
- Frontend production build passed.
- Backend District mapper/import/repository/API/facade tests passed with JDK 26.

Exporter/data conclusion:

- `Works` Ridge/Mountain adjacency is missing from the current 0.82 rich
  District and Codex District JSON as player-readable/structured metadata.
- Current 0.82 exports only expose opaque `Effect_Synergy_Industry_A/B`
  descriptor keys for that bonus.
- Older static EWShop data did contain `+1 Industry for each adjacent Ridge`,
  so this is an exporter/source JSON gap rather than an EWShop frontend
  translation loss.

## 2026-08-18 Hardcore 4X Reference Review And UX Pass

Reviewer posture: production Districts as a strategic reference, assuming the
current import pipeline is substantially correct.

### Why Districts Still Failed

- Archive browsing improved after the Tier/Focus pass, but District detail still
  read as a generic Codex record with a small `Planning` appendix. A player
  comparing build decisions needs the inverse hierarchy: what it does, what it
  extracts, how it unlocks, how it upgrades, where it can be placed, and whether
  the record is faction-specific or thin.
- Filtering remained useful but incomplete as a planning tool. Tier + Focus
  helps with comparison, but the detail route did not reinforce those same
  distinctions, so moving from list to detail felt like losing context.
- Faction-specific and special/tierless records were present but too quiet.
  These are not necessarily bad data; they need to be labeled so players do not
  compare a faction-locked or legacy/special row against a universal district as
  if they were the same thing.
- Upgrade and adjacency facts were technically available for many rich District
  rows, but the UI only exposed a forward upgrade link. Players also need
  incoming upgrade context when landing on Advanced/Grand rows.
- Resource extractor identity was compact in archive rows but generic in detail.
  Extracted resources should appear as a planning relationship, not just a raw
  section.
- Placement is now structurally available through the District API/frontend
  contract, including terrain, river, point-of-interest/resource-deposit,
  wasteland, mud, and neighbour-tile constraints. The remaining UX problem is no
  longer "data missing"; it is choosing what to surface in list rows versus
  detail without making every row noisy.
- Thin records still need honest treatment, but the archive should not routinely
  render empty-effect fallback copy as if it were strategic content.

### Implemented Frontend UX

- Added a District-specific detail reference model and section.
- District details now prioritize:
  - strategic profile: Focus, Tier, constructible level, faction/variant marker,
    and construction cost when available;
  - strategic effect lines, including public `descriptionLines` fallback for
    level-up rows without an `Effects` section;
  - exact extracted resource links;
  - exact technology unlock links;
  - incoming and outgoing upgrade links, with adjacent-district count notes;
  - structured placement lines for adjacency, terrain, river,
    point-of-interest/resource-deposit, wasteland, and mud conditions;
  - player-facing record notes for thin/tierless/faction-trait-gated cases.
- District detail no longer duplicates the generic structured renderer when the
  District reference section is available.
- Planning links shown in the District reference section are hidden from the
  generic `Related entries` list so the detail page does not repeat the same
  relationship in two places.
- Improvement details continue to use the existing constructible planning
  section; this pass is District-specific.
- District archive rows now show compact planning previews from rich District
  data: construction cost, adjacent-district upgrade requirements, and
  high-signal placement conditions such as resource-deposit requirements.
- District archive filtering briefly had a `Placement` rail backed by
  structured rich District fields. This was superseded by the family archive
  pass below; placement now appears as row/detail planning information.
- Player-facing record notes were cleaned up so the District detail does not
  expose implementation/data-pipeline language such as missing planning profile
  or archive fallback mechanics.
- District archive filtering was redesigned around player intent, then
  superseded by the family archive pass below:
  - `Type` is now primary, derived only from explicit District `Category`
    metadata. Current safe groups are Core yield, City base, Infrastructure,
    Resource extractor, Wonder / anomaly, and Unclassified.
  - `Yield / role` keeps the exact Category values such as Food, Industry,
    Dust, Science, Military, Resource, Bridge, and City.
  - `Placement` remains backed by structured rich District placement fields.
  - `Faction` is backed by rich District `factionKey` when present, with
    Universal/Faction-specific fallbacks from `isFactionSpecific`.
- `Progression` briefly contained Tier chips and was no longer the default
  worldview. This was removed from the archive filter UI in the family pass.
- Tier filters now use explicit exported `Tier` facts only; tierless rows remain
  visible in the default archive and are not inferred from keys or counted as
  Tier 1.
- Zero-count District filter options were removed.
- District archive row metadata no longer emits redundant derived `Yields: ...`
  summaries when the effect lines already show the yields. That space now shows
  additive Type, Yield/Role, Faction, and Progression metadata.
- District archive planning previews now resolve upgrade targets/sources or
  family progression when the exact public District rows are available, with
  adjacent-district counts as fallback context.
- The District rich import/API/frontend contract now preserves `factionKey`.
  The 0.82 rich export contains exact faction keys for faction-specific
  Districts: Necrophage, LastLord, Mukag, and MangroveOfHarmony.

## 2026-08-18 District Family Archive Pass

Browser QA showed the Type/Yield/Placement/Faction/Progression rails still felt
database-oriented. The archive now treats Districts as player-facing families:
Farm, Works, Laboratory, Bridge, Extractor, Holy Oculum, etc. Exported
Tier/progression records are not archive rows.

Implemented:

- The production District archive now folds exported `districts` plus hidden
  `extractors` records into player-facing District families. In the local 0.82
  data this browser-tests at 38 family rows before search/filter narrowing.
- Family identity uses bounded presentation mapping:
  - display prefixes such as `Advanced`, `Grand`, `Great`, `Sacred`, and
    `Divine` are stripped only for family presentation;
  - family keys include exact `factionKey` to prevent genuinely faction-owned
    concepts from merging into universal rows;
  - same-faction category splits collapse into one player-facing family, so
    records such as City/Wonder Divined Monument and City/Resource Soul
    Repository no longer create duplicate archive rows;
  - cross-faction duplicate display names are disambiguated in archive labels,
    for example `Farm (Necrophages)`;
  - resource Districts with explicit `Resource` category and Extractor display
    names collapse into a generic `Extractor` family.
- The archive filter UI is now a single secondary `Family` rail:
  - Core;
  - Infrastructure;
  - Kin, Lords, Tahuk, Aspects, Necrophages in game/EWShop faction order when
    present;
  - Other.
- Removed archive Tier/Progression chips and the Type/Yield/Placement/Faction
  facet overload.
- Archive rows use the family display name and show useful family-level effects,
  costs, progression summaries, extracted resource links, and placement
  highlights when available.
- Generic Extractor rows summarize the extractor concept instead of surfacing
  arbitrary resource-specific records first.
- Raw resource-code and placement-code labels such as `Resource27` and
  `Resource Deposit Luxury 14` are normalized for District archive/detail
  display.
- Thin/special rows with no effects or cost can still surface useful placement
  constraints instead of looking empty.
- The archive no longer emits `No public district effects exported yet.` as a
  routine row fallback.
- District detail now includes a `Progression` link group so tier records live
  inside the family reference instead of the archive list.

Preserved:

- structured placement rendering;
- construction costs;
- exact upgrade relationships;
- exact `factionKey` handling;
- the District detail/reference section;
- the `if on` provenance finding and no rewrite of those phrases.

### Still Blocked Or Deferred

- Structured terrain/adjacency yield filters remain blocked. Existing public
  effect text exposes some synergies, but current EWShop should not create
  filterable Ridge/Mountain/etc. adjacency categories from descriptor keys or
  prose.
- Archive-level upgrade-chain grouping and side-by-side comparison remain
  deferred. Detail-level incoming/outgoing upgrade links, archive planning
  previews, and placement filters provide the unblocked slice without
  reorganizing the whole archive.
- Exact semantics for District text such as `-3 Food if on Works Districts` and
  Bridge `+3 Food if on Farms Districts` remain unresolved. Provenance check:
  those phrases arrive unchanged from rich District `descriptionLines` into
  Codex `Effects`, paired with descriptor keys such as `Effect_Synergy_Food_D`,
  `Effect_Synergy_Bridge_A`, and
  `Effect_SynergyDefinition_District_DivinePopMonument_Food`. Current exported
  District records do not expose a structured adjacency/target relation for
  these synergy lines. EWShop should not rewrite `if on` to adjacency until the
  exporter/source data provides explicit semantics.

### Verification

- Focused frontend tests passed:
  - `src/lib/codex/codexDistrictArchiveFilters.test.ts`
  - `src/lib/codex/codexDistrictReference.test.ts`
  - `src/lib/codex/codexConstructibleRichEnrichment.test.ts`
  - `src/pages/CodexPage.referenceDomainArchives.test.tsx`
  - `src/pages/CodexPage.richPlanningEnrichment.test.tsx`
  - `src/stores/districtStore.test.ts`
- Focused backend/API contract tests passed:
  - `DistrictImportAdminFacadeImplTest`
  - facade/infrastructure `DistrictMapperTest`
  - `DistrictControllerTest`
- Frontend TypeScript passed.
