package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;

public class UnitSpecializationMapper {

    public static UnitSpecialization toDomain(UnitSpecializationEntity entity) {
        if (entity == null) return null;

        return UnitSpecialization.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    public static UnitSpecializationEntity toEntity(UnitSpecialization domain) {
        if (domain == null) return null;

        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
