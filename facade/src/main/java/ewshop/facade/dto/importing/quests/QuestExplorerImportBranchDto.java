package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestExplorerImportBranchDto(
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
        QuestExplorerImportBranchLoreDto lore,
        QuestExplorerImportBranchStrategyDto strategy
) {
    public QuestExplorerImportBranchDto(
            String branchKey,
            String choiceKey,
            String label,
            Integer orderIndex,
            String groupKey,
            String groupLabel,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            QuestExplorerImportBranchLoreDto lore,
            QuestExplorerImportBranchStrategyDto strategy
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
                lore,
                strategy
        );
    }
}
