package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechUnlock;
import ewshop.domain.repository.TechUnlockRepository;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import ewshop.infrastructure.persistence.mappers.TechUnlockMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataDistrictRepository;
import ewshop.infrastructure.persistence.repositories.SpringDataImprovementRepository;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSpecializationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class TechUnlockRepositoryAdapter implements TechUnlockRepository {

    private static final Logger log = LoggerFactory.getLogger(TechUnlockRepositoryAdapter.class);

    private final SpringDataTechRepository techRepository;
    private final SpringDataDistrictRepository districtRepository;
    private final SpringDataImprovementRepository improvementRepository;
    private final SpringDataUnitSpecializationRepository unitSpecializationRepository;
    private final TechUnlockMapper mapper;

    public TechUnlockRepositoryAdapter(SpringDataTechRepository techRepository,
                                       SpringDataDistrictRepository districtRepository,
                                       SpringDataImprovementRepository improvementRepository,
                                       SpringDataUnitSpecializationRepository unitSpecializationRepository,
                                       TechUnlockMapper mapper) {
        this.techRepository = techRepository;
        this.districtRepository = districtRepository;
        this.improvementRepository = improvementRepository;
        this.unitSpecializationRepository = unitSpecializationRepository;
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
        // 1️⃣ Fetch the managed TechEntity
        TechEntity managedTechEntity = techRepository.findByName(tech.getName())
                .orElseThrow(() -> {
                    log.warn("Cannot update unlocks for a non-existent tech: {}", tech.getName());
                    return new IllegalStateException("Cannot update unlocks for a non-existent tech: " + tech.getName());
                });

        // 2️⃣ Clear existing unlocks for idempotency
        managedTechEntity.getUnlocks().clear();

        // 3️⃣ Map new domain unlocks to managed entities
        List<TechUnlockEntity> newUnlockEntities = unlocks.stream()
                .map(domainUnlock -> {
                    TechUnlockEntity entity = mapper.toEntity(domainUnlock);

                    // Mandatory back-reference
                    entity.setTech(managedTechEntity);

                    // ✅ Resolve relationships to MANAGED entities
                    if (domainUnlock.getImprovement() != null) {
                        improvementRepository.findByName(domainUnlock.getImprovement().getName())
                                .ifPresentOrElse(entity::setImprovement,
                                        () -> log.warn("Improvement not found: {}", domainUnlock.getImprovement().getName()));
                    }

                    if (domainUnlock.getDistrict() != null) {
                        districtRepository.findByName(domainUnlock.getDistrict().getName())
                                .ifPresentOrElse(entity::setDistrict,
                                        () -> log.warn("District not found: {}", domainUnlock.getDistrict().getName()));
                    }

                    if (domainUnlock.getUnitSpecialization() != null) {
                        unitSpecializationRepository.findByName(domainUnlock.getUnitSpecialization().getName())
                                .ifPresentOrElse(entity::setUnitSpecialization,
                                        () -> log.warn("UnitSpecialization not found: {}", domainUnlock.getUnitSpecialization().getName()));
                    }

//                   TO BE IMPLEMENTED LATER
//                    if (domainUnlock.getConvertor() != null) {
//                        // handle convertor if needed
//                    }
//
//                    if (domainUnlock.getTreaty() != null) {
//                        // handle treaty if needed
//                    }

                    return entity;
                })
                .toList();

        // 4️⃣ Count linked unit specializations after mapping
        final long linkedCount = newUnlockEntities.stream()
                .filter(e -> e.getUnitSpecialization() != null)
                .count();

        // 5️⃣ Add fully managed unlock entities to the TechEntity
        managedTechEntity.getUnlocks().addAll(newUnlockEntities);

        // 6️⃣ Logging
        log.info("Tech '{}' updated with {} unlocks ({} unit specializations linked).",
                tech.getName(), newUnlockEntities.size(), linkedCount);

        // 7️⃣ Done — transaction will flush changes automatically
    }

}
