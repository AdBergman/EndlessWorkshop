package ewshop.infrastructure.persistence.adapters;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.repository.SavedTechBuildRepository;
import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import ewshop.infrastructure.persistence.mappers.SavedTechBuildMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataSavedTechBuildRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Repository
public class SavedTechBuildRepositoryAdapter implements SavedTechBuildRepository {

    private final SpringDataSavedTechBuildRepository springDataRepository;
    private final SavedTechBuildMapper mapper;

    // Caffeine cache: max size 1000, no TTL/eviction
    private final Cache<UUID, SavedTechBuild> cache = Caffeine.newBuilder()
            .maximumSize(1000)
            .build();

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

        // update cache
        cache.put(domain.getUuid(), domain);

        return domain;
    }

    @Override
    public Optional<SavedTechBuild> findByUuid(UUID uuid) {
        // lazy cache population
        return Optional.ofNullable(
                cache.get(uuid, key -> springDataRepository.findByUuid(key)
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
        cache.invalidateAll();
    }

    // optional: manual eviction
    public void evict(UUID uuid) {
        cache.invalidate(uuid);
    }

    // optional: access the underlying cache map if needed
    public ConcurrentMap<UUID, SavedTechBuild> asMap() {
        return cache.asMap();
    }
}
