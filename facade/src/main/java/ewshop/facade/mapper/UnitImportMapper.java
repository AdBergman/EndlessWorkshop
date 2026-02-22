package ewshop.facade.mapper;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.MinorFaction;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;

import static java.util.Collections.emptyList;

public final class UnitImportMapper {

    private static final Pattern LEADER_PRIORITY_LINE =
            Pattern.compile("^\\s*\\+\\d+\\s+Leader\\s+Priority\\s*$");

    private UnitImportMapper() {}

    public static UnitImportSnapshot toSnapshot(UnitImportUnitDto dto) {
        if (dto == null) throw new IllegalArgumentException("Row is required");

        boolean isMajor = Boolean.TRUE.equals(dto.isMajorFaction());

        // Validate + normalize (but store String)
        String rawFaction = trimToNull(dto.faction());
        String normalizedFaction = normalizeAndValidateFaction(rawFaction, isMajor);

        return UnitImportSnapshot.builder()
                .unitKey(req(dto.unitKey(), "unitKey"))
                .displayName(req(dto.displayName(), "displayName"))

                .faction(normalizedFaction)
                .isMajorFaction(isMajor)

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

    private static String normalizeAndValidateFaction(String rawFaction, boolean isMajor) {
        if (rawFaction == null) return null;

        // We keep the stored value as the "game string" (trimmed), but only if it is allowed.
        // This avoids enum creep leaking into DB/domain while still enforcing a whitelist.
        if (isMajor) {
            MajorFaction parsed = MajorFaction.parseImportedMajorFaction(rawFaction);
            if (parsed == null) return null; // e.g. Placeholder explicitly blocked
            return rawFaction.trim();
        }

        MinorFaction parsed = MinorFaction.parseImportedMinorFaction(rawFaction);
        if (parsed == null) return null; // if you ever choose to block/ignore one
        return rawFaction.trim();
    }

    private static String req(String v, String field) {
        String t = v == null ? null : v.trim();
        if (t == null || t.isEmpty()) {
            throw new IllegalArgumentException("Missing required field: " + field);
        }
        return t;
    }

    private static String trimToNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private static List<String> cleanLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) return emptyList();
        return lines.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .filter(s -> !LEADER_PRIORITY_LINE.matcher(s).matches())
                .toList();
    }

    private static List<String> cleanList(List<String> list) {
        if (list == null || list.isEmpty()) return emptyList();
        return list.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .toList();
    }

    private static List<String> mergeAbilities(List<String> own, List<String> all) {
        LinkedHashSet<String> merged = new LinkedHashSet<>();

        if (all != null) {
            for (String s : all) {
                if (s == null) continue;
                String t = s.trim();
                if (!t.isEmpty()) merged.add(t);
            }
        }

        if (own != null) {
            for (String s : own) {
                if (s == null) continue;
                String t = s.trim();
                if (!t.isEmpty()) merged.add(t);
            }
        }

        return merged.isEmpty() ? emptyList() : new ArrayList<>(merged);
    }
}