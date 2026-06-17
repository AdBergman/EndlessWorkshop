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

### Goal

Make category pages feel like category pages instead of always starting with the generic `Encyclopedia` header.

### Current problem

On category pages, the global header still says `Encyclopedia`, while the page content also says `All Actions`, `All Tech`, etc. This makes category pages feel generic/heavy and contributes to the “page inside a page” feeling.

### Desired behavior

- `/codex`: large header remains `Encyclopedia`.
- `/codex?category=actions`: large header becomes `Actions`.
- `/codex?category=tech`: large header becomes `Tech`.
- `/codex?category=partnereffects`: large header becomes `Partner Effects`.
- Entry routes keep the category header behavior for now; entry title remains in the detail panel.

### Keep

- landing category cards,
- category page left results,
- right overview/detail,
- compact direct category shelf,
- search,
- stats.

### Do not

- redesign landing cards,
- redesign detail pages,
- move nav into left panel,
- add Ability/Status filters,
- alter backend/import/exporter contracts.

### Tests

- `/codex` renders `Encyclopedia` as header.
- `/codex?category=actions` renders `Actions` as header.
- `/codex?category=partnereffects` renders `Partner Effects` as header.
- landing cards still render on `/codex`.
- Modifiers remain hidden.
- Search still works.

### Validation

- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

### Suggested commit

`feat(codex): make category header contextual`

---

## EW-CODEX-UI-002 — Landing Page Final Polish

### Goal

Make `/codex` feel like a premium encyclopedia index.

### Current problem

The landing direction is good, but spacing and composition may still need manual tuning.

### Desired behavior

- Category cards are the primary navigation.
- No duplicated top category shelf on landing.
- No duplicated giant `Codex Overview` title.
- Search and stats feel balanced.
- Category card grid uses available width well.

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

`feat(codex): polish encyclopedia landing index`

---

## EW-CODEX-UI-003 — Category Shelf Final Polish

### Goal

Keep direct category access while making the category shelf as calm and compact as possible.

### Current problem

The category shelf is better after recent compacting, but still visually dense on category pages.

### Desired behavior

- All visible categories remain one-click accessible on category pages.
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

`feat(codex): refine category shelf hierarchy`

---

## EW-CODEX-UI-004 — Shallow Reference Layout Review

### Goal

Decide whether shallow reference categories should use a full-width reference-list layout instead of split left-results/right-detail layout.

### Candidate categories

- Partner Effects
- Councilor Effects
- Resources
- Traits
- maybe Extractors

### Current observation

For Partner Effects, the right/main reference list is more useful than the compressed left result list. The left panel often duplicates the same information with less value.

### First step

Docs/design investigation only. Do not implement directly.

### Questions

- Which categories genuinely benefit from the left panel?
- Which categories are list-first?
- Should shallow categories hide/collapse the left panel on overview?
- What happens when a single entry is selected?
- How does search behave?

### Suggested commit for plan

`docs(codex): plan shallow reference layouts`

---

## EW-CODEX-UI-005 — Ability/Status Refine Reintroduction

### Goal

Revisit the stashed Ability/Status metadata filters after header/category layout is stable.

### Current state

A technical implementation exists in stash:
`stash@{0}: On main: park ability status metadata ux feature toggle work`

It should not be committed as-is.

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

`EW-CODEX-UI-001 — Contextual Codex Header`

Reason:
It is the smallest meaningful visual hierarchy improvement. It does not reopen navigation structure and should make category pages feel less generic immediately.
