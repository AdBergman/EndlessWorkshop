package ewshop.app.seo.generation;

import java.util.List;

public record PageCandidate(
        String kind,
        String entryKey,
        String displayName,
        String category,
        String sourceKind,
        List<String> descriptionLines,
        List<String> referenceKeys,
        String slug,
        String entryKeySlug,
        String route,
        String canonicalRoute,
        boolean indexable,
        String contextLabel,
        List<CodexVariantAlias> canonicalizedVariants
) {
}
