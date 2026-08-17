# Backend Architecture And Testing Guidelines

Status: active backend source of truth for architecture, testing, and
AI-agent implementation rules.
Date: 2026-08-17

## Purpose

Use this document before changing backend Java, backend API contracts, imports,
persistence, Flyway migrations, generated SEO, backend runtime configuration, or
backend tests.

EWShop is a pragmatic Spring Boot 4 modular monolith. The backend is healthy and
should be preserved through small, bounded changes. Do not use this guide as a
license for broad refactors.

Authoritative backend runtime:

- JDK 26.
- Spring Boot is managed from the root Maven parent.
- Keep `pom.xml`, GitHub Actions Java setup, Docker build/runtime images,
  README, and dependency/CI docs aligned when the runtime changes.

## Architecture Model

The intended production dependency direction is:

```text
api -> facade -> domain <- infrastructure
app wires and runs the system
```

`app` depends on the other modules to assemble the runnable service. It also
owns runtime-edge concerns that are part of running the Spring Boot app, such as
profile configuration, generated SEO orchestration, SPA route forwarding, admin
filters, and local development startup imports.

The backend is hexagonal where it matters: domain ports are implemented by
infrastructure adapters, and HTTP/API contracts are kept outside the domain. It
is not a textbook framework-free domain. EWShop intentionally uses a
Spring-managed domain.

## Module Responsibilities

### api

Owns the HTTP boundary.

Allowed:

- REST controllers.
- Request validation and request parsing.
- HTTP status and error response behavior.
- Controller-focused tests for JSON contracts and route behavior.

Forbidden:

- Domain policy.
- Direct Spring Data repository access.
- JPA entity usage.
- Import JSON normalization beyond request-boundary validation.

Controllers should stay thin. They should call facade interfaces and return
response DTOs.

### facade

Owns application-facing orchestration and DTO mapping.

Allowed:

- Facade interfaces and implementations.
- Public response DTOs under `dto.response`.
- Import DTOs under `dto.importing`.
- Request DTOs under `dto.request`.
- Mapping between DTOs, domain commands/snapshots, and domain models.
- Use-case coordination across domain services.

Forbidden:

- JPA entities as facade API.
- HTTP controller concerns.
- Persistence implementation details.
- Generic mapping frameworks added only to reduce visible mapping code.

Facade mapping should stay explicit and debuggable. Import mapping may be
verbose when exporter JSON is verbose; prefer clear local helper methods over
hidden conversion machinery.

### domain

Owns business rules, invariants, policy, repository ports, commands, snapshots,
and domain models.

EWShop's domain is Spring-managed. Existing project conventions allow:

- `@Service` on domain services.
- `@Transactional` on domain service methods.
- `@Cacheable` and `@CacheEvict` where cache placement is a deliberate read or
  import consistency decision.
- Limited JPA annotations for shared value objects when already established,
  such as `@Embeddable`.

Forbidden:

- HTTP/controller concerns.
- Public response DTO concerns.
- Exporter JSON parsing.
- Import DTOs.
- JPA persistence entities.
- Spring Data repository implementations.
- Infrastructure configuration.

Domain services should speak in domain commands, import snapshots, repository
ports, domain models, and result objects. They should not know how upstream JSON
is shaped or how a JPA table is mapped.

### infrastructure

Owns technical persistence and external implementation details.

Allowed:

- JPA entities.
- Spring Data repositories.
- Repository adapters implementing domain repository ports.
- Persistence mappers between entities and domain models.
- Database bootstrap and maintenance code.
- Infrastructure integration tests and roundtrip tests.

Forbidden:

- HTTP controller concerns.
- Public API DTO ownership.
- Domain policy that belongs in domain services.
- Facade orchestration.

Infrastructure maps domain intent to storage mechanics. Keep the adapter/port
boundary visible: domain defines repository interfaces; infrastructure
implements them with `*RepositoryAdapter` backed by Spring Data
`*JpaRepository` types.

### app

Owns the runnable Spring Boot application.

Allowed:

- Main application class.
- Component scanning and cross-cutting config.
- Profile-specific config.
- Admin filters and production web behavior.
- SPA shell forwarding.
- Generated SEO orchestration and storage concerns.
- Local development startup import orchestration.

Forbidden:

- Core domain policy.
- Public DTO shape ownership.
- Persistence entity design that belongs in infrastructure.

`app` may contain real application behavior at the runtime edge. Keep new
behavior there only when it is truly about running or hosting the service.

## Contract Boundaries

### Public Response DTOs

Response DTOs are frontend-facing API contracts.

Any response DTO/API shape change requires inspection of affected frontend:

- TypeScript data types.
- API client calls.
- Zustand or other state stores.
- Rendering paths.
- Tests where behavior or shape is pinned.

Do not add response DTO fields merely because exporter JSON contains them. Add
fields when the API actually serves a product need.

### Import DTOs

Import DTOs are upstream adapter contracts for DBExporter/export JSON.

They may mirror upstream JSON closely enough to keep mapping explicit and
reviewable. They are not public frontend contracts. They should tolerate
unknown exporter fields according to the existing ObjectMapper/import policy.

Mapping, validation, normalization, diagnostics, release gates, and skip/fail
decisions belong at the facade/import boundary and domain import policy. Do not
leak exporter structure directly into domain policy.

### Domain Commands, Snapshots, And Models

Use domain command or snapshot records when imported or requested data crosses
from facade into domain policy.

Use domain models and value objects for stable business concepts, invariants,
and persistence-independent behavior. Prefer immutable records for carriers
that do not need identity or lifecycle behavior. Use classes when mutation,
encapsulation, methods, or richer invariants make them clearer.

Do not create generic mapping frameworks or abstraction layers solely to remove
explicit mapping code.

## Package Vocabulary

Established package ownership:

| Area | Meaning |
| --- | --- |
| `api.controller` | REST endpoints and HTTP contract tests. |
| `api.config` | HTTP boundary configuration. |
| `api.exception` | Exception-to-response mapping. |
| `facade.interfaces` | Controller-facing use-case interfaces. |
| `facade.impl` | Use-case orchestration and transaction-facing application flow. |
| `facade.dto.importing` | DBExporter/import JSON contracts. |
| `facade.dto.request` | Client request bodies. |
| `facade.dto.response` | Public API response contracts. |
| `facade.mapper` | Explicit DTO/domain/import mapping. |
| `domain.command` | Domain commands and import snapshots. |
| `domain.model` | Domain models, aggregates, value objects, result objects. |
| `domain.model.importing` | Domain-side import reporting/result models. |
| `domain.repository` | Repository ports. |
| `domain.service` | Domain policy, import policy, read services, projections. |
| `infrastructure.persistence.entities` | JPA entities. |
| `infrastructure.persistence.repositories` | Spring Data repositories. |
| `infrastructure.persistence.adapters` | Domain repository port implementations. |
| `infrastructure.persistence.mappers` | Entity/domain mapping. |
| `app.importing` | Local development startup import orchestration. |
| `app.seo` | Generated SEO orchestration, audit, rendering, and storage. |

Minor historical package drift exists in a few tests, such as singular
`persistence.repository`. Do not rename stable packages mechanically; align new
code with production package vocabulary.

## Naming

Use explicit names that reveal boundary and ownership:

- `*ImportSnapshot` for domain import command data.
- `*ImportDto`, `*ImportBatchDto`, or source-specific DTO names for import JSON
  contracts.
- `*Dto` under `dto.response` for public API response contracts.
- `*RequestDto` for client request bodies.
- `*Mapper` for explicit mapping classes at facade and infrastructure
  boundaries.
- `*Repository` for domain repository ports.
- `*RepositoryAdapter` for infrastructure implementations of domain ports.
- `*JpaRepository` for Spring Data repositories.
- `*Service` for domain policy/read/import services and facade use-case
  implementations where already established.

Preserve legitimate aggregate names even when they are plural. For example,
`Skills` and `SkillsDto` can represent a complete skill dataset rather than a
single skill. Do not rename stable API/domain concepts for stylistic purity.

## Java Style And Maintainability

Follow `docs/backend/java-code-style.md`. The main rules are:

- Prefer explicit Java.
- Prefer records for immutable carriers.
- Keep controllers thin.
- Keep mappings explicit.
- Avoid Lombok, MapStruct, broad converters, broad annotation policies, and
  clever framework magic unless explicitly approved.
- Extract by responsibility and behavior boundary, not arbitrary line count.

Additional guidance:

- Use a record when the type is an immutable data carrier and its constructor
  is still readable.
- Use a class when the type needs behavior, encapsulation, lifecycle state,
  validation methods, or construction that is clearer outside a record header.
- Use nested records for cohesive DTO/aggregate shapes when nesting mirrors a
  public contract or aggregate concept.
- Avoid deeply nested records when each nested part has a separate owner,
  persistence behavior, or test surface.
- Use compact constructors for small normalization or validation only. Move
  multi-step construction into named factories, builders, or mappers.
- Prefer builders or small value objects when constructor argument lists become
  hard to audit.
- Clean generated or AI-authored code before committing: remove redundant
  comments, vague names, unused abstractions, over-broad annotations, and
  helper methods that hide simple logic.
- Do not introduce abstractions merely because several methods look similar.
  Extract when the abstraction has a stable responsibility and improves test or
  review clarity.

## File Size Guidance

LOC is a review signal, not proof of poor design and not a CI gate.

Do not split Quest Explorer, SEO, or startup import orchestration by line count
alone. Split only when a meaningful responsibility or behavior boundary exists
and tests protect the change.

Review thresholds:

| File type | Review above | Usually split above |
| --- | ---: | ---: |
| Controllers | 250 LOC | 350 LOC |
| Facade implementations | 300 LOC | 500 LOC |
| Facade mappers | 300 LOC | 500 LOC |
| Domain services | 300 LOC | 500 LOC |
| Infrastructure adapters | 300 LOC | 500 LOC |
| Infrastructure mappers | 300 LOC | 500 LOC |
| JPA entities | 300 LOC | 500 LOC |
| DTO/record contract files | 300 LOC | When ownership is no longer readable |
| Tests | 600 LOC | 1,000 LOC |

For large cohesive DTOs or aggregate records, prefer a short review note over a
mechanical split. Public contract readability matters more than hitting a
number.

## Test Placement And Structure

Tests normally live in the Maven module that owns the production code under
test. This keeps focused module builds honest and makes coverage discoverable:

- `domain` service and policy unit tests live under `domain/src/test`.
- `api` controller contract tests live under `api/src/test`.
- `facade` orchestration and mapping tests live under `facade/src/test`.
- `infrastructure` persistence tests live under `infrastructure/src/test`.
- `app` tests cover runtime-edge behavior and tests that genuinely require the
  assembled application.

An integration test may live at the consuming boundary when it intentionally
needs several modules. Make that dependency clear in the test name and setup.
Do not use `app/src/test` as a convenience location for unit tests owned by
another module.

Keep test data local while it remains readable. Extract support code when
payload construction, recording fakes, or repeated valid defaults obscure the
behavior being tested:

- Prefer a small factory method for one cohesive object shape.
- Use a test-data builder when a large object has many optional fields and
  several tests need a valid baseline with explicit overrides.
- Keep extracted fixtures package-private and under `src/test`; do not add
  production builders solely for tests.
- Give defaults valid, unsurprising values. A test should still show the fields
  that cause the behavior under test.
- Prefer small recording fakes for interaction-heavy boundary tests when they
  make captured inputs and failures clearer than broad mocking.
- Avoid global fixture buckets, inheritance-heavy test frameworks, generalized
  test DSLs, and helpers that hide the important input.

For a test above the review threshold, first identify whether length comes from
behavior breadth or support data. Extract support data and fakes when that
restores readability. Split the test class only when distinct behavior groups
can be named, changed, and reviewed independently. Preserve existing coverage;
do not add tests merely to justify a structural cleanup.

Current project decisions:

- `ImportAdminControllerTest` keeps the controller contract cases together and
  places deterministic builders and recording fakes in
  `ImportAdminControllerFixtures`.
- `LocalStartupImportRunnerTest` remains one cohesive test class for now. Its
  profile gating, discovery, dispatch, diagnostics, and history behavior form
  one risky runtime workflow; revisit a behavior-based split if further growth
  makes those areas independently hard to review.

## Testing Strategy

Pick the smallest test set that validates the risk. Do not run expensive suites
for documentation-only edits. For backend code or runtime changes, run focused
tests first, then broaden when the surface area warrants it.

Task-oriented matrix:

| Change type | Normal focused verification | Broader verification |
| --- | --- | --- |
| Controller/API contract | Relevant `api` controller test. Verify status codes and JSON shape. | If response DTO changes, inspect frontend types/client/store/rendering and run affected frontend tests. |
| Facade mapping | Relevant `facade.mapper` or `facade.impl` test. | Facade integration test when orchestration or cross-service behavior changes. |
| Import DTO/importer | Import facade/mapper tests with representative exporter JSON and edge cases. | API admin import tests or startup import tests when entry path changes. |
| Domain policy/service | Focused test under `domain/src/test`. | Facade or API tests when user-visible behavior changes. |
| Persistence adapter | Adapter integration or roundtrip test. | Full infrastructure tests when mapping or query semantics change. |
| JPA entity/mapping | Entity/mapper tests plus adapter roundtrip where possible. | Flyway/infrastructure tests when schema assumptions change. |
| Flyway migration | Migration-sensitive infrastructure test or app migration test. | `./mvnw -B test` before merge. |
| Startup import | `LocalStartupImportRunnerTest` or focused import-admin path tests. | Full backend tests when profile gating, file discovery, import history, or multiple import kinds change. |
| Generated SEO | SEO rendering/generation/audit tests with normalized output checks. | App route tests and deploy-smoke checklist when production route behavior changes. |
| Runtime/dependency/CI | `./mvnw -B test` on the target JDK where possible. | Docker build for runtime image/build changes; CI/deploy workflow review. |
| Documentation only | Markdown/link sanity appropriate to changed docs. | No backend build churn needed unless docs changed executable snippets enough to warrant command checks. |

Response DTO/API shape changes explicitly trigger frontend contract inspection.
Importer DTO changes do not automatically require frontend checks unless they
change public responses or data availability.

Persistence and Flyway changes should normally include roundtrip or migration
coverage. Avoid relying on mapper-only tests for schema-affecting work.

## Backend Smoke

Use `docs/backend/backend-deploy-smoke-checklist.md` for canonical deploy smoke
expectations. Keep it aligned with `.github/workflows/deploy.yml`.

Do not invent smoke requirements the application does not support. Add smoke
coverage only when the deployed behavior matters enough to protect in
production.

## Architecture Enforcement Decision

The Maven module graph is the primary architecture boundary enforcement. It
prevents production imports that are not available through declared module
dependencies, while review and this guide cover the smaller package-level
choices inside a module.

Do not add an architecture test pre-emptively. The current dependency graph is
clean, the module flow already prevents the important wrong-way imports, and an
additional scanner would duplicate that protection without evidence of a
recurring failure.

Reconsider a focused architecture check only if a real boundary regression
occurs, module dependencies are broadened enough to weaken compile-time
protection, or a valuable package-level rule repeatedly escapes review. Any
future check should encode only the demonstrated risk and remain easy to read.

## Known Hotspots

These areas deserve careful, test-first changes:

- Quest Explorer progression projection, diagnostics, import mapping,
  persistence mapping, and nested API/domain/entity shapes.
- `LocalStartupImportRunner` file discovery, classification, diagnostics
  policy, import dispatch, and history recording.
- Generated SEO rendering, audit/report assembly, regeneration orchestration,
  route behavior, and generated-output tests.

They are not rewrite targets. Extend tests around the target behavior before
extracting or changing responsibilities.
