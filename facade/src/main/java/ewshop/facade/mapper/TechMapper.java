package ewshop.facade.mapper;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.dto.response.TechDto;
import ewshop.facade.dto.response.TechUnlockDto;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class TechMapper {

    private TechMapper() {
    }

    public static TechDto toDto(Tech t) {
        if (t == null) return null;

        TechCoords c = t.getTechCoords();
        if (c == null) throw new IllegalStateException("techCoords required (techKey=" + t.getTechKey() + ")");

        TechCoordsDto coords = new TechCoordsDto(c.getXPct(), c.getYPct());

        String type = formatEnumName(t.getType());
        String prereq = (t.getPrereq() != null) ? t.getPrereq().getTechKey() : null;
        String excludes = (t.getExcludes() != null) ? t.getExcludes().getTechKey() : null;

        List<String> factions = t.getFactions().stream()
                .map(TechMapper::formatEnumName)
                .sorted()
                .toList();

        List<TechUnlockDto> unlocks = t.getUnlocks().stream()
                .map(u -> new TechUnlockDto(u.unlockType(), u.unlockKey()))
                .toList();

        List<String> descriptionLines = t.getDescriptionLines();

        return new TechDto(
                t.getName(),
                t.getTechKey(),
                t.getEra(),
                type,
                unlocks,
                descriptionLines,
                prereq,
                factions,
                excludes,
                coords
        );
    }

    private static String formatEnumName(Enum<?> e) {
        if (e == null) return "";
        return Arrays.stream(e.name().split("_"))
                .map(w -> w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}