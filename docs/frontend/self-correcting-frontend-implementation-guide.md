# Self-Correcting Frontend Implementation Guide

Status: DRAFT
Audience: Codex / frontend implementation agents
Scope: Quest-like React + TypeScript product surfaces

## Purpose

Large frontend surfaces such as Quest Explorer should not depend on a single implementation prompt being perfectly right. The work should include enough product specification, architectural boundaries, tests, diagnostics, and runtime checks that the implementation can discover when it has drifted and correct itself before handoff.

This guide describes the inputs and validation harness needed for a future implementation similar to Quest Explorer.

## Required Specification Inputs

A self-correcting implementation prompt needs explicit product semantics, not only UI wishes.

Minimum product specification:
- Primary user job: what the user is trying to understand or decide.
- Mode identity: what each mode is for, and what it is not for.
- Canonical flow model: the ordered state machine or reading/planning sequence.
- State ownership: which state is route-owned, store-owned, page-local, or transient.
- Data contract: exact DTO fields used, including which metadata is authoritative.
- Forbidden inference: key parsing, label heuristics, hidden coupling, or backend assumptions.
- Empty and terminal states: unresolved, complete, failure, convergence, missing data.
- Debug contract: what QA can reveal and what normal UI must hide.
- Mobile expectations: stacked behavior, scrolling roots, minimum readable controls.
- Accessibility expectations: focus states, landmarks, keyboard selection, reduced motion.

For Quest-like work, the product spec should include a matrix like:

| Mode | Primary job | State scope | Can show alternates? | Can reveal future? |
| --- | --- | --- | --- | --- |
| Lore | Read a sequential chronicle | chapter/progression context | only at choice gates | only after selected path metadata allows it |
| Strategy | Plan current chapter/path | selected chapter | yes, for current decision point | only as projected outcome |
| Debug | Inspect continuity metadata | current active mode/segment | yes | yes, behind explicit raw toggle |

## Required Design Inputs

The design input does not need to be a full Figma system, but it must define the product shape.

Minimum design artifacts:
- One annotated desktop wireframe for each major mode.
- One mobile stacking wireframe for each major mode.
- Interaction timeline for each stateful flow.
- Visual hierarchy notes: primary, secondary, debug, empty, terminal.
- Component inventory named by product concept.
- Copy tone rules for player-facing states and QA-only states.
- Scroll and URL behavior notes.
- A short "do not build" list.

For a premium strategy-game surface, design review should check:
- The first viewport answers the primary user job.
- Choices look actionable, outcomes look revealed, and debug looks secondary.
- Strategy does not accidentally become a lore reader or graph editor.
- Lore does not accidentally become a progression dump.
- Controls keep stable dimensions and do not jump when selected.

## Architecture Checklist

Before implementation, decide:
- Page orchestration boundary.
- Feature view-model helper names.
- Presentational component names.
- Hook ownership for route, observer, keyboard, or URL behavior.
- Zustand ownership and selectors.
- CSS ownership and whether feature CSS stays centralized.
- Test fixture strategy.
- Diagnostic script location and expected output.

Default boundary for Quest-like work:
- Page: route/store orchestration and feature composition.
- Store: canonical API data, selected entity, filters, normalized lookup maps.
- Hooks: browser lifecycle behavior such as scroll observer and URL synchronization.
- Feature helpers: pure metadata/path/view-model derivation.
- Components: product concept rendering.
- Diagnostics: command-line product invariant checks, separate from runtime product UI.

## Test Strategy

Do not chase 100% coverage. Cover the product invariants that would be expensive to rediscover manually.

Required test layers:
- Pure helper unit tests for metadata predicates, path derivation, terminal states, and view-models.
- Product fixture tests using representative live-like data.
- Page integration tests for primary user flows.
- Route/deep-link tests for query/path hydration.
- Store ownership tests for fetch/cache/reset behavior.
- Debug-mode tests for raw hidden data visibility.
- Regression tests for recently fixed bugs.

For Quest-like readers, tests should assert:
- Future content does not render before triggering choice.
- Selected path reveals exactly the owned continuation.
- Strategy and Lore state do not silently mutate each other.
- Scroll-follow does not mutate canonical selected entry.
- URL scroll markers use `replace` and stay scoped to the relevant mode.
- Debug raw toggle exposes hidden/future rows without contaminating normal UI.
- Empty, unresolved, convergence, failure, and chapter-exit states are understandable.

Avoid:
- Snapshot-heavy tests for large pages.
- Asserting private implementation details when a user-visible invariant exists.
- Testing every CSS class unless it encodes accessibility or product state.

## Runtime Verification

Automated tests are not enough for a complex frontend surface.

Required runtime checks:
- Production build.
- Typecheck.
- Full test suite.
- Feature diagnostic script.
- Local app boot.
- Browser smoke for desktop and mobile viewports.
- Console error capture.
- URL/deep-link smoke.
- Keyboard/focus smoke for primary interactions.
- Visual screenshot comparison when the surface is visually sensitive.

Browser smoke should verify:
- The route loads without fatal console errors.
- The primary mode renders data.
- Mode switching works.
- A branch choice updates only the intended state.
- Scroll-follow highlights the visible segment.
- Passive scroll URL changes do not mutate canonical selected entry.
- Debug toggle still exposes QA data.

## Diagnostic Tooling

A self-correcting implementation needs diagnostics that classify problems, not just dump JSON.

Useful diagnostic categories:
- blocker
- warning
- known exporter/data-quality issue
- accepted modeled artifact
- design smell/future risk

Diagnostics should check:
- DTO counts and schema version.
- Broken links and missing target entries.
- Hidden/future rows that normal UI should suppress.
- Continuity metadata completeness.
- Branch reveal ownership coverage.
- Routeable entries and rail projection sanity.
- Absence of forbidden key/label inference in frontend source.
- Debug-only data not imported as product data.

Diagnostics should produce deterministic output so tests and humans can compare it.

## Self-Correcting Prompt Template

Use this structure for a future Quest-like implementation:

```text
/goal

Implement [feature slice] for [surface].

Product contract:
- [mode identity]
- [canonical user flow]
- [state ownership]
- [data fields allowed]
- [forbidden inference]
- [empty/terminal states]

Architecture contract:
- page orchestrates only
- stores own canonical data and lookup maps
- hooks own browser lifecycle behavior
- pure helpers derive view-models
- debug tooling remains separate

Implementation rules:
- frontend-only unless explicitly stated
- preserve route/deep-link behavior
- preserve existing store ownership
- no key parsing or label heuristics
- no broad refactor during feature work

Required tests:
- [pure helper invariants]
- [page user flows]
- [route/deep-link cases]
- [debug/diagnostic cases]
- [negative cases]

Runtime validation:
- npm test -- --run
- npx tsc --noEmit --project tsconfig.json
- npm run build
- npm run diagnostics:[feature]
- browser smoke desktop/mobile with console capture

Self-correction loop:
1. Inspect current architecture and tests.
2. Implement the smallest coherent slice.
3. Run targeted tests.
4. Fix implementation or tests only when the product invariant proves it.
5. Run full validation.
6. Browser smoke.
7. Report remaining risks and the next bounded prompt.
```

## Readiness Gate

A feature is ready for visual polish when:
- Product roles are distinct.
- Major state transitions are deterministic.
- Tests protect the highest-risk flows.
- Diagnostics have zero blockers.
- Debug tooling is complete but visually secondary.
- Runtime smoke has no fatal console errors.
- Remaining work is hierarchy, density, accessibility, and responsive polish rather than data correctness.

## Quest-Like Implementation Readiness Checklist

Before sending a future "build a complex reader/planner" prompt, make sure the prompt or linked spec answers these questions:

- What is the exact sequential model?
- What metadata is authoritative for reveal, ownership, visibility, and terminal states?
- Which state is canonical, which state is page-local, and which state is passive scroll/session state?
- Which behaviors must be route-addressable?
- Which behaviors must never update the route?
- Which normal-mode rows must be hidden unless debug is explicitly enabled?
- What are the top five live-data cases that must be manually and automatically checked?
- What screenshot viewports are required?
- What console/API failures are acceptable during smoke, and which are blockers?
- What diagnostic output proves the frontend did not reintroduce heuristic inference?

If any answer is missing, stop before implementation and write the missing specification first. That is the cheapest place to correct the work.
