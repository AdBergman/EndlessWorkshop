package ewshop.app.importing;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestImportAdminFacade;
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

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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
        Files.writeString(tempDir.resolve("codex/ewshop_minor_factions_codex_export_0.78.json"), """
                {"exportKind":"minorFactions","entries":[{"entryKey":"mf","displayName":"Minor Faction"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_quests_codex_export_0.78.json"), """
                {"exportKind":"quests","entries":[{"entryKey":"quest","displayName":"Quest"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_traits_codex_export_0.78.json"), """
                {"exportKind":"traits","entries":[{"entryKey":"trait","displayName":"Trait"}]}
                """);
        Files.writeString(tempDir.resolve("codex/ewshop_future_kind_codex_export_0.78.json"), """
                {"exportKind":"futureKind","entries":[{"entryKey":"future","displayName":"Future"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        runner.runStartupImport();

        assertThat(facades.techCalls).isEqualTo(1);
        assertThat(facades.districtCalls).isEqualTo(1);
        assertThat(facades.improvementCalls).isEqualTo(1);
        assertThat(facades.unitCalls).isEqualTo(1);
        assertThat(facades.codexCalls).isEqualTo(5);
        assertThat(facades.techDto.exportKind()).isEqualTo("tech");
        assertThat(facades.unitDto.exportKind()).isEqualTo("units");
        assertThat(facades.codexKinds).containsExactly("abilities", "futureKind", "minorFactions", "quests", "traits");
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

        runner.runStartupImport();

        assertThat(facades.techCalls).isZero();
        assertThat(facades.totalCalls()).isZero();
    }

    @Test
    void importsQuestGraphAndDialogAsPairedStartupImport() throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.createDirectories(tempDir.resolve("codex"));
        Files.writeString(tempDir.resolve("exports/ewshop_quest_graph_export_0.80.json"), """
                {
                  "exportKind":"quest_graph",
                  "quests":[
                    {
                      "entryKey":"Quest_A",
                      "displayName":"A Quest",
                      "choices":[
                        {
                          "choiceKey":"Choice_A",
                          "steps":[
                            {
                              "index":0,
                              "dialogBlockRefs":[
                                {"questKey":"Quest_A","choiceKey":"Choice_A","stepIndex":0,"dialogKey":"Dialog_A","phase":"start","lineCount":1}
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
                """);
        Files.writeString(tempDir.resolve("exports/ewshop_quest_dialog_export_0.80.json"), """
                {
                  "exportKind":"quest_dialog",
                  "dialogs":[
                    {
                      "questKey":"Quest_A",
                      "choiceKey":"Choice_A",
                      "stepIndex":0,
                      "dialogKey":"Dialog_A",
                      "phase":"start",
                      "lines":[{"lineIndex":0,"role":"narrator","text":"Line"}]
                    }
                  ]
                }
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        runner.runStartupImport();

        assertThat(facades.questCalls).isEqualTo(1);
        assertThat(facades.questDto.graph().exportKind()).isEqualTo("quest_graph");
        assertThat(facades.questDto.dialog().exportKind()).isEqualTo("quest_dialog");
        assertThat(facades.totalCalls()).isEqualTo(1);
    }

    @Test
    void questStartupImportFailsWhenPairIsIncomplete(CapturedOutput output) throws Exception {
        Files.createDirectories(tempDir.resolve("exports"));
        Files.writeString(tempDir.resolve("exports/ewshop_quest_graph_export_0.80.json"), """
                {"exportKind":"quest_graph","quests":[{"entryKey":"Quest_A"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        runner.runStartupImport();

        assertThat(facades.totalCalls()).isZero();
        assertThat(output)
                .contains("Local startup import failed for paired quest graph/dialog files")
                .contains("requires exactly one quest_graph and one quest_dialog file")
                .contains("Local startup import finished: 0 imported, 0 skipped, 1 failed.");
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

        runner.runStartupImport();

        assertThat(facades.totalCalls()).isEqualTo(1);
        assertThat(facades.codexKinds).containsExactly("battle_abilities");
        assertThat(output)
                .contains("skipped unsupported exports file")
                .contains("exportKind='battle_abilities'")
                .contains("exportKind='descriptor_evaluations'")
                .doesNotContain("skipped unsupported codex file")
                .contains("Local startup import finished: 1 imported, 2 skipped, 0 failed.");
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

        runner.runStartupImport();

        assertThat(facades.techCalls).isEqualTo(1);
        assertThat(output)
                .contains("Local startup import failed for file")
                .contains("ewshop_tech_export_0.78.json")
                .contains("Import file has no techs")
                .contains("Local startup import finished: 0 imported, 0 skipped, 1 failed.");
    }

    @Test
    void missingFoldersDoNotImportOrFail() {
        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        runner.runStartupImport();

        assertThat(facades.totalCalls()).isZero();
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
                new ObjectMapper(),
                facades,
                facades,
                facades,
                facades,
                facades,
                facades
        );
    }

    private static ImportSummaryDto summary(String kind, int received) {
        return ImportSummaryDto.of(
                kind,
                new ImportCountsDto(received, received, 0, 0, 0, 0),
                new ImportDiagnosticsDto(null, null, null),
                1
        );
    }

    private static final class RecordingFacades implements TechImportAdminFacade,
            DistrictImportAdminFacade,
            ImprovementImportAdminFacade,
            UnitImportAdminFacade,
            CodexImportAdminFacade,
            QuestImportAdminFacade {

        private int techCalls;
        private int districtCalls;
        private int improvementCalls;
        private int unitCalls;
        private int codexCalls;
        private int questCalls;
        private TechImportBatchDto techDto;
        private UnitImportBatchDto unitDto;
        private CodexImportBatchDto codexDto;
        private QuestImportBatchDto questDto;
        private final List<String> codexKinds = new ArrayList<>();

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
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            codexCalls++;
            codexDto = file;
            codexKinds.add(file.exportKind());
            if (file.entries() == null || file.entries().isEmpty()) {
                throw new IllegalArgumentException("Import file has no entries");
            }
            return summary("codex", file.entries().size());
        }

        @Override
        public ImportSummaryDto importQuests(QuestImportBatchDto file) {
            questCalls++;
            questDto = file;
            if (file.graph() == null || file.graph().quests() == null || file.graph().quests().isEmpty()) {
                throw new IllegalArgumentException("Quest import has no graph quests");
            }
            if (file.dialog() == null || file.dialog().dialogs() == null || file.dialog().dialogs().isEmpty()) {
                throw new IllegalArgumentException("Quest import has no dialogs");
            }
            return summary("quests", file.graph().quests().size());
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
            return new ObjectMapper();
        }

        @Bean
        TechImportAdminFacade techImportAdminFacade() {
            return file -> summary("tech", file.techs().size());
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
            return dto -> summary("units", dto.units().size());
        }

        @Bean
        CodexImportAdminFacade codexImportAdminFacade() {
            return file -> summary("codex", file.entries().size());
        }

        @Bean
        QuestImportAdminFacade questImportAdminFacade() {
            return file -> summary("quests", file.graph().quests().size());
        }

    }
}
