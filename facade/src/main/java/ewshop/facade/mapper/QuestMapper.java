package ewshop.facade.mapper;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.facade.dto.response.quests.*;

import java.util.List;

public final class QuestMapper {

    private QuestMapper() {}

    public static QuestExplorerDto toDto(QuestExplorer explorer) {
        if (explorer == null) {
            return new QuestExplorerDto(List.of(), List.of());
        }

        return new QuestExplorerDto(
                safeList(explorer.quests()).stream()
                        .map(QuestMapper::toDto)
                        .toList(),
                safeList(explorer.dialogBlocks()).stream()
                        .map(QuestMapper::toDto)
                        .toList()
        );
    }

    private static QuestDto toDto(QuestExplorer.Quest quest) {
        if (quest == null) return null;

        return new QuestDto(
                quest.questKey(),
                quest.displayName(),
                safeList(quest.descriptionLines()),
                quest.categoryKey(),
                quest.categoryType(),
                quest.branchStart(),
                quest.branchEnd(),
                quest.mandatory(),
                quest.keyNarrativeBeat(),
                quest.narrativeVictoryPathChoice(),
                quest.chapterKey(),
                quest.chapterIndex(),
                quest.chapterNumber(),
                quest.questSequenceIndex(),
                quest.branchGroupKey(),
                quest.branchLabel(),
                quest.inferredFactionKey(),
                quest.inferredQuestLineKey(),
                quest.convergesIntoQuestKey(),
                safeList(quest.previousQuestKeys()),
                safeList(quest.nextQuestKeys()),
                safeList(quest.referenceKeys()),
                safeList(quest.rootDialogBlockIdentities()),
                safeList(quest.choices()).stream()
                        .map(QuestMapper::toDto)
                        .toList()
        );
    }

    private static QuestChoiceDto toDto(QuestExplorer.QuestChoice choice) {
        if (choice == null) return null;

        return new QuestChoiceDto(
                choice.choiceKey(),
                choice.displayName(),
                choice.choiceOrder(),
                safeList(choice.descriptionLines()),
                safeList(choice.completionPrerequisiteLines()),
                safeList(choice.failurePrerequisiteLines()),
                safeList(choice.rewardDisplayLines()),
                safeList(choice.nextQuestKeys()),
                safeList(choice.referenceKeys()),
                safeList(choice.steps()).stream()
                        .map(QuestMapper::toDto)
                        .toList()
        );
    }

    private static QuestStepDto toDto(QuestExplorer.QuestStep step) {
        if (step == null) return null;

        return new QuestStepDto(
                step.stepIndex(),
                step.stepOrder(),
                step.objectiveText(),
                step.nextQuestKey(),
                step.failQuestKey(),
                safeList(step.descriptionLines()),
                safeList(step.completionPrerequisiteLines()),
                safeList(step.failurePrerequisiteLines()),
                safeList(step.forbiddenPrerequisiteLines()),
                safeList(step.selectionPrerequisiteLines()),
                safeList(step.rewardDisplayLines()),
                safeList(step.referenceKeys()),
                safeList(step.dialogBlockIdentities())
        );
    }

    private static QuestDialogBlockDto toDto(QuestExplorer.QuestDialogBlock block) {
        if (block == null) return null;

        return new QuestDialogBlockDto(
                block.identity(),
                block.questKey(),
                block.choiceKey(),
                block.stepIndex(),
                block.parentScope(),
                block.dialogKey(),
                block.phase(),
                block.expectedLineCount(),
                block.blockOrder(),
                safeList(block.lines()).stream()
                        .map(QuestMapper::toDto)
                        .toList()
        );
    }

    private static QuestDialogLineDto toDto(QuestExplorer.QuestDialogLine line) {
        if (line == null) return null;

        return new QuestDialogLineDto(
                line.lineOrder(),
                line.sourceLineIndex(),
                line.role(),
                line.speakerLabel(),
                line.text()
        );
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
