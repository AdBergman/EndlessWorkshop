# Cross-Codex Systemic Review

## Root-Cause Distribution

Significant findings from the audit:

| Classification | Count | Main examples |
| --- | ---: | --- |
| FE | 5 | Faction profile shape, unresolved reference diagnostics, Councilor row/Role polish after completeness confirmation, Trait exact-origin metadata review, small fallback polish. |
| BE | 0 | No pure backend-only issue was isolated; current blockers are either pipeline preservation across layers or exporter metadata. |
| PIPELINE | 1 | Constructible placement fields already present in rich District/Improvement JSON are dropped by EWShop DTO/domain/API shape. |
| EXPORTER REQUEST | 5 | Victory `Master`, Modifier provenance, Ability role/ownership, Equipment icons/granted ability coverage, future Questline projection. |

## Systemic Opportunities

### Preserve Before Requesting Exporter Changes

Districts and Improvements show the clearest cautionary case. Rich exporter JSON
contains structured placement data, but EWShop preserves only `neighbourTiles`.
Future exporter requests for placement/adjacency should wait until EWShop
preserves and renders the current terrain/river/POI fields.

Recommended action: implement `EW-CODEX-DISTRICTS-001` before drafting any new
district placement exporter request.

### Maintain Generic Codex Import Discipline

The generic Codex import path is working: facts, sections, references, public
context keys, and `svgIcon` survive import/API/frontend normalization. The risk
is flexibility: any future diagnostics-looking Codex file with `entries[]` could
be imported unless the deny-list is maintained.

Recommended action: keep diagnostics-only export kinds covered by
`LocalStartupImportRunnerTest` and update the deny-list whenever DBExporter adds
new diagnostics bundles.

### Treat Visibility as Product Policy

Hidden/local-only categories are not import failures:

- `extractors`: support/reference targets reached through Resources/search.
- `modifiers`: exact-link inspection targets, not public browsing.
- `quests`: hidden because `/quests` owns the rich experience.
- `victoryconditions`/`victorypaths`: local-only because of known `Master`
  path quality caveat.

Recommended action: every future visibility change should cite product/data
evidence and preserve direct/search access where useful.

### Use Rich Resolvers Only for Exact Sibling Data

Rich detail enrichment is successful for Tech, Units, Factions, Heroes/Skills,
and constructibles because it is exact-key based and fail-closed. This pattern
is good, but should not become a generic framework until more categories need
the same behavior.

Recommended action: keep product-specific helpers near Codex feature code;
extract common resolver primitives only if two or more future slices duplicate
substantial logic.

### Strengthen Unresolved Reference Diagnostics

Exact reference keys are a strategic asset, but unresolved clusters currently
no longer require only ad hoc investigation. `EW-CODEX-REL-001` added
`npm run diagnostics:codex-references`, which reuses canonical Codex reference
resolution and sorts missing refs by source category, source entry, field/index,
target prefix, diagnostic kind, visibility class, and classification.

Recommended action: run the diagnostic when comparing new Codex releases or
exporter responses; create evidence-backed backlog/exporter items for high
signal unresolved clusters rather than expanding the diagnostic slice.

### Keep Icon Resolution Contract-Bound

Current icon behavior is safe:

- Abilities use explicit `svgIcon` metadata only when `source` is
  `ability-icons`.
- Resource/extractor icons resolve from token/resource helpers.
- Factions/minor factions use faction icon resolver.
- Other categories fall back to configured kind icons.

Recommended action: do not infer precise item/trait/treaty/councilor icons from
raw SVG filenames. Ask for explicit metadata when identity icons matter.

### Avoid Recreating Route-Owned Explorers

Tech, Units, and Quests have or depend on route-owned experiences. Codex should
remain an encyclopedia/archive companion:

- `/tech` owns tree/progression exploration.
- `/units` owns unit evolution exploration.
- `/quests` owns quest strategy/lore branching.

Recommended action: Codex may show compact exact links and detail-side
summaries, but not duplicate those route models.

### Score and Backlog by Player Value, Not Data Volume

Categories with many rows are not automatically high priority. Resources has
only 24 rows but is mature and useful. Actions has 128 public rows but is less
useful because metadata is sparse/noisy. Victory has compact data but remains
local-only due trust risk.

Recommended action: prioritize misleading or pipeline-lost data before purely
visual polish.

## Non-Opportunities

- Do not create a universal Codex archive framework right now. Existing
  category-specific modes are verbose but keep product behavior explicit.
- Do not make all categories full-width reference sheets. Traits needed a rail;
  Councilor/Partner Effects and Resources did not.
- Do not expose rich `abilities` or rich `populations` just because files exist.
- Do not make a public Skills category from Hero sidecar data without product
  ownership.
- Do not broaden public Victory visibility until exporter data quality is
  resolved.
