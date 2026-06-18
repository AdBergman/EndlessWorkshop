# Codex Shallow Reference Layout Review

Status: completed for Partner Effects, Councilor Effects, and Resources
Area: Codex / Encyclopedia
Ticket: `EW-CODEX-UI-004` - Shallow Reference Layout Review

## Summary

Current Codex code already treats `resources`, `councilorEffects`,
`partnerEffects`, and `traits` as shallow reference categories through
`isShallowReferenceKind`. Their category overview renders a compact reference
list with exported effect lines, context labels, and exact links. The open UX
question is whether these category overviews still need the left result panel.

Implemented result: `EW-CODEX-UI-004A` landed in commit `92e94047`.
Partner Effects and Councilor Effects now use a centered full-width reference
overview on category overview routes. Resources followed in commit `5bf7253d`
with full-width overview, resource icons where available, and resource ordering
by exported Type facts.

Traits remain split-layout by design for now. Extractors are hidden
support/reference targets after commit `0ab94ec9`, not visible top-level
navigation destinations.

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
- Extractors are not visible top-level categories; they remain searchable,
  linkable, and direct-routable where exact refs exist.
- Current route behavior selects a category summary entry for category routes;
  selecting an individual entry opens the entry detail while preserving exact
  links and direct routes.

## Category Recommendations

| Category | Recommendation | Rationale |
| --- | --- | --- |
| Partner Effects | Full-width reference-list overview first | The overview list carries the useful payload: effect lines, scope/context, and source links. The left result panel duplicates names in a narrower, lower-value form. |
| Councilor Effects | Full-width reference-list overview first | Same shape as Partner Effects. Rows are list-first mechanics references, and the source/effect context belongs in the main overview. |
| Resources | Full-width reference-list overview implemented | Resource rows are list-first, show exact extractor links, show icons where exact icon data exists, and sort by exported resource Type facts: Luxury, Strategic, Other. |
| Traits | Keep current split layout for now | Traits can be source/contextual and often participate in faction, hero, and minor-faction routes. The left panel may still help scanning and direct selection. |
| Extractors | Hidden support/reference target | Extractors are discovered through Resources, search, direct routes, and exact Resource links instead of visible top-level navigation. |

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

- Category overview route, no search query, no selected concrete entry:
  - use a centered full-width reference-list overview;
  - hide the left result panel;
  - show resource icons where exact icon data exists;
  - order Luxury A-Z, Strategic A-Z, then Other A-Z using exported Type facts;
  - keep exact Extractor links.
- Selected entry route:
  - keep current split layout.
- Search-active route:
  - keep current split layout.

For Traits:

- Keep current split layout.
- Revisit only with evidence that the reference overview consistently replaces
  result scanning.

## Route Behavior

- Preserve existing `?category=` and `?entry=` semantics.
- `/codex?category=partnereffects` and `/codex?category=counciloreffects`
  should show full-width overview only when the selected item is the category
  summary entry.
- `/codex?category=resources` should show full-width overview only when the
  selected item is the category summary entry.
- `/codex?category=partnereffects&entry=...` and
  `/codex?category=counciloreffects&entry=...` should keep split layout.
- `/codex?category=resources&entry=...` should keep split layout.
- `All` should continue to return to `/codex`.
- Modifiers remain hidden from visible category navigation.
- Extractors remain hidden from visible category navigation but exact
  `/codex?category=extractors&entry=...` routes may resolve.

## Search Behavior

- Do not reintroduce the Codex autocomplete popup.
- Search filtering stays active and uses the current optimized search path.
- When a query is active, keep the split layout so the result list is visible.
- Do not create a separate shallow-category search UI in this slice.

## Implementation Risk

Risk is moderate-low when limited to overview-only layout gating. The main risk
is route state: the app uses selected summary entries and selected entry keys to
decide whether the results pane is shown. The implemented slice kept deep-link
hydration and selected-entry behavior unchanged.

Current implementation guardrail:

- full-width shallow overview is controlled by the explicit allow-list
  `counciloreffects`, `partnereffects`, `resources`;
- `supportsFullWidthReferenceOverview(kind)` is the layout helper;
- add any future category only after deliberate product review.

Avoid:

- backend/import/exporter changes;
- DB Exporter contract changes;
- generic layout frameworks;
- Ability/Status filter work;
- Modifiers promotion;
- changing selected-entry detail behavior.

## Completed Implementation Slice

Implemented full-width shallow overview only for:

- `counciloreffects`
- `partnereffects`
- `resources`

Only apply it when:

- active category is one of those two kinds;
- the selected list item is the summary entry;
- there is no active search query.

Traits and everything else remain split-layout.

## Test Plan

- `/codex?category=partnereffects` renders the Partner Effects overview without
  the left result panel.
- `/codex?category=counciloreffects` renders the Councilor Effects overview
  without the left result panel.
- `/codex?category=partnereffects&entry=...` keeps the split layout and detail
  page.
- `/codex?category=counciloreffects&entry=...` keeps the split layout and detail
  page.
- `/codex?category=resources` renders the Resources overview without the left
  result panel.
- Search-active Partner/Councilor Effects/Resources routes keep the result
  panel.
- Traits keep current split behavior.
- Extractors remain absent from visible top-level navigation but linkable.
- `All` remains visible in category/search shelf and returns to `/codex`.
- Modifiers remain hidden.

## Suggested Next Implementation Prompt

Next implementation prompt:

Move to `EW-CODEX-UI-005` Ability/Status refinement. The old Ability/Status
stash must be reviewed and selectively reused, not applied wholesale.
