package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Treaty;
import ewshop.infrastructure.persistence.entities.TreatyEntity;

public class TreatyMapper {

    public static Treaty toDomain(TreatyEntity entity) {
        if (entity == null) return null;

        return Treaty.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    public static TreatyEntity toEntity(Treaty domain) {
        if (domain == null) return null;

        TreatyEntity entity = new TreatyEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
