# Codex Audit Methodology

## Evidence Order

Use this order before assigning ownership:

1. Local DBExporter JSON under `local-imports/codex/` or
   `local-imports/exports/`.
2. Import DTOs and mappers.
3. Domain model, service filters, repository persistence.
4. Public API DTO/facade/controller.
5. Frontend API client, stores, selectors, and transformation helpers.
6. Rendered Codex archive/detail behavior.
7. Existing active docs only as accepted product/architecture decisions, not as
   replacement for current code/data evidence.

Do not label a finding `EXPORTER REQUEST` unless source JSON was checked and the
information is absent or explicitly non-public/runtime-only.

## Pipeline Trace Template

For representative records, trace:

`EL2 DBExporter JSON -> EWShop import DTO -> mapper/import service -> domain/storage -> public API DTO -> frontend transformation -> rendered Codex experience`

Use this field-loss table when useful:

| Field / information | Export | Import DTO | Stored | API | Frontend | Rendered | Status |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |

## Scores

Scores are independent 0-10 ratings. They should not be averaged mechanically.

### UX Maturity

- 0-2: barely browsable; generic/raw output hides most useful information.
- 3-4: usable only through search or detail drilling; weak hierarchy.
- 5-6: functional archive/reference experience with meaningful gaps.
- 7-8: strong category-specific scanning, filtering, and detail support.
- 9-10: excellent player-facing information design; few known gaps.

### Information Completeness

- 0-2: most expected player-facing data absent from EWShop-visible data path.
- 3-4: enough for identity, but missing core planning dimensions.
- 5-6: useful baseline with notable missing structured facts or relationships.
- 7-8: most expected information present through Codex or rich data.
- 9-10: complete for current game/static encyclopedia expectations.

### Hardcore 4X Usefulness

- 0-2: mostly implementation trivia or isolated labels.
- 3-4: occasional lookup value, poor comparison/planning value.
- 5-6: answers common questions but weak for strategy comparison.
- 7-8: valuable for planning, comparison, and exact reference lookup.
- 9-10: central strategy tool for expert play.

### Data Trust / Cleanliness

- 0-2: unresolved localization, internal rows, duplicates, or misleading data
  dominate.
- 3-4: significant noise, missing identities, or suspicious metadata.
- 5-6: broadly usable, but known unresolved refs/noisy categories matter.
- 7-8: clean enough for public use with bounded caveats.
- 9-10: highly trustworthy public data with explicit caveats where needed.

## Confidence Labels

- PROVEN: confirmed in current source code and local JSON.
- STRONG EVIDENCE: supported by multiple current artifacts; small uncertainty
  remains because runtime/browser rendering was not executed.
- SUSPECTED: plausible from current evidence but needs focused verification.
- UNKNOWN: not enough current evidence to claim.

## Finding Classifications

Every actionable finding has exactly one primary classification:

- FE: data reaches frontend; issue is presentation, filtering, sorting,
  navigation, linking, or client transformation.
- BE: source data exists but backend import/domain/storage/API changes are
  required.
- PIPELINE: exporter supplies information but EWShop loses, misclassifies,
  filters, or incorrectly transforms it before useful display.
- EXPORTER REQUEST: strategically necessary information is genuinely absent
  from available exporter JSON and cannot be safely derived.

If several layers are involved, classify by the primary blocker.
