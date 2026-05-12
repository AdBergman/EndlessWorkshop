package ewshop.app.seo.generation;

import java.util.List;

public record PageCandidate(
        String kind,
        String entryKey,
        String displayName,
        List<String> descriptionLines,
        List<String> referenceKeys,
        String slug
) {
}
