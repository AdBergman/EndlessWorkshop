package ewshop.facade.mapper;

import ewshop.facade.dto.importing.units.UnitImportVeterancyEffectDto;
import ewshop.facade.dto.importing.units.UnitImportVeterancyLevelDto;
import ewshop.facade.dto.importing.units.UnitImportVeterancyProgressionDto;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class UnitVeterancyProgressionMapper {

    private UnitVeterancyProgressionMapper() {}

    public static List<String> toCumulativeDisplayLines(UnitImportVeterancyProgressionDto dto) {
        if (dto == null || dto.levels() == null || dto.levels().isEmpty()) {
            return List.of();
        }

        List<UnitImportVeterancyLevelDto> levels = dto.levels().stream()
                .filter(level -> level != null && level.level() != null)
                .sorted((left, right) -> Integer.compare(left.level(), right.level()))
                .toList();

        if (levels.isEmpty()) {
            return List.of();
        }

        Map<String, CumulativeEffect> cumulativeEffects = new LinkedHashMap<>();
        List<String> lines = new ArrayList<>();

        for (UnitImportVeterancyLevelDto level : levels) {
            if (level.effects() != null) {
                for (UnitImportVeterancyEffectDto effect : level.effects()) {
                    CumulativeEffect next = CumulativeEffect.from(effect);
                    if (next == null) continue;

                    cumulativeEffects.merge(next.statKey, next, CumulativeEffect::plus);
                }
            }

            if (!cumulativeEffects.isEmpty()) {
                lines.add("Level " + level.level() + ": " + formatEffects(cumulativeEffects.values()));
            }
        }

        return List.copyOf(lines);
    }

    private static String formatEffects(Iterable<CumulativeEffect> effects) {
        List<String> parts = new ArrayList<>();
        for (CumulativeEffect effect : effects) {
            parts.add(effect.format());
        }
        return String.join(", ", parts);
    }

    private record CumulativeEffect(String statKey, String displayName, String operation, double value) {

        static CumulativeEffect from(UnitImportVeterancyEffectDto dto) {
            if (dto == null || dto.value() == null) return null;

            String statKey = trimToNull(dto.statKey());
            if (statKey == null) return null;

            String operation = trimToNull(dto.operation());
            if (operation == null) return null;

            String displayName = trimToNull(dto.displayName());
            if (displayName == null) displayName = statKey;

            return new CumulativeEffect(statKey, displayName, operation, dto.value());
        }

        CumulativeEffect plus(CumulativeEffect next) {
            if (!operation.equalsIgnoreCase(next.operation)) return next;
            return new CumulativeEffect(statKey, displayName, operation, value + next.value);
        }

        String format() {
            if ("Percent".equalsIgnoreCase(operation)) {
                return "+" + formatNumber(value * 100) + "% [" + statKey + "] " + displayName;
            }

            return "+" + formatNumber(value) + " [" + statKey + "] " + displayName;
        }
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String formatNumber(double value) {
        if (Math.rint(value) == value) {
            return String.valueOf((long) value);
        }

        return String.format(Locale.ROOT, "%.2f", value).replaceAll("0+$", "").replaceAll("\\.$", "");
    }
}
