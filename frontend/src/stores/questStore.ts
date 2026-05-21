import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { QuestExplorerEntry, QuestExplorerResponse } from "@/types/questTypes";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import {
    DEFAULT_QUEST_CATEGORY,
    getQuestCategoryKey,
    questMatchesSelectedMajorFaction,
    type QuestCategoryKey,
} from "@/features/quests/questCategories";
import type { FactionInfo } from "@/types/dataTypes";

type LoadOptions = {
    force?: boolean;
};

export type QuestExplorerFilters = {
    searchText: string;
    category: QuestCategoryKey;
};

type QuestStore = {
    questExplorer: QuestExplorerResponse | null;
    entries: QuestExplorerEntry[];
    entriesByKey: Record<string, QuestExplorerEntry>;
    orderedEntryKeys: string[];
    aliasToEntryKey: Record<string, string>;
    duplicateEntryKeys: string[];
    duplicateAliases: string[];

    selectedEntryKey: string | null;
    mode: QuestExplorerMode;
    filters: QuestExplorerFilters;

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadQuestExplorer: (opts?: LoadOptions) => Promise<void>;
    refreshQuestExplorer: () => Promise<void>;
    invalidateQuestExplorer: () => void;
    reset: () => void;

    setSelectedEntryKey: (key: string | null) => void;
    setMode: (mode: QuestExplorerMode) => void;
    setFilters: (filters: Partial<QuestExplorerFilters>) => void;
    clearFilters: () => void;

    resolveEntryKey: (keyOrAlias: string | null | undefined) => string | null;
    getQuestByKey: (keyOrAlias: string | null | undefined) => QuestExplorerEntry | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeQuestKey = (key: string | null | undefined) => (key ?? "").trim();

const cleanString = (value: unknown): string | null => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || null;
};

const cleanRequiredString = (value: unknown): string => cleanString(value) ?? "";

const cleanNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const cleanBoolean = (value: unknown): boolean | null =>
    typeof value === "boolean" ? value : null;

const cleanStringList = (values: readonly unknown[] | null | undefined): string[] =>
    (values ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);

const normalizeRequirement = (requirement: any) => ({
    requirementKey: cleanRequiredString(requirement?.requirementKey),
    kind: cleanRequiredString(requirement?.kind),
    displayText: cleanRequiredString(requirement?.displayText),
    polarity: cleanString(requirement?.polarity),
    groupLabel: cleanString(requirement?.groupLabel),
    groupOrder: cleanNumber(requirement?.groupOrder),
    targetRole: cleanString(requirement?.targetRole),
    targetLabel: cleanString(requirement?.targetLabel),
    requiredCount: cleanNumber(requirement?.requiredCount),
    durationTurns: cleanNumber(requirement?.durationTurns),
    state: cleanString(requirement?.state),
    referenceKind: cleanString(requirement?.referenceKind),
    referenceKey: cleanString(requirement?.referenceKey),
    referenceDisplayName: cleanString(requirement?.referenceDisplayName),
    codexEntryKey: cleanString(requirement?.codexEntryKey),
});

const normalizeReward = (reward: any) => ({
    rewardKey: cleanRequiredString(reward?.rewardKey),
    kind: cleanRequiredString(reward?.kind),
    displayText: cleanRequiredString(reward?.displayText),
    amount: cleanNumber(reward?.amount),
    groupLabel: cleanString(reward?.groupLabel),
    groupOrder: cleanNumber(reward?.groupOrder),
    formulaText: cleanString(reward?.formulaText),
    assetKind: cleanString(reward?.assetKind),
    assetKey: cleanString(reward?.assetKey),
    assetDisplayName: cleanString(reward?.assetDisplayName),
    referenceKind: cleanString(reward?.referenceKind),
    referenceKey: cleanString(reward?.referenceKey),
    referenceDisplayName: cleanString(reward?.referenceDisplayName),
    codexEntryKey: cleanString(reward?.codexEntryKey),
    targetScopeLabel: cleanString(reward?.targetScopeLabel),
});

const normalizeEntry = (entry: any): QuestExplorerEntry => ({
    entryKey: normalizeQuestKey(entry?.entryKey),
    title: cleanRequiredString(entry?.title),
    summaryLines: cleanStringList(entry?.summaryLines),
    questType: cleanString(entry?.questType),
    isMandatory: cleanBoolean(entry?.isMandatory),
    isKeyNarrativeBeat: cleanBoolean(entry?.isKeyNarrativeBeat),
    aliases: cleanStringList(entry?.aliases),
    navigation: {
        factionKey: cleanString(entry?.navigation?.factionKey),
        factionName: cleanString(entry?.navigation?.factionName),
        questLineKey: cleanString(entry?.navigation?.questLineKey),
        questLineName: cleanString(entry?.navigation?.questLineName),
        chapter: cleanNumber(entry?.navigation?.chapter),
        chapterLabel: cleanString(entry?.navigation?.chapterLabel),
        step: cleanNumber(entry?.navigation?.step),
        stepLabel: cleanString(entry?.navigation?.stepLabel),
        sequenceIndex: cleanNumber(entry?.navigation?.sequenceIndex) ?? Number.MAX_SAFE_INTEGER,
        chapterOrder: cleanNumber(entry?.navigation?.chapterOrder),
        stepOrder: cleanNumber(entry?.navigation?.stepOrder),
        branchGroupKey: cleanString(entry?.navigation?.branchGroupKey),
        branchLabel: cleanString(entry?.navigation?.branchLabel),
        branchOrder: cleanNumber(entry?.navigation?.branchOrder),
        isBranchStart: cleanBoolean(entry?.navigation?.isBranchStart),
        isBranchEnd: cleanBoolean(entry?.navigation?.isBranchEnd),
        previousEntryKeys: cleanStringList(entry?.navigation?.previousEntryKeys),
        nextEntryKeys: cleanStringList(entry?.navigation?.nextEntryKeys),
        failureEntryKeys: cleanStringList(entry?.navigation?.failureEntryKeys),
        convergesIntoEntryKeys: cleanStringList(entry?.navigation?.convergesIntoEntryKeys),
    },
    loreView: {
        sections: (entry?.loreView?.sections ?? []).map((section: any) => ({
            sectionKey: cleanRequiredString(section?.sectionKey),
            phase: cleanRequiredString(section?.phase),
            choiceKey: cleanString(section?.choiceKey),
            stepIndex: cleanNumber(section?.stepIndex),
            objectiveKey: cleanString(section?.objectiveKey),
            lines: (section?.lines ?? []).map((line: any) => ({
                speakerLabel: cleanString(line?.speakerLabel),
                role: cleanRequiredString(line?.role),
                text: cleanRequiredString(line?.text),
            })),
        })),
    },
    strategyView: {
        objectives: (entry?.strategyView?.objectives ?? []).map((objective: any) => ({
            objectiveKey: cleanString(objective?.objectiveKey),
            text: cleanRequiredString(objective?.text),
            phase: cleanString(objective?.phase),
            requirements: (objective?.requirements ?? []).map(normalizeRequirement),
            rewards: (objective?.rewards ?? []).map(normalizeReward),
        })),
    },
    branches: (entry?.branches ?? []).map((branch: any) => ({
        branchKey: cleanRequiredString(branch?.branchKey),
        choiceKey: cleanString(branch?.choiceKey),
        label: cleanRequiredString(branch?.label),
        orderIndex: cleanNumber(branch?.orderIndex),
        groupKey: cleanString(branch?.groupKey),
        groupLabel: cleanString(branch?.groupLabel),
        nextEntryKeys: cleanStringList(branch?.nextEntryKeys),
        failureEntryKeys: cleanStringList(branch?.failureEntryKeys),
        convergesIntoEntryKeys: cleanStringList(branch?.convergesIntoEntryKeys),
        lore: branch?.lore
            ? { outcomePreviewLines: cleanStringList(branch.lore.outcomePreviewLines) }
            : null,
        strategy: branch?.strategy
            ? {
                conditions: cleanStringList(branch.strategy.conditions),
                requirements: (branch.strategy.requirements ?? []).map(normalizeRequirement),
                rewards: (branch.strategy.rewards ?? []).map(normalizeReward),
            }
            : null,
    })),
    quality: entry?.quality ? { warnings: cleanStringList(entry.quality.warnings) } : null,
});

const sortEntries = (entries: QuestExplorerEntry[]) =>
    [...entries].sort((left, right) => {
        const sequenceDelta = left.navigation.sequenceIndex - right.navigation.sequenceIndex;
        if (sequenceDelta !== 0) return sequenceDelta;
        return left.entryKey.localeCompare(right.entryKey);
    });

const normalizeQuestExplorer = (questExplorer: QuestExplorerResponse) => {
    const entries = sortEntries((questExplorer.entries ?? []).map(normalizeEntry).filter((entry) => entry.entryKey));
    const entriesByKey: Record<string, QuestExplorerEntry> = {};
    const aliasToEntryKey: Record<string, string> = {};
    const duplicateEntryKeys: string[] = [];
    const duplicateAliases: string[] = [];

    for (const entry of entries) {
        if (entriesByKey[entry.entryKey]) {
            duplicateEntryKeys.push(entry.entryKey);
            continue;
        }
        entriesByKey[entry.entryKey] = entry;
    }

    for (const entry of entries) {
        for (const alias of entry.aliases) {
            const normalizedAlias = normalizeQuestKey(alias);
            if (!normalizedAlias || normalizedAlias === entry.entryKey) continue;
            if (aliasToEntryKey[normalizedAlias] && aliasToEntryKey[normalizedAlias] !== entry.entryKey) {
                duplicateAliases.push(normalizedAlias);
                continue;
            }
            aliasToEntryKey[normalizedAlias] = entry.entryKey;
        }
    }

    return {
        questExplorer: {
            ...questExplorer,
            exportKind: "quest_explorer" as const,
            schemaVersion: "quest_explorer.v3" as const,
            entries,
        },
        entries,
        entriesByKey,
        aliasToEntryKey,
        duplicateEntryKeys,
        duplicateAliases,
    };
};

const initialFilters: QuestExplorerFilters = {
    searchText: "",
    category: DEFAULT_QUEST_CATEGORY,
};

const initialState = {
    questExplorer: null as QuestExplorerResponse | null,
    entries: [] as QuestExplorerEntry[],
    entriesByKey: {} as Record<string, QuestExplorerEntry>,
    orderedEntryKeys: [] as string[],
    aliasToEntryKey: {} as Record<string, string>,
    duplicateEntryKeys: [] as string[],
    duplicateAliases: [] as string[],
    selectedEntryKey: null as string | null,
    mode: "lore" as QuestExplorerMode,
    filters: initialFilters,
    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load quest explorer: ${(reason as Error)?.message ?? String(reason)}`;

export const useQuestStore = create<QuestStore>((set, get) => ({
    ...initialState,

    loadQuestExplorer: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) return inflightLoad;
        if (!force && state.loaded) return;

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const normalized = normalizeQuestExplorer(await apiClient.getQuestExplorer());
                set((current) => {
                    const selectedEntryKey = current.selectedEntryKey && normalized.entriesByKey[current.selectedEntryKey]
                        ? current.selectedEntryKey
                        : normalized.entries[0]?.entryKey ?? null;

                    return {
                        questExplorer: normalized.questExplorer,
                        entries: normalized.entries,
                        entriesByKey: normalized.entriesByKey,
                        orderedEntryKeys: normalized.entries.map((entry) => entry.entryKey),
                        aliasToEntryKey: normalized.aliasToEntryKey,
                        duplicateEntryKeys: normalized.duplicateEntryKeys,
                        duplicateAliases: normalized.duplicateAliases,
                        selectedEntryKey,
                        loading: false,
                        loaded: true,
                        error: null,
                        lastLoadedAt: new Date().toISOString(),
                    };
                });
            } catch (err) {
                console.error("Failed to fetch quest explorer from API.", err);
                set({
                    ...initialState,
                    loaded: false,
                    error: formatLoadError(err),
                    lastLoadedAt: new Date().toISOString(),
                });
            } finally {
                inflightLoad = null;
            }
        })();

        return inflightLoad;
    },

    refreshQuestExplorer: async () => {
        await get().loadQuestExplorer({ force: true });
    },

    invalidateQuestExplorer: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    setSelectedEntryKey: (key) => {
        const resolved = get().resolveEntryKey(key);
        set({ selectedEntryKey: resolved });
    },

    setMode: (mode) => set({ mode }),

    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

    clearFilters: () => set({ filters: initialFilters }),

    resolveEntryKey: (keyOrAlias) => {
        const key = normalizeQuestKey(keyOrAlias);
        if (!key) return null;
        const state = get();
        if (state.entriesByKey[key]) return key;
        return state.aliasToEntryKey[key] ?? null;
    },

    getQuestByKey: (keyOrAlias) => {
        const resolved = get().resolveEntryKey(keyOrAlias);
        return resolved ? get().entriesByKey[resolved] : undefined;
    },
}));

const searchableText = (entry: QuestExplorerEntry): string => [
    entry.entryKey,
    entry.title,
    getQuestCategoryKey(entry.questType),
    entry.navigation.factionKey,
    entry.navigation.factionName,
    entry.navigation.questLineKey,
    entry.navigation.questLineName,
    entry.navigation.chapterLabel,
    entry.navigation.stepLabel,
    entry.navigation.branchLabel,
    ...entry.aliases,
    ...entry.summaryLines,
    ...entry.loreView.sections.flatMap((section) => [
        section.phase,
        section.choiceKey,
        ...section.lines.flatMap((line) => [line.speakerLabel, line.role, line.text]),
    ]),
    ...entry.strategyView.objectives.flatMap((objective) => [
        objective.text,
        objective.phase,
        ...objective.requirements.map((requirement) => requirement.displayText),
        ...objective.rewards.map((reward) => reward.displayText),
    ]),
].filter(Boolean).join(" ").toLowerCase();

export const selectQuestExplorer = (state: QuestStore) => state.questExplorer;
export const selectQuests = (state: QuestStore) => state.entries;
export const selectQuestsByKey = (state: QuestStore) => state.entriesByKey;
export const selectQuestKeys = (state: QuestStore) => state.orderedEntryKeys;
export const selectQuestLoading = (state: QuestStore) => state.loading;
export const selectQuestLoaded = (state: QuestStore) => state.loaded;
export const selectQuestError = (state: QuestStore) => state.error;
export const selectSelectedQuest = (state: QuestStore) =>
    state.selectedEntryKey ? state.entriesByKey[state.selectedEntryKey] : null;
export const selectQuestByKey = (key: string) => (state: QuestStore) => state.getQuestByKey(key);

export const filterQuestEntries = (
    entries: QuestExplorerEntry[],
    filters: QuestExplorerFilters,
    selectedFaction?: FactionInfo | null
) => {
    const search = filters.searchText.trim().toLowerCase();

    return entries.filter((entry) => {
        if (getQuestCategoryKey(entry.questType) !== filters.category) {
            return false;
        }
        if (!questMatchesSelectedMajorFaction(entry, selectedFaction)) {
            return false;
        }
        return !search || searchableText(entry).includes(search);
    });
};

export const selectVisibleQuestEntries = (state: QuestStore) =>
    filterQuestEntries(state.entries, state.filters);
