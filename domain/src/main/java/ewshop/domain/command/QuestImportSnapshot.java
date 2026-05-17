package ewshop.domain.command;

import java.util.List;

public record QuestImportSnapshot(
        List<QuestSnapshot> quests
) {
    public QuestImportSnapshot {
        quests = quests == null ? List.of() : List.copyOf(quests);
    }

    public record QuestSnapshot(
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
            List<ChoiceSnapshot> choices,
            List<DialogBlockSnapshot> rootDialogBlocks
    ) {
        public QuestSnapshot {
            descriptionLines = safeList(descriptionLines);
            previousQuestKeys = safeList(previousQuestKeys);
            nextQuestKeys = safeList(nextQuestKeys);
            referenceKeys = safeList(referenceKeys);
            choices = safeList(choices);
            rootDialogBlocks = safeList(rootDialogBlocks);
        }
    }

    public record ChoiceSnapshot(
            String choiceKey,
            String displayName,
            int choiceOrder,
            List<String> descriptionLines,
            List<String> completionPrerequisiteLines,
            List<String> failurePrerequisiteLines,
            List<String> rewardDisplayLines,
            List<String> nextQuestKeys,
            List<String> referenceKeys,
            List<StepSnapshot> steps
    ) {
        public ChoiceSnapshot {
            descriptionLines = safeList(descriptionLines);
            completionPrerequisiteLines = safeList(completionPrerequisiteLines);
            failurePrerequisiteLines = safeList(failurePrerequisiteLines);
            rewardDisplayLines = safeList(rewardDisplayLines);
            nextQuestKeys = safeList(nextQuestKeys);
            referenceKeys = safeList(referenceKeys);
            steps = safeList(steps);
        }
    }

    public record StepSnapshot(
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
            List<DialogBlockSnapshot> dialogBlocks
    ) {
        public StepSnapshot {
            descriptionLines = safeList(descriptionLines);
            completionPrerequisiteLines = safeList(completionPrerequisiteLines);
            failurePrerequisiteLines = safeList(failurePrerequisiteLines);
            forbiddenPrerequisiteLines = safeList(forbiddenPrerequisiteLines);
            selectionPrerequisiteLines = safeList(selectionPrerequisiteLines);
            rewardDisplayLines = safeList(rewardDisplayLines);
            referenceKeys = safeList(referenceKeys);
            dialogBlocks = safeList(dialogBlocks);
        }
    }

    public record DialogBlockSnapshot(
            String identity,
            String questKey,
            String choiceKey,
            Integer stepIndex,
            String dialogKey,
            String phase,
            int expectedLineCount,
            int blockOrder,
            List<DialogLineSnapshot> lines
    ) {
        public DialogBlockSnapshot {
            lines = safeList(lines);
        }
    }

    public record DialogLineSnapshot(
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
