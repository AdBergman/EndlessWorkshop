import { Faction, type FactionInfo } from "@/types/dataTypes";
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

const normalizeToken = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const majorFactionAliases: Record<Faction, string[]> = {
    [Faction.KIN]: ["kin", "kinofsheredyn", "sheredyn"],
    [Faction.LORDS]: ["lords", "lastlord", "lastlords"],
    [Faction.TAHUK]: ["tahuk", "tahuks", "mukag"],
    [Faction.ASPECTS]: ["aspect", "aspects"],
    [Faction.NECROPHAGES]: ["necrophage", "necrophages"],
};

const majorFactionLabels: Record<Faction, string> = {
    [Faction.KIN]: "Kin",
    [Faction.LORDS]: "Lords",
    [Faction.TAHUK]: "Tahuk",
    [Faction.ASPECTS]: "Aspects",
    [Faction.NECROPHAGES]: "Necrophages",
};

function selectedFactionAliases(selectedFaction: FactionInfo | null | undefined): string[] {
    if (!selectedFaction?.isMajor || !selectedFaction.enumFaction) return [];

    return [
        selectedFaction.uiLabel,
        selectedFaction.enumFaction,
        ...majorFactionAliases[selectedFaction.enumFaction],
    ].map(normalizeToken).filter(Boolean);
}

function questFactionTokens(entry: QuestExplorerEntry): string[] {
    return [
        entry.navigation.factionKey,
        entry.navigation.factionName,
        entry.navigation.questLineKey,
        entry.navigation.questLineName,
        entry.entryKey,
    ].map(normalizeToken).filter(Boolean);
}

export function majorFactionInfoForQuest(entry: QuestExplorerEntry): FactionInfo | null {
    if (getQuestCategoryKey(entry.questType) !== "faction") return null;

    const tokens = questFactionTokens(entry);
    const matchingFaction = Object.values(Faction).find((faction) => {
        const aliases = [faction, ...majorFactionAliases[faction]].map(normalizeToken);
        return tokens.some((token) =>
            aliases.some((alias) => token.includes(alias))
        );
    });

    if (!matchingFaction) return null;

    return {
        isMajor: true,
        enumFaction: matchingFaction,
        uiLabel: majorFactionLabels[matchingFaction],
        minorName: null,
    };
}

export function questMatchesSelectedMajorFaction(
    entry: QuestExplorerEntry,
    selectedFaction: FactionInfo | null | undefined
): boolean {
    if (getQuestCategoryKey(entry.questType) !== "faction") return true;

    const aliases = selectedFactionAliases(selectedFaction);
    if (aliases.length === 0) return true;

    const tokens = questFactionTokens(entry);

    return tokens.some((token) =>
        aliases.some((alias) => token.includes(alias))
    );
}
