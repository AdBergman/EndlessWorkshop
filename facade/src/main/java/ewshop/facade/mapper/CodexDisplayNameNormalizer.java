package ewshop.facade.mapper;

import java.util.regex.Pattern;

final class CodexDisplayNameNormalizer {

    private static final Pattern LEADING_BRACKET_PREFIX_PATTERN = Pattern.compile("^\\[[^]]+]\\s*");

    private CodexDisplayNameNormalizer() {}

    static String normalize(String entryKey, String displayName) {
        String name = trimToNull(displayName);
        if (name == null) {
            return null;
        }

        name = stripLeadingBracketPrefixes(name);
        if (name == null) {
            return null;
        }

        String factionLabel = factionDisplayName(entryKey);
        if (factionLabel != null && isTechnicalFactionName(name, entryKey)) {
            return factionLabel;
        }

        factionLabel = factionDisplayName(name);
        if (factionLabel != null && isTechnicalFactionName(name, entryKey)) {
            return factionLabel;
        }

        return name;
    }

    private static String stripLeadingBracketPrefixes(String value) {
        String normalized = trimToEmpty(value);
        while (!normalized.isBlank()) {
            String stripped = LEADING_BRACKET_PREFIX_PATTERN.matcher(normalized).replaceFirst("");
            if (stripped.equals(normalized)) {
                break;
            }
            normalized = stripped.trim();
        }
        return trimToNull(normalized);
    }

    private static boolean isTechnicalFactionName(String displayName, String entryKey) {
        String name = trimToEmpty(displayName);
        String key = trimToEmpty(entryKey);
        return name.equals(key) || name.startsWith("Faction_");
    }

    private static String factionDisplayName(String value) {
        String suffix = suffixAfterPrefix(value, "Faction_");
        if (suffix == null) {
            return null;
        }

        return switch (withoutTrailingDigits(suffix)) {
            case "Aspect", "Aspects" -> "Aspects";
            case "KinOfSheredyn", "Kin" -> "Kin of Sheredyn";
            case "LastLord", "LastLords", "Lord", "Lords" -> "Last Lords";
            case "Mukag", "Tahuk", "Tahuks" -> "Tahuk";
            case "Necrophage", "Necrophages" -> "Necrophages";
            default -> null;
        };
    }

    private static String suffixAfterPrefix(String value, String prefix) {
        String normalized = trimToEmpty(value);
        if (!normalized.startsWith(prefix)) {
            return null;
        }
        String suffix = normalized.substring(prefix.length()).trim();
        return suffix.isEmpty() ? null : suffix;
    }

    private static String withoutTrailingDigits(String value) {
        return trimToEmpty(value).replaceFirst("\\d+$", "");
    }

    private static String trimToNull(String value) {
        String trimmed = trimToEmpty(value);
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
