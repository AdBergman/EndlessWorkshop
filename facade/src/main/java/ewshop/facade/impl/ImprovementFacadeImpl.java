package ewshop.facade.impl;

import ewshop.domain.service.ImprovementService;
import ewshop.facade.dto.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import ewshop.facade.mapper.ImprovementMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
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
