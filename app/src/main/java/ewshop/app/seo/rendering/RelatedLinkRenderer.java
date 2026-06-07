package ewshop.app.seo.rendering;

import ewshop.app.seo.generation.ReferenceTarget;

import java.util.List;
import java.util.Map;

final class RelatedLinkRenderer {

    String renderRelatedSection(
            List<String> referenceKeys,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        if (referenceKeys == null || referenceKeys.isEmpty()) {
            return "";
        }

        String referenceChips = renderReferenceChips(referenceKeys, referenceTargetsByEntryKey);
        if (referenceChips.isBlank()) {
            return "";
        }

        return """
                        <section class="seo-section entity-page__section entity-page__references">
                            <h2 class="seo-heading">Related</h2>
                            %s
                        </section>
                """.formatted(referenceChips);
    }

    private static String renderReferenceChips(
            List<String> referenceKeys,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        StringBuilder chips = new StringBuilder();
        chips.append("<ul class=\"seo-chipList\">");
        for (String referenceKey : referenceKeys) {
            String key = trimToEmpty(referenceKey);
            if (key.isBlank()) {
                continue;
            }

            ReferenceTarget target = referenceTargetsByEntryKey.get(key);
            if (target == null || trimToEmpty(target.route()).isBlank()) {
                continue;
            }

            String label = trimToEmpty(target.displayName()).isBlank()
                    ? key
                    : target.displayName();

            chips.append("<li>")
                    .append("<a class=\"seo-chip\" href=\"")
                    .append(HtmlEscaper.escapeHtml(target.route()))
                    .append("\" data-entry-key=\"")
                    .append(HtmlEscaper.escapeHtml(key))
                    .append("\">")
                    .append(HtmlEscaper.escapeHtml(label))
                    .append("</a>")
                    .append("</li>");
        }
        if (chips.length() == "<ul class=\"seo-chipList\">".length()) {
            return "";
        }

        chips.append("</ul>");
        return chips.toString();
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
