package ewshop.facade.impl;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.service.SavedTechBuildService;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import ewshop.facade.mapper.SavedTechBuildMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class SavedTechBuildFacadeImpl implements SavedTechBuildFacade {

    private static final Logger log = LoggerFactory.getLogger(SavedTechBuildFacadeImpl.class);
    private static final int MAX_TECH_IDS = 512;
    private static final int MAX_TECH_ID_LENGTH = 128;

    private final SavedTechBuildService buildService;

    public SavedTechBuildFacadeImpl(SavedTechBuildService buildService) {
        this.buildService = buildService;
    }

    @Override
    public SavedTechBuildDto createSavedBuild(CreateSavedTechBuildRequest request) {
        CreateSavedTechBuildRequest normalizedRequest = normalizeRequest(request);
        SavedTechBuild buildDomain = SavedTechBuildMapper.toDomain(normalizedRequest);
        SavedTechBuild savedBuild = buildService.save(buildDomain);
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedBuild);
        log.info("Created saved tech build uuid={} for majorFaction={}", dto.uuid(), dto.selectedFaction());
        return dto;
    }

    @Override
    public Optional<SavedTechBuildDto> getSavedBuildByUuid(UUID uuid) {
        Optional<SavedTechBuildDto> result = buildService.findByUuid(uuid)
                .map(SavedTechBuildMapper::toDto);

        if (result.isEmpty()) {
            log.warn("Saved tech build not found for uuid={}", uuid);
        }
        return result;
    }

    private static CreateSavedTechBuildRequest normalizeRequest(CreateSavedTechBuildRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Saved tech build request is required");
        }

        String selectedFaction = trimToNull(request.selectedFaction());
        if (selectedFaction == null) {
            throw new IllegalArgumentException("selectedFaction is required");
        }

        List<String> rawTechIds = request.techIds();
        if (rawTechIds == null) {
            throw new IllegalArgumentException("techIds is required");
        }
        if (rawTechIds.size() > MAX_TECH_IDS) {
            throw new IllegalArgumentException("techIds must contain at most " + MAX_TECH_IDS + " entries");
        }

        List<String> normalizedTechIds = normalizeTechIds(rawTechIds);

        return new CreateSavedTechBuildRequest(
                request.name() == null ? "" : request.name().trim(),
                selectedFaction,
                List.copyOf(normalizedTechIds)
        );
    }

    private static List<String> normalizeTechIds(List<String> rawTechIds) {
        List<String> normalizedTechIds = new ArrayList<>(rawTechIds.size());
        for (String techId : rawTechIds) {
            if (techId == null) {
                throw new IllegalArgumentException("techIds must not contain null entries");
            }
            String normalizedTechId = techId.trim();
            if (normalizedTechId.isEmpty()) {
                continue;
            }
            if (normalizedTechId.length() > MAX_TECH_ID_LENGTH) {
                throw new IllegalArgumentException("techIds entries must be at most " + MAX_TECH_ID_LENGTH + " characters");
            }
            normalizedTechIds.add(normalizedTechId);
        }
        return normalizedTechIds;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
