package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
public class SavedTechBuildMapper {

    public SavedTechBuild toDomain(SavedTechBuildEntity entity) {
        if (entity == null) return null;

        return SavedTechBuild.builder()
                .uuid(entity.getUuid())
                .name(entity.getName())
                .techIds(entity.getTechIds() != null ? entity.getTechIds() : Collections.emptyList())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public SavedTechBuildEntity toEntity(SavedTechBuild domain) {
        if (domain == null) return null;

        SavedTechBuildEntity entity = new SavedTechBuildEntity();
        entity.setUuid(domain.getUuid() != null ? domain.getUuid() : UUID.randomUUID());
        entity.setName(domain.getName());
        entity.setTechIds(domain.getTechIds() != null ? domain.getTechIds() : Collections.emptyList());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }
}
