package ewshop.facade.dto.importing;

import java.time.Instant;

public record ImportSummaryDto(
        String importKind,
        String importedAtUtc,
        ImportCountsDto counts,
        ImportDiagnosticsDto diagnostics,
        long durationMs
) {
    public static ImportSummaryDto of(
            String importKind,
            ImportCountsDto counts,
            ImportDiagnosticsDto diagnostics,
            long durationMs
    ) {
        if (importKind == null || importKind.isBlank()) {
            throw new IllegalArgumentException("importKind is required");
        }

        return new ImportSummaryDto(
                importKind,
                Instant.now().toString(),
                counts,
                diagnostics,
                durationMs
        );
    }
}