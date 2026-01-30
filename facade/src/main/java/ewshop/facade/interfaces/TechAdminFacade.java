package ewshop.facade.interfaces;

import ewshop.facade.dto.request.TechAdminDto;

import java.util.List;

public interface TechAdminFacade {

    void applyPlacementUpdates(List<TechAdminDto> techDtos);
}