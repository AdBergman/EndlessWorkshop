# Frontend React Style Guide

Guidance for humans and AI agents working on the EWShop React/Vite frontend.
This is guidance, not automated lint enforcement.

## Core Rules

- Prefer small, behavior-preserving changes over broad rewrites.
- Preserve route behavior, query params, deep links, and API contracts.
- Prefer existing stores, selectors, helpers, components, and tests before adding new abstractions.
- Use product/domain names over generic names like `Panel`, `Renderer`, `Item`, or `data`.
- Keep debug and diagnostic UI opt-in or visually secondary.

## Ownership

- Pages orchestrate routes, query params, store selection, local interaction state, and feature composition.
- Feature helpers under `frontend/src/features/<feature>/` own pure product derivation and view-model building.
- Presentational components render derived props and raise product actions.
- Hooks own reusable stateful React/browser lifecycle behavior.
- Zustand stores own canonical cross-page state, fetched datasets, normalized lookup maps, and route-addressable selected entities.
- CSS stays feature-scoped with stable prefixes and explicit state classes such as `is-selected` or `is-active`.

## Route Hydration

- Data-backed routes must load the datasets they render on mount.
- Do not rely on `GameDataProvider`, route chunk warming, or previous navigation as the only source of data.
- Stores should dedupe loaded and in-flight API calls.
- `GameDataProvider` may warm shared datasets and handle saved-build/share orchestration.
- `routeLoaders.ts` preloads lazy JS chunks only; it must not fetch backend data.
- Direct links should win over default UI state when the URL clearly identifies an entity, such as a quest selecting its major faction.
- Add a first-mount/direct-link test for routes that render backend data.

## State

- Keep `GameDataProvider` orchestration-only.
- Keep interactive/domain state store-native unless it is truly page-local.
- Good page-local state: active tab, transient hover/focus, expanded panels, scroll-active segment, reader choices, debug toggles.
- Do not duplicate lookup state in pages when a canonical store already owns it.
- Do not fetch related stores just because DTO keys exist; fetch only what the UI intentionally renders.

## Tests

- Test visible user behavior and route/store state that defines the product contract.
- Prefer route hydration, direct-link, back/forward, and API failure tests around high-risk flows.
- Avoid brittle assertions on DOM depth, private helpers, or repeated text uniqueness.
- Keep large fixtures and repeated render setup in named `testUtils` modules.
- Split large page/component specs by user-facing behavior area when they become hard to review.

## Refactoring

- Refactor only when it reduces risk, removes real duplication, or clarifies ownership.
- Extract pure helpers for repeated product derivation.
- Extract components when the child has a clear product concept.
- Extract hooks for reusable lifecycle behavior.
- Do not split files purely to satisfy line counts.
- Do not introduce generic frameworks until two real product surfaces need the same contract.
- During refactors, keep routes, query params, debug tooling, store ownership, copy, and layout stable unless the task explicitly changes them.

## Review Signals

- Review page files that mix routing, domain derivation, rendering, debug formatting, and local state.
- Review helpers or components that are hard to test without rendering the whole page.
- Review test files once fixtures, payloads, and setup obscure the behavior under test.
- Treat file length as a signal, not a rule.

## Known High-Risk Areas

- Quest Explorer: route/deep-link hydration, Strategy/Lore path state, progression derivation, debug panels, and large fixtures.
- Tech: share hydration, selected-faction and selected-tech synchronization, image/background readiness.
- App startup: `GameDataProvider`, route chunk warming, and first navigation timing.
- Tooltips: timing, hover/focus behavior, and cross-route reuse.

For Quest semantic work, use `docs/quest_explorer_canonical_semantics_v1.md` as the authority.
