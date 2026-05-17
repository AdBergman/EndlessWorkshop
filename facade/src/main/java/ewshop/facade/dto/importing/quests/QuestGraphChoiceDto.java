package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestGraphChoiceDto(
        String choiceKey,
        String displayName,
        List<String> descriptionLines,
        List<String> completionPrerequisiteLines,
        List<String> failurePrerequisiteLines,
        List<String> rewardDisplayLines,
        List<String> nextQuestKeys,
        List<String> referenceKeys,
        List<QuestGraphStepDto> steps
) {}
