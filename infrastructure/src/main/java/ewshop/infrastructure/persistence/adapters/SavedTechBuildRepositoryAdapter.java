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
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class SavedTechBuildRepositoryAdapter implements SavedTechBuildRepository {

    private final SpringDataSavedTechBuildRepository springDataRepository;
    private final SavedTechBuildMapper mapper;

    // simple cache, does not spawn background threads
    private final ConcurrentHashMap<UUID, SavedTechBuild> cache = new ConcurrentHashMap<>();

    public SavedTechBuildRepositoryAdapter(SpringDataSavedTechBuildRepository springDataRepository,
                                           SavedTechBuildMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public SavedTechBuild save(SavedTechBuild build) {
        SavedTechBuildEntity entity = mapper.toEntity(build);
        SavedTechBuildEntity savedEntity = springDataRepository.save(entity);
        SavedTechBuild domain = mapper.toDomain(savedEntity);

        cache.put(domain.getUuid(), domain);

        return domain;
    }

    @Override
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        return Optional.ofNullable(
                cache.computeIfAbsent(uuid, key ->
                        springDataRepository.findByUuid(key)
                                .map(mapper::toDomain)
                                .orElse(null))
        );
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
        cache.clear();
    }

}

