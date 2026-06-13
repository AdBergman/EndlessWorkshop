# Codex Content Quality Final Exporter / Editorial Follow-Up

Status: final current exporter/editorial follow-up
Created: 2026-06-13
Updated: 2026-06-13
Owner: DB exporter/editorial team, with EWShop as consumer

## Goal

Use the latest EWShop Codex content-quality diagnostic to improve public Codex
data quality. EWShop frontend polish is complete for the current imports; the
remaining findings are exporter/editorial-owned.

## Source Run

From `frontend/`:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Current local import result:

- Entries scanned: 2459
- Total findings: 250
- High severity: 250
- Medium severity: 0
- EWShop-owned findings: 0
- Exporter-owned findings: 250

Issue type counts:

- `missing-player-context`: 238
- `raw-internal-text`: 12

## Interpretation

The default diagnostic no longer reports exact `descriptionLines` that duplicate
exported facts. Current EWShop Codex rendering prefers exported facts and
sections, and exported metadata entries do not render fallback
`descriptionLines` as detail body text. Search, result rows, and related
previews also prefer structured metadata.

Treat duplicate description lines as source hygiene evidence for non-EWShop
consumers if needed, but not as a current player-facing EWShop problem.

The current exporter/editorial priority is the high-severity set:

1. Entries with only classification facts and no player-facing context.
2. Public fields that still contain raw internal keys instead of display labels,
   typed references, or effect text.

## Exporter / Editorial Requests

### Add Player Context To Classification-Only Entries

Several entries have structured facts but no explanation of effect, source,
unlock, requirement, or why the player should care. These pages render cleanly
in EWShop, but feel like database rows rather than a strategy companion.

Expected exporter/editorial fixes:

- Add a short public effect or purpose line when a canonical source exists.
- Add source, unlock, requirement, target, cost, duration, or usage context when
  those fields are known.
- Prefer exported `facts`, `sections`, `publicContextKeys`, and stable
  references over prose-only strings.
- Suppress rows from public Codex exports if no public-facing context can be
  safely derived.

Public-safe examples:

| Category | Entry key | Current issue | Requested improvement |
| --- | --- | --- | --- |
| abilities | `UnitAbility_Blossom_1` | Classification facts only | Add player-facing effect, source, and usage context. |
| actions | `ActionTypeArmyStealTerritory` | Classification facts only | Add effect, cost/requirement, source, and target context where known. |
| bonuses/statuses | `Status_AdministrativeCenter_Subjugation` | Classification facts only | Add effect, duration/source, and affected target context. |
| districts | `District_Bridge` | Classification facts only | Add use, construction/source, unlock, or placement context. |
| improvements | `DistrictImprovement_Bridge_01` | Classification facts only | Add effect, unlock/source, and player-facing purpose. |

### Replace Raw Internal Text In Public Fields

Some public facts or section lines still contain key-like values. EWShop should
not invent display labels or mechanics from these strings.

Expected exporter/editorial fixes:

- Export public display labels instead of raw keys where a public label exists.
- Export typed references when the relationship matters more than the text
  label.
- Suppress raw generated description keys from public fields if they cannot be
  resolved.
- Keep diagnostics-only values out of product Codex content.

Public-safe examples:

| Category | Entry key | Current issue | Requested improvement |
| --- | --- | --- | --- |
| populations | `Population_Aspect` | Fact value contains `Faction_Aspect`. | Export the public display label or a typed faction reference. |
| populations | `Population_KinOfSheredyn` | Fact value contains `Faction_KinOfSheredyn`. | Export the public display label or a typed faction reference. |
| councilors | quest reward councilor row | Public description field contains a generated description key. | Export resolved public copy or suppress the raw field. |
| traits | public faction quest bundle trait | Section lines contain raw quest/action keys. | Export public labels or typed references for linked quest/action content. |

## EWShop Notes

EWShop already handles the following locally:

- Generic metadata preservation and rendering.
- Actions, Diplomatic Treaties, and Statuses category exposure.
- Modifier rows remain searchable/linkable while hidden from top-level
  navigation.
- Search indexes structured metadata.
- Related chips use structured previews.
- Category overview and compact summaries use player-facing presentation.
- Duplicate fallback `descriptionLines` are not treated as current product UI
  defects when exported facts/sections exist.

Do not request frontend hacks for the remaining 250 findings. They are
exporter/editorial data-quality issues unless a new browser QA bug proves
otherwise.

## Remaining EWShop-Only Blockers

None known for the current local imports. Keep EWShop follow-up limited to real
bug reports, release-safety issues, or browser QA regressions.

## Out Of Scope

- SEO work.
- Graph visualization.
- EWShop redesign.
- EWShop frontend polish for already-completed Codex presentation work.
- Exporting hidden or unreleased content.
- Rendering diagnostics JSON as product UI.
