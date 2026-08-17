# Backend Documentation And Agent Rules Review

Status: active backend review and action plan
Date: 2026-08-17
Scope: read-only review of backend documentation, AI-agent rules, backend
application structure, code/test shape, naming, package layout, file-size
pressure, and maintainability debt.

Remediation note: the first remediation slice established JDK 26 as the
authoritative backend runtime and added canonical backend architecture/testing
and deploy-smoke guidance. Use
`docs/backend/backend-architecture-and-testing-guidelines.md` as the current
backend implementation source of truth.

The second remediation slice corrected test ownership and reviewability: pure
domain-service tests now run from the `domain` module, import-controller test
support is separated from contract cases, and the canonical guide records
pragmatic fixture and long-test rules. No new tests or architecture-test
dependency were added.

## Executive Verdict

The backend application is healthier than the backend documentation implies.
The module graph still shows the intended pragmatic hexagonal shape:

```text
api -> facade -> domain <- infrastructure
app wires and runs the system
```

Static import review found no unexpected cross-module imports outside that
direction. Controllers are thin, facade DTOs are the public contract, domain
services own most policy, and infrastructure owns persistence mechanics. The
backend should not be rewritten.

The initial larger problem was agent guidance. Backend rules existed, but they
were much thinner than the frontend guidance. The first remediation slice added
a canonical backend architecture/testing guide that tells AI agents what to do
by task type, which tests to run, when to split files, what package names mean,
how Spring annotations are allowed in the domain, and that JDK 26 is
authoritative.

Biggest findings:

1. The largest backend code debt is Quest Explorer backend complexity, followed
   by local startup import orchestration and the remaining large SEO rendering
   and audit/report assembly.
2. The largest documentation debt found in the initial pass was version and
   runtime drift. JDK 26 is now the intended backend runtime and the first
   remediation slice aligns docs/config toward that target.
3. The largest initial AI-agent-rule gap was that backend rules were advisory
   and fragmented. The first remediation slice added a canonical backend
   architecture/testing guide to close the main discoverability gap.
4. The existing backend reviews are useful but slightly misleading as active
   sources of truth: many tickets are marked done, some are pragmatic skips,
   and one reference to an existing Spring Boot 4 post-deploy checklist does
   not appear to map to a canonical backend doc.
5. The domain module is not a pure framework-free domain. It is a
   Spring-managed domain module with `@Service`, `@Transactional`, cache
   annotations, and one JPA embeddable. That is acceptable for this project if
   documented honestly.

## Evidence

Reviewed:

- `AGENTS.md`
- `README.md`
- `pom.xml`, module POMs, Dockerfile, GitHub workflows
- `docs/active/README.md`
- `docs/current-action-priorities.md`
- `docs/documentation-guidelines.md`
- `docs/dependency-and-ci-maintenance.md`
- `docs/backend/java-code-style.md`
- `docs/backend/backend-vertical-slice-review.md`
- `docs/backend/seo-backend-review.md`
- `docs/backend/seo-architecture.md`
- `docs/active/final-snapshot-technical-refactor-review.md`
- `docs/active/final-snapshot-import-hygiene-audit.md`
- Backend source and test package/file metrics across `api`, `facade`,
  `domain`, `infrastructure`, and `app`

I did not run Maven tests during this review because the user requested a
read-only review and test execution would refresh non-doc build artifacts under
`target/`.

## Current Application State

### Build And Runtime

- Authoritative backend runtime: JDK `26`.
- Parent POM: Spring Boot `4.0.7`, Java `26`, Mockito `5.20.0`.
- Modules: `app`, `api`, `facade`, `domain`, `infrastructure`.
- CI and deploy test gates should use Temurin Java `26`.
- Docker build and runtime images should use `eclipse-temurin:26`.
- README should describe backend JDK `26`.
- Production and staging config enable response compression for JSON, HTML,
  CSS, JavaScript, SVG, and XML.
- Production/staging use PostgreSQL with Flyway validation and
  `ddl-auto: none`.
- Dev uses H2 with PostgreSQL mode and local startup imports enabled by
  default.

The initial Java version mismatch was the most concrete application-state risk
found in the read-only pass. The follow-up decision is explicit: JDK 26 is
authoritative, so lower-version CI, Docker, or README references are stale.

### Runtime Surface

The backend serves:

- public read APIs for techs, units, districts, improvements, Codex, quests,
  factions, heroes, skills, saved builds, and data freshness;
- admin import endpoints;
- admin SEO regeneration;
- generated SEO pages and sitemap;
- the SPA shell and route forwarding behavior;
- local/dev startup imports.

Deploy smoke in `.github/workflows/deploy.yml` is stronger than the docs:
health, core read APIs, saved-build roundtrip, SPA routes, Quest deep links,
cache headers, stale routes, generated SEO 404s, and disabled Swagger/OpenAPI
are all checked after container start.

## Current Rule State

### Coding Style

Current state: good principles, thin detail.

`docs/backend/java-code-style.md` correctly says:

- prefer explicit Java;
- avoid Lombok, MapStruct, broad converters, and clever framework magic unless
  approved;
- keep controllers thin;
- keep DTOs explicit and useful;
- do not add exporter fields just because they exist;
- split classes by responsibility and test pain, not line count alone;
- review SEO and Quest Explorer carefully.

Initial gaps addressed by the first remediation slice:

- No concrete backend file-size review thresholds by file type.
- No guidance for records versus classes, nested records, builders, or compact
  constructors.
- No package convention guide for `command`, `model`, `service`,
  `repository`, facade `dto.importing` versus `dto.response`, and
  infrastructure `entities`/`mappers`/`repositories`/`adapters`.
- No explicit stance on domain-layer Spring annotations, transactions, or
  caching.
- No guidance on when a large DTO or aggregate record is acceptable.
- No AI checklist for generated-code cleanup beyond the compact list already
  in the style guide.

### Code Quality

Current state: application architecture is clean, enforcement is mostly social.

Positive signs:

- Static cross-module import scan found zero unexpected imports.
- `api` production code is small: 20 Java files, 828 LOC, max 257 LOC.
- Most production Java files are small: 286 of 362 backend main Java files are
  at or below 100 LOC; average main-file size is 68.7 LOC.
- The backend uses many records for DTOs and immutable data carriers: 218
  `record` declarations in main code.
- Existing review docs repeatedly prefer vertical-slice tests over generic
  frameworks.

Initial gaps:

- Qodana exists, but backend style guidance says the rules are not enforced by
  Checkstyle, Spotless, Qodana, or formatter rules. That means current quality
  depends on review discipline and tests.
- There is no additional architecture-test library. This is now an explicit
  decision rather than an open gap: Maven module dependencies already block the
  important wrong-way imports, the current graph is clean, and no recurring
  boundary failure justifies duplicate enforcement.
- The initial README architecture prose said the app module contains no
  business logic, while the actual `app` module contains SEO generation and
  local startup import orchestration. The first remediation slice corrected
  that to runtime-edge use cases.
- Domain POM comments still say "Core business logic, JPA entities, and domain
  models" even though JPA entities live in infrastructure. The domain does,
  however, carry Spring/JPA dependencies.

### Testing Strategy

Current state: actual backend test coverage is better than the docs.

Measured test footprint:

| Module | Test files | Test LOC | Largest test |
| --- | ---: | ---: | ---: |
| `api` | 16 | 2,469 | 870 |
| `facade` | 33 | 6,731 | 598 |
| `domain` | 2 | 430 | 249 |
| `infrastructure` | 17 | 1,829 | 320 |
| `app` | 20 | 3,305 | 847 |

The two domain-service tests that previously lived under `app/src/test` now
live under `domain/src/test`, so focused domain builds discover them directly.

Positive signs:

- API controller tests pin JSON contracts.
- Facade tests cover import/admin behavior and integration paths.
- Infrastructure tests cover mappers, repositories, migration-sensitive
  behavior, ordering, and persistence safety.
- App tests cover local startup import, SEO, route forwarding, CORS,
  production fallback, and admin tokens.
- Existing backend reviews name focused Maven commands for high-risk slices.

Initial gaps addressed by the first remediation slice:

- No dedicated backend testing strategy.
- No task-type matrix equivalent to frontend guidance.
- No explicit rules for when to run a focused module test, full `./mvnw -B
  test`, frontend contract checks, browser route smoke, or deploy smoke.

Second-slice resolution:

- The canonical guide now defines module-local placement and fixture/builder
  rules.
- `ImportAdminControllerTest` is 870 LOC after its deterministic builders and
  recording fakes moved to package-private test support; all 23 contract tests
  remain together.
- `LocalStartupImportRunnerTest` remains 847 LOC by deliberate review. It is a
  cohesive high-risk runtime workflow and does not yet have a split that would
  improve ownership or comprehension.

### Project Structure And Packages

Current state: the module structure is strong, but the docs should be more
honest about practical Spring tradeoffs.

Measured production footprint:

| Module | Main files | Main LOC | Largest file | Files over 300 LOC | Files over 500 LOC |
| --- | ---: | ---: | ---: | ---: | ---: |
| `api` | 20 | 828 | 257 | 0 | 0 |
| `facade` | 146 | 7,188 | 385 | 3 | 0 |
| `domain` | 97 | 6,413 | 825 | 4 | 2 |
| `infrastructure` | 61 | 6,278 | 711 | 3 | 1 |
| `app` | 38 | 4,146 | 706 | 4 | 3 |

Package shape:

- `api`: config, controllers, exception handling.
- `facade`: DTOs, facade interfaces, facade implementations, mappers.
- `domain`: commands, models, importing models, repositories, services.
- `infrastructure`: adapters, entities, mappers, Spring Data repositories,
  bootstrap/maintenance.
- `app`: Spring Boot entrypoint, web config, startup import, SEO generation.

Initial gaps addressed by the first remediation slice:

- `docs/active/README.md` had a frontend implementation row but no backend
  task-type routing.
- Backend docs did not explain package ownership deeply enough for new slices.

Remaining gaps:

- Infrastructure test packages use both `persistence.adapters` and singular
  `persistence.repository`; main production packages use plural
  `persistence.repositories`. This is minor, but it is a naming drift signal.
- Initial README local backend instructions said `cd backend`, but this repo
  has module directories rather than a `backend/` directory. The first
  remediation slice corrected the root Maven wrapper commands.

### Naming

Current state: mostly clear and explicit.

Good patterns:

- `*ImportSnapshot` in domain for importer command data.
- `*ImportBatchDto` / import DTOs under `facade.dto.importing`.
- Public response DTOs under `facade.dto.response`.
- `*RepositoryAdapter` for infrastructure implementations of domain
  repositories.
- `*JpaRepository` for Spring Data repositories.
- `*Mapper` names are explicit at facade and infrastructure boundaries.

Naming risks:

- `Skills` / `SkillsDto` is a plural aggregate name. That can be acceptable
  because `/api/skills` returns a full skill dataset, but the convention should
  be documented so agents do not "fix" it mechanically.
- `app` module naming implies pure wiring, while it also owns SEO and startup
  import use cases.
- `LocalStartupImportRunner` is accurate but now covers enough responsibilities
  that future agents may over-expand it unless rules say where new startup
  import responsibilities belong.

### LOC Per File Type

Current state: no hard backend LOC rules exist. That is defensible, but there
should be review thresholds.

Largest production files:

| LOC | File | Assessment |
| ---: | --- | --- |
| 825 | `domain/.../QuestExplorerProgressionProjector.java` | Largest non-SEO domain policy hotspot. |
| 711 | `infrastructure/.../QuestExplorerPersistenceMapper.java` | Large nested persistence mapper. |
| 706 | `app/.../LocalStartupImportRunner.java` | Large runtime orchestration with file discovery, classification, dispatch, logging, and history. |
| 603 | `app/.../CodexMissingReferenceAuditService.java` | Smaller than old review but still substantial. |
| 584 | `app/.../SeoPageRenderer.java` | Static HTML assembly remains large. |
| 517 | `domain/.../QuestExplorer.java` | Large nested aggregate/read model. |
| 484 | `infrastructure/.../QuestExplorerEntryEntity.java` | Large nested JPA model. |
| 385 | `facade/.../QuestExplorerDto.java` | Large nested API contract DTO. |
| 380 | `facade/.../QuestExplorerImportMapper.java` | Large import mapper, already documented as guarded. |
| 350 | `domain/.../QuestExplorerProgressionDiagnosticReporter.java` | Diagnostics/reporting hotspot. |

Recommended review thresholds:

- Controllers: investigate above 250 LOC; split above 350 LOC unless there is
  a strong reason.
- Facade implementations and mappers: investigate above 300 LOC; split above
  500 LOC when a behavior boundary exists.
- Domain services: investigate above 300 LOC; split above 500 LOC unless it is
  a cohesive algorithm protected by golden tests.
- Infrastructure adapters/mappers/entities: investigate above 300 LOC; split
  above 500 LOC only behind persistence/roundtrip tests.
- DTO/record files: allow larger files for nested API contracts, but require
  an explicit note once they exceed 300 LOC and split when contract ownership is
  no longer readable.
- Test files: investigate above 600 LOC; split/extract fixtures above 1,000
  LOC unless the file is an intentionally consolidated contract matrix.

These should stay review signals, not mechanical gates.

## Largest Tech Debt

### 1. Quest Explorer Backend Complexity

Quest Explorer owns most of the backend's large-file risk:

- `QuestExplorerProgressionProjector.java` at 825 LOC.
- `QuestExplorerPersistenceMapper.java` at 711 LOC.
- `QuestExplorer.java` at 517 LOC.
- `QuestExplorerEntryEntity.java` at 484 LOC.
- `QuestExplorerDto.java` at 385 LOC.
- `QuestExplorerImportMapper.java` at 380 LOC.
- `QuestExplorerProgressionDiagnosticReporter.java` at 350 LOC.

This is not accidental mess. It reflects a complicated domain projection with
branching, chronology, strategy objectives, lore, diagnostics, and nested
persistence. The debt is not "bad architecture"; it is concentrated complexity
that future agents can easily break if they chase line count without golden
tests.

Direction: keep Quest Explorer intact until a behavior change needs it. When
changed, start with tests around the target behavior, then extract named
policies from the projector or mapper one at a time.

### 2. Backend Rule Fragmentation

The backend lacks a single canonical implementation/testing rule set comparable
to the frontend docs. This causes two risks:

- Agents may miss backend conventions unless they read old review docs.
- Agents may cargo-cult old review findings that are already marked done or
  pragmatic-skip.

Direction: add a backend architecture/testing guide and make it a task-type row
in `docs/active/README.md`.

### 3. Runtime Version Drift

The initial Java version story was inconsistent across POM, CI, Docker, and
README. This was both documentation debt and likely delivery risk.

Direction: JDK 26 is authoritative. Keep POM, CI, deploy, Dockerfile, README,
and dependency/CI docs aligned to JDK 26.

### 4. Local Startup Import Accretion

`LocalStartupImportRunner` is now 706 LOC. It is well guarded by profile and
property checks, and it records import history, but it mixes:

- root/folder resolution;
- file discovery;
- JSON classification;
- diagnostics deny-list policy;
- quest explorer special handling;
- import dispatch;
- summary logging;
- import-history persistence.

Direction: do not split just for size. If more import kinds or diagnostics
rules are added, extract file discovery/classification and diagnostics
deny-list policy first.

### 5. SEO Residual Assembly

The SEO cleanup reduced the older risk, but `SeoPageRenderer` and
`CodexMissingReferenceAuditService` remain large. Existing docs correctly say
SEO should not be copied as a backend style model.

Direction: leave SEO alone unless page shape, audit format, or production
generation behavior changes. If it changes, split shell/static HTML assembly
and report rendering behind normalized output tests.

## Action Plan

### P0 - Align Backend Runtime Version

Goal: remove the original Java version split before further backend
maintenance.

Status: completed by the first remediation slice with JDK 26 as the
authoritative runtime.

Ongoing rule:

- Keep root `pom.xml`, CI, deploy test gate, Docker build/runtime images,
  README, and dependency/CI docs aligned to JDK 26.
- Run `./mvnw -B test` and Docker build for future runtime-affecting changes.

### P1 - Create Backend Architecture And Testing Guide

Goal: make backend agent rules discoverable and precise.

Created `docs/backend/backend-architecture-and-testing-guidelines.md` as the
canonical guide.

The guide covers:

- layer responsibilities and allowed dependency direction;
- practical Spring-managed domain policy;
- package ownership;
- DTO/import snapshot/public response boundaries;
- mapper ownership;
- repository adapter conventions;
- cache and transaction placement;
- backend test matrix by task type;
- when frontend contract checks are required;
- file-size review thresholds;
- naming conventions and accepted exceptions.

### P1 - Add Backend Task-Type Rows To Active Docs

Goal: make agents find backend docs without reading every review.

Status: completed for the first remediation slice in `docs/active/README.md`.

The active index now has task rows for:

- backend implementation;
- backend API contract changes;
- backend import/rich import changes;
- persistence/Flyway changes;
- generated SEO backend changes;
- backend docs/rules review.

### P1 - Create Canonical Backend Smoke Checklist

Goal: replace the vague "existing Spring Boot 4 post-deploy checklist" reference
with an actual doc.

Status: created `docs/backend/backend-deploy-smoke-checklist.md`.

The checklist reflects `.github/workflows/deploy.yml` and calls out adjacent
runtime checks for compression, data freshness, and SEO persistence:

- `/actuator/health`;
- core read APIs;
- saved build POST/GET;
- SPA shell routes and direct Quest deep links;
- cache headers for shell routes;
- stale route 404s;
- generated SEO missing-page 404;
- Swagger/OpenAPI disabled in prod;
- compression verification for heavy JSON endpoints such as `/api/codex`;
- `/api/data-freshness` availability.

### P2 - Clean Up Stale General Docs

Goal: stop old docs from lying to agents.

Status: the first remediation slice corrected confirmed stale Java version,
backend command, app-module, domain POM, and Spring-managed domain wording.

Completed cleanup:

- Update README Java version, backend commands, and app-module description.
- Clarify that `app` contains runtime-edge use cases such as SEO generation and
  local startup import.
- Correct the domain POM description or dependency comments so it no longer
  suggests JPA entities live in domain.
- Mention that the domain is Spring-managed, not framework-free.

### P2 - Quest Explorer Backend Hardening Plan

Goal: reduce future breakage risk without broad rewrite.

Sequence:

1. Keep existing Quest Explorer behavior untouched unless a product/API issue
   requires change.
2. Before changing progression behavior, add or extend golden tests around the
   exact branch/topology case.
3. Extract only one named policy at a time from
   `QuestExplorerProgressionProjector`.
4. For persistence mapper/entity changes, require DB roundtrip tests.
5. For DTO shape changes, require API controller contract tests and frontend
   type/client/store verification.

### P3 - Opportunistic Startup Import And SEO Cleanup

Goal: avoid letting known large files grow indefinitely.

Only when touched:

- Extract startup import file discovery/classification from
  `LocalStartupImportRunner`.
- Extract diagnostics deny-list policy if new diagnostics export kinds are
  added.
- Split SEO shell/static HTML assembly only when page-shape changes justify
  normalized HTML test updates.

## Recommended Rule Updates For AI Agents

Add these to backend guidance:

- Treat backend response DTOs as public contracts. Any API DTO change requires
  frontend type/client/store/rendering verification.
- Treat import DTOs as upstream-adapter contracts, not public API contracts.
- Domain services may use Spring `@Service`, transaction, and cache
  annotations in this project; do not add HTTP, JPA entity, or JSON importer
  concerns to domain.
- Prefer records for immutable snapshots and DTOs, but use builders or small
  domain value objects when constructor length harms readability.
- Do not split Quest Explorer, SEO, or startup import files by line count
  alone. Split when a tested behavior boundary exists.
- For persistence changes, verify adapter behavior with roundtrip tests.
- For Flyway changes, run relevant infrastructure tests plus full backend
  tests before merging.
- For runtime/dependency/CI changes, align POM, CI, Docker, docs, and deploy
  smoke in the same slice.

## Final Assessment

The backend is in a good pragmatic state. Its architecture has held up through
multiple vertical slices, and the code is mostly small outside a few known
hotspots. The work now is not a broad refactor. The useful move is to harden
the rules so future agents preserve the architecture without rediscovering it
from old review docs.

The first backend debt to fix is not Quest Explorer or SEO. It is the rule and
runtime-documentation layer: align Java versions, create a backend testing and
architecture guide, and make the active docs point agents to the right backend
rules before they touch code.
