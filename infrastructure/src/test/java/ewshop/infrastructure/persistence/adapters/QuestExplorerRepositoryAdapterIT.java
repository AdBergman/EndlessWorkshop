package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.QuestExplorerBranchImportSnapshot;
import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.command.QuestExplorerLoreLineImportSnapshot;
import ewshop.domain.command.QuestExplorerLoreSectionImportSnapshot;
import ewshop.domain.command.QuestExplorerNavigationImportSnapshot;
import ewshop.domain.command.QuestExplorerRequirementImportSnapshot;
import ewshop.domain.command.QuestExplorerRewardImportSnapshot;
import ewshop.domain.command.QuestExplorerStrategyObjectiveImportSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestExplorerRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "ewshop.cache-preload.enabled=false")
@Transactional
class QuestExplorerRepositoryAdapterIT {

    @Autowired
    private QuestExplorerRepository repository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void importQuestExplorerEntriesUpsertsFlatRowsAndReconstructsContractShape() {
        ImportResult firstImport = repository.importQuestExplorerEntries(metadata(), snapshots("Quest_A", "Quest_B", 10));

        entityManager.flush();
        entityManager.clear();

        assertThat(firstImport.getInserted()).isEqualTo(2);
        assertThat(firstImport.getDeleted()).isZero();
        assertThat(count("quest_explorer_import_metadata")).isEqualTo(1);
        assertThat(count("quest_explorer_entries")).isEqualTo(2);
        assertThat(count("quest_explorer_aliases")).isEqualTo(3);
        assertThat(count("quest_explorer_navigation")).isEqualTo(2);
        assertThat(count("quest_explorer_lore_sections")).isEqualTo(1);
        assertThat(count("quest_explorer_lore_lines")).isEqualTo(1);
        assertThat(count("quest_explorer_objectives")).isEqualTo(1);
        assertThat(count("quest_explorer_objective_requirements")).isEqualTo(1);
        assertThat(count("quest_explorer_objective_rewards")).isEqualTo(1);
        assertThat(count("quest_explorer_branches")).isEqualTo(1);
        assertThat(count("quest_explorer_branch_prerequisite_keys")).isEqualTo(1);
        assertThat(count("quest_explorer_branch_prerequisite_path")).isEqualTo(2);
        assertThat(count("quest_explorer_branch_requirements")).isEqualTo(1);
        assertThat(count("quest_explorer_branch_rewards")).isEqualTo(1);
        assertThat(count("quest_explorer_branch_conditions")).isEqualTo(1);

        QuestExplorer loaded = repository.findQuestExplorer();

        assertThat(loaded.exportKind()).isEqualTo("quest_explorer");
        assertThat(loaded.schemaVersion()).isEqualTo("quest_explorer.v3");
        assertThat(loaded.entries()).hasSize(2);
        QuestExplorer.Entry entry = loaded.entries().getFirst();
        assertThat(entry.entryKey()).isEqualTo("Quest_A");
        assertThat(entry.aliases()).containsExactly("Source_Quest_A", "Source_Quest_A", "Source_Quest_A_Legacy");
        assertThat(entry.navigation().sequenceIndex()).isEqualTo(10);
        assertThat(entry.navigation().nextEntryKeys()).containsExactly("Quest_B");
        assertThat(entry.loreView().sections().getFirst().lines().getFirst().text()).isEqualTo("The archive opens.");
        assertThat(entry.loreView().sections().getFirst().revealedByBranchKeys()).containsExactly("Quest_A:branch:parent");
        assertThat(entry.loreView().sections().getFirst().revealedByChoiceKeys()).containsExactly("Choice_Parent");
        assertThat(entry.loreView().sections().getFirst().revealedByBranchPathAlternatives())
                .containsExactly(List.of("Quest_A:branch:parent", "Quest_A:branch:1"));
        assertThat(entry.strategyView().objectives().getFirst().choiceKey()).isEqualTo("Choice_A");
        assertThat(entry.strategyView().objectives().getFirst().requirements().getFirst().displayText()).isEqualTo("Found your Capital City.");
        assertThat(entry.strategyView().objectives().getFirst().revealedByBranchKeys()).containsExactly("Quest_A:branch:parent");
        assertThat(entry.branches().getFirst().sectionRole()).isEqualTo("true_choice");
        assertThat(entry.branches().getFirst().choiceGroupKey()).isEqualTo("Quest_A:choice-group:step:1");
        assertThat(entry.branches().getFirst().prerequisiteBranchKeys()).containsExactly("Quest_A:branch:parent");
        assertThat(entry.branches().getFirst().prerequisiteBranchPath()).containsExactly("Quest_A:branch:parent", "Quest_A:branch:1");
        assertThat(entry.branches().getFirst().revealedByBranchKeys()).containsExactly("Quest_A:branch:parent");
        assertThat(entry.branches().getFirst().revealedByChoiceKeys()).containsExactly("Choice_Parent");
        assertThat(entry.branches().getFirst().revealedByBranchPathAlternatives())
                .containsExactly(List.of("Quest_A:branch:parent", "Quest_A:branch:1"));
        assertThat(entry.branches().getFirst().strategy().rewards().getFirst().amount()).isEqualByComparingTo(new BigDecimal("200.0000"));

        ImportResult unchangedImport = repository.importQuestExplorerEntries(metadata(), snapshots("Quest_A", "Quest_B", 10));

        entityManager.flush();
        entityManager.clear();

        assertThat(unchangedImport.getInserted()).isZero();
        assertThat(unchangedImport.getUpdated()).isZero();
        assertThat(unchangedImport.getUnchanged()).isEqualTo(2);
        assertThat(unchangedImport.getDeleted()).isZero();
        assertThat(count("quest_explorer_aliases")).isEqualTo(3);

        ImportResult nestedChangeImport = repository.importQuestExplorerEntries(
                metadata(),
                snapshots("Quest_A", "Quest_B", 10, "The archive changes.")
        );

        entityManager.flush();
        entityManager.clear();

        assertThat(nestedChangeImport.getInserted()).isZero();
        assertThat(nestedChangeImport.getUpdated()).isEqualTo(1);
        assertThat(nestedChangeImport.getUnchanged()).isEqualTo(1);
        assertThat(nestedChangeImport.getDeleted()).isZero();
        assertThat(repository.findQuestExplorer().entries().getFirst().loreView().sections().getFirst().lines().getFirst().text())
                .isEqualTo("The archive changes.");

        ImportResult secondImport = repository.importQuestExplorerEntries(metadata(), snapshots("Quest_A", "Quest_B", 20));

        entityManager.flush();
        entityManager.clear();

        assertThat(secondImport.getInserted()).isZero();
        assertThat(secondImport.getUpdated()).isEqualTo(2);
        assertThat(secondImport.getDeleted()).isZero();
        QuestExplorer reloaded = repository.findQuestExplorer();
        assertThat(reloaded.entries().getFirst().entryKey()).isEqualTo("Quest_A");
        assertThat(reloaded.entries().getFirst().navigation().sequenceIndex()).isEqualTo(20);
        assertThat(count("quest_explorer_entries")).isEqualTo(2);
        assertThat(count("quest_explorer_navigation")).isEqualTo(2);

        ImportResult thirdImport = repository.importQuestExplorerEntries(
                metadata(),
                List.of(snapshots("Quest_A", "Quest_B", 30).getFirst())
        );

        entityManager.flush();
        entityManager.clear();

        assertThat(thirdImport.getInserted()).isZero();
        assertThat(thirdImport.getUpdated()).isEqualTo(1);
        assertThat(thirdImport.getDeleted()).isEqualTo(1);
        assertThat(count("quest_explorer_entries")).isEqualTo(1);
        assertThat(count("quest_explorer_navigation")).isEqualTo(1);
    }

    private long count(String table) {
        return ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM " + table).getSingleResult()).longValue();
    }

    private static QuestExplorerImportMetadata metadata() {
        return new QuestExplorerImportMetadata(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3"
        );
    }

    private static List<QuestExplorerEntryImportSnapshot> snapshots(String firstKey, String secondKey, int firstSequenceIndex) {
        return snapshots(firstKey, secondKey, firstSequenceIndex, "The archive opens.");
    }

    private static List<QuestExplorerEntryImportSnapshot> snapshots(
            String firstKey,
            String secondKey,
            int firstSequenceIndex,
            String loreText
    ) {
        QuestExplorerRequirementImportSnapshot requirement = new QuestExplorerRequirementImportSnapshot(
                "completion:settlementEvolved:capital",
                "settlementEvolved",
                "Found your Capital City.",
                "requires",
                "Completion",
                20,
                "Settlement",
                null,
                null,
                null,
                "City",
                null,
                null,
                null,
                null
        );
        QuestExplorerRewardImportSnapshot reward = new QuestExplorerRewardImportSnapshot(
                "Money:gain 200 dust",
                "Money",
                "Gain 200 Dust",
                new BigDecimal("200.0"),
                "Dust",
                10,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        QuestExplorerEntryImportSnapshot first = new QuestExplorerEntryImportSnapshot(
                firstKey,
                "First Quest",
                List.of("A stable read-model entry."),
                "MajorFaction",
                true,
                false,
                List.of("Source_Quest_A", "Source_Quest_A", "Source_Quest_A_Legacy"),
                new QuestExplorerNavigationImportSnapshot(
                        "Faction_Kin",
                        "Kin of Sheredyn",
                        "FactionQuest_Kin",
                        "Kin Chronicle",
                        1,
                        "Chapter 1",
                        1,
                        "Step 1",
                        firstSequenceIndex,
                        1,
                        1,
                        null,
                        null,
                        null,
                        true,
                        null,
                        List.of(),
                        List.of(secondKey),
                        List.of(),
                        List.of()
                ),
                List.of(new QuestExplorerLoreSectionImportSnapshot(
                        firstKey + ":lore:0",
                        "start",
                        "Choice_A",
                        0,
                        firstKey + ":objective:0",
                        List.of(firstKey + ":branch:parent"),
                        List.of("Choice_Parent"),
                        List.of(List.of(firstKey + ":branch:parent", firstKey + ":branch:1")),
                        List.of(new QuestExplorerLoreLineImportSnapshot("Archive", "narrator", loreText))
                )),
                List.of(new QuestExplorerStrategyObjectiveImportSnapshot(
                        firstKey + ":objective:0",
                        "Choice_A",
                        "Found a home.",
                        "Objective",
                        List.of(firstKey + ":branch:parent"),
                        List.of("Choice_Parent"),
                        List.of(List.of(firstKey + ":branch:parent", firstKey + ":branch:1")),
                        List.of(requirement),
                        List.of(reward)
                )),
                List.of(new QuestExplorerBranchImportSnapshot(
                        firstKey + ":branch:1",
                        "Choice_A",
                        "Found a home.",
                        1,
                        "Branch_A",
                        "Opening",
                        1,
                        firstKey + ":branch:parent",
                        "Choice_Parent",
                        List.of(firstKey + ":branch:parent"),
                        List.of(firstKey + ":branch:parent", firstKey + ":branch:1"),
                        List.of(firstKey + ":branch:parent"),
                        List.of("Choice_Parent"),
                        List.of(List.of(firstKey + ":branch:parent", firstKey + ":branch:1")),
                        firstKey + ":choice-group:step:1",
                        firstKey + ":convergence:" + secondKey,
                        "true_choice",
                        List.of(secondKey),
                        List.of(),
                        List.of(),
                        List.of("The Kin settle."),
                        List.of("Found your Capital City."),
                        List.of(requirement),
                        List.of(reward)
                )),
                null
        );
        QuestExplorerEntryImportSnapshot second = new QuestExplorerEntryImportSnapshot(
                secondKey,
                "Second Quest",
                List.of(),
                null,
                null,
                null,
                List.of(),
                new QuestExplorerNavigationImportSnapshot(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        firstSequenceIndex + 1,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        true,
                        List.of(firstKey),
                        List.of(),
                        List.of(),
                        List.of()
                ),
                List.of(),
                List.of(),
                List.of(),
                null
        );

        return List.of(first, second);
    }
}
