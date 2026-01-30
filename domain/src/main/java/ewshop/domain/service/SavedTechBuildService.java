package ewshop.domain.service;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.repository.SavedTechBuildRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class SavedTechBuildService {

    private final SavedTechBuildRepository buildRepository;

    public SavedTechBuildService(SavedTechBuildRepository buildRepository) {
        this.buildRepository = buildRepository;
    }

    @Transactional
    public SavedTechBuild save(SavedTechBuild build) {
        return buildRepository.save(build);
    }

    @Transactional(readOnly = true)
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        return buildRepository.findByUuid(uuid);
    }
}
