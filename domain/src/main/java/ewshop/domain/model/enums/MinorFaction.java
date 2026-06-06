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
    MANGROVE_OF_HARMONY("Mangrove of Harmony"),
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

    public String getDisplayName() {
        return displayName;
    }

    public String getSlug() {
        return displayName
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
    }

    public static MinorFaction parseImportedMinorFaction(String raw) {
        String displayName = FactionNamePolicy.canonicalMinorDisplayName(raw);
        if (displayName == null) return null;

        for (MinorFaction faction : values()) {
            if (faction.getDisplayName().equals(displayName)) {
                return faction;
            }
        }

        throw new IllegalArgumentException("Unknown imported minor faction: " + raw);
    }
}
