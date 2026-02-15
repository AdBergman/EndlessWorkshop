package ewshop.facade.impl;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.ImprovementImportService;
import ewshop.domain.service.ImprovementService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportImprovementDto;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.mapper.ImprovementImportMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ImprovementImportAdminFacadeImpl implements ImprovementImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "improvements";
    private static final int MAX_ERRORS = 50;

    private final ImprovementImportService improvementImportService;
    private final ImprovementService improvementService;

    public ImprovementImportAdminFacadeImpl(ImprovementImportService improvementImportService,
                                            ImprovementService improvementService) {
        this.improvementImportService = improvementImportService;
        this.improvementService = improvementService;
    }

    @Override
    public ImportSummaryDto importImprovements(ImprovementImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) throw new IllegalArgumentException("Import file is required");
        assertExportKind(fileDto.exportKind());

        List<ImprovementImportImprovementDto> rows = fileDto.improvements();
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("Import file has no improvements");

        int received = rows.size();

        List<ImportIssueDto> errors = new ArrayList<>();
        List<ImprovementImportSnapshot> snapshots = new ArrayList<>(received);

        for (ImprovementImportImprovementDto dto : rows) {
            try {
                snapshots.add(ImprovementImportMapper.toSnapshot(dto));
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

            return ImportSummaryDto.of("improvements", counts, diagnostics, durationMs);
        }

        assertNoDuplicateKeys(snapshots);

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots);

        ImportResult result = improvementImportService.importImprovements(snapshots);

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

        // warm cache
        improvementService.getAllImprovements();

        return ImportSummaryDto.of("improvements", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(ImprovementImportImprovementDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.constructibleKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "IMPROVEMENT_IMPORT_INVALID_ROW",
                "improvements",
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

    private static void assertNoDuplicateKeys(List<ImprovementImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (ImprovementImportSnapshot s : snapshots) {
            String key = s.constructibleKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate constructibleKey in import file: " + key);
            }
        }
    }

    private static ImportDetailsDto buildDetails(List<ImprovementImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(ImprovementImportSnapshot::constructibleKey)
                .distinct()
                .count();

        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(ImprovementImportBatchDto fileDto, List<ImprovementImportSnapshot> snapshots) {
        long emptyCategory = snapshots.stream()
                .filter(s -> s.category() == null || s.category().isBlank())
                .count();

        long emptyLines = snapshots.stream()
                .filter(s -> s.descriptionLines() == null || s.descriptionLines().isEmpty())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (emptyCategory > 0) warnings.add(new ImportCountDto("EMPTY_CATEGORY_IN_FILE", (int) emptyCategory));
        if (emptyLines > 0) warnings.add(new ImportCountDto("EMPTY_DESCRIPTION_LINES_IN_FILE", (int) emptyLines));

        if (fileDto.exporterVersion() == null || fileDto.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTER_VERSION", 1));
        }
        if (fileDto.exportedAtUtc() == null || fileDto.exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTED_AT_UTC", 1));
        }

        return warnings;
    }
}