package ewshop.facade.impl;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.TechImportService;
import ewshop.domain.service.TechService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.mapper.TechImportMapper;

import java.util.*;

public class TechImportAdminFacadeImpl implements TechImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "tech";
    private static final int MAX_ERRORS = 50;

    private final TechImportService techImportService;
    private final TechService techService;

    public TechImportAdminFacadeImpl(TechImportService techImportService, TechService techService) {
        this.techImportService = techImportService;
        this.techService = techService;
    }

    @Override
    public ImportSummaryDto importTechs(TechImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) {
            throw new IllegalArgumentException("Import file is required");
        }

        assertExportKind(fileDto.exportKind());

        List<TechImportTechDto> techDtos = fileDto.techs();
        if (techDtos == null || techDtos.isEmpty()) {
            throw new IllegalArgumentException("Import file has no techs");
        }

        int received = techDtos.size();

        List<ImportIssueDto> errors = new ArrayList<>();
        List<TechImportSnapshot> snapshots = new ArrayList<>(received);

        for (TechImportTechDto dto : techDtos) {
            try {
                TechImportSnapshot s = TechImportMapper.toDomain(dto);
                snapshots.add(s);
            } catch (RuntimeException ex) {
                if (errors.size() < MAX_ERRORS) {
                    errors.add(toIssue(dto, ex));
                }
            }
        }

        // "failed" means: rows that failed to map/validate into snapshots (not filtered by policy)
        int failed = received - snapshots.size();

        if (snapshots.isEmpty()) {
            long durationMs = System.currentTimeMillis() - startMs;

            ImportCountsDto counts = new ImportCountsDto(
                    received,
                    0,
                    0,
                    0,
                    0,      // deleted
                    failed
            );

            ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                    buildWarnings(fileDto, List.of()),
                    errors,
                    buildDetails(List.of(), received)
            );

            return ImportSummaryDto.of("tech", counts, diagnostics, durationMs);
        }

        assertNoDuplicateTechKeys(snapshots);

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots);

        ImportResult result = techImportService.importSnapshot(snapshots);

        int inserted = result.getInserted();
        int updated = result.getUpdated();
        int unchanged = result.getUnchanged();
        int deleted = result.getDeleted();

        long durationMs = System.currentTimeMillis() - startMs;

        ImportCountsDto counts = new ImportCountsDto(
                received,
                inserted,
                updated,
                unchanged,
                deleted,
                failed
        );

        ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                warnings,
                errors,
                buildDetails(snapshots, received)
        );

        // warm cache immediately so next public read doesn't hit DB
        techService.getAllTechs();

        return ImportSummaryDto.of("tech", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(TechImportTechDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.techKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "TECH_IMPORT_INVALID_ROW",
                "tech",
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

    private static void assertNoDuplicateTechKeys(List<TechImportSnapshot> snapshots) {
        Set<String> seen = new HashSet<>();
        for (TechImportSnapshot s : snapshots) {
            String key = s.techKey();
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate techKey in import file: " + key);
            }
        }
    }

    private static ImportDetailsDto buildDetails(List<TechImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(TechImportSnapshot::techKey)
                .distinct()
                .count();

        int duplicates = received - distinct;

        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(TechImportBatchDto fileDto, List<TechImportSnapshot> snapshots) {
        long hidden = snapshots.stream().filter(TechImportSnapshot::hidden).count();
        long emptyLore = snapshots.stream().filter(s -> s.lore() == null || s.lore().isBlank()).count();
        long tbdNames = snapshots.stream().filter(s -> {
            String n = s.displayName();
            return n != null && n.toUpperCase().contains("[TBD]");
        }).count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (hidden > 0) warnings.add(new ImportCountDto("HIDDEN_TECH_IN_FILE", (int) hidden));
        if (emptyLore > 0) warnings.add(new ImportCountDto("EMPTY_LORE_IN_FILE", (int) emptyLore));
        if (tbdNames > 0) warnings.add(new ImportCountDto("TBD_NAME_IN_FILE", (int) tbdNames));

        if (fileDto.exporterVersion() == null || fileDto.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTER_VERSION", 1));
        }
        if (fileDto.exportedAtUtc() == null || fileDto.exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_EXPORTED_AT_UTC", 1));
        }

        return warnings;
    }
}