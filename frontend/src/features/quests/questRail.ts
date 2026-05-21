import { getQuestCategoryKey, getQuestCategoryLabel } from "@/features/quests/questCategories";
import type { QuestExplorerEntry } from "@/types/questTypes";

export type QuestRailItem = {
    key: string;
    entry: QuestExplorerEntry;
    title: string;
    chapterLabel: string;
    metaLabel: string;
    canonicalEntryKeys: string[];
    order: number;
};

export type QuestRailGroup = {
    key: string;
    title: string;
    subtitle: string | null;
    order: number;
    items: QuestRailItem[];
};

const choiceEntryPattern = /(?:^|_)Choice\d*$/i;
const chapterKeyPattern = /^(.+?)_Chapter/i;
const numericVariantPattern = /\d+$/;

function hasChapterProgression(entry: QuestExplorerEntry): boolean {
    return entry.navigation.chapter != null;
}

function chapterLabel(entry: QuestExplorerEntry): string {
    return entry.navigation.chapterLabel || `Chapter ${entry.navigation.chapter ?? 1}`;
}

function questTitle(entry: QuestExplorerEntry): string {
    return entry.title.trim() || "Untitled Quest";
}

function railTitle(entry: QuestExplorerEntry): string {
    return questTitle(entry);
}

function questLineLabel(entry: QuestExplorerEntry): string {
    return entry.navigation.questLineName || entry.navigation.questLineKey || getQuestCategoryLabel(entry.questType);
}

function normalizeRailKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isChoicePermutation(entry: QuestExplorerEntry): boolean {
    return choiceEntryPattern.test(entry.entryKey);
}

function questLineFamilyKey(entry: QuestExplorerEntry): string {
    const rawKey = entry.navigation.questLineKey || entry.entryKey;
    const questLineKey = rawKey.match(chapterKeyPattern)?.[1] ?? rawKey;
    return normalizeRailKey(questLineKey.replace(numericVariantPattern, ""));
}

export function isBranchRailEntry(entry: QuestExplorerEntry): boolean {
    return entry.navigation.branchOrder != null || isChoicePermutation(entry);
}

export function getVisibleRailEntries(entries: QuestExplorerEntry[]): QuestExplorerEntry[] {
    return entries.filter((entry) => {
        if (isBranchRailEntry(entry)) return false;
        if (getQuestCategoryKey(entry.questType) === "faction" && !hasChapterProgression(entry)) return false;
        return true;
    });
}

export const getRailProgressionEntries = getVisibleRailEntries;

function railSectionKey(entry: QuestExplorerEntry): string {
    return getQuestCategoryKey(entry.questType);
}

function railItemScopeKey(entry: QuestExplorerEntry): string {
    return normalizeRailKey(entry.navigation.questLineKey || questLineLabel(entry) || entry.entryKey);
}

function railItemKey(entry: QuestExplorerEntry): string {
    if (hasChapterProgression(entry)) {
        if (getQuestCategoryKey(entry.questType) === "faction") {
            return [
                getQuestCategoryKey(entry.questType),
                questLineFamilyKey(entry),
                normalizeRailKey(questTitle(entry)),
            ].join(":");
        }

        return [
            getQuestCategoryKey(entry.questType),
            railItemScopeKey(entry),
            entry.navigation.chapterOrder ?? entry.navigation.chapter ?? "chapter",
            entry.entryKey,
        ].join(":");
    }

    return [
        getQuestCategoryKey(entry.questType),
        normalizeRailKey(questLineLabel(entry)),
        normalizeRailKey(questTitle(entry)),
        entry.entryKey,
    ].join(":");
}

function compareEntries(left: QuestExplorerEntry, right: QuestExplorerEntry): number {
    const sequenceDelta = left.navigation.sequenceIndex - right.navigation.sequenceIndex;
    if (sequenceDelta !== 0) return sequenceDelta;
    return left.entryKey.localeCompare(right.entryKey);
}

function hasNumericQuestLineVariant(entry: QuestExplorerEntry): boolean {
    return numericVariantPattern.test(entry.navigation.questLineKey ?? "");
}

function compareRepresentativeEntries(left: QuestExplorerEntry, right: QuestExplorerEntry): number {
    const variantDelta = Number(hasNumericQuestLineVariant(left)) - Number(hasNumericQuestLineVariant(right));
    if (variantDelta !== 0) return variantDelta;

    const chapterDelta = (left.navigation.chapterOrder ?? left.navigation.chapter ?? Number.MAX_SAFE_INTEGER) -
        (right.navigation.chapterOrder ?? right.navigation.chapter ?? Number.MAX_SAFE_INTEGER);
    if (chapterDelta !== 0) return chapterDelta;

    return compareEntries(left, right);
}

function objectiveCount(entry: QuestExplorerEntry): number {
    return entry.strategyView.objectives.length;
}

function contentCountLabel(count: number, singular: string, plural: string): string | null {
    if (count <= 0) return null;
    return `${count} ${count === 1 ? singular : plural}`;
}

function railMetaLabel(entry: QuestExplorerEntry): string {
    const labels = [
        contentCountLabel(objectiveCount(entry), "objective", "objectives"),
        contentCountLabel(entry.branches.length, "branch", "branches"),
    ].filter((label): label is string => Boolean(label));

    return labels.join(" · ") || "No objectives";
}

function entryIdentityKeys(entry: QuestExplorerEntry): string[] {
    return [entry.entryKey, ...entry.aliases].filter(Boolean);
}

export function buildQuestRailGroups(entries: QuestExplorerEntry[]): QuestRailGroup[] {
    const groups = new Map<string, QuestRailGroup>();
    const itemEntries = new Map<string, QuestExplorerEntry[]>();

    const visibleEntries = getVisibleRailEntries(entries).sort(compareEntries);
    for (const entry of visibleEntries) {
        const itemKey = railItemKey(entry);
        itemEntries.set(itemKey, [...(itemEntries.get(itemKey) ?? []), entry]);
    }

    const representativeEntries = [...itemEntries.values()]
        .map((bucket) => [...bucket].sort(compareRepresentativeEntries)[0])
        .filter(Boolean)
        .sort(compareEntries);

    for (const entry of representativeEntries) {
        const groupKey = railSectionKey(entry);
        const itemKey = railItemKey(entry);
        const chapterEntries = itemEntries.get(itemKey) ?? [entry];
        const itemEntryKeys = chapterEntries.flatMap(entryIdentityKeys);
        const currentGroup = groups.get(groupKey);
        const group = currentGroup ?? {
            key: groupKey,
            title: questLineLabel(entry),
            subtitle: null,
            order: entry.navigation.sequenceIndex,
            items: [],
        };
        const currentItem = group.items.find((item) => item.key === itemKey);

        if (currentItem) {
            currentItem.canonicalEntryKeys = [...new Set([
                ...currentItem.canonicalEntryKeys,
                ...itemEntryKeys,
            ])];
            continue;
        }

        group.items.push({
            key: itemKey,
            entry,
            title: railTitle(entry),
            chapterLabel: hasChapterProgression(entry) ? chapterLabel(entry) : questLineLabel(entry),
            metaLabel: railMetaLabel(entry),
            canonicalEntryKeys: [...new Set(itemEntryKeys)],
            order: entry.navigation.sequenceIndex,
        });

        group.order = Math.min(group.order, entry.navigation.sequenceIndex);
        groups.set(groupKey, group);
    }

    return [...groups.values()]
        .map((group) => ({
            ...group,
            items: [...group.items].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title)),
        }))
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

export function resolveRailSelectionKey(
    selectedEntry: QuestExplorerEntry | null,
    groups: QuestRailGroup[],
    entriesByKey: Record<string, QuestExplorerEntry>
): string | null {
    if (!selectedEntry) return null;

    const railItems = groups.flatMap((group) => group.items);
    const selectedRailItem = railItems.find((item) => item.canonicalEntryKeys.includes(selectedEntry.entryKey));
    if (selectedRailItem) return selectedRailItem.entry.entryKey;

    const candidates = [
        selectedEntry.navigation.branchGroupKey,
        ...selectedEntry.navigation.previousEntryKeys,
        ...selectedEntry.navigation.convergesIntoEntryKeys,
        ...selectedEntry.navigation.nextEntryKeys,
    ].filter((key): key is string => Boolean(key));

    for (const candidate of candidates) {
        const resolvedEntryKey = entriesByKey[candidate]?.entryKey ?? candidate;
        const candidateRailItem = railItems.find((item) => item.canonicalEntryKeys.includes(resolvedEntryKey));
        if (candidateRailItem) return candidateRailItem.entry.entryKey;
    }

    const sameChapter = railItems.find((item) =>
        item.entry.navigation.chapter != null &&
        item.entry.navigation.chapter === selectedEntry.navigation.chapter &&
        questTitle(item.entry) === questTitle(selectedEntry)
    );

    return sameChapter?.entry.entryKey ?? null;
}
