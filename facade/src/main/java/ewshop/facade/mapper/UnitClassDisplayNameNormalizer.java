package ewshop.facade.mapper;

final class UnitClassDisplayNameNormalizer {

    private static final String UNIT_CLASS_PREFIX = "UnitClass_";

    private UnitClassDisplayNameNormalizer() {}

    static String normalize(String unitClassKey) {
        String value = trimToNull(unitClassKey);
        if (value == null) return null;

        if (value.startsWith(UNIT_CLASS_PREFIX)) {
            value = value.substring(UNIT_CLASS_PREFIX.length());
        }

        value = value.replace('_', ' ').replace('-', ' ');
        value = value.replaceAll("(?<=[a-z])(?=[A-Z])", " ");
        value = value.replaceAll("(?<=[A-Z])(?=[A-Z][a-z])", " ");
        value = value.replaceAll("\\s+", " ").trim();

        if (value.isEmpty()) return null;
        return titleCase(value);
    }

    private static String titleCase(String value) {
        String[] words = value.split(" ");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty()) continue;
            if (!result.isEmpty()) result.append(' ');
            result.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                result.append(word.substring(1).toLowerCase());
            }
        }

        return result.toString();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
