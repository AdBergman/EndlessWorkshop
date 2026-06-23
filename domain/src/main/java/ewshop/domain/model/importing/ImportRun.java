package ewshop.domain.model.importing;

import java.time.Instant;
import java.util.List;

public record ImportRun(
        String runKey,
        ImportTrigger trigger,
        ImportRunStatus status,
        Instant startedAtUtc,
        Instant completedAtUtc,
        String sourceLabel,
        String profile,
        int fileCount,
        int importedFileCount,
        int skippedFileCount,
        int failedFileCount,
        ImportHistoryCounts counts,
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String notes,
        List<ImportFileResult> fileResults
) {
    public ImportRun {
        counts = counts == null ? ImportHistoryCounts.empty() : counts;
        fileResults = fileResults == null ? List.of() : List.copyOf(fileResults);
    }
}
