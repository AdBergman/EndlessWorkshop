package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestStepDto(
        int stepIndex,
        int stepOrder,
        String objectiveText,
        String nextQuestKey,
        String failQuestKey,
        List<String> descriptionLines,
        List<String> completionPrerequisiteLines,
        List<String> failurePrerequisiteLines,
        List<String> forbiddenPrerequisiteLines,
        List<String> selectionPrerequisiteLines,
        List<String> rewardDisplayLines,
        List<String> referenceKeys,
        List<String> dialogBlockIdentities
) {}
