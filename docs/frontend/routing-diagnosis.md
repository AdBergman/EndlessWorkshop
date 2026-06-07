# Frontend Routing Diagnosis

Date: 2026-06-07

Status: active routing/SEO follow-up backlog

## Summary

The main routing issue found in this pass was a backend/frontend route contract
mismatch for Quest Explorer deep links.

React accepts `/quests/*`, and `QuestExplorerPage` reads the selected quest from
either `/quests/{entryKey}` or `?quest={entryKey}`. Spring only forwarded
`/quests` and `/quests/` to `quests.html`, so direct first visits or refreshes
on `/quests/{entryKey}` did not reliably enter the React app. That matches the
reported behavior where the first load can show non-interactive/static content
or require a reload/navigation before the app hydrates correctly.

## Implemented Now

- Added Spring forwarding for one-segment quest deep links:
  - `/quests/{entryKey}`
  - `/quests/{entryKey}/`
- Kept nested quest paths such as `/quests/{entryKey}/extra` as `404`.
- Added backend route tests for dev/mock and production-style fallback.
- Added a React route-tree test for `/quests/Quest_A?mode=lore`.
- Added `docs/frontend/public-route-contract.md` as the route ownership matrix.
- Added backend route coverage that `/codex/{entryKey}` is not a public route
  while `/codex?entry={entryKey}` remains the codex SPA deep-link contract.

## Codex SEO Routing Review

Current codex routing is coherent:

- `/codex` is the interactive SPA codex route.
- `/codex?entry={entryKey}` is the current frontend deep-link contract.
- Generated SEO/crawl pages live under `/encyclopedia/{kind}/{slug}`.
- Backend-generated encyclopedia routes return generated files when present and
  otherwise return real `404`s.
- Generated audit files are not publicly served from the generated SEO root.

No codex route fix was implemented in this pass because the current split
between interactive `/codex` and generated `/encyclopedia/...` pages is
intentional and tested.

## Remaining Risks

- `ROUTE-003` remains a future browser-level smoke candidate if routing
  regressions recur; current Java and Vitest coverage is considered enough for
  this cleanup batch.
- `ROUTE-004` remains a Quest Explorer product behavior review, not an SEO
  backend blocker.

## Jira Tickets

### ROUTE-001: Canonicalize Quest Deep-Link Contract

Decide whether `/quests/{entryKey}` or `/quests?quest={entryKey}` is canonical.
Recommendation: make `/quests/{entryKey}` canonical for shareable quest pages
and keep `?quest=` as backwards-compatible input.

Acceptance:
- Document canonical route choice.
- Keep old route shape working or add redirects deliberately.
- Tests cover canonical path, query fallback, and mode/debug query preservation.

Status: done for this batch. `/quests/{entryKey}` is documented as canonical,
`/quests?quest={entryKey}` remains backwards-compatible, and Java/Vitest tests
cover the route shapes and query preservation.

### ROUTE-002: Add Backend/Frontend Route Contract Matrix

Create one shared documented matrix for public routes and their owner:
SPA shell, generated SEO page, legacy redirect, API, or hard `404`.

Acceptance:
- Covers `/tech`, `/units`, `/codex`, `/quests`, `/quests/{entryKey}`,
  `/encyclopedia`, `/encyclopedia/{kind}`, `/encyclopedia/{kind}/{slug}`,
  legacy `/tech/{slug}` and `/units/{slug}`, and admin routes.
- Java and Vitest tests reference the same expected contract where practical.

Status: done. See `docs/frontend/public-route-contract.md`.

### ROUTE-003: Add Quest Deep-Link Browser Smoke

Add a Playwright or browser-level smoke for production-style routing:
open `/quests/{entryKey}?mode=strategy`, verify the React app hydrates, no
static placeholder remains, and the selected quest is visible.

Acceptance:
- Runs against a built app served by Spring or equivalent production server.
- Fails if `/quests/{entryKey}` returns a static shell without hydration.

Status: pragmatic skip for now. Current backend route tests and frontend route
tree tests cover the incident path without adding browser automation to this
batch.

### ROUTE-004: Review Quest Automatic Navigation Behavior

Review automatic route replacement when selected quest is hidden by filters,
unresolved, or replaced by fallback selection.

Acceptance:
- Tests distinguish user-initiated navigation from passive fallback replacement.
- Missing quest route displays a useful error when appropriate instead of
  silently navigating away unless the fallback behavior is explicitly desired.

Status: deferred. This is Quest Explorer product behavior, not an SEO routing
blocker.

### ROUTE-005: Keep Codex SEO Routing Split Explicit

Document and test the intended split:
interactive codex is `/codex`; crawlable generated codex/encyclopedia pages are
`/encyclopedia/...`.

Acceptance:
- Route matrix states `/codex/{entryKey}` is not currently a public route.
- `/codex?entry={entryKey}` remains the frontend deep-link contract.
- Generated `/encyclopedia/...` routes stay backend-owned and do not fall back to
  the SPA when missing.

Status: done. The public route contract and backend tests pin this split.
