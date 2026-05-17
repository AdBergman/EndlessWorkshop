package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestGraphStepDto(
        Integer index,
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
        List<QuestDialogBlockRefDto> dialogBlockRefs
) {}
