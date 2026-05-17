package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestDialogBlockDto(
        String identity,
        String questKey,
        String choiceKey,
        Integer stepIndex,
        String parentScope,
        String dialogKey,
        String phase,
        int expectedLineCount,
        int blockOrder,
        List<QuestDialogLineDto> lines
) {}
