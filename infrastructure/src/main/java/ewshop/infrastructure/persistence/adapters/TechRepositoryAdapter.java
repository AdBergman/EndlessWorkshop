package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class TechRepositoryAdapter implements TechRepository {

    private static final Logger log = LoggerFactory.getLogger(TechRepositoryAdapter.class);

    private final TechJpaRepository techJpaRepository;
    private final TechMapper mapper;

    public TechRepositoryAdapter(TechJpaRepository techJpaRepository, TechMapper mapper) {
        this.techJpaRepository = techJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Tech> findAll() {
        return techJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Tech save(Tech tech) {
        var entityToSave = mapper.toEntity(tech);
        var savedEntity = techJpaRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<Tech> techs) {
        var entities = techs.stream()
                .map(mapper::toEntity)
                .toList();
        techJpaRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        techJpaRepository.deleteAll();
    }

    @Override
    public void updateEraAndCoordsByNameAndType(TechPlacementUpdate update) {
        int updated = techJpaRepository.updateEraAndCoordsByNameAndType(
                update.name(),
                update.type(),
                update.era(),
                update.coords()
        );
        if (updated != 1) {
            log.warn("Expected to update 1 tech for name='{}' and type='{}' but updated {}",
                    update.name(), update.type(), updated);
        }
    }

    @Override
    @Transactional
    public void importTechSnapshot(List<TechImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return;
        }

        var techKeys = snapshots.stream()
                .map(TechImportSnapshot::techKey)
                .toList();

        var existingByKey = techJpaRepository.findAllByTechKeyIn(techKeys).stream()
                .collect(Collectors.toMap(
                        TechEntity::getTechKey,
                        Function.identity()
                ));

        for (TechImportSnapshot snapshot : snapshots) {
            TechEntity entity = existingByKey.get(snapshot.techKey());

            if (entity == null) {
                entity = new TechEntity();
                entity.setTechKey(snapshot.techKey());
            }

            // --- curated / fill-missing-only fields ---

            // name: only fill if missing AND snapshot has something meaningful
            if ((entity.getName() == null || entity.getName().isBlank())
                    && snapshot.displayName() != null && !snapshot.displayName().isBlank()) {
                entity.setName(snapshot.displayName());
            }

            // coords: only fill if missing (new techs get 0,0 via snapshot invariant)
            if (entity.getTechCoords() == null) {
                entity.setTechCoords(snapshot.techCoords());
            }

            // --- baseline fields (safe to refresh) ---
            entity.setLore(snapshot.lore());
            entity.setHidden(snapshot.hidden());
            entity.setEra(snapshot.era());
            entity.setType(snapshot.type());

            techJpaRepository.save(entity);

            // keep map consistent in case of repeated keys in input list
            existingByKey.put(entity.getTechKey(), entity);
        }
    }
}