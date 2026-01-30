package ewshop.facade.mapper;

import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.TechType;
import ewshop.facade.dto.request.TechAdminDto;

public class TechAdminMapper {

    public static TechPlacementUpdate toDomain(TechAdminDto dto) {
        if (dto == null) return null;

        TechCoords coords = null;
        if (dto.coords() != null) {
            coords = new TechCoords(dto.coords().xPct(), dto.coords().yPct());
        }

        TechType type = null;
        if (dto.type() != null && !dto.type().isBlank()) {
            type = TechType.valueOf(dto.type().toUpperCase().replace(" ", "_"));
        }

        return TechPlacementUpdate.builder()
                .name(dto.name())
                .type(type)
                .era(dto.era())
                .coords(coords)
                .build();
    }
}