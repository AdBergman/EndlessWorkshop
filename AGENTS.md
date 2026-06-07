# AGENTS.md

## Project Posture

Prefer small, bounded changes that follow existing architecture. Do not perform broad refactors unless explicitly requested.

## Backend/Frontend Contract Discipline

- Frontend changes using backend DTO fields should verify frontend types/API client/store usage against backend response DTOs.
- Backend API DTO changes should verify corresponding frontend type/client/store/rendering usage.
- Do not deep-audit importer, DB, or Flyway layers unless explicitly requested, the API contract is ambiguous, or a contract mismatch is suspected.
- For backend Java changes, read and follow `docs/backend/java-code-style.md`; do not duplicate those rules here.

## Local Import Fixtures

- `local-imports/` is gitignored local-only data and must never be committed.
- Put raw supported exports in `local-imports/exports/`; startup imports currently support `districts`, `improvements`, `units`, and `tech`.
- Put codex exports in `local-imports/codex/`; codex exports use the generic `exportKind` plus `entries[]` contract and do not require a fixed kind allow-list.
- Startup imports run only for `dev`, `local`, `ai`, or `codex` profiles when `ewshop.local-import.enabled=true`.
- Unsupported raw exporter files, such as battle abilities, battle skills, and descriptor evaluations, may coexist locally and are skipped with a log message.

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

For backend/API contract changes, run the relevant Maven tests.
