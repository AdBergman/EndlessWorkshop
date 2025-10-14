package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.entity.UnitType;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class UnitSpecializationMapper {

    public UnitSpecialization toDomain(UnitSpecializationEntity entity) {
        if (entity == null) return null;

        return UnitSpecialization.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .health(entity.getHealth())
                .defense(entity.getDefense())
                .minDamage(entity.getMinDamage())
                .maxDamage(entity.getMaxDamage())
                .movementPoints(entity.getMovementPoints())
                .cost(entity.getCost())
                .upkeepPerTurn(entity.getUpkeepPerTurn())
                .skills(entity.getSkills())
                .faction(entity.getFaction())
                .build();
    }

    public UnitSpecializationEntity toEntity(UnitSpecialization domain) {
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
        entity.setCost(domain.getCost());
        entity.setUpkeepPerTurn(domain.getUpkeepPerTurn());
        entity.setSkills(domain.getSkills() != null ? domain.getSkills() : List.of());
        entity.setFaction(domain.getFaction());
        return entity;
    }
}
