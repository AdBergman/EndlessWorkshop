package ewshop.facade.interfaces;



import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;

import java.util.Optional;
import java.util.UUID;

public interface SavedTechBuildFacade {

    SavedTechBuildDto createSavedBuild(CreateSavedTechBuildRequest request);

    Optional<SavedTechBuildDto> getSavedBuildByUuid(UUID uuid);
}
