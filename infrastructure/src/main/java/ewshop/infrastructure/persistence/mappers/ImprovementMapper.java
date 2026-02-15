package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Improvement;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.springframework.stereotype.Component;

@Component
public class ImprovementMapper {

    public Improvement toDomain(ImprovementEntity entity) {
        if (entity == null) return null;

        return Improvement.builder()
                .constructibleKey(entity.getConstructibleKey())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .descriptionLines(entity.getDescriptionLines())
                .build();
    }

    public ImprovementEntity toEntity(Improvement domain) {
        if (domain == null) return null;

        ImprovementEntity entity = new ImprovementEntity();
        entity.setConstructibleKey(domain.getConstructibleKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCategory(domain.getCategory());
        entity.setDescriptionLines(domain.getDescriptionLines());
        return entity;
    }
}