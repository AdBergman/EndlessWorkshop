package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestDto(
        String questKey,
        String displayName,
        List<String> descriptionLines,
        String categoryKey,
        String categoryType,
        boolean branchStart,
        boolean branchEnd,
        boolean mandatory,
        boolean keyNarrativeBeat,
        boolean narrativeVictoryPathChoice,
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
        List<String> rootDialogBlockIdentities,
        List<QuestChoiceDto> choices
) {}
