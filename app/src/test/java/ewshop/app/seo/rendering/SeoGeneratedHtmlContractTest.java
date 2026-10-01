package ewshop.app.seo.rendering;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.ReferenceTarget;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SeoGeneratedHtmlContractTest {

    private final SeoPageRenderer renderer = new SeoPageRenderer();

    @Test
    void rendersEntityPageSemanticRegionsWithoutDependingOnWhitespace() {
        PageCandidate candidate = new PageCandidate(
                "tech",
                "Technology_District_Tier1_Industry",
                "Workshop",
                "Economy",
                "Technology",
                List.of(
                        "Workshop improves early city industry.",
                        "Category: Economy",
                        "+2 Industry per District Level"
                ),
                List.of("Unit_Sentinel", "Missing_Key"),
                "workshop",
                "",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/tech/workshop",
                true,
                "",
                List.of()
        );

        String html = normalizeHtml(renderer.renderEntityHtml(
                candidate,
                candidate.route(),
                Map.of("Unit_Sentinel", new ReferenceTarget("Sentinel", "/encyclopedia/units/sentinel"))
        ));

        assertThat(html)
                .contains("<title>Workshop Technology Reference | Endless Workshop</title>")
                .contains("<meta name=\"description\" content=\"Workshop is a technology entry in the Endless Workshop codex. Workshop improves early city industry.\" />")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/tech/workshop\" />")
                .contains("<p class=\"entity-page__meta\">Technology • Category: Economy</p>")
                .contains("<h1 class=\"seo-heading entity-page__title\">Workshop</h1>")
                .contains("<section class=\"seo-section entity-page__section entity-page__description\"> <h2 class=\"seo-heading\">Description</h2>")
                .contains("<li>+2 Industry per District Level</li>")
                .contains("<section class=\"seo-section entity-page__section entity-page__references\"> <h2 class=\"seo-heading\">Related</h2>")
                .contains("<a class=\"seo-chip\" href=\"/encyclopedia/units/sentinel\" data-entry-key=\"Unit_Sentinel\">Sentinel</a>")
                .doesNotContain("Missing_Key");

        assertAnalyticsBeacon(html);
    }

    @Test
    void tracksEncyclopediaIndexAndCategoryEntryPages() {
        assertAnalyticsBeacon(renderer.renderEncyclopediaRootHtml(List.of()));
        assertAnalyticsBeacon(renderer.renderEncyclopediaKindHtml("tech", List.of()));
    }

    private static void assertAnalyticsBeacon(String html) {
        String beacon = "<script defer src=\"https://static.cloudflareinsights.com/beacon.min.js\" "
                + "data-cf-beacon='{\"token\": \"ddf9aa99d6af4a199aceb33b44806912\"}'></script>";
        assertThat(html).containsOnlyOnce(beacon);
        assertThat(html.indexOf(beacon)).isLessThan(html.indexOf("</head>"));
    }

    private static String normalizeHtml(String html) {
        return html.replaceAll(">\\s+<", "> <")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
