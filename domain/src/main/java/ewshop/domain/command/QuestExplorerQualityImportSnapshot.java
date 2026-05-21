package ewshop.domain.command;

import java.util.List;

public record QuestExplorerQualityImportSnapshot(List<String> warnings) {
    public QuestExplorerQualityImportSnapshot {
        warnings = warnings == null ? List.of() : List.copyOf(warnings);
    }
}
