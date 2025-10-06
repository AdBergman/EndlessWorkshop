package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.repository.SavedTechBuildRepository;
import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import ewshop.infrastructure.persistence.mappers.SavedTechBuildMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataSavedTechBuildRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class SavedTechBuildRepositoryAdapter implements SavedTechBuildRepository {

    private final SpringDataSavedTechBuildRepository jpaRepository;
    private final SavedTechBuildMapper mapper;

    public SavedTechBuildRepositoryAdapter(SpringDataSavedTechBuildRepository jpaRepository,
                                           SavedTechBuildMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public SavedTechBuild save(SavedTechBuild build) {
        SavedTechBuildEntity entity = mapper.toEntity(build);
        SavedTechBuildEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        return jpaRepository.findByUuid(uuid)
                .map(mapper::toDomain);
    }

    @Override
    public List<SavedTechBuild> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
}
