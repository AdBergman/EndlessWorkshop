package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import org.springframework.stereotype.Component;

@Component
public class UnitSpecializationMapper {

    public UnitSpecialization toDomain(UnitSpecializationEntity entity) {
        if (entity == null) return null;

        return UnitSpecialization.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    public UnitSpecializationEntity toEntity(UnitSpecialization domain) {
        if (domain == null) return null;

        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
