# Frontend Testing Strategy

Status: active

EWShop does not target 100% frontend coverage. Tests should protect behavior that would be costly or easy to break: route state, store ownership, backend DTO adaptation, product derivation, and high-risk visual/interaction regressions.

## Test Shape

- Prefer pure helper tests for product rules, sorting/grouping, semantic classification, and DTO-to-view derivation.
- Prefer store tests for normalization, duplicate handling, blank-key rejection, loading/invalidation, and lookup behavior.
- Use component/page tests for user-visible behavior, route/deep-link state, and feature workflows.
- Keep architecture guard tests for high-risk ownership boundaries, but avoid exact source-shape assertions unless the source convention itself is the contract.
- Do not add browser automation as a default requirement; use the smoke checklist for route-sensitive or visual changes.

## AI-Assisted Changes

AI-generated frontend changes need explicit guardrails because plausible code can still break route chunks, CSS token usage, layout fit, or store ownership.

- Routing, lazy routes, share/deep-link hydration, provider orchestration, stores, and CSS token changes need targeted tests or a clear existing test that covers the behavior.
- Visual-only changes need a browser smoke note and screenshot when the change affects cards, page layout, navigation, responsive fit, or icon rendering.
- Large AI refactors should be behavior-preserving first. Run tests after extraction, then make product or visual changes in a separate slice.
- If a guard test fails, decide whether it caught real ownership drift or only old implementation coupling before changing the test.

## Review Heuristic

A useful frontend test should answer at least one question:

- Would a user notice if this broke?
- Would this catch a backend DTO/contract drift before the UI silently degrades?
- Would this stop route, store, or provider ownership from slipping back into a risky shape?
- Would this make an AI-generated change safer to review?

Tests that only lock incidental DOM depth, private variable names, or CSS structure should be rewritten toward behavior or removed.
