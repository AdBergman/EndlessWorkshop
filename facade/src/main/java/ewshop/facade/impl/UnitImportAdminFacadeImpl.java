package ewshop.facade.impl;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.UnitImportService;
import ewshop.domain.service.UnitService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import ewshop.facade.mapper.UnitImportMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class UnitImportAdminFacadeImpl implements UnitImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "units";
    private static final int MAX_ERRORS = 50;

    private final UnitImportService unitImportService;
    private final UnitService unitService;

    public UnitImportAdminFacadeImpl(UnitImportService unitImportService,
                                     UnitService unitService) {
        this.unitImportService = unitImportService;
        this.unitService = unitService;
    }

    @Override
    public ImportSummaryDto importUnits(UnitImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) throw new IllegalArgumentException("Import file is required");
        assertExportKind(fileDto.exportKind());

        List<UnitImportUnitDto> rows = fileDto.units();
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("Import file has no units");

        int received = rows.size();

        List<ImportIssueDto> errors = new ArrayList<>();
        List<UnitImportSnapshot> snapshots = new ArrayList<>(received);

        for (UnitImportUnitDto dto : rows) {
            try {
                snapshots.add(UnitImportMapper.toSnapshot(dto));
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

            return ImportSummaryDto.of("units", counts, diagnostics, durationMs);
        }

        assertNoDuplicateKeys(snapshots);

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots);

        ImportResult result = unitImportService.importUnits(snapshots);

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

        unitService.getAllUnits(); // warm cache

        return ImportSummaryDto.of("units", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(UnitImportUnitDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.unitKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "UNIT_IMPORT_INVALID_ROW",
                "units",
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

    private static void assertNoDuplicateKeys(List<UnitImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (UnitImportSnapshot s : snapshots) {
            String key = s.unitKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate unitKey in import file: " + key);
            }
        }
    }

    private static ImportDetailsDto buildDetails(List<UnitImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(UnitImportSnapshot::unitKey)
                .distinct()
                .count();

        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(UnitImportBatchDto fileDto,
                                                      List<UnitImportSnapshot> snapshots) {

        long emptyLines = snapshots.stream()
                .filter(s -> s.descriptionLines() == null || s.descriptionLines().isEmpty())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();

        if (emptyLines > 0) {
            warnings.add(new ImportCountDto("EMPTY_DESCRIPTION_LINES_IN_FILE", (int) emptyLines));
        }

        if (fileDto.exporterVersion() == null || fileDto.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTER_VERSION", 1));
        }

        if (fileDto.exportedAtUtc() == null || fileDto.exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTED_AT_UTC", 1));
        }

        return warnings;
    }
}