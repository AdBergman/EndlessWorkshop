# EWShop Frontend Refactor Backlog

Status: ACTIVE
Created: 2026-05-25
Scope: React + TypeScript frontend only
Reference: `docs/frontend/frontend-architecture-guidelines.md`

Quest Explorer semantic reference: future Quest Explorer refactors should use
`docs/quest_explorer_canonical_semantics_v1.md` as the semantic authority and
`docs/quest-explorer/README.md` for current documentation status.
Existing names such as `questPathFlow` are legacy implementation vocabulary and
should not trigger behavior changes by themselves.

## Audit Summary

The frontend is generally healthy outside a few concentrated hotspots. The highest-value work is not a rewrite; it is staged, behavior-preserving extraction around Quest Explorer and one admin import surface.

Largest current frontend files reviewed:

| File | Lines | Notes |
| --- | ---: | --- |
| `frontend/src/pages/QuestExplorerPage.test.tsx` | ~3208 | Very large integration test file with valuable coverage; reusable builders are extracted, but scenario fixtures remain intentionally local. |
| `frontend/src/components/Quests/QuestExplorer.css` | ~2552 | Large feature stylesheet covering rail, Strategy, Lore, debug, and responsive states. Crosses the CSS hard split threshold, but should not be split as style churn. |
| `frontend/src/pages/QuestExplorerPage.tsx` | ~1344 | Much smaller after reader-scope extraction, but still above the page hard review threshold. It now mostly owns route/store/mode/path orchestration, scroll-follow, debug wiring, and Strategy shell composition. |
| `frontend/src/features/quests/questPathFlow.ts` | ~1336 | Important pure quest reader derivation; broad enough to split later by concern, but no longer mixed with display-label helpers. |
| `frontend/src/pages/CodexPage.css` | ~1199 | CSS review threshold; defer until active Codex visual work. |
| `frontend/src/pages/QuestExplorerPage.productContinuity.test.tsx` | ~949 | Valuable fixture tests; could be consolidated with shared fixture builders. |
| `frontend/src/components/AdminImport/ImportModuleRow.tsx` | ~634 | Reduced by helper/table/result extraction. Still slightly above the component hard review threshold, but now mostly owns row orchestration and import execution. |
| `frontend/src/features/quests/questStrategyDossier.ts` | ~834 | Good pure view-model extraction; above helper review threshold after Strategy Continuity Strip work, but still coherent enough to keep until a planned split. |
| `frontend/src/components/Quests/LoreReader.tsx` | ~527 | Above component review threshold; justified as one cohesive Lore reader surface with named internal product concepts. |
| `frontend/src/features/quests/questReaderScopes.ts` | ~300 | Focused pure helper for Lore/Strategy reader scope derivation. |
| `frontend/src/features/quests/questChoicePresentation.ts` | ~90 | Focused pure helper for normal/debug choice presentation grouping. |
| `frontend/src/features/quests/questDisplay.ts` | ~56 | Shared Quest display wording helpers. |

Primary finding: Quest Explorer now follows the intended boundaries reasonably well. The page is still large, but it has shifted toward orchestration while pure derivation, reader scope derivation, choice presentation grouping, Strategy rendering, Lore rendering, debug rendering, display wording, and store normalization have moved out. The remaining Quest Explorer work is planned boundary work, not emergency cleanup.

## Light Frontend Review Refresh: 2026-06-08

Status: active review notes after routing, SEO, favicon, and ESLint hardening.

The frontend remains healthy. The main risk is not broken architecture; it is concentrated product complexity in a few route/state-heavy surfaces. Keep future work bounded and test-first around copied URLs, route hydration, and Quest/Codex behavior.

| Ticket | Status | Recommendation |
| --- | --- | --- |
| FE-ARCH-001 Route hydration regression matrix | `safe now` | Keep route/component ownership covered by tests. Added a route contract guard for copyable route params and data-backed route owners. |
| FE-ARCH-002 Split Quest Explorer CSS | `defer` | Added a lightweight Quest visual-structure guardrail test. Do CSS splitting only with screenshot/browser guardrails and active Quest visual work. Avoid style-only churn. |
| FE-ARCH-003 Split Quest Explorer fixtures by scenario | `defer` | Do when adding or changing adjacent Quest tests; current large fixtures are valuable regression harnesses. |
| FE-ARCH-004 Extract Codex URL/search helpers | `defer` | Do only when Codex grows again; current tests cover deep links and reset behavior. |
| FE-ARCH-005 Keep Game Summary unknown-data typing isolated | `safe now` | Remove unnecessary `any` where typed store/view-model data already exists; keep parser escape hatches local to unknown exporter JSON. |
| FE-ARCH-006 Run bundle analysis before chunk splitting | `defer` | The Vite large-chunk warning is not a release blocker. Inspect before changing imports or chunks. |
| FE-ARCH-007 Keep ESLint advisory, promote slowly | `active` | Hooks/order and clear correctness rules are errors; exhaustive deps stays warning until risky hydration code is reviewed case by case. |

## Ranking Rules

Status values:
- `safe now`: behavior-preserving and suitable for a later queued implementation goal.
- `needs product decision`: UX/product behavior must be decided first.
- `needs techlead decision`: architecture direction or module boundary should be agreed first.
- `defer`: not worth doing yet or too likely to become churn.

Only `safe now` items should be implemented by later queued goals.

## Future Audit Guidance

Future frontend audits should apply `docs/frontend/frontend-architecture-guidelines.md` as review guidance, not as mechanical line-count enforcement.

For each oversized file, report:
- current LOC
- which guideline threshold it crosses
- why the file is large
- whether the size is coherent or mixed-responsibility
- responsibility issue classification
- likely extraction candidates
- whether extraction is behavior-preserving
- tests needed before and after extraction
- recommended status: `safe now`, `needs product decision`, `needs techlead decision`, or `defer`

Responsibility issue classifications:
- page orchestration mixed with domain derivation
- presentation mixed with view-model construction
- store ownership mixed with DTO normalization or product derivation
- debug/QA tooling mixed into normal product rendering
- CSS scope/density issue
- test fixture bulk mixed with assertions
- broad pure helper with multiple domain concerns
- cohesive large file, justified for now

Line-count thresholds should be used as prompts for architectural review:

| File type | Target | Review threshold | Hard review/refactor threshold |
| --- | ---: | ---: | ---: |
| React page files | 300-500 LOC | 700 LOC | 1000 LOC unless justified |
| React component files | 200-300 LOC | 400 LOC | 600 LOC unless justified |
| Pure helper/view-model files | 300-500 LOC | 700 LOC | 1000 LOC unless justified |
| CSS files | Feature-scoped and sectioned | 1000 LOC | 1500 LOC unless intentionally centralized |

Large files should not be ranked high only because they are large. Rank by safety and payoff:
- prefer behavior-preserving extraction of coherent responsibilities
- prefer pure helper tests before risky movement
- avoid style-only churn
- avoid splitting cohesive product concepts into vague fragments
- avoid product behavior changes during refactor goals
- defer anything that needs unresolved UX, routing, store, or product decisions

## Audit Refresh: 2026-05-25

Applied threshold review after Quest Explorer extraction, Strategy/Lore redesign, and the finalized frontend architecture guidelines.

| File | LOC | Threshold | Why large | Justified? | Classification | Recommendation |
| --- | ---: | --- | --- | --- | --- | --- |
| `frontend/src/pages/QuestExplorerPage.test.tsx` | 3208 | Test bulk review | Integration scenarios, live-like payloads, reader/dossier regressions. | Mostly yes; shared builders already extracted. | test fixture bulk mixed with assertions | `defer`; only extract scenario families when adding adjacent tests. |
| `frontend/src/components/Quests/QuestExplorer.css` | 2552 | CSS hard split | One feature stylesheet for rail, Lore, Strategy, debug, responsive states. | Temporarily yes; visual polish should decide split strategy. | CSS scope/density issue | `needs techlead decision`; avoid style-only churn before polish. |
| `frontend/src/pages/QuestExplorerPage.tsx` | 1344 | Page hard review | Route/store/mode orchestration, path state, rail scroll follow, debug wiring, Strategy shell composition. | Mostly yes after component/helper extraction. | page orchestration still broad | `defer` until visual polish reveals a focused hook/component extraction. |
| `frontend/src/features/quests/questPathFlow.ts` | 1336 | Helper hard review | Identity, reveal rules, choice visibility, path flow, Lore stream. | Useful but broad. | broad pure helper with multiple domain concerns | `needs techlead decision`; split by stable domain concern only. |
| `frontend/src/pages/CodexPage.css` | 1199 | CSS review | Codex visual surface and responsive states. | Yes enough for now. | CSS scope/density issue | `defer` until active Codex visual work. |
| `frontend/src/pages/QuestExplorerPage.productContinuity.test.tsx` | 949 | Test review | Valuable product fixture diagnostics. | Yes. | cohesive large file, justified for now | `defer`; preserve as regression harness. |
| `frontend/src/components/AdminImport/ImportModuleRow.tsx` | 634 | Component hard review | Import execution, row state, remaining metadata/error/notices, row shell. | Mostly; helper/table/result rendering are now extracted. | presentation mixed with import orchestration, reduced | `defer`; re-review if active Admin Import work adds more responsibility. |
| `frontend/src/features/quests/questStrategyDossier.ts` | 834 | Helper review | Dossier model, path status, branch comparison, continuity strip. | Mostly yes; one Strategy domain surface. | broad pure helper with multiple dossier concerns | `needs techlead decision` if splitting continuity strip/status helpers. |
| `frontend/src/components/Quests/LoreReader.tsx` | 527 | Component review | Continuous Lore segment/step/choice rendering. | Yes; cohesive Lore product surface. | cohesive large file, justified for now | `defer`; avoid fragmentation before visual polish. |
| `frontend/src/components/Quests/StrategyDossier.tsx` | 474 | Component review | Strategy Dossier sections, comparison, continuity strip rendering. | Yes; cohesive Strategy product surface. | cohesive large file, justified for now | `defer`; split only if a child surface gains independent tests/behavior. |
| `frontend/src/features/quests/questReaderScopes.ts` | 300 | Helper target | Lore/Strategy reader scope derivation moved out of the page. | Yes. | cohesive focused helper | `completed 2026-05-25`; keep pure and test through Quest flows. |
| `frontend/src/features/quests/questChoicePresentation.ts` | 90 | Under target | Choice presentation grouping moved out of the page. | Yes. | cohesive focused helper | `completed 2026-05-25`; keep pure. |
| `frontend/src/features/quests/questDisplay.ts` | 56 | Under target | Shared Quest display wording and phase helpers. | Yes. | cohesive focused helper | `completed 2026-05-25`; keep display-only. |

Store ownership check:
- `frontend/src/stores/questStore.ts` is now ~233 LOC and appropriately owns fetch/cache/selection/filter state.
- Quest Explorer normalization now lives in `frontend/src/features/quests/questExplorerNormalizer.ts`, which matches the guidelines.
- No new Zustand coupling was found in Quest Explorer for this pass.

Quest Explorer verdict:
- Architecture is stable enough for visual polish.
- Remaining Quest Explorer debt is mostly planned boundary work (`questPathFlow.ts`, CSS organization), not blocking product polish.
- Graph/Continuity Map remains deferred as product work, not refactor work.

## Top 10 Refactor Items

### 1. Add Direct Unit Tests For Quest Reader And Strategy Dossier Helpers

Status: `completed 2026-05-25`

Severity: High
Risk: Low
Expected payoff: Very high
Behavior-preserving: Yes

Files affected:
- `frontend/src/features/quests/questPathFlow.ts`
- `frontend/src/features/quests/questStrategyDossier.ts`
- new `frontend/src/features/quests/questPathFlow.test.ts`
- new `frontend/src/features/quests/questStrategyDossier.test.ts`

Problem:
- `questPathFlow.ts` and `questStrategyDossier.ts` now carry core product semantics, but most assertions still flow through `QuestExplorerPage.test.tsx`.
- This makes future extraction from `QuestExplorerPage.tsx` riskier than it needs to be.

Recommended work:
- Add focused pure-helper tests for:
  - reveal metadata satisfaction
  - hidden/future choice filtering
  - projected local continuation behavior
  - Lore stream stop conditions
  - `buildStrategyPathStatus(...)` complete/chapter-exit/converges/failure/unresolved cases
  - `buildStrategyDossierModel(...)` selected semantic sequence, selected option, and marker semantics

Tests needed:
- New helper unit tests.
- Existing `QuestExplorerPage.test.tsx`.
- Product continuity fixture tests.

Why first:
- It lowers risk for every later Quest Explorer extraction.
- It is behavior-preserving.
- It gives fast feedback without rendering the whole page.

Completion notes:
- Added direct helper tests for Quest path flow reveal metadata, normal-mode hidden choice diagnostics, local step reveal timing, and Lore stream stopping.
- Added direct Strategy Dossier helper tests for terminal path status semantics and selected branch comparison details.
- Files changed:
  - `frontend/src/features/quests/questPathFlow.test.ts`
  - `frontend/src/features/quests/questStrategyDossier.test.ts`
- Validation:
  - `npm test -- --run src/features/quests/questPathFlow.test.ts src/features/quests/questStrategyDossier.test.ts` passed.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
  - `npm test -- --run` passed: 61 files, 365 tests.
- New issues discovered:
  - None. Full test output still includes the existing intentional offline-fetch stderr from `questStore.test.ts`.
- Priority changes:
  - No ranking change yet. Item #2 remains the next candidate, but should be kept as a separate reviewable fixture-only extraction.

### 2. Extract Quest Explorer Test Fixtures And Builders

Status: `completed 2026-05-25`

Severity: High
Risk: Low
Expected payoff: High
Behavior-preserving: Yes

Files affected:
- `frontend/src/pages/QuestExplorerPage.test.tsx`
- `frontend/src/pages/QuestExplorerPage.productContinuity.test.tsx`
- new `frontend/src/features/quests/testUtils/questExplorerFixtures.ts` or similar

Problem:
- `QuestExplorerPage.test.tsx` is ~3311 LOC and mixes scenario payload builders, reusable helper functions, and actual assertions.
- This slows review and makes new tests intimidating.

Recommended work:
- Extract reusable fixture builders:
  - `progressionQuestline(...)`
  - `questEntry(...)`
  - `testBranch(...)`
  - `testObjective(...)`
  - common payload fragments
- Keep scenario-specific payloads near the tests unless they are reused.

Tests needed:
- Existing Quest Explorer tests unchanged except import paths.

Completion notes:
- Extracted the reusable Quest Explorer test builders into `frontend/src/features/quests/testUtils/questExplorerFixtures.ts`.
- Kept product-continuity scenario builders local because they are fixture-specific, not shared generic builders.
- Files changed:
  - `frontend/src/features/quests/testUtils/questExplorerFixtures.ts`
  - `frontend/src/pages/QuestExplorerPage.test.tsx`
- Validation:
  - `npm test -- --run src/pages/QuestExplorerPage.test.tsx` passed: 45 tests.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
- New issues discovered:
  - None.
- Priority changes:
  - No ranking change. Item #3 remains the next candidate, with medium risk because it moves product components rather than pure test utilities.

### 3. Extract Strategy Dossier Components From QuestExplorerPage

Status: `completed 2026-05-25`

Severity: High
Risk: Medium
Expected payoff: High
Behavior-preserving: Yes

Files affected:
- `frontend/src/pages/QuestExplorerPage.tsx`
- new `frontend/src/components/Quests/StrategyDossier.tsx`
- possible new `frontend/src/components/Quests/StrategyDossierParts.tsx`

Problem:
- Strategy Dossier is now a distinct product surface, but its components still live inside the page file.
- The page owns rendering details for dossier sections, selected option summary, branch comparison cards, marker pills, and path status cards.

Recommended work:
- Move presentational Strategy components only:
  - `StrategyDossier`
  - `StrategyBranchComparison`
  - `StrategySelectedOptionSummary`
  - `StrategyPathStatusCard`
  - related small list/marker components if they are Strategy-only
- Keep state and `onChoose` orchestration in the page.
- Keep view-model derivation in `questStrategyDossier.ts`.

Tests needed:
- Existing Quest Explorer tests.
- Add component tests only if extraction changes props meaningfully.

Completion notes:
- Extracted Strategy Dossier presentational rendering into `frontend/src/components/Quests/StrategyDossier.tsx`.
- Moved the Strategy path status card and shared `InlineMetaList` with the Strategy component surface.
- Kept Strategy state, path selection, flow derivation, and `onChoose` orchestration in `QuestExplorerPage.tsx`.
- Files changed:
  - `frontend/src/components/Quests/StrategyDossier.tsx`
  - `frontend/src/pages/QuestExplorerPage.tsx`
- Validation:
  - `npm test -- --run src/pages/QuestExplorerPage.test.tsx src/features/quests/questStrategyDossier.test.ts` passed: 47 tests.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
  - `npm test -- --run` passed: 61 files, 365 tests.
- New issues discovered:
  - None. Full test output still includes the existing intentional offline-fetch stderr from `questStore.test.ts`.
- Priority changes:
  - Stop here for this pass because the requested maximum of three refactor items has been reached.
  - Item #4 remains the next candidate, but should start as a fresh Lore-only extraction slice.

### 4. Extract Lore Reader Components From QuestExplorerPage

Status: `completed 2026-05-25`

Severity: High
Risk: Medium
Expected payoff: High
Behavior-preserving: Yes

Files affected:
- `frontend/src/pages/QuestExplorerPage.tsx`
- new `frontend/src/components/Quests/LoreReader.tsx` or `LoreContinuousProgression.tsx`

Problem:
- Lore continuous reader components and lore section rendering are now large enough to stand as product concepts.
- Keeping them in the page makes Strategy work harder to review.

Recommended work:
- Move presentational Lore components:
  - `LoreContinuousProgression`
  - `LoreStep`
  - `LoreBranchMoment`
  - `LoreChoiceButton`
  - `LoreSectionList` and small line/article helpers if they remain Lore-specific
- Keep scroll-active rail state and route/store orchestration in the page until a dedicated hook is justified.

Tests needed:
- Existing Lore continuous reader tests.
- Existing Strategy/Lore path independence tests.

Completion notes:
- Extracted Lore reader rendering into `frontend/src/components/Quests/LoreReader.tsx`.
- Moved Lore opening, section list rendering, chronicle segment rendering, branch moment rendering, revealed continuation rendering, and Lore path state UI out of `QuestExplorerPage.tsx`.
- Kept route/store/mode/path state, scroll-active rail state, debug detail derivation, and lore section selection callbacks in `QuestExplorerPage.tsx`.
- Files changed:
  - `frontend/src/components/Quests/LoreReader.tsx`
  - `frontend/src/pages/QuestExplorerPage.tsx`
- Validation:
  - `npm test -- --run src/pages/QuestExplorerPage.test.tsx src/pages/QuestExplorerPage.productContinuity.test.tsx` passed: 49 tests.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
- New issues discovered:
  - None.
- Priority changes:
  - Item #5 remains the next candidate and is lower-risk than further reader extraction.

### 5. Extract Quest Progression Debug Panel And Formatting

Status: `completed 2026-05-25`

Severity: Medium
Risk: Low
Expected payoff: Medium
Behavior-preserving: Yes

Files affected:
- `frontend/src/pages/QuestExplorerPage.tsx`
- new `frontend/src/components/Quests/QuestProgressionDebugPanel.tsx`
- optional new `frontend/src/features/quests/questDebugDetails.ts`

Problem:
- Debug rendering and debug row formatting are valuable but crowd product rendering in the page.
- Debug is intentionally complete, but it should remain visually and architecturally secondary.

Recommended work:
- Move debug panel component and debug row formatting out of the page.
- Keep the raw hidden rows toggle state in the page.
- Preserve all existing labels and raw hidden-row behavior.

Tests needed:
- Existing debug tests.
- Add one focused debug component test only if props become nontrivial.

Completion notes:
- Extracted the Quest progression debug panel and debug row formatting into `frontend/src/components/Quests/QuestProgressionDebugPanel.tsx`.
- Kept raw hidden-row toggle state and active debug flow selection in `QuestExplorerPage.tsx`.
- Files changed:
  - `frontend/src/components/Quests/QuestProgressionDebugPanel.tsx`
  - `frontend/src/pages/QuestExplorerPage.tsx`
- Validation:
  - `npm test -- --run src/pages/QuestExplorerPage.test.tsx src/pages/QuestExplorerPage.productContinuity.test.tsx` passed: 49 tests.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
- New issues discovered:
  - None.
- Priority changes:
  - Item #7 is the next `safe now` candidate, but it touches canonical store normalization and should remain a pure extraction only.

### 6. Split `questPathFlow.ts` Into Focused Pure Modules

Status: `needs techlead decision`

Severity: High
Risk: Medium
Expected payoff: High
Behavior-preserving: Yes, if done as pure extraction only

Files affected:
- `frontend/src/features/quests/questPathFlow.ts`
- possible new files:
  - `questProgressionIdentity.ts`
  - `questRevealRules.ts`
  - `questChoiceVisibility.ts`
  - `questPathFlow.ts`
  - `questLoreChronicleStream.ts`

Problem:
- `questPathFlow.ts` is pure and valuable, but broad: identity, reveal metadata, visibility diagnostics, continuation resolution, flow construction, and Lore stream construction all live together.

Recommended work:
- Do this only after item #1.
- Split by stable concern, preserving public exports with a barrel or compatibility exports if needed.
- Avoid changing algorithm behavior.

Tests needed:
- New direct unit tests from item #1.
- Existing page/product continuity tests.

### 7. Extract Quest Store Normalization From Store Ownership

Status: `completed 2026-05-25`

Severity: Medium
Risk: Medium
Expected payoff: Medium
Behavior-preserving: Yes

Files affected:
- `frontend/src/stores/questStore.ts`
- new `frontend/src/features/quests/questExplorerNormalizer.ts`
- `frontend/src/stores/questStore.test.ts`

Problem:
- `questStore.ts` owns canonical quest state correctly, but also contains a large DTO normalization layer.
- This makes store ownership harder to scan.

Recommended work:
- Move `normalizeQuestExplorer(...)` and private cleaning/normalization helpers to a feature helper.
- Store should keep fetch/cache/selection/filter actions.
- Do not change API DTO types or backend contract.

Tests needed:
- Existing `questStore.test.ts`.
- Add direct normalizer tests if edge cases are not already covered.

Completion notes:
- Extracted Quest Explorer DTO normalization into `frontend/src/features/quests/questExplorerNormalizer.ts`.
- Kept `questStore.ts` focused on fetch/cache state, selectors, filters, and store actions.
- Files changed:
  - `frontend/src/features/quests/questExplorerNormalizer.ts`
  - `frontend/src/stores/questStore.ts`
- Validation:
  - `npm test -- --run src/stores/questStore.test.ts` passed: 4 tests.
  - `npx tsc --noEmit --project tsconfig.json` passed.
  - `npm run build` passed.
- New issues discovered:
  - None. The store test still intentionally logs the offline-fetch stderr in its error-path test.
- Priority changes:
  - Stop here for this pass because the requested maximum of three refactor items has been reached.
  - Item #8 remains the next `safe now` candidate, but should start as a fresh Admin Import helper extraction slice.

### 8. Extract Admin Import Row Pure Helpers And Subcomponents

Status: `completed 2026-05-25`

Severity: Medium
Risk: Medium
Expected payoff: Medium
Behavior-preserving: Yes

Files affected:
- `frontend/src/components/AdminImport/ImportModuleRow.tsx`
- possible new files:
  - `adminImportFileRouting.ts`
  - `AdminImportFileTable.tsx`
  - `AdminImportSummary.tsx`

Problem:
- `ImportModuleRow.tsx` was ~1133 LOC and mixed file classification, duplicate validation, network import loops, rendering, summary diagnostics, and UI state.
- After helper and component extraction it is ~634 LOC. It still sits slightly above the component hard review threshold, but remaining responsibilities are more coherent: row state, import execution, row shell, and small metadata/error/notices.

Recommended work:
- Completed:
  - export kind normalization
  - bulk export module detection
  - quest bulk row creation
  - action mode/badge derivation
  - repeated Codex/exporter file table rendering
  - single-file import success/result rendering
- Avoid changing import flow behavior in future cleanup.

Tests needed:
- Existing `AdminImportPage.test.tsx`.
- Focused tests for pure file-routing helpers if extracted.

Completion notes:
- Extracted pure file-routing/status helpers into `frontend/src/components/AdminImport/adminImportFileRouting.ts`.
- Added direct helper tests in `frontend/src/components/AdminImport/adminImportFileRouting.test.ts`.
- Extracted repeated file tables into `frontend/src/components/AdminImport/AdminImportFileTable.tsx`.
- Extracted single-file import success/result rendering into `frontend/src/components/AdminImport/AdminImportSingleResult.tsx`.
- Kept import execution, network calls, file input state, and local UI state in `ImportModuleRow.tsx`.
- Files changed:
  - `frontend/src/components/AdminImport/adminImportFileRouting.ts`
  - `frontend/src/components/AdminImport/adminImportFileRouting.test.ts`
  - `frontend/src/components/AdminImport/AdminImportFileTable.tsx`
  - `frontend/src/components/AdminImport/AdminImportSingleResult.tsx`
  - `frontend/src/components/AdminImport/ImportModuleRow.tsx`
- Validation:
  - `npm test -- --run src/components/AdminImport/adminImportFileRouting.test.ts src/components/AdminImport/AdminImportPage.test.tsx` passed: 14 tests after each Admin Import slice.
- New issues discovered:
  - `ImportModuleRow.tsx` remains just above the component hard review threshold at ~634 LOC.
- Remaining extraction candidates:
  - Further extraction is no longer urgent. A future small metadata/notice component extraction is possible, but import execution loops should not be moved without a focused plan.

### 9. Quest Explorer CSS Organization Pass

Status: `needs techlead decision`

Severity: Medium
Risk: Medium
Expected payoff: Medium
Behavior-preserving: Yes, but easy to turn into style churn

Files affected:
- `frontend/src/components/Quests/QuestExplorer.css`
- possible future split files under `frontend/src/components/Quests/`

Problem:
- `QuestExplorer.css` is ~2552 LOC and covers many product surfaces.
- The file is review-heavy, especially when Strategy and Lore changes land together.

Recommended work:
- Do after Strategy/Lore component extraction.
- Either add clear section comments or split into product-surface CSS files if the build/import style supports it cleanly.
- Do not redesign visuals as part of this pass.

Tests needed:
- Existing Quest Explorer tests.
- Manual/browser smoke only if CSS file imports change.

### 10. Codex And Admin CSS/Page Size Review

Status: `defer`

Severity: Low
Risk: Medium
Expected payoff: Low to Medium
Behavior-preserving: Yes

Files affected:
- `frontend/src/pages/CodexPage.css`
- `frontend/src/pages/CodexPage.tsx`
- `frontend/src/components/AdminImport/AdminImportPage.css`
- possibly `frontend/src/pages/ModsPage.css`

Problem:
- Codex CSS is large (~1199 LOC), and a few page/component files are near the review threshold.
- Compared with Quest Explorer, these are less urgent.

Recommended work:
- Defer until there is active product work in those areas.
- Avoid style-only churn.

Tests needed:
- Area-specific tests if touched later.

## Explicitly Deferred Items

- Full Quest Explorer rewrite: defer. The page should be slimmed by staged extraction, not replaced.
- Full graph/continuity map integration into Strategy: defer. This is a product feature, not a refactor.
- CSS redesign/theme pass: defer. Refactor backlog should not mutate visual direction.
- Moving route/deep-link hydration into new abstractions: defer unless explicitly planned. This is a high-risk system.
- Moving all Quest Explorer state into Zustand: defer. Current reader path state is correctly page-local/session-local unless product needs cross-route persistence.
- Generic “reader engine” abstraction: defer. Current abstractions should remain product-specific until at least two surfaces need a shared engine.

## Recommended Order

1. Completed: add direct helper tests for `questPathFlow` and `questStrategyDossier`.
2. Completed: extract Quest Explorer test fixtures/builders.
3. Completed: extract Strategy Dossier presentational components.
4. Completed: extract Lore Reader presentational components.
5. Completed: extract Quest Progression Debug panel.
6. Completed: extract Quest store normalizer.
7. Completed: extract Admin Import pure helpers and presentational table/result components.
8. Reassess `questPathFlow.ts` split with techlead approval.
9. Reassess Quest Explorer CSS organization after visual polish direction is clear.
10. Revisit deferred Codex/Admin CSS only when active work requires it.

## Next Implementation Prompt

```text
/goal

Plan the next non-trivial frontend refactor from docs/frontend/frontend-refactor-backlog.md.

Scope:
- frontend/src/features/quests/questPathFlow.ts

Goal:
- propose a stable split for questPathFlow.ts by responsibility
- do not implement until the split is reviewed

Candidate boundaries:
- progression identity helpers
- reveal metadata rules
- choice visibility diagnostics
- path flow derivation
- Lore chronicle stream derivation

Rules:
- No behavior changes.
- No UI changes.
- No backend/exporter changes.
- Preserve public exports or provide compatibility exports.
- Identify tests that would guard the split before implementation.

Validation:
Do not run implementation validation unless a reviewed follow-up goal approves the split.
```
