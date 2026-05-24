package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
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
