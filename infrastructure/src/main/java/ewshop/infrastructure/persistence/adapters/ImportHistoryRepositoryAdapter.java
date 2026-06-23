package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.importing.ImportFileResult;
import ewshop.domain.model.importing.ImportHistoryCounts;
import ewshop.domain.model.importing.ImportRun;
import ewshop.domain.repository.ImportHistoryRepository;
import ewshop.infrastructure.persistence.entities.ImportFileResultEntity;
import ewshop.infrastructure.persistence.entities.ImportRunEntity;
import ewshop.infrastructure.persistence.repositories.ImportRunJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ImportHistoryRepositoryAdapter implements ImportHistoryRepository {

    private final ImportRunJpaRepository importRunJpaRepository;

    public ImportHistoryRepositoryAdapter(ImportRunJpaRepository importRunJpaRepository) {
        this.importRunJpaRepository = importRunJpaRepository;
    }

    @Override
    @Transactional
    public void saveImportRun(ImportRun run) {
        if (run == null) return;

        ImportRunEntity entity = toEntity(run);
        importRunJpaRepository.save(entity);
    }

    private static ImportRunEntity toEntity(ImportRun run) {
        ImportRunEntity entity = new ImportRunEntity();
        entity.runKey = run.runKey();
        entity.trigger = run.trigger().name();
        entity.status = run.status().name();
        entity.startedAtUtc = run.startedAtUtc();
        entity.completedAtUtc = run.completedAtUtc();
        entity.sourceLabel = run.sourceLabel();
        entity.profile = run.profile();
        entity.fileCount = run.fileCount();
        entity.importedFileCount = run.importedFileCount();
        entity.skippedFileCount = run.skippedFileCount();
        entity.failedFileCount = run.failedFileCount();

        ImportHistoryCounts counts = run.counts();
        entity.receivedCount = counts.received();
        entity.insertedCount = counts.inserted();
        entity.updatedCount = counts.updated();
        entity.unchangedCount = counts.unchanged();
        entity.deletedCount = counts.deleted();
        entity.failedCount = counts.failed();

        entity.game = run.game();
        entity.gameVersion = run.gameVersion();
        entity.exporterVersion = run.exporterVersion();
        entity.exportedAtUtc = run.exportedAtUtc();
        entity.notes = run.notes();

        int order = 0;
        for (ImportFileResult fileResult : run.fileResults()) {
            ImportFileResultEntity fileEntity = toFileEntity(fileResult, order++);
            fileEntity.importRun = entity;
            entity.fileResults.add(fileEntity);
        }

        return entity;
    }

    private static ImportFileResultEntity toFileEntity(ImportFileResult result, int order) {
        ImportFileResultEntity entity = new ImportFileResultEntity();
        entity.fileOrder = order;
        entity.folder = result.folder();
        entity.filename = result.filename();
        entity.sourcePathHash = result.sourcePathHash();
        entity.fileSha256 = result.fileSha256();
        entity.exportKind = result.exportKind();
        entity.importKind = result.importKind();
        entity.game = result.game();
        entity.gameVersion = result.gameVersion();
        entity.exporterVersion = result.exporterVersion();
        entity.exportedAtUtc = result.exportedAtUtc();
        entity.schemaVersion = result.schemaVersion();
        entity.status = result.status().name();
        entity.skipReason = result.skipReason();
        entity.errorMessage = result.errorMessage();

        ImportHistoryCounts counts = result.counts();
        entity.receivedCount = counts.received();
        entity.insertedCount = counts.inserted();
        entity.updatedCount = counts.updated();
        entity.unchangedCount = counts.unchanged();
        entity.deletedCount = counts.deleted();
        entity.failedCount = counts.failed();
        entity.durationMs = result.durationMs();
        return entity;
    }
}
