package ewshop.app.seo;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.SitemapRoutePolicy;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SitemapRoutePolicyTest {

    private final SitemapRoutePolicy sitemapRoutePolicy = new SitemapRoutePolicy();

    @Test
    void includesPublicGeneratedRoutesAndIndexableCandidatesOnly() {
        List<String> generatedRoutes = List.of(
                "/encyclopedia",
                "/encyclopedia/tech",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/tech/workshop/duplicate-variant",
                "/codex-missing-references-audit"
        );
        List<PageCandidate> candidates = List.of(
                pageCandidate("/encyclopedia/tech/workshop", true),
                pageCandidate("/encyclopedia/tech/workshop/duplicate-variant", false),
                pageCandidate("/encyclopedia/units/sentinel", true)
        );

        assertThat(sitemapRoutePolicy.routesFor(generatedRoutes, candidates)).containsExactly(
                "/encyclopedia",
                "/encyclopedia/tech",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units/sentinel"
        );
    }

    private static PageCandidate pageCandidate(String route, boolean indexable) {
        return new PageCandidate(
                "tech",
                "Technology_Workshop",
                "Workshop",
                "",
                "",
                List.of("Workshop improves early city industry."),
                List.of(),
                "workshop",
                "",
                route,
                route,
                indexable,
                "",
                List.of()
        );
    }
}
