package ewshop.facade.impl;

import ewshop.domain.service.ImprovementService;
import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import ewshop.facade.mapper.ImprovementMapper;

import java.util.List;

public class ImprovementFacadeImpl implements ImprovementFacade {

    private final ImprovementService improvementService;

    public ImprovementFacadeImpl(ImprovementService improvementService) {
        this.improvementService = improvementService;
    }

    @Override
    public List<ImprovementDto> getAllImprovements() {
        return improvementService.getAllImprovements().stream()
                .map(ImprovementMapper::toDto)
                .toList();
    }
}
