package ewshop.domain.service;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.repository.SavedTechBuildRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class SavedTechBuildService {

    private final SavedTechBuildRepository buildRepository;

    public SavedTechBuildService(SavedTechBuildRepository buildRepository) {
        this.buildRepository = buildRepository;
    }

    /**
     * Saves a new tech build in the domain.
     */
    public SavedTechBuild save(SavedTechBuild build) {
        return buildRepository.save(build);
    }

    /**
     * Finds a saved build by UUID.
     */
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        return buildRepository.findByUuid(uuid);
    }
}
