package ewshop.app.config;

import ewshop.app.seo.SeoOutputLocator;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@Controller
public class FrontendController {

    private static final Pattern SEO_ROUTE_SEGMENT_PATTERN = Pattern.compile("[a-z][a-z0-9-]*");

    private final SeoOutputLocator seoOutputLocator;

    public FrontendController(SeoOutputLocator seoOutputLocator) {
        this.seoOutputLocator = seoOutputLocator;
    }

    @RequestMapping(value = {"", "/", "/admin/import", "/admin/import/"})
    public String forwardIndexDocument() {
        return "forward:/index.html";
    }

    @RequestMapping(value = {
            "/{page:tech|units|summary|codex|mods|info}",
            "/{page:tech|units|summary|codex|mods|info}/"
    })
    public String forwardStaticEntryDocument(@PathVariable String page) {
        return switch (page) {
            case "tech" -> "forward:/tech.html";
            case "units" -> "forward:/units.html";
            case "summary" -> "forward:/summary.html";
            case "codex" -> "forward:/codex.html";
            case "mods" -> "forward:/mods.html";
            case "info" -> "forward:/info.html";
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        };
    }

    @RequestMapping(value = {"/encyclopedia", "/encyclopedia/"})
    public String forwardGeneratedEncyclopediaIndex() {
        if (seoOutputLocator.hasGeneratedIndex("encyclopedia")) {
            return "forward:" + seoOutputLocator.getGeneratedForwardPath("encyclopedia");
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @RequestMapping(value = {
            "/{page:[a-z][a-z0-9-]*}/{entryKey:[a-z0-9-]+}",
            "/{page:[a-z][a-z0-9-]*}/{entryKey:[a-z0-9-]+}/"
    })
    public String forwardFeaturedEntityDocument(@PathVariable String page, @PathVariable String entryKey) {
        validateSeoRouteSegment(page);
        validateSeoRouteSegment(entryKey);

        if (seoOutputLocator.hasGeneratedFeaturedEntity(page, entryKey)) {
            return "forward:" + seoOutputLocator.getGeneratedForwardPath(page, entryKey);
        }

        if (seoOutputLocator.isRuntimeOwnedFeaturedEntity(page, entryKey)
                && !seoOutputLocator.isClasspathFallbackEnabled()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        Resource classpathFallback = new ClassPathResource("static/" + page + "/" + entryKey + "/index.html");
        if (!classpathFallback.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return "forward:/" + page + "/" + entryKey + "/index.html";
    }

    private static void validateSeoRouteSegment(String value) {
        if (!SEO_ROUTE_SEGMENT_PATTERN.matcher(value).matches()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
