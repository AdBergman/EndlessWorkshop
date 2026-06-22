package ewshop.facade.interfaces;

import ewshop.facade.dto.response.HeroDto;

import java.util.List;

public interface HeroFacade {
    List<HeroDto> getAllHeroes();
}
