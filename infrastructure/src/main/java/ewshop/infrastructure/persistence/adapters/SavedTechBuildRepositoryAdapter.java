package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.repository.SavedTechBuildRepository;
import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import ewshop.infrastructure.persistence.mappers.SavedTechBuildMapper;
import ewshop.infrastructure.persistence.repositories.SavedTechBuildJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class SavedTechBuildRepositoryAdapter implements SavedTechBuildRepository {

    private final SavedTechBuildJpaRepository springDataRepository;
    private final SavedTechBuildMapper mapper;

    public SavedTechBuildRepositoryAdapter(SavedTechBuildJpaRepository springDataRepository,
                                           SavedTechBuildMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public SavedTechBuild save(SavedTechBuild build) {
        SavedTechBuildEntity entity = mapper.toEntity(build);
        SavedTechBuildEntity savedEntity = springDataRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        return springDataRepository.findByUuid(uuid)
                .map(mapper::toDomain);
    }

    @Override
    public List<SavedTechBuild> findAll() {
        return springDataRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAll() {
        springDataRepository.deleteAll();
    }
}
