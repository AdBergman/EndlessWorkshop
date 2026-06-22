package ewshop.facade.mapper;

import ewshop.domain.command.HeroImportSnapshot;
import ewshop.facade.dto.importing.heroes.HeroImportHeroDto;

import java.util.List;

public final class HeroImportMapper {

    private HeroImportMapper() {}

    public static HeroImportSnapshot toSnapshot(HeroImportHeroDto dto) {
        if (dto == null) throw new IllegalArgumentException("Row is required");

        String unitKey = firstPresent(dto.unitKey(), dto.heroKey(), dto.entryKey());

        return new HeroImportSnapshot(
                unitKey,
                firstPresent(dto.displayName(), unitKey),
                trimToNull(dto.faction()),
                trimToNull(dto.factionKey()),
                dto.isMajorFaction(),
                trimToNull(dto.heroKey()),
                trimToNull(dto.heroClassKey()),
                trimToNull(dto.originKind()),
                trimToNull(dto.originFactionKey()),
                trimToNull(dto.minorFactionKey()),
                trimToNull(dto.unitClassKey()),
                trimToNull(dto.attackSkillKey()),
                cleanList(dto.ownAbilityKeys()),
                cleanList(dto.abilityKeys()),
                cleanList(dto.combatAbilityKeys()),
                cleanList(dto.tacticalAbilityKeys()),
                cleanList(dto.passiveAbilityKeys()),
                cleanList(dto.mechanicalAbilityKeys()),
                cleanList(dto.classRuleAbilityKeys()),
                cleanList(dto.hiddenHelperAbilityKeys()),
                cleanList(dto.defaultSkillKeys()),
                cleanList(dto.applicableSkillTreeKeys()),
                cleanList(dto.descriptionLines()),
                cleanList(dto.referenceKeys())
        );
    }

    public static boolean isFiltered(HeroImportHeroDto dto) {
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
                .map(HeroImportMapper::trimToNull)
                .filter(value -> value != null)
                .toList();
    }
}
