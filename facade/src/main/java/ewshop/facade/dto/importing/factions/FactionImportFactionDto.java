package ewshop.facade.dto.importing.factions;

import ewshop.facade.dto.importing.ImportVisibilityPolicy;

import java.util.List;

public record FactionImportFactionDto(
        String entryKey,
        String factionKey,
        String factionKind,
        String displayName,
        String publicDisplayName,
        String lore,
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
        List<String> protectorateTraitKeys,
        Boolean isHidden,
        Boolean isPlayerFacing,
        Boolean isPrototype,
        Boolean isBaseTemplate,
        Boolean isPlaceholder,
        Boolean isInternal
) {
    public boolean filteredFromImport() {
        return ImportVisibilityPolicy.shouldFilter(
                null,
                isHidden,
                isPlayerFacing,
                isPrototype,
                isBaseTemplate,
                isPlaceholder,
                isInternal
        );
    }
}
