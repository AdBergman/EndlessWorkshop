package ewshop.facade.impl;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.service.SavedTechBuildService;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import ewshop.facade.mapper.SavedTechBuildMapper;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SavedTechBuildFacadeImpl implements SavedTechBuildFacade {

    private final SavedTechBuildService buildService;

    public SavedTechBuildFacadeImpl(SavedTechBuildService buildService) {
        this.buildService = buildService;
    }

    @Override
    public SavedTechBuildDto createSavedBuild(CreateSavedTechBuildRequest request) {
        SavedTechBuild buildDomain = SavedTechBuildMapper.toDomain(request);
        SavedTechBuild savedBuild = buildService.save(buildDomain);
        return SavedTechBuildMapper.toDto(savedBuild);
    }

    @Override
    public Optional<SavedTechBuildDto> getSavedBuildByUuid(UUID uuid) {
        return buildService.findByUuid(uuid)
                .map(SavedTechBuildMapper::toDto);
    }
}
