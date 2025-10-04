package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.District;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DistrictMapper {

    public District toDomain(DistrictEntity entity) {
        if (entity == null) return null;

        return District.builder()
                .name(entity.getName())
                .info(entity.getInfo() != null ? entity.getInfo() : Collections.emptyList())
                .effect(entity.getEffect())
                .tileBonus(entity.getTileBonus() != null ? entity.getTileBonus() : Collections.emptyList())
                .adjacencyBonus(entity.getAdjacencyBonus() != null ? entity.getAdjacencyBonus() : Collections.emptyList())
                .placementPrereq(entity.getPlacementPrereq())
                .build();
    }

    public DistrictEntity toEntity(District domain) {
        if (domain == null) return null;

        DistrictEntity entity = new DistrictEntity();
        entity.setName(domain.getName());
        entity.setInfo(domain.getInfo() != null ? domain.getInfo() : Collections.emptyList());
        entity.setEffect(domain.getEffect());
        entity.setTileBonus(domain.getTileBonus() != null ? domain.getTileBonus() : Collections.emptyList());
        entity.setAdjacencyBonus(domain.getAdjacencyBonus() != null ? domain.getAdjacencyBonus() : Collections.emptyList());
        entity.setPlacementPrereq(domain.getPlacementPrereq());
        return entity;
    }
}
