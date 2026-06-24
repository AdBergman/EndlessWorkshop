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
import ewshop.facade.dto.response.importing.AdminImportFileResultDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.interfaces.ImportHistoryFacade;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class ImportHistoryFacadeImpl implements ImportHistoryFacade {

    private static final String PARTIAL_PUBLIC_NOTE = "Latest import completed with some skipped or failed files.";
    private static final String MANUAL_ADMIN_SOURCE_LABEL = "admin-upload";
    private static final String MANUAL_ADMIN_FOLDER = "admin-upload";
    private static final String PUBLIC_CODEX_IMPORT_KIND = "codex";

    private final ImportHistoryRepository importHistoryRepository;

    public ImportHistoryFacadeImpl(ImportHistoryRepository importHistoryRepository) {
        this.importHistoryRepository = importHistoryRepository;
    }

    @Override
    public DataFreshnessDto getLatestDataFreshness() {
        Optional<ImportRun> successful = importHistoryRepository
                .findLatestSuccessfulImportRunByImportedKind(PUBLIC_CODEX_IMPORT_KIND);
        if (successful.isPresent()) {
            return toFreshnessDto(successful.get(), null);
        }

        Optional<ImportRun> latest = importHistoryRepository.findLatestImportRun();
        if (latest.isPresent()
                && latest.get().status() == ImportRunStatus.PARTIAL_SUCCESS
                && hasImportedKind(latest.get(), PUBLIC_CODEX_IMPORT_KIND)) {
            return toFreshnessDto(latest.get(), PARTIAL_PUBLIC_NOTE);
        }

        return DataFreshnessDto.unavailable();
    }

    @Override
    public AdminLatestImportDto getLatestImport() {
        return importHistoryRepository.findLatestImportRun()
                .map(this::toAdminDto)
                .orElseGet(AdminLatestImportDto::unavailable);
    }

    @Override
    public void recordManualAdminImport(
            String filename,
            String exportKind,
            String importKind,
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String schemaVersion,
            Instant startedAtUtc,
            ImportSummaryDto summary
    ) {
        Instant completedAtUtc = Instant.now();
        ImportHistoryCounts counts = summary == null ? ImportHistoryCounts.empty() : countsFrom(summary.counts());
        String resolvedImportKind = firstNonBlank(importKind, summary == null ? null : summary.importKind(), exportKind);
        ImportFileResult fileResult = new ImportFileResult(
                MANUAL_ADMIN_FOLDER,
                safeFilename(filename, exportKind),
                null,
                null,
                trimToNull(exportKind),
                trimToNull(resolvedImportKind),
                trimToNull(game),
                trimToNull(gameVersion),
                trimToNull(exporterVersion),
                trimToNull(exportedAtUtc),
                trimToNull(schemaVersion),
                ImportFileStatus.IMPORTED,
                null,
                null,
                counts,
                summary == null ? null : summary.durationMs()
        );

        importHistoryRepository.saveImportRun(new ImportRun(
                UUID.randomUUID().toString(),
                ImportTrigger.MANUAL_ADMIN,
                ImportRunStatus.SUCCESS,
                startedAtUtc == null ? completedAtUtc : startedAtUtc,
                completedAtUtc,
                MANUAL_ADMIN_SOURCE_LABEL,
                null,
                1,
                1,
                0,
                0,
                counts,
                trimToNull(game),
                trimToNull(gameVersion),
                trimToNull(exporterVersion),
                trimToNull(exportedAtUtc),
                null,
                List.of(fileResult)
        ));
    }

    @Override
    public void recordFailedManualAdminImport(
            String filename,
            String exportKind,
            String importKind,
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String schemaVersion,
            Instant startedAtUtc,
            String errorMessage
    ) {
        Instant completedAtUtc = Instant.now();
        String safeErrorMessage = shortMessage(errorMessage);
        ImportFileResult fileResult = new ImportFileResult(
                MANUAL_ADMIN_FOLDER,
                safeFilename(filename, exportKind),
                null,
                null,
                trimToNull(exportKind),
                trimToNull(firstNonBlank(importKind, exportKind)),
                trimToNull(game),
                trimToNull(gameVersion),
                trimToNull(exporterVersion),
                trimToNull(exportedAtUtc),
                trimToNull(schemaVersion),
                ImportFileStatus.FAILED,
                null,
                safeErrorMessage,
                ImportHistoryCounts.empty(),
                null
        );

        importHistoryRepository.saveImportRun(new ImportRun(
                UUID.randomUUID().toString(),
                ImportTrigger.MANUAL_ADMIN,
                ImportRunStatus.FAILED,
                startedAtUtc == null ? completedAtUtc : startedAtUtc,
                completedAtUtc,
                MANUAL_ADMIN_SOURCE_LABEL,
                null,
                1,
                0,
                0,
                1,
                ImportHistoryCounts.empty(),
                trimToNull(game),
                trimToNull(gameVersion),
                trimToNull(exporterVersion),
                trimToNull(exportedAtUtc),
                safeErrorMessage,
                List.of(fileResult)
        ));
    }

    private DataFreshnessDto toFreshnessDto(ImportRun run, String note) {
        return new DataFreshnessDto(
                true,
                instantString(run.completedAtUtc()),
                run.game(),
                run.gameVersion(),
                run.exporterVersion(),
                run.exportedAtUtc(),
                run.sourceLabel(),
                run.importedFileCount(),
                importedKinds(run),
                note
        );
    }

    private AdminLatestImportDto toAdminDto(ImportRun run) {
        return new AdminLatestImportDto(
                true,
                run.runKey(),
                run.trigger().name(),
                run.status().name(),
                instantString(run.startedAtUtc()),
                instantString(run.completedAtUtc()),
                run.sourceLabel(),
                run.fileCount(),
                run.importedFileCount(),
                run.skippedFileCount(),
                run.failedFileCount(),
                toCountsDto(run.counts()),
                run.game(),
                run.gameVersion(),
                run.exporterVersion(),
                run.exportedAtUtc(),
                run.notes(),
                run.fileResults().stream()
                        .map(this::toAdminFileDto)
                        .toList()
        );
    }

    private AdminImportFileResultDto toAdminFileDto(ImportFileResult result) {
        return new AdminImportFileResultDto(
                result.filename(),
                result.folder(),
                result.exportKind(),
                result.importKind(),
                result.status().name(),
                result.skipReason(),
                result.errorMessage(),
                toCountsDto(result.counts()),
                result.durationMs(),
                shortHash(result.fileSha256())
        );
    }

    private static ImportCountsDto toCountsDto(ImportHistoryCounts counts) {
        return new ImportCountsDto(
                counts.received(),
                counts.inserted(),
                counts.updated(),
                counts.unchanged(),
                counts.deleted(),
                counts.failed()
        );
    }

    private static ImportHistoryCounts countsFrom(ImportCountsDto counts) {
        if (counts == null) return ImportHistoryCounts.empty();
        return new ImportHistoryCounts(
                counts.received(),
                counts.inserted(),
                counts.updated(),
                counts.unchanged(),
                counts.deleted(),
                counts.failed()
        );
    }

    private static List<String> importedKinds(ImportRun run) {
        LinkedHashSet<String> kinds = new LinkedHashSet<>();
        for (ImportFileResult result : run.fileResults()) {
            if (result.status() != ImportFileStatus.IMPORTED) {
                continue;
            }
            String kind = kindLabel(result);
            if (kind != null && !kind.isBlank()) {
                kinds.add(kind);
            }
        }
        return kinds.stream().sorted().toList();
    }

    private static boolean hasImportedKind(ImportRun run, String importKind) {
        return run.fileResults().stream()
                .anyMatch(result -> result.status() == ImportFileStatus.IMPORTED
                        && importKind.equalsIgnoreCase(trimToNull(result.importKind())));
    }

    private static String kindLabel(ImportFileResult result) {
        if (result.importKind() != null && !result.importKind().isBlank()) {
            return result.importKind().trim();
        }
        if (result.exportKind() != null && !result.exportKind().isBlank()) {
            return result.exportKind().trim();
        }
        return null;
    }

    private static String instantString(Instant instant) {
        return instant == null ? null : instant.toString();
    }

    private static String shortHash(String hash) {
        if (hash == null || hash.length() <= 12) {
            return hash;
        }
        return hash.substring(0, 12);
    }

    private static String safeFilename(String filename, String exportKind) {
        String fallback = firstNonBlank(exportKind, "admin-import") + ".json";
        String value = firstNonBlank(filename, fallback);
        value = value.replace('\\', '/');
        int lastSlash = value.lastIndexOf('/');
        if (lastSlash >= 0) {
            value = value.substring(lastSlash + 1);
        }
        value = value.replaceAll("[\\p{Cntrl}]", "").trim();
        return value.isBlank() ? fallback : value;
    }

    private static String shortMessage(String message) {
        String value = trimToNull(message);
        if (value == null) return null;
        return value.length() <= 500 ? value : value.substring(0, 500);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            String trimmed = trimToNull(value);
            if (trimmed != null) {
                return trimmed;
            }
        }
        return null;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
