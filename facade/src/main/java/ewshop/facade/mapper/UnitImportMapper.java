package ewshop.facade.mapper;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;

import static java.util.Collections.emptyList;

public class UnitImportMapper {

    private static final Pattern LEADER_PRIORITY_LINE =
            Pattern.compile("^\\s*\\+\\d+\\s+Leader\\s+Priority\\s*$");

    public static UnitImportSnapshot toSnapshot(UnitImportUnitDto dto) {
        if (dto == null) throw new IllegalArgumentException("Row is required");

        return UnitImportSnapshot.builder()
                .unitKey(req(dto.unitKey(), "unitKey"))
                .displayName(req(dto.displayName(), "displayName"))

                .isHero(Boolean.TRUE.equals(dto.isHero()))
                .isChosen(Boolean.TRUE.equals(dto.isChosen()))
                .spawnType(trimToNull(dto.spawnType()))

                .previousUnitKey(trimToNull(dto.previousUnitKey()))
                .nextEvolutionUnitKeys(cleanList(dto.nextEvolutionUnitKeys()))
                .evolutionTierIndex(dto.evolutionTierIndex())

                .unitClassKey(trimToNull(dto.unitClassKey()))
                .attackSkillKey(trimToNull(dto.attackSkillKey()))

                .abilityKeys(mergeAbilities(dto.ownAbilityKeys(), dto.abilityKeys()))
                .descriptionLines(cleanLines(dto.descriptionLines()))

                .build();
    }

    private static String req(String v, String field) {
        var t = v == null ? null : v.trim();
        if (t == null || t.isEmpty()) {
            throw new IllegalArgumentException("Missing required field: " + field);
        }
        return t;
    }

    private static String trimToNull(String v) {
        if (v == null) return null;
        var t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private static boolean isLeaderPriorityLine(String line) {
        if (line == null) return false;
        return LEADER_PRIORITY_LINE.matcher(line).matches();
    }

    private static List<String> cleanLines(List<String> lines) {
        if (lines == null) return emptyList();
        return lines.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .filter(s -> !isLeaderPriorityLine(s))
                .toList();
    }

    private static List<String> cleanList(List<String> list) {
        if (list == null) return emptyList();
        return list.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .toList();
    }

    private static List<String> mergeAbilities(List<String> own, List<String> all) {
        LinkedHashSet<String> merged = new LinkedHashSet<>();

        if (all != null) {
            all.stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::trim)
                    .forEach(merged::add);
        }

        if (own != null) {
            own.stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::trim)
                    .forEach(merged::add);
        }

        return merged.isEmpty() ? emptyList() : new ArrayList<>(merged);
    }
}