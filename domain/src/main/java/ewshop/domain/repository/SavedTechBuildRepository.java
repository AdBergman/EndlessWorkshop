package ewshop.domain.repository;

import ewshop.domain.entity.SavedTechBuild;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedTechBuildRepository {

    SavedTechBuild save(SavedTechBuild build);

    Optional<SavedTechBuild> findByUuid(UUID uuid);

    List<SavedTechBuild> findAll();

    void deleteAll();
}
