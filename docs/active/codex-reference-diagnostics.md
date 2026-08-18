# Codex Reference Diagnostics

Status: active engineering diagnostic
Created: 2026-08-18

## Purpose

Use this diagnostic to compare Codex relationship quality across exporter
snapshots and EWShop imports. It reports unresolved or malformed references with
enough context to investigate them without adding player-facing warning noise.

The diagnostic reuses EWShop's canonical Codex reference resolver and
classification helpers. It does not infer relationships from prose, display
names, key fragments, or SVG filenames.

## Run

From `frontend/`:

```bash
npm run diagnostics:codex-references
```

Optional inputs:

```bash
npm run diagnostics:codex-references -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-references -- --input ../local-imports/codex/ewshop_abilities_codex_export_0.82.json
npm run diagnostics:codex-references -- --input ../local-imports/codex --format json --output ../docs/archive/codex/codex-reference-diagnostics.json
```

Default input is `../local-imports/codex`.

## Output Model

Each finding includes:

- source category;
- source entry display name and key;
- source field and index, either `referenceKeys[n]` or `publicContextKeys[n]`;
- referenced key;
- target prefix;
- diagnostic kind;
- likely visibility class;
- classification label.

Visibility classes separate resolved public targets, hidden support targets,
local-only targets, likely public misses, imported-domain misses, and
mechanical/internal-looking references. Treat these as investigation aids, not
automatic exporter requests.

## Current Snapshot

The 2026-08-18 local run checked 9,992 references and reported 271 unresolved
or malformed references before deduplication. High-signal examples include
unresolved Ability -> Status references such as `Status_Unit_Bodyguard`,
`Status_Unit_Entangled`, and `Status_Unit_Ecstatic`.

The output is deterministic and can be redirected with `--output` for release
or exporter comparisons.
