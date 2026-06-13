# Codex Content Quality Diagnostics

Status: active workflow
Created: 2026-06-12
Owner: EWShop, with exporter/editorial handoff follow-up

## Purpose

Use the Codex content-quality diagnostic to separate three different problems:

- EWShop presentation noise that is still visible after current Codex rendering.
- Missing metadata where text looks structured but is not exported as facts or
  sections.
- Source/editorial Codex data that needs DB exporter or content-team follow-up.

This is not an admin UI workflow yet. The useful surface for current AI-assisted
review is deterministic text output that can be pasted into Codex or attached to
handoff docs.

## Run

From `frontend/`:

```bash
npm run diagnostics:codex-content
```

Optional inputs:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-content -- --input ../local-imports/codex/ewshop_equipment_codex_export_0.80.json
```

Default input is `../local-imports/codex`.

## Output Model

Each finding has:

- category and entry key;
- issue kind;
- severity;
- owner;
- exact field path;
- visible value;
- reason;
- recommended next action.

Owners mean:

- `EWShop`: safe display cleanup, such as hiding duplicate fact lines.
- `Exporter`: source data, missing metadata, placeholder text, raw generated
  names, or missing public explanation.
- `Both`: EWShop can mask the symptom, but exporter/editorial data should still
  improve.

## Current Generic Rules

The first diagnostic pass is universal across Codex categories. It flags:

- placeholder-looking text, including `TBD`, `TODO`, `placeholder`, and
  `SpecificNN`;
- raw internal text such as `UnitClass_*`, `ActionType*`, `Effect_*`,
  `*Definition_*`, and cost-modifier keys;
- raw labels such as `Reference key`, `Operation`, `Value type`, `Target scope`,
  and `Display value`;
- fact-shaped description text when structured facts are missing;
- entries with only classification facts and no player context;
- zero-value effect lines such as `+0 Dust`;
- formula-like text that needs a player-facing explanation.

Exact `descriptionLines` that duplicate exported facts are not reported by the
default diagnostic anymore. Current EWShop rendering already prefers exported
facts and sections for metadata-rich entries, so those raw duplicates are source
hygiene rather than current player-facing UI defects.

The implementation has a category-rule hook for future tuning, but the default
rules should stay conservative until a current local import proves a
category-specific rule is worth adding.

## Review Workflow

1. Run the diagnostic against current local Codex imports.
2. Read the summary by owner and issue type.
3. For `EWShop` findings, batch only high-value low-risk display fixes.
4. For `Exporter` findings, copy representative examples into the active
   exporter handoff or create a short focused handoff doc.
5. For `Both` findings, decide whether EWShop masking is enough for the current
   release or whether exporter/editorial follow-up should remain explicit.
6. Keep active docs short; archive completed evidence bundles under
   `docs/archive/`.

## Not In Scope

- SEO work.
- Graph visualization.
- New Codex categories.
- Inventing strategy summaries not supported by current data.
- Treating diagnostics as release gates before product review.
