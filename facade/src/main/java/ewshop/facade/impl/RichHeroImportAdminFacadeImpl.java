package ewshop.facade.impl;

import ewshop.domain.command.RichHeroImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.RichHeroImportService;
import ewshop.domain.service.RichHeroService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;
import ewshop.facade.dto.importing.heroes.HeroImportHeroDto;
import ewshop.facade.interfaces.RichHeroImportAdminFacade;
import ewshop.facade.mapper.RichHeroImportMapper;

import java.util.ArrayList;
import java.util.List;

public class RichHeroImportAdminFacadeImpl implements RichHeroImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "heroes";
    private static final int MAX_ERRORS = 50;

    private final RichHeroImportService richHeroImportService;
    private final RichHeroService richHeroService;

    public RichHeroImportAdminFacadeImpl(
            RichHeroImportService richHeroImportService,
            RichHeroService richHeroService
    ) {
        this.richHeroImportService = richHeroImportService;
        this.richHeroService = richHeroService;
    }

    @Override
    public ImportSummaryDto importHeroes(HeroImportBatchDto file) {
        long startMs = System.currentTimeMillis();

        if (file == null) throw new IllegalArgumentException("Import file is required");
        ImportAdminSupport.assertExpectedExportKind(file.exportKind(), EXPECTED_EXPORT_KIND);

        List<HeroImportHeroDto> rows = file.units();
        if (rows == null || rows.isEmpty()) {
            throw new IllegalArgumentException("Import file has no heroes in units[]");
        }

        int received = rows.size();
        List<ImportIssueDto> errors = new ArrayList<>();
        List<RichHeroImportSnapshot> snapshots = new ArrayList<>(received);
        int filtered = 0;

        for (HeroImportHeroDto dto : rows) {
            if (RichHeroImportMapper.isFiltered(dto)) {
                filtered++;
                continue;
            }

            try {
                snapshots.add(RichHeroImportMapper.toSnapshot(dto));
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
                    buildWarnings(file, List.of(), filtered),
                    errors,
                    buildDetails(List.of(), received)
            );
            return ImportSummaryDto.of("heroes", counts, diagnostics, durationMs);
        }

        ImportAdminSupport.assertNoDuplicateKeys(
                snapshots,
                RichHeroImportSnapshot::unitKey,
                "Duplicate hero unitKey in import file: "
        );

        List<ImportCountDto> warnings = buildWarnings(file, snapshots, filtered);
        ImportResult result = richHeroImportService.importHeroes(snapshots);
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

        richHeroService.getAllHeroes();

        return ImportSummaryDto.of("heroes", counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(HeroImportHeroDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.unitKey();
        if ((key == null || key.isBlank()) && dto != null) key = dto.heroKey();
        if ((key == null || key.isBlank()) && dto != null) key = dto.entryKey();
        String name = dto == null ? null : dto.displayName();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();

        return new ImportIssueDto("HERO_IMPORT_INVALID_ROW", "heroes", key, name, message);
    }

    private static ImportDetailsDto buildDetails(List<RichHeroImportSnapshot> snapshots, int received) {
        int distinct = (int) snapshots.stream()
                .map(RichHeroImportSnapshot::unitKey)
                .distinct()
                .count();
        int duplicates = received - distinct;
        return new ImportDetailsDto(distinct, duplicates);
    }

    private static List<ImportCountDto> buildWarnings(
            HeroImportBatchDto file,
            List<RichHeroImportSnapshot> snapshots,
            int filtered
    ) {
        long emptySkillTrees = snapshots.stream()
                .filter(snapshot -> snapshot.applicableSkillTreeKeys().isEmpty())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (filtered > 0) warnings.add(new ImportCountDto("FILTERED_HERO_ROWS", filtered));
        if (emptySkillTrees > 0) warnings.add(new ImportCountDto("EMPTY_APPLICABLE_SKILL_TREES_IN_FILE", (int) emptySkillTrees));
        ImportAdminSupport.addMissingExporterMetadataWarnings(
                warnings,
                file.exporterVersion(),
                file.exportedAtUtc()
        );
        return warnings;
    }
}
