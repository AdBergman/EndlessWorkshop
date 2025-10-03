package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Convertor;
import ewshop.domain.repository.entities.ConvertorEntity;

public class ConvertorMapper {

    public static Convertor toDomain(ConvertorEntity entity) {
        if (entity == null) return null;

        return Convertor.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    public static ConvertorEntity toEntity(Convertor domain) {
        if (domain == null) return null;

        ConvertorEntity entity = new ConvertorEntity();
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
