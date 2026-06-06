package ewshop.facade.mapper;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchLoreDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchStrategyDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportObjectiveDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportRequirementDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportRewardDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QuestExplorerMapperTest {

    @Test
    void toModelAcceptsStableV3ContractShape() {
        var batch = batch(List.of(entry("Quest_A", 1, List.of("Quest_B")), entry("Quest_B", 2, List.of())));
        var metadata = QuestExplorerImportMapper.toMetadata(batch);
        var snapshots = toValidatedSnapshots(batch);

        assertThat(metadata.exportKind()).isEqualTo("quest_explorer");
        assertThat(metadata.schemaVersion()).isEqualTo("quest_explorer.v3");
        assertThat(snapshots).hasSize(2);
        assertThat(snapshots.getFirst().entryKey()).isEqualTo("Quest_A");
        assertThat(snapshots.getFirst().navigation().nextEntryKeys()).containsExactly("Quest_B");
    }

    @Test
    void toModelRejectsDuplicateEntryKeys() {
        var batch = batch(List.of(entry("Quest_A", 1, List.of()), entry("Quest_A", 2, List.of())));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duplicate quest explorer entryKey 'Quest_A'");
    }

    @Test
    void toModelRejectsDuplicateSequenceIndexes() {
        var batch = batch(List.of(entry("Quest_A", 1, List.of()), entry("Quest_B", 1, List.of())));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duplicate quest explorer navigation.sequenceIndex '1'");
    }

    @Test
    void toModelRejectsInvalidProgressionReferences() {
        var batch = batch(List.of(entry("Quest_A", 1, List.of("Missing_Quest"))));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid quest explorer reference 'Missing_Quest'");
    }

    @Test
    void toModelRejectsInvalidFailureReferences() {
        var batch = batch(List.of(entryWithNavigationRefs("Quest_A", 1, List.of(), List.of("Missing_Quest"), List.of())));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("navigation.failureEntryKeys");
    }

    @Test
    void toModelRejectsInvalidConvergenceReferences() {
        var batch = batch(List.of(entryWithNavigationRefs("Quest_A", 1, List.of(), List.of(), List.of("Missing_Quest"))));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("navigation.convergesIntoEntryKeys");
    }

    @Test
    void toModelRejectsInvalidBranchReferences() {
        var branch = new QuestExplorerImportBranchDto(
                "Quest_A:branch:1",
                "Choice_A",
                "Choice A",
                0,
                "Quest_A",
                "Opening",
                List.of("Missing_Quest"),
                List.of(),
                List.of(),
                null,
                null
        );
        var batch = batch(List.of(entryWithBranches("Quest_A", 1, List.of(branch))));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("branch.nextEntryKeys");
    }

    @Test
    void toModelRejectsMalformedBranchStructures() {
        var branch = new QuestExplorerImportBranchDto(
                null,
                "Choice_A",
                "Choice A",
                0,
                "Quest_A",
                "Opening",
                List.of(),
                List.of(),
                List.of(),
                null,
                null
        );
        var batch = batch(List.of(entryWithBranches("Quest_A", 1, List.of(branch))));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("branch.branchKey is required");
    }

    @Test
    void toModelPreservesGroupingAndOrderingFields() {
        var requirement = new QuestExplorerImportRequirementDto(
                "req:1",
                "settlementFounded",
                "Found your Capital City.",
                "requires",
                "Completion",
                20,
                "Settlement",
                "Capital City",
                1,
                null,
                "City",
                "District",
                "District_Core",
                "City Center",
                "districts:District_Core"
        );
        var reward = new QuestExplorerImportRewardDto(
                "reward:1",
                "Money",
                "Gain 200 Dust",
                null,
                "Dust",
                10,
                null,
                "Resource",
                "Money",
                "Dust",
                "Resource",
                "Money",
                "Dust",
                "resources:Money",
                "Empire"
        );
        var branch = new QuestExplorerImportBranchDto(
                "Quest_A:branch:1",
                "Choice_A",
                "Choice A",
                3,
                "Quest_A",
                "Opening",
                2,
                "Quest_A:branch:parent",
                "Choice_Parent",
                List.of("Quest_A:branch:parent"),
                List.of("Quest_A:branch:parent", "Quest_A:branch:1"),
                "Quest_A:choice-group:2",
                "Quest_A:convergence:Quest_B",
                "continuation",
                List.of("Quest_B"),
                List.of(),
                List.of("Quest_B"),
                new QuestExplorerImportBranchLoreDto(List.of("The path opens.")),
                new QuestExplorerImportBranchStrategyDto(List.of("Pick Choice A"), List.of(requirement), List.of(reward))
        );
        var objective = new QuestExplorerImportObjectiveDto(
                "Quest_A:objective:1",
                "Quest_A:choice:objective:1",
                "Found a home.",
                "Objective",
                List.of(requirement),
                List.of(reward)
        );
        var batch = batch(List.of(
                entryWithContent("Quest_A", 1, List.of("Quest_B"), List.of(objective), List.of(branch)),
                entry("Quest_B", 2, List.of())
        ));

        var snapshots = toValidatedSnapshots(batch);

        var loadedObjective = snapshots.getFirst().objectives().getFirst();
        assertThat(loadedObjective.choiceKey()).isEqualTo("Quest_A:choice:objective:1");
        assertThat(loadedObjective.requirements().getFirst().groupLabel()).isEqualTo("Completion");
        assertThat(loadedObjective.rewards().getFirst().groupOrder()).isEqualTo(10);
        var loadedBranch = snapshots.getFirst().branches().getFirst();
        assertThat(loadedBranch.orderIndex()).isEqualTo(3);
        assertThat(loadedBranch.groupLabel()).isEqualTo("Opening");
        assertThat(loadedBranch.branchStepOrder()).isEqualTo(2);
        assertThat(loadedBranch.parentBranchKey()).isEqualTo("Quest_A:branch:parent");
        assertThat(loadedBranch.parentChoiceKey()).isEqualTo("Choice_Parent");
        assertThat(loadedBranch.prerequisiteBranchKeys()).containsExactly("Quest_A:branch:parent");
        assertThat(loadedBranch.prerequisiteBranchPath()).containsExactly("Quest_A:branch:parent", "Quest_A:branch:1");
        assertThat(loadedBranch.choiceGroupKey()).isEqualTo("Quest_A:choice-group:2");
        assertThat(loadedBranch.convergenceGroupKey()).isEqualTo("Quest_A:convergence:Quest_B");
        assertThat(loadedBranch.sectionRole()).isEqualTo("continuation");
        assertThat(loadedBranch.convergesIntoEntryKeys()).containsExactly("Quest_B");
        assertThat(loadedBranch.conditions()).containsExactly("Pick Choice A");
    }

    @Test
    void toModelPreservesExporterOwnedAliasesAndLinkArrayOrder() {
        var entry = entryWithAliasesAndLinks(
                "Quest_A",
                1,
                List.of("Source_A", "Source_A", "Source_B"),
                List.of("Quest_B", "Quest_B")
        );
        var snapshots = toValidatedSnapshots(batch(List.of(entry, entry("Quest_B", 2, List.of()))));

        assertThat(snapshots.getFirst().aliases()).containsExactly("Source_A", "Source_A", "Source_B");
        assertThat(snapshots.getFirst().navigation().nextEntryKeys()).containsExactly("Quest_B", "Quest_B");
    }

    @Test
    void toModelRejectsBlankReferenceEntries() {
        var batch = batch(List.of(entry("Quest_A", 1, List.of(" "))));

        assertThatThrownBy(() -> toValidatedSnapshots(batch))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Blank quest explorer reference");
    }

    @Test
    void toModelAcceptsAuthoritativeLocalExporterFixtureWhenPresent() throws Exception {
        Path exportPath = firstExisting(
                Path.of("../local-imports/exports/ewshop_quest_explorer_export_0.80.json"),
                Path.of("local-imports/exports/ewshop_quest_explorer_export_0.80.json")
        );
        Assumptions.assumeTrue(exportPath != null, "local quest_explorer export fixture is not present");

        var dto = objectMapper().readValue(exportPath.toFile(), QuestExplorerImportBatchDto.class);
        var metadata = QuestExplorerImportMapper.toMetadata(dto);
        var snapshots = toValidatedSnapshots(dto);

        assertThat(metadata.exportKind()).isEqualTo("quest_explorer");
        assertThat(metadata.schemaVersion()).isEqualTo("quest_explorer.v3");
        assertThat(snapshots).hasSize(149);
        assertThat(snapshots)
                .extracting(entry -> entry.navigation().sequenceIndex())
                .doesNotHaveDuplicates();

        var kinChapter2Projected = snapshots.stream()
                .filter(entry -> entry.entryKey().equals("FactionQuest_KinOfSheredyn02_Chapter02_Step01"))
                .findFirst()
                .orElseThrow();
        assertThat(kinChapter2Projected.branches())
                .filteredOn(branch -> !branch.revealedByBranchKeys().isEmpty())
                .hasSize(2)
                .allSatisfy(branch -> {
                    assertThat(branch.revealedByBranchKeys())
                            .containsExactly(
                                    "FactionQuest_KinOfSheredyn_Chapter02_Step01:branch:1",
                                    "FactionQuest_KinOfSheredyn_Chapter02_Step01:branch:2"
                            );
                    assertThat(branch.revealedByChoiceKeys())
                            .containsExactly(
                                    "FactionQuest_KinOfSheredyn_Chapter02_Step01_Choice01ChoiceDefinition",
                                    "FactionQuest_KinOfSheredyn_Chapter02_Step01_Choice02ChoiceDefinition"
                            );
                    assertThat(branch.revealedByBranchPathAlternatives())
                            .containsExactly(
                                    List.of("FactionQuest_KinOfSheredyn_Chapter02_Step01:branch:1"),
                                    List.of("FactionQuest_KinOfSheredyn_Chapter02_Step01:branch:2")
                            );
                });
        assertThat(kinChapter2Projected.objectives())
                .filteredOn(objective -> !objective.revealedByBranchKeys().isEmpty())
                .hasSize(2);
        assertThat(kinChapter2Projected.loreSections())
                .filteredOn(section -> !section.revealedByBranchKeys().isEmpty())
                .hasSize(4);
    }

    private static List<QuestExplorerEntryImportSnapshot> toValidatedSnapshots(QuestExplorerImportBatchDto batch) {
        var snapshots = batch.entries().stream()
                .map(QuestExplorerImportMapper::toSnapshot)
                .toList();
        QuestExplorerImportMapper.validateSnapshots(snapshots);
        return snapshots;
    }

    private static ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
    }

    private static QuestExplorerImportBatchDto batch(List<QuestExplorerImportEntryDto> entries) {
        return new QuestExplorerImportBatchDto(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static QuestExplorerImportEntryDto entry(String entryKey, int sequenceIndex, List<String> nextKeys) {
        return entryWithContent(entryKey, sequenceIndex, nextKeys, List.of(), List.of());
    }

    private static QuestExplorerImportEntryDto entryWithNavigationRefs(
            String entryKey,
            int sequenceIndex,
            List<String> nextKeys,
            List<String> failureKeys,
            List<String> convergenceKeys
    ) {
        return entryWithContent(entryKey, sequenceIndex, nextKeys, failureKeys, convergenceKeys, List.of(), List.of());
    }

    private static QuestExplorerImportEntryDto entryWithBranches(
            String entryKey,
            int sequenceIndex,
            List<QuestExplorerImportBranchDto> branches
    ) {
        return entryWithContent(entryKey, sequenceIndex, List.of(), List.of(), List.of(), List.of(), branches);
    }

    private static QuestExplorerImportEntryDto entryWithContent(
            String entryKey,
            int sequenceIndex,
            List<String> nextKeys,
            List<QuestExplorerImportObjectiveDto> objectives,
            List<QuestExplorerImportBranchDto> branches
    ) {
        return entryWithContent(entryKey, sequenceIndex, nextKeys, List.of(), List.of(), objectives, branches);
    }

    private static QuestExplorerImportEntryDto entryWithContent(
            String entryKey,
            int sequenceIndex,
            List<String> nextKeys,
            List<String> failureKeys,
            List<String> convergenceKeys,
            List<QuestExplorerImportObjectiveDto> objectives,
            List<QuestExplorerImportBranchDto> branches
    ) {
        return new QuestExplorerImportEntryDto(
                entryKey,
                entryKey + " Title",
                List.of("Summary"),
                null,
                null,
                null,
                List.of(),
                new QuestExplorerImportNavigationDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        sequenceIndex,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        nextKeys,
                        failureKeys,
                        convergenceKeys
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(objectives),
                branches,
                null
        );
    }

    private static QuestExplorerImportEntryDto entryWithAliasesAndLinks(
            String entryKey,
            int sequenceIndex,
            List<String> aliases,
            List<String> nextKeys
    ) {
        return new QuestExplorerImportEntryDto(
                entryKey,
                entryKey + " Title",
                List.of("Summary"),
                null,
                null,
                null,
                aliases,
                new QuestExplorerImportNavigationDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        sequenceIndex,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        nextKeys,
                        List.of(),
                        List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    private static Path firstExisting(Path... paths) {
        for (Path path : paths) {
            if (Files.isRegularFile(path)) return path;
        }
        return null;
    }
}
