package ewshop.facade.impl;

import ewshop.domain.service.HeroService;
import ewshop.facade.dto.response.HeroDto;
import ewshop.facade.interfaces.HeroFacade;
import ewshop.facade.mapper.HeroMapper;

import java.util.List;

public class HeroFacadeImpl implements HeroFacade {

    private final HeroService heroService;

    public HeroFacadeImpl(HeroService heroService) {
        this.heroService = heroService;
    }

    @Override
    public List<HeroDto> getAllHeroes() {
        return heroService.getAllHeroes().stream()
                .map(HeroMapper::toDto)
                .toList();
    }
}
