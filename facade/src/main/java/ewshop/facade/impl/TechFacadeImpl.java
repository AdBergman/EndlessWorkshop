package ewshop.facade.impl;

import ewshop.domain.service.TechService;
import ewshop.facade.dto.response.TechDto;
import ewshop.facade.interfaces.TechFacade;
import ewshop.facade.mapper.TechMapper;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring-agnostic facade implementation.
 */
public class TechFacadeImpl implements TechFacade {

    private final TechService techService;

    public TechFacadeImpl(TechService techService) {
        this.techService = techService;
    }

    @Override
    public List<TechDto> getAllTechs() {
        return techService.getAllTechs()
                .stream()
                .map(TechMapper::toDto)
                .collect(Collectors.toList());
    }
}
