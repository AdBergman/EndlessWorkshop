package ewshop.api.controller;

import ewshop.facade.dto.response.RichHeroDto;
import ewshop.facade.interfaces.RichHeroFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RichHeroController {

    private final RichHeroFacade richHeroFacade;

    public RichHeroController(RichHeroFacade richHeroFacade) {
        this.richHeroFacade = richHeroFacade;
    }

    @GetMapping("/api/heroes")
    public List<RichHeroDto> getAllHeroes() {
        return richHeroFacade.getAllHeroes();
    }
}
