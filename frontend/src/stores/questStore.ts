import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type {
    QuestExplorerEntry,
    QuestExplorerResponse,
} from "@/types/questTypes";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import {
    normalizeQuestExplorer,
    normalizeQuestKey,
} from "@/features/quests/questExplorerNormalizer";
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
