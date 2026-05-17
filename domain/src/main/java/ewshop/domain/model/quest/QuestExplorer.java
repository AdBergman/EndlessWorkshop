package ewshop.domain.model.quest;

import java.util.List;

public record QuestExplorer(
        List<Quest> quests,
        List<QuestDialogBlock> dialogBlocks
) {
    public QuestExplorer {
        quests = safeList(quests);
        dialogBlocks = safeList(dialogBlocks);
    }

    public record Quest(
            String questKey,
            String displayName,
            List<String> descriptionLines,
            String categoryKey,
            String categoryType,
            boolean branchStart,
            boolean branchEnd,
            boolean mandatory,
            boolean keyNarrativeBeat,
            boolean narrativeVictoryPathChoice,
            String chapterKey,
            Integer chapterIndex,
            Integer chapterNumber,
            Integer questSequenceIndex,
            String branchGroupKey,
            String branchLabel,
            String inferredFactionKey,
            String inferredQuestLineKey,
            String convergesIntoQuestKey,
            List<String> previousQuestKeys,
            List<String> nextQuestKeys,
            List<String> referenceKeys,
            List<String> rootDialogBlockIdentities,
            List<QuestChoice> choices
    ) {
        public Quest {
            descriptionLines = safeList(descriptionLines);
            previousQuestKeys = safeList(previousQuestKeys);
            nextQuestKeys = safeList(nextQuestKeys);
            referenceKeys = safeList(referenceKeys);
            rootDialogBlockIdentities = safeList(rootDialogBlockIdentities);
            choices = safeList(choices);
        }
    }

    public record QuestChoice(
            String choiceKey,
            String displayName,
            int choiceOrder,
            List<String> descriptionLines,
            List<String> completionPrerequisiteLines,
            List<String> failurePrerequisiteLines,
            List<String> rewardDisplayLines,
            List<String> nextQuestKeys,
            List<String> referenceKeys,
            List<QuestStep> steps
    ) {
        public QuestChoice {
            descriptionLines = safeList(descriptionLines);
            completionPrerequisiteLines = safeList(completionPrerequisiteLines);
            failurePrerequisiteLines = safeList(failurePrerequisiteLines);
            rewardDisplayLines = safeList(rewardDisplayLines);
            nextQuestKeys = safeList(nextQuestKeys);
            referenceKeys = safeList(referenceKeys);
            steps = safeList(steps);
        }
    }

    public record QuestStep(
            int stepIndex,
            int stepOrder,
            String objectiveText,
            String nextQuestKey,
            String failQuestKey,
            List<String> descriptionLines,
            List<String> completionPrerequisiteLines,
            List<String> failurePrerequisiteLines,
            List<String> forbiddenPrerequisiteLines,
            List<String> selectionPrerequisiteLines,
            List<String> rewardDisplayLines,
            List<String> referenceKeys,
            List<String> dialogBlockIdentities
    ) {
        public QuestStep {
            descriptionLines = safeList(descriptionLines);
            completionPrerequisiteLines = safeList(completionPrerequisiteLines);
            failurePrerequisiteLines = safeList(failurePrerequisiteLines);
            forbiddenPrerequisiteLines = safeList(forbiddenPrerequisiteLines);
            selectionPrerequisiteLines = safeList(selectionPrerequisiteLines);
            rewardDisplayLines = safeList(rewardDisplayLines);
            referenceKeys = safeList(referenceKeys);
            dialogBlockIdentities = safeList(dialogBlockIdentities);
        }
    }

    public record QuestDialogBlock(
            String identity,
            String questKey,
            String choiceKey,
            Integer stepIndex,
            String parentScope,
            String dialogKey,
            String phase,
            int expectedLineCount,
            int blockOrder,
            List<QuestDialogLine> lines
    ) {
        public QuestDialogBlock {
            lines = safeList(lines);
        }
    }

    public record QuestDialogLine(
            int lineOrder,
            Integer sourceLineIndex,
            String role,
            String speakerLabel,
            String text
    ) {}

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
