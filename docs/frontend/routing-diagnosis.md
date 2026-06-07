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

- Query-style quest deep links (`/quests?quest=...`) and path-style quest deep
  links (`/quests/...`) both work, but there is no written canonical product
  decision about whether both should remain permanent.
- React route coverage is good at the page level, but backend/frontend route
  contract coverage is split across Java and Vitest tests.
- Generated SEO route behavior is backend-owned; SPA routes and generated SEO
  routes should not drift into overlapping ownership.

## Jira Tickets

### ROUTE-001: Canonicalize Quest Deep-Link Contract

Decide whether `/quests/{entryKey}` or `/quests?quest={entryKey}` is canonical.
Recommendation: make `/quests/{entryKey}` canonical for shareable quest pages
and keep `?quest=` as backwards-compatible input.

Acceptance:
- Document canonical route choice.
- Keep old route shape working or add redirects deliberately.
- Tests cover canonical path, query fallback, and mode/debug query preservation.

### ROUTE-002: Add Backend/Frontend Route Contract Matrix

Create one shared documented matrix for public routes and their owner:
SPA shell, generated SEO page, legacy redirect, API, or hard `404`.

Acceptance:
- Covers `/tech`, `/units`, `/codex`, `/quests`, `/quests/{entryKey}`,
  `/encyclopedia`, `/encyclopedia/{kind}`, `/encyclopedia/{kind}/{slug}`,
  legacy `/tech/{slug}` and `/units/{slug}`, and admin routes.
- Java and Vitest tests reference the same expected contract where practical.

### ROUTE-003: Add Quest Deep-Link Browser Smoke

Add a Playwright or browser-level smoke for production-style routing:
open `/quests/{entryKey}?mode=strategy`, verify the React app hydrates, no
static placeholder remains, and the selected quest is visible.

Acceptance:
- Runs against a built app served by Spring or equivalent production server.
- Fails if `/quests/{entryKey}` returns a static shell without hydration.

### ROUTE-004: Review Quest Automatic Navigation Behavior

Review automatic route replacement when selected quest is hidden by filters,
unresolved, or replaced by fallback selection.

Acceptance:
- Tests distinguish user-initiated navigation from passive fallback replacement.
- Missing quest route displays a useful error when appropriate instead of
  silently navigating away unless the fallback behavior is explicitly desired.

### ROUTE-005: Keep Codex SEO Routing Split Explicit

Document and test the intended split:
interactive codex is `/codex`; crawlable generated codex/encyclopedia pages are
`/encyclopedia/...`.

Acceptance:
- Route matrix states `/codex/{entryKey}` is not currently a public route.
- `/codex?entry={entryKey}` remains the frontend deep-link contract.
- Generated `/encyclopedia/...` routes stay backend-owned and do not fall back to
  the SPA when missing.
