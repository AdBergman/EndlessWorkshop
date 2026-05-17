package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestDialogLineDto(
        Integer lineIndex,
        String role,
        String speakerLabel,
        String text
) {}
