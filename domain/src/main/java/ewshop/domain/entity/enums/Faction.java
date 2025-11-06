package ewshop.domain.entity.enums;

public enum Faction {
    ASPECTS,
    KIN,
    LORDS,
    NECROPHAGES,
    TAHUK;

    public String getDisplayName() {
        String lower = name().toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    public static Faction fromString(String value) {
        if (value == null) return null;
        return Faction.valueOf(value.trim().toUpperCase());
    }
}
