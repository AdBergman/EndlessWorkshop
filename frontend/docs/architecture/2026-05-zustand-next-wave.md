# EWShop Frontend Architecture Next Wave

Date: 2026-05-12

## Current Position

The Zustand migration has reduced `GameDataContext` from competing application state ownership to a compatibility and orchestration boundary. Interactive state now lives in domain stores:

- `techStore`, `techPlannerStore`, and `factionSelectionStore` own tech data, selected tech keys, and faction selection.
- `codexStore`, `districtStore`, `improvementStore`, and `unitStore` own normalized read models.
- `endGameReportStore` and `empireStatsViewStore` own report and report-view state.

`GameDataProvider` still coordinates startup loads, saved-build creation/loading, share hydration, URL replacement after share load, and the global `isProcessingSharedBuild` gate. That remaining role is orchestration, not state ownership.

## Recommended Final Role For `GameDataContext`

Keep `GameDataContext` as a temporary compatibility island and converge it toward an `AppOrchestrationProvider`.

Final responsibilities should be:

- Application startup data bootstrapping.
- Share-build hydration and its processing gate.
- Saved-build command boundary.
- Route replacement after share hydration.
- Cross-store orchestration that must happen atomically from the app shell.

Final non-responsibilities should be:

- Entity collections.
- Selected tech state.
- Selected faction state.
- Read-model lookup helpers.
- Feature-local URL state outside the share/deep-link startup lifecycle.

Target API shape:

```ts
type AppOrchestrationContextValue = {
    isProcessingSharedBuild: boolean;
    createSavedTechBuild: (name: string, faction: FactionInfo, techIds: string[]) => Promise<SavedTechBuild>;
    hydrateSavedTechBuild: (uuid: string) => Promise<SavedTechBuild>;
};
```

Do not rename or reshape this provider in the same slice as share/startup behavior changes. First add narrower hooks over the existing provider; then migrate consumers; then rename once the public surface is already small.

## Unit Evolution Explorer Decision

Extract `UnitEvolutionExplorer` from `GameDataContext`, but do it as a bounded compatibility cleanup, not as a lifecycle rewrite.

Reasoning:

- It already reads units from `unitStore`.
- Its only context dependency is selected faction and setter access.
- Its URL hydration loop is feature-local and should remain local to `/units`.
- Keeping it on `GameDataContext` makes the provider appear to own unit feature state when it no longer does.

Safe extraction slice:

- Replace `useContext(GameDataContext)` with `useFactionSelectionStore(selectSelectedFaction)` and `useFactionSelectionStore(selectSetSelectedFaction)`.
- Preserve the existing URL refs, effect order, `setParams(..., { replace: true })`, minor-unit toggle behavior, and selection defaults.
- Update tests to wrap the component with only router/store setup, not `GameDataProvider`, unless a test is explicitly covering app-shell share gating.

Do not combine this with changes to `TopContainer`, share hydration, or unit route semantics.

## Canonical Entity Graph Proposal

Introduce a small typed entity-reference layer based on `{ kind, key }` identity semantics:

```ts
type EntityKind =
    | "tech"
    | "unit"
    | "district"
    | "improvement"
    | "codex";

type EntityRef<K extends EntityKind = EntityKind> = {
    kind: K;
    key: string;
};
```

This should start as pure library code, not a new global store. The first version should provide:

- `normalizeEntityRef(ref)`.
- `entityRefId(ref)` for stable map keys.
- `resolveEntityRef(ref, graph)` where `graph` is assembled from existing store snapshots.
- Adapter helpers from current domains:
  - tech: `{ kind: "tech", key: tech.techKey }`
  - unit: `{ kind: "unit", key: unit.unitKey }`
  - district: `{ kind: "district", key: district.districtKey }`
  - improvement: `{ kind: "improvement", key: improvement.improvementKey }`
  - codex: `{ kind: "codex", key: `${exportKind}:${entryKey}` }` or a nested `{ kind, key }` codex sub-identity if the backend preserves duplicate entry keys across export kinds.

Important codex nuance: `codexStore` already has `entriesByKindKey`, which is the right semantic model. `entriesByKey` is convenient but ambiguous when different export kinds share an `entryKey`. Long term, codex references should move from raw `referenceKeys: string[]` to typed references or a resolver that can carry kind hints.

Recommended sequence:

1. Add pure `entityRef` helpers and tests. Done in `src/lib/entityRef/entityRef.ts`.
2. Use them in codex related-entry resolution while preserving existing raw-key behavior.
3. Move tech unlock refs onto entity refs at the UI adapter boundary.
4. Only then consider a composed `entityGraph` selector/hook.

Implementation note: codex refs keep the base `{ kind, key }` shape, but their key is an encoded `exportKind + entryKey` identity. This preserves `entriesByKindKey` semantics and avoids treating raw codex entry keys as globally unique.

## Descriptor And Token AST Proposal

The current renderer tokenizes bracket markers during render. That is good enough for today, but descriptor logic is split between rendering, preview stripping, and token audit.

Move toward a parsed descriptor AST:

```ts
type DescriptionNode =
    | { type: "text"; value: string }
    | { type: "token"; raw: string; token: string; style?: TokenStyle };

type DescriptionLineAst = {
    source: string;
    nodes: DescriptionNode[];
};
```

First-stage API:

- `parseDescriptionLine(line): DescriptionLineAst`
- `stripDescriptionAst(ast): string`
- `getDescriptionTokens(ast): TokenMatch[]`
- `renderDescriptionAst(ast, options): ReactNode`

Migration rule: keep `renderDescriptionLine(line)` as the public compatibility API and implement it through the parser. That lets codex detail panes, table views, previews, and token audit converge without touching call sites in one sweep.

Do not add entity-link rendering in the first parser slice. Token styling and entity resolution should stay separate until the AST contract is stable.

## Hydration And Startup Risk Matrix

| Surface | Current owner | Risk | Recommendation |
| --- | --- | --- | --- |
| Share hydration | `GameDataProvider` | High | Freeze behavior; only wrap behind narrower orchestration hooks. |
| URL replacement after share load | `GameDataProvider` | High | Do not alter timing or replace semantics in cleanup slices. |
| Tech deep-link hydration | `useTechRouteHydration` | High | Keep feature-local; avoid merging with share hydration. |
| Unit URL hydration | `UnitEvolutionExplorer` | Medium | Extract context dependency only; preserve effect order and refs. |
| Startup data loads | `GameDataProvider` plus store idempotence | Medium | Eventually move to `AppDataBootstrapper`; do not change during share work. |
| Tooltip hover timing | tooltip components and hover wrappers | High | Keep outside architecture cleanup unless addressing a specific bug. |
| Route synchronization | React Router hooks and feature effects | High | Avoid global router orchestration abstractions for now. |

## React `act(...)` Warning Assessment

Current test runs pass, with many remaining `act(...)` warnings. The warnings are mostly test async hygiene rather than evidence of runtime lifecycle instability:

- `CodexPage` and `CodexSearch`: effects and router updates continue after immediate assertions.
- `TechTooltip`, `UnitTooltip`, `HoverableItem`, and `UnlockLine`: hover/tooltip state updates fire after synchronous render assertions.
- `TechTree.interaction`: Zustand store updates plus UI assertions need `userEvent`/store assertions to settle.
- `SpreadSheetView`: derived state and toolbar effects update after render.

Recommended cleanup:

- Prefer `findBy*`, `waitFor`, or user-event awaited interactions around components with effects.
- Wrap direct store mutations that are intended to drive mounted components in React Testing Library `act`.
- Avoid changing production effect timing solely to silence warnings.

The stale `ModsPage.test.tsx` fixture that assumed `BulkTrade` had no screenshot was corrected by mocking that item as screenshot-less inside the test.

## Bundle And Code-Splitting Assessment

Current production build emits one large application chunk:

- `dist/assets/index-BcQZr5DN.js`: 931.65 kB minified, 286.01 kB gzip.
- Vite warns because the minified chunk exceeds 500 kB.

Likely contributors:

- Route-level features are all statically imported in `App.tsx`.
- `recharts` is used only by summary/report views.
- `framer-motion` is used by units, mods, and admin import rows.
- `react-icons/fa` is used by unit cards.
- `react-csv` is used only by spreadsheet export.

Recommended future slices:

1. Route-level `React.lazy` for `/summary`, `/units`, `/codex`, `/mods`, and `/admin/import`.
2. Defer `recharts` behind the summary route first; this should have the highest chunk impact.
3. Consider lazy-loading the spreadsheet view if the tech tree should stay especially lean.
4. Add manual chunks only after route-level lazy loading, if bundle shape is still poor.

Do not combine route-level lazy loading with hydration or deep-link behavior changes. It should be verified with browser navigation for `/tech?faction=...&tech=...`, `/units?...`, `/codex?...`, and share links.

## Architecture Smells To Track

- `GameDataContextType` still exposes entity maps and selected state that should now be store-native.
- `AppLayout` and `TopContainer` now read the share-processing gate through `useShareProcessingGate`; keep app-shell gating on that narrow facade.
- `SpreadSheetView` now reads saved-build creation through `useSavedTechBuildCommands`; keep saved-build commands behind that narrow facade.
- `UnitEvolutionExplorer` was extracted to direct `factionSelectionStore` reads; keep it from drifting back into context.
- Codex raw `referenceKeys` are ambiguous without kind semantics.
- Description token parsing is repeated conceptually across render, strip, preview, and audit.
- `frontend/README.md` still describes Create React App even though the app now uses Vite.

## Recommended Next Bounded Implementation Slice

Completed low-risk slice:

1. Extracted `UnitEvolutionExplorer` from `GameDataContext` to `factionSelectionStore`.
2. Added a migration-scope test asserting `UnitEvolutionExplorer.tsx` no longer imports `GameDataContext`.
3. Left URL hydration, minor toggle behavior, and router replacement untouched.

Completed orchestration facade slice:

1. Added `useAppOrchestration`, `useShareProcessingGate`, and `useSavedTechBuildCommands` over the existing provider.
2. Moved `AppLayout` and `TopContainer` to the narrow share-processing gate.
3. Moved `SpreadSheetView` to the narrow saved-build command hook.
4. Left share hydration, startup ordering, URL replacement, and saved-build semantics unchanged.

Next bounded slice:

1. Move remaining app-shell probes/tests that only need selected tech/faction state to store-native selectors.
2. Add a pure `{ kind, key }` entity-reference helper library with tests.
3. Shrink `GameDataContextType` only after compatibility tests no longer need selected/entity fields.
