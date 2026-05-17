package ewshop.facade.mapper;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.facade.dto.response.quests.QuestExplorerDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuestMapperTest {

    @Test
    void toDto_mapsComposedQuestExplorerShape() {
        String identity = "Quest_A|Choice_A|0|Dialog_A|start";
        QuestExplorer explorer = new QuestExplorer(
                List.of(new QuestExplorer.Quest(
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
                        "Quest_B",
                        List.of("Quest_Prev"),
                        List.of("Quest_Next"),
                        List.of("Quest_A"),
                        List.of("Quest_A|||Dialog_Root|start"),
                        List.of(new QuestExplorer.QuestChoice(
                                "Choice_A",
                                "Choice A",
                                0,
                                List.of("Choice description"),
                                List.of("Complete it"),
                                List.of("Fail it"),
                                List.of("Reward"),
                                List.of("Quest_Next"),
                                List.of("Choice_A"),
                                List.of(new QuestExplorer.QuestStep(
                                        0,
                                        0,
                                        "Find the trail.",
                                        "Quest_Next",
                                        "Quest_Fail",
                                        List.of("Step description"),
                                        List.of("Complete it"),
                                        List.of("Fail it"),
                                        List.of("Forbidden"),
                                        List.of("Selected"),
                                        List.of("Reward"),
                                        List.of("Dialog_A"),
                                        List.of(identity)
                                ))
                        ))
                )),
                List.of(new QuestExplorer.QuestDialogBlock(
                        identity,
                        "Quest_A",
                        "Choice_A",
                        0,
                        "STEP",
                        "Dialog_A",
                        "start",
                        1,
                        0,
                        List.of(new QuestExplorer.QuestDialogLine(0, 7, "character", "Leader", "We begin."))
                ))
        );

        QuestExplorerDto dto = QuestMapper.toDto(explorer);

        assertThat(dto.quests()).hasSize(1);
        assertThat(dto.dialogBlocks()).hasSize(1);

        var quest = dto.quests().getFirst();
        assertThat(quest.questKey()).isEqualTo("Quest_A");
        assertThat(quest.descriptionLines()).containsExactly("Quest description");
        assertThat(quest.rootDialogBlockIdentities()).containsExactly("Quest_A|||Dialog_Root|start");
        assertThat(quest.choices()).hasSize(1);

        var choice = quest.choices().getFirst();
        assertThat(choice.completionPrerequisiteLines()).containsExactly("Complete it");
        assertThat(choice.steps()).hasSize(1);

        var step = choice.steps().getFirst();
        assertThat(step.objectiveText()).isEqualTo("Find the trail.");
        assertThat(step.dialogBlockIdentities()).containsExactly(identity);

        var block = dto.dialogBlocks().getFirst();
        assertThat(block.identity()).isEqualTo(identity);
        assertThat(block.lines()).hasSize(1);
        assertThat(block.lines().getFirst().text()).isEqualTo("We begin.");
    }

    @Test
    void toDto_mapsNullExplorerToEmptyPayload() {
        QuestExplorerDto dto = QuestMapper.toDto(null);

        assertThat(dto.quests()).isEmpty();
        assertThat(dto.dialogBlocks()).isEmpty();
    }
}
