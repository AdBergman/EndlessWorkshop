# AGENTS.md

## Project Posture

Prefer small, bounded changes that follow existing architecture. Do not perform broad refactors unless explicitly requested.

For active project documentation, start with `docs/active/README.md`. Do not
read all active docs by default; use its task-type table to select relevant
docs.

## Codex Branch Workflow

Substantial Codex implementation work should normally happen on a dedicated
`codex/*` task branch rather than directly on `main`. This is the default model
for implementation work and does not depend on detecting whether other agents or
workstreams are currently active. Keep this lightweight: this is task-branch
development for a hobby project, not GitFlow.

Standard lifecycle for substantial Codex work:

```text
task branch -> PR into main -> maintainer merge/closeout -> delete task branch
```

Use simple branch names:

- `codex/frontend-<task>` for frontend-focused work.
- `codex/backend-<task>` for backend-focused work.
- `codex/dependencies-<task>` for dependency, CI, Docker, runtime, or maintenance work.
- `codex/<task>` for genuinely cross-cutting work.

Within one interactive Codex session, continue using the same task branch when
follow-up requests are part of the same coherent development effort. Do not
branch from the task branch for each follow-up. Start a fresh branch from
current `main` when the user begins a separate task, a new Codex session is
started, or the work no longer belongs in the same reviewable PR.

Stay within the requested task scope, avoid unrelated cleanup, and preserve
unrelated local changes. Do not reset, discard, overwrite, rebase, merge,
cherry-pick, or rewrite another branch or workstream unless explicitly
instructed. If significant overlap or a dependency on another branch is
discovered, report it instead of silently absorbing unrelated work.

Branch work should not be left as an unreviewable limbo branch. When Codex
finishes implementation work on a task branch, the normal handoff is to commit
the coherent work, push the branch, and open a PR into `main`. If Codex cannot
push or open the PR, report that clearly. Do not merge directly unless the
maintainer explicitly asks for it, and do not amend, squash, or rewrite history
unless the requested workflow permits it. Leave final PR review, branch
integration, and merge ordering to the maintainer unless explicitly delegated.

After a task branch is merged or otherwise closed, the expected cleanup is to
delete the task branch locally and remotely. Branch deletion is part of
maintainer-owned integration unless explicitly delegated; do not delete branches
from another workstream without instruction.

Separate Git worktrees are useful when the maintainer wants to run multiple task
branches concurrently. Worktree creation and orchestration are normally a
maintainer concern; agents do not need to infer concurrency before using a task
branch for substantial implementation.

## Backend/Frontend Contract Discipline

- Frontend changes using backend DTO fields should verify frontend types/API client/store usage against backend response DTOs.
- Backend API DTO changes should verify corresponding frontend type/client/store/rendering usage.
- Do not deep-audit importer, DB, or Flyway layers unless explicitly requested, the API contract is ambiguous, or a contract mismatch is suspected.
- For DB Exporter handoff, response, or follow-up work, read `docs/active/db-exporter-ewshop-handoff-ledger.md` first, check whether the issue was previously requested/answered/rejected/superseded/implemented, and update the ledger when new requests, responses, findings, or follow-ups are created.
- For documentation cleanup, read and follow `docs/documentation-guidelines.md`; keep active docs short and archive completed handoffs under `docs/archive/`.
- For backend Java changes, read and follow `docs/backend/backend-architecture-and-testing-guidelines.md` and `docs/backend/java-code-style.md`; do not duplicate those rules here.
- For backend deploy/runtime smoke checks, read and follow `docs/backend/backend-deploy-smoke-checklist.md`.
- For dependency, CI, or workflow changes, read and follow `docs/dependency-and-ci-maintenance.md`; document any required manual maintainer action there.

## Local Import Fixtures

- `local-imports/` is gitignored local-only data and must never be committed.
- `local-imports/` is development-only. Production data must be populated
  through Admin Import Web UI/API imports, not local startup fixtures.
- Put raw supported exports in `local-imports/exports/`; startup imports currently support `districts`, `improvements`, `units`, `factions`, `heroes`, `skills`, `tech`, and `quest_explorer`.
- Put codex exports in `local-imports/codex/`; codex exports use the generic `exportKind` plus `entries[]` contract and do not require a fixed kind allow-list.
- Startup imports run only for `dev`, `local`, `ai`, or `codex` profiles when `ewshop.local-import.enabled=true`.
- If `prod` or `staging` is active, local startup import must fail fast rather than populate deployed data from `local-imports/`.
- Unsupported raw exporter files, such as battle abilities, battle skills, and descriptor evaluations, may coexist locally and are skipped with a log message.
- Any frontend feature depending on a rich API must have a production Admin
  Import path before release. Before prod-ready, verify the rich APIs used by
  the frontend are populated in the target environment.

## High-Risk Systems

Do not casually refactor:
- share hydration
- route/deep-link hydration
- startup lifecycle ordering
- tooltip timing
- GameDataProvider/App orchestration timing

These systems are intentionally stable and require bounded, explicit migrations.

## Frontend Architecture Rules

- Keep `GameDataProvider` orchestration-only.
- Keep interactive/domain state store-native.
- Preserve existing route behavior, query params, and deep-link semantics.
- Prefer existing stores, selectors, helpers, and tests over new abstractions.
- Follow the detailed React/TypeScript boundaries in `docs/frontend/frontend-architecture-guidelines.md` for page files, feature modules, view-model helpers, hooks, Zustand ownership, CSS, tests, and behavior-preserving extraction.
- Keep frontend test specs reviewable: extract large fixtures/payload builders once a spec approaches ~1000 LOC, and split page/component integration specs by user-facing behavior area.

## Verification

For frontend changes, run from `frontend/`:
- `npm test -- --run`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`

Frontend ESLint is currently an advisory baseline. Run `npm run lint` for frontend review work and evaluate warnings pragmatically before changing code.

For backend/API contract changes, run the relevant Maven tests.
