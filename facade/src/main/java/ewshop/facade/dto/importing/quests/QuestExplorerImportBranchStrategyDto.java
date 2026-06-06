package ewshop.facade.dto.importing.quests;


import java.util.List;

public record QuestExplorerImportBranchStrategyDto(
        List<String> conditions,
        List<QuestExplorerImportRequirementDto> requirements,
        List<QuestExplorerImportRewardDto> rewards
) {}
