package ewshop.facade.impl;

import ewshop.domain.service.UnitSpecializationService;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import ewshop.facade.mapper.UnitMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UnitFacadeImpl implements UnitFacade {

    private final UnitSpecializationService unitService;

    public UnitFacadeImpl(UnitSpecializationService unitService) {
        this.unitService = unitService;
    }

    @Override
    public List<UnitDto> getAllUnits() {
        return unitService.getAllUnits().stream()
                .map(UnitMapper::toDto)
                .toList();
    }
}
