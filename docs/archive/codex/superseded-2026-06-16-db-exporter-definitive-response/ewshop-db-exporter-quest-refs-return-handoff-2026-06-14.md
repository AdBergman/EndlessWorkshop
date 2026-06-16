# EWShop Return Handoff: CDEX-EXP-008 Quest Refs

Status: implemented and F8-validated
Date: 2026-06-14
Source handoff:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`

## Scope

Implemented `CDEX-EXP-008` only:

- structured Quest Codex `Requirements.items[]` from canonical quest prerequisite source data;
- structured Quest Codex `Rewards.items[]` from canonical quest completion reward source data;
- exact `referenceKey` only when the target is in the public Codex key cache;
- typed facts such as `Requirement type`, `Reward type`, `Required count`, and `State` when canonical;
- filtering of non-public quest formula/source keys such as `Quest_Money01` from public `referenceKeys`;
- validation for noisy quest section item refs and structured quest metadata counts.

Not implemented:

- Resources.
- Actions.
- Quest branching/continuity rewrites.
- Broad thin entity cleanup.
- Fuzzy/prose/display-name inferred refs.

## Contract Compatibility

No Codex root shape changed.
No `exportKind` changed.
No existing fields were removed or renamed.
No EWShop importer migration should be required.

Changes use existing generic Codex fields only:

- `referenceKeys`
- `publicContextKeys`
- `sections`
- `sections[].items[]`
- `sections[].items[].referenceKey`
- `sections[].items[].facts[]`

## Source Rules

Quest refs are generated only from structured quest source data already walked by the Quest Codex exporter:

- `QuestStepGeneric.SelectionPrerequisite`
- `QuestStepGeneric.CompletionPrerequisite`
- `QuestStep.EffectAtCompletion`

Public refs are allowed only when the key is present in the public Codex key cache built from current Codex exports and quest definitions.

Text-only rows remain text-only when a target is unresolved, ambiguous, not public-safe, or belongs to a blocked packet such as Resources or Actions.

## Implemented Requirement Metadata

Structured requirement items are emitted for canonical public-safe requirement kinds:

- quest location interaction;
- constructible build requirements;
- technology state requirements;
- resource stock requirements as typed text-only items;
- curiosity collection requirements.

Exact `referenceKey` is emitted only for public constructible/technology targets. Quest POI and resource requirements stay text-only/typed because they are not public Codex entities in this packet.

## Implemented Reward Metadata

Structured reward items are emitted when the reward target resolves to a public Codex entry:

- equipment;
- faction/protectorate trait;
- public unit ability;
- technology;
- population;
- hero.

Currency/resource/formula rewards remain text-only because Resources are blocked and formula keys such as `Quest_Money01` are not public Codex entities.

## Validation Results

Build and static validation:

- `dotnet build EL2.DBExporter.csproj -c Debug`: passed with 0 warnings and 0 errors.
- Python validation script syntax checks: passed.
- DLL installed to BepInEx before F8.

Runtime export:

- Snapshot: `export-snapshots/quest-refs-cdex-exp-008-merged-sections-20260614`
- Validation report: `export-reports/quest-refs-cdex-exp-008-merged-sections-20260614_validation.md`
- Diff report: `export-reports/quest-refs-cdex-exp-008-20260614_to_quest-refs-cdex-exp-008-merged-sections-20260614_diff.md`
- Export session: `succeeded=18`, `failed=0`, `totalMs=4418`.
- Quests Codex timing: `elapsedMs=591`; public reference cache `keys=1337`, `phaseMs=315`.

Validation summary:

- `quests-codex`: 292 rows, 0 errors, 0 warnings.
- `quest-codex-structured-metadata`: 0 errors, 0 warnings.
- Structured Requirements items: 87 total, 12 with exact refs.
- Structured Rewards items: 128 total, 128 with exact refs.
- Duplicate quest section titles after merge correction: 0.
- No noisy `Quest_*`, POI, action, debug, descriptor, tag, mapper, or provenance refs found in public quest `referenceKeys`, section item refs, or item fact refs.

## Validated Example Outcomes

- The Great Dieback: construction requirement is a typed requirement item; no exact constructible ref was emitted because no public target was canonical.
- The Missing Youth: quest location and curiosity requirements are typed requirement items without POI keys.
- A Bloody Trail: quest location requirement is typed; luxury/resource reward remains text-only because Resource Codex is out of scope.
- The Day of Reckoning: victory path rewards remain text-only because no public Codex target is defined in this packet.
- A Tahuk's Fanaticism: equipment reward emits exact public `referenceKey` `Equipment_Armor_27_Definition`.

## Open Notes

- Quest reward/requirement metadata intentionally does not expose hidden choices or branch diagnostics.
- Public key cache intentionally excludes Actions and Bonuses for this packet.
- If EWShop wants Resource reward links, Resource Codex entity design must be decided first.
- Existing `descriptionLines` fallback remains intact. Structured quest items are merged into the existing generated `Requirements`/`Rewards` sections instead of creating duplicate section titles.
