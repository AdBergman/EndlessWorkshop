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
export const QUEST_ARCHIVE_MINOR_FACTIONS = "Minor Factions";

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
    relevanceScore: number;
};

type QuestArchiveFacetKey = "faction" | "category" | "chapter" | "branchVariant";

export const defaultQuestArchiveFilters: QuestArchiveFilters = {
    searchText: "",
    faction: QUEST_ARCHIVE_ALL,
    category: QUEST_ARCHIVE_ALL,
    chapter: QUEST_ARCHIVE_ALL,
    branchVariant: QUEST_ARCHIVE_ALL,
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

const facetKeys: QuestArchiveFacetKey[] = ["faction", "category", "chapter", "branchVariant"];
const knownMajorFactionAliases: Array<{ label: string; tokens: string[] }> = [
    { label: "Aspects", tokens: ["aspects", "aspect"] },
    { label: "Kin", tokens: ["kin of sheredyn", "kin"] },
    { label: "Lords", tokens: ["lords", "lord"] },
    { label: "Necrophages", tokens: ["necrophage", "necrophages"] },
    { label: "Tahuk", tokens: ["tahuk"] },
];

function getQuestCategoryLabel(quest: QuestDto): string | null {
    return clean(quest.categoryType) || compactEntityLabel(quest.categoryKey) || clean(quest.categoryKey) || null;
}

function isMajorFactionQuest(quest: QuestDto): boolean {
    const categoryText = normalizeSearch([quest.categoryType, quest.categoryKey].join(" "));
    return categoryText.includes("major faction") || normalizeSearch(quest.questKey).startsWith("faction quest");
}

function isMinorFactionQuest(quest: QuestDto): boolean {
    const categoryText = normalizeSearch([quest.categoryType, quest.categoryKey].join(" "));
    const inferredText = normalizeSearch([quest.inferredFactionKey, quest.inferredQuestLineKey, quest.questKey].join(" "));

    return categoryText.includes("minor faction") || inferredText.includes("minor faction");
}

function getQuestFactionLabel(quest: QuestDto): string | null {
    const searchableFactionText = normalizeSearch([
        quest.inferredFactionKey,
        quest.inferredQuestLineKey,
        quest.questKey,
    ].filter((value): value is string => Boolean(clean(value))).join(" "));

    const knownMajorLabel = knownMajorFactionAliases.find((faction) =>
        faction.tokens.some((token) => searchableFactionText.includes(token))
    )?.label;
    if (knownMajorLabel) return knownMajorLabel;

    if (isMinorFactionQuest(quest)) return QUEST_ARCHIVE_MINOR_FACTIONS;

    const inferredFactionLabel = compactEntityLabel(quest.inferredFactionKey);
    if (inferredFactionLabel && isMajorFactionQuest(quest)) return inferredFactionLabel;
    if (inferredFactionLabel) return QUEST_ARCHIVE_MINOR_FACTIONS;

    return null;
}

function getQuestlineVariantLabel(questlineKey: string | null | undefined): string | null {
    const match = clean(questlineKey).match(/^(.+?)([0-9]+)$/);
    if (!match) return null;

    const variantNumber = Number.parseInt(match[2] ?? "", 10);
    return Number.isFinite(variantNumber) ? `Alternate questline ${variantNumber}` : "Alternate questline";
}

function isNoisyBranchVariantLabel(label: string): boolean {
    const normalized = normalizeSearch(label);

    return (
        /^path \d+[a-z]?$/.test(normalized) ||
        /^quest .*\bchapter ?\d+[a-z]?\b/.test(normalized) ||
        /^quest .*\bstep ?\d+\b/.test(normalized) ||
        /^quest .*\bchoice ?\d+\b/.test(normalized)
    );
}

function getQuestBranchVariantLabels(quest: QuestDto): string[] {
    const pathContextLabel = getQuestPathContextLabel(quest, { allowGeneric: false });
    const labels = [
        pathContextLabel && !isNoisyBranchVariantLabel(pathContextLabel) ? pathContextLabel : null,
        getQuestlineVariantLabel(quest.inferredQuestLineKey),
        quest.branchStart || quest.branchEnd || clean(quest.branchGroupKey) ? "Branching entries" : null,
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

function buildOutcomeLabels(quest: QuestDto, questsByKey: Record<string, QuestDto>): string[] {
    return collectOutcomeQuestKeys(quest).map((questKey) => {
        const outcomeQuest = questsByKey[questKey] ?? null;
        return outcomeQuest ? getQuestTitle(outcomeQuest) : humanizeQuestKey(questKey);
    });
}

function buildQuestArchiveRecord(
    quest: QuestDto,
    questsByKey: Record<string, QuestDto>
): QuestArchiveRecord {
    const title = getQuestTitle(quest);
    const categoryLabel = getQuestCategoryLabel(quest);
    const chapterLabel = formatChapterLabel(quest);
    const factionLabel = getQuestFactionLabel(quest);
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

function buildBranchVariantOptions(
    records: readonly QuestArchiveRecord[]
): QuestArchiveFilterOption[] {
    const branchVariantOptions = countOptions(records, (record) => record.branchVariantLabels);
    const branchVariantRecordCount = records.filter((record) => record.branchVariantLabels.length > 0).length;

    return branchVariantRecordCount > 0
        ? [
            {
                value: QUEST_ARCHIVE_BRANCH_ANY,
                label: "Any branch/variant",
                count: branchVariantRecordCount,
            },
            ...branchVariantOptions,
        ]
        : branchVariantOptions;
}

function buildFactionOptions(records: readonly QuestArchiveRecord[]): QuestArchiveFilterOption[] {
    const options = countOptions(records, (record) => record.factionLabel ? [record.factionLabel] : []);
    const majorOptions = options
        .filter((option) => option.value !== QUEST_ARCHIVE_MINOR_FACTIONS)
        .sort((left, right) => compareString(left.label, right.label));
    const minorOption = options.find((option) => option.value === QUEST_ARCHIVE_MINOR_FACTIONS);

    return minorOption ? [...majorOptions, minorOption] : majorOptions;
}

function isConstrictiveFilterActive(filters: QuestArchiveFilters): boolean {
    return (
        clean(filters.searchText).length > 0 ||
        filters.faction !== QUEST_ARCHIVE_ALL ||
        filters.category !== QUEST_ARCHIVE_ALL ||
        filters.chapter !== QUEST_ARCHIVE_ALL ||
        filters.branchVariant !== QUEST_ARCHIVE_ALL
    );
}

function recordMatchesFilters(
    record: QuestArchiveRecord,
    filters: QuestArchiveFilters,
    options: { ignoreFacet?: QuestArchiveFacetKey } = {}
): QuestArchiveRecord | null {
    const relevanceScore = computeSearchScore(record, filters.searchText);
    if (relevanceScore === null) return null;

    if (
        options.ignoreFacet !== "faction" &&
        filters.faction !== QUEST_ARCHIVE_ALL &&
        record.factionLabel !== filters.faction
    ) {
        return null;
    }
    if (
        options.ignoreFacet !== "category" &&
        filters.category !== QUEST_ARCHIVE_ALL &&
        record.categoryLabel !== filters.category
    ) {
        return null;
    }
    if (
        options.ignoreFacet !== "chapter" &&
        filters.chapter !== QUEST_ARCHIVE_ALL &&
        record.chapterLabel !== filters.chapter
    ) {
        return null;
    }
    if (
        options.ignoreFacet !== "branchVariant" &&
        filters.branchVariant === QUEST_ARCHIVE_BRANCH_ANY &&
        record.branchVariantLabels.length === 0
    ) {
        return null;
    }
    if (
        options.ignoreFacet !== "branchVariant" &&
        filters.branchVariant !== QUEST_ARCHIVE_ALL &&
        filters.branchVariant !== QUEST_ARCHIVE_BRANCH_ANY &&
        !record.branchVariantLabels.includes(filters.branchVariant)
    ) {
        return null;
    }

    return {
        ...record,
        relevanceScore,
    };
}

function filterRecordsForFacet(
    records: readonly QuestArchiveRecord[],
    filters: QuestArchiveFilters,
    facetKey: QuestArchiveFacetKey
): QuestArchiveRecord[] {
    return records
        .map((record) => recordMatchesFilters(record, filters, { ignoreFacet: facetKey }))
        .filter((record): record is QuestArchiveRecord => Boolean(record));
}

function buildFacetOptions(
    records: readonly QuestArchiveRecord[],
    filters: QuestArchiveFilters,
    facetKey: QuestArchiveFacetKey
): QuestArchiveFilterOption[] {
    const facetRecords = filterRecordsForFacet(records, filters, facetKey);

    if (facetKey === "faction") {
        return buildFactionOptions(facetRecords);
    }

    if (facetKey === "category") {
        return countOptions(facetRecords, (record) => record.categoryLabel ? [record.categoryLabel] : []);
    }

    if (facetKey === "chapter") {
        return countOptions(facetRecords, (record) => record.chapterLabel ? [record.chapterLabel] : []);
    }

    return buildBranchVariantOptions(facetRecords);
}

function sanitizeArchiveFilters(
    records: readonly QuestArchiveRecord[],
    filters: QuestArchiveFilters
): QuestArchiveFilters {
    const nextFilters = { ...filters };
    const validationFilters: QuestArchiveFilters = {
        ...filters,
        faction: QUEST_ARCHIVE_ALL,
        category: QUEST_ARCHIVE_ALL,
        chapter: QUEST_ARCHIVE_ALL,
        branchVariant: QUEST_ARCHIVE_ALL,
    };

    facetKeys.forEach((facetKey) => {
        const selectedValue = nextFilters[facetKey];
        if (selectedValue === QUEST_ARCHIVE_ALL) return;

        const availableValues = new Set(
            buildFacetOptions(records, validationFilters, facetKey).map((option) => option.value)
        );
        if (availableValues.has(selectedValue)) {
            validationFilters[facetKey] = selectedValue;
            return;
        }

        nextFilters[facetKey] = QUEST_ARCHIVE_ALL;
    });

    return nextFilters;
}

export function buildQuestArchiveModel({
    quests,
    dialogBlocksByIdentity,
    selectedQuestKey,
    filters,
}: {
    quests: QuestDto[];
    dialogBlocksByIdentity: Record<string, QuestDialogBlockDto>;
    selectedQuestKey: string | null;
    filters: QuestArchiveFilters;
}): QuestArchiveModel {
    void dialogBlocksByIdentity;
    const orderedQuests = [...quests].sort(compareQuestOrder);
    const questsByKey = orderedQuests.reduce<Record<string, QuestDto>>((acc, quest) => {
        acc[quest.questKey] = quest;
        return acc;
    }, {});
    const records = orderedQuests.map((quest) => buildQuestArchiveRecord(quest, questsByKey));
    const sanitizedFilters = sanitizeArchiveFilters(records, filters);
    const visibleRecords = records
        .map((record) => recordMatchesFilters(record, sanitizedFilters))
        .filter((record): record is QuestArchiveRecord => Boolean(record))
        .sort((left, right) => compareQuestOrder(left.quest, right.quest));
    const rail = buildProgressionRail(visibleRecords.map((record) => record.quest), selectedQuestKey);
    const totalRail = buildProgressionRail(orderedQuests, selectedQuestKey);
    const selectedOutsideFilters = Boolean(
        selectedQuestKey &&
            isConstrictiveFilterActive(sanitizedFilters) &&
            !visibleRecords.some((record) => record.quest.questKey === selectedQuestKey)
    );

    return {
        rail,
        filters: sanitizedFilters,
        factionOptions: buildFacetOptions(records, sanitizedFilters, "faction"),
        categoryOptions: buildFacetOptions(records, sanitizedFilters, "category"),
        chapterOptions: buildFacetOptions(records, sanitizedFilters, "chapter"),
        branchVariantOptions: buildFacetOptions(records, sanitizedFilters, "branchVariant"),
        counts: {
            totalGroups: totalRail.questCount,
            visibleGroups: rail.questCount,
            totalRecords: orderedQuests.length,
            visibleRecords: visibleRecords.length,
        },
        hasActiveFilters: isConstrictiveFilterActive(sanitizedFilters),
        selectedOutsideFilters,
    };
}

export function formatQuestArchiveCountSummary(counts: QuestArchiveCounts): string {
    return `${formatCountLabel(counts.visibleGroups, "group")} / ${formatCountLabel(counts.visibleRecords, "entry")}`;
}
