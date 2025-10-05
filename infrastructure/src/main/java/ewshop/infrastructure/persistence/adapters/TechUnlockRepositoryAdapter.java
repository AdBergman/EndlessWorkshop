package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.District;
import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechUnlock;
import ewshop.domain.repository.TechUnlockRepository;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import ewshop.infrastructure.persistence.mappers.TechUnlockMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataDistrictRepository;
import ewshop.infrastructure.persistence.repositories.SpringDataImprovementRepository;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TechUnlockRepositoryAdapter implements TechUnlockRepository {

    private static final Logger log = LoggerFactory.getLogger(TechUnlockRepositoryAdapter.class);

    private final SpringDataTechRepository techRepository;
    private final SpringDataDistrictRepository districtRepository;
    private final SpringDataImprovementRepository improvementRepository;
    private final TechUnlockMapper mapper;

    public TechUnlockRepositoryAdapter(
            SpringDataTechRepository techRepository,
            SpringDataDistrictRepository districtRepository,
            SpringDataImprovementRepository improvementRepository,
            TechUnlockMapper mapper
    ) {
        this.techRepository = techRepository;
        this.districtRepository = districtRepository;
        this.improvementRepository = improvementRepository;
        this.mapper = mapper;
    }

    /**
     * Replaces all existing unlocks for a given technology with a new set of unlocks.
     * This method is transactional and idempotent. It operates by fetching the managed
     * TechEntity and then resolving all relationships from the provided domain objects
     * into managed JPA entities before committing the transaction.
     *
     * @param tech    The domain object of the tech to update.
     * @param unlocks A list of domain TechUnlock objects representing the new set of unlocks.
     */
    @Override
    @Transactional
    public void updateUnlocksForTech(Tech tech, List<TechUnlock> unlocks) {
        // Step 1: Fetch the MANAGED TechEntity from the database. This is the root of our graph.
        TechEntity managedTechEntity = techRepository.findByName(tech.getName())
                .orElseThrow(() -> new IllegalStateException("Cannot update unlocks for a non-existent tech: " + tech.getName()));

        // Step 2: For idempotency, clear the existing collection of unlocks.
        // Hibernate will issue DELETE statements for the old unlocks (due to orphanRemoval=true).
        managedTechEntity.getUnlocks().clear();

        // Step 3: Map the new domain unlocks to entities, resolving relationships along the way.
        List<TechUnlockEntity> newUnlockEntities = unlocks.stream()
                .map(domainUnlock -> {
                    // Map the basic fields from the domain object to a new entity.
                    TechUnlockEntity newUnlockEntity = mapper.toEntity(domainUnlock);

                    // Set the mandatory back-reference to the managed parent tech entity.
                    newUnlockEntity.setTech(managedTechEntity);

                    // --- This is the CRITICAL part for avoiding TransientObjectException ---
                    // Resolve relationships by fetching the MANAGED entity for each one.
                    if (domainUnlock.getImprovement() != null) {
                        Improvement improvement = domainUnlock.getImprovement();
                        ImprovementEntity managedImprovement = improvementRepository.findByName(improvement.getName())
                                .orElse(null);
                        newUnlockEntity.setImprovement(managedImprovement);
                    }

                    if (domainUnlock.getDistrict() != null) {
                        District district = domainUnlock.getDistrict();
                        DistrictEntity managedDistrict = districtRepository.findByName(district.getName())
                                .orElse(null);
                        newUnlockEntity.setDistrict(managedDistrict);
                    }

                    return newUnlockEntity;
                })
                .collect(Collectors.toList());

        // Step 4: Add the new, fully-managed unlock entities to the parent's collection.
        managedTechEntity.getUnlocks().addAll(newUnlockEntities);

        // Step 5: No explicit save is needed. When the @Transactional method completes,
        // Hibernate's dirty checking will detect the changes to the 'unlocks' collection
        // and persist all inserts/deletes.
    }
}
