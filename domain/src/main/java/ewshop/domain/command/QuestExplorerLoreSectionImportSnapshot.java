package ewshop.domain.command;

import java.util.List;

public record QuestExplorerLoreSectionImportSnapshot(
        String sectionKey,
        String phase,
        String choiceKey,
        Integer stepIndex,
        String objectiveKey,
        List<QuestExplorerLoreLineImportSnapshot> lines
) {
    public QuestExplorerLoreSectionImportSnapshot {
        lines = lines == null ? List.of() : List.copyOf(lines);
    }
}
