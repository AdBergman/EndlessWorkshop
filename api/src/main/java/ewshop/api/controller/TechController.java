package ewshop.api.controller;

import ewshop.facade.dto.TechDto;
import ewshop.facade.interfaces.TechFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TechController {

    private final TechFacade techFacade;  // <-- interface

    public TechController(TechFacade techFacade) {
        this.techFacade = techFacade;
    }

    @GetMapping("/api/techs")
    public List<TechDto> getAllTechs() {
        return techFacade.getAllTechs();
    }
}
