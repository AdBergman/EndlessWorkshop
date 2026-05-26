# EWShop Frontend Architecture Guidelines

Status: ACTIVE
Audience: Codex / frontend implementation agents
Scope: React + TypeScript frontend only

## Purpose

EWShop frontend changes should stay easy to review, test, and reason about. Large pages can exist, but they should not quietly become the place where routing, product semantics, state ownership, data derivation, rendering, CSS decisions, and QA diagnostics all live forever.

These guidelines are soft boundaries, not bureaucracy. Use them to keep product work bounded and to make refactors behavior-preserving before visual redesign.

Crossing a size threshold is not a build failure. It is a signal to pause, review ownership, and decide whether the file is still coherent. Large files are not automatically bad; a cohesive product concept may be easier to understand in one well-sectioned file than fragmented across many vague modules.

## Architecture Boundaries

EWShop frontend code should keep product semantics visible and ownership clear.

Default boundary model:
- Page files orchestrate routes, store selection, local interaction state, and feature composition.
- Feature helpers derive product-shaped view models from explicit inputs.
- Presentational components render those view models and raise product actions.
- Hooks own reusable stateful browser/React lifecycle behavior.
- Zustand stores own canonical cross-page state, fetched datasets, and normalized lookup maps.
- Debug tooling stays isolated from normal product rendering and remains visually secondary.

When these responsibilities mix, prefer a behavior-preserving extraction before adding more UX.

## Page Files

Page files should orchestrate.

Good page responsibilities:
- route/query/deep-link coordination
- selecting data from stores
- choosing which feature view to render
- wiring page-local interaction state
- composing feature components
- passing already-derived view models into presentational components

Avoid putting these directly in page files when they grow beyond a small local concern:
- domain derivation
- continuity or progression algorithms
- large filtering/grouping pipelines
- repeated mapping from API DTOs to UI concepts
- large nested presentational components
- debug row derivation
- broad CSS-class state matrices

Size guidance:
- Target: under 300-500 LOC.
- Review threshold: 700 LOC.
- Hard review/refactor threshold: 1000 LOC unless justified.

Passing a threshold should trigger architectural review, not automatic splitting. A large page may be acceptable when it is still mostly orchestration, the product surface is unusually cohesive, or an active extraction plan exists. Above 1000 LOC, record the justification or identify an extraction path.

## Feature Modules

Feature modules belong under `frontend/src/features/<feature>/` when logic is specific to one product area but not tied to one component instance.

Good feature-module candidates:
- pure derivation helpers
- view-model builders
- feature-specific type aliases
- continuity/path/progression helpers
- metadata predicates
- product wording helpers shared by multiple components/tests

Feature modules should not reach into React hooks, DOM APIs, or stores unless their purpose is explicitly a hook or state adapter. Keep pure feature helpers pure.

Organize feature folders around product concepts rather than generic utility buckets. For example, a Quest Explorer flow helper belongs near quest feature code, not in a broad `utils/` folder. A module should have a name that tells a reviewer what product responsibility it owns.

## View-Model Helpers

Use view-model helpers when UI needs a stable product-shaped model rather than raw DTO traversal.

Prefer:
- `buildQuestPathFlow(...)`
- `buildStrategyDossierModel(...)`
- `buildSomeFeatureViewModel(...)`

Over:
- deriving the same grouped data inside several components
- passing many loosely related raw arrays through component trees
- checking metadata flags in JSX repeatedly

View-model helpers should:
- accept explicit inputs
- return plain serializable objects where practical
- avoid reading Zustand stores directly
- avoid hidden global state
- make empty/terminal states explicit
- be easy to unit test without rendering React

Size guidance for pure helper/view-model files:
- Target: under 300-500 LOC.
- Review threshold: 700 LOC.
- Hard review/refactor threshold: 1000 LOC unless justified.

Large pure helper files can be justified when they model one coherent domain algorithm. If they combine identity resolution, visibility rules, view-model shaping, diagnostics, and stream orchestration, split by stable responsibility.

## Pure Functions

Pure functions are the default home for product derivation.

Use pure functions for:
- sorting and grouping
- visibility predicates
- selected-path derivation
- DTO-to-display summaries
- terminal-state classification
- debug metadata formatting

Pure functions should not:
- mutate inputs
- navigate
- update stores
- read URL state
- inspect the DOM
- fetch data

If a function needs effects, make that visible by putting it in a hook or component boundary.

## Components

Components should be named by product concept, not implementation detail.

Prefer:
- `StrategyDossier`
- `StrategySelectedOptionSummary`
- `LoreContinuousProgression`
- `QuestRail`

Avoid vague names once a component becomes meaningful:
- `Panel`
- `Content`
- `Renderer`
- `Item`

Component guidance:
- Keep presentational components small enough to scan.
- Split when a child has its own product concept, repeated structure, or independent tests.
- Do not split purely to satisfy a line count if the result hides simple local flow across many files.
- Components should receive derived props rather than re-deriving domain state from raw DTOs.

Size guidance:
- Target: under 200-300 LOC.
- Review threshold: 400 LOC.
- Hard review/refactor threshold: 600 LOC unless justified.

Larger component files can be acceptable when they are a cohesive feature surface with small internal subcomponents. Extract when a child is independently nameable by product concept, not merely because JSX is long.

## Hooks

Hooks are for reusable stateful behavior or integration with React lifecycle.

Good hook candidates:
- route hydration
- scroll/observer behavior
- keyboard interaction
- synchronized local storage
- external event subscriptions

Avoid hooks for simple pure derivation. Prefer `useMemo(() => buildViewModel(...))` around a pure helper.

High-risk hooks and orchestration paths need extra caution:
- route/deep-link hydration
- share hydration
- app startup orchestration
- tooltip timing
- provider ordering

## Zustand Store Ownership

Zustand stores own canonical interactive/domain state that matters across pages, routes, or major feature surfaces.

Good store-owned state:
- selected global faction
- loaded API datasets and normalized lookup maps
- route-addressable selected entities
- cross-page planner state
- persistent user filters when already established by the feature

Good page-local state:
- active tab/mode when route already owns canonical mode
- currently selected semantic sequence inside a quest reader
- expanded/collapsed local panels
- transient hover/focus state
- scroll-active segment highlight
- debug toggles scoped to a page session

Do not duplicate derived lookup state inside a page if a canonical store already owns it. Also do not fetch unrelated store slices just because DTO keys exist. Resolve through stores only when the UI actually renders that related data and the coupling is intentional.

Store guidance:
- Stores should expose canonical state, actions, and normalized lookup maps.
- Stores should not become dumping grounds for large product view-model derivation.
- Page-local state is appropriate for session-scoped reader choices, transient tab state, scroll-follow highlights, and QA toggles.
- A feature helper may normalize DTOs before store insertion, but it should not secretly own interactive state.

## CSS Organization

Keep feature CSS organized by product area and component concept.

Guidance:
- Use stable feature prefixes, for example `questExplorer-`.
- Keep visual state classes explicit, for example `is-selected`, `is-active`, `is-scrollActive`.
- Group related styles together: rail, header, strategy dossier, lore reader, debug.
- Add responsive rules near existing responsive blocks.
- Avoid one-off global selectors.
- Avoid styling based on raw data keys or generated labels.
- Keep debug/QA visuals visually secondary to product UI.

Size guidance:
- Target: feature-scoped and clearly sectioned.
- Review threshold: 1000 LOC.
- Hard split threshold: 1500 LOC unless intentionally centralized.

When a CSS file grows large, prefer section comments or feature-level CSS extraction only when it improves reviewability. Do not split CSS during a behavior-sensitive refactor unless styling is the actual work. A centralized feature stylesheet is acceptable when it keeps a complex surface visually coherent and avoids import churn.

## Debug Tooling

Debug tooling is part of EWShop's product quality workflow, but it should not contaminate normal UX.

Guidance:
- Keep debug derivation separate from product view-model derivation when practical.
- Debug panels should be opt-in or QA-scoped.
- Raw metadata, hidden rows, and diagnostic labels should not leak into normal-mode UI.
- Extraction is useful when debug formatting crowds product rendering, but preserve all debug completeness during refactors.

## Tests

Tests should lock product behavior, not implementation trivia.

Prefer tests that assert:
- visible user behavior
- route/store state that defines the product contract
- derived pure helper output
- edge cases around metadata ownership
- debug behavior when explicitly enabled

Avoid tests that assert:
- incidental DOM depth
- exact class names except for meaningful state/badge variants
- private helper implementation details
- brittle text uniqueness when repeated labels are expected

When extracting pure helpers, add focused unit tests if the helper carries meaningful product semantics. For behavior-preserving extraction, existing tests should pass unchanged or with import-path/scoping updates only.

## File Size Guidance

These are review signals, not compiler/build limits. Crossing a threshold should trigger architectural review, not automatic splitting.

| File type | Target | Review threshold | Hard review/refactor threshold |
| --- | ---: | ---: | ---: |
| React page files | 300-500 LOC | 700 LOC | 1000 LOC unless justified |
| React component files | 200-300 LOC | 400 LOC | 600 LOC unless justified |
| Pure helper/view-model files | 300-500 LOC | 700 LOC | 1000 LOC unless justified |
| CSS files | Feature-scoped and sectioned | 1000 LOC | 1500 LOC unless intentionally centralized |

Large files are not automatically wrong. The question is whether a new contributor can safely answer:
- What does this file own?
- Where does product derivation happen?
- Where does state live?
- How would I test a change?

Justified large files should have:
- one coherent reason to exist
- clear internal sections or named subcomponents/helpers
- tests around the product semantics they own
- a known extraction path if future work would add another responsibility

Unjustified large files usually mix multiple responsibilities, such as page orchestration, domain derivation, debug formatting, component rendering, CSS state design, and fixture construction.

## When To Extract

Extract when it reduces risk or clarifies ownership.

Good extraction triggers:
- the same derivation appears twice
- JSX contains complex metadata predicates
- a component has multiple independent product sections
- a pure algorithm needs focused tests
- page files own domain logic
- debug derivation crowds product rendering
- future work will otherwise pile onto an already-large surface
- file size thresholds are crossed and the file has more than one clear responsibility

Prefer behavior-preserving extraction before visual redesign. Move code, prove tests still pass, then change UX in a separate slice.

Extract coherent responsibilities:
- Move pure derivation as a named feature helper.
- Move a named product surface as a component.
- Move reusable lifecycle behavior as a hook.
- Move normalization as a feature/store adapter.
- Move debug rendering as a QA component.

## When Not To Extract

Do not extract when it mainly creates ceremony.

Avoid extraction when:
- logic is tiny and only used once
- names would be vaguer than the code they replace
- it spreads one readable flow across many files
- it requires new abstractions without reducing duplication or risk
- it changes behavior during a cleanup task
- it pulls store/API/router dependencies into pure modules
- it fragments a cohesive product concept into files with weak names

Refactoring should make the next change safer. If it only makes the file tree prettier, pause.

## Refactor Discipline

Refactors must preserve behavior unless the task explicitly asks for behavior change.

During refactors:
- keep route behavior and query params stable
- keep store ownership stable
- keep debug tooling available
- keep public component props compatible where practical
- avoid changing copy, layout, and extraction in the same step
- avoid touching backend/API/schema unless the task requires it
- run the existing frontend validation commands for product code changes

If tests fail unexpectedly, stop and understand whether the test caught behavior drift or only old implementation coupling.

## Avoiding Over-Engineering

EWShop should feel deliberate, not abstract for abstraction's sake.

Prefer:
- local pure helpers over generic frameworks
- product-named types over universal containers
- explicit state over clever inferred state
- small modules over deep hierarchies
- clear duplication over premature abstraction

Do not introduce a generic engine until two or more concrete product surfaces need it and the shared contract is obvious.

## Quest Explorer Lesson

Quest Explorer is the current example of why these guidelines exist. The page grew because it legitimately had to integrate continuity metadata, reveal ownership, Strategy/Lore path state, continuous Lore reading, Strategy Dossier view models, and debug tooling.

Semantic note: current implementation names such as `questPathFlow` and "path
state" are legacy vocabulary, not canonical user semantics. Quest Explorer
semantic work should use `docs/quest_explorer_canonical_semantics_v1.md` as the
authority and `docs/quest_explorer_documentation_audit_v1.md` for documentation
status.

The target direction is:
- page owns orchestration
- `features/quests/*` owns pure quest derivation
- Strategy and Lore components render product concepts
- stores own canonical quest data and route-addressable selection
- page-local state owns reader interaction and debug toggles
- debug remains complete but does not contaminate normal UI

Do not rush a giant cleanup. Prefer staged extraction with tests after each slice.
