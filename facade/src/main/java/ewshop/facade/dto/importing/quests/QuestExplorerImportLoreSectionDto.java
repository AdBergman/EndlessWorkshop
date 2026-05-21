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
        List<QuestExplorerImportLoreLineDto> lines
) {}
