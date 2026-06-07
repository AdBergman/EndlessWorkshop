# Backend Java Style Guide

Guidance for humans and AI agents working on EWShop backend Java. This is not
enforced by Checkstyle, Spotless, Qodana, or formatter rules.

## Core Style

- Prefer explicit Java over generated or hidden behavior.
- Avoid Lombok, MapStruct, broad converters, broad annotation policies, and clever framework magic unless explicitly approved.
- Keep changes small, local, readable, and aligned with existing patterns.

## Layer Boundaries

```text
api -> facade -> domain <- infrastructure
```

- Controllers handle HTTP and stay thin.
- Facades orchestrate use cases and map DTOs.
- Domain owns business rules, invariants, and defensive normalization.
- Infrastructure owns JPA, repositories, persistence mapping, and database details.
- Do not move HTTP, JSON importer, or JPA concerns into domain code.

## Naming

- Use meaningful names at method boundaries and in multi-line logic.
- Prefer `tech`, `techDto`, `snapshot`, `entity`, `candidate`, and `entry`.
- Avoid `t`, `s`, `e`, and similar one-letter names outside tiny local lambdas.
- Short names are acceptable only when a longer lambda name makes a tiny stream harder to read.

## Importer And Null Handling

- Upstream exporter data is not trusted.
- Prefer explicit guards and validation over optimistic assumptions.
- `@Nullable` is acceptable only for intentional null contracts.
- Avoid broad `@NullMarked` unless the project adopts a formal nullness policy.
- Annotations document contracts; they do not replace importer validation.
- Bad importer data should fail or skip deliberately, with useful errors or logs.
- Import facades map, diagnose, and orchestrate; domain services decide import policy and release gates; infrastructure persists accepted snapshots and owns DB mechanics.
- Faction allow-lists are intentional release-safety gates, not incidental enum restrictions.

## DTOs And Mappers

- DTOs should contain fields the backend/API actually needs.
- Do not add exporter fields to DTOs just because they exist in JSON.
- Keep import command snapshots separate from public API response DTOs.
- Mappers should be explicit, predictable, and easy to debug.
- Prefer domain builders when constructor length hurts readability.

## Refactoring Signals

- Class length is a review signal, not a hard rule.
- Consider splitting when a class has multiple reasons to change, mixes responsibilities, or makes tests hard to read.
- Do not split classes purely to satisfy a line-count rule.
- Prefer behavior-based extraction over mechanical helper-class extraction.

## AI Review Checklist

Before committing AI-generated backend code, check for:

- vague names,
- unnecessary annotations,
- excessive comments,
- DTO field creep,
- hidden framework magic,
- untested importer/API contract changes,
- weaker defensive data handling,
- long methods or classes with mixed responsibilities.

## Known Review Areas

- SEO backend code should be reviewed against this guide before more feature work or refactoring, especially rendering, audit/report generation, regeneration orchestration, and generated-output tests.
- Quest Explorer backend code should be reviewed carefully before more feature work or refactoring, especially progression projection, diagnostics, import mapping, persistence mapping, and large nested models.
- These areas are not immediate refactor targets. Split them only behind focused tests and clear behavior boundaries.
