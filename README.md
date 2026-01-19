# EWShop

EWShop is an independent backend-focused project built with Java and Spring Boot.

The project is designed to resemble a production-grade backend system and serves as a place to explore architecture, API design, persistence, testing, and operational concerns in a realistic setting.

It is intentionally pragmatic rather than theoretical, and optimized for clarity, maintainability, and long-term evolution.

---

## Purpose of the project

EWShop exists to demonstrate:

- Backend architecture and layering in a real Spring Boot application
- Clear separation of responsibilities between API, application, domain, and infrastructure
- REST API design and DTO boundaries
- Persistence with PostgreSQL and schema evolution using Flyway
- Testing strategies aligned with architectural boundaries
- Operational considerations such as logging, caching, and database cost-awareness

The project originated from a series of Spring Boot experiments and prototypes, and later evolved into a more cohesive application. The current domain is inspired by the Endless Legend universe, but the architectural decisions are domain-agnostic.

---

## Tech stack

### Backend
- Java 24
- Spring Boot
- PostgreSQL
- JPA / Hibernate
- Flyway
- JUnit 5
- Maven

### Frontend
- React
- Vite
- Node 24

### Infrastructure & tooling
- Docker (multi-stage builds)
- CI-friendly build setup
- Cloud-hosted PostgreSQL (Neon)

---

## Architectural overview

EWShop is implemented as a **modular monolith with strict layering**.

It borrows ideas from hexagonal architecture (clear boundaries, dependency direction, isolation of infrastructure) without enforcing ports-and-adapters everywhere.

The application is deployed as a single Spring Boot service, but internal module boundaries are treated as architectural constraints.

### Dependency direction (strict)

```
api → facade → domain ← infrastructure
```

Dependencies always point inward toward the domain.

Lower-level modules must not depend on higher-level modules.
Infrastructure implements details required by the domain, not the other way around.

If the system ever grows beyond a single service, these boundaries are intended to make extraction straightforward.

---

## High-level data flow

```
External JSON Export (Game Mod)
        ↓
Ingestion / Mapping
        ↓
Domain Model (PostgreSQL)
        ↓
Facade Layer (DTOs, aggregation)
        ↓
HTTP API
        ↓
Consumers (Frontend, tools, planners)
```

Key characteristics:
- Upstream data formats are not trusted to be stable
- Domain models are normalized and defensive
- Read-heavy access patterns dominate
- Latency-sensitive paths avoid unnecessary database access

---

## Module responsibilities

### api
**Responsibility:** HTTP boundary and request/response handling.

Contains:
- REST controllers
- HTTP-specific request/response DTOs
- API validation
- Global exception-to-response mapping

Design principles:
- Controllers are thin
- No business logic
- No direct persistence access

---

### facade
**Responsibility:** Application-facing orchestration and DTO mapping.

Contains:
- Facade services invoked by controllers
- Domain-to-DTO mapping
- Aggregation and read-model shaping
- Coordination across domain services

This layer prevents domain objects from becoming API contracts and allows multiple representations over the same domain.

---

### domain
**Responsibility:** Core business logic and domain concepts.

Contains:
- Domain services
- Aggregates and value objects
- Domain invariants and validation

Design principles:
- Free of HTTP concerns
- Free of infrastructure details
- Focused on behavior rather than persistence mechanics

This layer is designed to be testable in isolation.

---

### infrastructure
**Responsibility:** Technical implementation details.

Contains:
- JPA entities and repositories
- Database adapters
- Scheduled jobs (heartbeat, cache preload)
- Infrastructure-specific mappers

Special considerations:
- Cloud-hosted PostgreSQL (Neon) may sleep
- Infrastructure code avoids unnecessary DB wake-ups
- Cache warmers and scheduled jobs are explicit and observable

---

### app
**Responsibility:** Application assembly and wiring.

Contains:
- Spring Boot entry point
- Configuration and component scanning
- Profile-specific and cross-cutting configuration

This module contains no business logic.

---

## Cross-cutting concerns

### Logging
- Centralized request logging via filters
- Global exception handling
- Duration logging for scheduled jobs and cache paths
- Logging designed not to trigger database connections

### Caching
Caching is used deliberately and sparingly.

Learnings:
- Cache placement can affect database wake-ups
- Controller-level caching avoided unnecessary DB access
- Facade-level caching caused connection behavior in practice

Cache placement is treated as an architectural decision.

### Database migrations
- Flyway manages schema migrations
- Validation runs on startup and during integration tests
- Failing fast is preferred over silent drift

---

## Testing strategy

The testing approach mirrors the architecture:

- Facade integration tests validate real wiring across layers
- Domain tests exist where behavior is non-trivial
- Infrastructure tests focus on mappings and persistence edge cases
- API tests validate request/response behavior without touching the database

This avoids redundant tests while keeping feedback fast.

---

## Local development

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: http://localhost:5173

Environment:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
Runs at: http://localhost:8080

Example endpoints:
- /api/techs
- /api/districts
- /api/improvements
- /api/builds

---

## Docker

### Build image
```bash
docker build -t ewshop-app .
```

### Run container
```bash
docker run -p 8080:8080 ewshop-app
```

Application available at: http://localhost:8080

The Docker build uses a multi-stage setup:
- Node 24 for building the React frontend
- Maven + Temurin for building the Spring Boot JAR
- Temurin JDK runtime for execution
- Frontend assets copied into Spring Boot /static

---

## Project status

- Actively developed
- Not currently open for external contributions

Licensing may be revisited in the future.

---

## Summary

EWShop prioritizes:
- Clarity over cleverness
- Real-world constraints over theoretical purity
- Maintainability over premature distribution

This README is descriptive rather than prescriptive. As the architecture evolves, this document is expected to evolve with it.
