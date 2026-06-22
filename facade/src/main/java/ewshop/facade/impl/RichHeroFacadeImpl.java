package ewshop.facade.impl;

import ewshop.domain.service.RichHeroService;
import ewshop.facade.dto.response.RichHeroDto;
import ewshop.facade.interfaces.RichHeroFacade;
import ewshop.facade.mapper.RichHeroMapper;

import java.util.List;

public class RichHeroFacadeImpl implements RichHeroFacade {

    private final RichHeroService richHeroService;

    public RichHeroFacadeImpl(RichHeroService richHeroService) {
        this.richHeroService = richHeroService;
    }

    @Override
    public List<RichHeroDto> getAllHeroes() {
        return richHeroService.getAllHeroes().stream()
                .map(RichHeroMapper::toDto)
                .toList();
    }
}
