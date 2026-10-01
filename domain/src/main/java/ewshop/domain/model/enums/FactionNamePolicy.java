package ewshop.domain.model.enums;

import java.util.Map;
import java.util.Set;

import static java.util.Map.entry;

public final class FactionNamePolicy {

    private static final Set<String> BLOCKED_MAJOR_FACTIONS = Set.of("Placeholder");
    private static final Set<String> BLOCKED_MINOR_FACTIONS = Set.of();

    // Compatibility aliases for older exports and saved builds; never an import allow-list.
    private static final Map<String, MajorFaction> MAJOR_FACTION_ALIASES = Map.ofEntries(
            entry("Aspect", MajorFaction.ASPECTS),
            entry("Aspects", MajorFaction.ASPECTS),
            entry("ASPECTS", MajorFaction.ASPECTS),
            entry("KinOfSheredyn", MajorFaction.KIN),
            entry("Kin", MajorFaction.KIN),
            entry("KIN", MajorFaction.KIN),
            entry("LastLord", MajorFaction.LORDS),
            entry("Lords", MajorFaction.LORDS),
            entry("Lord", MajorFaction.LORDS),
            entry("LORDS", MajorFaction.LORDS),
            entry("Mukag", MajorFaction.TAHUK),
            entry("Tahuk", MajorFaction.TAHUK),
            entry("TAHUK", MajorFaction.TAHUK),
            entry("Necrophage", MajorFaction.NECROPHAGES),
            entry("Necrophages", MajorFaction.NECROPHAGES),
            entry("NECROPHAGES", MajorFaction.NECROPHAGES),
            entry("Tormented", MajorFaction.TORMENTED),
            entry("TORMENTED", MajorFaction.TORMENTED)
    );

    private static final Map<String, String> MINOR_FACTION_ALIASES = Map.ofEntries(
            entry("Ametrine", "Ametrine"),
            entry("Blackhammer", "Blackhammers"),
            entry("Blackhammers", "Blackhammers"),
            entry("Consortium", "Consortium"),
            entry("TheConsortium", "Consortium"),
            entry("DaughterOfBor", "Daughters of Bor"),
            entry("DaughtersOfBor", "Daughters of Bor"),
            entry("Dungeon", "Dungeon"),
            entry("Foundling", "Foundlings"),
            entry("Foundlings", "Foundlings"),
            entry("Gorog", "Gorog"),
            entry("Gorogs", "Gorog"),
            entry("GreenScion", "Green Scions"),
            entry("GreenScions", "Green Scions"),
            entry("HoyAndLadhran", "Hoy and Ladhran"),
            entry("Hydracorn", "Hydracorn"),
            entry("Hydracorns", "Hydracorn"),
            entry("MangroveOfHarmony", "Mangrove of Harmony"),
            entry("Noquensii", "Noquensii"),
            entry("Ochling", "Ochling"),
            entry("Ochlings", "Ochling"),
            entry("Oneiroi", "Oneiroi"),
            entry("Sollusk", "Sollusk"),
            entry("UnseeingSeer", "Unseeing Seers"),
            entry("UnseeingSeers", "Unseeing Seers"),
            entry("Xavius", "Xavius")
    );

    private FactionNamePolicy() {}

    public static MajorFaction parseImportedMajorFaction(String raw) {
        String value = trimToNull(raw);
        if (value == null) return null;
        if (BLOCKED_MAJOR_FACTIONS.contains(value)) return null;

        MajorFaction faction = knownMajorFaction(value);
        if (faction == null) {
            throw new IllegalArgumentException("Unknown imported major faction: " + raw);
        }
        return faction;
    }

    public static String canonicalMajorDisplayName(String raw) {
        return canonicalMajorDisplayNameOrSelf(raw);
    }

    public static String canonicalMajorDisplayNameOrSelf(String raw) {
        String value = trimToNull(raw);
        if (value == null) return null;

        MajorFaction known = knownMajorFaction(value);
        if (known != null) return known.getDisplayName();
        if (BLOCKED_MAJOR_FACTIONS.contains(withoutPrefix(value, "Faction_", "Faction "))) return null;

        return humanizeFactionKey(withoutPrefix(value, "Faction_", "Faction "));
    }

    public static String canonicalSavedFactionOrSelf(String raw) {
        String value = trimToNull(raw);
        if (value == null) return null;
        MajorFaction known = knownMajorFaction(value);
        return known == null ? value : known.getDisplayName();
    }

    public static String canonicalMinorDisplayName(String raw) {
        String value = trimToNull(raw);
        if (value == null) return null;
        value = withoutPrefix(value, "MinorFaction_", "MinorFaction ");
        if (BLOCKED_MINOR_FACTIONS.contains(value)) return null;
        return MINOR_FACTION_ALIASES.getOrDefault(value, humanizeFactionKey(value));
    }

    public static String bestEffortMajorDisplayName(String raw) {
        try {
            return canonicalMajorDisplayName(raw);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    public static String bestEffortMinorDisplayName(String raw) {
        try {
            return canonicalMinorDisplayName(raw);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private static String trimToNull(String raw) {
        if (raw == null) return null;
        String value = raw.trim();
        return value.isEmpty() ? null : value;
    }

    private static MajorFaction knownMajorFaction(String value) {
        MajorFaction exactMatch = MAJOR_FACTION_ALIASES.get(value);
        if (exactMatch != null) return exactMatch;

        if (value.startsWith("Faction_") || value.startsWith("Faction ")) {
            return MAJOR_FACTION_ALIASES.get(value.substring("Faction_".length()));
        }

        return null;
    }

    private static String withoutPrefix(String value, String... prefixes) {
        for (String prefix : prefixes) {
            if (value.startsWith(prefix)) return value.substring(prefix.length());
        }
        return value;
    }

    private static String humanizeFactionKey(String value) {
        return value
                .replaceAll("([a-z0-9])([A-Z])", "$1 $2")
                .replace('_', ' ')
                .replace('-', ' ')
                .replaceAll("\\s+", " ")
                .trim();
    }
}
