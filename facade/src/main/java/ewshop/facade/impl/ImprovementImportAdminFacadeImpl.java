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
import java.util.List;

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
        ImportAdminSupport.assertExpectedExportKind(fileDto.exportKind(), EXPECTED_EXPORT_KIND);

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

        ImportAdminSupport.assertNoDuplicateKeys(
                snapshots,
                ImprovementImportSnapshot::constructibleKey,
                "Duplicate constructibleKey in import file: "
        );

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

        ImportAdminSupport.addMissingExporterMetadataWarnings(
                warnings,
                fileDto.exporterVersion(),
                fileDto.exportedAtUtc()
        );

        return warnings;
    }
}
