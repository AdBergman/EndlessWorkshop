package ewshop.facade.mapper;

import ewshop.domain.entity.Tech;
import ewshop.facade.dto.TechDto;

public class TechMapper {

    public static TechDto toDto(Tech entity) {
        if (entity == null) return null;

        return new TechDto(
                entity.getName(),
                entity.getEra(),
                entity.getType().name(), // assuming enum
                String.join(", ", entity.getEffects()),
                entity.getFactions().stream().map(Enum::name).reduce((a,b)->a+", "+b).orElse("")
        );
    }
}
