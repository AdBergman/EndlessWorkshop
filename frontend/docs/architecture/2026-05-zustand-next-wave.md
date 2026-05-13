# EWShop Frontend Architecture Next Wave

Date: 2026-05-12

## Current Position

The Zustand migration has reduced `GameDataContext` from competing application state ownership to a compatibility and orchestration boundary. Interactive state now lives in domain stores:

- `techStore`, `techPlannerStore`, and `factionSelectionStore` own tech data, selected tech keys, and faction selection.
- `codexStore`, `districtStore`, `improvementStore`, and `unitStore` own normalized read models.
- `endGameReportStore` and `empireStatsViewStore` own report and report-view state.

`GameDataProvider` still coordinates startup loads, saved-build creation/loading, share hydration, URL replacement after share load, and the global `isProcessingSharedBuild` gate. That remaining role is orchestration, not state ownership.

The first pure convergence foundations are now in place:

- `src/lib/entityRef/entityRef.ts` defines typed `{ kind, key }` identity helpers, including encoded codex identities.
- `src/lib/descriptionLine/descriptionLineRenderer.tsx` parses description lines into an AST behind the existing rendering, stripping, and token-audit APIs.

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
    getSavedBuild: (uuid: string) => Promise<SavedTechBuild>;
};
```

Do not rename or reshape this provider in the same slice as share/startup behavior changes. The narrow `appOrchestration` facade is already in place; future cleanup should migrate any remaining direct `useGameData` access only when it does not alter lifecycle behavior.

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
    | "codex"
    | "ability"
    | "hero"
    | "population";

type EntityRef<K extends EntityKind = EntityKind> = {
    kind: K;
    key: string;
};
```

This starts as pure library code, not a new global store. The first version provides:

- `normalizeEntityRef(ref)`.
- `entityRefId(ref)` for stable map keys.
- `parseEntityRefId(id)` for round-tripping stable IDs.
- Adapter helpers from current domains:
  - tech: `{ kind: "tech", key: tech.techKey }`
  - unit: `{ kind: "unit", key: unit.unitKey }`
  - district: `{ kind: "district", key: district.districtKey }`
  - improvement: `{ kind: "improvement", key: improvement.improvementKey }`
  - codex: `{ kind: "codex", key: codexEntityKey(exportKind, entryKey) }`
  - ability, hero, and population string-key adapters.

Important codex nuance: `codexStore` already has `entriesByKindKey`, which is the right semantic model. `entriesByKey` is convenient but ambiguous when different export kinds share an `entryKey`. Long term, codex references should move from raw `referenceKeys: string[]` to typed references or a resolver that can carry kind hints.

Recommended sequence:

1. Add pure `entityRef` helpers and tests. Done in `src/lib/entityRef/entityRef.ts`.
2. Add a pure codex reference resolver adapter that can accept either raw `referenceKeys` or typed codex refs while preserving current raw-key behavior. Done in `src/lib/codex/codexRefs.ts`.
3. Use that adapter in codex related-entry resolution behind tests. Done for codex store and codex page related-entry resolution.
4. Add pure codex reference diagnostics that classify resolver outcomes without rendering or auto-fixing missing imported domains. Done in `src/lib/codex/codexReferenceDiagnostics.ts`.
5. Add a pure developer-facing diagnostics report that combines reference diagnostics and descriptor/token diagnostics. Done in `src/lib/codex/codexDiagnosticsReport.ts`.
6. Move tech unlock refs onto entity refs at the UI adapter boundary.
7. Only then consider a composed `entityGraph` selector/hook.

Implementation note: codex refs keep the base `{ kind, key }` shape, but their key is an encoded `exportKind + entryKey` identity. This preserves `entriesByKindKey` semantics and avoids treating raw codex entry keys as globally unique.

Reference diagnostics model:

- `resolved-typed-ref`: a typed codex reference or encoded codex key resolves through `entriesByKindKey`.
- `raw-fallback-ref`: a raw `referenceKeys` value resolves through legacy `entriesByKey`; ambiguous raw keys are flagged rather than corrected.
- `unresolved-ref`: a codex-shaped reference or raw key cannot be resolved.
- `unresolved-imported-domain-ref`: a reference looks like an imported tech/unit/district/improvement/ability/hero/population domain key, but no codex entry exists for it.
- `malformed-ref`: an empty, invalid-shaped, or malformed encoded reference.

Imported-domain gaps and unresolved icon/entity-like descriptor tokens should remain diagnostics-only until exporter support and UI semantics are designed explicitly.

Diagnostics report model:

- `createCodexDiagnosticsReport(entries)` builds grouped reference and descriptor summaries without touching stores or rendering.
- `formatCodexDiagnosticsReport(report)` emits deterministic developer-facing text.
- Reports can group diagnostics globally and by `exportKind`, and entry details retain duplicate, raw fallback, imported-domain, and malformed metadata.
- The report is not an in-app UI surface; it is a tool for exporter/import gap analysis before runtime entity-link semantics exist.

## Descriptor And Token AST Proposal

The renderer now parses bracket markers into an AST before rendering. Descriptor behavior remains split by responsibility, but render, preview stripping, and token audit all have a shared pure parser available.

Current parsed descriptor AST:

```ts
type DescriptionNode =
    | { type: "text"; value: string; index: number }
    | { type: "token"; raw: string; token: string; index: number; style?: TokenStyle };

type DescriptionLineAst = {
    source: string;
    nodes: DescriptionNode[];
};
```

First-stage API, implemented behind the compatibility helpers:

- `parseDescriptionLine(line): DescriptionLineAst`
- `stripDescriptionAst(ast): string`
- `getDescriptionTokens(ast): TokenMatch[]`
- `renderDescriptionAst(ast, options): ReactNode`

Migration rule: keep `renderDescriptionLine(line)` as the public compatibility API. Codex detail panes, table views, previews, and token audit can now converge on the parser without touching visual rendering in the same slice.

Do not add entity-link rendering in the first parser slice. Token styling and entity resolution should stay separate until the AST contract is stable.

Implementation note: the first parser slice is pure and sits behind the existing description-line helpers. It preserves renderer compatibility by treating unmatched brackets as text, stripping all matched bracket tokens from previews, and exposing token offsets for future descriptor diagnostics.

## Pure Foundation API Audit

`entityRef` findings:

- The `{ kind, key }` shape is stable and intentionally small.
- `entityRefId` and `parseEntityRefId` encode keys with `encodeURIComponent`, so domain keys can safely contain spaces, slashes, and colons.
- Codex identity correctly normalizes `exportKind` to lowercase while preserving `entryKey` casing.
- The main naming risk is `entriesByKey` in codex code, not `entityRef`: raw entry keys are still ambiguous across export kinds.

Description AST findings:

- `DescriptionNode.index` is useful for diagnostics and token audit output; keep it.
- `DescriptionTokenNode.style` keeps current rendering cheap, but future entity-link resolution should not overload `style`; add a separate semantic field only when a typed resolver exists.
- `TOKEN_RE` preserves current bracket parsing semantics. Do not broaden it in the same slice as codex/domain convergence.

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

- `dist/assets/index-GHeMKpms.js`: 931.11 kB minified, 285.87 kB gzip.
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

- `GameDataContextType` has been shrunk to orchestration commands and share-processing state; do not re-add entity maps or selected interaction state.
- `AppLayout` and `TopContainer` now read the share-processing gate through `useShareProcessingGate`; keep app-shell gating on that narrow facade.
- `SpreadSheetView` now reads saved-build creation through `useSavedTechBuildCommands`; keep saved-build commands behind that narrow facade.
- `UnitEvolutionExplorer` was extracted to direct `factionSelectionStore` reads; keep it from drifting back into context.
- Codex raw `referenceKeys` are ambiguous without kind semantics.
- Description token parsing now has one parser foundation, but runtime UI still treats tokens as presentation markers rather than semantic entity refs.
- Bundle size remains a future concern, but code splitting should stay separate from hydration and routing cleanup.

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

Completed context shrink slice:

1. Removed entity map adapters and selected faction/tech fields from `GameDataContextType`.
2. Kept `GameDataProvider` startup loads, share hydration, URL replacement, and saved-build commands behavior intact.
3. Updated provider and route tests to read selected/entity state from stores instead of the broad context adapter.

Completed pure foundation slices:

1. Added pure `entityRef` helpers and tests without runtime wiring.
2. Added the descriptor/token AST parser behind existing renderer APIs with tests.
3. Replaced stale frontend documentation with the current Vite/Zustand architecture snapshot.
4. Added pure codex reference resolving and diagnostics without entity-link rendering.
5. Added a pure codex diagnostics report layer that combines reference and descriptor/token diagnostics.
6. Added a dev/admin-only diagnostics report download hook that reuses the existing codex audit export pattern without public UI.

Next bounded slice:

1. Use diagnostics report output to prioritize exporter/import gaps before any runtime entity-link rendering is designed.
2. Decide whether unresolved descriptor/icon tokens need their own admin report before introducing any codex/domain link rendering.
3. Keep the next slice non-rendering unless a separate design pass approves UI exposure.
