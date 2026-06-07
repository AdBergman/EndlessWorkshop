package ewshop.app.importing;

record LocalStartupImportSummary(
        int imported,
        int skipped,
        int failed
) {
    static LocalStartupImportSummary empty() {
        return new LocalStartupImportSummary(0, 0, 0);
    }
}
