package ewshop.domain.model.enums;

public enum MinorFaction {

    AMETRINE,
    BLACKHAMMER,
    DAUGHTER_OF_BOR,
    DUNGEON,
    FOUNDLING,
    GOROG,
    GREEN_SCION,
    GREEN_SCIONS,
    HOY_AND_LADHRAN,
    HYDRACORN,
    NOQUENSII,
    OCHLING,
    ONEIROI,
    SOLLUSK,
    THE_CONSORTIUM,
    UNSEEING_SEER,
    XAVIUS;

    public String getDisplayName() {
        String lower = name().toLowerCase().replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    public static MinorFaction fromString(String value) {
        if (value == null) return null;
        return MinorFaction.valueOf(value.trim().toUpperCase());
    }

    public static MinorFaction parseImportedMinorFaction(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String normalized = raw.trim();

        return switch (normalized) {
            case "Ametrine" -> AMETRINE;
            case "Blackhammer" -> BLACKHAMMER;
            case "DaughterOfBor" -> DAUGHTER_OF_BOR;
            case "Dungeon" -> DUNGEON;
            case "Foundling" -> FOUNDLING;
            case "Gorog" -> GOROG;
            case "GreenScion" -> GREEN_SCION;
            case "GreenScions" -> GREEN_SCIONS;
            case "HoyAndLadhran" -> HOY_AND_LADHRAN;
            case "Hydracorn" -> HYDRACORN;
            case "Noquensii" -> NOQUENSII;
            case "Ochling" -> OCHLING; // handles trimmed version automatically
            case "Oneiroi" -> ONEIROI;
            case "Sollusk" -> SOLLUSK;
            case "TheConsortium" -> THE_CONSORTIUM;
            case "UnseeingSeer" -> UNSEEING_SEER;
            case "Xavius" -> XAVIUS;

            // explicitly blocked
            case "MangroveOfHarmony" -> null;

            default -> throw new IllegalArgumentException(
                    "Unknown imported minor faction: " + raw
            );
        };
    }
}