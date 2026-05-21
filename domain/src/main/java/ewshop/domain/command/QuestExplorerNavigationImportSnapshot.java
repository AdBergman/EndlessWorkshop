package ewshop.domain.command;

import java.util.List;

public record QuestExplorerNavigationImportSnapshot(
        String factionKey,
        String factionName,
        String questLineKey,
        String questLineName,
        Integer chapter,
        String chapterLabel,
        Integer step,
        String stepLabel,
        int sequenceIndex,
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
) {
    public QuestExplorerNavigationImportSnapshot {
        previousEntryKeys = safeList(previousEntryKeys);
        nextEntryKeys = safeList(nextEntryKeys);
        failureEntryKeys = safeList(failureEntryKeys);
        convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
