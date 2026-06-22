package ewshop.facade.impl;

import ewshop.domain.command.RichSkillImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.RichSkillImportService;
import ewshop.domain.service.RichSkillService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;
import ewshop.facade.interfaces.RichSkillImportAdminFacade;
import ewshop.facade.mapper.RichSkillImportMapper;

import java.util.ArrayList;
import java.util.List;

public class RichSkillImportAdminFacadeImpl implements RichSkillImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "skills";

    private final RichSkillImportService richSkillImportService;
    private final RichSkillService richSkillService;

    public RichSkillImportAdminFacadeImpl(
            RichSkillImportService richSkillImportService,
            RichSkillService richSkillService
    ) {
        this.richSkillImportService = richSkillImportService;
        this.richSkillService = richSkillService;
    }

    @Override
    public ImportSummaryDto importSkills(SkillImportBatchDto file) {
        long startMs = System.currentTimeMillis();

        if (file == null) throw new IllegalArgumentException("Import file is required");
        ImportAdminSupport.assertExpectedExportKind(file.exportKind(), EXPECTED_EXPORT_KIND);
        if (file.skills() == null || file.skills().isEmpty()) {
            throw new IllegalArgumentException("Import file has no skills");
        }

        RichSkillImportSnapshot snapshot = RichSkillImportMapper.toSnapshot(file);

        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skillTrees(),
                RichSkillImportSnapshot.SkillTreeSnapshot::treeKey,
                "Duplicate skill treeKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skillTiers(),
                RichSkillImportSnapshot.SkillTierSnapshot::tierPlacementKey,
                "Duplicate skill tierPlacementKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skills(),
                RichSkillImportSnapshot.HeroSkillSnapshot::skillKey,
                "Duplicate skillKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.heroSkillDefaults(),
                RichSkillImportSnapshot.HeroSkillDefaultSnapshot::heroKey,
                "Duplicate hero skill default heroKey in import file: "
        );

        ImportResult result = richSkillImportService.importSkills(snapshot);
        long durationMs = System.currentTimeMillis() - startMs;

        int received = snapshot.skillTrees().size()
                + snapshot.skillTiers().size()
                + snapshot.skills().size()
                + snapshot.heroSkillDefaults().size();
        ImportCountsDto counts = new ImportCountsDto(
                received,
                result.getInserted(),
                result.getUpdated(),
                result.getUnchanged(),
                result.getDeleted(),
                0
        );
        ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                buildWarnings(file, snapshot),
                List.of(),
                new ImportDetailsDto(received, 0)
        );

        richSkillService.getAllSkills();

        return ImportSummaryDto.of("skills", counts, diagnostics, durationMs);
    }

    private static List<ImportCountDto> buildWarnings(SkillImportBatchDto file, RichSkillImportSnapshot snapshot) {
        long missingPublicDisplayName = snapshot.skills().stream()
                .filter(skill -> skill.publicDisplayName() == null || skill.publicDisplayName().isBlank())
                .count();

        List<ImportCountDto> warnings = new ArrayList<>();
        if (missingPublicDisplayName > 0) {
            warnings.add(new ImportCountDto("MISSING_PUBLIC_DISPLAY_NAME_IN_FILE", (int) missingPublicDisplayName));
        }
        ImportAdminSupport.addMissingExporterMetadataWarnings(
                warnings,
                file.exporterVersion(),
                file.exportedAtUtc()
        );
        return warnings;
    }
}
