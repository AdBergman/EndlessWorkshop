package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitCost;
import ewshop.domain.entity.UnitSkill;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.entity.enums.CostType;
import ewshop.domain.entity.enums.FIDSI;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddable;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntity;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UnitSpecializationMapper {

    /** Entity → Domain */
    public UnitSpecialization toDomain(UnitSpecializationEntity entity) {
        if (entity == null) return null;

        var domainCosts = entity.getCosts() != null
                ? entity.getCosts().stream().map(this::toDomainCost).collect(Collectors.toSet())
                : Set.<UnitCost>of();

        var domainSkills = entity.getUnitSkills() != null
                ? entity.getUnitSkills().stream()
                .map(join -> UnitSkill.builder()
                        .name(join.getSkill().getName())
                        .target(join.getSkill().getTarget())
                        .type(join.getSkill().getType())
                        .amount(join.getSkill().getAmount())
                        .build())
                .collect(Collectors.toSet())
                : Set.<UnitSkill>of();

        var upgradesTo = entity.getUpgradesTo() != null
                ? Set.copyOf(entity.getUpgradesTo())
                : Set.<String>of();

        return UnitSpecialization.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .health(entity.getHealth())
                .defense(entity.getDefense())
                .minDamage(entity.getMinDamage())
                .maxDamage(entity.getMaxDamage())
                .movementPoints(entity.getMovementPoints())
                .cost(domainCosts.stream().toList())
                .upkeep(entity.getUpkeep())
                .skills(domainSkills)
                .faction(entity.getFaction())
                .tier(entity.getTier())
                .upgradesTo(upgradesTo)
                .build();
    }

    /** Domain → Entity */
    public UnitSpecializationEntity toEntity(UnitSpecialization domain, Set<UnitSkillEntity> persistedSkills) {
        if (domain == null) return null;

        var entity = new UnitSpecializationEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setType(domain.getType());
        entity.setHealth(domain.getHealth());
        entity.setDefense(domain.getDefense());
        entity.setMinDamage(domain.getMinDamage());
        entity.setMaxDamage(domain.getMaxDamage());
        entity.setMovementPoints(domain.getMovementPoints());
        entity.setTier(domain.getTier());
        entity.setFaction(domain.getFaction());
        entity.setUpkeep(domain.getUpkeep());

        entity.setCosts(domain.getCosts() != null
                ? domain.getCosts().stream().map(this::toEntityCost).collect(Collectors.toSet())
                : Set.of());

        entity.setUnitSkills(domain.getSkills() != null
                ? domain.getSkills().stream()
                .map(skill -> {
                    var skillEntity = persistedSkills.stream()
                            .filter(s -> s.getName().equals(skill.getName()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("UnitSkill not found: " + skill.getName()));
                    var joinEntity = new UnitSpecializationSkillEntity();
                    joinEntity.setSkill(skillEntity);
                    joinEntity.setUnit(entity);
                    return joinEntity;
                })
                .collect(Collectors.toSet())
                : Set.of());

        entity.setUpgradesTo(domain.getUpgradesTo() != null
                ? Set.copyOf(domain.getUpgradesTo())
                : Set.of());

        return entity;
    }

    private UnitCost toDomainCost(UnitCostEmbeddable embeddable) {
        var type = embeddable.getResource() != null
                ? CostType.valueOf(embeddable.getResource().name())
                : CostType.valueOf(embeddable.getStrategic().name());

        return UnitCost.builder()
                .amount(embeddable.getAmount())
                .type(type)
                .build();
    }

    private UnitCostEmbeddable toEntityCost(UnitCost domain) {
        FIDSI fid = null;
        StrategicResourceType strat = null;

        if (domain.getType().isFIDSI()) fid = domain.getType().asFIDSI();
        else if (domain.getType().isStrategic()) strat = domain.getType().asStrategic();
        else throw new IllegalStateException("Unknown CostType: " + domain.getType());

        return new UnitCostEmbeddable(domain.getAmount(), fid, strat);
    }

    public UnitSpecializationEntity toEntity(UnitSpecialization domain) {
        return toEntity(domain, Set.of());
    }
}
