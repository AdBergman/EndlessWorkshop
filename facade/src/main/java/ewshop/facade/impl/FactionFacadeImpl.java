package ewshop.facade.impl;

import ewshop.domain.service.FactionService;
import ewshop.facade.dto.response.FactionDto;
import ewshop.facade.interfaces.FactionFacade;
import ewshop.facade.mapper.FactionMapper;

import java.util.List;

public class FactionFacadeImpl implements FactionFacade {

    private final FactionService factionService;

    public FactionFacadeImpl(FactionService factionService) {
        this.factionService = factionService;
    }

    @Override
    public List<FactionDto> getAllFactions() {
        return factionService.getAllFactions().stream()
                .map(FactionMapper::toDto)
                .toList();
    }
}
