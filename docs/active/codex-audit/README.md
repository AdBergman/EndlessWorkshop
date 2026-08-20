# Codex Comprehensive Audit

Status: active remediation program
Created: 2026-08-18
Branch: `codex/codex-comprehensive-audit`

## Purpose

This bundle is the durable source of truth for the 2026-08-18 EWShop Codex
forensic quality audit. It covers every current user-facing or
direct/search-linkable Codex category discovered from the repository and local
0.82 export snapshot.

The audit separates:

- frontend presentation/filtering gaps;
- backend/API/import preservation gaps;
- EWShop pipeline losses from already-exported data;
- proven DB Exporter requests.

It does not implement the remediation backlog.

## Files

- `audit-methodology.md` - scoring anchors, source hierarchy, and confidence
  labels.
- `codex-inventory.md` - master category inventory, counts, source paths,
  renderers, filters, relationship/icon behavior, and scores.
- `category-audits.md` - one compact forensic audit per current category.
- `implementation-backlog.md` - prioritized `EW-CODEX-*` remediation stories.
- `exporter-request-register.md` - proven `DBX-CODEX-*` exporter requests only.
- `systemic-review.md` - cross-category root causes and reusable opportunities.

## Headline Findings

- Current Codex inventory is 24 normalized categories: 19 public top-level, 2
  local-only Victory categories, and 3 hidden/support categories.
- The generic Codex pipeline preserves `descriptionLines`, `referenceKeys`,
  `facts`, `sections`, `publicContextKeys`, and optional `svgIcon`; broad data
  loss is not happening in the generic Codex mapper.
- Rich exports exist for abilities, districts, improvements, factions, heroes,
  populations, Quest Explorer, skills, tech, and units; EWShop currently imports
  districts, improvements, factions, heroes, skills, Quest Explorer, tech, and
  units through rich APIs.
- District placement/terrain/resource-deposit information is present in rich
  exporter JSON. `EW-CODEX-DISTRICTS-001` fixed the EWShop rich constructible
  DTO/domain/persistence/API/frontend loss for neighbour, terrain, river, and
  point-of-interest placement fields. Do not ask DB Exporter for generic
  "district adjacency" unless a follow-up re-audit proves source data is still
  missing after this preservation path.
- Councilor completeness is not proven to be an EWShop filtering issue:
  `councilors-codex` has 43 rows, no EWShop councilor-specific filter, and no
  imported rich sibling source. Any completeness claim needs exporter/source
  confirmation.
- Top-level suppression of Quests, Modifiers, Extractors, and public Victory
  categories is intentional product/navigation policy, not missing import.

## Verification

Evidence used:

- `local-imports/codex/*.json`
- `local-imports/exports/*.json`
- generic Codex import/API/frontend store code
- category mode, visibility, rail/filter helpers, archive/detail renderers
- rich constructible, tech, unit, faction, hero, and skill import/store paths
- active category evolution and release-readiness docs
- `npm run diagnostics:codex-player-content` for player-facing public records
  missing category-relevant gameplay content

No production imports, remote infrastructure, or broad verification test suites
were run for this documentation-only audit.
