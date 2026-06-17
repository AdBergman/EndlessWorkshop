# Codex Shallow Reference Layout Review

Status: active docs/design investigation
Area: Codex / Encyclopedia
Ticket: `EW-CODEX-UI-004` - Shallow Reference Layout Review

## Summary

Current Codex code already treats `resources`, `councilorEffects`,
`partnerEffects`, and `traits` as shallow reference categories through
`isShallowReferenceKind`. Their category overview renders a compact reference
list with exported effect lines, context labels, and exact links. The open UX
question is whether these category overviews still need the left result panel.

Recommendation: start with an overview-only layout change for Partner Effects
and Councilor Effects. On their category overview routes, make the reference
list use the full available width and hide the left result panel. Keep the
current split layout for selected entries and search-active states.

Do not include Extractors in the first implementation slice.

## Current Evidence

- `CodexSummaryDetail` renders shallow summaries as `Reference list` instead of
  generic category overviews.
- `codexShallowReferencePreview.ts` currently defines shallow kinds as:
  `resources`, `counciloreffects`, `partnereffects`, and `traits`.
- Partner Effects and Councilor Effects overview rows show role/scope context,
  exported effect lines, and exact source links where available.
- Resources overview rows show resource type, effect lines, and exact extractor
  links.
- Traits overview rows show category/context, exported effect lines, and exact
  Minor Faction links where available.
- Extractors are a normal visible category today, not part of
  `isShallowReferenceKind`.
- Current route behavior selects a category summary entry for category routes;
  selecting an individual entry opens the entry detail while preserving exact
  links and direct routes.

## Category Recommendations

| Category | Recommendation | Rationale |
| --- | --- | --- |
| Partner Effects | Full-width reference-list overview first | The overview list carries the useful payload: effect lines, scope/context, and source links. The left result panel duplicates names in a narrower, lower-value form. |
| Councilor Effects | Full-width reference-list overview first | Same shape as Partner Effects. Rows are list-first mechanics references, and the source/effect context belongs in the main overview. |
| Resources | Candidate for a later pass, not first slice | Resource rows are also list-first and link to Extractors, but Resources can be more navigational because extractor relationships may invite entry-by-entry inspection. Review after effects categories. |
| Traits | Keep current split layout for now | Traits can be source/contextual and often participate in faction, hero, and minor-faction routes. The left panel may still help scanning and direct selection. |
| Extractors | Do not include for now | Extractors are not shallow in current code and behave more like district/improvement infrastructure entries tied to Resources. Include only after separate evidence. |

## Proposed Layout Behavior

For Partner Effects and Councilor Effects:

- Category overview route, no search query, no selected concrete entry:
  - use a full-width reference-list overview;
  - hide the left result panel;
  - keep the compact archive/search header;
  - keep the category shelf with `All`;
  - keep exact source/related links inside overview rows.
- Selected entry route:
  - keep current split layout;
  - left panel remains useful for returning to neighboring entries;
  - right panel shows the selected entry detail.
- Search-active route:
  - keep current split layout;
  - search results are the primary scanning surface;
  - `All` remains available in the category shelf.

For Resources:

- Keep current split layout until Partner/Councilor Effects prove the pattern.
- Re-evaluate whether the Resources overview should become full-width after
  checking real extractor/resource data in browser review.

For Traits:

- Keep current split layout.
- Revisit only with evidence that the reference overview consistently replaces
  result scanning.

## Route Behavior

- Preserve existing `?category=` and `?entry=` semantics.
- `/codex?category=partnereffects` and `/codex?category=counciloreffects`
  should show full-width overview only when the selected item is the category
  summary entry.
- `/codex?category=partnereffects&entry=...` and
  `/codex?category=counciloreffects&entry=...` should keep split layout.
- `All` should continue to return to `/codex`.
- Modifiers remain hidden from visible category navigation.

## Search Behavior

- Do not reintroduce the Codex autocomplete popup.
- Search filtering stays active and uses the current optimized search path.
- When a query is active, keep the split layout so the result list is visible.
- Do not create a separate shallow-category search UI in this slice.

## Implementation Risk

Risk is moderate-low if limited to overview-only layout gating. The main risk is
route state: the app currently uses selected summary entries and selected entry
keys to decide whether the results pane is shown. The implementation should
avoid changing deep-link hydration or selection behavior.

Avoid:

- backend/import/exporter changes;
- DB Exporter contract changes;
- generic layout frameworks;
- Ability/Status filter work;
- Modifiers promotion;
- changing selected-entry detail behavior.

## Smallest Safe Implementation Slice

Implement full-width shallow overview only for:

- `counciloreffects`
- `partnereffects`

Only apply it when:

- active category is one of those two kinds;
- the selected list item is the summary entry;
- there is no active search query.

Keep everything else as-is.

## Test Plan

- `/codex?category=partnereffects` renders the Partner Effects overview without
  the left result panel.
- `/codex?category=counciloreffects` renders the Councilor Effects overview
  without the left result panel.
- `/codex?category=partnereffects&entry=...` keeps the split layout and detail
  page.
- `/codex?category=counciloreffects&entry=...` keeps the split layout and detail
  page.
- Search-active Partner/Councilor Effects routes keep the result panel.
- Resources and Traits keep current split behavior.
- `All` remains visible in category/search shelf and returns to `/codex`.
- Modifiers remain hidden.

## Suggested Next Implementation Prompt

Implement `EW-CODEX-UI-004A` as a narrow Codex frontend slice:

- For `partnerEffects` and `councilorEffects` category overview routes only,
  hide the left result panel and let the shallow reference overview use the
  full content width.
- Preserve split layout for selected entries and active search.
- Do not change Resources, Traits, Extractors, detail pages, backend/importer,
  DB Exporter contracts, Modifiers, or Ability/Status filters.
- Add focused tests for overview full-width behavior, selected-entry split
  behavior, search-active split behavior, and unchanged Resources/Traits.
