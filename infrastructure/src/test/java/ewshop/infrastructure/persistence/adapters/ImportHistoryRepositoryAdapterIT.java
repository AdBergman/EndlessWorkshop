package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.importing.ImportFileResult;
import ewshop.domain.model.importing.ImportFileStatus;
import ewshop.domain.model.importing.ImportHistoryCounts;
import ewshop.domain.model.importing.ImportRun;
import ewshop.domain.model.importing.ImportRunStatus;
import ewshop.domain.model.importing.ImportTrigger;
import ewshop.domain.repository.ImportHistoryRepository;
import ewshop.infrastructure.persistence.entities.ImportRunEntity;
import ewshop.infrastructure.persistence.repositories.ImportRunJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "ewshop.cache-preload.enabled=false")
@Transactional
class ImportHistoryRepositoryAdapterIT {

    @Autowired
    private ImportHistoryRepository importHistoryRepository;

    @Autowired
    private ImportRunJpaRepository importRunJpaRepository;

    @Test
    void saveImportRunPersistsRunAndFileResults() {
        ImportRun run = new ImportRun(
                "run-1",
                ImportTrigger.LOCAL_STARTUP,
                ImportRunStatus.PARTIAL_SUCCESS,
                Instant.parse("2026-06-23T10:00:00Z"),
                Instant.parse("2026-06-23T10:00:02Z"),
                "local-imports",
                "dev",
                2,
                1,
                1,
                0,
                new ImportHistoryCounts(3, 1, 1, 1, 0, 0),
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                "Imported 1, skipped 1, failed 0.",
                List.of(
                        new ImportFileResult(
                                "exports",
                                "ewshop_tech_export_0.82.json",
                                "path-hash",
                                "file-hash",
                                "tech",
                                "tech",
                                "Endless Legend 2",
                                "0.82",
                                "1.2.3",
                                "2026-06-22T05:57:36Z",
                                null,
                                ImportFileStatus.IMPORTED,
                                null,
                                null,
                                new ImportHistoryCounts(3, 1, 1, 1, 0, 0),
                                25L
                        ),
                        new ImportFileResult(
                                "codex",
                                "last-export-status.json",
                                "status-path-hash",
                                "status-file-hash",
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                ImportFileStatus.SKIPPED,
                                "diagnostics-only",
                                null,
                                ImportHistoryCounts.empty(),
                                null
                        )
                )
        );

        importHistoryRepository.saveImportRun(run);

        List<ImportRunEntity> runs = importRunJpaRepository.findAll();
        assertThat(runs).hasSize(1);

        ImportRunEntity saved = runs.getFirst();
        assertThat(saved.runKey).isEqualTo("run-1");
        assertThat(saved.trigger).isEqualTo("LOCAL_STARTUP");
        assertThat(saved.status).isEqualTo("PARTIAL_SUCCESS");
        assertThat(saved.gameVersion).isEqualTo("0.82");
        assertThat(saved.receivedCount).isEqualTo(3);
        assertThat(saved.fileResults).hasSize(2);
        assertThat(saved.fileResults.getFirst().filename).isEqualTo("ewshop_tech_export_0.82.json");
        assertThat(saved.fileResults.getFirst().status).isEqualTo("IMPORTED");
        assertThat(saved.fileResults.getFirst().durationMs).isEqualTo(25L);
        assertThat(saved.fileResults.get(1).filename).isEqualTo("last-export-status.json");
        assertThat(saved.fileResults.get(1).skipReason).isEqualTo("diagnostics-only");
    }

    @Test
    void latestReadsReturnSuccessfulRunAndLatestRunWithFileResults() {
        ImportRun success = run(
                "success-run",
                ImportRunStatus.SUCCESS,
                "2026-06-23T10:00:00Z",
                List.of(importedFile("tech.json", "tech"))
        );
        ImportRun newerPartial = run(
                "partial-run",
                ImportRunStatus.PARTIAL_SUCCESS,
                "2026-06-24T10:00:00Z",
                List.of(
                        importedFile("codex.json", "codex"),
                        skippedFile("last-export-status.json")
                )
        );

        importHistoryRepository.saveImportRun(success);
        importHistoryRepository.saveImportRun(newerPartial);

        ImportRun latestSuccessful = importHistoryRepository.findLatestSuccessfulImportRun().orElseThrow();
        assertThat(latestSuccessful.runKey()).isEqualTo("success-run");
        assertThat(latestSuccessful.fileResults()).hasSize(1);
        assertThat(latestSuccessful.fileResults().getFirst().filename()).isEqualTo("tech.json");

        ImportRun latest = importHistoryRepository.findLatestImportRun().orElseThrow();
        assertThat(latest.runKey()).isEqualTo("partial-run");
        assertThat(latest.fileResults())
                .extracting(ImportFileResult::filename)
                .containsExactly("codex.json", "last-export-status.json");
    }

    private static ImportRun run(
            String runKey,
            ImportRunStatus status,
            String completedAtUtc,
            List<ImportFileResult> fileResults
    ) {
        int imported = (int) fileResults.stream()
                .filter(result -> result.status() == ImportFileStatus.IMPORTED)
                .count();
        int skipped = (int) fileResults.stream()
                .filter(result -> result.status() == ImportFileStatus.SKIPPED)
                .count();
        int failed = (int) fileResults.stream()
                .filter(result -> result.status() == ImportFileStatus.FAILED)
                .count();

        return new ImportRun(
                runKey,
                ImportTrigger.LOCAL_STARTUP,
                status,
                Instant.parse("2026-06-23T09:00:00Z"),
                Instant.parse(completedAtUtc),
                "local-imports",
                "dev",
                fileResults.size(),
                imported,
                skipped,
                failed,
                new ImportHistoryCounts(imported, imported, 0, 0, 0, 0),
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                fileResults
        );
    }

    private static ImportFileResult importedFile(String filename, String importKind) {
        return new ImportFileResult(
                "exports",
                filename,
                "path-hash",
                "file-hash",
                importKind,
                importKind,
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                ImportFileStatus.IMPORTED,
                null,
                null,
                new ImportHistoryCounts(1, 1, 0, 0, 0, 0),
                25L
        );
    }

    private static ImportFileResult skippedFile(String filename) {
        return new ImportFileResult(
                "codex",
                filename,
                "status-path-hash",
                "status-file-hash",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                ImportFileStatus.SKIPPED,
                "diagnostics-only",
                null,
                ImportHistoryCounts.empty(),
                null
        );
    }
}
