package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class TechRepositoryAdapter implements TechRepository {

    private static final Logger log = LoggerFactory.getLogger(TechRepositoryAdapter.class);

    private final SpringDataTechRepository springDataTechRepository;
    private final TechMapper mapper;

    public TechRepositoryAdapter(SpringDataTechRepository springDataTechRepository, TechMapper mapper) {
        this.springDataTechRepository = springDataTechRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Tech> findAll() {
        return springDataTechRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Tech save(Tech tech) {
        var entityToSave = mapper.toEntity(tech);
        var savedEntity = springDataTechRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<Tech> techs) {
        var entities = techs.stream()
                .map(mapper::toEntity)
                .toList();
        springDataTechRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        springDataTechRepository.deleteAll();
    }

    /**
     * Updates the prerequisite and exclusion relationships for all technologies in a single transaction.
     * <p>
     * This method follows a proper JPA merge pattern by loading all managed entities,
     * updating their relationships in memory while they are attached to the Hibernate session,
     * and allowing dirty checking to automatically persist the changes upon transaction commit.
     *
     * @param techDomainMap A map where the key is the tech name and the value is the Tech
     *                      domain object containing the desired relationship state. This map
     *                      serves as the source of truth for setting the relationships.
     */
    @Override
    @Transactional
    public void updateRelationships(Map<String, Tech> techDomainMap) {
        // Step 1: Fetch all managed TechEntity objects from the database at once.
        List<TechEntity> allTechEntities = springDataTechRepository.findAll();

        // Step 2: Create a lookup map for efficient access to these managed entities by name.
        Map<String, TechEntity> managedEntityMap = allTechEntities.stream()
                .collect(Collectors.toMap(TechEntity::getName, entity -> entity));

        log.info("Beginning relationship update for {} technologies.", managedEntityMap.size());

        // Step 3: Iterate through the managed entities and update their relationships.
        managedEntityMap.forEach((techName, managedEntity) -> {
            Tech domainObject = techDomainMap.get(techName);
            if (domainObject == null) {
                return;
            }

            // Update the Prerequisite relationship
            updateSingleRelationship(managedEntity, domainObject.getPrereq(), managedEntityMap, "prereq");

            // Update the Excludes relationship
            updateSingleRelationship(managedEntity, domainObject.getExcludes(), managedEntityMap, "excludes");
        });

        // Step 4: No explicit save call is needed.
        log.info("Transaction completing. Hibernate will now persist all detected relationship updates.");
    }

    /**
     * Helper method to resolve and set a single relationship (prereq or excludes) on a managed entity.
     */
    private void updateSingleRelationship(TechEntity managedEntity, Tech relationshipDomain, Map<String, TechEntity> managedEntityMap, String relationshipType) {
        if (relationshipDomain != null && relationshipDomain.getName() != null) {
            TechEntity relationshipEntity = managedEntityMap.get(relationshipDomain.getName());
            if (relationshipEntity != null) {
                if ("prereq".equals(relationshipType)) {
                    managedEntity.setPrereq(relationshipEntity);
                } else {
                    managedEntity.setExcludes(relationshipEntity);
                }
            } else {
                log.warn("Could not find {} TechEntity with name '{}' for tech '{}'", relationshipType, relationshipDomain.getName(), managedEntity.getName());
            }
        } else {
            if ("prereq".equals(relationshipType)) {
                managedEntity.setPrereq(null);
            } else {
                managedEntity.setExcludes(null);
            }
        }
    }
}
