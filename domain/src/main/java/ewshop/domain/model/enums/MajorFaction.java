package ewshop.domain.model.enums;

public enum MajorFaction {

    ASPECTS("Aspects"),
    KIN("Kin"),
    LORDS("Lords"),
    NECROPHAGES("Necrophages"),
    TAHUK("Tahuk"),
    TORMENTED("Tormented");

    private final String displayName;

    MajorFaction(String displayName) {
        this.displayName = displayName;
    }

    /** Canonical in-game name (what you want stored/displayed). */
    public String getDisplayName() {
        return displayName;
    }

    /** Canonical asset prefix slug (matches your PNG filenames). */
    public String getSlug() {
        return displayName
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
    }

    /**
     * Maps raw engine/import strings to canonical enum.
     * Accepts common singular/plural variants where necessary.
     */
    public static MajorFaction parseImportedMajorFaction(String raw) {
        if (raw == null || raw.isBlank()) return null;

        return switch (raw.trim()) {
            case "Aspect","Aspects" -> ASPECTS;
            case "KinOfSheredyn","Kin" -> KIN;
            case "LastLord","Lords","Lord" -> LORDS;
            case "Mukag","Tahuk" -> TAHUK;
            case "Necrophage","Necrophages" -> NECROPHAGES;
            case "Tormented" -> TORMENTED;

            // explicitly ignore / block
            case "Placeholder" -> null;

            default -> throw new IllegalArgumentException(
                    "Unknown imported major faction: " + raw
            );
        };
    }

    public static MajorFaction fromDisplayName(String raw) {
        if (raw == null || raw.isBlank()) return null;

        return switch (raw.trim()) {
            case "Aspects" -> ASPECTS;
            case "Kin" -> KIN;
            case "Lords" -> LORDS;
            case "Necrophages" -> NECROPHAGES;
            case "Tahuk" -> TAHUK;
            case "Tormented" -> TORMENTED;
            default -> throw new IllegalArgumentException("Unknown major faction displayName: " + raw);
        };
    }
}