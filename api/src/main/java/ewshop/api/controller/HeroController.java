package ewshop.api.controller;

import ewshop.facade.dto.response.HeroDto;
import ewshop.facade.interfaces.HeroFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HeroController {

    private final HeroFacade heroFacade;

    public HeroController(HeroFacade heroFacade) {
        this.heroFacade = heroFacade;
    }

    @GetMapping("/api/heroes")
    public List<HeroDto> getAllHeroes() {
        return heroFacade.getAllHeroes();
    }
}
