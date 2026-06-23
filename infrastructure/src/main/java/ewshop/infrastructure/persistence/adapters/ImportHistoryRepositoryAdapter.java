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

import java.util.Comparator;
import java.util.Optional;

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

    @Override
    @Transactional(readOnly = true)
    public Optional<ImportRun> findLatestSuccessfulImportRun() {
        return importRunJpaRepository.findFirstByStatusOrderByCompletedAtUtcDescIdDesc("SUCCESS")
                .map(ImportHistoryRepositoryAdapter::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ImportRun> findLatestImportRun() {
        return importRunJpaRepository.findFirstByOrderByCompletedAtUtcDescIdDesc()
                .map(ImportHistoryRepositoryAdapter::toDomain);
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

    private static ImportRun toDomain(ImportRunEntity entity) {
        return new ImportRun(
                entity.runKey,
                ewshop.domain.model.importing.ImportTrigger.valueOf(entity.trigger),
                ewshop.domain.model.importing.ImportRunStatus.valueOf(entity.status),
                entity.startedAtUtc,
                entity.completedAtUtc,
                entity.sourceLabel,
                entity.profile,
                entity.fileCount,
                entity.importedFileCount,
                entity.skippedFileCount,
                entity.failedFileCount,
                new ImportHistoryCounts(
                        entity.receivedCount,
                        entity.insertedCount,
                        entity.updatedCount,
                        entity.unchangedCount,
                        entity.deletedCount,
                        entity.failedCount
                ),
                entity.game,
                entity.gameVersion,
                entity.exporterVersion,
                entity.exportedAtUtc,
                entity.notes,
                entity.fileResults.stream()
                        .sorted(Comparator.comparingInt(result -> result.fileOrder))
                        .map(ImportHistoryRepositoryAdapter::toFileDomain)
                        .toList()
        );
    }

    private static ImportFileResult toFileDomain(ImportFileResultEntity entity) {
        return new ImportFileResult(
                entity.folder,
                entity.filename,
                entity.sourcePathHash,
                entity.fileSha256,
                entity.exportKind,
                entity.importKind,
                entity.game,
                entity.gameVersion,
                entity.exporterVersion,
                entity.exportedAtUtc,
                entity.schemaVersion,
                ewshop.domain.model.importing.ImportFileStatus.valueOf(entity.status),
                entity.skipReason,
                entity.errorMessage,
                new ImportHistoryCounts(
                        entity.receivedCount,
                        entity.insertedCount,
                        entity.updatedCount,
                        entity.unchangedCount,
                        entity.deletedCount,
                        entity.failedCount
                ),
                entity.durationMs
        );
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
