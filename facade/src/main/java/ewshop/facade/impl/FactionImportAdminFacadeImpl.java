package ewshop.facade.impl;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.FactionImportService;
import ewshop.domain.service.FactionService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportFactionDto;
import ewshop.facade.interfaces.FactionImportAdminFacade;
import ewshop.facade.mapper.FactionImportMapper;

import java.util.ArrayList;
import java.util.List;

public class FactionImportAdminFacadeImpl implements FactionImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "factions";
    private static final int MAX_ERRORS = 50;

    private final FactionImportService factionImportService;
    private final FactionService factionService;

    public FactionImportAdminFacadeImpl(
            FactionImportService factionImportService,
            FactionService factionService
    ) {
        this.factionImportService = factionImportService;
        this.factionService = factionService;
    }

    @Override
    public ImportSummaryDto importFactions(FactionImportBatchDto fileDto) {
        long startMs = System.currentTimeMillis();

        if (fileDto == null) throw new IllegalArgumentException("Import file is required");
        ImportAdminSupport.assertExpectedExportKind(fileDto.exportKind(), EXPECTED_EXPORT_KIND);

        List<FactionImportFactionDto> rows = fileDto.factions();
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("Import file has no factions");

        int received = rows.size();
        List<ImportIssueDto> errors = new ArrayList<>();
        List<FactionImportSnapshot> snapshots = new ArrayList<>(received);
        int filtered = 0;

        for (FactionImportFactionDto dto : rows) {
            if (FactionImportMapper.isFiltered(dto)) {
                filtered++;
                continue;
            }

            try {
                snapshots.add(FactionImportMapper.toSnapshot(dto));
            } catch (RuntimeException ex) {
                if (errors.size() < MAX_ERRORS) {
                    errors.add(toIssue(dto, ex));
                }
            }
        }

        int failed = received - filtered - snapshots.size();

        if (snapshots.isEmpty()) {
            long durationMs = System.currentTimeMillis() - startMs;
            ImportCountsDto counts = new ImportCountsDto(received, 0, 0, 0, 0, failed);
            ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                    buildWarnings(fileDto, List.of(), filtered),
                    errors,
                    buildDetails(List.of(), received)
            );

            return ImportSummaryDto.of("factions", counts, diagnostics, durationMs);
        }

        ImportAdminSupport.assertNoDuplicateKeys(
                snapshots,
                FactionImportSnapshot::factionKey,
                "Duplicate factionKey in import file: "
        );

        List<ImportCountDto> warnings = buildWarnings(fileDto, snapshots, filtered);
        ImportResult result = factionImportService.importFactions(snapshots);
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

        factionService.getAllFactions();

        return ImportSummaryDto.of("factions", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(FactionImportFactionDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.factionKey();
        if ((key == null || key.isBlank()) && dto != null) key = dto.entryKey();
        String name = dto == null ? null : dto.publicDisplayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto(
                "FACTION_IMPORT_INVALID_ROW",
                "factions",
                key,
                name,
                message
        );
    }

    private static ImportDetailsDto buildDetails(List<FactionImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(FactionImportSnapshot::factionKey)
                .distinct()
                .count();

        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(
            FactionImportBatchDto fileDto,
            List<FactionImportSnapshot> snapshots,
            int filtered
    ) {
        long emptyLore = snapshots.stream()
                .filter(snapshot -> snapshot.lore() == null || snapshot.lore().isBlank())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (filtered > 0) warnings.add(new ImportCountDto("FILTERED_FACTION_ROWS", filtered));
        if (emptyLore > 0) warnings.add(new ImportCountDto("EMPTY_LORE_IN_FILE", (int) emptyLore));

        ImportAdminSupport.addMissingExporterMetadataWarnings(
                warnings,
                fileDto.exporterVersion(),
                fileDto.exportedAtUtc()
        );

        return warnings;
    }
}
