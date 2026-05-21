package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestExplorerImportBranchStrategyDto(
        List<String> conditions,
        List<QuestExplorerImportRequirementDto> requirements,
        List<QuestExplorerImportRewardDto> rewards
) {}
