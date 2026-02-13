package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.model.results.TechImportResult;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional
    public TechImportResult importTechSnapshot(List<TechImportSnapshot> snapshots) {
        TechImportResult result = new TechImportResult();

        var techKeys = snapshots.stream()
                .map(TechImportSnapshot::techKey)
                .toList();

        Map<String, TechEntity> existingByKey = techJpaRepository.findAllByTechKeyIn(techKeys).stream()
                .collect(Collectors.toMap(
                        TechEntity::getTechKey,
                        Function.identity()
                ));

        List<TechEntity> toSave = new java.util.ArrayList<>();

        for (TechImportSnapshot snapshot : snapshots) {
            TechEntity entity = existingByKey.get(snapshot.techKey());
            boolean isInsert = (entity == null);

            if (isInsert) {
                entity = new TechEntity();
                entity.setTechKey(snapshot.techKey());
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

            switch (outcome) {
                case INSERTED -> {
                    toSave.add(entity);
                    result.incrementInserted();
                }
                case UPDATED -> {
                    toSave.add(entity);
                    result.incrementUpdated();
                }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            techJpaRepository.saveAll(toSave);
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(TechEntity entity, TechImportSnapshot update, boolean isInsert) {
        boolean changed = isInsert;

        if ((entity.getName() == null || entity.getName().isBlank())
                && update.displayName() != null && !update.displayName().isBlank()) {
            entity.setName(update.displayName());
            changed = true;
        }

        if (entity.getTechCoords() == null) { entity.setTechCoords(update.techCoords()); changed = true; }
        if (!Objects.equals(entity.getLore(), update.lore())) { entity.setLore(update.lore()); changed = true; }

        Boolean hiddenDb = entity.isHidden();              // nullable
        boolean hiddenDbVal = Boolean.TRUE.equals(hiddenDb);
        boolean hiddenNewVal = update.hidden();

        if (hiddenDb == null || hiddenDbVal != hiddenNewVal) {
            entity.setHidden(hiddenNewVal);
            changed = true;
        }

        if (entity.getEra() != update.era()) { entity.setEra(update.era()); changed = true; }
        if (entity.getType() != update.type()) { entity.setType(update.type()); changed = true; }

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }
}