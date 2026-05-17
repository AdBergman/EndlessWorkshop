package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestDialogBlockDto(
        String questKey,
        String choiceKey,
        Integer stepIndex,
        String dialogKey,
        String phase,
        List<QuestDialogLineDto> lines
) {}
