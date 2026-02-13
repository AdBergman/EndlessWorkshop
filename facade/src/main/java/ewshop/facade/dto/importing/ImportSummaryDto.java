package ewshop.facade.dto.importing;

public record ImportSummaryDto(
        String importKind,
        String importedAtUtc,
        ImportCountsDto counts,
        ImportDiagnosticsDto diagnostics,
        long durationMs
) {
    private static final String TECH = "tech";

    public static ImportSummaryDto forTech(
            ImportCountsDto counts,
            ImportDiagnosticsDto diagnostics,
            long durationMs
    ) {
        return new ImportSummaryDto(
                TECH,
                java.time.Instant.now().toString(),
                counts,
                diagnostics,
                durationMs
        );
    }
}