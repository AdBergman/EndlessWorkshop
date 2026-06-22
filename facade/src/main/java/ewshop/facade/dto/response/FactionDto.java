package ewshop.facade.dto.response;

import java.util.List;

public record FactionDto(
        String factionKey,
        String publicDisplayName,
        String lore,
        String factionKind,
        String affinityKey,
        String affinityType,
        List<String> traitKeys,
        List<String> populationKeys,
        List<String> unitKeys,
        List<String> baseUnitKeys,
        List<String> heroKeys,
        List<String> gatedTechnologyKeys,
        String startingFactionQuestKey,
        List<String> specificQuestKeys,
        List<String> protectorateTraitKeys
) {
}
