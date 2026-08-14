# EWShop Frontend

Vite + React + TypeScript frontend for EWShop.

## Requirements

- Node.js >=24.0.0 and <25, as declared by `package.json`.
- npm 11.6.0, as declared by `packageManager`.

## Commands

Run from `frontend/`:

```sh
npm start
npm test -- --run
npx tsc --noEmit --project tsconfig.json
npm run build
```

## Architecture

- Zustand stores own domain and interactive state.
- `GameDataProvider` is orchestration-only for startup loading, saved builds, share hydration, URL replacement after share load, and the share-processing gate.
- Route pages are lazy-loaded from `App.tsx`; keep route behavior, query params, redirects, and SEO wrappers stable.
- Shared pure helpers live under `src/lib`, `src/utils`, and `src/stores/utils`.
- Backend DTO usage should stay aligned with `src/types`, `src/api/apiClient.ts`, stores, and rendering code.

## Structure

- `src/api`: HTTP client contracts.
- `src/components`: feature UI and reusable components.
- `src/context`: app orchestration boundary.
- `src/hooks`: shared React hooks.
- `src/lib`: pure domain/helper foundations.
- `src/pages`: route-level pages.
- `src/stores`: Zustand stores and store utilities.
- `src/types`: frontend DTO/domain types.
- `src/utils`: cross-feature utilities.

## Guardrails

Do not casually refactor share hydration, route/deep-link hydration, startup ordering, tooltip timing, or `GameDataProvider`/`App` orchestration timing.

Prefer small, tested changes that follow existing stores, selectors, helpers, and route semantics.

For deeper architecture context, see
`docs/frontend/frontend-architecture-guidelines.md`,
`docs/frontend/frontend-testing-strategy.md`, and
`docs/frontend/frontend-refactor-backlog.md`.
