package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.District;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DistrictMapper {

    public District toDomain(DistrictEntity entity) {
        if (entity == null) return null;

        return District.builder()
                .districtKey(entity.getDistrictKey())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .descriptionLines(entity.getDescriptionLines() == null
                        ? List.of()
                        : List.copyOf(entity.getDescriptionLines()))
                .build();
    }

    public DistrictEntity toEntity(District domain) {
        if (domain == null) return null;

        DistrictEntity entity = new DistrictEntity();
        entity.setDistrictKey(domain.getDistrictKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCategory(domain.getCategory());
        entity.setDescriptionLines(domain.getDescriptionLines() == null
                ? List.of()
                : new ArrayList<>(domain.getDescriptionLines()));
        return entity;
    }
}