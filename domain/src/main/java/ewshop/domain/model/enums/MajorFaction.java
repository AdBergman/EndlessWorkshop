package ewshop.domain.model.enums;

public enum MajorFaction {
    ASPECTS,
    KIN,
    LORDS,
    NECROPHAGES,
    TAHUK,
    TORMENTED;

    public String getDisplayName() {
        String lower = name().toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    public static MajorFaction fromString(String value) {
        if (value == null) return null;
        return MajorFaction.valueOf(value.trim().toUpperCase());
    }

    public static MajorFaction parseImportedMajorFaction(String raw) {
        if (raw == null || raw.isBlank()) return null;

        return switch (raw.trim()) {
            case "Aspect" -> ASPECTS;
            case "KinOfSheredyn" -> KIN;
            case "LastLord" -> LORDS;
            case "Mukag" -> TAHUK;
            case "Necrophage" -> NECROPHAGES;
            case "Tormented" -> TORMENTED;

            // explicitly ignore / block
            case "Placeholder" -> null;

            default -> throw new IllegalArgumentException(
                    "Unknown imported major faction: " + raw
            );
        };
    }
}