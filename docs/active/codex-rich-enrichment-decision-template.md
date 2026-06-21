# Codex Rich Enrichment Decision Template

Status: active template  
Created: 2026-06-21  
Related:

- `docs/active/codex-rich-vs-codex-import-architecture-decision.md`
- `docs/active/codex-export-vs-rich-export-boundary.md`
- `docs/active/codex-rich-import-enrichment-audit.md`

## Purpose

Use this template before adding any new Codex rich-import enrichment slice.

`CODEX-RICH-001` and `CODEX-RICH-002` proved that the architecture works: Codex
can safely enrich detail pages from exact rich sibling records, fail closed, and
avoid route-owned UI. They also proved that technical cleanliness is not enough.
Future resolver work must earn its place through player value.

## Proof-Of-Pattern Review

### CODEX-RICH-001 - Tech Detail Prerequisite Enrichment

What it added:

- Compact `Prerequisites` section on Tech detail pages.
- Exact links for `Requires` and `Exclusive with`.
- Existing Codex tooltip/click behavior.
- Detail-only enrichment; archive rows and `/tech` remain unchanged.

Assessment:

- Frontend architecture value: **8/10**. Clean exact-key resolver, store-backed,
  fail-closed, route boundary respected.
- 4X player value: **5/10**. Useful for permalink inspection, but most planning
  still happens in `/tech`.
- UI/UX value: **5/10**. Clear and harmless, but not transformative.
- Maintenance cost: **low-medium**. Small helper/component/tests, but still
  another category-specific path.

Decision:

- Keep as-is.
- Do not expand into tree/progression UI inside Codex.
- Do not add more Tech resolver work unless a future review shows player value
  above the threshold below.

### CODEX-RICH-002 - Unit Detail Evolution/Profile Enrichment

What it added:

- Compact `Evolution` section on Unit detail pages.
- Exact links for `Previous` and `Evolves into`.
- Existing Codex tooltip/click behavior.
- Detail-only enrichment; archive rows and `/units` remain unchanged.

Assessment:

- Frontend architecture value: **8/10**. Same good boundary as Tech, with exact
  public Codex Unit targets only.
- 4X player value: **6/10**. Evolution adjacency is more noticeable than Tech
  prerequisites in Codex, but the richer comparison/explorer value still belongs
  in `/units`.
- UI/UX value: **6/10**. Good trust/permalink value, not a primary browsing
  improvement.
- Maintenance cost: **low-medium**. Acceptable, but repeated helpers/components
  will add up quickly.

Decision:

- Keep as-is.
- Do not add full evolution-chain UI inside Codex.
- Treat as the upper bound for small detail-only resolver value.

## Cross-Slice Lessons

- Category-specific resolvers are the right default. Do not create a generic
  enrichment framework from two slices.
- Exact `entryKey` or explicit reference matching is mandatory.
- Rich enrichment should fail closed and leave Codex usable.
- Resolver output should remain detail/profile inspection unless row value is
  explicitly approved.
- Existing Codex inline link/tooltip behavior should be reused.
- A resolver that needs new importer/API/store work must clear a higher
  player-value bar than one using an already imported store.
- If the player value is modest, prefer no-op or exporter backlog over adding
  more frontend code.

## Decision Template

Copy this section into the category evolution document before proposing rich
enrichment.

### Category

### Current Codex State

- Entry count:
- Current row value:
- Current detail value:
- Current filters/navigation:
- Known gaps:

### Existing Rich Export State

- Rich export exists:
- Exact sibling identity:
- Rich fields being considered:
- Rich route already owns this domain:
- Diagnostics/internal fields present:

### Is Rich Export Imported Today?

- Backend import/API:
- Frontend store:
- Existing runtime load path:
- Would new importer/API/store work be required:

### Player Problem

What player-facing question cannot be answered well today?

### Desired Data

List the exact fields/relationships needed. Mark each as:

- row/search/filter useful;
- detail/permalink useful;
- route-owned deep system;
- internal/diagnostic;
- canonical public metadata.

### Candidate Owner

Choose one primary owner per field:

- Codex export;
- rich/domain export;
- frontend resolver;
- DB exporter backlog;
- defer/no-op.

### Required Decision Questions

1. Is the missing data public encyclopedia/archive metadata?
2. Is it useful in rows, filters, search, or only detail?
3. Is it shallow enough for Codex export?
4. Is it structured domain/progression data?
5. Is there an existing rich import/store/API?
6. Does using it require new backend importer/API/store work?
7. Would the player actually notice or use this?
8. Does it duplicate a dedicated rich route?
9. Does it require key/name/prose/SVG inference?
10. Can it fail closed without degrading Codex?
11. Does it create coupling to route-owned UI?
12. Is the expected value worth the docs/tests/code cost?

### Scoring

Use a 1-10 scale unless otherwise noted.

| Score | Value |
| --- | --- |
| Player value | |
| Architecture risk | |
| Implementation cost | |
| Route-duplication risk | |
| Exporter dependency | none / low / medium / high |

### Recommended Action

Pick one:

- enrich Codex export;
- import rich export then resolver;
- use existing rich import resolver;
- exporter backlog only;
- defer/no-op;
- product/design review first.

### Stop Conditions

Stop or defer when any apply:

- player value is below **6/10**;
- implementation requires route-owned UI logic;
- implementation requires key/title/prose/SVG inference;
- implementation duplicates a rich route;
- implementation creates a broad generic framework;
- implementation imports a rich domain only for tiny detail value;
- data is internal/diagnostic rather than player-facing;
- desired field is canonical ownership/grouping/identity/icon metadata that
  should be exporter-owned.

## Future Category Recommendations

| Category | Likely best owner | Rich import worth it? | Next action |
| --- | --- | --- | --- |
| Heroes | Split: exporter for public refs/icons; rich Hero/Skills only for approved detail profile. | Not yet. Requires importer/API/store work and a high-value Hero skill/profile decision. | Product/design review first. |
| Skills | Rich/domain export. | Maybe, but as Hero sidecar or future route/category, not automatic Codex enrichment. | Defer/no-op until Hero skill UI is approved. |
| Populations | Rich resolver candidate if category evolves beyond reference sheet. | Maybe; small dataset and exact rich sibling, but player value must be proven. | Audit before importer work. |
| Abilities | Exporter for ownership/roles; rich resolver only for detail tactical inspection later. | Not now. Current Ability archive already has strong effect rows. | Exporter backlog first. |
| Districts | Split: Codex/exporter for public facts; existing rich store for optional detail profile. | Low-medium. Current archive is already useful. | Defer unless detail profile value scores high. |
| Improvements | Split: Codex/exporter for public facts; existing rich store for optional detail profile. | Low-medium. Current archive is already useful. | Defer unless detail profile value scores high. |
| Quests | Exporter-owned for canonical grouping. | No for Codex grouping. Quest Explorer data is route-owned and not 1:1. | Exporter backlog only. |
| Equipment | Codex/exporter-owned. | No rich sibling today. | Exporter backlog for icons/reference coverage. |
| Traits | Codex/exporter-owned. | No rich sibling today. | Exporter backlog for ownership/category semantics. |
| Actions | Codex/exporter-owned. | No rich sibling today. | Exporter backlog only if public metadata is source-proven. |
| Diplomacy | Codex/exporter-owned. | No rich sibling today. | Exporter backlog for runtime/static direction and icon metadata. |

## DB Exporter Guidance

DB Exporter should generally:

1. enrich rich/domain exports with source-truth domain structures;
2. project public encyclopedia facts, sections, and references into Codex
   exports;
3. keep Codex exports shallow and player-facing;
4. avoid making Codex export a full rich/domain graph;
5. provide canonical public metadata for ownership, grouping, identity,
   references, and icon/art contracts.

Examples:

- Tech prerequisites: rich export owns graph structure; Codex exporter may emit
  shallow public prerequisite facts if they should be API-visible Codex metadata.
- Unit evolution: rich export owns evolution structure; Codex exporter may emit
  public previous/evolves-into facts if the relationship should be canonical
  Codex metadata.
- Hero skills: rich Hero/Skills exports own skill-tree structure; Codex exporter
  owns public granted-skill/reference coverage and stable presentation metadata.
- Quest grouping: exporter-owned. Do not expect frontend to infer grouping from
  titles, keys, or Quest Explorer path data.
- Ability ownership/role cleanup: exporter-owned because it is public archive
  metadata.
- Equipment icons/references: exporter-owned unless a future explicit rich
  Equipment import is created.

## Recommendation

Do not immediately start another rich resolver after Tech and Units.

The proof-of-pattern work should stand, but the best next move is to use this
template as a gate. Future resolver work should proceed only when:

- the category already has an imported rich store, or importer work is clearly
  justified;
- player value is at least **6/10**;
- the enrichment is detail/profile inspection, not route duplication;
- exact identity/reference matching is available;
- exporter-owned public metadata gaps remain in the backlog instead of being
  patched by frontend inference.

If the next candidate is Heroes/Skills or Populations, run the template first
and be prepared for the answer to be **defer/no-op**.
