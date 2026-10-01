package ewshop.facade.impl;

import ewshop.facade.dto.importing.ImportCountDto;
import ewshop.facade.dto.importing.ImportIssueDto;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

final class ImportAdminSupport {

    static void refusePartialSnapshot(int failed, List<ImportIssueDto> errors) {
        if (failed > 0) {
            String detail = errors.isEmpty() ? "" : " First error: " + errors.getFirst().details();
            throw new IllegalArgumentException("Snapshot has " + failed
                    + " invalid rows; no data was written or deleted." + detail);
        }
    }

    private ImportAdminSupport() {}

    static void assertExpectedExportKind(String actual, String expected) {
        if (!expected.equals(actual)) {
            throw new IllegalArgumentException(
                    "Wrong import file type: expected exportKind='" + expected +
                            "' but got '" + actual + "'"
            );
        }
    }

    static void assertPresentExportKind(String exportKind) {
        if (exportKind == null || exportKind.isBlank()) {
            throw new IllegalArgumentException("exportKind is missing");
        }
    }

    static <T> void assertNoDuplicateKeys(
            List<T> rows,
            Function<T, String> keyExtractor,
            String messagePrefix
    ) {
        Set<String> seen = new HashSet<>();
        for (T row : rows) {
            String key = keyExtractor.apply(row);
            if (!seen.add(key)) {
                throw new IllegalArgumentException(messagePrefix + key);
            }
        }
    }

    static void addMissingExporterMetadataWarnings(
            List<ImportCountDto> warnings,
            String exporterVersion,
            String exportedAtUtc
    ) {
        if (exporterVersion == null || exporterVersion.isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTER_VERSION", 1));
        }

        if (exportedAtUtc == null || exportedAtUtc.isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTED_AT_UTC", 1));
        }
    }
}
