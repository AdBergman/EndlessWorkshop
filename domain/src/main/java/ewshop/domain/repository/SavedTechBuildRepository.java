package ewshop.domain.repository;

import ewshop.domain.model.SavedTechBuild;

import java.util.Optional;
import java.util.UUID;

public interface SavedTechBuildRepository {

    SavedTechBuild save(SavedTechBuild build);

    Optional<SavedTechBuild> findByUuid(UUID uuid);
}
