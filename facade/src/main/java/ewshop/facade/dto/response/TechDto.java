package ewshop.facade.dto.response;

import java.util.List;

public record TechDto(
        String name,
        String techKey,
        int era,
        String type,
        List<TechUnlockDto> unlocks,
        List<String> descriptionLines,
        String prereq,
        List<String> factions,
        String excludes,
        TechCoordsDto coords
) {
}