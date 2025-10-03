package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.District;
import ewshop.domain.repository.entities.DistrictEntity;

public class DistrictMapper {

    public static District toDomain(DistrictEntity entity) {
        if (entity == null) return null;

        return District.builder()
                .name(entity.getName())
                .info(entity.getInfo())
                .effect(entity.getEffect())
                .tileBonus(entity.getTileBonus())
                .adjacencyBonus(entity.getAdjacencyBonus())
                .placementPrereq(entity.getPlacementPrereq())
                .build();
    }

    public static DistrictEntity toEntity(District domain) {
        if (domain == null) return null;

        DistrictEntity entity = new DistrictEntity();
        entity.setName(domain.getName());
        entity.setInfo(domain.getInfo());
        entity.setEffect(domain.getEffect());
        entity.setTileBonus(domain.getTileBonus());
        entity.setAdjacencyBonus(domain.getAdjacencyBonus());
        entity.setPlacementPrereq(domain.getPlacementPrereq());
        return entity;
    }
}
