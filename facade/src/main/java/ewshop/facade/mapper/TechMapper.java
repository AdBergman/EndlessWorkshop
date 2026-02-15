package ewshop.facade.mapper;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.dto.response.TechDto;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class TechMapper {

    public static TechDto toDto(Tech domain) {
        if (domain == null) return null;

        TechCoords c = domain.getTechCoords();
        if (c == null) {
            throw new IllegalStateException("techCoords required (techKey=" + domain.getTechKey() + ")");
        }
        TechCoordsDto coordsDto = new TechCoordsDto(c.getXPct(), c.getYPct());

        String prereqKey = domain.getPrereq() != null ? domain.getPrereq().getTechKey() : null;
        String excludesKey = domain.getExcludes() != null ? domain.getExcludes().getTechKey() : null;


        List<String> factions = domain.getFactions().stream()
                .map(TechMapper::formatEnumName)
                .sorted()
                .collect(Collectors.toList());

        return TechDto.builder()
                .name(domain.getName())
                .techKey(domain.getTechKey())
                .era(domain.getEra())
                .type(formatEnumName(domain.getType()))
                .effects(domain.getEffects())
                .prereq(prereqKey)
                .factions(factions)
                .excludes(excludesKey)
                .coords(coordsDto)
                .build();
    }

    private static String formatEnumName(Enum<?> e) {
        if (e == null) return "";
        return Arrays.stream(e.name().split("_"))
                .map(w -> w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}