package ewshop.facade.interfaces;

import ewshop.facade.dto.response.RichHeroDto;

import java.util.List;

public interface RichHeroFacade {
    List<RichHeroDto> getAllHeroes();
}
