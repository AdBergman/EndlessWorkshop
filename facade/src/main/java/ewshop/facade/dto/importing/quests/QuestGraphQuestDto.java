package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestGraphQuestDto(
        String entryKey,
        String displayName,
        List<String> descriptionLines,
        String categoryKey,
        String categoryType,
        Boolean isBranchStart,
        Boolean isBranchEnd,
        Boolean isMandatory,
        Boolean isKeyNarrativeBeat,
        Boolean isNarrativeVictoryPathChoice,
        String chapterKey,
        Integer chapterIndex,
        Integer chapterNumber,
        Integer questSequenceIndex,
        String branchGroupKey,
        String branchLabel,
        String inferredFactionKey,
        String inferredQuestLineKey,
        String convergesIntoQuestKey,
        List<String> previousQuestKeys,
        List<String> nextQuestKeys,
        List<String> referenceKeys,
        List<QuestGraphChoiceDto> choices,
        List<QuestDialogBlockRefDto> dialogBlockRefs
) {}
