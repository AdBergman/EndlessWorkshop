package ewshop.facade.impl;

import ewshop.domain.model.importing.ImportFileResult;
import ewshop.domain.model.importing.ImportFileStatus;
import ewshop.domain.model.importing.ImportHistoryCounts;
import ewshop.domain.model.importing.ImportRun;
import ewshop.domain.model.importing.ImportRunStatus;
import ewshop.domain.model.importing.ImportTrigger;
import ewshop.domain.repository.ImportHistoryRepository;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ImportHistoryFacadeImplTest {

    @Test
    void latestDataFreshnessUsesLatestSuccessfulRun() {
        ImportRun successful = run("success", ImportRunStatus.SUCCESS, "2026-06-23T10:00:00Z", 2, List.of(
                file("tech.json", "tech", "tech", ImportFileStatus.IMPORTED),
                file("codex.json", "abilities", "codex", ImportFileStatus.IMPORTED)
        ));
        ImportRun partial = run("partial", ImportRunStatus.PARTIAL_SUCCESS, "2026-06-24T10:00:00Z", 1, List.of(
                file("newer-tech.json", "tech", "tech", ImportFileStatus.IMPORTED)
        ));
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(new RecordingRepository(successful, partial));

        DataFreshnessDto dto = facade.getLatestDataFreshness();

        assertThat(dto.available()).isTrue();
        assertThat(dto.latestImportAtUtc()).isEqualTo("2026-06-23T10:00:00Z");
        assertThat(dto.importedFileCount()).isEqualTo(2);
        assertThat(dto.importedKinds()).containsExactly("codex", "tech");
        assertThat(dto.note()).isNull();
    }

    @Test
    void latestDataFreshnessFallsBackToUsefulPartialRunWithCaveat() {
        ImportRun partial = run("partial", ImportRunStatus.PARTIAL_SUCCESS, "2026-06-24T10:00:00Z", 1, List.of(
                file("tech.json", "tech", "tech", ImportFileStatus.IMPORTED),
                file("diagnostics.json", "actions-codex-inventory", null, ImportFileStatus.SKIPPED)
        ));
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(new RecordingRepository(null, partial));

        DataFreshnessDto dto = facade.getLatestDataFreshness();

        assertThat(dto.available()).isTrue();
        assertThat(dto.latestImportAtUtc()).isEqualTo("2026-06-24T10:00:00Z");
        assertThat(dto.importedKinds()).containsExactly("tech");
        assertThat(dto.note()).contains("skipped or failed");
    }

    @Test
    void latestDataFreshnessIsUnavailableWhenOnlyFailedRunExists() {
        ImportRun failed = run("failed", ImportRunStatus.FAILED, "2026-06-24T10:00:00Z", 0, List.of(
                file("bad.json", "tech", null, ImportFileStatus.FAILED)
        ));
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(new RecordingRepository(null, failed));

        DataFreshnessDto dto = facade.getLatestDataFreshness();

        assertThat(dto.available()).isFalse();
        assertThat(dto.latestImportAtUtc()).isNull();
        assertThat(dto.importedKinds()).isEmpty();
    }

    @Test
    void adminLatestIncludesRunAndFileDetailsWithShortenedHash() {
        ImportRun partial = run("partial", ImportRunStatus.PARTIAL_SUCCESS, "2026-06-24T10:00:00Z", 1, List.of(
                file("tech.json", "tech", "tech", ImportFileStatus.IMPORTED),
                file("diagnostics.json", "actions-codex-inventory", null, ImportFileStatus.SKIPPED)
        ));
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(new RecordingRepository(null, partial));

        AdminLatestImportDto dto = facade.getLatestImport();

        assertThat(dto.available()).isTrue();
        assertThat(dto.status()).isEqualTo("PARTIAL_SUCCESS");
        assertThat(dto.fileResults()).hasSize(2);
        assertThat(dto.fileResults().getFirst().filename()).isEqualTo("tech.json");
        assertThat(dto.fileResults().getFirst().fileSha256Short()).isEqualTo("abcdef123456");
        assertThat(dto.fileResults().get(1).skipReason()).isEqualTo("diagnostics-only");
    }

    @Test
    void recordsManualAdminImportAsLatestSuccessfulFreshness() {
        RecordingRepository repository = new RecordingRepository(null, null);
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(repository);

        facade.recordManualAdminImport(
                "/Users/example/victoryconditions-codex.json",
                "victoryconditions",
                "codex",
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                Instant.parse("2026-06-24T10:00:00Z"),
                ImportSummaryDto.of(
                        "codex",
                        new ImportCountsDto(6, 0, 1, 5, 0, 0),
                        null,
                        14L
                )
        );

        ImportRun saved = repository.savedRuns.getFirst();
        assertThat(saved.trigger()).isEqualTo(ImportTrigger.MANUAL_ADMIN);
        assertThat(saved.status()).isEqualTo(ImportRunStatus.SUCCESS);
        assertThat(saved.sourceLabel()).isEqualTo("admin-upload");
        assertThat(saved.importedFileCount()).isEqualTo(1);
        assertThat(saved.counts().received()).isEqualTo(6);
        assertThat(saved.fileResults()).hasSize(1);
        assertThat(saved.fileResults().getFirst().filename()).isEqualTo("victoryconditions-codex.json");
        assertThat(saved.fileResults().getFirst().folder()).isEqualTo("admin-upload");
        assertThat(saved.fileResults().getFirst().status()).isEqualTo(ImportFileStatus.IMPORTED);
        assertThat(saved.fileResults().getFirst().sourcePathHash()).isNull();
    }

    @Test
    void recordsFailedManualAdminImportWithoutStackTracePayloads() {
        RecordingRepository repository = new RecordingRepository(null, null);
        ImportHistoryFacadeImpl facade = new ImportHistoryFacadeImpl(repository);

        facade.recordFailedManualAdminImport(
                "bad.json",
                "tech",
                "tech",
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                Instant.parse("2026-06-24T10:00:00Z"),
                "validation failed"
        );

        ImportRun saved = repository.savedRuns.getFirst();
        assertThat(saved.status()).isEqualTo(ImportRunStatus.FAILED);
        assertThat(saved.failedFileCount()).isEqualTo(1);
        assertThat(saved.notes()).isEqualTo("validation failed");
        assertThat(saved.fileResults().getFirst().status()).isEqualTo(ImportFileStatus.FAILED);
        assertThat(saved.fileResults().getFirst().errorMessage()).isEqualTo("validation failed");
    }

    private static ImportRun run(
            String runKey,
            ImportRunStatus status,
            String completedAtUtc,
            int importedFileCount,
            List<ImportFileResult> fileResults
    ) {
        return new ImportRun(
                runKey,
                ImportTrigger.LOCAL_STARTUP,
                status,
                Instant.parse("2026-06-23T09:00:00Z"),
                Instant.parse(completedAtUtc),
                "local-imports",
                null,
                fileResults.size(),
                importedFileCount,
                (int) fileResults.stream().filter(result -> result.status() == ImportFileStatus.SKIPPED).count(),
                (int) fileResults.stream().filter(result -> result.status() == ImportFileStatus.FAILED).count(),
                new ImportHistoryCounts(importedFileCount, importedFileCount, 0, 0, 0, 0),
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                fileResults
        );
    }

    private static ImportFileResult file(
            String filename,
            String exportKind,
            String importKind,
            ImportFileStatus status
    ) {
        return new ImportFileResult(
                "exports",
                filename,
                "path-hash",
                "abcdef1234567890",
                exportKind,
                importKind,
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                null,
                status,
                status == ImportFileStatus.SKIPPED ? "diagnostics-only" : null,
                status == ImportFileStatus.FAILED ? "failed" : null,
                status == ImportFileStatus.IMPORTED
                        ? new ImportHistoryCounts(1, 1, 0, 0, 0, 0)
                        : ImportHistoryCounts.empty(),
                10L
        );
    }

    private static final class RecordingRepository implements ImportHistoryRepository {

        private final ImportRun successful;
        private final ImportRun latest;
        private final List<ImportRun> savedRuns = new ArrayList<>();

        private RecordingRepository(ImportRun successful, ImportRun latest) {
            this.successful = successful;
            this.latest = latest;
        }

        @Override
        public void saveImportRun(ImportRun run) {
            savedRuns.add(run);
        }

        @Override
        public Optional<ImportRun> findLatestSuccessfulImportRun() {
            return Optional.ofNullable(successful);
        }

        @Override
        public Optional<ImportRun> findLatestImportRun() {
            return Optional.ofNullable(latest);
        }
    }
}
