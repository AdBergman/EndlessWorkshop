package ewshop.facade.interfaces;



import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;

import java.util.Optional;
import java.util.UUID;

/**
 * Facade interface for saving and loading shared tech builds.
 */
public interface SavedTechBuildFacade {

    /**
     * Creates and saves a new shared tech build.
     *
     * @param request DTO with the name (optional) and tech IDs
     * @return the persisted build including its generated UUID
     */
    SavedTechBuildDto createSavedBuild(CreateSavedTechBuildRequest request);

    /**
     * Retrieves a saved build by its UUID.
     *
     * @param uuid the build UUID
     * @return optional containing the build if found
     */
    Optional<SavedTechBuildDto> getSavedBuildByUuid(UUID uuid);
}
