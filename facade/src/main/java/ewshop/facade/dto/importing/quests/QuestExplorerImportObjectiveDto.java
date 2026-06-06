package ewshop.facade.dto.importing.quests;


import java.util.List;

public record QuestExplorerImportObjectiveDto(
        String objectiveKey,
        String choiceKey,
        String text,
        String phase,
        List<String> revealedByBranchKeys,
        List<String> revealedByChoiceKeys,
        List<List<String>> revealedByBranchPathAlternatives,
        List<QuestExplorerImportRequirementDto> requirements,
        List<QuestExplorerImportRewardDto> rewards
) {
    public QuestExplorerImportObjectiveDto(
            String objectiveKey,
            String text,
            String phase,
            List<QuestExplorerImportRequirementDto> requirements,
            List<QuestExplorerImportRewardDto> rewards
    ) {
        this(objectiveKey, null, text, phase, List.of(), List.of(), List.of(), requirements, rewards);
    }

    public QuestExplorerImportObjectiveDto(
            String objectiveKey,
            String choiceKey,
            String text,
            String phase,
            List<QuestExplorerImportRequirementDto> requirements,
            List<QuestExplorerImportRewardDto> rewards
    ) {
        this(objectiveKey, choiceKey, text, phase, List.of(), List.of(), List.of(), requirements, rewards);
    }
}
