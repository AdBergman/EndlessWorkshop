package ewshop.app.seo.generation;

import java.nio.file.Path;
import java.util.List;

public final class SeoRoutes {

    public static final String TECH_KIND = "tech";
    public static final String UNITS_KIND = "units";
    public static final String ENCYCLOPEDIA_PAGE = "encyclopedia";
    public static final String SITE_NAME = "Endless Workshop";
    public static final String SITE_URL = "https://endlessworkshop.dev";
    public static final String DEFAULT_IMAGE_URL = SITE_URL + "/logo512.png";
    public static final List<String> INDEXABLE_PUBLIC_ROUTE_PATHS = List.of(
            "/tech",
            "/units",
            "/codex",
            "/summary",
            "/mods",
            "/info"
    );

    private SeoRoutes() {
    }

    public static String routeFor(String kind, String slug) {
        return "/" + ENCYCLOPEDIA_PAGE + "/" + kind + "/" + slug;
    }

    public static String encyclopediaRouteFor(String kind) {
        return "/" + ENCYCLOPEDIA_PAGE + "/" + kind;
    }

    public static String routeForGeneratedIndex(Path relativePath) {
        if (relativePath.getNameCount() == 2 && "index.html".equals(relativePath.getName(1).toString())) {
            return "/" + relativePath.getName(0);
        }

        if (relativePath.getNameCount() == 3
                && ENCYCLOPEDIA_PAGE.equals(relativePath.getName(0).toString())
                && "index.html".equals(relativePath.getName(2).toString())) {
            return encyclopediaRouteFor(relativePath.getName(1).toString());
        }

        if (relativePath.getNameCount() == 3 && "index.html".equals(relativePath.getName(2).toString())) {
            return routeFor(relativePath.getName(0).toString(), relativePath.getName(1).toString());
        }

        if (relativePath.getNameCount() == 4
                && ENCYCLOPEDIA_PAGE.equals(relativePath.getName(0).toString())
                && "index.html".equals(relativePath.getName(3).toString())) {
            return routeFor(relativePath.getName(1).toString(), relativePath.getName(2).toString());
        }

        return "";
    }
}
