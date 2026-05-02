package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = {
            "/{page:tech|units|summary|codex|mods|info}",
            "/{page:tech|units|summary|codex|mods|info}/"
    })
    public String forwardStaticEntryDocument(@PathVariable String page) {
        return "forward:/" + page + ".html";
    }

    /**
     * Catch-all mapping for React routes.

     */
    @RequestMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api).*}/{subPath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
