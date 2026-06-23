package ewshop.facade.impl;

import ewshop.domain.model.importing.ImportFileResult;
import ewshop.domain.model.importing.ImportFileStatus;
import ewshop.domain.model.importing.ImportHistoryCounts;
import ewshop.domain.model.importing.ImportRun;
import ewshop.domain.model.importing.ImportRunStatus;
import ewshop.domain.repository.ImportHistoryRepository;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.response.importing.AdminImportFileResultDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.interfaces.ImportHistoryFacade;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

public class ImportHistoryFacadeImpl implements ImportHistoryFacade {

    private static final String PARTIAL_PUBLIC_NOTE = "Latest import completed with some skipped or failed files.";

    private final ImportHistoryRepository importHistoryRepository;

    public ImportHistoryFacadeImpl(ImportHistoryRepository importHistoryRepository) {
        this.importHistoryRepository = importHistoryRepository;
    }

    @Override
    public DataFreshnessDto getLatestDataFreshness() {
        Optional<ImportRun> successful = importHistoryRepository.findLatestSuccessfulImportRun();
        if (successful.isPresent()) {
            return toFreshnessDto(successful.get(), null);
        }

        Optional<ImportRun> latest = importHistoryRepository.findLatestImportRun();
        if (latest.isPresent()
                && latest.get().status() == ImportRunStatus.PARTIAL_SUCCESS
                && latest.get().importedFileCount() > 0) {
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
}
