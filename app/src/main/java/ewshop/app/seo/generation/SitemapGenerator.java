package ewshop.app.seo.generation;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;

@Component
public class SitemapGenerator {

    public String generate(List<String> generatedRoutes) {
        LinkedHashSet<String> allPaths = new LinkedHashSet<>(SeoRoutes.INDEXABLE_PUBLIC_ROUTE_PATHS);
        allPaths.addAll(generatedRoutes);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String path : allPaths) {
            xml.append("    <url>\n");
            xml.append("        <loc>").append(SeoRoutes.SITE_URL).append(path).append("</loc>\n");
            xml.append("    </url>\n");
        }
        xml.append("</urlset>\n");
        return xml.toString();
    }
}
