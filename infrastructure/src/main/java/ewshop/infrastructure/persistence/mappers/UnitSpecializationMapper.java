package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.entity.UnitCost;
import ewshop.domain.entity.enums.CostType;
import ewshop.domain.entity.enums.FIDSI;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddable;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UnitSpecializationMapper {

    /** Entity → Domain */
    public UnitSpecialization toDomain(UnitSpecializationEntity entity) {
        if (entity == null) return null;

        List<UnitCost> domainCosts = entity.getCosts() != null
                ? entity.getCosts().stream().map(this::toDomainCost).collect(Collectors.toList())
                : List.of();

        // Convert join entities → skill names
        List<String> domainSkills = entity.getUnitSkills() != null
                ? entity.getUnitSkills().stream()
                .map(join -> join.getSkill().getName())
                .collect(Collectors.toList())
                : List.of();

        return UnitSpecialization.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .health(entity.getHealth())
                .defense(entity.getDefense())
                .minDamage(entity.getMinDamage())
                .maxDamage(entity.getMaxDamage())
                .movementPoints(entity.getMovementPoints())
                .cost(domainCosts)
                .upkeepPerTurn(entity.getUpkeepPerTurn())
                .skills(domainSkills)
                .faction(entity.getFaction())
                .build();
    }

    /** Domain → Entity */
    public UnitSpecializationEntity toEntity(UnitSpecialization domain, List<UnitSkillEntity> persistedSkills) {
        if (domain == null) return null;

        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setType(domain.getType());
        entity.setHealth(domain.getHealth());
        entity.setDefense(domain.getDefense());
        entity.setMinDamage(domain.getMinDamage());
        entity.setMaxDamage(domain.getMaxDamage());
        entity.setMovementPoints(domain.getMovementPoints());

        List<UnitCostEmbeddable> entityCosts = domain.getCosts() != null
                ? domain.getCosts().stream().map(this::toEntityCost).collect(Collectors.toList())
                : List.of();
        entity.setCosts(entityCosts);

        entity.setUpkeepPerTurn(domain.getUpkeepPerTurn());

        // Map skill names → join entities
        List<UnitSpecializationSkillEntity> joinEntities = domain.getSkills() != null
                ? domain.getSkills().stream()
                .map(name -> {
                    UnitSkillEntity skillEntity = persistedSkills.stream()
                            .filter(s -> s.getName().equals(name))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("UnitSkill not found: " + name));

                    UnitSpecializationSkillEntity joinEntity = new UnitSpecializationSkillEntity();
                    joinEntity.setSkill(skillEntity);
                    joinEntity.setUnit(entity); // set parent unit
                    return joinEntity;
                })
                .collect(Collectors.toList())
                : List.of();
        entity.setUnitSkills(joinEntities);

        entity.setFaction(domain.getFaction());
        return entity;
    }

    /** Map UnitCostEmbeddable → UnitCost */
    private UnitCost toDomainCost(UnitCostEmbeddable embeddable) {
        CostType type;
        if (embeddable.getResource() != null) {
            type = CostType.valueOf(embeddable.getResource().name());
        } else if (embeddable.getStrategic() != null) {
            type = CostType.valueOf(embeddable.getStrategic().name());
        } else {
            throw new IllegalStateException("UnitCostEmbeddable must have either FIDSI or Strategic resource set");
        }

        return UnitCost.builder()
                .amount(embeddable.getAmount())
                .type(type)
                .build();
    }

    /** Map UnitCost → UnitCostEmbeddable */
    private UnitCostEmbeddable toEntityCost(UnitCost domain) {
        FIDSI fid = null;
        StrategicResourceType strat = null;

        if (domain.getType().isFIDSI()) {
            fid = domain.getType().asFIDSI();
        } else if (domain.getType().isStrategic()) {
            strat = domain.getType().asStrategic();
        } else {
            throw new IllegalStateException("Unknown CostType: " + domain.getType());
        }

        return new UnitCostEmbeddable(domain.getAmount(), fid, strat);
    }

    /** Convenience overload when skill list is not yet available */
    public UnitSpecializationEntity toEntity(UnitSpecialization domain) {
        return toEntity(domain, List.of());
    }
}
