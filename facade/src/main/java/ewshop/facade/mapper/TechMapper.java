package ewshop.facade.mapper;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.TechUnlock;
import ewshop.facade.dto.TechCoordsDto;
import ewshop.facade.dto.TechDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class TechMapper {

    public static TechDto toDto(Tech entity) {
        if (entity == null) return null;

        // Effects
        List<String> effects = entity.getEffects() != null
                ? List.copyOf(entity.getEffects())
                : Collections.emptyList();

        // Factions
        List<String> factions = entity.getFactions() != null
                ? entity.getFactions().stream()
                .map(Enum::name)
                .sorted()
                .collect(Collectors.toList())
                : Collections.emptyList();

        // Unlocks
        List<String> unlocks = TechUnlock.convertUnlocks(entity.getUnlocks());


        // Prerequisite
        String prereq = entity.getPrereq() != null
                ? entity.getPrereq().getName()
                : "";

        // Excludes
        String excludes = entity.getExcludes() != null
                ? entity.getExcludes().getName()
                : "";

        // Coordinates
        TechCoords coords = entity.getTechCoords();
        TechCoordsDto coordsDto = coords != null
                ? new TechCoordsDto(coords.getXPct(), coords.getYPct())
                : null;

        // Use aligned builder with correct DTO field order
        return TechDto.builder()
                .name(entity.getName())
                .era(entity.getEra())
                .type(entity.getType() != null ? entity.getType().name() : "")
                .unlocks(unlocks)
                .effects(effects)
                .prereq(prereq)
                .factions(factions)
                .excludes(excludes)
                .coords(coordsDto)
                .build();
    }
}
