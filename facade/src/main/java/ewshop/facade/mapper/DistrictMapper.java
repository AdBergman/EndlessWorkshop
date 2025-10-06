package ewshop.facade.mapper;

import ewshop.domain.entity.District;
import ewshop.facade.dto.response.DistrictDto;

import java.util.Collections;
import java.util.List;

public class DistrictMapper {

    public static DistrictDto toDto(District entity) {
        if (entity == null) return null;

        List<String> info = entity.getInfo() != null ? List.copyOf(entity.getInfo()) : Collections.emptyList();
        List<String> tileBonus = entity.getTileBonus() != null ? List.copyOf(entity.getTileBonus()) : Collections.emptyList();
        List<String> adjacencyBonus = entity.getAdjacencyBonus() != null ? List.copyOf(entity.getAdjacencyBonus()) : Collections.emptyList();

        return DistrictDto.builder()
                .name(entity.getName())
                .info(info)
                .effect(entity.getEffect())
                .tileBonus(tileBonus)
                .adjacencyBonus(adjacencyBonus)
                .placementPrereq(entity.getPlacementPrereq())
                .build();
    }
}
