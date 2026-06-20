# Codex Diplomacy Evolution

Status: follow-up in progress  
Category: Diplomatic Treaties  
Started: 2026-06-20  
Process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

Diplomatic Treaties are a top-level Codex category. This document is the durable
working memory for evolving the category into a player-facing diplomacy
reference without relying on chat history.

This category must earn its shape from treaty data and diplomacy browsing needs;
do not copy Abilities, Statuses, Equipment, Traits, or Actions blindly.

## Phase 0 - Plan

### Category Classification Hypothesis

Initial hypothesis: Diplomatic Treaties are a small Archive/Reference hybrid.

Reasons to verify:

- The category has only 22 entries, so it does not need heavy filtering.
- Treaty rows contain useful public descriptions, category facts, bilateral
  state, duration, and sometimes applied Status summaries.
- Players likely browse by diplomatic outcome/posture rather than by raw list
  order.

Alternative outcomes:

- Reference Sheet if the overview itself is enough.
- Generic split layout if exported data is too sparse for a safe player-facing
  navigation model.

### Audit Plan

Audit Diplomatic Treaties for:

- entry count;
- exported facts and section titles;
- exact status/public-context relationships;
- icon availability;
- sparse entries and outliers;
- treaty category usefulness;
- whether the player-facing category label should remain `Diplomatic Treaties`
  or become `Diplomacy`.

Classify each finding as frontend action, exporter backlog, or intentionally
deferred.

### Implementation Plan

Do not implement until audit and proposal review are documented.

If justified, choose the smallest slice that:

- uses exported facts and exact references only;
- preserves route/query behavior;
- avoids backend/import/exporter contract changes;
- keeps treaty-specific code product-named;
- avoids generic frameworks.

## Phase 1 - Audit

Source: local Codex export
`local-imports/codex/ewshop_diplomatic_treaties_codex_export_0.82.json`.

### Data Audit

- Entry count: 22.
- Descriptions: 20 entries have public description lines.
- Icons: no explicit per-treaty icon metadata; current category icon is generic
  diplomacy.
- Facts:
  - `Kind`: 22 (`Diplomatic Treaty`).
  - `Category`: 22.
  - `Bilateral`: 22 (`Yes`: 13, `No`: 9).
  - `Duration`: 13 (`30 turns`: 11, `5 turns`: 2).
- Exported Category values:
  - `War`: 6.
  - `Beneficial Defense`: 5.
  - `Beneficial Discovery`: 4.
  - `Beneficial Society`: 2.
  - `Hostile Defense`: 2.
  - `Repeatable Declaration`: 2.
  - `Beneficial Economy`: 1.
- Sections:
  - `Effects`: 8 entries.
  - `Applied statuses`: 6 entries.
  - 11 entries have no structured sections.
- Exact reference keys/public context keys:
  - 29 total public/reference keys.
  - 7 status keys across applied status treaties.
  - 22 treaty/declaration self keys.

Representative entries:

- `Close Borders`: hostile declaration with applied public-opinion Status.
- `Open Borders`: bilateral defense treaty with public description/effect.
- `Unjustified War`: war declaration with two applied Statuses.
- `Shared Research`: discovery treaty with science/technology effect text.
- `Surrender Demand`: sparse War treaty with no public static tribute amount.
- `Compliment` and `Warning`: repeatable declarations with 5-turn duration.

Finding classification:

- Frontend action: exported `Category` is reliable enough for a compact treaty
  category rail.
- Frontend action: existing applied Status summaries are valuable detail
  content and should be preserved.
- Frontend action: rows can remain current generic/reference rows for the first
  slice because most entries already have public description lines.
- Exporter backlog: no explicit relationship direction beyond applied Status
  sections.
- Exporter backlog: surrender/tribute values remain runtime-only and should not
  be invented by the frontend.
- Intentionally deferred: per-treaty icons; no explicit icon metadata exists.

### Browse Audit

Supported 4X browse questions:

- Is this a War/declaration or a beneficial treaty?
- Which diplomacy area does it affect: defense, discovery, society, economy?
- Is this bilateral or one-sided?
- How long does it last when duration is exported?
- Which public Status is applied when the treaty/declaration has exact Status
  data?

Player-facing category naming:

- `Diplomatic Treaties` is accurate but narrow; the category includes
  declarations, warnings, surrender/war states, and treaties.
- `Diplomacy` is the stronger player-facing shelf label. The backend/exporter
  category remains `diplomatictreaties`; only presentation should change.

### Navigation Audit

Recommended first navigation:

- `Treaty Category`
  - `All`
  - `War`
  - `Defense`
  - `Discovery`
  - `Society`
  - `Declarations`
  - `Economy`

Source:

- exact exported `Category` facts only.
- Display labels can safely simplify:
  - `Beneficial Defense` + `Hostile Defense` -> `Defense`
  - `Repeatable Declaration` -> `Declarations`
  - other values remove the `Beneficial` prefix.

Do not use as first navigation:

- `Bilateral`: useful metadata, but weaker as a primary browse model.
- `Duration`: sparse and not a strategy taxonomy.
- Applied Status presence: content/detail value, not first browse navigation.
- Relationship outcome inferred from prose: unsafe.

### Main Panel Audit

Current rows already show treaty names, secondary context, and public
description/effect previews through the shared summary renderer.

First-slice recommendation:

- preserve current row presentation;
- add orientation through the left rail first;
- do not create rich treaty rows until after product review.

### Detail Audit

Current treaty details provide:

- title/permalink;
- generic facts;
- public description/effects;
- compact Applied Status summaries when exact status refs resolve.

Detail value is useful for inspection and exact linked Status trust. Keep detail
behavior unchanged in the first slice.

### Relationship Audit

Exact relationships currently visible:

- Diplomatic Treaty -> Status through `Applied statuses` sections and
  `referenceKeys`/`publicContextKeys`.

No exact inbound relationship groups are needed for this slice. Do not infer
relationships from treaty names or prose.

### Exporter Audit

Non-blocking exporter findings:

- Surrender/tribute values for surrender treaties are runtime-only and absent
  from static public export.
- Relationship direction is only explicit for applied Status summaries, not for
  broader diplomatic outcomes.
- No explicit treaty icon metadata exists.

None block the first frontend slice.

## Phase 2 - Proposal Review

### Proposal Answers

1. What is this category?
   - A small Diplomacy Archive/Reference hybrid focused on treaty/declaration
     outcomes.
2. How does a 4X player browse it?
   - By diplomatic posture/outcome first: War, Defense, Discovery, Society,
     Declarations, Economy.
3. What is the strongest navigation model?
   - A compact `Treaty Category` rail derived from exported `Category` facts.
4. What should remain visible?
   - Treaty names, descriptions/effects, duration/bilateral facts, and exact
     applied Status summaries.
5. What should move to detail?
   - Full applied status mechanics, complete public description, generic facts,
     and sparse inspection/provenance.
6. What is the smallest meaningful improvement?
   - Replace the generic left result list with a Treaty Category rail while
     preserving current row/detail behavior.

### Proposal Challenge

UX designer:

- Benefit: a category rail makes 22 entries feel intentionally organized.
- Concern: `Diplomatic Treaties` as a top-level label undersells declarations
  and war states. Rename should be reviewed separately.

Frontend tech lead:

- Benefit: follows existing Action/Trait rail pattern with a small helper and
  component.
- Concern: another branch in `CodexLeftPane`; acceptable while modes remain
  product-specific.

4X player:

- Benefit: War/Defense/Discovery are understandable browsing shelves.
- Concern: bilateral state and duration may eventually deserve row metadata,
  but they are not worth blocking the first slice.

### Selected Implementation Slice

`DIPLOMACY-UI-001 - Treaty Category Rail`.

Scope:

- Diplomatic Treaties only.
- Use exported `Category` facts.
- Add compact rail options and filter behavior.
- Preserve current rows and detail pages.

## Accepted Decisions

- Diplomatic Treaties are a small Archive/Reference hybrid.
- First navigation should use exported treaty `Category` facts.
- Use `Diplomacy` as the player-facing category label.
- Preserve backend/exporter/internal `diplomatictreaties` identifiers.
- Do not infer treaty outcomes beyond exported facts/sections.
- Preserve Applied Status summaries in detail pages.
- Treaty archive rows should keep public description/effect preview content on
  the left and quiet orientation metadata on the right.
- Category, Bilateral/One-sided state, and Duration are useful treaty row
  metadata when exported.

## Open Questions

- Should exact applied Status summaries appear in archive rows, or remain detail
  content?

## Ticket Roadmap

### DIPLOMACY-UI-001 - Treaty Category Rail

Status: complete.

Goal: replace the generic left result list with compact diplomacy category
navigation using exported `Category` facts only.

Result:

- Added Diplomacy Archive mode for `diplomatictreaties`.
- Added compact `Treaty Category` rail options:
  - `All`
  - `War`
  - `Defense`
  - `Discovery`
  - `Society`
  - `Declarations`
  - `Economy`
- Filtering uses exact exported `Category` facts only.
- `Defense` groups exact `Beneficial Defense` and `Hostile Defense` values.
- Search combines with rail counts and filtered overview.
- Selecting/clearing a category while on a treaty detail route removes `entry`
  and returns to the archive list.
- Current treaty detail pages remain unchanged.

### DIPLOMACY-UI-001A - Treaty Preview Trust Cleanup

Status: complete.

Goal: remove weak archive preview leakage discovered during browser smoke.

Result:

- Treaty archive rows now prefer public description text first.
- If no description exists, rows prefer `Effects`.
- If neither exists, rows may show the applied Status label.
- Applied Status target facts such as `Other empire` no longer override useful
  public treaty descriptions in archive rows.

### DIPLOMACY-UI-002 - Treaty Row Metadata Polish

Status: complete.

Goal: add quiet right-side treaty row metadata so the main archive no longer
feels like generic Codex rows.

Reason reopened:

- DIPLOMACY-UI-001 was a good orientation slice, but it was not enough to call
  the category complete.
- Diplomatic Treaties have useful public descriptions and exported metadata.
- Deferring row metadata made the main archive still feel too much like generic
  Codex rows.

Result:

- Keep the Treaty Category rail.
- Preserve public description/effect previews.
- Added quiet right-side row metadata:
  - simplified Category label;
  - Bilateral/One-sided participation;
  - Duration where exported.
- Metadata uses exported facts only.
- Category labels use the same safe simplification as the Treaty Category rail.
- Applied Status cards/links remain out of archive rows for now.
- Keep detail pages unchanged.

### DIPLOMACY-UI-003 - Naming Review

Status: complete.

Goal: decide whether the player-facing top-level category should become
`Diplomacy`.

Result:

- Renamed the visible category presentation from `Diplomatic Treaties` to
  `Diplomacy`.
- Preserved backend/exporter/internal identifiers and route kind:
  `diplomatictreaties`.

### DIPLOMACY-UI-004 - Compact Impact Signals

Status: complete.

Goal: make treaty archive rows communicate exact diplomatic impact when public
effect/status mechanics are already exported.

Result:

- Treaty rows keep the public description/effect preview as the primary content.
- Rows render bracket-token icons in public treaty preview text, so exported
  Science/Public Opinion/etc. signals remain visible.
- Rows can show up to two compact exact signal lines below the public preview.
- Applied Status mechanics, such as `-25 Public Opinion`, surface only when the
  treaty has an exact applied-status reference that resolves to exported status
  mechanics.
- Full applied Status cards remain detail-only.
- No inference from treaty names, keys, prose, or SVG filenames was added.

## Exporter Findings Recorded

Appended to active exporter backlog:

- Non-blocking: surrender/tribute values for `Treaty_AskToSurrender` and
  `Treaty_ProposeSurrender` remain runtime-only or otherwise unavailable in
  static public treaty export.
- Non-blocking: treaty/declaration relationship direction is only explicit for
  applied Status summaries; broader diplomatic outcomes should not be inferred
  by EWShop.
- Non-blocking: per-treaty icon metadata is absent.

Backlog reference: `docs/active/db-exporter-ability-metadata-handoff.md`.

None blocked Diplomacy UI work.

## Final Category Closeout

Completion decision: complete with follow-up recommended.

### Product Review

UX designer:

- Rating: 8/10.
- The category now feels intentionally browsable rather than a small undivided
  list.
- The rail is compact and does not overstate the available data.
- Right-side Category/Bilateral/Duration metadata gives the rows enough
  diplomatic shape without competing with public description content.
- Compact impact signals make rows more useful for planning without turning
  them into detail pages.
- The visible `Diplomacy` label now matches the broader category content:
  treaties, declarations, warnings, surrender states, and war states.

Frontend tech lead:

- Rating: 8/10.
- The implementation follows the existing Action/Trait rail pattern with
  product-specific helper/component names.
- No generic framework was introduced.
- `CodexLeftPane` gained another mode branch, but this is consistent with the
  current architecture and still reviewable.
- Treaty row metadata is isolated to the summary renderer and reuses exact
  exported fact helpers rather than adding category inference.

4X player:

- Rating: 8/10.
- War/Defense/Discovery/Society/Declarations/Economy are useful shelves.
- Detail pages remain trustworthy for exact applied Status summaries.
- Bilateral/One-sided state and Duration now answer treaty-planning questions
  directly in the archive row.
- Exact status mechanics such as Public Opinion changes can now be scanned
  without opening each treaty detail.
- Remaining player ask: review whether exact applied Status links belong in
  rows later.

### Architecture / Style Review

- Reviewed against `AGENTS.md` and
  `docs/frontend/frontend-architecture-guidelines.md`.
- Changes are bounded to Codex frontend/docs.
- Route/query behavior is preserved.
- No backend/import/exporter contracts changed.
- No inference from names, keys, prose, or SVG filenames was added.
- No stale/dead code from the slice was found.
- DIPLOMACY-UI-002 did not require a broader refactor.

### Validation

Passed:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

Browser/route smoke:

- Vite route smoke returned HTTP 200 for:
  - `/codex?category=diplomatictreaties`
  - `/codex?category=diplomatictreaties&entry=Declaration_OpenBorders`
  - `/codex?category=diplomatictreaties&search=vision`
  - `/codex?category=abilities`
- Headless Chrome DOM smoke rendered `/codex?category=diplomatictreaties`.
- Product finding from DOM smoke: applied Status target facts were leaking into
  row previews as `Other empire`; fixed in DIPLOMACY-UI-001A.
- DIPLOMACY-UI-002 smoke confirmed treaty rows expose quiet metadata while
  public descriptions remain the row content.

### Follow-Up Ideas

- Consider whether applied Status links belong in archive rows after product
  review; current accepted behavior is signal text only, not status cards.

## Lessons Learned

- Small categories may still need orientation when the entries span different
  strategic postures.
- A rename can be a product decision independent of the first UI slice.
  Diplomacy kept `diplomatictreaties` internally while changing the visible
  category label to `Diplomacy`.
- Browser DOM smoke can catch scan-quality issues that tests miss; here it
  caught low-value applied-status target facts becoming archive previews.
- Reliable small row metadata should not be deferred too early. DIPLOMACY-UI-001
  fixed orientation, but DIPLOMACY-UI-002 was needed before closeout because
  treaty rows have trustworthy Category/Bilateral/Duration facts.
- Exact linked mechanics can appear as compact archive-row signal lines without
  promoting linked entities into full cards. Diplomacy uses this for applied
  Status mechanics such as Public Opinion changes.
