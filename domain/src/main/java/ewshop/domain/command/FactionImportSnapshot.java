package ewshop.domain.command;

import java.util.List;

public record FactionImportSnapshot(
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
    public FactionImportSnapshot {
        factionKey = require(factionKey, "factionKey");
        publicDisplayName = blankToDefault(publicDisplayName, factionKey);
        lore = trimToNull(lore);
        factionKind = trimToNull(factionKind);
        affinityKey = trimToNull(affinityKey);
        affinityType = trimToNull(affinityType);
        traitKeys = cleanList(traitKeys);
        populationKeys = cleanList(populationKeys);
        unitKeys = cleanList(unitKeys);
        baseUnitKeys = cleanList(baseUnitKeys);
        heroKeys = cleanList(heroKeys);
        gatedTechnologyKeys = cleanList(gatedTechnologyKeys);
        startingFactionQuestKey = trimToNull(startingFactionQuestKey);
        specificQuestKeys = cleanList(specificQuestKeys);
        protectorateTraitKeys = cleanList(protectorateTraitKeys);
    }

    private static String require(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException("FactionImportSnapshot." + field + " is required");
        }
        return trimmed;
    }

    private static String blankToDefault(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed == null ? fallback : trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();

        return values.stream()
                .map(FactionImportSnapshot::trimToNull)
                .filter(value -> value != null)
                .toList();
    }
}
