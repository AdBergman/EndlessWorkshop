package ewshop.facade.dto.response.quests;

public record QuestDialogLineDto(
        int lineOrder,
        Integer sourceLineIndex,
        String role,
        String speakerLabel,
        String text
) {}
