package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.UnitCost;
import ewshop.domain.model.UnitSkill;
import ewshop.domain.model.UnitSpecialization;
import ewshop.domain.model.enums.CostType;
import ewshop.domain.model.enums.FIDSI;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddableLegacy;
import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntityLegacy;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntityLegacy;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Maps between {@link UnitSpecializationEntityLegacy} (JPA) and {@link UnitSpecialization} (domain model).
 * This mapper is designed to be robust, null-safe, and provides detailed logging for data anomalies
 * without failing on recoverable issues.
 */
@Component
public class UnitSpecializationMapperLegacy {

    private static final Logger logger = LogManager.getLogger(UnitSpecializationMapperLegacy.class);

    private static boolean isMajorFaction(String value) {
        if (value == null) return false;
        return Arrays.stream(Faction.values())
            .anyMatch(f -> f.name().equalsIgnoreCase(value));
    }

    /**
     * Maps a {@link UnitSpecializationEntityLegacy} to its corresponding {@link UnitSpecialization} domain object.
     *
     * @param entity The JPA entity from the database.
     * @return A fully-formed domain object. Returns {@code null} if the input entity is {@code null}.
     * @throws IllegalStateException if an unrecoverable error occurs during mapping.
     */
    public UnitSpecialization toDomain(final UnitSpecializationEntityLegacy entity) {
        if (entity == null) {
            return null;
        }

        try {
            // --- Cost Mapping ---
            final Set<UnitCost> domainCosts = Optional.ofNullable(entity.getCosts())
                    .map(Set::stream)
                    .orElseGet(() -> {
                        logger.debug("unit={} issue='null costs collection', details='Defaulting to empty set.'", entity.getName());
                        return java.util.stream.Stream.empty();
                    })
                    .map(costEntity -> toDomainCost(costEntity, entity.getName()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // --- Skill Mapping ---
            final Set<UnitSkill> domainSkills = Optional.ofNullable(entity.getUnitSkills())
                    .map(Set::stream)
                    .orElseGet(() -> {
                        logger.debug("unit={} issue='null skills collection', details='Defaulting to empty set.'", entity.getName());
                        return java.util.stream.Stream.empty();
                    })
                    .map(skillJoinEntity -> toDomainSkill(skillJoinEntity, entity.getName()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // --- Upgrades Mapping ---
            final Set<String> upgradesTo = Optional.ofNullable(entity.getUpgradesTo())
                    .orElseGet(() -> {
                        logger.debug("unit={} issue='null upgradesTo collection', details='Defaulting to empty set.'", entity.getName());
                        return Collections.emptySet();
                    });

            // --- Faction Mapping ---
            Faction faction = null;
            String minorFaction = null;
            if (isMajorFaction(entity.getFaction())) {
                faction = Faction.valueOf(entity.getFaction().toUpperCase());
            } else {
                minorFaction = entity.getFaction();
            }

            // --- Final Object Construction ---
            return UnitSpecialization.builder()
                    .name(entity.getName())
                    .description(entity.getDescription())
                    .type(entity.getType())
                    .health(entity.getHealth())
                    .defense(entity.getDefense())
                    .minDamage(entity.getMinDamage())
                    .maxDamage(entity.getMaxDamage())
                    .movementPoints(entity.getMovementPoints())
                    .cost(domainCosts.stream().toList()) // Convert Set to List for builder
                    .upkeep(entity.getUpkeep())
                    .skills(domainSkills)
                    .faction(faction)
                    .minorFaction(minorFaction)
                    .tier(entity.getTier())
                    .upgradesTo(upgradesTo)
                    .artId(entity.getArtId())
                    .build();

        } catch (final Exception e) {
            logger.error("unit={} issue='unhandled mapping exception', message='{}'", entity.getName(), e.getMessage(), e);
            throw new IllegalStateException("Failed to map UnitSpecializationEntity: " + entity.getName(), e);
        }
    }

    /**
     * Maps a {@link UnitSpecialization} domain object back to a new {@link UnitSpecializationEntityLegacy}.
     * This method is stricter than {@code toDomain} and expects valid domain objects.
     *
     * @param domain          The domain object to convert.
     * @param persistedSkills A set of existing skill entities to link against.
     * @return A new, un-persisted JPA entity.
     */
    public UnitSpecializationEntityLegacy toEntity(final UnitSpecialization domain, final Set<UnitSkillEntityLegacy> persistedSkills) {
        if (domain == null) {
            return null;
        }

        final var entity = new UnitSpecializationEntityLegacy();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setType(domain.getType());
        entity.setHealth(domain.getHealth());
        entity.setDefense(domain.getDefense());
        entity.setMinDamage(domain.getMinDamage());
        entity.setMaxDamage(domain.getMaxDamage());
        entity.setMovementPoints(domain.getMovementPoints());
        entity.setTier(domain.getTier());

        if (domain.getFaction() != null) {
            entity.setFaction(domain.getFaction().name());
        } else if (domain.getMinorFaction() != null) {
            entity.setFaction(domain.getMinorFaction());
        }

        entity.setUpkeep(domain.getUpkeep());
        entity.setArtId(domain.getArtId());

        final Set<UnitCostEmbeddableLegacy> costEmbeddables = Optional.ofNullable(domain.getCosts()).orElse(Collections.emptySet())
                .stream()
                .map(this::toEntityCost)
                .collect(Collectors.toSet());
        entity.setCosts(costEmbeddables);

        final Set<UnitSpecializationSkillEntityLegacy> skillJoinEntities = Optional.ofNullable(domain.getSkills()).orElse(Collections.emptySet())
                .stream()
                .map(skill -> {
                    final UnitSkillEntityLegacy skillEntity = persistedSkills.stream()
                            .filter(s -> s.getName().equals(skill.getName()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("Cannot save unit: UnitSkill '" + skill.getName() + "' not found in persisted set."));
                    return new UnitSpecializationSkillEntityLegacy(entity, skillEntity, null);
                })
                .collect(Collectors.toSet());
        entity.setUnitSkills(skillJoinEntities);

        entity.setUpgradesTo(Optional.ofNullable(domain.getUpgradesTo()).orElse(Collections.emptySet()));

        return entity;
    }

    /**
     * Overloaded convenience method for {@link #toEntity(UnitSpecialization, Set)}.
     */
    public UnitSpecializationEntityLegacy toEntity(final UnitSpecialization domain) {
        return toEntity(domain, Collections.emptySet());
    }

    /**
     * Safely converts a {@link UnitCostEmbeddableLegacy} to a domain {@link UnitCost}.
     * Logs warnings for invalid data but does not throw exceptions.
     */
    private UnitCost toDomainCost(final UnitCostEmbeddableLegacy embeddable, final String unitName) {
        if (embeddable == null || (embeddable.getResource() == null && embeddable.getStrategic() == null)) {
            logger.warn("unit={} issue='invalid cost entry', details='resource and strategic types are both null'", unitName);
            return null;
        }
        try {
            final CostType type = (embeddable.getResource() != null)
                    ? CostType.valueOf(embeddable.getResource().name())
                    : CostType.valueOf(embeddable.getStrategic().name());

            // Note: Assumes UnitCost has a manual builder, not a Lombok one.
            return UnitCost.builder()
                    .amount(embeddable.getAmount())
                    .type(type)
                    .build();
        } catch (final IllegalArgumentException e) {
            final String invalidValue = embeddable.getResource() != null ? embeddable.getResource().name() : embeddable.getStrategic().name();
            logger.warn("unit={} issue='invalid cost enum', details='value {} is not a valid CostType'", unitName, invalidValue);
            return null;
        }
    }

    /**
     * Safely converts a {@link UnitSpecializationSkillEntityLegacy} to a domain {@link UnitSkill}.
     * Logs a warning if the underlying skill relationship is broken.
     */
    private UnitSkill toDomainSkill(final UnitSpecializationSkillEntityLegacy join, final String unitName) {
        if (join == null || join.getSkill() == null) {
            logger.warn("unit={} issue='missing skill relationship'", unitName);
            return null;
        }
        final UnitSkillEntityLegacy skillEntity = join.getSkill();
        // Note: Assumes UnitSkill has a manual builder, not a Lombok one.
        return UnitSkill.builder()
                .name(skillEntity.getName())
                .target(skillEntity.getTarget())
                .type(skillEntity.getType())
                .amount(skillEntity.getAmount())
                .build();
    }

    /**
     * Converts a domain {@link UnitCost} back to a {@link UnitCostEmbeddableLegacy}.
     * This method is strict and will throw an exception for invalid data.
     */
    private UnitCostEmbeddableLegacy toEntityCost(final UnitCost domain) {
        if (domain.getType() == null) {
            throw new IllegalStateException("Cannot save unit cost: CostType is null.");
        }
        final FIDSI fid = domain.getType().isFIDSI() ? domain.getType().asFIDSI() : null;
        final StrategicResourceType strat = domain.getType().isStrategic() ? domain.getType().asStrategic() : null;

        if (fid == null && strat == null) {
            throw new IllegalStateException("Unknown CostType: " + domain.getType());
        }
        return new UnitCostEmbeddableLegacy(domain.getAmount(), fid, strat);
    }
}
