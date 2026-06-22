package ewshop.facade.impl;

import ewshop.domain.command.SkillImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.SkillImportService;
import ewshop.domain.service.SkillService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;
import ewshop.facade.interfaces.SkillImportAdminFacade;
import ewshop.facade.mapper.SkillImportMapper;

import java.util.ArrayList;
import java.util.List;

public class SkillImportAdminFacadeImpl implements SkillImportAdminFacade {

    private static final String EXPECTED_EXPORT_KIND = "skills";

    private final SkillImportService skillImportService;
    private final SkillService skillService;

    public SkillImportAdminFacadeImpl(
            SkillImportService skillImportService,
            SkillService skillService
    ) {
        this.skillImportService = skillImportService;
        this.skillService = skillService;
    }

    @Override
    public ImportSummaryDto importSkills(SkillImportBatchDto file) {
        long startMs = System.currentTimeMillis();

        if (file == null) throw new IllegalArgumentException("Import file is required");
        ImportAdminSupport.assertExpectedExportKind(file.exportKind(), EXPECTED_EXPORT_KIND);
        if (file.skills() == null || file.skills().isEmpty()) {
            throw new IllegalArgumentException("Import file has no skills");
        }

        SkillImportSnapshot snapshot = SkillImportMapper.toSnapshot(file);

        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skillTrees(),
                SkillImportSnapshot.SkillTreeSnapshot::treeKey,
                "Duplicate skill treeKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skillTiers(),
                SkillImportSnapshot.SkillTierSnapshot::tierPlacementKey,
                "Duplicate skill tierPlacementKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.skills(),
                SkillImportSnapshot.HeroSkillSnapshot::skillKey,
                "Duplicate skillKey in import file: "
        );
        ImportAdminSupport.assertNoDuplicateKeys(
                snapshot.heroSkillDefaults(),
                SkillImportSnapshot.HeroSkillDefaultSnapshot::heroKey,
                "Duplicate hero skill default heroKey in import file: "
        );

        ImportResult result = skillImportService.importSkills(snapshot);
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

        skillService.getAllSkills();

        return ImportSummaryDto.of("skills", counts, diagnostics, durationMs);
    }

    private static List<ImportCountDto> buildWarnings(SkillImportBatchDto file, SkillImportSnapshot snapshot) {
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
