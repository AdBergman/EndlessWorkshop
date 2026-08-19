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
- source top-level visibility;
- source entry display name and key;
- source field and index, either `referenceKeys[n]` or `publicContextKeys[n]`;
- referenced key;
- target prefix;
- diagnostic kind;
- imported-domain hint when the unresolved key looks like a rich/domain
  reference;
- likely visibility class;
- diagnostic classification label;
- root-cause class;
- whether the same unresolved relationship appears in both `publicContextKeys`
  and `referenceKeys`.

Visibility classes separate resolved public targets, hidden support targets,
local-only targets, likely public misses, imported-domain misses, and
mechanical/internal-looking references. Treat these as investigation aids, not
automatic exporter requests.

The report also includes reusable summary sections:

- category summaries with entry, reference, unresolved, policy/contract,
  duplicate identity, and strict-thin counts;
- relationship policy/contract findings for public records that point to
  hidden/local targets or rely on raw-key fallback;
- duplicate display identity groups by category and visibility;
- strict thin public records with no description, facts, sections, or refs.

## Current Snapshot

The 2026-08-19 local run checked 9,992 references and reported 271 unresolved
or malformed references before field-level deduplication, representing 146
unique unresolved relationships. Public-source entries account for 122 findings
and 61 unique unresolved relationships.

Root-cause classification from the upgraded diagnostic:

- 34 unique public unresolved relationships remain `unresolved pending further
  evidence`. Largest clusters are Unit/Faction/MinorFaction imported-domain
  aliases, Tech constructible aliases, Ability -> Status refs, and
  ProtectorateTrait refs.
- 26 unique public unresolved relationships are now classified as
  `expected thin/internal data`, mostly faction-prefixed `*_Effect_*`
  references emitted on Improvement rows.
- 1 unique public unresolved relationship is `relationship/reference policy`:
  `MinorFaction_SpecificQuest_MangroveOfHarmony01`, a hidden Quest-domain
  reference from a public Minor Faction.
- 0 strict thin public records were found by the reference diagnostic. The
  separate content-quality diagnostic still reports classification-facts-only
  District/Improvement records and Population raw-key text as exporter/editorial
  content issues.
- 79 public duplicate display identity groups were found. High-volume groups
  are District tier/faction variants, Protectorate Trait pairs, Tech faction
  variants, and Action empire/faction variants. These require product/source
  review before any identity merge or suppression.

Relationship-policy findings are intentionally not exporter bug counts:

- 4,095 public cross-entry references resolve only through raw-key fallback,
  with Units, Tech, Equipment, Traits, Councilors, Heroes, and Minor Factions as
  the largest buckets. This is contract looseness and a future hardening risk.
- 275 public relationships resolve to hidden support categories: mostly
  Ability/Action/Treaty/Faction links to hidden `bonuses` plus Minor Faction
  links to hidden Quests. This matches current hidden/support policy unless
  product decides those targets should become public.

The output is deterministic and can be redirected with `--output` for release
or exporter comparisons.
