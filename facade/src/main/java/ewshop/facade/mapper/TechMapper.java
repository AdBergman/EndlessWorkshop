package ewshop.facade.mapper;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.facade.dto.TechCoordsDto;
import ewshop.facade.dto.TechDto;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class TechMapper {

    public static TechDto toDto(Tech domain) {
        if (domain == null) return null;

        // --- Prerequisite and Excludes Transformation ---
        String prereqName = (domain.getPrereq() != null) ? domain.getPrereq().getName() : null;
        String excludesName = (domain.getExcludes() != null) ? domain.getExcludes().getName() : null;

        // --- Unlocks Transformation ---
        List<String> unlockStrings = domain.getUnlocks().stream()
                .map(unlock -> {
                    if (unlock.getImprovement() != null) {
                        return "Improvement: " + unlock.getImprovement().getName();
                    }
                    if (unlock.getDistrict() != null) {
                        return "District: " + unlock.getDistrict().getName();
                    }
                    return unlock.getUnlockText();
                })
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toList());

        // --- Effects Transformation ---
        List<String> effects = List.copyOf(domain.getEffects());

        // --- Factions Transformation ---
        List<String> factions = domain.getFactions().stream()
                .map(TechMapper::formatEnumName)
                .sorted()
                .collect(Collectors.toList());

        // --- Type Transformation ---
        String typeName = (domain.getType() != null) ? formatEnumName(domain.getType()) : "";

        // --- Coordinates Transformation ---
        TechCoords coords = domain.getTechCoords();
        TechCoordsDto coordsDto = (coords != null) ? new TechCoordsDto(coords.getXPct(), coords.getYPct()) : null;

        // --- Build the DTO ---
        return TechDto.builder()
                .name(domain.getName())
                .era(domain.getEra())
                .type(typeName)
                .unlocks(unlockStrings)
                .effects(effects)
                .prereq(prereqName)
                .factions(factions)
                .excludes(excludesName)
                .coords(coordsDto)
                .build();
    }

    /**
     * A generic helper method to format any enum into a user-friendly, title-cased string.
     * It converts an enum like LOST_LORDS into "Lost Lords" and SOCIETY into "Society".
     *
     * @param enumConstant The enum constant (e.g., Faction.LOST_LORDS, TechType.SOCIETY).
     * @return A properly formatted string.
     */
    private static String formatEnumName(Enum<?> enumConstant) {
        if (enumConstant == null) {
            return "";
        }
        String enumName = enumConstant.name();

        return Arrays.stream(enumName.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}
