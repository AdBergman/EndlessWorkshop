# Quest Explorer Rich Import Architecture Review

Date: 2026-05-21

Scope: backend-only review of the quest explorer import/read path against the EWShop rich-import patterns used by units, tech, districts, and improvements.

Status note: keep this architecture review as backend/API context only. It is
not the canonical Quest Explorer semantic model. For semantics, topology terms,
and frontend interpretation, use `docs/quest_explorer_canonical_semantics_v1.md`;
for documentation status, use `docs/quest_explorer_documentation_audit_v1.md`.

## Executive Verdict

Quest explorer now follows the same high-level rich-import architecture as units and tech:

```text
API import controller
-> facade import batch DTO
-> facade import row DTOs
-> facade import mapper
-> domain import command snapshots
-> domain import service
-> repository port
-> infrastructure repository adapter
-> JPA entity graph / flat tables
-> read reconstruction
-> domain read model
-> facade read mapper
-> API response DTO
```

The remaining deviations are mostly justified by the quest explorer contract being document-shaped and deeply nested. The strongest concern is not a boundary violation; it is JPA/read performance and maintainability of the very large nested entity file.

## Units End-To-End Trace

### API Layer

Files:

- `api/src/main/java/ewshop/api/controller/UnitController.java`
- `api/src/main/java/ewshop/api/controller/ImportAdminController.java`

Read flow:

```text
GET /api/units
-> UnitController.getAllUnits()
-> UnitFacade.getAllUnits()
```

Import flow:

```text
POST /api/admin/import/units
-> ImportAdminController.importUnits(UnitImportBatchDto)
-> UnitImportAdminFacade.importUnits(dto)
```

Pattern:

- Controller is thin.
- Controller performs only minimal payload presence checks.
- No repository, JPA entity, or domain reconstruction logic leaks into API.

### Facade Layer

Files:

- `facade/src/main/java/ewshop/facade/dto/importing/units/UnitImportBatchDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/units/UnitImportUnitDto.java`
- `facade/src/main/java/ewshop/facade/impl/UnitImportAdminFacadeImpl.java`
- `facade/src/main/java/ewshop/facade/mapper/UnitImportMapper.java`
- `facade/src/main/java/ewshop/facade/impl/UnitFacadeImpl.java`
- `facade/src/main/java/ewshop/facade/mapper/UnitMapper.java`
- `facade/src/main/java/ewshop/facade/dto/response/UnitDto.java`

Import DTO shape:

```text
UnitImportBatchDto
  -> List<UnitImportUnitDto> units
```

Facade import flow:

```text
UnitImportBatchDto
-> rows = fileDto.units()
-> UnitImportMapper.toSnapshot(row)
-> List<UnitImportSnapshot>
-> duplicate unitKey check
-> UnitImportService.importUnits(snapshots)
-> UnitService.getAllUnits() cache warm
-> ImportSummaryDto
```

Pattern:

- Batch DTO is a file envelope only.
- Row DTO is separate from the batch file.
- Mapper returns domain command snapshots, not `Unit` read models.
- Facade owns row-level error collection, duplicate stable-key validation, warning/count composition, and cache warming.
- Read mapper is separate from import mapper.

### Domain Layer

Files:

- `domain/src/main/java/ewshop/domain/command/UnitImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/model/Unit.java`
- `domain/src/main/java/ewshop/domain/service/UnitImportService.java`
- `domain/src/main/java/ewshop/domain/service/UnitService.java`
- `domain/src/main/java/ewshop/domain/repository/UnitRepository.java`

Pattern:

- `UnitImportSnapshot` is the command/import model.
- `Unit` is the read/domain model.
- `UnitImportService` accepts command snapshots and evicts the `units` cache.
- `UnitService` serves read models and owns `@Cacheable("units")`.
- `UnitRepository` exposes both read and import operations.

### Infrastructure Layer

Files:

- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/UnitEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/repositories/UnitJpaRepository.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/UnitRepositoryAdapter.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/mappers/UnitMapper.java`
- `infrastructure/src/main/resources/db/migration/common/V3_3_2__unit_entity_table_created.sql`

Persistence pattern:

- One JPA root entity: `UnitEntity`.
- Lists are stored as ordered element collections:
  - `unit_next_evolutions`
  - `unit_abilities`
  - `unit_description_lines`
- Upsert by stable key: `unit_key`.
- Delete obsolete rows not present in incoming allowed import set.
- Existing manual/backfilled `artId` is preserved during import.
- Adapter computes `INSERTED`, `UPDATED`, and `UNCHANGED`.

Database pattern:

- Flat root table plus simple child tables.
- Explicit order columns.
- Unique stable key on root.
- Child tables use FK to root and `ON DELETE CASCADE`.

## Quest Explorer End-To-End Trace

### API Layer

Files:

- `api/src/main/java/ewshop/api/controller/QuestController.java`
- `api/src/main/java/ewshop/api/controller/ImportAdminController.java`

Read flow:

```text
GET /api/quests/explorer
-> QuestController.getQuestExplorer()
-> QuestExplorerFacade.getQuestExplorer()
```

Import flow:

```text
POST /api/admin/import/quests/explorer
-> ImportAdminController.importQuestExplorer(QuestExplorerImportBatchDto)
-> QuestExplorerImportAdminFacade.importQuestExplorer(dto)
```

Assessment:

- API is thin and consistent with units.
- Quest import uses `entries[]`, not `units[]`, because that is the locked `quest_explorer.v3` exporter contract.
- No JPA or repository logic leaks into the controller.

### Facade Layer

Files:

- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportBatchDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportEntryDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportNavigationDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportLoreViewDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportLoreSectionDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportLoreLineDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportStrategyViewDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportObjectiveDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportBranchDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportBranchLoreDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportBranchStrategyDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportRequirementDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportRewardDto.java`
- `facade/src/main/java/ewshop/facade/dto/importing/quests/QuestExplorerImportQualityDto.java`
- `facade/src/main/java/ewshop/facade/impl/QuestExplorerImportAdminFacadeImpl.java`
- `facade/src/main/java/ewshop/facade/mapper/QuestExplorerImportMapper.java`
- `facade/src/main/java/ewshop/facade/impl/QuestExplorerFacadeImpl.java`
- `facade/src/main/java/ewshop/facade/mapper/QuestExplorerMapper.java`
- `facade/src/main/java/ewshop/facade/dto/response/quests/QuestExplorerDto.java`

Import DTO shape:

```text
QuestExplorerImportBatchDto
  -> List<QuestExplorerImportEntryDto> entries
       -> navigation
       -> loreView.sections.lines
       -> strategyView.objectives.requirements/rewards
       -> branches.lore/strategy/links
       -> quality
```

Facade import flow:

```text
QuestExplorerImportBatchDto
-> QuestExplorerImportMapper.toMetadata(file)
-> rows = file.entries()
-> QuestExplorerImportMapper.toSnapshot(row)
-> List<QuestExplorerEntryImportSnapshot>
-> cross-entry validation
   - duplicate entryKey
   - duplicate navigation.sequenceIndex
   - invalid previous/next/failure/convergence references
-> QuestExplorerImportService.importQuestExplorer(metadata, snapshots)
-> QuestExplorerReadService.getQuestExplorer() cache warm
-> ImportSummaryDto
```

Assessment:

- Current shape matches units and tech conceptually.
- The batch DTO is only an import file envelope.
- Row DTOs are split into separate files, matching the application style.
- Import mapper returns command snapshots, not the read aggregate.
- Read mapper is separate from import mapper.
- Quest explorer necessarily has more DTO files because the contract has more nested records.

### Domain Layer

Files:

- `domain/src/main/java/ewshop/domain/command/QuestExplorerImportMetadata.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerEntryImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerNavigationImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerLoreSectionImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerLoreLineImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerStrategyObjectiveImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerBranchImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerRequirementImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerRewardImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/command/QuestExplorerQualityImportSnapshot.java`
- `domain/src/main/java/ewshop/domain/model/quest/QuestExplorer.java`
- `domain/src/main/java/ewshop/domain/service/QuestExplorerImportService.java`
- `domain/src/main/java/ewshop/domain/service/QuestExplorerReadService.java`
- `domain/src/main/java/ewshop/domain/repository/QuestExplorerRepository.java`

Pattern comparison:

- Units use one command snapshot because unit rows are shallow.
- Quest explorer uses multiple command snapshots because one entry has nested navigation, lore, strategy, branches, requirements, and rewards.
- This is a justified difference, not a batch anti-pattern.
- The read model remains document-shaped because the frontend contract is document-shaped.

Concern:

- The read model `QuestExplorer` contains many nested records in one file. This mirrors the response contract, but it is heavier than units/tech. It is acceptable for a document-shaped read model, but it should remain read-only and must not become an import command model again.

### Infrastructure Layer

Files:

- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/QuestExplorerEntryEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/entities/QuestExplorerImportMetadataEntity.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/repositories/QuestExplorerEntryJpaRepository.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/repositories/QuestExplorerImportMetadataJpaRepository.java`
- `infrastructure/src/main/java/ewshop/infrastructure/persistence/adapters/QuestExplorerRepositoryAdapter.java`
- `infrastructure/src/main/resources/db/migration/common/V3_4_1__quest_explorer_v3_vertical_slice.sql`

Persistence strategy:

```text
QuestExplorerEntryImportSnapshot[]
-> upsert quest_explorer_entries by entry_key
-> replace owned child rows for imported entries
-> update singleton quest_explorer_import_metadata
-> delete obsolete quest_explorer_entries not in import
-> reconstruct QuestExplorer read model by ordered entries
```

Database shape:

- Root table:
  - `quest_explorer_entries`
- Metadata table:
  - `quest_explorer_import_metadata`
- Flat owned child tables:
  - summary lines
  - aliases
  - quality warnings
  - navigation
  - navigation links
  - lore sections
  - lore lines
  - objectives
  - objective requirements/rewards
  - branches
  - branch links
  - branch preview lines
  - branch conditions
  - branch requirements/rewards

Assessment:

- The schema is flat and inspectable.
- No JSON/blob persistence was introduced.
- Links, aliases, branches, objectives, lore lines, requirements, and rewards are persisted as rows.
- Order is persisted explicitly through order columns.
- `entry_key` is the stable unique import key.
- Cascade delete behavior is appropriate for owned child rows.

## Naming Comparison

### Units

```text
UnitImportBatchDto
UnitImportUnitDto
UnitImportMapper
UnitImportSnapshot
UnitImportService
UnitRepository.importUnitSnapshot(...)
UnitRepositoryAdapter.importUnitSnapshot(...)
UnitEntity
UnitJpaRepository
UnitDto
UnitMapper
```

### Tech

```text
TechImportBatchDto
TechImportTechDto
TechImportMapper
TechImportSnapshot
TechImportService.importSnapshot(...)
TechRepository.importTechSnapshot(...)
TechRepositoryAdapter.importTechSnapshot(...)
TechEntity
TechJpaRepository
TechDto
TechMapper
```

### Quest Explorer

```text
QuestExplorerImportBatchDto
QuestExplorerImportEntryDto
QuestExplorerImportMapper
QuestExplorerEntryImportSnapshot
QuestExplorerImportService.importQuestExplorer(...)
QuestExplorerRepository.importQuestExplorerEntries(...)
QuestExplorerRepositoryAdapter.importQuestExplorerEntries(...)
QuestExplorerEntryEntity
QuestExplorerEntryJpaRepository
QuestExplorerDto
QuestExplorerMapper
```

Assessment:

- Naming is mostly aligned.
- `QuestExplorerEntryEntity` is better than the earlier batch-root naming.
- `importQuestExplorerEntries(...)` is more explicit than `importSnapshot(...)`; this is acceptable because metadata is also imported.
- The package `facade.dto.importing.quests` is reasonable because quest explorer is a quest-specific import.
- The package `domain.model.quest` is a small deviation from `domain.model.Unit`, but it is justified if future quest models share the package.

## JPA/Hibernate Deep Review

### What Follows The Established Pattern

- Stable root entity with unique import key:
  - units: `UnitEntity.unitKey`
  - tech: `TechEntity.techKey`
  - quest explorer: `QuestExplorerEntryEntity.entryKey`
- Ordered child collections:
  - units: `@ElementCollection` with `@OrderColumn`
  - tech: `@ElementCollection` with `@OrderColumn`
  - quest explorer: `@ElementCollection` and owned `@OneToMany` children with `@OrderColumn`
- Import adapter owns upsert/delete-obsolete behavior.
- Domain repository port accepts command snapshots, not facade DTOs.
- Infrastructure reconstructs read domain model from persistence.
- Child rows are owned-only and cascade with the parent.

### Justified Differences

- Quest explorer has `QuestExplorerImportMetadataEntity`; units and tech do not. This is justified because `/api/quests/explorer` returns a document root with `gameVersion`, `exporterVersion`, `exportedAtUtc`, `exportKind`, and `schemaVersion`.
- Quest explorer has a deeper owned graph than units. This follows the locked frontend/exporter contract rather than a backend invention.
- Quest explorer read output is a single document, whereas units read output is a list. This is contract-driven and acceptable.

### Concerning Differences

1. `QuestExplorerEntryEntity` is a large master entity file.

Units, districts, improvements, and tech keep persistence classes comparatively small. Quest explorer nests every child entity class inside `QuestExplorerEntryEntity`. That is legal JPA, and it keeps ownership visible, but it is harder to review, test, and evolve. This is a maintainability concern, not an immediate correctness bug.

Recommendation: split child entities into separate package-private or public entity classes once behavior stabilizes. Suggested package:

```text
infrastructure.persistence.entities.questexplorer
```

2. Quest explorer uses public fields in JPA entities.

Most existing entities use private fields plus getters/setters. Quest explorer uses field access and public fields. Hibernate supports this because `@Access(AccessType.FIELD)` is present, but it deviates from local style.

Recommendation: convert to private fields with package-level mapper methods or getters/setters during the entity split refactor. This is not urgent if tests remain green.

3. Read reconstruction may have N+1 query risk.

`QuestExplorerEntryJpaRepository.findAllByOrderByNavigationSequenceIndexAscIdAsc()` loads entries ordered by navigation, then the adapter walks multiple lazy collections:

- summary lines
- aliases
- quality warnings
- lore sections and lines
- objectives and requirement/reward children
- branches and branch children
- navigation link collections

Units do not have this depth. Tech explicitly uses `findAllForCache()` with fetch joins for cache loading. Quest explorer should consider a dedicated read query strategy, entity graph, batch-size annotations, or staged repository reads if the payload grows.

Recommendation: before frontend integration load-testing, measure query count for `GET /api/quests/explorer` with the 149-entry fixture. If query count is high, add a fetch strategy deliberately.

4. Import counts are conservative.

Units and tech detect unchanged rows. Quest explorer currently counts every existing imported entry as updated because deep graph equality would be expensive and noisy.

Recommendation: acceptable for now. Add unchanged detection only if import summaries become operationally important.

5. No database-level foreign keys for entry-key links.

Navigation/branch links store `entry_key` strings without FK constraints to `quest_explorer_entries(entry_key)`. This matches the exporter-owned link contract and avoids circular/import-order complexity. The mapper validates references before persistence.

Recommendation: keep application-level validation unless SQL-level referential integrity becomes a hard requirement.

## Frontend Contract Alignment

Reference files:

- `docs/quest-explorer-export-contract-final.md`
- `local-imports/exports/ewshop_quest_explorer_export_0.80.json`
- `frontend/src/features/quests/questExplorerContract.ts`
- `frontend/src/features/quests/mockQuestExplorerExport.ts`

Observed fixture:

- `exportKind = quest_explorer`
- `schemaVersion = quest_explorer.v3`
- `entries = 149`
- First entry includes:
  - `entryKey`
  - `title`
  - `summaryLines`
  - `aliases`
  - `navigation`
  - `loreView.sections.lines`
  - `strategyView.objectives.requirements/rewards`
  - `branches.strategy.requirements/rewards`

Assessment:

- Backend response DTO mirrors the documented contract closely.
- Backend does not expose persistence IDs.
- Backend does not expose old chronicle concepts.
- Backend persists aliases and navigation links directly, so frontend should not need semantic repair or graph reconstruction.

## Final Findings

### Good

- Quest explorer no longer uses a DB batch root.
- Import batch DTO remains only a file envelope, consistent with units and tech.
- Import DTOs are split by record/class.
- Import command snapshots are separate from read domain model.
- Repository adapter imports by stable key and deletes obsolete entries.
- Persistence tables are flat and SQL-inspectable.
- Read API is frontend-ready in shape.

### Needs Attention Before Heavy Frontend/Production Use

- Measure and possibly optimize `GET /api/quests/explorer` query count.
- Consider splitting `QuestExplorerEntryEntity` child classes into separate files.
- Consider moving public JPA fields to private field style for consistency.
- Decide whether conservative updated counts are acceptable in admin import summaries.

### Not Concerning

- The number of quest explorer DTO/command files is not a smell by itself; it reflects the locked contract.
- Keeping `QuestExplorerImportBatchDto` is consistent with units/tech/districts/improvements.
- Keeping a document-shaped read model is appropriate for the frontend contract.
- Import metadata table is justified because the read document includes root metadata.
