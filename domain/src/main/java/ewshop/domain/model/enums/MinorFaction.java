package ewshop.domain.model.enums;

public enum MinorFaction {

    AMETRINE("Ametrine"),
    BLACKHAMMERS("Blackhammers"),
    CONSORTIUM("Consortium"),
    DAUGHTERS_OF_BOR("Daughters of Bor"),
    DUNGEON("Dungeon"),
    FOUNDLINGS("Foundlings"),
    GOROG("Gorog"),
    GREEN_SCIONS("Green Scions"),
    HOY_AND_LADHRAN("Hoy and Ladhran"),
    HYDRACORN("Hydracorn"),
    NOQUENSII("Noquensii"),
    OCHLING("Ochling"),
    ONEIROI("Oneiroi"),
    SOLLUSK("Sollusk"),
    UNSEEING_SEERS("Unseeing Seers"),
    XAVIUS("Xavius");

    private final String displayName;

    MinorFaction(String displayName) {
        this.displayName = displayName;
    }

    /** Canonical in-game name (what you want stored/displayed). */
    public String getDisplayName() {
        return displayName;
    }

    /** Canonical asset slug (matches your PNG filenames). */
    public String getSlug() {
        return displayName
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
    }

    /**
     * Maps raw engine/import strings to canonical enum.
     * Accepts both singular and plural variants where necessary.
     */
    public static MinorFaction parseImportedMinorFaction(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String normalized = raw.trim();

        return switch (normalized) {
            case "Ametrine" -> AMETRINE;
            case "Blackhammer", "Blackhammers" -> BLACKHAMMERS;
            case "Consortium", "TheConsortium" -> CONSORTIUM;
            case "DaughterOfBor", "DaughtersOfBor" -> DAUGHTERS_OF_BOR;
            case "Dungeon" -> DUNGEON;
            case "Foundling", "Foundlings" -> FOUNDLINGS;
            case "Gorog", "Gorogs" -> GOROG;
            case "GreenScion", "GreenScions" -> GREEN_SCIONS;
            case "HoyAndLadhran" -> HOY_AND_LADHRAN;
            case "Hydracorn", "Hydracorns" -> HYDRACORN;
            case "Noquensii" -> NOQUENSII;
            case "Ochling", "Ochlings" -> OCHLING;
            case "Oneiroi" -> ONEIROI;
            case "Sollusk" -> SOLLUSK;
            case "UnseeingSeer", "UnseeingSeers" -> UNSEEING_SEERS;
            case "Xavius" -> XAVIUS;

            // explicitly blocked
            case "MangroveOfHarmony" -> null;

            default -> throw new IllegalArgumentException(
                    "Unknown imported minor faction: " + raw
            );
        };
    }
}