import type { QuestChronicleEntryDto } from "@/types/questTypes";
import {
    buildProgressionRail,
    compactEntityLabel,
    compareQuestOrder,
    formatChapterLabel,
    getQuestPathContextLabel,
    getQuestTitle,
} from "./questViewModel";
import type { QuestProgressionRailModel } from "./questExplorerTypes";

export const QUEST_ARCHIVE_ALL = "__all__";

export type QuestArchiveFilters = {
    searchText: string;
    faction: string;
    category: string;
    chapter: string;
    branchVariant: string;
};

export type QuestArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type QuestArchiveCounts = {
    totalGroups: number;
    visibleGroups: number;
    totalRecords: number;
    visibleRecords: number;
};

export type QuestArchiveModel = {
    rail: QuestProgressionRailModel;
    filters: QuestArchiveFilters;
    factionOptions: QuestArchiveFilterOption[];
    categoryOptions: QuestArchiveFilterOption[];
    chapterOptions: QuestArchiveFilterOption[];
    branchVariantOptions: QuestArchiveFilterOption[];
    counts: QuestArchiveCounts;
    hasActiveFilters: boolean;
    selectedOutsideFilters: boolean;
};

export const defaultQuestArchiveFilters: QuestArchiveFilters = {
    searchText: "",
    faction: QUEST_ARCHIVE_ALL,
    category: QUEST_ARCHIVE_ALL,
    chapter: QUEST_ARCHIVE_ALL,
    branchVariant: QUEST_ARCHIVE_ALL,
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const normalizeSearch = (value: string): string =>
    clean(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const unique = (values: readonly string[]): string[] =>
    values.filter((value, index) => value.length > 0 && values.indexOf(value) === index);

const formatCountLabel = (count: number, singular: string): string =>
    `${count} ${singular}${count === 1 ? "" : "s"}`;

function getCategoryLabel(quest: QuestChronicleEntryDto): string | null {
    return clean(quest.questType) || null;
}

function getFactionLabel(quest: QuestChronicleEntryDto): string | null {
    return compactEntityLabel(quest.factionKey) || null;
}

function getBranchLabel(quest: QuestChronicleEntryDto): string | null {
    return getQuestPathContextLabel(quest);
}

function searchableText(quest: QuestChronicleEntryDto): string {
    return [
        quest.entryKey,
        quest.primaryQuestKey,
        ...quest.sourceQuestKeys,
        getQuestTitle(quest),
        quest.questType,
        quest.factionKey,
        quest.questLineKey,
        quest.branchLabel,
        ...quest.summaryLines,
        ...quest.objectives.flatMap((objective) => [
            objective.objectiveText,
            ...objective.descriptionLines,
            ...objective.completionLines,
            ...objective.selectionLines,
            ...objective.rewardLines,
        ]),
        ...quest.paths.flatMap((path) => [
            path.label,
            ...path.conditionLines,
            ...path.rewardLines,
        ]),
    ].filter((value): value is string => Boolean(clean(value))).join(" ");
}

function matchesSearch(quest: QuestChronicleEntryDto, searchText: string): boolean {
    const tokens = normalizeSearch(searchText).split(/\s+/g).filter(Boolean);
    if (tokens.length === 0) return true;
    const haystack = normalizeSearch(searchableText(quest));
    return tokens.every((token) => haystack.includes(token));
}

function optionCounts(
    quests: QuestChronicleEntryDto[],
    getValue: (quest: QuestChronicleEntryDto) => string | null
): QuestArchiveFilterOption[] {
    const counts = new Map<string, number>();
    quests.forEach((quest) => {
        const value = getValue(quest);
        if (!value) return;
        counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()]
        .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }))
        .map(([value, count]) => ({ value, label: value, count }));
}

function normalizeFilters(filters: QuestArchiveFilters, quests: QuestChronicleEntryDto[]): QuestArchiveFilters {
    const factionValues = new Set(optionCounts(quests, getFactionLabel).map((option) => option.value));
    const categoryValues = new Set(optionCounts(quests, getCategoryLabel).map((option) => option.value));
    const chapterValues = new Set(optionCounts(quests, formatChapterLabel).map((option) => option.value));
    const branchValues = new Set(optionCounts(quests, getBranchLabel).map((option) => option.value));

    return {
        searchText: filters.searchText,
        faction: filters.faction === QUEST_ARCHIVE_ALL || factionValues.has(filters.faction) ? filters.faction : QUEST_ARCHIVE_ALL,
        category: filters.category === QUEST_ARCHIVE_ALL || categoryValues.has(filters.category) ? filters.category : QUEST_ARCHIVE_ALL,
        chapter: filters.chapter === QUEST_ARCHIVE_ALL || chapterValues.has(filters.chapter) ? filters.chapter : QUEST_ARCHIVE_ALL,
        branchVariant: filters.branchVariant === QUEST_ARCHIVE_ALL || branchValues.has(filters.branchVariant)
            ? filters.branchVariant
            : QUEST_ARCHIVE_ALL,
    };
}

function passesFacet(value: string | null, filter: string): boolean {
    return filter === QUEST_ARCHIVE_ALL || value === filter;
}

function isActiveFilter(filters: QuestArchiveFilters): boolean {
    return Boolean(clean(filters.searchText)) ||
        filters.faction !== QUEST_ARCHIVE_ALL ||
        filters.category !== QUEST_ARCHIVE_ALL ||
        filters.chapter !== QUEST_ARCHIVE_ALL ||
        filters.branchVariant !== QUEST_ARCHIVE_ALL;
}

export function formatQuestArchiveCountSummary(counts: QuestArchiveCounts): string {
    if (counts.visibleGroups === counts.totalGroups) {
        return `${formatCountLabel(counts.totalGroups, "archive entry")}`;
    }
    return `${formatCountLabel(counts.visibleGroups, "archive entry")} shown of ${counts.totalGroups}`;
}

export function buildQuestArchiveModel({
    quests,
    selectedQuestKey,
    filters,
}: {
    quests: QuestChronicleEntryDto[];
    selectedQuestKey: string | null;
    filters: QuestArchiveFilters;
}): QuestArchiveModel {
    const orderedQuests = [...quests].sort(compareQuestOrder);
    const normalizedFilters = normalizeFilters(filters, orderedQuests);
    const visibleQuests = orderedQuests.filter((quest) =>
        matchesSearch(quest, normalizedFilters.searchText) &&
        passesFacet(getFactionLabel(quest), normalizedFilters.faction) &&
        passesFacet(getCategoryLabel(quest), normalizedFilters.category) &&
        passesFacet(formatChapterLabel(quest), normalizedFilters.chapter) &&
        passesFacet(getBranchLabel(quest), normalizedFilters.branchVariant)
    );
    const selectedVisible = selectedQuestKey
        ? visibleQuests.some((quest) => [quest.entryKey, ...quest.sourceQuestKeys].includes(selectedQuestKey))
        : true;
    const railQuests = selectedVisible ? visibleQuests : orderedQuests.filter((quest) => quest.entryKey === selectedQuestKey);
    const rail = buildProgressionRail(railQuests, selectedQuestKey);

    return {
        rail,
        filters: normalizedFilters,
        factionOptions: optionCounts(orderedQuests, getFactionLabel),
        categoryOptions: optionCounts(orderedQuests, getCategoryLabel),
        chapterOptions: optionCounts(orderedQuests, formatChapterLabel),
        branchVariantOptions: optionCounts(orderedQuests, getBranchLabel),
        counts: {
            totalGroups: orderedQuests.length,
            visibleGroups: visibleQuests.length,
            totalRecords: orderedQuests.length,
            visibleRecords: visibleQuests.length,
        },
        hasActiveFilters: isActiveFilter(normalizedFilters),
        selectedOutsideFilters: !selectedVisible,
    };
}
