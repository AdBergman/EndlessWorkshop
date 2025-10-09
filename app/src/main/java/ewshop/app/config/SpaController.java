package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = {"/", "/info", "/city-planner"})
    public String index() {
        return "index.html"; // serves frontend/dist/index.html
    }
}
