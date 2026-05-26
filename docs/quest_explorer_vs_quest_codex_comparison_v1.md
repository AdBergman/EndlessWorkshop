# Quest Explorer vs Quest Codex Comparison v1

Status: investigation note - no behavior changes
Date: 2026-05-26
Canonical semantic reference: `docs/quest_explorer_canonical_semantics_v1.md`
Primary local evidence:

- `local-imports/exports/ewshop_quest_explorer_export_0.80.json`
- `local-imports/codex/ewshop_quests_codex_export_0.80.json`
- all `local-imports/codex/*_codex_export_0.80.json` files for reference resolution checks

`local-imports/` is local-only evidence and must not be committed.

## Executive Summary

Quest Codex and Quest Explorer are correctly separated conceptually.

Quest Codex is a flat encyclopedia/search projection. It should answer "what is
this quest record and what other records does it reference?" Quest Explorer is
the rich semantic quest chronicle/strategy projection. It should answer "how
does this quest chapter/task/decision/continuation work?"

The two exports are not interchangeable:

- Quest Codex deliberately flattens quest content into `descriptionLines` and
  `referenceKeys`.
- Quest Explorer preserves structured lore, objectives, requirements, rewards,
  topology, aliases, branch roles, reveal ownership, and backend-computed
  progression.

The split should remain. The main gaps are link-contract gaps, not evidence that
the projections should be merged:

1. Quest Explorer raw objectives contain `strategyView.objectives[].choiceKey`,
   but the current backend import/domain/API/frontend DTO chain drops it.
2. Quest Explorer reward/requirement `codexEntryKey` fields exist in the
   contract, but the live 0.80 export does not populate them.
3. Quest Codex quest grouping currently derives chapter/step/choice context from
   quest entry keys in the frontend. That is acceptable only as a Codex browsing
   heuristic, not semantic authority.
4. Quest Codex entries do not expose an explicit owner link to Quest Explorer
   canonical entries/aliases, even though the live keys line up exactly.
5. Quest Explorer does not currently render links to Codex entries for rewards,
   requirements, heroes, techs, traits, units, equipment, districts, or
   improvements.

## Responsibility Split

| Surface | Responsibility | Should Not Own |
| --- | --- | --- |
| Quest Codex export/model | Searchable encyclopedia rows, compact public quest descriptions, broad related-record references, category/kind browsing. | Branch semantics, lore ownership, Strategy/Lore state, decision classification, progression truth. |
| Quest Explorer export/model | Canonical quest semantics, chapter chronicle content, strategy objectives, requirements, rewards, branch topology, aliases, reveal ownership, terminal/failure/unresolved states. | Global encyclopedia search, generic Codex result grouping, broad non-quest catalog pages. |
| Shared future link layer | Exact key/alias resolution between Codex rows and Explorer entries, typed links from Explorer reward/requirement refs to Codex entries. | Replacing either projection or inferring quest semantics from titles/keys. |

## Export Shape Comparison

| Field Area | Quest Codex `quests` Export | Quest Explorer Export | Finding |
| --- | --- | --- | --- |
| Root metadata | `game`, `gameVersion`, `exporterVersion`, `exportedAtUtc`, `exportKind` | `schemaVersion`, `gameVersion`, `exporterVersion`, `exportedAtUtc`, `exportKind` | Explorer stores import metadata. Codex currently does not store/expose per-export metadata beyond row `exportKind`. |
| Entry identity | `entryKey` | `entryKey`, `aliases[]` | All Quest Codex quest rows map to either an Explorer `entryKey` or an Explorer alias. |
| Display name | `displayName` | `title` | Equivalent display role, but not a semantic join key. |
| Category/type | `category`, `kind` | `questType`, `isMandatory`, navigation faction/questline fields | Similar product classification, different contracts. Codex category is browsing-oriented. Explorer is topology/navigation-oriented. |
| Description | `descriptionLines[]` | `summaryLines[]`, `loreView.sections[].lines[]`, objective text, branch previews | Codex text is flattened. Explorer text is structured and owned. |
| References | `referenceKeys[]` | requirement/reward `referenceKind`, `referenceKey`, `referenceDisplayName`, `codexEntryKey`; reward `assetKind`, `assetKey`, `assetDisplayName` | Codex has broad raw references. Explorer has structured typed references but live `codexEntryKey` values are empty. |
| Lore/dialog | Flattened snippets in `descriptionLines` only | `loreView.sections[]` with section keys, phase, choice/objective anchors, reveal metadata, lines | Explorer is the canonical lore/chronicle source. |
| Strategy/objectives | Flattened `Objective:`, `Requirements:`, `Choices:` lines | `strategyView.objectives[]` with requirements and rewards | Explorer is the canonical strategy source. Current DTO drops raw objective `choiceKey`. |
| Branch topology | Flattened "Choices" and "Next" prose in `descriptionLines`; related quest keys in `referenceKeys` | `branches[]` with `sectionRole`, group metadata, parent/prerequisite/reveal metadata, next/failure/convergence links | Explorer is the canonical topology source. Codex should not infer semantics. |
| Formula/scaling rewards | Formula can appear embedded in a description line | `Reward.formulaText`, `amount`, `kind`, reference/asset fields | Explorer is the structured source for formulas. Codex is readable but not machine-structured. |
| Quality/progression diagnostics | none | `quality`, API-computed `progression.debugSummary` | Explorer owns semantic diagnostics. |

## Live Data Evidence

Live export counts:

| Metric | Count |
| --- | ---: |
| Quest Explorer entries | 149 |
| Quest Explorer aliases | 165 |
| Quest Explorer branches | 284 |
| Quest Explorer objectives | 419 |
| Quest Explorer lore sections | 775 |
| Quest Explorer lore lines | 3493 |
| Quest Explorer requirements | 1096 |
| Quest Explorer rewards | 756 |
| Quest Codex quest entries | 285 |
| All Codex entries across local Codex exports | 1697 |

Quest Codex quest categories:

| Category | Count |
| --- | ---: |
| Curiosity | 30 |
| EndGame | 4 |
| MajorFaction | 220 |
| MinorFaction | 31 |

Exact key/alias coverage:

| Check | Result |
| --- | --- |
| Quest Codex `entryKey` exactly equals Explorer `entryKey` | 120 / 285 |
| Quest Codex `entryKey` exactly equals Explorer `aliases[]` | 165 / 285 |
| Quest Codex `entryKey` missing from Explorer `entryKey` + aliases | 0 / 285 |
| MajorFaction Codex rows covered by Explorer `entryKey` + aliases | 220 / 220 |
| Explorer entries without a Codex self/alias row | 29 / 149 |

Interpretation:

- Codex-to-Explorer identity is strong when using explicit Explorer alias
  ownership.
- The 29 Explorer entries without Codex rows are internal/variant/outcome-style
  records, not evidence that Codex is missing normal quest encyclopedia rows.
- Codex should link to Explorer through exact entry/alias lookup, not through
  title or key parsing.

## Reference-Key Analysis

| Reference Set | Exact Resolution Result | Notes |
| --- | --- | --- |
| Quest Codex `referenceKeys` to all Codex entries | 212 / 305 unique keys resolve | Missing keys are mostly POI, reward-pool, faction-variant, minor-faction questline, world-hero quest, and one technology-style reference. |
| Quest Codex `referenceKeys` to Explorer `entryKey` | 56 / 305 unique keys resolve | Many Codex references point to non-Explorer catalog records or aliases, not canonical Explorer entries. |
| Quest Codex `referenceKeys` to Explorer aliases | 78 / 305 unique keys resolve | Alias resolution is necessary for Quest Codex -> Quest Explorer linking. |
| Quest Explorer reward/requirement `referenceKey` to all Codex entries | 127 / 132 unique keys resolve | Strong but not perfect. |
| Quest Explorer reward `assetKey` to all Codex entries | 104 / 108 unique keys resolve | Strong but not perfect. |
| Quest Explorer reward/requirement `codexEntryKey` to all Codex entries | 0 populated unique keys | Field exists in model/API but live export does not populate it. |

Unresolved Quest Explorer `referenceKey` examples:

- `Aspect_DistrictImprovement_04`
- `FactionTrait_Aspects_Chapter06_DistrictImprovement_FactionQuest`
- `FactionTrait_KinOfSheredyn_Chapter06_DistrictImprovement_FactionQuest`
- `HeroTrait_Confident`
- `Technology_CampTerraformation_00`

Unresolved Quest Codex `referenceKeys` include several expected non-Codex or
unsupported domains:

- POI-like keys: `TrailPOI`, `CollectibleQuest_001_POI`, `WorldHeroQuest_01_POI`
- reward-pool keys: `Quest_Luxury02`, `Quest_Science01`, `Quest_Money02`
- questline/faction family keys: `FactionQuest_Aspect`,
  `FactionQuest_KinOfSheredyn`
- minor-faction questline/POI keys:
  `MinorFaction_SpecificQuest_Ametrine`, `MinorFaction_GenericQuest_03_BranchB_POI`

## Backend Import, Storage, and API Comparison

### Quest Codex

Relevant files:

- `facade/src/main/java/ewshop/facade/dto/importing/codex/CodexImportBatchDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/codex/CodexImportEntryDto.java`
- `facade/src/main/java/ewshop/facade/mapper/CodexImportMapper.java`
- `domain/src/main/java/ewshop/domain/model/Codex.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/CodexEntity.java`
- `facade/src/main/java/ewshop/facade/dto/response/CodexDto.java`
- `api/src/main/java/ewshop/api/controller/CodexController.java`

Codex preserves:

- `exportKind`
- `entryKey`
- `displayName`
- `category`
- `kind`
- `descriptionLines`
- `referenceKeys`

Codex drops or does not store:

- root `game`
- root `gameVersion`
- root `exporterVersion`
- root `exportedAtUtc`
- any structured quest fields beyond generic lines/references

Assessment:

- The Codex row shape is appropriate for a generic encyclopedia.
- Missing root metadata is not currently product-breaking, but adding import
  provenance per export kind would help future diagnostics.
- Codex should not absorb Explorer branch/lore/strategy structures.

### Quest Explorer

Relevant files:

- `facade/src/main/java/ewshop/facade/dto/importing/quests/*`
- `facade/src/main/java/ewshop/facade/mapper/QuestExplorerImportMapper.java`
- `domain/src/main/java/ewshop/domain/model/quest/QuestExplorer.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/QuestExplorerEntryEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/mappers/QuestExplorerPersistenceMapper.java`
- `domain/src/main/java/ewshop/domain/service/QuestExplorerReadService.java`
- `domain/src/main/java/ewshop/domain/service/QuestExplorerProgressionProjector.java`
- `facade/src/main/java/ewshop/facade/dto/response/quests/QuestExplorerDto.java`
- `api/src/main/java/ewshop/api/controller/QuestController.java`

Explorer preserves:

- root metadata and `schemaVersion`
- entry identity, title, summaries, aliases
- navigation fields and link arrays
- lore sections and lines
- branch topology, role, reveal, prerequisite, convergence, failure, and
  continuation fields
- structured requirements and rewards, including `formulaText`
- backend-computed `progression` in the API response

Explorer drops:

- raw `strategyView.objectives[].choiceKey`

Assessment:

- Explorer is the correct source for canonical quest semantics.
- The objective `choiceKey` omission is the clearest actual data-loss gap.
- The live export also leaves `codexEntryKey` empty for requirements/rewards,
  which is an exporter/linking gap rather than a backend preservation problem.

## Frontend Comparison

### Quest Codex Frontend

Relevant files:

- `frontend/src/stores/codexStore.ts`
- `frontend/src/pages/CodexPage.tsx`
- `frontend/src/components/Codex/CodexEntryDetail.tsx`
- `frontend/src/components/Codex/CodexQuestProgression.tsx`
- `frontend/src/lib/codex/codexQuestGrouping.ts`
- `frontend/src/lib/codex/codexPresentation.ts`
- `frontend/src/lib/codex/codexRefs.ts`

Current behavior:

- Loads `/api/codex`.
- Uses `referenceKeys` to resolve related Codex entries.
- Groups quest Codex rows into a "Quest Progression" browsing widget by parsing
  quest entry keys.
- Does not load or consult Quest Explorer to resolve canonical chapter/alias
  ownership.

Assessment:

- Codex quest grouping is useful as an encyclopedia navigation aid.
- It is not canonical semantics because it depends on key-shape parsing.
- A future link to Quest Explorer should use exact Explorer `entryKey`/alias
  lookup, not the existing Codex key parser.

### Quest Explorer Frontend

Relevant files:

- `frontend/src/stores/questStore.ts`
- `frontend/src/types/questTypes.ts`
- `frontend/src/features/quests/questExplorerNormalizer.ts`
- `frontend/src/features/quests/questSemanticStages.ts`
- `frontend/src/features/quests/questLoreFlow.ts`
- `frontend/src/features/quests/questStrategyDossier.ts`
- `frontend/src/pages/QuestExplorerPage.tsx`
- `frontend/src/components/Quests/LoreReader.tsx`
- `frontend/src/components/Quests/StrategyDossier.tsx`

Current behavior:

- Loads `/api/quests/explorer`.
- Uses semantic adapters and canonical stage classification for Lore/Strategy.
- Preserves structured reward formula fields into Strategy rendering.
- Preserves reward/requirement `referenceKey`, `referenceKind`,
  `referenceDisplayName`, asset fields, and `codexEntryKey` in types.
- Does not currently resolve those references to Codex entries in the UI.

Assessment:

- Explorer is correctly independent from Codex for semantic rendering.
- It has enough raw reference data to support future Codex links, but live data
  would need either populated `codexEntryKey` or a safe typed resolver.

## Missing Or Duplicated Field Analysis

### Missing From Explorer

| Field/Data | Source | Severity | Recommendation |
| --- | --- | --- | --- |
| `strategyView.objectives[].choiceKey` | Raw Explorer export | High for future semantic precision | Preserve through import DTO, command snapshot, DB, domain, response DTO, frontend type, and normalizer in a bounded API migration. |
| Generic `referenceKeys[]` | Quest Codex | Low | Do not copy wholesale. Explorer already has structured requirement/reward refs. Add links from structured refs instead. |
| Codex category/kind labels | Quest Codex | Low | Do not duplicate unless Explorer needs search/category harmonization. Existing `questType` and navigation are enough for Explorer. |
| Codex root `game` metadata | Quest Codex | Low | Not relevant to Explorer. |

### Missing From Codex

| Field/Data | Source | Severity | Recommendation |
| --- | --- | --- | --- |
| Explicit Quest Explorer owner entry key | Explorer `entryKey`/aliases | Medium | Add future link metadata or build a frontend/backend alias resolver so Codex quest rows can open the owning Explorer chapter without key parsing. |
| Structured quest context | Explorer navigation/progression | Medium | If Codex keeps a quest progression widget, prefer explicit exporter fields such as owner entry, faction, questline, chapter, step, and semantic owner. |
| Branch/lore/objective/reward structures | Explorer | Low by design | Do not duplicate full structures in Codex. Link to Explorer instead. |
| Typed references | Codex currently has raw `referenceKeys` | Medium | Future Codex contract could expose typed references to reduce unresolved raw keys and ambiguous same-key matches. |
| Import provenance | Codex root metadata | Low | Store per-export-kind metadata if diagnostics need source version/date. |

### Duplicated But Acceptable

| Duplication | Why Acceptable |
| --- | --- |
| Quest title/display name | Codex needs a search label; Explorer needs a chapter/entry title. |
| Summary/description text | Codex needs compact encyclopedia text; Explorer needs structured chronicle and strategy text. |
| Quest next references | Codex uses references for related entry navigation; Explorer uses topology arrays for semantics. |
| Formula text in Codex prose and Explorer reward structure | Codex is readable. Explorer is machine-structured and now rendered in Strategy. |

## Linkability Recommendations

### Codex -> Quest Explorer

Recommended future behavior:

- Codex quest entries should be able to open the owning Quest Explorer entry.
- The resolver should use exact data:
  1. Codex `entryKey` equals Explorer `entryKey`.
  2. Codex `entryKey` equals one of Explorer `aliases[]`.
  3. If both fail, do not infer from titles.
- The live 0.80 data supports this: 285 / 285 Quest Codex quest entries map to
  Explorer `entryKey` or `aliases[]`.

Potential contract improvement:

```ts
CodexQuestEntry {
  entryKey: string
  questExplorerEntryKey?: string
  questExplorerAliasOfEntryKey?: string
}
```

This would let Codex link to Explorer without loading the full Explorer payload
or parsing keys.

### Quest Explorer -> Codex

Recommended future behavior:

- Requirements and rewards in Strategy should optionally link to matching Codex
  entries for heroes, techs, traits, equipment, units, districts, improvements,
  and minor/faction records.
- Prefer `codexEntryKey` when populated.
- If `codexEntryKey` remains empty, resolve conservatively from
  `referenceKind` + `referenceKey` or `assetKind` + `assetKey`.
- Do not link formula-only rewards with no asset/reference key unless a future
  reward-pool Codex domain is added.

Potential contract improvement:

```ts
QuestExplorerRequirementOrReward {
  referenceKind?: string
  referenceKey?: string
  referenceDisplayName?: string
  codexEntryKey?: string
  codexExportKind?: string
}
```

The current model has `codexEntryKey` but not `codexExportKind`; adding or
populating typed Codex refs would remove ambiguity.

## Recommended Contract Changes

No immediate behavior/API change is required to keep the current split healthy.

Future bounded contract work, in priority order:

1. Preserve raw Explorer objective `choiceKey`.
   - Add `choiceKey` to `QuestExplorerImportObjectiveDto`.
   - Add it to `QuestExplorerStrategyObjectiveImportSnapshot`.
   - Add a DB column on `quest_explorer_objectives`.
   - Add it to `QuestExplorer.Objective`, `QuestExplorerDto.ObjectiveDto`,
     frontend `StrategyObjective`, and the normalizer.
   - Add mapper and API tests.

2. Add an explicit Codex -> Explorer link.
   - Either enrich Codex quest rows with `questExplorerEntryKey` at export/import
     time, or build a backend/frontend resolver from Explorer aliases.
   - Use exact key/alias matching only.

3. Populate or type Explorer Codex references.
   - Populate `codexEntryKey` where exporter can identify the target.
   - Consider adding `codexExportKind`.
   - Add diagnostics for unresolved Explorer `referenceKey` and `assetKey`.

4. Add typed Codex references.
   - Keep raw `referenceKeys` for compatibility.
   - Add optional typed references to separate POIs, questline family keys,
     reward-pool keys, and actual Codex entry references.

5. Store Codex import metadata if needed.
   - Useful for diagnostics and admin pages, not necessary for product
     rendering.

## Risks

- Merging Codex and Explorer would make both worse: Codex would become too
  semantic and Explorer would inherit flat encyclopedia assumptions.
- Letting Codex quest grouping drive Explorer semantics would reintroduce
  deprecated key-parsing behavior.
- Rendering Codex links from raw `referenceKey` without `referenceKind` or
  `codexEntryKey` could create wrong links when keys collide across export
  kinds.
- Backfilling `choiceKey` into objectives is an API/DB migration and should be
  done deliberately with tests.
- POI/reward-pool references are currently not first-class Codex domains; do not
  treat every unresolved reference as a bug.

## Non-Goals

- Do not merge Quest Codex and Quest Explorer into one DTO.
- Do not copy full Quest Explorer branch/lore/strategy semantics into Codex.
- Do not make Quest Explorer depend on Codex to render core Lore/Strategy.
- Do not infer semantic chapter, choice, or continuation meaning from quest
  titles or keys.
- Do not change backend/exporter/schema/API as part of this investigation note.
- Do not rewrite existing frontend behavior from this document alone.

## Conclusion

Quest Codex and Quest Explorer are correctly separated. The healthy direction is
a small explicit link layer between them, plus one bounded Explorer DTO fix for
raw objective `choiceKey`. Codex should remain the encyclopedia; Explorer should
remain the canonical semantic quest system.
