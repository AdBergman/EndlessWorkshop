# EWShop Codex Premium UI Ticket Plan

Status: active UI ticket plan
Area: Codex / Encyclopedia
Purpose: preserve the current design direction and implement safely in small slices

## Working rules

- Implement one ticket at a time.
- Do not run browser QA or screenshot capture unless explicitly requested.
- Do not commit before manual visual review unless the user explicitly approves.
- Keep changes scoped.
- Do not touch backend/import/exporter contracts for these tickets.
- Do not promote Modifiers.
- Keep search fast.
- Keep direct category access for 4X players.
- Do not recommit the stashed Ability/Status filter work as-is.

## EW-CODEX-UI-001 — Contextual Codex Header

Status: implemented in commit `8b57d228`.

### Goal

Make category pages feel like category pages instead of always starting with the generic `Encyclopedia` header.

### Final accepted outcome

- `/codex` keeps the large `Encyclopedia` header, search, stats, and category cards.
- Category and entry views use a compact archive/search header.
- Category and entry views do not show a large repeated category title in the top header.
- The direct category shelf remains visible on category/search views.
- `All` is the first category-shelf control and returns to the landing/full encyclopedia state.
- The category shelf wraps instead of overflowing horizontally.
- Compact-header search is bounded in width.
- Codex autocomplete popup is disabled for now.
- Search filtering remains active and keeps the existing search performance behavior.
- Modifiers remain hidden.

### Notes

Manual review rejected the intermediate version where the top header became the selected category name because it repeated the same category context already shown in the results panel and overview/detail panel.

### Kept

- landing category cards,
- category page left results,
- right overview/detail,
- compact direct category shelf,
- search,
- stats.

### Did not

- redesign landing cards,
- redesign detail pages,
- move nav into left panel,
- add Ability/Status filters,
- alter backend/import/exporter contracts.

### Validation

- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npm test -- --run src/components/Codex/CodexSearch.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

### Commit

`feat(codex): compact category page header`

---

## EW-CODEX-UI-002 — Landing Page Final Polish

Status: no-op / deferred for now.

### Goal

Make `/codex` feel like a premium encyclopedia index.

### Outcome

The landing direction is acceptable for now. A tiny CSS-only polish pass was
attempted after `EW-CODEX-UI-001`, but manual visual review found it did not
meaningfully improve the page and made the landing feel worse. Do not commit or
recreate that tiny polish.

Reopen only for a more deliberate landing redesign with a clear visual target.

### Current behavior to preserve

- Category cards are the primary navigation.
- No duplicated top category shelf on landing.
- No duplicated giant `Codex Overview` title.
- Large `Encyclopedia` header, search, stats, and category cards remain.

### Do not

- redesign category pages,
- change search behavior,
- touch left/right category page layout.

### Tests

- `/codex` renders category cards.
- `/codex` does not render top category shelf.
- category cards are clickable.
- Modifiers remain hidden.

### Suggested commit

None for now.

---

## EW-CODEX-UI-003 — Category Shelf Final Polish

Status: covered by `EW-CODEX-UI-001` unless a specific new shelf issue is found.

### Goal

Keep direct category access while making the category shelf as calm and compact as possible.

### Outcome

The accepted `EW-CODEX-UI-001` implementation already restored `All`, made the
shelf wrap, kept all visible categories directly accessible, kept counts
secondary, preserved active highlighting, and kept Modifiers hidden.

### Current behavior to preserve

- All visible categories remain one-click accessible on category pages.
- `All` is first and returns to the landing/full encyclopedia state.
- The shelf wraps instead of overflowing.
- Counts are secondary.
- Active category is clear.
- No grouped shelf.
- No hidden categories except Modifiers.
- No extra group-selector row.

### Do not

- hide categories behind group filters,
- move navigation into left panel,
- change category ordering unless explicitly decided.

### Tests

- all visible categories render directly.
- active category is highlighted.
- `?category=partnereffects` highlights Partner Effects.
- Modifiers are absent.

### Suggested commit

None unless a specific new shelf issue is identified.

---

## EW-CODEX-UI-004 — Shallow Reference Layout Review

Status: complete for Partner Effects, Councilor Effects, and Resources.

### Goal

Decide whether shallow reference categories should use a full-width reference-list layout instead of split left-results/right-detail layout.

### Candidate categories

- Partner Effects: full-width overview implemented.
- Councilor Effects: full-width overview implemented.
- Resources: full-width overview implemented.
- Traits: remain split-layout by design for now.
- Extractors: hidden support/reference targets, not visible top-level
  destinations.

### Current observation

For Partner Effects, the right/main reference list is more useful than the compressed left result list. The left panel often duplicates the same information with less value.

### Implemented outcomes

`EW-CODEX-UI-004A` was implemented in commit `92e94047`. Follow-up resource
and extractor decisions landed in commits `0ab94ec9` and `5bf7253d`.

Final accepted behavior:

- Partner Effects and Councilor Effects overview routes use a centered
  full-width reference overview layout.
- Selected Partner/Councilor Effect entry routes keep split/detail behavior.
- Resources overview routes use the same centered full-width reference overview
  layout.
- Resource overview rows show icons where exact resource/extractor icon data is
  available.
- Resource overview ordering is Luxury A-Z, Strategic A-Z, then Other A-Z,
  based on exported resource Type facts.
- Selected Resource entry routes and search-active Resources keep split/detail
  behavior.
- Traits use a compact Trait Archive mode with Type rail (`All`, `Faction`,
  `Protectorate`) and reference-style rows; selected Trait entries and
  search-active Traits keep split/detail behavior.
- Extractors are hidden from visible top-level navigation and landing cards,
  but remain searchable, linkable, and direct-routable where exact refs exist.
- The layout is controlled by the explicit allow-list:
  `counciloreffects`, `partnereffects`, `resources`.
- Future full-width shallow categories must be added deliberately through
  `supportsFullWidthReferenceOverview(kind)`.
- No generic content renderer was introduced.
- Modifiers remain hidden.

### Remaining decision

None for UI-004. Do not create `EW-CODEX-UI-006` without a new explicit product
decision.

---

## EW-CODEX-UI-005 — Ability/Status Refine Reintroduction

### Goal

Revisit the stashed Ability/Status metadata filters after header/category layout is stable.

### Current state

A technical implementation exists in stash:
`stash@{0}: On main: park ability status metadata ux feature toggle work`

It should not be committed as-is.

Review and selectively reuse this stash only where it still fits the accepted
Codex hierarchy.

### Desired direction

Abilities:
- Ability mechanic
- Ability source
- Combat role, but not combined comma-string chips

Statuses:
- Scope as visible filter
- Status Type likely row/detail metadata only

### Rules

- Use exported facts only.
- No name/key/prose inference.
- No URL params in first release.
- No generic faceted-search framework.
- Filters should be contextual and secondary.
- Thin entries visible when no filter is active.

### Suggested commit

`feat(codex): add contextual ability status refinement`

---

## Recommended next implementation

Start with:

`EW-CODEX-UI-005` - Ability/Status refinement reintroduction.

There is no active `EW-CODEX-UI-006` ticket. Do not expand the ticket plan or
apply the old Ability/Status stash wholesale without a new prompt.
