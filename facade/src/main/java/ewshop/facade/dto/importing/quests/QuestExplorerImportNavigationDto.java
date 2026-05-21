package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestExplorerImportNavigationDto(
        String factionKey,
        String factionName,
        String questLineKey,
        String questLineName,
        Integer chapter,
        String chapterLabel,
        Integer step,
        String stepLabel,
        Integer sequenceIndex,
        Integer chapterOrder,
        Integer stepOrder,
        String branchGroupKey,
        String branchLabel,
        Integer branchOrder,
        Boolean isBranchStart,
        Boolean isBranchEnd,
        List<String> previousEntryKeys,
        List<String> nextEntryKeys,
        List<String> failureEntryKeys,
        List<String> convergesIntoEntryKeys
) {}
