# AGENTS.md

## Project Posture

Prefer small, bounded changes that follow existing architecture. Do not perform broad refactors unless explicitly requested.

For active project documentation, start with `docs/active/README.md`. Do not
read all active docs by default; use its task-type table to select relevant
docs.

## Codex Branch Workflow

Startup rule for Codex implementation work: before the first implementation
edit, establish the current branch, understand the working-tree state, refresh
`main`, and work from a fresh `codex/*` task branch created from that refreshed
`main`, unless the user explicitly says this is a continuation of the same
coherent task/PR branch.

Default startup procedure:

1. Determine whether the request continues the same coherent task/PR already on
   the current branch.
2. If yes, remain on that task branch after checking the working tree.
3. Otherwise, checkout `main`, fetch/pull the latest `main` when network access
   is available, create a fresh `codex/*` task branch from that refreshed
   `main`, and begin implementation only after that branch is active.

If unrelated local work prevents safely moving the current checkout to
refreshed `main`, preserve it and use a separate worktree or report the blocker;
do not discard, reset, overwrite, rebase, merge, cherry-pick, or rewrite another
branch or workstream unless explicitly instructed.

Codex implementation work uses a dedicated `codex/*` task branch rather than
directly on `main`. Task size, perceived risk level, solo-maintainer status, and
lack of detected concurrent agents are not reasons for Codex to work directly on
`main`. Codex does not need to infer whether other agents are running before
creating a task branch. Human-maintainer direct-`main` work may still be
reasonable when explicitly chosen by the maintainer. Keep this lightweight: this
is task-branch development for a hobby project, not GitFlow.

Standard lifecycle for Codex implementation work:

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
branch from the task branch for each follow-up. Treat a new Codex session as a
new task branch unless the user explicitly says it is continuing an existing
branch/PR. Start a fresh branch from refreshed `main` when the user begins a
separate task or the work no longer belongs in the same reviewable PR.

Stay within the requested task scope, avoid unrelated cleanup, and preserve
unrelated local changes. If significant overlap or a dependency on another
branch is discovered, report it instead of silently absorbing unrelated work.

Branch work should not be left as an unreviewable limbo branch. When Codex
finishes implementation work on a task branch, the normal handoff is to commit
the coherent work, push the branch, and open a PR into `main`. If Codex cannot
push or open the PR, report that clearly. Do not merge directly unless the
maintainer explicitly asks for it, and do not amend, squash, or rewrite history
unless the requested workflow permits it. Leave final PR review, branch
integration, and merge ordering to the maintainer unless explicitly delegated.

For EWShop GitHub auth/PR instability, follow the canonical host-authenticated
`git`/`gh` path in `docs/dependency-and-ci-maintenance.md` before reporting PR
creation blocked.

## PR-First Handoff Standard

For completed work that has been committed and pushed, the GitHub branch / PR is
the authoritative code handoff. The final response should be a concise human
engineering summary, not a data dump or repository snapshot.

For routine pushed work, the final handoff is exactly: PR, Status, What Changed,
Working Tree. Status describes the engineering work itself, such as work
complete and ready for review, blocked by a concrete issue, or implementation
incomplete. Add extra information only for exceptional failures or blockers that
require maintainer action; do not report routine draft state or pending checks.

Do not create a full-repository handoff zip merely because work is complete and
pushed. For local-only evidence and supplemental package guidance, follow
`docs/documentation-guidelines.md`.

## Sequential Continuation Workstreams

When the user explicitly authorizes sequential or continuous work, the work
queue is dynamic rather than frozen at task start. If completing one story
creates a new successor story that is sufficiently specified, unblocked, within
the authorized domain, and safe to implement, that successor joins the current
workstream automatically.

Creating a successor story is not a valid stopping point when that story can
reasonably be implemented now. Likewise, a blocker in one story should not stop
unrelated actionable work inside the same authorized workstream.

Before ending a sequential workstream, scan newly created docs, backlog items,
TODOs, and follow-up notes. Classify each as one of:

- completed;
- externally blocked;
- explicitly deferred;
- out of scope;
- unsafe to continue.

Do not leave an actionable successor as "next work" without a concrete reason.
This rule does not authorize unrelated scope expansion; continue only within the
domain the user actually authorized.

After a task branch is merged or otherwise closed, the expected cleanup is to
delete the task branch locally and remotely. Branch deletion is part of
maintainer-owned integration unless explicitly delegated; do not delete branches
from another workstream without instruction.

Separate Git worktrees are useful when the maintainer wants to run multiple task
branches concurrently or when an agent must preserve unrelated local work while
starting from refreshed `main`. Agents do not need to infer concurrency before
using a task branch for implementation.

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
