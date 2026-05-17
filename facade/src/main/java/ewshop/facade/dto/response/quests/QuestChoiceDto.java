package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestChoiceDto(
        String choiceKey,
        String displayName,
        int choiceOrder,
        List<String> descriptionLines,
        List<String> completionPrerequisiteLines,
        List<String> failurePrerequisiteLines,
        List<String> rewardDisplayLines,
        List<String> nextQuestKeys,
        List<String> referenceKeys,
        List<QuestStepDto> steps
) {}
