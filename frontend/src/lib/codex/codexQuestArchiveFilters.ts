import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import { resolveRelatedEntries, type CodexReferenceIndexes } from "@/lib/codex/codexRefs";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

export type QuestArchiveCategory =
    | "MajorFaction"
    | "MinorFaction"
    | "Curiosity"
    | "Awakening";
export type QuestArchiveFilterValue =
    | `category:${QuestArchiveCategory}`
    | `faction:${string}`;

export type QuestCategoryFilterOption = {
    value: QuestArchiveFilterValue;
    label: string;
    count: number;
};
export type QuestCategoryFilterGroup = {
    label: string;
    options: QuestCategoryFilterOption[];
};

export const QUEST_CATEGORY_FACT_LABEL = "Category";
const QUEST_FACTION_FACT_LABEL = "Faction";

const QUEST_CATEGORY_ORDER: QuestArchiveCategory[] = [
    "MajorFaction",
    "MinorFaction",
    "Curiosity",
    "Awakening",
];

const QUEST_CATEGORY_DISPLAY_LABELS: Record<QuestArchiveCategory, string> = {
    MajorFaction: "Major Faction",
    MinorFaction: "Minor Faction",
    Curiosity: "Curiosity",
    Awakening: "Awakening",
};

function normalizeQuestArchiveCategory(value: string): QuestArchiveCategory | null {
    const trimmedValue = value.trim();
    return QUEST_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function formatQuestArchiveCategoryLabel(value: string): string {
    const category = normalizeQuestArchiveCategory(value);
    return category ? QUEST_CATEGORY_DISPLAY_LABELS[category] : value.trim();
}

function questCategoryFilterValue(category: QuestArchiveCategory): QuestArchiveFilterValue {
    return `category:${category}`;
}

function questFactionFilterValue(factionEntryKey: string): QuestArchiveFilterValue {
    return `faction:${factionEntryKey}`;
}

function parseQuestCategoryFilter(value: QuestArchiveFilterValue | null): QuestArchiveCategory | null {
    if (!value?.startsWith("category:")) return null;

    return normalizeQuestArchiveCategory(value.slice("category:".length));
}

function parseQuestFactionFilter(value: QuestArchiveFilterValue | null): string | null {
    if (!value?.startsWith("faction:")) return null;

    return value.slice("faction:".length).trim() || null;
}

function isMajorFactionQuest(entry: CodexEntry): boolean {
    return entryHasCodexFactValue(entry, QUEST_CATEGORY_FACT_LABEL, "MajorFaction");
}

function normalizeFactionLabel(value: string): string {
    return value.trim().toLowerCase();
}

function getExactMajorFactionIdentities(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): { key: string; label: string }[] {
    if (!isMajorFactionQuest(entry)) return [];

    const identities = new Map<string, { key: string; label: string }>();

    for (const relatedEntry of resolveRelatedEntries(entry, referenceIndexes)) {
        if (relatedEntry.exportKind.trim().toLowerCase() !== "factions") continue;

        identities.set(relatedEntry.entryKey, {
            key: relatedEntry.entryKey,
            label: getCodexEntryLabel(relatedEntry),
        });
    }

    for (const value of getCodexFactValues(entry, QUEST_FACTION_FACT_LABEL)) {
        const label = value.trim();
        if (!label) continue;

        const matchingResolvedIdentity = Array.from(identities.values()).find(
            (identity) => normalizeFactionLabel(identity.label) === normalizeFactionLabel(label)
        );
        if (matchingResolvedIdentity) continue;

        identities.set(`fact:${label}`, { key: `fact:${label}`, label });
    }

    return Array.from(identities.values());
}

export function buildQuestCategoryFilterGroups(
    entries: readonly CodexEntry[],
    referenceIndexes: CodexReferenceIndexes
): QuestCategoryFilterGroup[] {
    const counts = entries.reduce<Map<QuestArchiveCategory, number>>((acc, entry) => {
        const seenCategories = new Set<QuestArchiveCategory>();

        for (const value of getCodexFactValues(entry, QUEST_CATEGORY_FACT_LABEL)) {
            const category = normalizeQuestArchiveCategory(value);
            if (!category || seenCategories.has(category)) continue;

            seenCategories.add(category);
            acc.set(category, (acc.get(category) ?? 0) + 1);
        }

        return acc;
    }, new Map<QuestArchiveCategory, number>());

    const categoryOptions = QUEST_CATEGORY_ORDER.map((value) => ({
        value: questCategoryFilterValue(value),
        label: QUEST_CATEGORY_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));

    const factionCounts = new Map<string, { label: string; count: number }>();
    for (const entry of entries) {
        const seenFactionKeys = new Set<string>();
        for (const identity of getExactMajorFactionIdentities(entry, referenceIndexes)) {
            if (seenFactionKeys.has(identity.key)) continue;

            seenFactionKeys.add(identity.key);
            const current = factionCounts.get(identity.key);
            factionCounts.set(identity.key, {
                label: identity.label,
                count: (current?.count ?? 0) + 1,
            });
        }
    }

    const majorFactionOptions = Array.from(factionCounts.entries())
        .map(([key, value]) => ({
            value: questFactionFilterValue(key),
            label: value.label,
            count: value.count,
        }))
        .sort((left, right) => left.label.localeCompare(right.label));

    return [
        {
            label: "Quest Category",
            options: categoryOptions,
        },
        ...(majorFactionOptions.length > 0
            ? [{ label: "Major Faction", options: majorFactionOptions }]
            : []),
    ];
}

export function filterQuestEntriesByCategory(
    entries: readonly CodexEntry[],
    activeCategory: QuestArchiveFilterValue | null,
    referenceIndexes: CodexReferenceIndexes
): CodexEntry[] {
    if (!activeCategory) return [...entries];

    const categoryFilter = parseQuestCategoryFilter(activeCategory);
    if (categoryFilter) {
        return entries.filter((entry) =>
            entryHasCodexFactValue(entry, QUEST_CATEGORY_FACT_LABEL, categoryFilter)
        );
    }

    const factionFilter = parseQuestFactionFilter(activeCategory);
    if (factionFilter) {
        return entries.filter((entry) =>
            getExactMajorFactionIdentities(entry, referenceIndexes).some((identity) =>
                identity.key === factionFilter
            )
        );
    }

    return [...entries];
}
