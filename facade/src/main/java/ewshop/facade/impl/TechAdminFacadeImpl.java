package ewshop.facade.impl;

import ewshop.domain.service.TechService;
import ewshop.facade.dto.request.TechAdminDto;
import ewshop.facade.interfaces.TechAdminFacade;
import ewshop.facade.mapper.TechAdminMapper;

import java.util.List;

public class TechAdminFacadeImpl implements TechAdminFacade {

    private final TechService techService;

    public TechAdminFacadeImpl(TechService techService) {
        this.techService = techService;
    }

    @Override
    public void applyPlacementUpdates(List<TechAdminDto> techDtos) {
        if (techDtos == null || techDtos.isEmpty()) {
            return;
        }

        var updates = techDtos.stream()
                .map(TechAdminMapper::toDomain)
                .toList();

        techService.applyPlacementUpdates(updates);

        // warm cache immediately so next public read doesn't hit DB
        techService.getAllTechs();
    }
}