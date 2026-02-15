package ewshop.facade.impl;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.DistrictImportService;
import ewshop.domain.service.DistrictService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.mapper.DistrictImportMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class DistrictImportAdminFacadeImpl implements DistrictImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "districts";
    private static final int MAX_ERRORS = 50;

    private final DistrictImportService districtImportService;
    private final DistrictService districtService;

    public DistrictImportAdminFacadeImpl(DistrictImportService districtImportService,
                                         DistrictService districtService) {
        this.districtImportService = districtImportService;
        this.districtService = districtService;
    }

    @Override
    public ImportSummaryDto importDistricts(DistrictImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) throw new IllegalArgumentException("Import file is required");
        assertExportKind(fileDto.exportKind());

        List<DistrictImportDistrictDto> rows = fileDto.districts();
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("Import file has no districts");

        int received = rows.size();

        List<ImportIssueDto> errors = new ArrayList<>();
        List<DistrictImportSnapshot> snapshots = new ArrayList<>(received);

        for (DistrictImportDistrictDto dto : rows) {
            try {
                snapshots.add(DistrictImportMapper.toSnapshot(dto));
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
                    0, // deleted
                    failed
            );

            ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                    buildWarnings(fileDto, List.of()),
                    errors,
                    buildDetails(List.of(), received)
            );

            return ImportSummaryDto.of("districts", counts, diagnostics, durationMs);
        }

        assertNoDuplicateKeys(snapshots);

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots);

        ImportResult result = districtImportService.importDistricts(snapshots);

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

        // warm cache (if you have caching); harmless if not cached
        districtService.getAllDistricts();

        return ImportSummaryDto.of("districts", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(DistrictImportDistrictDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.districtKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "DISTRICT_IMPORT_INVALID_ROW",
                "districts",
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

    private static void assertNoDuplicateKeys(List<DistrictImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (DistrictImportSnapshot s : snapshots) {
            String key = s.districtKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate districtKey in import file: " + key);
            }
        }
    }

    private static ImportDetailsDto buildDetails(List<DistrictImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(DistrictImportSnapshot::districtKey)
                .distinct()
                .count();

        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(DistrictImportBatchDto fileDto, List<DistrictImportSnapshot> snapshots) {
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