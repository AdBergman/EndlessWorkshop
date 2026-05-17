import type { FactionInfo } from "@/types/dataTypes";
import type { QuestDialogBlockDto, QuestDto } from "@/types/questTypes";
import {
    buildProgressionRail,
    compactEntityLabel,
    compareQuestOrder,
    formatChapterLabel,
    getQuestPathContextLabel,
    getQuestTitle,
    humanizeQuestKey,
} from "./questViewModel";
import type { QuestProgressionRailModel } from "./questExplorerTypes";

export const QUEST_ARCHIVE_ALL = "__all__";
export const QUEST_ARCHIVE_BRANCH_ANY = "__branch_any__";

export type QuestArchiveSortOption = "canonical" | "relevance" | "title" | "factionChapter";
export type QuestArchiveTranscriptFilter = "all" | "has" | "missing";
export type QuestArchiveRequirementFilter = "all" | "required" | "optional";

export type QuestArchiveFilters = {
    searchText: string;
    currentFactionOnly: boolean;
    category: string;
    chapter: string;
    branchVariant: string;
    transcript: QuestArchiveTranscriptFilter;
    requirement: QuestArchiveRequirementFilter;
    sort: QuestArchiveSortOption;
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
    categoryOptions: QuestArchiveFilterOption[];
    chapterOptions: QuestArchiveFilterOption[];
    branchVariantOptions: QuestArchiveFilterOption[];
    counts: QuestArchiveCounts;
    hasActiveFilters: boolean;
    selectedOutsideFilters: boolean;
    currentFactionLabel: string | null;
};

type SearchField = {
    weight: number;
    values: string[];
};

type QuestArchiveRecord = {
    quest: QuestDto;
    searchFields: SearchField[];
    searchText: string;
    categoryLabel: string | null;
    chapterLabel: string | null;
    factionLabel: string | null;
    questlineLabel: string | null;
    branchVariantLabels: string[];
    hasTranscript: boolean;
    relevanceScore: number;
};

export const defaultQuestArchiveFilters: QuestArchiveFilters = {
    searchText: "",
    currentFactionOnly: false,
    category: QUEST_ARCHIVE_ALL,
    chapter: QUEST_ARCHIVE_ALL,
    branchVariant: QUEST_ARCHIVE_ALL,
    transcript: "all",
    requirement: "all",
    sort: "canonical",
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanLines = (lines: readonly string[] | null | undefined): string[] =>
    (lines ?? []).map(clean).filter((line) => line.length > 0);

const unique = (values: readonly string[]): string[] =>
    values.filter((value, index) => value.length > 0 && values.indexOf(value) === index);

const normalizeSearch = (value: string): string =>
    clean(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

const tokenizeSearch = (value: string): string[] => unique(normalizeSearch(value).split(/\s+/g).filter(Boolean));

const compareString = (left: string | null | undefined, right: string | null | undefined): number =>
    clean(left).localeCompare(clean(right), undefined, { numeric: true, sensitivity: "base" });

const formatCountLabel = (count: number, singular: string): string =>
    `${count} ${singular}${count === 1 ? "" : "s"}`;

const formatDisplayLabel = (value: string | null | undefined): string | null => {
    const normalized = clean(value);
    if (!normalized) return null;

    return humanizeQuestKey(normalized);
};

function getQuestCategoryLabel(quest: QuestDto): string | null {
    return clean(quest.categoryType) || compactEntityLabel(quest.categoryKey) || clean(quest.categoryKey) || null;
}

function getQuestlineVariantLabel(questlineKey: string | null | undefined): string | null {
    const match = clean(questlineKey).match(/^(.+?)([0-9]+)$/);
    if (!match) return null;

    const variantNumber = Number.parseInt(match[2] ?? "", 10);
    return Number.isFinite(variantNumber) ? `Alternate questline ${variantNumber}` : "Alternate questline";
}

function getQuestBranchVariantLabels(quest: QuestDto): string[] {
    const labels = [
        getQuestPathContextLabel(quest, { allowGeneric: true }),
        getQuestlineVariantLabel(quest.inferredQuestLineKey),
        quest.branchStart || quest.branchEnd || clean(quest.branchGroupKey) ? "Branching records" : null,
    ].filter((label): label is string => Boolean(label));

    return unique(labels);
}

function collectOutcomeQuestKeys(quest: QuestDto): string[] {
    const keys = [
        ...quest.nextQuestKeys,
        quest.convergesIntoQuestKey,
        ...quest.choices.flatMap((choice) => [
            ...choice.nextQuestKeys,
            ...choice.steps.flatMap((step) => [step.nextQuestKey, step.failQuestKey]),
        ]),
    ].filter((questKey): questKey is string => Boolean(clean(questKey)));

    return unique(keys.map(clean));
}

function collectDialogIdentities(quest: QuestDto): string[] {
    return unique([
        ...quest.rootDialogBlockIdentities,
        ...quest.choices.flatMap((choice) => choice.steps.flatMap((step) => step.dialogBlockIdentities)),
    ].map(clean));
}

function blockHasTranscript(block: QuestDialogBlockDto | undefined): boolean {
    return Boolean(block?.lines.some((line) => clean(line.text).length > 0));
}

function questHasTranscript(
    quest: QuestDto,
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): boolean {
    return collectDialogIdentities(quest).some((identity) => blockHasTranscript(dialogBlocksByIdentity[identity]));
}

function buildCurrentFactionAliases(faction: FactionInfo | null | undefined): string[] {
    const aliases = [faction?.uiLabel, faction?.enumFaction].map((value) => normalizeSearch(String(value ?? "")));
    const expanded = aliases.flatMap((alias) => {
        if (!alias.endsWith("s")) return [alias];
        return [alias, alias.slice(0, -1)];
    });

    return unique(expanded.filter((alias) => alias.length > 0));
}

function questMatchesCurrentFaction(quest: QuestDto, faction: FactionInfo | null | undefined): boolean {
    const aliases = buildCurrentFactionAliases(faction);
    if (aliases.length === 0) return false;

    const searchableFactionText = normalizeSearch([
        quest.inferredFactionKey,
        quest.inferredQuestLineKey,
        quest.questKey,
        compactEntityLabel(quest.inferredFactionKey),
        compactEntityLabel(quest.inferredQuestLineKey),
    ].filter((value): value is string => Boolean(clean(value))).join(" "));

    return aliases.some((alias) => searchableFactionText.includes(alias));
}

function buildOutcomeLabels(quest: QuestDto, questsByKey: Record<string, QuestDto>): string[] {
    return collectOutcomeQuestKeys(quest).map((questKey) => {
        const outcomeQuest = questsByKey[questKey] ?? null;
        return outcomeQuest ? getQuestTitle(outcomeQuest) : humanizeQuestKey(questKey);
    });
}

function buildQuestArchiveRecord(
    quest: QuestDto,
    questsByKey: Record<string, QuestDto>,
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>
): QuestArchiveRecord {
    const title = getQuestTitle(quest);
    const categoryLabel = getQuestCategoryLabel(quest);
    const chapterLabel = formatChapterLabel(quest);
    const factionLabel = compactEntityLabel(quest.inferredFactionKey);
    const questlineLabel = compactEntityLabel(quest.inferredQuestLineKey);
    const branchVariantLabels = getQuestBranchVariantLabels(quest);
    const choices = quest.choices;
    const steps = choices.flatMap((choice) => choice.steps);
    const objectiveLines = steps.map((step) => clean(step.objectiveText)).filter((line) => line.length > 0);
    const descriptionLines = [
        ...cleanLines(quest.descriptionLines),
        ...choices.flatMap((choice) => cleanLines(choice.descriptionLines)),
        ...steps.flatMap((step) => cleanLines(step.descriptionLines)),
    ];
    const requirementLines = [
        ...choices.flatMap((choice) => [
            ...cleanLines(choice.completionPrerequisiteLines),
            ...cleanLines(choice.failurePrerequisiteLines),
        ]),
        ...steps.flatMap((step) => [
            ...cleanLines(step.selectionPrerequisiteLines),
            ...cleanLines(step.completionPrerequisiteLines),
            ...cleanLines(step.failurePrerequisiteLines),
            ...cleanLines(step.forbiddenPrerequisiteLines),
        ]),
    ];
    const rewardLines = [
        ...choices.flatMap((choice) => cleanLines(choice.rewardDisplayLines)),
        ...steps.flatMap((step) => cleanLines(step.rewardDisplayLines)),
    ];
    const outcomeLabels = buildOutcomeLabels(quest, questsByKey);
    const metadataLabels = [
        factionLabel,
        chapterLabel,
        questlineLabel,
        categoryLabel,
        ...branchVariantLabels,
    ].filter((label): label is string => Boolean(label));
    const searchFields: SearchField[] = [
        { weight: 9, values: [title] },
        { weight: 7, values: [quest.questKey] },
        { weight: 5, values: metadataLabels },
        { weight: 4, values: objectiveLines },
        { weight: 3, values: [...descriptionLines, ...requirementLines, ...rewardLines, ...outcomeLabels] },
    ];

    return {
        quest,
        searchFields,
        searchText: normalizeSearch(searchFields.flatMap((field) => field.values).join(" ")),
        categoryLabel,
        chapterLabel,
        factionLabel,
        questlineLabel,
        branchVariantLabels,
        hasTranscript: questHasTranscript(quest, dialogBlocksByIdentity),
        relevanceScore: 0,
    };
}

function computeSearchScore(record: QuestArchiveRecord, queryText: string): number | null {
    const terms = tokenizeSearch(queryText);
    if (terms.length === 0) return 0;
    if (!terms.every((term) => record.searchText.includes(term))) return null;

    const phrase = normalizeSearch(queryText);
    let score = phrase.length > 0 && record.searchText.includes(phrase) ? 12 : 0;

    terms.forEach((term) => {
        record.searchFields.forEach((field) => {
            field.values.forEach((value) => {
                const normalized = normalizeSearch(value);
                if (!normalized) return;

                if (normalized === term) {
                    score += field.weight * 8;
                } else if (normalized.split(/\s+/g).some((word) => word.startsWith(term))) {
                    score += field.weight * 4;
                } else if (normalized.includes(term)) {
                    score += field.weight;
                }
            });
        });
    });

    return score;
}

function countOptions(
    records: readonly QuestArchiveRecord[],
    getLabels: (record: QuestArchiveRecord) => readonly string[]
): QuestArchiveFilterOption[] {
    const counts = records.reduce<Map<string, number>>((acc, record) => {
        unique(getLabels(record).map(clean)).forEach((label) => {
            acc.set(label, (acc.get(label) ?? 0) + 1);
        });
        return acc;
    }, new Map<string, number>());

    return Array.from(counts.entries())
        .map(([label, count]) => ({ value: label, label, count }))
        .sort((left, right) => compareString(left.label, right.label));
}

function isConstrictiveFilterActive(filters: QuestArchiveFilters): boolean {
    return (
        clean(filters.searchText).length > 0 ||
        filters.currentFactionOnly ||
        filters.category !== QUEST_ARCHIVE_ALL ||
        filters.chapter !== QUEST_ARCHIVE_ALL ||
        filters.branchVariant !== QUEST_ARCHIVE_ALL ||
        filters.transcript !== "all" ||
        filters.requirement !== "all"
    );
}

function recordMatchesFilters(
    record: QuestArchiveRecord,
    filters: QuestArchiveFilters,
    currentFaction: FactionInfo | null | undefined
): QuestArchiveRecord | null {
    const relevanceScore = computeSearchScore(record, filters.searchText);
    if (relevanceScore === null) return null;

    if (filters.currentFactionOnly && !questMatchesCurrentFaction(record.quest, currentFaction)) return null;
    if (filters.category !== QUEST_ARCHIVE_ALL && record.categoryLabel !== filters.category) return null;
    if (filters.chapter !== QUEST_ARCHIVE_ALL && record.chapterLabel !== filters.chapter) return null;
    if (filters.branchVariant === QUEST_ARCHIVE_BRANCH_ANY && record.branchVariantLabels.length === 0) return null;
    if (
        filters.branchVariant !== QUEST_ARCHIVE_ALL &&
        filters.branchVariant !== QUEST_ARCHIVE_BRANCH_ANY &&
        !record.branchVariantLabels.includes(filters.branchVariant)
    ) {
        return null;
    }
    if (filters.transcript === "has" && !record.hasTranscript) return null;
    if (filters.transcript === "missing" && record.hasTranscript) return null;
    if (filters.requirement === "required" && !record.quest.mandatory) return null;
    if (filters.requirement === "optional" && record.quest.mandatory) return null;

    return {
        ...record,
        relevanceScore,
    };
}

function compareArchiveRecords(
    left: QuestArchiveRecord,
    right: QuestArchiveRecord,
    sort: QuestArchiveSortOption,
    hasSearch: boolean
): number {
    if (sort === "relevance" && hasSearch) {
        return right.relevanceScore - left.relevanceScore || compareQuestOrder(left.quest, right.quest);
    }

    if (sort === "title") {
        return compareString(getQuestTitle(left.quest), getQuestTitle(right.quest)) || compareQuestOrder(left.quest, right.quest);
    }

    if (sort === "factionChapter") {
        return (
            compareString(left.factionLabel, right.factionLabel) ||
            compareString(left.chapterLabel, right.chapterLabel) ||
            compareString(left.questlineLabel, right.questlineLabel) ||
            compareQuestOrder(left.quest, right.quest)
        );
    }

    return compareQuestOrder(left.quest, right.quest);
}

export function buildQuestArchiveModel({
    quests,
    dialogBlocksByIdentity,
    selectedQuestKey,
    filters,
    currentFaction,
}: {
    quests: QuestDto[];
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>;
    selectedQuestKey: string | null;
    filters: QuestArchiveFilters;
    currentFaction: FactionInfo | null | undefined;
}): QuestArchiveModel {
    const orderedQuests = [...quests].sort(compareQuestOrder);
    const questsByKey = orderedQuests.reduce<Record<string, QuestDto>>((acc, quest) => {
        acc[quest.questKey] = quest;
        return acc;
    }, {});
    const records = orderedQuests.map((quest) => buildQuestArchiveRecord(quest, questsByKey, dialogBlocksByIdentity));
    const hasSearch = clean(filters.searchText).length > 0;
    const visibleRecords = records
        .map((record) => recordMatchesFilters(record, filters, currentFaction))
        .filter((record): record is QuestArchiveRecord => Boolean(record))
        .sort((left, right) => compareArchiveRecords(left, right, filters.sort, hasSearch));
    const rail = buildProgressionRail(visibleRecords.map((record) => record.quest), selectedQuestKey);
    const totalRail = buildProgressionRail(orderedQuests, selectedQuestKey);
    const selectedOutsideFilters = Boolean(
        selectedQuestKey &&
            isConstrictiveFilterActive(filters) &&
            !visibleRecords.some((record) => record.quest.questKey === selectedQuestKey)
    );
    const branchVariantOptions = countOptions(records, (record) => record.branchVariantLabels);
    const branchVariantRecordCount = records.filter((record) => record.branchVariantLabels.length > 0).length;

    return {
        rail,
        filters,
        categoryOptions: countOptions(records, (record) => record.categoryLabel ? [record.categoryLabel] : []),
        chapterOptions: countOptions(records, (record) => record.chapterLabel ? [record.chapterLabel] : []),
        branchVariantOptions: branchVariantRecordCount > 0
            ? [
                {
                    value: QUEST_ARCHIVE_BRANCH_ANY,
                    label: "Any branch/variant",
                    count: branchVariantRecordCount,
                },
                ...branchVariantOptions,
            ]
            : branchVariantOptions,
        counts: {
            totalGroups: totalRail.questCount,
            visibleGroups: rail.questCount,
            totalRecords: orderedQuests.length,
            visibleRecords: visibleRecords.length,
        },
        hasActiveFilters: isConstrictiveFilterActive(filters),
        selectedOutsideFilters,
        currentFactionLabel: formatDisplayLabel(clean(currentFaction?.uiLabel) || clean(currentFaction?.enumFaction)),
    };
}

export function formatQuestArchiveCountSummary(counts: QuestArchiveCounts): string {
    return `${formatCountLabel(counts.visibleGroups, "group")} / ${formatCountLabel(counts.visibleRecords, "record")}`;
}
