package ewshop.facade.impl;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.service.SavedTechBuildService;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import ewshop.facade.mapper.SavedTechBuildMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SavedTechBuildFacadeImpl implements SavedTechBuildFacade {

    private static final Logger log = LoggerFactory.getLogger(SavedTechBuildFacadeImpl.class);

    private final SavedTechBuildService buildService;

    public SavedTechBuildFacadeImpl(SavedTechBuildService buildService) {
        this.buildService = buildService;
    }

    @Override
    public SavedTechBuildDto createSavedBuild(CreateSavedTechBuildRequest request) {
        SavedTechBuild buildDomain = SavedTechBuildMapper.toDomain(request);
        SavedTechBuild savedBuild = buildService.save(buildDomain);
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedBuild);
        log.info("Created saved tech build uuid={} for faction={}", dto.uuid(), dto.selectedFaction());
        return dto;
    }

    @Override
    public Optional<SavedTechBuildDto> getSavedBuildByUuid(UUID uuid) {
        Optional<SavedTechBuildDto> result = buildService.findByUuid(uuid)
                .map(SavedTechBuildMapper::toDto);

        if (result.isEmpty()) {
            log.warn("Saved tech build not found for uuid={}", uuid);
        }
        // Removed the debug log for successful fetch as per clarification.
        return result;
    }
}
