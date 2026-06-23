package ewshop.domain.model.importing;

public record ImportHistoryCounts(
        int received,
        int inserted,
        int updated,
        int unchanged,
        int deleted,
        int failed
) {
    public static ImportHistoryCounts empty() {
        return new ImportHistoryCounts(0, 0, 0, 0, 0, 0);
    }

    public ImportHistoryCounts plus(ImportHistoryCounts other) {
        if (other == null) return this;
        return new ImportHistoryCounts(
                received + other.received,
                inserted + other.inserted,
                updated + other.updated,
                unchanged + other.unchanged,
                deleted + other.deleted,
                failed + other.failed
        );
    }
}
