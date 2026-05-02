package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = {"/codex", "/codex/"})
    public String forwardCodex() {
        return "forward:/codex.html";
    }

    @RequestMapping(value = {"/mods", "/mods/"})
    public String forwardMods() {
        return "forward:/mods.html";
    }

    /**
     * Catch-all mapping for React routes.

     */
    @RequestMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api).*}/{subPath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
