import { getQuestCategoryKey, getQuestCategoryLabel } from "@/features/quests/questCategories";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
} from "@/types/questTypes";

export type QuestRailItemProgression = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
};

export type QuestRailItem = {
    key: string;
    entry: QuestExplorerEntry;
    progression: QuestRailItemProgression | null;
    title: string;
    chapterLabel: string;
    metaLabel: string;
    selectionEntryKeys: string[];
    order: number;
};

export type QuestRailGroup = {
    key: string;
    title: string;
    subtitle: string | null;
    order: number;
    items: QuestRailItem[];
};

function hasChapterProgression(entry: QuestExplorerEntry): boolean {
    return entry.navigation.chapter != null;
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

function progressionQuestLineLabel(questline: QuestProgressionQuestline, entry: QuestExplorerEntry): string {
    return questline.questLineName || questline.questLineKey || questLineLabel(entry);
}

function normalizeRailKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stepCountLabel(count: number): string {
    return `${count} ${count === 1 ? "step" : "steps"}`;
}

function railSectionKey(entry: QuestExplorerEntry): string {
    return getQuestCategoryKey(entry.questType);
}

function railItemScopeKey(entry: QuestExplorerEntry): string {
    return normalizeRailKey(entry.navigation.questLineKey || questLineLabel(entry) || entry.entryKey);
}

function railItemKey(entry: QuestExplorerEntry): string {
    return [
        getQuestCategoryKey(entry.questType),
        railItemScopeKey(entry),
        entry.navigation.chapterOrder ?? entry.navigation.chapter ?? "entry",
        normalizeRailKey(questTitle(entry)),
        entry.entryKey,
    ].join(":");
}

function railProgressionItemKey(
    questline: QuestProgressionQuestline,
    chapter: QuestProgressionChapter,
    entry: QuestExplorerEntry
): string {
    return [
        getQuestCategoryKey(entry.questType),
        questline.questLineFamilyKey || questline.questLineKey || railItemScopeKey(entry),
        chapter.chapterOrder ?? chapter.chapterNumber ?? "chapter",
        normalizeRailKey(chapter.title || questTitle(entry)),
    ].join(":");
}

function compareEntries(left: QuestExplorerEntry, right: QuestExplorerEntry): number {
    const sequenceDelta = left.navigation.sequenceIndex - right.navigation.sequenceIndex;
    if (sequenceDelta !== 0) return sequenceDelta;
    return left.entryKey.localeCompare(right.entryKey);
}

function entryIdentityKeys(entry: QuestExplorerEntry): string[] {
    return [entry.entryKey, ...entry.aliases].filter(Boolean);
}

function entryByIdentity(entries: QuestExplorerEntry[]): Map<string, QuestExplorerEntry> {
    const byIdentity = new Map<string, QuestExplorerEntry>();
    for (const entry of entries) {
        for (const key of entryIdentityKeys(entry)) {
            if (!byIdentity.has(key)) byIdentity.set(key, entry);
        }
    }
    return byIdentity;
}

function keysWithEntryAliases(keys: string[], byIdentity: Map<string, QuestExplorerEntry>): string[] {
    const identities: string[] = [];
    for (const key of keys) {
        identities.push(key);
        const entry = byIdentity.get(key);
        if (entry) identities.push(...entryIdentityKeys(entry));
    }
    return [...new Set(identities.filter(Boolean))];
}

function stepEntryKeys(step: QuestProgressionStep): string[] {
    return [
        step.detailEntryKey,
        ...step.sourceEntryKeys,
        ...step.aliasEntryKeys,
        ...step.variants.map((variant) => variant.entryKey),
    ].filter(Boolean);
}

function chapterEntryKeys(chapter: QuestProgressionChapter, byIdentity: Map<string, QuestExplorerEntry>): string[] {
    return keysWithEntryAliases(chapter.steps.flatMap(stepEntryKeys), byIdentity);
}

function progressionAssignedEntryKeys(
    progression: QuestExplorerProgression | null | undefined,
    byIdentity: Map<string, QuestExplorerEntry>
): Set<string> {
    const assigned = new Set<string>();
    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            for (const key of chapterEntryKeys(chapter, byIdentity)) {
                assigned.add(key);
            }
        }
    }
    return assigned;
}

function progressionBranchVariantKeys(
    progression: QuestExplorerProgression | null | undefined,
    byIdentity: Map<string, QuestExplorerEntry>
): Set<string> {
    const branchKeys = new Set<string>();
    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            for (const step of chapter.steps) {
                for (const variant of step.variants) {
                    if (variant.variantKind !== "branch_variant") continue;
                    for (const key of keysWithEntryAliases([variant.entryKey], byIdentity)) {
                        branchKeys.add(key);
                    }
                }
            }
        }
    }
    return branchKeys;
}

export function isBranchRailEntry(
    entry: QuestExplorerEntry,
    progression: QuestExplorerProgression | null | undefined
): boolean {
    const byIdentity = entryByIdentity([entry]);
    const branchKeys = progressionBranchVariantKeys(progression, byIdentity);
    return entryIdentityKeys(entry).some((key) => branchKeys.has(key));
}

export function getVisibleRailEntries(
    entries: QuestExplorerEntry[],
    progression: QuestExplorerProgression | null | undefined
): QuestExplorerEntry[] {
    const byIdentity = entryByIdentity(entries);
    const branchKeys = progressionBranchVariantKeys(progression, byIdentity);
    const assignedKeys = progressionAssignedEntryKeys(progression, byIdentity);
    const hasProgression = (progression?.questlines.length ?? 0) > 0;

    return entries.filter((entry) => {
        if (entryIdentityKeys(entry).some((key) => branchKeys.has(key))) return false;
        if (
            hasProgression &&
            getQuestCategoryKey(entry.questType) === "faction" &&
            !entryIdentityKeys(entry).some((key) => assignedKeys.has(key))
        ) {
            return false;
        }
        return true;
    });
}

export const getRailProgressionEntries = getVisibleRailEntries;

function chapterLabel(chapter: QuestProgressionChapter, entry: QuestExplorerEntry): string {
    const chapterNumber = chapter.chapterNumber ?? chapter.chapterOrder;
    return chapterNumber == null
        ? entry.navigation.chapterLabel || "Chapter"
        : `Chapter ${chapterNumber}`;
}

function chapterTitle(chapter: QuestProgressionChapter, entry: QuestExplorerEntry): string {
    return chapter.title || questTitle(entry);
}

function representativeEntryForChapter(
    chapter: QuestProgressionChapter,
    byIdentity: Map<string, QuestExplorerEntry>
): QuestExplorerEntry | null {
    for (const step of chapter.steps) {
        const detailEntry = byIdentity.get(step.detailEntryKey);
        if (detailEntry) return detailEntry;
    }

    for (const step of chapter.steps) {
        for (const variant of step.variants) {
            const variantEntry = byIdentity.get(variant.entryKey);
            if (variantEntry) return variantEntry;
        }
    }

    return null;
}

function progressionChapterOrder(chapter: QuestProgressionChapter, byIdentity: Map<string, QuestExplorerEntry>): number {
    const entryOrders = chapterEntryKeys(chapter, byIdentity)
        .map((key) => byIdentity.get(key)?.navigation.sequenceIndex)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    return Math.min(...entryOrders, chapter.chapterOrder ?? chapter.chapterNumber ?? Number.MAX_SAFE_INTEGER);
}

function addItemToGroup(groups: Map<string, QuestRailGroup>, groupKey: string, group: QuestRailGroup, item: QuestRailItem) {
    const currentItem = group.items.find((existing) => existing.key === item.key);

    if (currentItem) {
        currentItem.selectionEntryKeys = [...new Set([
            ...currentItem.selectionEntryKeys,
            ...item.selectionEntryKeys,
        ])];
    } else {
        group.items.push(item);
    }

    group.order = Math.min(group.order, item.order);
    groups.set(groupKey, group);
}

export function buildQuestRailGroups(
    entries: QuestExplorerEntry[],
    progression: QuestExplorerProgression | null | undefined,
    visibleEntryKeys: ReadonlySet<string> = new Set(entries.map((entry) => entry.entryKey))
): QuestRailGroup[] {
    const groups = new Map<string, QuestRailGroup>();
    const byIdentity = entryByIdentity(entries);
    const assignedEntryKeys = progressionAssignedEntryKeys(progression, byIdentity);

    for (const questline of progression?.questlines ?? []) {
        for (const chapter of questline.chapters) {
            const selectionEntryKeys = chapterEntryKeys(chapter, byIdentity);
            if (!selectionEntryKeys.some((key) => {
                const entry = byIdentity.get(key);
                return visibleEntryKeys.has(entry?.entryKey ?? key);
            })) {
                continue;
            }

            const representativeEntry = representativeEntryForChapter(chapter, byIdentity);
            if (!representativeEntry) continue;

            const groupKey = railSectionKey(representativeEntry);
            const group = groups.get(groupKey) ?? {
                key: groupKey,
                title: progressionQuestLineLabel(questline, representativeEntry),
                subtitle: null,
                order: progressionChapterOrder(chapter, byIdentity),
                items: [],
            };
            const itemOrder = progressionChapterOrder(chapter, byIdentity);

            addItemToGroup(groups, groupKey, group, {
                key: railProgressionItemKey(questline, chapter, representativeEntry),
                entry: representativeEntry,
                progression: { questline, chapter },
                title: chapterTitle(chapter, representativeEntry),
                chapterLabel: chapterLabel(chapter, representativeEntry),
                metaLabel: stepCountLabel(chapter.steps.length),
                selectionEntryKeys,
                order: itemOrder,
            });
        }
    }

    const visibleEntries = entries.filter((entry) => visibleEntryKeys.has(entry.entryKey));
    const fallbackEntries = getVisibleRailEntries(visibleEntries, progression)
        .filter((entry) => !entryIdentityKeys(entry).some((key) => assignedEntryKeys.has(key)))
        .sort(compareEntries);

    for (const entry of fallbackEntries) {
        const groupKey = railSectionKey(entry);
        const group = groups.get(groupKey) ?? {
            key: groupKey,
            title: questLineLabel(entry),
            subtitle: null,
            order: entry.navigation.sequenceIndex,
            items: [],
        };

        addItemToGroup(groups, groupKey, group, {
            key: railItemKey(entry),
            entry,
            progression: null,
            title: railTitle(entry),
            chapterLabel: hasChapterProgression(entry) ? entry.navigation.chapterLabel || `Chapter ${entry.navigation.chapter ?? 1}` : questLineLabel(entry),
            metaLabel: stepCountLabel(1),
            selectionEntryKeys: entryIdentityKeys(entry),
            order: entry.navigation.sequenceIndex,
        });
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
    groups: QuestRailGroup[]
): string | null {
    if (!selectedEntry) return null;

    const selectedIdentityKeys = entryIdentityKeys(selectedEntry);
    const selectedRailItem = groups
        .flatMap((group) => group.items)
        .find((item) => selectedIdentityKeys.some((key) => item.selectionEntryKeys.includes(key)));

    return selectedRailItem?.entry.entryKey ?? null;
}
