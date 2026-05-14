package ewshop.app.importing;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

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
        Files.writeString(tempDir.resolve("codex/ewshop_abilities_codex_export_0.78.json"), """
                {"exportKind":"abilities","entries":[{"entryKey":"a","displayName":"Ability"}]}
                """);

        RecordingFacades facades = new RecordingFacades();
        LocalStartupImportRunner runner = newRunner(facades, true);

        runner.runStartupImport();

        assertThat(facades.techCalls).isEqualTo(1);
        assertThat(facades.unitCalls).isEqualTo(1);
        assertThat(facades.codexCalls).isEqualTo(1);
        assertThat(facades.techDto.exportKind()).isEqualTo("tech");
        assertThat(facades.unitDto.exportKind()).isEqualTo("units");
        assertThat(facades.codexDto.exportKind()).isEqualTo("abilities");
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
            CodexImportAdminFacade {

        private int techCalls;
        private int districtCalls;
        private int improvementCalls;
        private int unitCalls;
        private int codexCalls;
        private TechImportBatchDto techDto;
        private UnitImportBatchDto unitDto;
        private CodexImportBatchDto codexDto;

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            techCalls++;
            techDto = file;
            return summary("tech", file.techs().size());
        }

        @Override
        public ImportSummaryDto importDistricts(DistrictImportBatchDto file) {
            districtCalls++;
            return summary("districts", file.districts().size());
        }

        @Override
        public ImportSummaryDto importImprovements(ImprovementImportBatchDto dto) {
            improvementCalls++;
            return summary("improvements", dto.improvements().size());
        }

        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            unitCalls++;
            unitDto = dto;
            return summary("units", dto.units().size());
        }

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            codexCalls++;
            codexDto = file;
            return summary("codex", file.entries().size());
        }

        private int totalCalls() {
            return techCalls + districtCalls + improvementCalls + unitCalls + codexCalls;
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

    }
}
