package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    /**
     * Catch-all mapping for React routes.

     */
    @RequestMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api).*}/{subPath:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
