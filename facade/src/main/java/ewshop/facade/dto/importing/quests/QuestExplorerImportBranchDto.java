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
        List<String> nextEntryKeys,
        List<String> failureEntryKeys,
        List<String> convergesIntoEntryKeys,
        QuestExplorerImportBranchLoreDto lore,
        QuestExplorerImportBranchStrategyDto strategy
) {}
