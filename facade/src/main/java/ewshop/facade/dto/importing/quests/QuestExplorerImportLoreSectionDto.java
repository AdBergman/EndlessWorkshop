package ewshop.facade.dto.importing.quests;


import java.util.List;

public record QuestExplorerImportLoreSectionDto(
        String sectionKey,
        String phase,
        String choiceKey,
        Integer stepIndex,
        String objectiveKey,
        List<String> revealedByBranchKeys,
        List<String> revealedByChoiceKeys,
        List<List<String>> revealedByBranchPathAlternatives,
        List<QuestExplorerImportLoreLineDto> lines
) {
    public QuestExplorerImportLoreSectionDto(
            String sectionKey,
            String phase,
            String choiceKey,
            Integer stepIndex,
            String objectiveKey,
            List<QuestExplorerImportLoreLineDto> lines
    ) {
        this(sectionKey, phase, choiceKey, stepIndex, objectiveKey, List.of(), List.of(), List.of(), lines);
    }
}
