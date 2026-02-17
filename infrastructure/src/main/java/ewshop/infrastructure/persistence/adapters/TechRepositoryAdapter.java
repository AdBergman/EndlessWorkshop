package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockRefEmbeddable;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
        return techJpaRepository.findAllForCache().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Tech save(Tech tech) {
        TechEntity entityToSave = mapper.toEntity(tech);
        TechEntity savedEntity = techJpaRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<Tech> techs) {
        List<TechEntity> entities = techs.stream()
                .map(mapper::toEntity)
                .toList();
        techJpaRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        techJpaRepository.deleteAll();
    }

    @Override
    public void updateEraAndCoordsByTechKey(TechPlacementUpdate update) {
        int updated = techJpaRepository.updateEraAndCoordsByTechKey(
                update.techKey(),
                update.era(),
                update.coords()
        );

        if (updated != 1) {
            log.warn("Expected to update 1 tech for techKey='{}' but updated {}",
                    update.techKey(), updated);
        }
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional
    public ImportResult importTechSnapshot(List<TechImportSnapshot> snapshots) {

        ImportResult result = new ImportResult();

        if (snapshots == null || snapshots.isEmpty()) {
            return result;
        }

        List<String> keepKeys = snapshots.stream()
                .map(TechImportSnapshot::techKey)
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all techs: keepKeys empty.");
        }

        Map<String, TechEntity> existingByKey =
                techJpaRepository.findAllByTechKeyIn(keepKeys).stream()
                        .collect(Collectors.toMap(TechEntity::getTechKey, Function.identity()));

        List<TechEntity> toSave = new ArrayList<>();

        for (TechImportSnapshot snapshot : snapshots) {

            TechEntity entity = existingByKey.get(snapshot.techKey());
            boolean isInsert = (entity == null);

            if (isInsert) {
                entity = new TechEntity();
                entity.setTechKey(snapshot.techKey());
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

            switch (outcome) {
                case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                case UPDATED  -> { toSave.add(entity); result.incrementUpdated(); }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            techJpaRepository.saveAll(toSave);
        }

        List<TechEntity> obsolete = techJpaRepository.findAllByTechKeyNotIn(keepKeys);

        if (!obsolete.isEmpty()) {

            List<Long> obsoleteIds = obsolete.stream()
                    .map(TechEntity::getId)
                    .filter(Objects::nonNull)
                    .toList();

            if (!obsoleteIds.isEmpty()) {
                techJpaRepository.clearExcludesRefsToTechIds(obsoleteIds);
                techJpaRepository.clearPrereqRefsToTechIds(obsoleteIds);
                techJpaRepository.flush();
            }

            techJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
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

        if (entity.getTechCoords() == null) {
            entity.setTechCoords(update.techCoords());
            changed = true;
        }

        if (!Objects.equals(entity.getLore(), update.lore())) {
            entity.setLore(update.lore());
            changed = true;
        }

        Boolean hiddenDb = entity.isHidden();
        boolean hiddenDbVal = Boolean.TRUE.equals(hiddenDb);
        boolean hiddenNewVal = update.hidden();

        if (hiddenDb == null || hiddenDbVal != hiddenNewVal) {
            entity.setHidden(hiddenNewVal);
            changed = true;
        }

        if (entity.getEra() != update.era()) {
            entity.setEra(update.era());
            changed = true;
        }

        if (entity.getType() != update.type()) {
            entity.setType(update.type());
            changed = true;
        }

        List<String> nextDescriptionLines = update.descriptionLines() == null ? List.of() : update.descriptionLines();
        List<String> currentDescriptionLines = entity.getDescriptionLines() == null ? List.of() : entity.getDescriptionLines();

        if (!currentDescriptionLines.equals(nextDescriptionLines)) {
            entity.setDescriptionLines(new ArrayList<>(nextDescriptionLines));
            changed = true;
        }

        List<TechUnlockRefEmbeddable> nextUnlocks = toUnlockEmbeddables(update.unlocks());
        List<TechUnlockRefEmbeddable> currentUnlocks = entity.getUnlocks() == null ? List.of() : entity.getUnlocks();

        if (!currentUnlocks.equals(nextUnlocks)) {
            entity.setUnlocks(new ArrayList<>(nextUnlocks));
            changed = true;
        }

        EnumSet<Faction> nextFactions = toEnumSet(update.availableFactions());
        EnumSet<Faction> currentFactions = toEnumSet(entity.getFactions());

        if (!currentFactions.equals(nextFactions)) {
            // Give Hibernate a mutable collection for dirty-tracking
            entity.setFactions(nextFactions.isEmpty() ? new HashSet<>() : new HashSet<>(nextFactions));
            changed = true;
        }

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static EnumSet<Faction> toEnumSet(Set<Faction> in) {
        if (in == null || in.isEmpty()) {
            return EnumSet.noneOf(Faction.class);
        }
        return EnumSet.copyOf(in);
    }

    private static List<TechUnlockRefEmbeddable> toUnlockEmbeddables(List<?> unlockTuples) {
        if (unlockTuples == null || unlockTuples.isEmpty()) {
            return new ArrayList<>();
        }

        return unlockTuples.stream()
                .filter(Objects::nonNull)
                .map(value -> (ewshop.domain.command.TechUnlockTuple) value)
                .map(tuple -> new TechUnlockRefEmbeddable(tuple.unlockType(), tuple.unlockElementName()))
                .collect(Collectors.toCollection(ArrayList::new));
    }
}