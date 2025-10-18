package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    /**
     * Catch-all mapping for React routes.
     *
     * Rules:
     * 1. Forward all non-API requests to index.html for React Router.
     * 2. Skip static resources (files with dots like .js, .css, .png).
     * 3. No path variables declared → no Qodana warnings.
     */
    @RequestMapping(value = "/**")
    public String forward() {
        return "forward:/index.html";
    }
}
