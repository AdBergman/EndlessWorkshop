package ewshop.domain.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class PublicReleaseFactionPolicy {

    private static final List<String> RELEASED_MAJOR_FACTION_DISPLAY_NAMES = List.of(
            "Kin",
            "Aspects",
            "Lords",
            "Necrophages",
            "Tahuk"
    );

    // Temporary release-safety gate until future factions are publicly released.
    private static final List<String> RELEASED_FACTION_ACTION_PREFIXES = List.of(
            "FactionActionTypeKinOfSheredyn_",
            "FactionActionTypeMukag_",
            "FactionActionTypeAspect_",
            "FactionActionTypeLastLord_",
            "FactionActionTypeNecrophage_"
    );

    private static final List<String> RELEASED_EMPIRE_ACTION_PREFIXES = List.of(
            "EmpireActionTypeKinOfSheredyn_",
            "EmpireActionTypeMukag_",
            "EmpireActionTypeAspect_",
            "EmpireActionTypeLastLord_",
            "EmpireActionTypeNecrophage_"
    );

    private static final List<String> RELEASED_FACTION_TRAIT_PREFIXES = List.of(
            "FactionTrait_KinOfSheredyn_",
            "FactionTrait_Mukag_",
            "FactionTrait_Aspect_",
            "FactionTrait_Aspects_",
            "FactionTrait_LastLord_",
            "FactionTrait_Necrophage_",
            "FactionTrait_Custom_Specific_Mukag",
            "FactionTrait_StartingTech_Technology_Necrophage_",
            "FactionTrait_VictoryCondition_GlorifyReward02_LastLord"
    );

    private static final List<String> RELEASED_FACTION_QUEST_PREFIXES = List.of(
            "FactionQuest_KinOfSheredyn_",
            "FactionQuest_KinOfSheredyn02_",
            "FactionQuest_Mukag_",
            "FactionQuest_Aspect_",
            "FactionQuest_LastLord_",
            "FactionQuest_Necrophage_",
            "FactionQuest_Necrophage02_"
    );

    private static final List<String> RELEASED_FACTION_QUEST_ROOT_KEYS = List.of(
            "FactionQuest_KinOfSheredyn",
            "FactionQuest_KinOfSheredyn02",
            "FactionQuest_Mukag",
            "FactionQuest_Aspect",
            "FactionQuest_LastLord",
            "FactionQuest_Necrophage",
            "FactionQuest_Necrophage02"
    );

    private PublicReleaseFactionPolicy() {}

    public static Set<String> releasedMajorFactionDisplayNames() {
        return new LinkedHashSet<>(RELEASED_MAJOR_FACTION_DISPLAY_NAMES);
    }

    public static boolean isReleasedActionKey(String entryKey) {
        String key = trimToEmpty(entryKey);
        if (key.startsWith("FactionActionType")) {
            return RELEASED_FACTION_ACTION_PREFIXES.stream()
                    .anyMatch(key::startsWith);
        }

        if (key.startsWith("EmpireActionType")) {
            return RELEASED_EMPIRE_ACTION_PREFIXES.stream()
                    .anyMatch(key::startsWith);
        }

        return true;
    }

    public static boolean isReleasedFactionTraitKey(String entryKey) {
        String key = trimToEmpty(entryKey);
        if (!key.startsWith("FactionTrait_")) return true;

        return RELEASED_FACTION_TRAIT_PREFIXES.stream()
                .anyMatch(key::startsWith);
    }

    public static boolean isReleasedFactionQuestKey(String entryKey) {
        String key = trimToEmpty(entryKey);
        if (!key.startsWith("FactionQuest_")) return true;

        return RELEASED_FACTION_QUEST_ROOT_KEYS.contains(key)
                || RELEASED_FACTION_QUEST_PREFIXES.stream()
                .anyMatch(key::startsWith);
    }

    public static boolean isReleasedBonusKey(String entryKey) {
        String key = trimToEmpty(entryKey);
        if (key.startsWith("FactionTrait_")) return isReleasedFactionTraitKey(key);
        if (key.startsWith("FactionQuest_")) return isReleasedFactionQuestKey(key);
        if (key.startsWith("ActionCostModifier_FactionActionType")) {
            return isReleasedActionKey(key.substring("ActionCostModifier_".length()));
        }
        if (key.startsWith("ActionCostModifier_EmpireActionType")) {
            return isReleasedActionKey(key.substring("ActionCostModifier_".length()));
        }
        if (key.startsWith("DiplomaticCostModifier_FactionQuest_")) {
            return isReleasedFactionQuestKey(key.substring("DiplomaticCostModifier_".length()));
        }

        return true;
    }

    public static boolean isPublicCodexRelationshipKey(String key) {
        return isReleasedActionKey(key)
                && isReleasedFactionTraitKey(key)
                && isReleasedFactionQuestKey(key)
                && isReleasedBonusKey(key);
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
