# EWShop Frontend

EWShop's frontend is a Vite, React, TypeScript application. The current post-Zustand architecture keeps interactive state in domain stores and leaves `GameDataProvider` as an orchestration boundary for startup, saved builds, and share hydration.

## Scripts

Run commands from this `frontend` directory.

```sh
npm start
```

Starts the Vite dev server.

```sh
npm test -- --run
```

Runs the Vitest test suite once. Narrow runs can pass file or test-name filters, for example:

```sh
npm test -- --run entityRef descriptionLine
```

```sh
npx tsc --noEmit --project tsconfig.json
```

Runs the TypeScript compiler without emitting files.

```sh
npm run build
```

Builds the production app into `dist`.

## Architecture Snapshot

- Vite owns local development and production bundling.
- Zustand stores own domain state for techs, planning, faction selection, codex entries, districts, improvements, units, end-game reports, and empire stats views.
- `GameDataProvider` remains a compatibility provider for app orchestration only: startup loads, saved-build commands, share hydration, URL replacement after share load, and `isProcessingSharedBuild`.
- `src/context/appOrchestration.ts` exposes narrow hooks over the provider: `useAppOrchestration`, `useShareProcessingGate`, and `useSavedTechBuildCommands`.
- `src/lib/entityRef/entityRef.ts` contains the pure `{ kind, key }` identity foundation. It is intentionally not wired into runtime UI resolution yet.
- `src/lib/descriptionLine/descriptionLineRenderer.tsx` contains the pure description-line AST parser behind the existing renderer, stripping, and token-audit APIs.

The active architecture roadmap lives at [docs/architecture/2026-05-zustand-next-wave.md](docs/architecture/2026-05-zustand-next-wave.md).

## Guardrails

- Do not move share hydration, startup sequencing, URL replacement, tooltip timing, or route synchronization as part of architecture cleanup.
- Do not reintroduce broad entity maps or selected interaction state to `GameDataContextType`.
- Keep entity refs and description AST parsing pure until the codex/domain convergence slice has explicit tests around compatibility behavior.
