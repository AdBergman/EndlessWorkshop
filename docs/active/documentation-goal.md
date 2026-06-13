Create a self-documenting Codex category review loop and Jira-style backlog. Do not implement UI.

Context:
We now have several current Codex diagnostic/report tracks:

- `docs/active/codex-content-quality-current-diagnostic-handoff.md`
  - exporter/editorial follow-up for thin/raw/internal/player-context issues.
- `docs/active/codex-preview-surface-audit.md`
  - exact-key opportunities where EWShop can render existing refs better.
- `docs/active/codex-relationship-value-gap-audit.md`
  - missing, text-only, unresolved, or non-linkable player-important relationships.
- `docs/current-action-priorities.md`
  - current product rules and safe resolver boundaries.

Recent frontend preview work has proven:
- Ability -> applied Status inline links.
- Unit / Equipment / Hero -> Granted Ability compact previews.
- Population exact threshold reward summaries.
- Major Faction package section using exact outbound and reverse refs.

Known hard rule:
EWShop must use exact exported/resolved metadata only. Do not infer links from display names, prose, fuzzy matching, or “looks like this should match.”

Goal:
Review every current Codex category/subcategory and produce a self-documenting product/implementation backlog.

This is planning and evidence.
This is not implementation.
This is not a generic renderer project.
This is not a new diagnostic framework unless a tiny helper script is necessary to generate category skeletons.

Deliverables:
1. Create or update a category review matrix doc, for example:
   `docs/active/codex-category-review-matrix.md`

2. Create a Jira-style backlog doc, for example:
   `docs/active/codex-category-jira-backlog.md`

3. Update `docs/active/README.md` if new docs are added.

Review all current Codex categories, including at minimum:
- abilities
- actions
- councilors
- diplomaticTreaties
- districts
- equipment
- factions
- heroes
- improvements
- minorFactions
- modifiers
- populations
- quests
- statuses
- tech
- traits
- units
- bonus-derived Statuses / Modifiers if represented separately in frontend

For each category/subcategory, document:
- Current frontend presentation.
- Main player question the page should answer.
- Whether the current page answers that question.
- Current useful exact refs/sections/facts.
- Current weak/thin/static/no-value text patterns.
- Preview-surface opportunities, if any.
- Missing exact refs or missing entity category.
- EWShop frontend-owned work.
- DB exporter/backend/editorial-owned work.
- Recommended product treatment:
  - keep top-level browseable
  - keep searchable/linkable only
  - improve frontend now
  - wait for exporter data
  - no action
- 2-5 concrete example entries.
- Risk level.
- Player value score.

Then create Jira-style tickets.

Ticket format:
- Ticket ID, for example `CDEX-CAT-001`
- Title
- Category
- Owner: EWShop frontend, DB exporter, backend, editorial, or mixed
- Priority: P0/P1/P2/P3
- Problem
- Player value
- Requirements
- Acceptance criteria
- Validation commands or browser review targets
- Do not / guardrails
- Dependencies
- Suggested implementation prompt if frontend-owned

Important rules:
- Do not create tickets for every tiny imperfection.
- Group repeated issues into one ticket when they share a root cause.
- Separate frontend tickets from exporter/editorial tickets.
- Mark blocked tickets clearly.
- Do not propose frontend inference from prose or display names.
- Do not promote Modifiers to top-level navigation.
- Do not redesign all Codex pages.
- Do not create generic renderer tickets unless supported by at least three proven relationship patterns.
- Do not implement anything.

Use existing diagnostics as evidence:
- content-quality handoff for thin/raw/internal text.
- preview-surface audit for exact preview-surface opportunities.
- relationship-value gap audit for missing/text-only/unresolved relationship gaps.
- current-action-priorities for current product rules.

Required ticket areas to include if supported by evidence:
- Tech unlock exact refs and future frontend rendering.
- Major faction Population threshold exact refs.
- Resource Codex category and Extractor -> Resource refs.
- Thin Actions gameplay summaries and affected targets.
- Diplomatic Treaty Effects/public text cleanup.
- Status sub-kind/scope metadata.
- Faction package follow-up polish.
- Codex Related Entries / preview-surface consistency.
- Category demotion/searchable-only treatment for thin pages.
- Any frontend-only quick wins still safely possible.

Validation:
- If only docs are changed: run `git diff --check`.
- If a tiny script is added to generate category skeletons: run the script, typecheck if needed, and `git diff --check`.

Report back:
1. Docs created/updated.
2. Category coverage summary.
3. Number of tickets created by owner and priority.
4. Top 10 tickets.
5. Frontend-owned tickets ready now.
6. Exporter/editorial tickets/blockers.
7. Categories recommended for searchable-only or demotion.
8. Open questions needing human product review.
9. Validation run.
10. Suggested commit message.

Do not commit before review.