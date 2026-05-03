package ewshop.app.seo;

public record SeoRegenerationKindResult(
        int generatedCount,
        int skippedCount,
        int duplicateCount
) {
}
