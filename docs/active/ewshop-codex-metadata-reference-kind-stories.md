# EWShop Codex Metadata + Reference Kind Integration Stories

**Document purpose:**  
This document turns the latest DB Exporter Codex/reference-kind handoff into an EWShop implementation backlog.

It is written for EWShop fullstack implementation work, not DB Exporter work.

EWShop now has richer generic Codex metadata available across more exports:

- `facts`
- `sections`
- `publicContextKeys`

Historically, EWShop mainly had meaningful metadata for `populations`. The exporter has now expanded broad Codex metadata and added new public Codex projections for:

- `actions`
- `diplomaticTreaties`
- `bonuses`

The immediate EWShop goal is to consume this data properly so Codex pages become more useful, polished, navigable, and less dependent on brittle frontend parsing.

---

## Product Direction

EWShop Codex should become a polished strategy companion reference, not a raw JSON browser.

The new metadata should be used to improve:

- Codex detail page readability
- facts panels
- structured sections
- internal related links
- search quality
- SEO semantic density
- Quest Strategy reference links
- public Codex category coverage

The work should be done incrementally, with clear value per story.

Do not do a broad redesign.

Do not start exporter feature work.

Do not treat raw keys as user-facing content unless there is no better public-safe display label.

---

## Architecture Rules

- Rich exports remain canonical.
- Codex exports are public projections.
- Generic Codex root shape is unchanged.
- Optional metadata fields are:
  - `facts`
  - `sections`
  - `publicContextKeys`
- `descriptionLines` remain fallback text.
- EWShop should consume the new metadata instead of parsing `descriptionLines` where structured metadata exists.
- Do not make frontend infer from Unity-style keys when metadata/reference data exists.
- Do not expose Unity internals, GUIDs, mapper names, filesystem paths, raw DB paths, raw descriptors, or diagnostic provenance.
- Diagnostics files are not product import contracts.
- Keep implementation consistent with existing `AGENTS.md`, repository code style, testing strategy, and architectural boundaries.

---

# Initiative 1: Diplomatic Treaties Codex

## Product Goal

Fix Diplomatic Treaties so they no longer display as raw or awkward Codex fragments.

Diplomatic Treaties should become a first-class, readable Codex category.

Exporter state appears good enough for EWShop integration:

- `exportKind = diplomaticTreaties`
- entries have `entryKey`
- `displayName`
- `category`
- `kind`
- `descriptionLines`
- `facts`
- optional `sections`
- `publicContextKeys`

This is the cleanest immediate product win.

---

## EW-CODEX-TREATIES-001 — Import Diplomatic Treaties Codex

**Priority:** P0  
**Area:** Backend / Importer  
**Type:** Vertical slice foundation

### User Story

As an EWShop user, I want diplomatic treaties imported into the Codex so I can search and browse them like other public game concepts.

### Requirements

- Add or verify importer support for `exportKind = diplomaticTreaties`.
- Preserve generic Codex metadata:
  - `facts`
  - `sections`
  - `publicContextKeys`
  - `descriptionLines`
- Persist entries using the existing Codex pattern if possible.
- Avoid creating a bespoke treaty domain model unless current architecture requires it.
- Ensure re-import updates rows cleanly.
- Ensure obsolete rows are removed or handled consistently with existing Codex import behavior.

### Acceptance Criteria

- `ewshop_diplomatic_treaties_codex_export_0.80.json` imports successfully.
- Imported entries are queryable through backend Codex APIs.
- Facts and sections survive import.
- Public context keys survive import.
- No duplicate normalized entry keys.
- No importer crash on optional/missing sections.

### Verification

- Add or update importer tests.
- Add fixture-based test using representative treaty rows:
  - `Treaty_VisionExchange`
  - `Treaty_MapExchange`
  - `Declaration_OpenBorders`
  - `Declaration_JustifiedWar`
- Run relevant backend tests.

---

## EW-CODEX-TREATIES-002 — Add Diplomatic Treaties Codex Category

**Priority:** P0  
**Area:** Frontend / Product UI  
**Type:** Navigation

### User Story

As a user, I want Diplomatic Treaties to appear as a real Codex category, not hidden or mixed into generic references.

### Requirements

- Add `Diplomatic Treaties` to Codex category navigation.
- Use a clean public label:
  - `Diplomatic Treaties`
- Avoid exposing the camel-case export kind as UI text.
- Ensure category count/search behavior matches other Codex categories.
- Ensure empty/loading/error states match existing Codex behavior.

### Acceptance Criteria

- Diplomatic Treaties appear in Codex navigation.
- The category shows imported treaty rows.
- Search can find treaty entries.
- Category page does not show raw JSON-style content.
- Mobile/responsive layout remains acceptable.

### Verification

- Frontend tests for category registration/navigation.
- Manual UI review.

---

## EW-CODEX-TREATIES-003 — Treaty Detail Page Polishing

**Priority:** P0  
**Area:** Frontend / Codex Detail  
**Type:** UX polish

### User Story

As a strategy player, I want a treaty page to quickly show what the treaty does, its category, whether it is bilateral, duration, and related effects.

### Requirements

Treaty detail pages should render:

- Title
- Category
- Kind
- Description/effects
- Facts panel
- Sections, especially `Effects`
- Related entries from `publicContextKeys` and `referenceKeys` where supported

Recommended layout:

1. Header
2. Facts strip/panel
3. Effects section
4. Related links

### Acceptance Criteria

- `Military Alliance`, `Open Borders`, `Vision Exchange`, and war declarations render cleanly.
- Facts like `Bilateral`, `Duration`, and `Category` are visible.
- Effects text renders with existing token/icon rendering.
- No ugly raw key block appears as primary content.
- Missing optional metadata degrades gracefully.

### Verification

- Component tests for metadata rendering.
- Snapshot or DOM tests for representative treaty detail pages.
- Manual visual review.

---

## EW-CODEX-TREATIES-004 — Quest Strategy Treaty Links

**Priority:** P1  
**Area:** Frontend / Quest Strategy / Codex Links  
**Type:** Integration

### User Story

As a user reading Quest Strategy, I want treaty requirements like “Propose treaty: Vision Exchange” to link to the treaty Codex page.

### Requirements

- Resolve `referenceKind = diplomaticTreaties` or treaty aliases to the treaty Codex category.
- Link known treaty keys:
  - `Treaty_VisionExchange`
  - `Treaty_MapExchange`
  - `Declaration_OpenBorders`
  - `Declaration_JustifiedWar`
- Preserve existing readable fallback text if a link cannot resolve.
- Do not infer treaty links from plain text when typed references exist.

### Acceptance Criteria

- Quest Strategy treaty references become clickable.
- Broken/missing references do not break Quest rendering.
- Existing Quest Strategy layout is not redesigned.

### Verification

- Add targeted tests for reference resolution.
- Use existing Quest fixtures if available.

---

# Initiative 2: Actions Codex

## Product Goal

Actions should show up as a first-class Codex category.

Exporter now emits `actions` as a public generic Codex projection. It includes public keyspaces such as:

- `ActionType...`
- `FactionActionType...`
- `EmpireActionType...`
- `ConstructibleAction...`

The exporter intentionally keeps labels cheap and fast. Some labels are less polished, but this is still useful as a Codex/reference category and link target.

---

## EW-CODEX-ACTIONS-001 — Import Actions Codex

**Priority:** P0  
**Area:** Backend / Importer  
**Type:** Vertical slice foundation

### User Story

As an EWShop user, I want game actions imported into Codex so I can search and inspect action-related mechanics.

### Requirements

- Add or verify importer support for `exportKind = actions`.
- Preserve:
  - `facts`
  - `sections`
  - `publicContextKeys`
  - `referenceKeys`
  - `descriptionLines`
- Import action mechanic sections and cost modifier sections.
- Do not create rich canonical action domain unless current architecture requires it.
- Treat actions as generic Codex projection.

### Acceptance Criteria

- `ewshop_actions_codex_export_0.80.json` imports successfully.
- Entries are queryable through Codex APIs.
- Sections such as `Cost modifiers` and `Action mechanics` are preserved.
- Optional `descriptionLines = null` does not break import.
- Re-import is stable.

### Verification

- Backend importer tests using representative actions:
  - `ActionTypeBuildBridge`
  - `ActionTypeBribeVillage`
  - `ActionTypeBuildDam`
  - `FactionActionTypeMukag_MonsoonFestival`
  - `EmpireActionTypeMukag_Light01`
- Confirm null description handling.

---

## EW-CODEX-ACTIONS-002 — Add Actions Codex Category

**Priority:** P0  
**Area:** Frontend / Product UI  
**Type:** Navigation

### User Story

As a user, I want Actions to appear as a Codex category so I can browse and search game actions.

### Requirements

- Add `Actions` to Codex category navigation.
- Category should display action rows.
- Use public display names where available.
- Do not show raw `ActionType...` keys as the main title when `displayName` exists.
- Ensure search includes actions.

### Acceptance Criteria

- Actions category appears in Codex.
- Actions are searchable.
- The category page is readable despite some entries having limited descriptions.
- No frontend crash on null description lines.

### Verification

- Frontend category tests.
- Manual category review.

---

## EW-CODEX-ACTIONS-003 — Action Detail Page Polishing

**Priority:** P1  
**Area:** Frontend / Codex Detail  
**Type:** UX polish

### User Story

As a player, I want action detail pages to show useful mechanics and related cost modifiers without looking like raw database output.

### Requirements

Action pages should render:

- Title
- Kind/category
- Description if present
- Facts panel
- Sections:
  - `Cost modifiers`
  - `Action mechanics`
- Related entries via public context keys/reference keys

UX guidance:

- Hide or de-emphasize “Reference key” if it is already visible in a debug/dev area.
- Prefer readable mechanics sections over raw key lists.
- Long cost modifier lists should be grouped or collapsed if needed.
- Keep detail pages consistent with other Codex entries.

### Acceptance Criteria

- `Build Bridge` shows cost modifiers cleanly.
- `Build Dam` shows cost modifiers cleanly.
- `Build Partner Den` shows action mechanics cleanly.
- Actions with no description still look intentional, not broken.
- Raw keys are not the primary visual content.

### Verification

- Frontend rendering tests.
- Manual review of several action pages.

---

## EW-CODEX-ACTIONS-004 — Quest Strategy Action Links

**Priority:** P1  
**Area:** Frontend / Quest Strategy / Codex Links  
**Type:** Integration

### User Story

As a user reading Quest Strategy, I want action requirements like “Use Build Bridge” to link to the relevant action Codex entry.

### Requirements

- Resolve typed action references to the `Actions` Codex category.
- Support aliases emitted by exporter:
  - `Action`
  - `ArmyAction`
  - `EmpireAction`
  - `FactionAction`
  - `SettlementAction`
  - `ObservatoryAction`
  - `ConstructibleAction`
  - `TerraformingAction`
- Preserve fallback readable text.
- Do not infer from plain text if typed reference exists.

### Acceptance Criteria

- `ActionTypeBuildBridge` links to `Build Bridge`.
- `FactionActionTypeMukag_MonsoonFestival` links to `Mukag Monsoon Festival`.
- `EmpireActionTypeMukag_Light01` links to its action page.
- Missing action links degrade gracefully.

### Verification

- Targeted reference resolver tests.
- Manual Quest Strategy inspection.

---

# Initiative 3: Generic Codex Metadata Polish

## Product Goal

Use `facts`, `sections`, and `publicContextKeys` across all Codex detail pages, not just populations.

This is the broad polish layer that makes the new exporter metadata valuable.

---

## EW-CODEX-META-001 — Audit Existing Generic Codex Metadata Rendering

**Priority:** P0  
**Area:** Frontend / Backend  
**Type:** Investigation + small fixes

### User Story

As EWShop product owner, I want to know whether all Codex categories preserve and render metadata consistently.

### Requirements

Audit whether the current backend/frontend already supports metadata for all generic Codex entries:

- facts
- sections
- section items
- item facts
- section lines
- publicContextKeys

Check existing categories:

- populations
- abilities
- units
- heroes
- tech
- districts
- improvements
- traits
- minor factions
- actions
- bonuses
- diplomatic treaties

### Acceptance Criteria

- Clear report of which categories render metadata correctly.
- Fix small gaps if safe.
- Create follow-up tickets for larger gaps.
- No broad redesign.

### Verification

- Unit tests where simple.
- Manual review of representative entries.

---

## EW-CODEX-META-002 — Standard Facts Panel Rendering

**Priority:** P0  
**Area:** Frontend / Codex Detail  
**Type:** Reusable component

### User Story

As a user, I want important Codex facts to be displayed consistently across all categories.

### Requirements

Create or improve reusable facts rendering.

Must support:

- list of `{ label, value }`
- empty/missing facts
- compact display
- token rendering inside values if present
- responsive layout

Should work for:

- Populations
- Diplomatic Treaties
- Actions
- Bonuses
- Traits
- Equipment
- Councilors

### Acceptance Criteria

- Facts render consistently.
- Empty facts do not create blank panels.
- Values are readable.
- Long values wrap gracefully.

### Verification

- Component tests.
- Manual detail page review.

---

## EW-CODEX-META-003 — Standard Section Rendering

**Priority:** P0  
**Area:** Frontend / Codex Detail  
**Type:** Reusable component

### User Story

As a user, I want structured Codex sections to display as readable content instead of raw fallback lines.

### Requirements

Create or improve reusable section rendering.

Must support:

- `title`
- `lines`
- `items`
- item `label`
- item `referenceKey`
- item `facts`
- item `lines`

Should render:

- simple line sections
- mechanics sections
- grouped items
- nested facts

### Acceptance Criteria

- Treaty `Effects` sections render cleanly.
- Action `Cost modifiers` sections render cleanly.
- Bonus `Bonus mechanics` sections render cleanly.
- Status `Status mechanics` sections render cleanly.
- No raw object-like display.

### Verification

- Component tests for sections and nested items.
- Manual review.

---

## EW-CODEX-META-004 — Public Context Key Related Links

**Priority:** P1  
**Area:** Frontend / Backend / Search  
**Type:** Cross-linking

### User Story

As a user, I want Codex pages to show related entries based on public context keys.

### Requirements

- Investigate how related entries are currently resolved.
- Use `publicContextKeys` to improve related links where reliable.
- Avoid noisy self-links.
- Avoid showing raw keys as user-facing related labels.
- Prefer resolved Codex entries with display names.

### Acceptance Criteria

- Treaty pages can show related bonuses/statuses where available.
- Action pages can show related bonuses/cost modifiers.
- Bonus pages can show related actions.
- Self-reference is suppressed or de-emphasized.
- Missing links do not display as ugly raw keys.

### Verification

- Backend or frontend tests for relation resolution.
- Manual review.

---

## EW-CODEX-META-005 — Metadata-First Detail Page Fallback Order

**Priority:** P1  
**Area:** Frontend / Codex Detail  
**Type:** UX consistency

### User Story

As a user, I want Codex detail pages to prioritize structured metadata and only use fallback description lines when needed.

### Recommended Rendering Order

1. Title
2. Category/kind badge
3. Facts panel
4. Sections
5. Description lines fallback
6. Related entries
7. Debug/dev key area only if applicable

### Requirements

- Update generic Codex detail renderer if needed.
- Do not duplicate the same text in both `descriptionLines` and `sections`.
- Prefer section content when it is clearly structured.
- Preserve useful fallback text for entries with no sections.

### Acceptance Criteria

- Populations still look good.
- Diplomatic Treaties look much better.
- Actions look acceptable even when sparse.
- Bonuses are not made worse.
- No category regresses into raw key display.

### Verification

- Frontend tests.
- Manual review.

---

# Initiative 4: Bonuses Handling

## Product Goal

Bonuses are useful as link targets and mechanics references, but may not yet be polished enough as a top-level browsing category.

Do not blindly expose Bonuses as a main Codex category until the product quality is acceptable.

---

## EW-CODEX-BONUSES-001 — Import Bonuses Codex As Link Targets

**Priority:** P1  
**Area:** Backend / Importer  
**Type:** Foundation

### User Story

As a user, I want bonuses/statuses/cost modifiers referenced from actions, treaties, quests, and other Codex pages to resolve when possible.

### Requirements

- Add or verify importer support for `exportKind = bonuses`.
- Preserve:
  - facts
  - sections
  - publicContextKeys
  - referenceKeys
  - descriptionLines
- Import should succeed even for entries with rough display names.
- Do not necessarily expose Bonuses as top-level navigation yet.

### Acceptance Criteria

- `ewshop_bonuses_codex_export_0.80.json` imports successfully.
- Bonus entries can be resolved internally as related links.
- Bonus sections render correctly when directly opened.
- No import failure due to duplicate or rough keys.

### Verification

- Backend importer tests.
- Representative bonus rows:
  - `ActionCostModifier_BuildBridge_Decrease_00`
  - `ActionCostModifier_BuildDam`
  - `Status_City_Approval_High`
  - `Status_PublicOpinion_YouAttackedMeBadge01`

---

## EW-CODEX-BONUSES-002 — Bonus Detail Rendering

**Priority:** P1  
**Area:** Frontend / Codex Detail  
**Type:** Detail support

### User Story

As a user who follows a link to a bonus, I want the page to explain the mechanic clearly even if the entry is not polished enough for browsing.

### Requirements

- Render facts and sections for bonuses.
- Support:
  - `Bonus mechanics`
  - `Status mechanics`
  - `Effects`
- De-emphasize raw-looking display names where possible.
- Show target action/constructible links where resolvable.
- Keep the page acceptable as a deep link.

### Acceptance Criteria

- Bonus detail pages do not look broken.
- Mechanics facts are readable.
- Rough titles do not dominate more than necessary.
- Linked action targets resolve.

### Verification

- Component tests.
- Manual review.

---

## EW-CODEX-BONUSES-003 — Evaluate Bonus Top-Level Category Readiness

**Priority:** P2  
**Area:** Product / Frontend  
**Type:** Product decision

### User Story

As product owner, I want to decide whether Bonuses are ready to appear as a top-level Codex category.

### Evaluation Question

Would a normal player intentionally browse this category?

### Known Concerns

Some rows still have rough labels such as:

- `Action Cost Modifier Attach Camp03`
- `Constructible Cost Modifier Definition Custom Specific16 Foundation Dust Cost`
- stable-token generated names

### Requirements

- Review imported bonus entries.
- Estimate how many have polished names.
- Estimate how many are raw/technical-looking.
- Decide:
  - visible top-level category now
  - hidden category but linkable detail pages
  - grouped under Mechanics
  - deferred until exporter polish/filtering

### Acceptance Criteria

- Written recommendation.
- No accidental top-level exposure if quality is poor.
- Follow-up exporter request drafted only if needed.

---

# Initiative 5: Search, SEO, and Discovery

## Product Goal

New Codex metadata should improve discovery and search without creating SEO spam.

---

## EW-CODEX-DISCOVERY-001 — Include New Categories In Search

**Priority:** P1  
**Area:** Backend / Frontend / Search  
**Type:** Discovery

### User Story

As a user, I want search to find Actions and Diplomatic Treaties.

### Requirements

- Include `actions`.
- Include `diplomaticTreaties`.
- Include `bonuses` only if product decision allows public search, or include as deep-link-only if architecture supports that.
- Search should index:
  - displayName
  - category
  - kind
  - descriptionLines
  - facts
  - section lines
  - section item labels
  - publicContextKeys only if useful and not noisy

### Acceptance Criteria

- Search finds `Build Bridge`.
- Search finds `Vision Exchange`.
- Search finds `Open Borders`.
- Search result snippets are readable.
- Search does not become polluted with raw bonus keys.

### Verification

- Search tests.
- Manual search review.

---

## EW-CODEX-DISCOVERY-002 — SEO Metadata For New Codex Categories

**Priority:** P2  
**Area:** Frontend / SEO  
**Type:** Polish

### User Story

As EWShop owner, I want new Codex pages to have useful page titles and descriptions.

### Requirements

- Add page titles for Actions and Diplomatic Treaties.
- Add detail page SEO descriptions using public display name, category, and effects/description.
- Avoid raw key stuffing.
- Use structured metadata only where already available and meaningful.

### Acceptance Criteria

- Treaty pages have sensible titles/descriptions.
- Action pages have sensible titles/descriptions.
- No raw keys dominate SEO text.

### Verification

- Unit tests if SEO helpers exist.
- Manual generated metadata review.

---

# Initiative 6: Documentation and Guardrails

## Product Goal

Keep future work from drifting back into raw key parsing, ad hoc metadata rendering, or exporter-dependent frontend hacks.

---

## EW-CODEX-DOCS-001 — Update EWShop Codex Import/Metadata Documentation

**Priority:** P1  
**Area:** Docs  
**Type:** Guardrail

### User Story

As a future EWShop contributor, I want clear documentation explaining how Codex metadata should be consumed.

### Requirements

Document:

- Generic Codex metadata fields
- Rendering expectations
- Import expectations
- Actions category
- Diplomatic Treaties category
- Bonuses link-target behavior
- Diagnostics are not product contracts
- Avoid frontend key inference where metadata exists

### Acceptance Criteria

- Docs explain current architecture.
- Docs include examples.
- Docs mention that bonuses may be link-target-first, not necessarily top-level browsing.
- Docs do not ask frontend to parse Unity-style keys.

---

# Recommended Implementation Order

## Batch 1 — Treaties First

Reason: highest immediate product value, clean exporter data, fixes ugly current display.

Stories:

1. `EW-CODEX-TREATIES-001`
2. `EW-CODEX-TREATIES-002`
3. `EW-CODEX-TREATIES-003`

Optional if nearby:

4. `EW-CODEX-META-002`
5. `EW-CODEX-META-003`

---

## Batch 2 — Actions Category

Reason: explicit product goal, exporter data ready, useful Quest Strategy links.

Stories:

1. `EW-CODEX-ACTIONS-001`
2. `EW-CODEX-ACTIONS-002`
3. `EW-CODEX-ACTIONS-003`

Optional if nearby:

4. `EW-CODEX-ACTIONS-004`

---

## Batch 3 — Generic Metadata Rendering

Reason: unlocks polish across all Codex categories.

Stories:

1. `EW-CODEX-META-001`
2. `EW-CODEX-META-002`
3. `EW-CODEX-META-003`
4. `EW-CODEX-META-005`

---

## Batch 4 — Quest Strategy Links

Reason: value depends on imported categories existing first.

Stories:

1. `EW-CODEX-TREATIES-004`
2. `EW-CODEX-ACTIONS-004`
3. selected related-link work from `EW-CODEX-META-004`

---

## Batch 5 — Bonuses As Link Targets

Reason: useful but product quality is mixed.

Stories:

1. `EW-CODEX-BONUSES-001`
2. `EW-CODEX-BONUSES-002`
3. `EW-CODEX-BONUSES-003`

Do not expose top-level Bonuses navigation until product review says yes.

---

## Batch 6 — Search, SEO, Docs

Reason: should follow stable category/detail behavior.

Stories:

1. `EW-CODEX-DISCOVERY-001`
2. `EW-CODEX-DISCOVERY-002`
3. `EW-CODEX-DOCS-001`

---

# Autonomous Codex Execution Prompt

Use this prompt in Codex after dropping this file into the EWShop repository.

```text
Goal:
Implement the EWShop Codex metadata/reference-kind integration backlog from the attached Markdown story file.

Role:
You are EWShop fullstack tech lead, product-minded implementation engineer, and reviewer. You must follow AGENTS.md, repository code style, existing architecture, existing test strategy, and local conventions.

Primary product goals:
1. Fix Diplomatic Treaties so they no longer display as awkward/raw Codex content.
2. Add Actions as a first-class Codex category.
3. Use broad generic Codex metadata (`facts`, `sections`, `publicContextKeys`) to polish Codex detail pages.
4. Treat Bonuses carefully: import and render as link targets first, but do not expose as top-level navigation until product quality is evaluated.
5. Improve Quest Strategy links to Actions and Diplomatic Treaties after the categories exist.

Important context:
- Rich exports remain canonical.
- Codex exports are public projections.
- Generic Codex root shape is unchanged.
- Metadata fields already exist in exporter output:
  - facts
  - sections
  - publicContextKeys
- `descriptionLines` remain fallback text.
- Diagnostics files are not product import contracts.
- Do not infer from Unity-style keys where structured metadata or typed references exist.
- Do not start DB Exporter work.

Input:
Read this backlog/story document.
Read AGENTS.md.
Inspect current backend, frontend, importer, Codex, search, and Quest Strategy code.

Execution mode:
Work autonomously through the backlog in priority order.

For each item:
1. Analyze current implementation.
2. Decide whether it should be implemented alone or batched with adjacent items.
3. Formulate a short plan.
4. Implement the smallest clean vertical slice.
5. Review your own diff for architecture, product quality, and overengineering.
6. Run targeted tests.
7. Run broader validation where appropriate.
8. If successful, continue to the next item.
9. If blocked, document the blocker, leave safe partial improvements if useful, and continue to the next independent item.

Batching guidance:
You may batch stories when they naturally belong together, for example:
- importer + API + frontend category for one export kind
- reusable facts/sections component + one category detail page
- reference resolver + Quest Strategy link test

Do not batch unrelated risky work just to move faster.

Initial recommended order:
1. Diplomatic Treaties import/category/detail.
2. Actions import/category/detail.
3. Reusable facts/sections rendering if not already good enough.
4. Quest Strategy links for treaties/actions.
5. Bonuses import/detail as link targets.
6. Search/SEO/docs.

Hard constraints:
- Do not redesign the full Codex UI.
- Do not do broad site-wide visual polish.
- Do not touch unrelated Quest Explorer behavior except typed Codex links.
- Do not make Bonuses a visible top-level category unless explicitly justified in the report.
- Do not expose raw keys as primary user-facing labels when displayName exists.
- Do not parse Unity-style keys when exporter metadata exists.
- Do not change exporter contracts.
- Do not create new metadata field names unless absolutely necessary and justified.
- Do not break existing categories.

Quality bar:
- The result should feel like a premium strategy companion, not a raw data dump.
- Empty/null optional fields must degrade gracefully.
- Metadata rendering must be reusable.
- Tests should cover importer behavior and frontend rendering behavior where practical.
- Existing working categories must not regress.

Validation:
Run the most relevant available checks:
- backend targeted tests
- frontend targeted tests
- typecheck
- build
- lint if standard in this repo
- importer fixture tests
- search/reference resolver tests where applicable

If broad tests fail due to known unrelated fixture drift, document this clearly and do not silently ignore new failures.

Report back:
Return a structured report with:
1. Stories completed.
2. Stories batched together and why.
3. Stories skipped/blocked and why.
4. Files changed.
5. Tests/checks run and results.
6. Product behavior after implementation.
7. Remaining risks.
8. Whether Bonuses are ready for visible top-level navigation.
9. Recommended next handoff to DB Exporter team, only if EWShop integration reveals real exporter-side pain.

Completion standard:
At minimum, Diplomatic Treaties and Actions should be imported, visible as Codex categories, and render useful metadata-driven detail pages. Generic metadata should render cleanly enough that facts/sections from exporter output produce visible product value without frontend parsing hacks.
```

---

# Product Owner Notes

## Definition of Done For This Epic

The epic is done when:

- Diplomatic Treaties are first-class in Codex.
- Actions are first-class in Codex.
- Metadata fields improve detail pages.
- Quest Strategy can link to Actions and Diplomatic Treaties.
- Bonuses can be resolved as deep links or related entries.
- EWShop no longer displays treaty/action content as awkward raw fragments.
- The implementation is tested and documented.

## What Not To Chase Yet

Do not chase:

- perfect action labels
- perfect bonus labels
- top-level Bonuses browsing
- broad Codex redesign
- exporter-side metadata expansion
- site-wide visual restyle

Those are future product decisions.
