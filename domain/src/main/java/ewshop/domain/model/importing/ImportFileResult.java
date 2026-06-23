package ewshop.domain.model.importing;

public record ImportFileResult(
        String folder,
        String filename,
        String sourcePathHash,
        String fileSha256,
        String exportKind,
        String importKind,
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String schemaVersion,
        ImportFileStatus status,
        String skipReason,
        String errorMessage,
        ImportHistoryCounts counts,
        Long durationMs
) {
    public ImportFileResult {
        counts = counts == null ? ImportHistoryCounts.empty() : counts;
    }
}
