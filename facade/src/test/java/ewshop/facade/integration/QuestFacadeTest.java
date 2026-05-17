package ewshop.facade.integration;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.command.QuestImportSnapshot.*;
import ewshop.domain.repository.QuestRepository;
import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuestFacadeTest extends BaseIT {

    @Autowired
    private QuestFacade questFacade;

    @Autowired
    private QuestRepository questRepository;

    @Test
    void getQuestExplorer_returnsComposedQuestGraphAndDialogPayload() {
        questRepository.importQuestSnapshot(new QuestImportSnapshot(List.of(quest())));

        QuestExplorerDto result = questFacade.getQuestExplorer();

        assertThat(result.quests()).hasSize(1);
        assertThat(result.dialogBlocks()).hasSize(2);

        var quest = result.quests().getFirst();
        assertThat(quest.questKey()).isEqualTo("Quest_A");
        assertThat(quest.displayName()).isEqualTo("A Quest");
        assertThat(quest.previousQuestKeys()).containsExactly("Quest_Prev");
        assertThat(quest.nextQuestKeys()).containsExactly("Quest_Next");
        assertThat(quest.rootDialogBlockIdentities()).containsExactly("Quest_A|||Dialog_Root|start");
        assertThat(quest.choices()).hasSize(1);

        var step = quest.choices().getFirst().steps().getFirst();
        assertThat(step.stepIndex()).isZero();
        assertThat(step.dialogBlockIdentities()).containsExactly("Quest_A|Choice_A|0|Dialog_A|success");

        var rootDialog = result.dialogBlocks().getFirst();
        assertThat(rootDialog.identity()).isEqualTo("Quest_A|||Dialog_Root|start");
        assertThat(rootDialog.lines()).extracting(line -> line.text())
                .containsExactly("Root line");
    }

    private static QuestSnapshot quest() {
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

        DialogBlockSnapshot stepDialog = new DialogBlockSnapshot(
                "Quest_A|Choice_A|0|Dialog_A|success",
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "success",
                1,
                0,
                List.of(new DialogLineSnapshot(0, 1, "character", "Leader", "Step line"))
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
                List.of(),
                List.of("Reward"),
                List.of("Dialog_A"),
                List.of(stepDialog)
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
}
