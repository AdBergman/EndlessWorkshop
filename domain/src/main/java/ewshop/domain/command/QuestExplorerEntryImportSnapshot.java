package ewshop.domain.command;

import java.util.List;

public record QuestExplorerEntryImportSnapshot(
        String entryKey,
        String title,
        List<String> summaryLines,
        String questType,
        Boolean isMandatory,
        Boolean isKeyNarrativeBeat,
        List<String> aliases,
        QuestExplorerNavigationImportSnapshot navigation,
        List<QuestExplorerLoreSectionImportSnapshot> loreSections,
        List<QuestExplorerStrategyObjectiveImportSnapshot> objectives,
        List<QuestExplorerBranchImportSnapshot> branches,
        QuestExplorerQualityImportSnapshot quality
) {
    public QuestExplorerEntryImportSnapshot {
        summaryLines = safeList(summaryLines);
        aliases = safeList(aliases);
        loreSections = safeList(loreSections);
        objectives = safeList(objectives);
        branches = safeList(branches);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
