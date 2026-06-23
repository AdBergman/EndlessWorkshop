package ewshop.facade.dto.response.importing;

import java.util.List;

public record DataFreshnessDto(
        boolean available,
        String latestImportAtUtc,
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String sourceLabel,
        int importedFileCount,
        List<String> importedKinds,
        String note
) {
    public DataFreshnessDto {
        importedKinds = importedKinds == null ? List.of() : List.copyOf(importedKinds);
    }

    public static DataFreshnessDto unavailable() {
        return new DataFreshnessDto(false, null, null, null, null, null, null, 0, List.of(), null);
    }
}
