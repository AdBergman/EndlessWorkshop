package ewshop.app.importing;

import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class LocalStartupImportRunnerTest {

    @TempDir
    private Path tempDir;

    @Test
    void importsSupportedFilesFromLocalFoldersThroughAdminFacades() throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_tech_export_0.78.json"), """
                {"exportKind":"tech","techs":[{"techKey":"t","displayName":"Tech"}]}
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_units_export_0.78.json"), """
                {"exportKind":"units","units":[{"unitKey":"u","displayName":"Unit"}]}
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_districts_export_0.78.json"), """
                {"exportKind":"districts","districts":[{"districtKey":"d","displayName":"District"}]}
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_improvements_export_0.78.json"), """
                {"exportKind":"improvements","improvements":[{"constructibleKey":"i","displayName":"Improvement"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_abilities_codex_export_0.78.json"), """
                {"exportKind":"abilities","entries":[{"entryKey":"a","displayName":"Ability"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_councilor_effects_codex_export_0.82.json"), """
                {
                  "exportKind":"councilorEffects",
                  "entries":[
                    {
                      "entryKey":"CouncilorEffect_Defense21",
                      "displayName":"Travels Well",
                      "descriptionLines":["Improves appointed councilor output."],
                      "referenceKeys":["Councilor_Atea"],
                      "facts":[{"label":"Role","value":"Defense"}],
                      "sections":[{"title":"Effects","lines":["[Defense] Defense on Hero."],"items":[]}],
                      "publicContextKeys":["CouncilorEffect_Defense21","Councilor_Atea"]
                    }
                  ]
                }
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_minor_factions_codex_export_0.78.json"), """
                {"exportKind":"minorFactions","entries":[{"entryKey":"mf","displayName":"Minor Faction"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_partner_effects_codex_export_0.82.json"), """
                {
                  "exportKind":"partnerEffects",
                  "entries":[
                    {
                      "entryKey":"PartnerEffect_Hydracorn_PartnerTrait01",
                      "displayName":"Hopeless Romantic",
                      "descriptionLines":["Partner effect applied while assigned."],
                      "referenceKeys":["Councilor_Atea"],
                      "facts":[{"label":"Scope","value":"Hero"}],
                      "sections":[{"title":"Effects","lines":["+1 [MovementPoints] Movement Points outside battle on Units in Hero's Army"],"items":[]}],
                      "publicContextKeys":["PartnerEffect_Hydracorn_PartnerTrait01","Councilor_Atea"]
                    }
                  ]
                }
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_quests_codex_export_0.78.json"), """
                {"exportKind":"quests","entries":[{"entryKey":"quest","displayName":"Quest"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_resources_codex_export_0.82.json"), """
                {
                  "exportKind":"resources",
                  "entries":[
                    {
                      "entryKey":"Resource_Luxury01",
                      "displayName":"Klax",
                      "descriptionLines":["Luxury resource."],
                      "referenceKeys":["Extractor_Luxury01"],
                      "facts":[{"label":"Type","value":"Luxury"}],
                      "sections":[{"title":"Effects","lines":["Activates a booster effect."],"items":[]}],
                      "publicContextKeys":["Resource_Luxury01","Extractor_Luxury01"]
                    }
                  ]
                }
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_traits_codex_export_0.78.json"), """
                {"exportKind":"traits","entries":[{"entryKey":"trait","displayName":"Trait"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_future_kind_codex_export_0.78.json"), """
                {"exportKind":"futureKind","entries":[{"entryKey":"future","displayName":"Future"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.techCalls).isEqualTo(1);
        assertThat(facades.districtCalls).isEqualTo(1);
        assertThat(facades.improvementCalls).isEqualTo(1);
        assertThat(facades.unitCalls).isEqualTo(1);
        assertThat(facades.codexCalls).isEqualTo(8);
        assertThat(facades.techDto.exportKind()).isEqualTo("tech");
        assertThat(facades.unitDto.exportKind()).isEqualTo("units");
        assertThat(facades.codexKinds).containsExactly(
                "abilities",
                "councilorEffects",
                "futureKind",
                "minorFactions",
                "partnerEffects",
                "quests",
                "resources",
                "traits"
        );
        assertThat(facades.codexByKind.keySet()).contains("resources", "councilorEffects", "partnerEffects");
        assertThat(facades.codexByKind.get("resources").entries().getFirst().facts().getFirst().label())
                .isEqualTo("Type");
        assertThat(facades.codexByKind.get("councilorEffects").entries().getFirst().sections().getFirst().title())
                .isEqualTo("Effects");
        assertThat(facades.codexByKind.get("partnerEffects").entries().getFirst().publicContextKeys())
                .containsExactly("PartnerEffect_Hydracorn_PartnerTrait01", "Councilor_Atea");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(12, 0, 0));
    }

    @Test
    void disabledRunnerDoesNotImportEvenWhenFilesExist() throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_tech_export_0.78.json"), """
                {"exportKind":"tech","techs":[{"techKey":"t","displayName":"Tech"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, false);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.techCalls).isZero();
        assertThat(facades.totalCalls()).isZero();
        assertThat(summary).isEqualTo(LocalStartupImportSummary.empty());
    }

    @Test
    void importsQuestExplorerAsSingleStartupImport(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_quest_explorer_export_0.80.json"), """
                {
                  "exportKind":"quest_explorer",
                  "schemaVersion":"quest_explorer.v3",
                  "entries":[
                    {
                      "entryKey":"Quest_A",
                      "title":"A Quest",
                      "summaryLines":["Summary"],
                      "aliases":["Source_Quest_A"],
                      "navigation":{"sequenceIndex":1,"previousEntryKeys":[],"nextEntryKeys":[],"failureEntryKeys":[],"convergesIntoEntryKeys":[]},
                      "loreView":{"sections":[]},
                      "strategyView":{"objectives":[]},
                      "branches":[]
                    }
                  ]
                }
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.questCalls).isEqualTo(1);
        assertThat(facades.questDto.exportKind()).isEqualTo("quest_explorer");
        assertThat(facades.questDto.entries()).hasSize(1);
        assertThat(facades.totalCalls()).isEqualTo(1);
        assertThat(output)
                .contains("Local startup import loaded")
                .contains("ewshop_quest_explorer_export_0.80.json")
                .contains("as quest_explorer");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(1, 0, 0));
    }

    @Test
    void questStartupImportFailsWhenMultipleExplorerFilesArePresent(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.writeString(tempDir.resolve("exports/ewshop_quest_explorer_export_0.80.json"), """
                {"exportKind":"quest_explorer","schemaVersion":"quest_explorer.v3","entries":[{"entryKey":"Quest_A"}]}
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_quest_explorer_export_0.81.json"), """
                {"exportKind":"quest_explorer","schemaVersion":"quest_explorer.v3","entries":[{"entryKey":"Quest_B"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.totalCalls()).isZero();
        assertThat(output)
                .contains("Local startup import failed for quest_explorer file")
                .contains("requires exactly one quest_explorer file")
                .contains("Local startup import finished: 0 imported, 0 skipped, 1 failed.");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(0, 0, 1));
    }

    @Test
    void unsupportedRawExporterFilesAreSkippedWhileCodexEntriesImport(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_battle_abilities_export_0.78.json"), """
                {"exportKind":"battle_abilities","abilities":[{"key":"a"}]}
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_descriptor_evaluations_export_0.78.json"), """
                {"exportKind":"descriptor_evaluations","entries":[{"key":"d"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_battle_abilities_codex_export_0.78.json"), """
                {"exportKind":"battle_abilities","entries":[{"entryKey":"ba","displayName":"Battle Ability"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.totalCalls()).isEqualTo(1);
        assertThat(facades.codexKinds).containsExactly("battle_abilities");
        assertThat(output)
                .contains("skipped unsupported exports file")
                .contains("exportKind='battle_abilities'")
                .contains("exportKind='descriptor_evaluations'")
                .doesNotContain("skipped unsupported codex file")
                .contains("Local startup import finished: 1 imported, 2 skipped, 0 failed.");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(1, 2, 0));
    }

    @Test
    void questExplorerDiagnosticsAreNotImportedAsCodex(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("codex/quest_explorer_branch_diagnostics_0.80.json"), """
                {"exportKind":"quest_explorer_branch_diagnostics","entries":[{"entryKey":"debug-row","displayName":"Debug"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.totalCalls()).isZero();
        assertThat(output)
                .contains("skipped quest explorer diagnostics file")
                .contains("diagnostics are validation evidence")
                .contains("Local startup import finished: 0 imported, 1 skipped, 0 failed.");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(0, 1, 0));
    }

    @Test
    void malformedSupportedLookingFileIsReportedAsFailure(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_tech_export_0.78.json"), """
                {"exportKind":"tech","techs":[]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.techCalls).isEqualTo(1);
        assertThat(output)
                .contains("Local startup import failed for file")
                .contains("ewshop_tech_export_0.78.json")
                .contains("Import file has no techs")
                .contains("Local startup import finished: 0 imported, 0 skipped, 1 failed.");
        assertThat(summary).isEqualTo(new LocalStartupImportSummary(0, 0, 1));
    }

    @Test
    void missingFoldersDoNotImportOrFail() {
        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        LocalStartupImportSummary summary = runner.runStartupImport();

        assertThat(facades.totalCalls()).isZero();
        assertThat(summary).isEqualTo(LocalStartupImportSummary.empty());
    }

    @Test
    void resolvesRelativeRootFromParentWhenStartedInsideAppModule() throws Exception {
        Path appWorkingDirectory = tempDir.resolve("app");
        Path repoImportRoot = tempDir.resolve("local-imports");
        Files.createDirectories(appWorkingDirectory);
        Files.createDirectories(repoImportRoot);

        assertThat(LocalStartupImportRunner.resolveRoot(Path.of("local-imports"), appWorkingDirectory))
                .isEqualTo(repoImportRoot);
    }

    @Test
    void runnerBeanRequiresLocalProfileAndEnabledProperty() {
        ApplicationContextRunner contextRunner = new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
                .withUserConfiguration(TestConfiguration.class, LocalStartupImportRunner.class)
                .withPropertyValues("ewshop.local-import.enabled=true");

        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("dev"))
                .run(context -> assertThat(context).hasSingleBean(LocalStartupImportRunner.class));

        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
                .run(context -> assertThat(context).doesNotHaveBean(LocalStartupImportRunner.class));

        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("dev"))
                .withPropertyValues("ewshop.local-import.enabled=false")
                .run(context -> assertThat(context).doesNotHaveBean(LocalStartupImportRunner.class));
    }

    private LocalStartupImportRunner newRunner(RecordingFacades facades, boolean enabled) {
        LocalStartupImportProperties properties = new LocalStartupImportProperties();
        properties.setEnabled(enabled);
        properties.setRoot(tempDir);

        return new LocalStartupImportRunner(
                properties,
                objectMapper(),
                facades,
                facades,
                facades,
                facades,
                facades,
                facades
        );
    }

    private static ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
    }

    private static ImportSummaryDto summary(String kind, int received) {
        return ImportSummaryDto.of(
                kind,
                new ImportCountsDto(received, received, 0, 0, 0, 0),
                new ImportDiagnosticsDto(null, null, null),
                1
        );
    }

    private static ImportPreviewSummaryDto previewSummary(String kind, int received) {
        return new ImportPreviewSummaryDto(kind, received, received, received, 0, 0, List.of(), List.of());
    }

    private static final class RecordingFacades implements TechImportAdminFacade,
            DistrictImportAdminFacade,
            ImprovementImportAdminFacade,
            UnitImportAdminFacade,
            CodexImportAdminFacade,
            QuestExplorerImportAdminFacade {

        private int techCalls;
        private int districtCalls;
        private int improvementCalls;
        private int unitCalls;
        private int codexCalls;
        private int questCalls;
        private TechImportBatchDto techDto;
        private UnitImportBatchDto unitDto;
        private CodexImportBatchDto codexDto;
        private QuestExplorerImportBatchDto questDto;
        private final List<String> codexKinds = new ArrayList<>();
        private final Map<String, CodexImportBatchDto> codexByKind = new LinkedHashMap<>();

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            techCalls++;
            techDto = file;
            if (file.techs() == null || file.techs().isEmpty()) {
                throw new IllegalArgumentException("Import file has no techs");
            }
            return summary("tech", file.techs().size());
        }

        @Override
        public ImportPreviewSummaryDto smokeTestTechs(TechImportBatchDto file) {
            return previewSummary("tech", file.techs() == null ? 0 : file.techs().size());
        }

        @Override
        public ImportSummaryDto importDistricts(DistrictImportBatchDto file) {
            districtCalls++;
            if (file.districts() == null || file.districts().isEmpty()) {
                throw new IllegalArgumentException("Import file has no districts");
            }
            return summary("districts", file.districts().size());
        }

        @Override
        public ImportSummaryDto importImprovements(ImprovementImportBatchDto dto) {
            improvementCalls++;
            if (dto.improvements() == null || dto.improvements().isEmpty()) {
                throw new IllegalArgumentException("Import file has no improvements");
            }
            return summary("improvements", dto.improvements().size());
        }

        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            unitCalls++;
            unitDto = dto;
            if (dto.units() == null || dto.units().isEmpty()) {
                throw new IllegalArgumentException("Import file has no units");
            }
            return summary("units", dto.units().size());
        }

        @Override
        public ImportPreviewSummaryDto smokeTestUnits(UnitImportBatchDto dto) {
            return previewSummary("units", dto.units() == null ? 0 : dto.units().size());
        }

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            codexCalls++;
            codexDto = file;
            codexKinds.add(file.exportKind());
            codexByKind.put(file.exportKind(), file);
            if (file.entries() == null || file.entries().isEmpty()) {
                throw new IllegalArgumentException("Import file has no entries");
            }
            return summary("codex", file.entries().size());
        }

        @Override
        public ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file) {
            questCalls++;
            questDto = file;
            if (file.entries() == null || file.entries().isEmpty()) {
                throw new IllegalArgumentException("Quest explorer import has no entries");
            }
            return summary("quest_explorer", file.entries().size());
        }

        private int totalCalls() {
            return techCalls + districtCalls + improvementCalls + unitCalls + codexCalls + questCalls;
        }
    }

    @Configuration
    static class TestConfiguration {

        @Bean
        LocalStartupImportProperties localStartupImportProperties() {
            return new LocalStartupImportProperties();
        }

        @Bean
        ObjectMapper objectMapper() {
            return LocalStartupImportRunnerTest.objectMapper();
        }

        @Bean
        TechImportAdminFacade techImportAdminFacade() {
            return new TechImportAdminFacade() {
                @Override
                public ImportSummaryDto importTechs(TechImportBatchDto file) {
                    return summary("tech", file.techs().size());
                }

                @Override
                public ImportPreviewSummaryDto smokeTestTechs(TechImportBatchDto file) {
                    return previewSummary("tech", file.techs().size());
                }
            };
        }

        @Bean
        DistrictImportAdminFacade districtImportAdminFacade() {
            return file -> summary("districts", file.districts().size());
        }

        @Bean
        ImprovementImportAdminFacade improvementImportAdminFacade() {
            return dto -> summary("improvements", dto.improvements().size());
        }

        @Bean
        UnitImportAdminFacade unitImportAdminFacade() {
            return new UnitImportAdminFacade() {
                @Override
                public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
                    return summary("units", dto.units().size());
                }

                @Override
                public ImportPreviewSummaryDto smokeTestUnits(UnitImportBatchDto dto) {
                    return previewSummary("units", dto.units().size());
                }
            };
        }

        @Bean
        CodexImportAdminFacade codexImportAdminFacade() {
            return file -> summary("codex", file.entries().size());
        }

        @Bean
        QuestExplorerImportAdminFacade questImportAdminFacade() {
            return file -> summary("quest_explorer", file.entries().size());
        }

    }
}
