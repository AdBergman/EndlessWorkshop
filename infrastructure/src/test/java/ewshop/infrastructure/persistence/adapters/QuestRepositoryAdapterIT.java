package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.command.QuestImportSnapshot.*;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestRepository;
import ewshop.infrastructure.persistence.entities.QuestEntity;
import ewshop.infrastructure.persistence.repositories.QuestJpaRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(QuestRepositoryAdapter.class)
class QuestRepositoryAdapterIT {

    @Autowired
    private QuestRepository questRepository;

    @Autowired
    private QuestJpaRepository questJpaRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void importQuestSnapshot_insertsNestedQuestGraphAndDialogLines() {
        ImportResult result = questRepository.importQuestSnapshot(snapshot(quest("Quest_A", "A Quest", "First line")));

        assertThat(result.getInserted()).isEqualTo(1);
        entityManager.flush();
        entityManager.clear();

        QuestEntity stored = questJpaRepository.findByQuestKey("Quest_A").orElseThrow();

        assertThat(stored.getDisplayName()).isEqualTo("A Quest");
        assertThat(stored.getDescriptionLines()).containsExactly("Quest description");
        assertThat(stored.getReferenceKeys()).containsExactly("Quest_A");
        assertThat(stored.getChoices()).hasSize(1);
        assertThat(stored.getChoices().get(0).getDescriptionLines()).containsExactly("Choice description");
        assertThat(stored.getChoices().get(0).getCompletionPrerequisiteLines()).containsExactly("Complete it");
        assertThat(stored.getChoices().get(0).getRewardDisplayLines()).containsExactly("Reward");
        assertThat(stored.getChoices().get(0).getReferenceKeys()).containsExactly("Choice_A", "Dialog_A");
        assertThat(stored.getChoices().get(0).getSteps()).hasSize(1);
        assertThat(stored.getChoices().get(0).getSteps().get(0).getCompletionPrerequisiteLines()).containsExactly("Complete it");
        assertThat(stored.getChoices().get(0).getSteps().get(0).getRewardDisplayLines()).containsExactly("Reward");
        assertThat(stored.getChoices().get(0).getSteps().get(0).getReferenceKeys()).containsExactly("Dialog_A");
        assertThat(stored.getDialogBlocks()).hasSize(1);
        assertThat(stored.getDialogBlocks().get(0).getLines())
                .extracting(line -> line.getText())
                .containsExactly("First line", "Second line");

        assertThat(singleTextColumn("quests", "description_lines", "quest_key", "Quest_A"))
                .isEqualTo("[\"Quest description\"]");
        assertThat(singleTextColumn("quests", "reference_keys", "quest_key", "Quest_A"))
                .isEqualTo("[\"Quest_A\"]");
        assertThat(singleTextColumn("quest_choices", "description_lines", "choice_key", "Choice_A"))
                .isEqualTo("[\"Choice description\"]");
        assertThat(singleTextColumn("quest_choices", "reference_keys", "choice_key", "Choice_A"))
                .isEqualTo("[\"Choice_A\",\"Dialog_A\"]");
        assertThat(singleTextColumn("quest_steps", "reward_display_lines", "step_index", 0))
                .isEqualTo("[\"Reward\"]");
    }

    @Test
    void importQuestSnapshot_isIdempotentAndReportsUnchanged() {
        QuestImportSnapshot snapshot = snapshot(quest("Quest_A", "A Quest", "First line"));

        questRepository.importQuestSnapshot(snapshot);
        ImportResult result = questRepository.importQuestSnapshot(snapshot);

        assertThat(result.getInserted()).isZero();
        assertThat(result.getUpdated()).isZero();
        assertThat(result.getUnchanged()).isEqualTo(1);
        assertThat(result.getDeleted()).isZero();
    }

    @Test
    void importQuestSnapshot_replacesChangedQuestAndDeletesObsoleteRows() {
        questRepository.importQuestSnapshot(snapshot(
                quest("Quest_A", "A Quest", "First line"),
                quest("Quest_B", "B Quest", "B line")
        ));

        ImportResult result = questRepository.importQuestSnapshot(snapshot(
                quest("Quest_A", "A Quest Updated", "Changed line")
        ));

        assertThat(result.getUpdated()).isEqualTo(1);
        assertThat(result.getDeleted()).isEqualTo(1);
        assertThat(questJpaRepository.findByQuestKey("Quest_B")).isEmpty();

        QuestEntity stored = questJpaRepository.findByQuestKey("Quest_A").orElseThrow();
        assertThat(stored.getDisplayName()).isEqualTo("A Quest Updated");
        assertThat(stored.getDialogBlocks().get(0).getLines())
                .extracting(line -> line.getText())
                .containsExactly("Changed line", "Second line");
    }

    @Test
    void findQuestExplorer_returnsComposedGraphAndDialogBlocksInStableOrder() {
        questRepository.importQuestSnapshot(snapshot(questWithRootAndStepDialog()));
        entityManager.flush();
        entityManager.clear();

        QuestExplorer explorer = questRepository.findQuestExplorer();

        assertThat(explorer.quests()).hasSize(1);
        assertThat(explorer.dialogBlocks())
                .extracting(QuestExplorer.QuestDialogBlock::identity)
                .containsExactly(
                        "Quest_A|||Dialog_Root|start",
                        "Quest_A|Choice_A|0|Dialog_A|start",
                        "Quest_A|Choice_A|0|Dialog_A|success"
                );

        QuestExplorer.Quest quest = explorer.quests().getFirst();
        assertThat(quest.rootDialogBlockIdentities())
                .containsExactly("Quest_A|||Dialog_Root|start");

        QuestExplorer.QuestStep step = quest.choices().getFirst().steps().getFirst();
        assertThat(step.dialogBlockIdentities())
                .containsExactly(
                        "Quest_A|Choice_A|0|Dialog_A|start",
                        "Quest_A|Choice_A|0|Dialog_A|success"
                );

        QuestExplorer.QuestDialogBlock startDialog = explorer.dialogBlocks().get(1);
        assertThat(startDialog.lines())
                .extracting(QuestExplorer.QuestDialogLine::text)
                .containsExactly("Start line 0", "Start line 1");
    }

    private static QuestImportSnapshot snapshot(QuestSnapshot... quests) {
        return new QuestImportSnapshot(List.of(quests));
    }

    private static QuestSnapshot quest(String questKey, String displayName, String firstLine) {
        DialogBlockSnapshot dialogBlock = new DialogBlockSnapshot(
                questKey + "|Choice_A|0|Dialog_A|start",
                questKey,
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                2,
                0,
                List.of(
                        new DialogLineSnapshot(0, 0, "character", "Leader", firstLine),
                        new DialogLineSnapshot(1, 1, "narrator", null, "Second line")
                )
        );

        StepSnapshot step = new StepSnapshot(
                0,
                0,
                null,
                null,
                null,
                List.of(),
                List.of("Complete it"),
                List.of(),
                List.of(),
                List.of(),
                List.of("Reward"),
                List.of("Dialog_A"),
                List.of(dialogBlock)
        );

        ChoiceSnapshot choice = new ChoiceSnapshot(
                "Choice_A",
                "Choice A",
                0,
                List.of("Choice description"),
                List.of("Complete it"),
                List.of(),
                List.of("Reward"),
                List.of(),
                List.of("Choice_A", "Dialog_A"),
                List.of(step)
        );

        return new QuestSnapshot(
                questKey,
                displayName,
                List.of("Quest description"),
                "QuestCategory_Test",
                "Curiosity",
                false,
                false,
                true,
                false,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of(questKey),
                List.of(choice),
                List.of()
        );
    }

    private static QuestSnapshot questWithRootAndStepDialog() {
        DialogBlockSnapshot rootDialog = new DialogBlockSnapshot(
                "Quest_A|||Dialog_Root|start",
                "Quest_A",
                null,
                null,
                "Dialog_Root",
                "start",
                1,
                0,
                List.of(new DialogLineSnapshot(0, 0, "narrator", null, "Root line"))
        );

        DialogBlockSnapshot startDialog = new DialogBlockSnapshot(
                "Quest_A|Choice_A|0|Dialog_A|start",
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                2,
                0,
                List.of(
                        new DialogLineSnapshot(0, 0, "narrator", null, "Start line 0"),
                        new DialogLineSnapshot(1, 1, "character", "Leader", "Start line 1")
                )
        );

        DialogBlockSnapshot successDialog = new DialogBlockSnapshot(
                "Quest_A|Choice_A|0|Dialog_A|success",
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "success",
                1,
                1,
                List.of(new DialogLineSnapshot(0, 2, "character", "Advisor", "Success line"))
        );

        StepSnapshot step = new StepSnapshot(
                0,
                0,
                "Find the trail.",
                "Quest_Next",
                null,
                List.of("Step description"),
                List.of("Complete it"),
                List.of(),
                List.of(),
                List.of("Selection"),
                List.of("Reward"),
                List.of("Dialog_A"),
                List.of(startDialog, successDialog)
        );

        ChoiceSnapshot choice = new ChoiceSnapshot(
                "Choice_A",
                "Choice A",
                0,
                List.of("Choice description"),
                List.of("Complete it"),
                List.of(),
                List.of("Reward"),
                List.of("Quest_Next"),
                List.of("Choice_A"),
                List.of(step)
        );

        return new QuestSnapshot(
                "Quest_A",
                "A Quest",
                List.of("Quest description"),
                "QuestCategory_Test",
                "Curiosity",
                true,
                false,
                true,
                false,
                false,
                "Chapter_A",
                0,
                1,
                2,
                "Branch_A",
                "Branch label",
                "Faction_A",
                "QuestLine_A",
                "Quest_Final",
                List.of("Quest_Prev"),
                List.of("Quest_Next"),
                List.of("Quest_A"),
                List.of(choice),
                List.of(rootDialog)
        );
    }

    private String singleTextColumn(String table, String column, String keyColumn, Object keyValue) {
        return jdbcTemplate.queryForObject(
                "select " + column + " from " + table + " where " + keyColumn + " = ?",
                String.class,
                keyValue
        );
    }
}
