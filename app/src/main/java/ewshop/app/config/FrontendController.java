package ewshop.app.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = {"/{path:[^\\.]*}", "/{path:^(?!api).*}/{subPath:[^\\.]*}"})
    public String forward() {
        // Forward to index.html so React Router can handle it
        return "forward:/index.html";
    }
}
