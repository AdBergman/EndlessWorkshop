package ewshop.facade.impl;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.CodexImportService;
import ewshop.domain.service.CodexService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.mapper.CodexImportMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CodexImportAdminFacadeImpl implements CodexImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "abilities";
    private static final int MAX_ERRORS = 50;

    private final CodexImportService codexImportService;
    private final CodexService codexService;

    public CodexImportAdminFacadeImpl(CodexImportService codexImportService,
                                      CodexService codexService) {
        this.codexImportService = codexImportService;
        this.codexService = codexService;
    }

    @Override
    public ImportSummaryDto importCodex(CodexImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) throw new IllegalArgumentException("Import file is required");
        assertExportKind(fileDto.exportKind());

        List<CodexImportEntryDto> rows = fileDto.entries();
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("Import file has no entries");

        int received = rows.size();

        List<ImportIssueDto> errors = new ArrayList<>();
        List<CodexImportSnapshot> snapshots = new ArrayList<>(received);

        for (CodexImportEntryDto dto : rows) {
            try {
                snapshots.add(CodexImportMapper.toSnapshot(fileDto.exportKind(), dto));
            } catch (RuntimeException ex) {
                if (errors.size() < MAX_ERRORS) {
                    errors.add(toIssue(dto, ex));
                }
            }
        }

        int failed = received - snapshots.size();

        if (snapshots.isEmpty()) {
            long durationMs = System.currentTimeMillis() - startMs;

            ImportCountsDto counts = new ImportCountsDto(
                    received,
                    0,
                    0,
                    0,
                    0,
                    failed
            );

            ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                    buildWarnings(fileDto, List.of()),
                    errors,
                    buildDetails(List.of(), received)
            );

            return ImportSummaryDto.of("codex", counts, diagnostics, durationMs);
        }

        assertNoDuplicateKeys(snapshots);

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots);

        ImportResult result = codexImportService.importCodex(snapshots);

        long durationMs = System.currentTimeMillis() - startMs;

        ImportCountsDto counts = new ImportCountsDto(
                received,
                result.getInserted(),
                result.getUpdated(),
                result.getUnchanged(),
                result.getDeleted(),
                failed
        );

        ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                warnings,
                errors,
                buildDetails(snapshots, received)
        );

        codexService.getAllCodexEntries();

        return ImportSummaryDto.of("codex", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(CodexImportEntryDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.entryKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "CODEX_IMPORT_INVALID_ROW",
                "codex",
                key,
                name,
                message
        );
    }

    private static void assertExportKind(String exportKind) {
        if (!EXPECTED_EXPORT_KIND.equals(exportKind)) {
            throw new IllegalArgumentException(
                    "Wrong import file type: expected exportKind='" + EXPECTED_EXPORT_KIND +
                            "' but got '" + exportKind + "'"
            );
        }
    }

    private static void assertNoDuplicateKeys(List<CodexImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (CodexImportSnapshot s : snapshots) {
            String key = s.entryKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate entryKey in import file: " + key);
            }
        }
    }

    private static ImportDetailsDto buildDetails(List<CodexImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(CodexImportSnapshot::entryKey)
                .distinct()
                .count();

        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(CodexImportBatchDto fileDto, List<CodexImportSnapshot> snapshots) {
        long emptyLines = snapshots.stream()
                .filter(s -> s.descriptionLines() == null || s.descriptionLines().isEmpty())
                .count();

        long emptyRefs = snapshots.stream()
                .filter(s -> s.referenceLines() == null || s.referenceLines().isEmpty())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (emptyLines > 0) warnings.add(new ImportCountDto("EMPTY_DESCRIPTION_LINES_IN_FILE", (int) emptyLines));
        if (emptyRefs > 0) warnings.add(new ImportCountDto("EMPTY_REFERENCE_LINES_IN_FILE", (int) emptyRefs));

        if (fileDto.exporterVersion() == null || fileDto.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_SOURCE_VERSION", 1));
        }

        return warnings;
    }
}