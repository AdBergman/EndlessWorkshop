package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestDialogBlockRefDto(
        String questKey,
        String choiceKey,
        Integer stepIndex,
        String dialogKey,
        String phase,
        Integer lineCount
) {}
