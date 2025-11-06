package ewshop.facade.impl;

import ewshop.domain.service.UnitSpecializationService;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import ewshop.facade.mapper.UnitDtoPostProcessor;
import ewshop.facade.mapper.UnitMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UnitFacadeImpl implements UnitFacade {

    private final UnitSpecializationService unitService;
    private final UnitDtoPostProcessor postProcessor;

    public UnitFacadeImpl(UnitSpecializationService unitService, UnitDtoPostProcessor postProcessor) {
        this.unitService = unitService;
        this.postProcessor = postProcessor;
    }

    @Override
    public List<UnitDto> getAllUnits() {
        List<UnitDto> dtos = unitService.getAllUnits().stream()
                .map(UnitMapper::toDto)
                .toList();

        return postProcessor.attachUpgradesFrom(dtos);
    }
}
