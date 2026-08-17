package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.FactionImportAdminFacade;
import ewshop.facade.interfaces.HeroImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.ImportHistoryFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.SkillImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;

import java.time.Instant;
import java.util.List;

final class ImportAdminControllerFixtures {

    private ImportAdminControllerFixtures() {
    }

    static QuestExplorerImportBatchDto questPayload(List<QuestExplorerImportEntryDto> entries) {
        return new QuestExplorerImportBatchDto(
                "0.80",
                "0.1.0",
                "now",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    static TechImportBatchDto techPayload(String exportKind, List<TechImportTechDto> techs) {
        return new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                exportKind,
                techs
        );
    }

    static TechImportTechDto tech(String techKey) {
        return new TechImportTechDto(
                techKey,
                "Tech A",
                null,
                false,
                1,
                "Discovery",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    static QuestExplorerImportEntryDto questEntry() {
        return new QuestExplorerImportEntryDto(
                "Quest_A",
                "A Quest",
                List.of("Summary"),
                "Curiosity",
                true,
                false,
                List.of("Source_A"),
                new QuestExplorerImportNavigationDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        1,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    static ImportSummaryDto okSummary(String kind) {
        return new ImportSummaryDto(
                kind,
                "2026-05-02T00:00:00Z",
                new ImportCountsDto(1, 1, 0, 0, 0, 0),
                new ImportDiagnosticsDto(List.of(), List.of(), null),
                1L
        );
    }

    static ImportPreviewSummaryDto okSmokeSummary(String kind) {
        return new ImportPreviewSummaryDto(
                kind,
                1,
                1,
                1,
                0,
                0,
                List.of(),
                List.of()
        );
    }

    static final class RecordingQuestExplorerImportAdminFacade implements QuestExplorerImportAdminFacade {
        QuestExplorerImportBatchDto lastDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("quest_explorer");
        }
    }

    static final class RecordingCodexImportAdminFacade implements CodexImportAdminFacade {
        CodexImportBatchDto lastDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("codex");
        }
    }

    static final class RecordingImportHistoryFacade implements ImportHistoryFacade {
        AdminLatestImportDto latestImport = AdminLatestImportDto.unavailable();
        String lastSuccessFilename;
        String lastSuccessExportKind;
        String lastSuccessImportKind;
        String lastSuccessGame;
        String lastSuccessGameVersion;
        String lastSuccessExportedAtUtc;
        String lastFailedFilename;
        String lastFailedExportKind;
        String lastFailedGameVersion;
        String lastFailedErrorMessage;

        @Override
        public DataFreshnessDto getLatestDataFreshness() {
            return DataFreshnessDto.unavailable();
        }

        @Override
        public AdminLatestImportDto getLatestImport() {
            return latestImport;
        }

        @Override
        public void recordManualAdminImport(
                String filename,
                String exportKind,
                String importKind,
                String game,
                String gameVersion,
                String exporterVersion,
                String exportedAtUtc,
                String schemaVersion,
                Instant startedAtUtc,
                ImportSummaryDto summary
        ) {
            lastSuccessFilename = filename;
            lastSuccessExportKind = exportKind;
            lastSuccessImportKind = importKind;
            lastSuccessGame = game;
            lastSuccessGameVersion = gameVersion;
            lastSuccessExportedAtUtc = exportedAtUtc;
        }

        @Override
        public void recordFailedManualAdminImport(
                String filename,
                String exportKind,
                String importKind,
                String game,
                String gameVersion,
                String exporterVersion,
                String exportedAtUtc,
                String schemaVersion,
                Instant startedAtUtc,
                String errorMessage
        ) {
            lastFailedFilename = filename;
            lastFailedExportKind = exportKind;
            lastFailedGameVersion = gameVersion;
            lastFailedErrorMessage = errorMessage;
        }
    }

    static final class RecordingDistrictImportAdminFacade implements DistrictImportAdminFacade {
        DistrictImportBatchDto lastDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importDistricts(DistrictImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("districts");
        }
    }

    static final class RecordingImprovementImportAdminFacade implements ImprovementImportAdminFacade {
        ImprovementImportBatchDto lastDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importImprovements(ImprovementImportBatchDto dto) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = dto;
            return okSummary("improvements");
        }
    }

    static final class RecordingTechImportAdminFacade implements TechImportAdminFacade {
        TechImportBatchDto lastImportDto;
        TechImportBatchDto lastSmokeDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastImportDto = file;
            return okSummary("tech");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestTechs(TechImportBatchDto file) {
            lastSmokeDto = file;
            return okSmokeSummary("tech");
        }
    }

    static final class RecordingUnitImportAdminFacade implements UnitImportAdminFacade {
        UnitImportBatchDto lastImportDto;
        UnitImportBatchDto lastSmokeDto;
        boolean rejectImport;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            if (rejection != null) {
                throw rejection;
            }
            if (rejectImport) {
                throw new IllegalStateException("Unit import produced 0 public units; refusing to write/delete.");
            }
            lastImportDto = dto;
            return okSummary("units");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestUnits(UnitImportBatchDto dto) {
            lastSmokeDto = dto;
            return okSmokeSummary("units");
        }
    }

    static final class RecordingFactionImportAdminFacade implements FactionImportAdminFacade {
        FactionImportBatchDto lastDto;
        RuntimeException rejection;

        @Override
        public ImportSummaryDto importFactions(FactionImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("factions");
        }
    }

    static final class RecordingHeroImportAdminFacade implements HeroImportAdminFacade {
        HeroImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importHeroes(HeroImportBatchDto file) {
            lastDto = file;
            return okSummary("heroes");
        }
    }

    static final class RecordingSkillImportAdminFacade implements SkillImportAdminFacade {
        SkillImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importSkills(SkillImportBatchDto file) {
            lastDto = file;
            return okSummary("skills");
        }
    }
}
