package ewshop.facade.mapper;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.facade.dto.importing.factions.FactionImportFactionDto;

import java.util.List;

public final class FactionImportMapper {

    private FactionImportMapper() {}

    public static FactionImportSnapshot toSnapshot(FactionImportFactionDto dto) {
        if (dto == null) throw new IllegalArgumentException("Row is required");

        String factionKey = firstPresent(dto.factionKey(), dto.entryKey());
        String displayName = firstPresent(dto.publicDisplayName(), dto.displayName(), factionKey);

        return new FactionImportSnapshot(
                factionKey,
                displayName,
                trimToNull(dto.lore()),
                trimToNull(dto.factionKind()),
                trimToNull(dto.affinityKey()),
                trimToNull(dto.affinityType()),
                cleanList(dto.traitKeys()),
                cleanList(dto.populationKeys()),
                cleanList(dto.unitKeys()),
                cleanList(dto.baseUnitKeys()),
                cleanList(dto.heroKeys()),
                cleanList(dto.gatedTechnologyKeys()),
                trimToNull(dto.startingFactionQuestKey()),
                cleanList(dto.specificQuestKeys()),
                cleanList(dto.protectorateTraitKeys())
        );
    }

    public static boolean isFiltered(FactionImportFactionDto dto) {
        return dto != null && dto.filteredFromImport();
    }

    private static String firstPresent(String... values) {
        for (String value : values) {
            String trimmed = trimToNull(value);
            if (trimmed != null) return trimmed;
        }
        return null;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();

        return values.stream()
                .map(FactionImportMapper::trimToNull)
                .filter(value -> value != null)
                .toList();
    }
}
