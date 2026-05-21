package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestExplorerImportObjectiveDto(
        String objectiveKey,
        String text,
        String phase,
        List<QuestExplorerImportRequirementDto> requirements,
        List<QuestExplorerImportRewardDto> rewards
) {}
