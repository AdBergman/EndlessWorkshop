package ewshop.app.seo.generation;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SitemapRoutePolicy {

    public List<String> routesFor(List<String> generatedRoutes, List<PageCandidate> candidates) {
        List<String> publicGeneratedRoutes = generatedRoutes.stream()
                .filter(SitemapRoutePolicy::isPublicGeneratedRoute)
                .toList();
        List<String> indexableCandidateRoutes = candidates.stream()
                .filter(PageCandidate::indexable)
                .map(PageCandidate::route)
                .sorted()
                .toList();

        List<String> sitemapRoutes = new ArrayList<>(publicGeneratedRoutes);
        sitemapRoutes.addAll(indexableCandidateRoutes);
        return List.copyOf(sitemapRoutes);
    }

    private static boolean isPublicGeneratedRoute(String route) {
        return route.equals("/" + SeoRoutes.ENCYCLOPEDIA_PAGE) || route.split("/").length == 3;
    }
}
