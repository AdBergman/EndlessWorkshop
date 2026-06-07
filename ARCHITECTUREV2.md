# EWShop Architecture Quick Reference

Status: active quick reference
Last reviewed: 2026-06-07

This file is a compact orientation guide for humans and coding agents. It does
not replace `README.md`, `AGENTS.md`, or deeper feature docs. Use it to decide
where code belongs and which boundaries matter before making changes.

## Shape Of The System

EWShop is a pragmatic modular monolith with a React/Vite frontend served by a
Spring Boot backend.

Backend dependency direction:

```txt
api -> facade -> domain <- infrastructure
              ^
              |
             app
```

The project borrows from hexagonal architecture, but it is not a pure
ports-and-adapters exercise. The main rule is practical boundary discipline:
HTTP concerns stay out of domain code, persistence details stay out of API code,
and frontend/backend contracts stay explicit.

## Backend Modules

### `api`

HTTP boundary.

Owns:
- REST controllers
- request validation
- exception-to-response behavior

Does not own:
- business logic
- persistence
- importer mapping details

### `facade`

Application-facing orchestration and DTO mapping.

Owns:
- API DTOs and import DTOs
- facade services called by controllers
- read-model shaping for frontend/API consumers
- mapping between API/facade DTOs and domain commands/read models

This is usually where backend contract changes become visible to frontend.

### `domain`

Core application model and behavior.

Owns:
- domain entities/value objects
- domain services
- repository ports
- import commands/read models where appropriate

Domain code should not know about HTTP, frontend route semantics, or JSON export
quirks unless those quirks have been transformed into explicit domain concepts.

### `infrastructure`

Technical implementation.

Owns:
- JPA entities and Spring Data repositories
- repository adapters
- persistence mappers
- Flyway migrations
- generated SEO storage details

Infrastructure implements domain/facade needs; it should not define product UI
semantics.

### `app`

Application assembly.

Owns:
- Spring Boot entry point
- configuration
- startup orchestration
- local import runner
- static frontend serving

Keep business behavior out of this module.

## Frontend Shape

The frontend is React + TypeScript + Vite.

Important folders:
- `src/api`: backend client contracts
- `src/types`: frontend DTO/domain types
- `src/stores`: Zustand domain/read-model stores
- `src/features`: pure feature logic and feature-specific helpers
- `src/lib`: shared pure helpers and cross-feature foundations
- `src/components`: UI components
- `src/pages`: route-level orchestration
- `src/context`: app-shell orchestration only

`GameDataProvider` is orchestration-only. It coordinates startup loading, saved
build/share behavior, and app-level gates. Domain collections and interactive
state should live in stores.

High-risk frontend areas:
- share hydration
- route/deep-link hydration
- startup lifecycle ordering
- tooltip timing
- `GameDataProvider` and `App` orchestration

Change these only with focused tests and a narrow migration plan.

## Data And Import Contracts

EWShop consumes external game/exporter JSON. Upstream exports are not assumed to
be stable.

Local-only imports:
- raw supported exports live in `local-imports/exports/`
- Codex exports live in `local-imports/codex/`
- `local-imports/` is gitignored and must not be committed

Current startup import shape:
- raw supported exports include `districts`, `improvements`, `units`, `tech`,
  and Quest Explorer where configured
- Codex uses a generic `exportKind` plus `entries[]` contract

Contract rule:
- If backend DTO fields change, verify frontend `src/types`, `apiClient`,
  stores, selectors, and rendering.
- If frontend starts using backend fields, verify the backend response DTO and
  mapper path first.

## Codex Versus Rich Views

Codex is the lightweight encyclopedia/search projection. It is good for broad
coverage, descriptions, reference keys, category browsing, icons, and related
links.

Rich feature pages own rich domain views:
- `/tech` owns the tech planner/tree and tech spreadsheet concepts
- `/units` owns unit comparison, unit cards, evolution, and future table views
- `/quests` owns Quest Explorer Lore/Strategy semantics
- `/summary` owns imported game summary/report surfaces

Do not force Codex to become the rich object model for every domain. Prefer:

```txt
Codex entry -> generic detail -> optional strategy panel -> link to rich page
```

## Quest Explorer

Quest Explorer has its own semantic authority:

1. `docs/quest_explorer_canonical_semantics_v1.md`
2. live `quest_explorer.v3` export topology
3. current implementation and tests as behavior evidence
4. archived/historical docs only as context

Do not infer Quest Explorer semantics from old "step/choice/path" language when
it conflicts with the canonical document.

## SVG Icons And Art

SVG icons and large art are separate concerns.

SVG icon work:
- small UI icons
- stat/resource/ability/faction symbols
- description-token icons
- Codex and tooltip affordances

Art/WebP work:
- unit portraits
- hero portraits
- councilor portraits
- large visual stage/background assets

Keep icon contracts frontend-safe:
- browser-ready public paths such as `/svg/...`
- no Unity GUIDs, mapper names, or exporter internals in frontend runtime APIs
- generated/import-safe manifests preferred over importing from `public`

Exporter handoff notes may exist at repo root while actively coordinating with
the exporter team.

## Generated Output

Generated SEO output is local/runtime output, not source documentation.

Ignored paths:
- `/generated-seo/`
- `/app/generated-seo/`
- `/frontend/dist/`
- `target/`

If generated files appear in status, prefer fixing `.gitignore` or generation
location instead of committing them.

## Verification

Frontend changes, from `frontend/`:

```sh
npm test -- --run
npx tsc --noEmit --project tsconfig.json
npm run build
```

Backend/API contract changes:
- run the relevant Maven tests
- include frontend verification when frontend DTO/rendering behavior is touched

## Related Docs

- `AGENTS.md`: coding-agent rules and guardrails
- `README.md`: broader project overview
- `frontend/README.md`: frontend commands and boundaries
- `docs/frontend/frontend-architecture-guidelines.md`: detailed frontend rules
- `docs/frontend/frontend-refactor-backlog.md`: frontend cleanup backlog
- `docs/quest_explorer_canonical_semantics_v1.md`: Quest Explorer source of truth
- `docs/future-art-asset-action-plan.md`: future non-SVG art work
