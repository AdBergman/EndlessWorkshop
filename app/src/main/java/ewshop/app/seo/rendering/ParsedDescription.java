package ewshop.app.seo.rendering;

import java.util.List;

record ParsedDescription(
        String introLine,
        List<String> descriptionLines,
        List<String> metadataHighlights
) {
}
