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

    public static MajorFaction parseImportedMajorFaction(String raw) {
        return FactionNamePolicy.parseImportedMajorFaction(raw);
    }

    public static MajorFaction fromDisplayName(String raw) {
        return FactionNamePolicy.parseImportedMajorFaction(raw);
    }
}
