package ewshop.domain.model.results;

import ewshop.domain.command.UnitImportSnapshot;

import java.util.List;

public record UnitImportPreview(
        List<UnitImportSnapshot> importableSnapshots,
        int rowsWithoutFaction,
        int prototypeClassRows
) {
    public UnitImportPreview {
        importableSnapshots = importableSnapshots == null ? List.of() : List.copyOf(importableSnapshots);
    }

    public int importable() {
        return importableSnapshots.size();
    }

    public int filtered() {
        return rowsWithoutFaction + prototypeClassRows;
    }
}
