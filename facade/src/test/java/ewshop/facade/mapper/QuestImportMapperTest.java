package ewshop.facade.mapper;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.facade.dto.importing.quests.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QuestImportMapperTest {

    @Test
    void mapsGraphAndDialogTogether_andAllowsMissingObjectiveText() {
        QuestImportSnapshot snapshot = QuestImportMapper.toSnapshot(graph(List.of(stepRef())), dialog(List.of(dialogBlock())));

        assertThat(snapshot.quests()).hasSize(1);
        QuestImportSnapshot.QuestSnapshot quest = snapshot.quests().get(0);
        assertThat(quest.questKey()).isEqualTo("Quest_A");
        assertThat(quest.displayName()).isEqualTo("A Quest");
        assertThat(quest.choices()).hasSize(1);

        QuestImportSnapshot.StepSnapshot step = quest.choices().get(0).steps().get(0);
        assertThat(step.objectiveText()).isNull();
        assertThat(step.dialogBlocks()).hasSize(1);

        QuestImportSnapshot.DialogBlockSnapshot block = step.dialogBlocks().get(0);
        assertThat(block.identity()).isEqualTo("Quest_A|Choice_A|0|Dialog_A|start");
        assertThat(block.lines()).extracting(QuestImportSnapshot.DialogLineSnapshot::text)
                .containsExactly("First line", "Second line");
        assertThat(block.lines()).extracting(QuestImportSnapshot.DialogLineSnapshot::sourceLineIndex)
                .containsExactly(0, 1);
        assertThat(block.lines().get(1).speakerLabel()).isNull();
    }

    @Test
    void rejectsMissingDialogRefs() {
        QuestDialogBlockDto otherDialog = new QuestDialogBlockDto(
                "Quest_A",
                "Choice_A",
                0,
                "Other_Dialog",
                "start",
                List.of(new QuestDialogLineDto(0, "narrator", null, "Line"))
        );

        assertThatThrownBy(() -> QuestImportMapper.toSnapshot(graph(List.of(stepRef())), dialog(List.of(otherDialog))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("references missing dialog block");
    }

    @Test
    void rejectsOrphanDialogRows() {
        assertThatThrownBy(() -> QuestImportMapper.toSnapshot(
                graph(List.of(stepRef())),
                dialog(List.of(dialogBlock(), orphanDialogBlock()))
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dialog rows not referenced by graph");
    }

    @Test
    void rejectsDuplicateDialogIdentity() {
        assertThatThrownBy(() -> QuestImportMapper.toSnapshot(
                graph(List.of(stepRef())),
                dialog(List.of(dialogBlock(), dialogBlock()))
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duplicate dialog block identity");
    }

    @Test
    void rejectsLineCountMismatch() {
        QuestDialogBlockRefDto badRef = new QuestDialogBlockRefDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                99
        );

        assertThatThrownBy(() -> QuestImportMapper.toSnapshot(graph(List.of(badRef)), dialog(List.of(dialogBlock()))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("lineCount mismatch");
    }

    private static QuestGraphImportBatchDto graph(List<QuestDialogBlockRefDto> refs) {
        QuestGraphStepDto step = new QuestGraphStepDto(
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
                refs
        );
        QuestGraphChoiceDto choice = new QuestGraphChoiceDto(
                "Choice_A",
                "Choice A",
                List.of("Choice description"),
                List.of("Complete it"),
                List.of(),
                List.of("Reward"),
                List.of(),
                List.of("Choice_A", "Dialog_A"),
                List.of(step)
        );
        QuestGraphQuestDto quest = new QuestGraphQuestDto(
                "Quest_A",
                "A Quest",
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
                List.of("Quest_A"),
                List.of(choice),
                List.of()
        );
        return new QuestGraphImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_graph", List.of(quest));
    }

    private static QuestDialogImportBatchDto dialog(List<QuestDialogBlockDto> blocks) {
        return new QuestDialogImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_dialog", blocks);
    }

    private static QuestDialogBlockRefDto stepRef() {
        return new QuestDialogBlockRefDto("Quest_A", "Choice_A", 0, "Dialog_A", "start", 2);
    }

    private static QuestDialogBlockDto dialogBlock() {
        return new QuestDialogBlockDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                List.of(
                        new QuestDialogLineDto(0, "character", "Leader", "First line"),
                        new QuestDialogLineDto(1, "narrator", null, "Second line")
                )
        );
    }

    private static QuestDialogBlockDto orphanDialogBlock() {
        return new QuestDialogBlockDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_Orphan",
                "start",
                List.of(new QuestDialogLineDto(0, "narrator", null, "Orphan"))
        );
    }
}
