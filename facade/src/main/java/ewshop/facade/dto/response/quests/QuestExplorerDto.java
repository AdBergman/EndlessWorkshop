package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestExplorerDto(
        List<QuestDto> quests,
        List<QuestDialogBlockDto> dialogBlocks
) {}
