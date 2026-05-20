import type { QuestExplorerMode } from "./questExplorerMode";
import type {
    LoreSection,
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerExport,
    Requirement,
    Reward,
    StrategyObjective,
} from "./questExplorerContract";

export type QuestExplorerPrototypeSelection = {
    mode: QuestExplorerMode;
    questKey: string | null;
    branchKey: string | null;
    visitedEntryKeys?: readonly string[];
};

export type QuestExplorerResolvedLink = {
    entryKey: string;
    label: string;
    contextLabel: string | null;
    relationLabel: string;
    isMissing: boolean;
};

export type QuestExplorerBranchSummary = {
    branchKey: string;
    choiceKey: string | null;
    label: string;
    groupLabel: string | null;
    outcomePreviewLines: string[];
    conditions: string[];
    requirements: Requirement[];
    rewards: Reward[];
    nextLinks: QuestExplorerResolvedLink[];
    failureLinks: QuestExplorerResolvedLink[];
    convergenceLinks: QuestExplorerResolvedLink[];
    isSelected: boolean;
};

export type QuestExplorerRailEntry = {
    entryKey: string;
    title: string;
    stepLabel: string | null;
    branchLabel: string | null;
    questType: string | null;
    isMandatory: boolean;
    isKeyNarrativeBeat: boolean;
    hasChoices: boolean;
    hasConvergence: boolean;
    state: "current" | "visited" | "adjacent" | "future";
};

export type QuestExplorerRailChapter = {
    chapterKey: string;
    label: string;
    entries: QuestExplorerRailEntry[];
};

export type QuestExplorerRailQuestLine = {
    questLineKey: string;
    label: string;
    chapters: QuestExplorerRailChapter[];
};

export type QuestExplorerRailFaction = {
    factionKey: string;
    label: string;
    questLines: QuestExplorerRailQuestLine[];
};

export type QuestExplorerPrototypeViewModel = {
    exportMetadata: {
        exportKind: string;
        schemaVersion: string;
        gameVersion: string;
        exporterVersion: string;
    };
    mode: QuestExplorerMode;
    selectedEntry: QuestExplorerEntry;
    selectedBranchKey: string | null;
    selectedBranch: QuestBranch | null;
    branchSummaries: QuestExplorerBranchSummary[];
    rail: QuestExplorerRailFaction[];
    previousLinks: QuestExplorerResolvedLink[];
    nextLinks: QuestExplorerResolvedLink[];
    failureLinks: QuestExplorerResolvedLink[];
    convergenceLinks: QuestExplorerResolvedLink[];
    allEntries: QuestExplorerEntry[];
    missingReferenceKeys: string[];
    contractFeedback: string[];
};

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const unique = <T,>(values: readonly T[]): T[] =>
    values.filter((value, index) => values.indexOf(value) === index);

const entryTitle = (entry: QuestExplorerEntry | null | undefined, fallbackLabel = "Missing entry"): string =>
    clean(entry?.title) || fallbackLabel;

const navigationLabel = (entry: QuestExplorerEntry): string | null =>
    [
        clean(entry.navigation.chapterLabel),
        clean(entry.navigation.stepLabel),
        clean(entry.navigation.questLineName),
    ].filter(Boolean)[0] || null;

const compareNumber = (left: number | undefined, right: number | undefined): number =>
    (typeof left === "number" ? left : Number.MAX_SAFE_INTEGER) -
    (typeof right === "number" ? right : Number.MAX_SAFE_INTEGER);

export const compareQuestExplorerEntries = (
    left: QuestExplorerEntry,
    right: QuestExplorerEntry
): number =>
    compareNumber(left.navigation.sequenceIndex, right.navigation.sequenceIndex) ||
    compareNumber(left.navigation.chapterOrder, right.navigation.chapterOrder) ||
    compareNumber(left.navigation.stepOrder, right.navigation.stepOrder) ||
    compareNumber(left.navigation.branchOrder, right.navigation.branchOrder);

function compareBranches(left: QuestBranch, right: QuestBranch): number {
    return compareNumber(left.orderIndex, right.orderIndex);
}

function buildEntryLookup(entries: readonly QuestExplorerEntry[]): Map<string, QuestExplorerEntry> {
    const lookup = new Map<string, QuestExplorerEntry>();

    entries.forEach((entry) => {
        lookup.set(entry.entryKey, entry);
        entry.aliases.forEach((alias) => {
            if (!lookup.has(alias)) lookup.set(alias, entry);
        });
    });

    return lookup;
}

function resolveEntry(
    entryKey: string,
    lookup: Map<string, QuestExplorerEntry>
): QuestExplorerEntry | null {
    return lookup.get(entryKey) ?? null;
}

function buildResolvedLinks(
    entryKeys: readonly string[] | undefined,
    lookup: Map<string, QuestExplorerEntry>,
    relationLabel: string
): QuestExplorerResolvedLink[] {
    return unique((entryKeys ?? []).map(clean).filter(Boolean)).map((entryKey) => {
        const entry = resolveEntry(entryKey, lookup);
        return {
            entryKey: entry?.entryKey ?? entryKey,
            label: entryTitle(entry),
            contextLabel: entry ? navigationLabel(entry) : null,
            relationLabel,
            isMissing: !entry,
        };
    });
}

function branchMatchesKey(branch: QuestBranch, requestedBranchKey: string): boolean {
    return branch.branchKey === requestedBranchKey || branch.choiceKey === requestedBranchKey;
}

function branchByKey(branches: readonly QuestBranch[], branchKey: string): QuestBranch | null {
    return branches.find((branch) => branchMatchesKey(branch, branchKey)) ?? null;
}

function sortedBranches(entry: QuestExplorerEntry): QuestBranch[] {
    return [...entry.branches].sort(compareBranches);
}

function buildBranchSummaries(
    entry: QuestExplorerEntry,
    selectedBranchKey: string | null,
    lookup: Map<string, QuestExplorerEntry>
): QuestExplorerBranchSummary[] {
    return sortedBranches(entry).map((branch) => ({
        branchKey: branch.branchKey,
        choiceKey: clean(branch.choiceKey) || null,
        label: branch.label,
        groupLabel: clean(branch.groupLabel) || null,
        outcomePreviewLines: branch.lore?.outcomePreviewLines ?? [],
        conditions: branch.strategy?.conditions ?? [],
        requirements: branch.strategy?.requirements ?? [],
        rewards: branch.strategy?.rewards ?? [],
        nextLinks: buildResolvedLinks(branch.nextEntryKeys, lookup, "Leads to"),
        failureLinks: buildResolvedLinks(branch.failureEntryKeys, lookup, "Failure"),
        convergenceLinks: buildResolvedLinks(branch.convergesIntoEntryKeys, lookup, "Converges"),
        isSelected: selectedBranchKey === branch.branchKey,
    }));
}

function resolveBranchKey(entry: QuestExplorerEntry, requestedBranchKey: string | null): string | null {
    if (requestedBranchKey) {
        const requestedBranch = branchByKey(entry.branches, requestedBranchKey);
        if (requestedBranch) return requestedBranch.branchKey;
    }

    return sortedBranches(entry)[0]?.branchKey ?? null;
}

function buildRail(
    entries: readonly QuestExplorerEntry[],
    selectedEntry: QuestExplorerEntry,
    visitedEntryKeys: readonly string[]
): QuestExplorerRailFaction[] {
    const adjacentKeys = new Set([
        ...selectedEntry.navigation.previousEntryKeys,
        ...selectedEntry.navigation.nextEntryKeys,
        ...selectedEntry.navigation.failureEntryKeys,
        ...selectedEntry.navigation.convergesIntoEntryKeys,
    ]);
    const visitedKeys = new Set(visitedEntryKeys);
    const factionMap = new Map<string, QuestExplorerRailFaction>();

    [...entries].sort(compareQuestExplorerEntries).forEach((entry) => {
        const factionKey = clean(entry.navigation.factionKey) || "unaffiliated";
        const factionLabel = clean(entry.navigation.factionName) || "Unaffiliated Archives";
        const questLineKey = clean(entry.navigation.questLineKey) || `${factionKey}:questline`;
        const questLineLabel = clean(entry.navigation.questLineName) || "Archive Path";
        const chapterKey = `${questLineKey}:${entry.navigation.chapter ?? "unknown"}:${entry.navigation.chapterOrder ?? "unordered"}`;
        const chapterLabel = clean(entry.navigation.chapterLabel) || (
            typeof entry.navigation.chapter === "number"
                ? `Chapter ${entry.navigation.chapter}`
                : "Unchaptered"
        );

        let faction = factionMap.get(factionKey);
        if (!faction) {
            faction = {
                factionKey,
                label: factionLabel,
                questLines: [],
            };
            factionMap.set(factionKey, faction);
        }

        let questLine = faction.questLines.find((candidate) => candidate.questLineKey === questLineKey);
        if (!questLine) {
            questLine = {
                questLineKey,
                label: questLineLabel,
                chapters: [],
            };
            faction.questLines.push(questLine);
        }

        let chapter = questLine.chapters.find((candidate) => candidate.chapterKey === chapterKey);
        if (!chapter) {
            chapter = {
                chapterKey,
                label: chapterLabel,
                entries: [],
            };
            questLine.chapters.push(chapter);
        }

        chapter.entries.push({
            entryKey: entry.entryKey,
            title: entryTitle(entry, "Untitled entry"),
            stepLabel: clean(entry.navigation.stepLabel) || null,
            branchLabel: clean(entry.navigation.branchLabel) || null,
            questType: clean(entry.questType) || null,
            isMandatory: Boolean(entry.isMandatory),
            isKeyNarrativeBeat: Boolean(entry.isKeyNarrativeBeat),
            hasChoices: entry.branches.length > 0,
            hasConvergence: entry.navigation.convergesIntoEntryKeys.length > 0,
            state: entry.entryKey === selectedEntry.entryKey
                ? "current"
                : visitedKeys.has(entry.entryKey)
                    ? "visited"
                    : adjacentKeys.has(entry.entryKey)
                        ? "adjacent"
                        : "future",
        });
    });

    return [...factionMap.values()];
}

function missingKeysFromLinks(links: readonly QuestExplorerResolvedLink[]): string[] {
    return links.filter((link) => link.isMissing).map((link) => link.entryKey);
}

function buildContractFeedback(entries: readonly QuestExplorerEntry[]): string[] {
    const feedback: string[] = [];

    entries.forEach((entry) => {
        if (!clean(entry.title)) feedback.push(`${entry.entryKey}: missing display-grade title.`);
        if (typeof entry.navigation.sequenceIndex !== "number") {
            feedback.push(`${entry.entryKey}: missing navigation.sequenceIndex.`);
        }
        entry.branches.forEach((branch) => {
            if (!clean(branch.label)) feedback.push(`${entry.entryKey}/${branch.branchKey}: missing branch label.`);
            if (branch.orderIndex === undefined) {
                feedback.push(`${entry.entryKey}/${branch.branchKey}: missing branch.orderIndex.`);
            }
        });
    });

    return feedback;
}

export function buildQuestExplorerPrototypeViewModel(
    exportData: QuestExplorerExport,
    selection: QuestExplorerPrototypeSelection
): QuestExplorerPrototypeViewModel {
    const allEntries = [...exportData.entries].sort(compareQuestExplorerEntries);
    const lookup = buildEntryLookup(allEntries);
    const selectedEntry =
        (selection.questKey ? resolveEntry(selection.questKey, lookup) : null) ??
        allEntries[0];

    if (!selectedEntry) {
        throw new Error("Quest Explorer prototype requires at least one mock entry.");
    }

    const selectedBranchKey = resolveBranchKey(selectedEntry, selection.branchKey);
    const selectedBranch = selectedBranchKey ? branchByKey(selectedEntry.branches, selectedBranchKey) : null;
    const previousLinks = buildResolvedLinks(selectedEntry.navigation.previousEntryKeys, lookup, "Previous");
    const nextLinks = buildResolvedLinks(selectedEntry.navigation.nextEntryKeys, lookup, "Continues");
    const failureLinks = buildResolvedLinks(selectedEntry.navigation.failureEntryKeys, lookup, "Failure");
    const convergenceLinks = buildResolvedLinks(selectedEntry.navigation.convergesIntoEntryKeys, lookup, "Converges");
    const branchSummaries = buildBranchSummaries(selectedEntry, selectedBranchKey, lookup);

    return {
        exportMetadata: {
            exportKind: exportData.exportKind,
            schemaVersion: exportData.schemaVersion,
            gameVersion: exportData.gameVersion,
            exporterVersion: exportData.exporterVersion,
        },
        mode: selection.mode,
        selectedEntry,
        selectedBranchKey,
        selectedBranch,
        branchSummaries,
        rail: buildRail(allEntries, selectedEntry, selection.visitedEntryKeys ?? []),
        previousLinks,
        nextLinks,
        failureLinks,
        convergenceLinks,
        allEntries,
        missingReferenceKeys: unique([
            ...missingKeysFromLinks(previousLinks),
            ...missingKeysFromLinks(nextLinks),
            ...missingKeysFromLinks(failureLinks),
            ...missingKeysFromLinks(convergenceLinks),
            ...branchSummaries.flatMap((branch) => [
                ...missingKeysFromLinks(branch.nextLinks),
                ...missingKeysFromLinks(branch.failureLinks),
                ...missingKeysFromLinks(branch.convergenceLinks),
            ]),
        ]),
        contractFeedback: buildContractFeedback(allEntries),
    };
}

export function formatSectionPhase(section: LoreSection): string {
    const labels: Record<LoreSection["phase"], string> = {
        start: "Start",
        success: "Outcome",
        failure: "Failure",
        choice: "Choice",
        other: "Archive",
    };
    return labels[section.phase];
}

export type DisplayGroup<T extends Requirement | Reward> = {
    label: string | null;
    order: number;
    items: T[];
};

export function groupDisplayItems<T extends Requirement | Reward>(items: readonly T[]): DisplayGroup<T>[] {
    const groups = new Map<string, DisplayGroup<T>>();

    items.forEach((item) => {
        const label = clean(item.groupLabel) || null;
        const order = item.groupOrder ?? Number.MAX_SAFE_INTEGER;
        const key = `${order}:${label ?? "ungrouped"}`;
        const group = groups.get(key) ?? { label, order, items: [] };
        group.items.push(item);
        groups.set(key, group);
    });

    return [...groups.values()].sort((left, right) => compareNumber(left.order, right.order));
}

export function objectivePhaseLabel(objective: StrategyObjective): string | null {
    return clean(objective.phase) || null;
}
