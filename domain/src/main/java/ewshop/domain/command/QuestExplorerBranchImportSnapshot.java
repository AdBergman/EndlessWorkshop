package ewshop.domain.command;

import java.util.List;

public record QuestExplorerBranchImportSnapshot(
        String branchKey,
        String choiceKey,
        String label,
        Integer orderIndex,
        String groupKey,
        String groupLabel,
        Integer branchStepOrder,
        String parentBranchKey,
        String parentChoiceKey,
        List<String> prerequisiteBranchKeys,
        List<String> prerequisiteBranchPath,
        String choiceGroupKey,
        String convergenceGroupKey,
        String sectionRole,
        List<String> nextEntryKeys,
        List<String> failureEntryKeys,
        List<String> convergesIntoEntryKeys,
        List<String> outcomePreviewLines,
        List<String> conditions,
        List<QuestExplorerRequirementImportSnapshot> requirements,
        List<QuestExplorerRewardImportSnapshot> rewards
) {
    public QuestExplorerBranchImportSnapshot(
            String branchKey,
            String choiceKey,
            String label,
            Integer orderIndex,
            String groupKey,
            String groupLabel,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            List<String> outcomePreviewLines,
            List<String> conditions,
            List<QuestExplorerRequirementImportSnapshot> requirements,
            List<QuestExplorerRewardImportSnapshot> rewards
    ) {
        this(
                branchKey,
                choiceKey,
                label,
                orderIndex,
                groupKey,
                groupLabel,
                null,
                null,
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                nextEntryKeys,
                failureEntryKeys,
                convergesIntoEntryKeys,
                outcomePreviewLines,
                conditions,
                requirements,
                rewards
        );
    }

    public QuestExplorerBranchImportSnapshot {
        prerequisiteBranchKeys = safeList(prerequisiteBranchKeys);
        prerequisiteBranchPath = safeList(prerequisiteBranchPath);
        nextEntryKeys = safeList(nextEntryKeys);
        failureEntryKeys = safeList(failureEntryKeys);
        convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
        outcomePreviewLines = safeList(outcomePreviewLines);
        conditions = safeList(conditions);
        requirements = safeList(requirements);
        rewards = safeList(rewards);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
