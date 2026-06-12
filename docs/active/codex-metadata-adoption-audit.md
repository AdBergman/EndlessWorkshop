# Codex Metadata Adoption Audit

Status: Phase 1 report before category implementation  
Created: 2026-06-11  
Related plan: `EW-CODEX-META-001`, `EW-CODEX-META-002`, `EW-CODEX-META-003`, `EW-CODEX-TAXONOMY-001`

## Summary

EWShop can already import, persist, and serve generic Codex metadata fields:

- `facts`
- `sections`
- nested section `items`
- nested item `facts`
- nested item `lines`
- `publicContextKeys`

The main blockers are frontend adoption and one backend/API filtering rule:

- Current `/api/codex` filtering still requires meaningful `descriptionLines`,
  so metadata-only rows are filtered even when `facts` or `sections` are rich.
- Current frontend detail rendering can use exported `facts` and `sections`, but
  section items are flattened into lines.
- Current related links only use `referenceKeys`; `publicContextKeys` are not
  used.
- Current category labels/order do not know the new normalized
  `diplomatictreaties` kind.
- Bonuses would currently become a visible extra category if enough rows pass
  the API filter, which conflicts with the link-target-first product decision.

Do not add Actions or Diplomatic Treaties navigation before fixing the generic
metadata/API and taxonomy gaps below.

## Backend Preservation

Verified by code inspection and targeted integration test.

- Generic DTOs already expose all metadata fields:
  `CodexImportEntryDto`, `CodexDto`.
- Persistence already stores metadata:
  `factsJson`, `sectionsJson`, and `publicContextKeys`.
- Added integration coverage in `CodexFacadeIntegrationTest` proving an
  arbitrary `actions` Codex entry preserves facts, nested section item facts,
  item lines, and public context keys through import, persistence, and read DTO.
- Targeted check passed:
  `./mvnw -pl facade -Dtest=CodexFacadeIntegrationTest test`

Important API filter gap:

- `CodexFilterService` rejects entries whose `descriptionLines` are empty or
  weak.
- Local `actions` export has 145 entries, 145 with metadata, and 0 with
  `descriptionLines`.
- Therefore Actions are not API-visible until the filter treats structured
  metadata as meaningful public content.

## Local Export Metadata Coverage

Checked against `local-imports/codex/*_codex_export_0.80.json`.

| Kind | Entries | Facts imported | Sections imported | Section items | publicContextKeys imported | descriptionLines |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| populations | 26 | 26 | 25 | 25 | 26 | 26 |
| units | 157 | 0 | 0 | 0 | 0 | 157 |
| heroes | 79 | 0 | 0 | 0 | 0 | 79 |
| abilities | 326 | 0 | 0 | 0 | 0 | 326 |
| tech | 133 | 0 | 0 | 0 | 0 | 133 |
| districts | 167 | 0 | 0 | 0 | 0 | 85 |
| improvements | 123 | 0 | 0 | 0 | 0 | 100 |
| traits | 178 | 0 | 0 | 0 | 0 | 178 |
| minor factions | 16 | 0 | 0 | 0 | 0 | 16 |

New candidate kinds:

| Kind | Entries | Facts | Sections | Section items | publicContextKeys | descriptionLines | Product note |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| actions | 145 | 145 | 52 | 52 | 145 | 0 | Metadata-rich but API-filtered today. |
| diplomaticTreaties | 22 | 22 | 8 | 0 | 22 | 22 | Ready after taxonomy and generic rendering. |
| bonuses | 585 | 585 | 552 | 551 | 585 | 127 | Useful as link targets; labels are mixed quality. |

Abilities note:

- Local `ewshop_abilities_codex_export_0.80.json` still lacks
  `UnitAbility_Cumbersome` and `UnitAbility_NoRetaliate`.
- The active validation report says the newer exporter snapshot includes both
  and passes public unit ability coverage.
- Refresh local Codex fixtures before relying on local ability coverage results.

## Frontend Rendering Audit

Current renderer path:

- `CodexEntryDetail` delegates non-factions to `CodexStructuredDetail`.
- `CodexStructuredDetail` calls `parseCodexStructuredDescription`.
- Exported `facts` and `sections` are preferred when present.
- If no exported metadata exists, selected kinds fall back to parsing
  `descriptionLines`.

Per existing category:

| Kind | Facts rendered | Sections rendered | publicContextKeys used | Primary source today |
| --- | --- | --- | --- | --- |
| populations | Yes | Yes | No | Exported metadata |
| units | No | No | No | `descriptionLines` fallback |
| heroes | Text-derived facts only | No | No | Parsed `descriptionLines` |
| abilities | No | No | No | `descriptionLines` fallback |
| tech | No | No | No | `descriptionLines` fallback |
| districts | No | No | No | `descriptionLines` fallback |
| improvements | No | No | No | `descriptionLines` fallback |
| traits | Text-derived facts only | No | No | Parsed `descriptionLines` |
| minor factions | Text-derived facts only | No | No | Parsed `descriptionLines` |

Rendering gaps to fix before category work:

- Render exported section items as structured item rows rather than flattening
  `label: fact summary` into paragraph lines.
- Render nested item facts as compact sub-facts.
- Render item lines beneath their item label.
- Preserve description lines as fallback only when exported metadata is absent
  or clearly incomplete.
- Avoid showing `Reference key` as a prominent primary fact when it is merely
  implementation identity.

## Related Links Audit

Current related links:

- `resolveRelatedEntries` only iterates `referenceKeys`.
- `publicContextKeys` are normalized into the frontend store but not used for
  related links.
- Self-links are currently suppressed for `referenceKeys`, but the same policy
  needs to apply to `publicContextKeys`.

Required generic fix:

- Related resolution should combine `publicContextKeys` and `referenceKeys`,
  with `publicContextKeys` preferred for product links.
- Do not render unresolved raw keys.
- Suppress self-links and duplicate resolved targets.

## Taxonomy Review

Recommended category labels and visibility:

| Raw/export kind | Normalized frontend kind | Label | Visibility | Placement |
| --- | --- | --- | --- | --- |
| `actions` | `actions` | Actions | Top-level visible | After Abilities |
| `diplomaticTreaties` | `diplomatictreaties` | Diplomatic Treaties | Top-level visible | After Factions or before Quests |
| `bonuses` | `bonuses` | Bonuses | Hidden from main navigation initially | Deep-link / related target only |

Recommended top-level order after implementation:

1. Abilities
2. Actions
3. Councilors
4. Districts
5. Extractors
6. Equipment
7. Factions
8. Diplomatic Treaties
9. Heroes
10. Improvements
11. Minor Factions
12. Populations
13. Quests
14. Tech
15. Traits
16. Units

Do not show Bonuses as a top-level category until a product review accepts the
mixed label quality. The local export has many useful mechanics rows, but also
many raw-looking labels such as cost modifier names. Keep them linkable first.

## Updated Implementation Plan

1. Fix `CodexFilterService` so metadata-rich rows are API-visible even when
   `descriptionLines` are empty, while still filtering placeholder/unsafe names.
2. Upgrade `CodexStructuredDetail`/parser output to render exported section
   items and nested facts as first-class structured content.
3. Add taxonomy support for normalized `actions` and `diplomatictreaties`.
   Keep `bonuses` hidden from top-level navigation.
4. Implement Diplomatic Treaties vertical slice through the generic renderer.
5. Implement Actions vertical slice through the generic renderer.
6. Add related links from `publicContextKeys`.
7. Add Quest Strategy typed reference links for actions and treaties.
8. Import/render Bonuses as deep-link targets, not top-level navigation.
9. Add search/SEO for visible categories after category behavior is stable.

Stop point reached: this report should be reviewed before category work begins.
