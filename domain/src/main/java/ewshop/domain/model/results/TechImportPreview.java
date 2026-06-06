package ewshop.domain.model.results;

import ewshop.domain.command.TechImportSnapshot;

import java.util.List;

public record TechImportPreview(
        List<TechImportSnapshot> importableSnapshots,
        int hiddenSnapshots,
        int snapshotsWithoutAvailableFactions
) {
    public TechImportPreview {
        importableSnapshots = importableSnapshots == null ? List.of() : List.copyOf(importableSnapshots);
    }

    public int importable() {
        return importableSnapshots.size();
    }

    public int filtered() {
        return hiddenSnapshots + snapshotsWithoutAvailableFactions;
    }
}
