package ewshop.facade.impl;

import ewshop.domain.service.UnitService;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import ewshop.facade.mapper.UnitMapper;

import java.util.List;

public class UnitFacadeImpl implements UnitFacade {

    private final UnitService unitService;

    public UnitFacadeImpl(UnitService unitService) {
        this.unitService = unitService;
    }

    @Override
    public List<UnitDto> getAllUnits() {
        return unitService.getAllUnits().stream()
                .map(UnitMapper::toDto)
                .toList();
    }
}