package ewshop.app.config;

import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class FrontendController {

    private final ResourceLoader resourceLoader;

    public FrontendController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
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
        return "forward:/" + page + ".html";
    }

    @RequestMapping(value = {
            "/{page:tech|units}/{entryKey:[a-z0-9-]+}",
            "/{page:tech|units}/{entryKey:[a-z0-9-]+}/"
    })
    public String forwardFeaturedEntityDocument(@PathVariable String page, @PathVariable String entryKey) {
        String resourcePath = "classpath:/static/" + page + "/" + entryKey + "/index.html";
        if (!resourceLoader.getResource(resourcePath).exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return "forward:/" + page + "/" + entryKey + "/index.html";
    }
}
