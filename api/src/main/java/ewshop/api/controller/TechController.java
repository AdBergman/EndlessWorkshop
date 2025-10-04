package ewshop.api.controller;

import ewshop.facade.impl.TechFacadeImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TechController {

    private final TechFacadeImpl techFacade;

    public TechController(TechFacadeImpl techFacade) {
        this.techFacade = techFacade;
    }

    @GetMapping("/api/techs")
    public List<String> getAllTechNames() {
        return techFacade.getAllTechNames();
    }
}