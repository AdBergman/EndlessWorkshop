import { type FactionInfo } from "@/types/dataTypes";
import { factionIdentityToken, factionInfoForKey } from "@/utils/factionIdentity";
import type { QuestExplorerEntry } from "@/types/questTypes";

export type QuestCategoryKey = "faction" | "minorFaction" | "world" | "other";

export type QuestCategoryOption = {
    key: QuestCategoryKey;
    label: string;
};

export const QUEST_CATEGORY_OPTIONS: QuestCategoryOption[] = [
    { key: "faction", label: "Faction Quests" },
    { key: "minorFaction", label: "Minor Faction Quests" },
    { key: "world", label: "World Quests" },
    { key: "other", label: "Other Quests" },
];

export const DEFAULT_QUEST_CATEGORY: QuestCategoryKey = "faction";

const categoryLabels = new Map(QUEST_CATEGORY_OPTIONS.map((option) => [option.key, option.label]));

const normalizeLabel = (value: string | null | undefined) =>
    (value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, " ");

export function getQuestCategoryKey(questType: string | null | undefined): QuestCategoryKey {
    switch (normalizeLabel(questType)) {
        case "faction quest":
        case "major faction":
            return "faction";
        case "minor faction":
        case "minor faction quest":
            return "minorFaction";
        case "curiosity":
            return "world";
        default:
            return "other";
    }
}

export function getQuestCategoryLabel(questType: string | null | undefined): string {
    return categoryLabels.get(getQuestCategoryKey(questType)) ?? "Other Quests";
}


function questFactionKey(entry: QuestExplorerEntry): string | null {
    if (entry.navigation.factionKey) return entry.navigation.factionKey;
    const questLine = entry.navigation.questLineKey ?? entry.entryKey;
    const match = questLine?.match(/^FactionQuest_([^_]+)/);
    return match ? `Faction_${match[1]}` : entry.navigation.factionName;
}

export function majorFactionInfoForQuest(entry: QuestExplorerEntry): FactionInfo | null {
    if (getQuestCategoryKey(entry.questType) !== "faction") return null;
    const key = questFactionKey(entry);
    return key ? factionInfoForKey(key) : null;
}

export function questMatchesSelectedMajorFaction(
    entry: QuestExplorerEntry,
    selectedFaction: FactionInfo | null | undefined
): boolean {
    if (getQuestCategoryKey(entry.questType) !== "faction") return true;
    if (!selectedFaction?.isMajor) return true;
    const selected = factionIdentityToken(selectedFaction.factionKey ?? selectedFaction.enumFaction ?? selectedFaction.uiLabel);
    if (!selected) return true;
    const quest = factionIdentityToken(questFactionKey(entry));
    if (quest === selected) return true;
    // Base selection represents a family; numeric alternate selection remains exact.
    return !/\d+$/.test(selected) && quest.replace(/\d+$/, "") === selected;
}
