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
     * Updates tech relationships (prerequisites and exclusions) in a single transaction.
     * This method loads all techs into the persistence context, updates their relationships in memory,
     * and relies on dirty checking to persist the changes.
     *
     * @param techDomainMap A map of tech names to Tech domain objects, serving as the source of truth.
     */
    @Override
    @Transactional
    public void updateRelationships(Map<String, Tech> techDomainMap) {
        List<TechEntity> allTechEntities = springDataTechRepository.findAll();

        Map<String, TechEntity> managedEntityMap = allTechEntities.stream()
                .collect(Collectors.toMap(TechEntity::getName, entity -> entity));

        log.info("Beginning relationship update for {} technologies.", managedEntityMap.size());

        managedEntityMap.forEach((techName, managedEntity) -> {
            Tech domainObject = techDomainMap.get(techName);
            if (domainObject == null) {
                return;
            }

            updateSingleRelationship(managedEntity, domainObject.getPrereq(), managedEntityMap, "prereq");
            updateSingleRelationship(managedEntity, domainObject.getExcludes(), managedEntityMap, "excludes");
        });
    }

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
