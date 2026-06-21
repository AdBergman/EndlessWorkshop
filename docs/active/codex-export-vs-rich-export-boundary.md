# Codex Export vs Rich Export Boundary

Status: active decision record  
Created: 2026-06-21  
Related audit: `docs/active/codex-rich-import-enrichment-audit.md`
Architecture decision:
`docs/active/codex-rich-vs-codex-import-architecture-decision.md`

## Purpose

This document defines ownership boundaries before EWShop uses rich/domain
exports to enrich Codex pages.

The goal is to prevent three mistakes:

- asking DB Exporter to duplicate rich/domain data that EWShop can already use
  safely;
- using rich/domain exports as a shortcut for canonical public Codex metadata;
- letting Codex become a second copy of route-owned experiences such as `/tech`
  or `/quests`.

## Core Ownership Rule

Codex export owns public encyclopedia records. Rich/domain exports own structured
game systems data. Frontend enrichment resolvers may combine them only by exact
identity/reference matches and must fail closed.

If a UI requires canonical public metadata, ownership, grouping, identity, or
stable backend/API semantics, it stays in the DB exporter backlog.

## Codex Export Owns

- Stable Codex entry identity and permalink key.
- Display name, category/kind, and player-facing archive facts.
- Shallow browse facts used by Codex rails and archive filters.
- Player-facing descriptions, effects, mechanics, and row/detail sections.
- Exact reference keys to other public Codex entries.
- Public search/archive records that remain useful without rich imports.

## Rich Export Owns

- Structured domain models for route-owned systems.
- Progression, prerequisite, evolution, skill, branch, and deep system data.
- Diagnostics and internal structure where appropriate.
- Rich route experiences such as `/tech`, `/quests`, or future route-owned
  explorers.
- Exact sibling records that can optionally enrich Codex detail/profile pages.

## Frontend Enrichment Resolver Owns

- Optional EWShop-only row/detail enrichment from exact rich sibling records.
- Exact `entryKey` or explicit reference matching.
- Fail-closed behavior when rich data or target Codex entries are missing.
- Product-specific view models such as Tech prerequisite detail sections or Unit
  previous/evolves-into links.
- Keeping route-owned UI logic out of Codex components.

Resolvers must not infer from names, prose, keys, SVG filenames, duplicate
titles, or old footer/context strings.

## DB Exporter Backlog Owns

- Canonical public metadata not safely available from Codex or rich imports.
- Explicit ownership/grouping/identity fields.
- Public API/backend import contracts that should not depend on local rich
  imports.
- Missing or noisy player-facing Codex facts.
- Reference coverage where public links should resolve but currently do not.
- Stable icon contracts when icons are intended to be public UI data.

## Category-by-Category Boundary

| Category | Boundary decision |
| --- | --- |
| Abilities | Split. Rich ability data may support detail-only tactical/profile inspection, but `Combat role`, explicit ability ownership, and public ability reference coverage remain exporter-owned. |
| Units | Split. Rich Unit export can enrich EWShop detail pages with exact previous/evolves-into and grouped public ability inspection. Exporter backlog remains valid if evolution relationships must be public Codex/API metadata. |
| Heroes | Split. Rich Hero and Skills sidecar data can enrich Hero details. Exporter remains owner of public granted ability coverage, stable portraits/icons, and any canonical presentation metadata. |
| Tech | Split. Rich Tech export is the best first resolver pilot for detail-only prerequisites/exclusive prerequisites. Exporter backlog remains valid if prerequisites should be emitted as public Codex facts/sections/API data. |
| Improvements | Split/defer. Rich export can help future detail/profile faction or constructible metadata. Exporter remains owner of missing public planning facts and thin public effect coverage. |
| Districts | Split/defer. Rich export can help future detail/profile faction/progression inspection. Exporter remains owner of public Category/Tier coverage and any canonical upgrade-chain metadata. |
| Populations | Rich resolver candidate. Exact rich population data can power future row/detail enrichment. No new exporter backlog is needed unless canonical public metadata is missing after category evolution. |
| Quests | Exporter-owned for Codex grouping. Quest Explorer export is route-owned and not 1:1 with Codex Quest records. Do not use it to group Codex rows. |
| Equipment | Exporter-owned. No rich sibling exists; reference coverage and icon metadata stay in backlog. |
| Traits | Exporter-owned. No rich sibling exists; ownership, category semantics, reference coverage, and icon metadata stay in backlog. |
| Actions | Exporter-owned. No rich sibling exists; ownership, reference coverage, and browse metadata stay in backlog. |
| Diplomacy | Exporter-owned. No rich sibling exists; runtime values, relationship direction, and treaty icon metadata stay in backlog. |
| Resources | Codex-owned reference sheet for now. No rich sibling or exporter issue identified. |
| Statuses | Codex-owned archive for now. No rich sibling; future exporter issues should be backlog items only when source data proves them. |

## Backlog Overlap Review

### Keep In Exporter Backlog

- Ability `Combat role` cleanup and explicit ability ownership.
- Equipment granted ability reference coverage and item icon metadata.
- Trait ownership/category semantics/reference coverage/icon metadata.
- Action ownership/reference/browse metadata.
- Diplomacy runtime values, relationship direction, and treaty icon metadata.
- Quest canonical archive grouping metadata.

These require canonical public metadata or have no rich sibling source.

### Move To Rich Resolver Roadmap

- Tech detail prerequisites/exclusive prerequisites for EWShop Codex detail
  pages.
- Unit detail previous/evolves-into links and grouped public ability inspection.
- Hero detail origin/class/skill profile enrichment.
- Population detail/profile enrichment if Populations becomes a richer category.

These can be piloted without changing exporter contracts when exact rich sibling
records and public Codex link targets resolve.

### Split

- Technology prerequisites: resolver can solve EWShop detail UI now; exporter
  still owns canonical public Codex/API prerequisite metadata if needed.
- Unit evolution: resolver can solve EWShop detail UI now; exporter still owns
  public Codex/API evolution metadata if needed.
- Hero granted abilities/skills: resolver can enrich details from exact rich
  data; exporter still owns public reference coverage and stable presentation
  metadata.
- District/Improvement planning metadata: rich imports can help future detail
  inspection; exporter still owns public row-ready facts, thin-row content, and
  canonical progression metadata.
- Ability tactical profiles: rich import may enrich details; exporter still owns
  public role labels and explicit ownership.

## Open Questions

- Should rich/domain exports be loaded through backend APIs, static local-import
  routes, or a future normalized frontend data service?
- Should the first resolver live beside existing Codex helpers or inside a
  feature-specific rich import module?
- How should tests inject rich sibling data without making `CodexPage.test.tsx`
  harder to review?
- Which rich fields are public enough for detail inspection versus diagnostics
  only?

## Final Recommendation

Proceed with the hybrid resolver approach from the audit, starting with
`CODEX-RICH-001 - Tech Detail Prerequisite Enrichment`.

Keep the DB exporter backlog, but annotate overlapping items as split ownership
rather than deleting them. The first resolver should prove that EWShop can enrich
Codex from exact rich siblings while preserving Codex exporter boundaries and
route ownership.

For the current runtime/import inventory and category-by-category ownership
matrix, use
`docs/active/codex-rich-vs-codex-import-architecture-decision.md`.
