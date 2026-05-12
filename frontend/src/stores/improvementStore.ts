import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { Improvement } from "@/types/dataTypes";

type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

type LoadOptions = {
    force?: boolean;
};

type ImprovementStore = {
    improvements: Improvement[];
    improvementsByKey: Record<string, Improvement>;
    improvementKeys: string[];
    duplicateImprovementKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadImprovements: (opts?: LoadOptions) => Promise<void>;
    refreshImprovements: () => Promise<void>;
    invalidateImprovements: () => void;
    reset: () => void;

    getImprovementByKey: (key: string) => Improvement | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeImprovementKey = (key: string | null | undefined) => (key ?? "").trim();

const normalizeImprovement = (improvement: Improvement): Improvement => ({
    ...improvement,
    improvementKey: normalizeImprovementKey(improvement.improvementKey),
    displayName: improvement.displayName ?? "",
    descriptionLines: (improvement.descriptionLines ?? []).filter(
        (line): line is string => typeof line === "string"
    ),
    cost: (improvement.cost ?? []).filter((line): line is string => typeof line === "string"),
});

const normalizeCollection = <T,>(
    rawItems: T[],
    getKey: (item: T) => string | null | undefined
): NormalizedCollection<T> => {
    const byKey: Record<string, T> = {};
    const keys: string[] = [];
    const duplicateKeys: string[] = [];
    const duplicateKeySet = new Set<string>();

    for (const item of rawItems) {
        const key = normalizeImprovementKey(getKey(item));
        if (!key) continue;

        if (byKey[key]) {
            if (!duplicateKeySet.has(key)) {
                duplicateKeys.push(key);
                duplicateKeySet.add(key);
            }
        } else {
            keys.push(key);
        }

        byKey[key] = item;
    }

    return {
        byKey,
        keys,
        duplicateKeys,
        items: keys.map((key) => byKey[key]).filter((item): item is T => !!item),
    };
};

const initialState = {
    improvements: [] as Improvement[],
    improvementsByKey: {} as Record<string, Improvement>,
    improvementKeys: [] as string[],
    duplicateImprovementKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load improvements: ${(reason as Error)?.message ?? String(reason)}`;

export const useImprovementStore = create<ImprovementStore>((set, get) => ({
    ...initialState,

    loadImprovements: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) {
            return inflightLoad;
        }

        if (!force && state.loaded) {
            return;
        }

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const normalizedImprovements = (await apiClient.getImprovements()).map(
                    normalizeImprovement
                );
                const improvements = normalizeCollection(
                    normalizedImprovements,
                    (improvement) => improvement.improvementKey
                );

                set({
                    improvements: improvements.items,
                    improvementsByKey: improvements.byKey,
                    improvementKeys: improvements.keys,
                    duplicateImprovementKeys: improvements.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch improvements from API.", err);
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

    refreshImprovements: async () => {
        await get().loadImprovements({ force: true });
    },

    invalidateImprovements: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    getImprovementByKey: (key) => {
        const normalizedKey = normalizeImprovementKey(key);
        if (!normalizedKey) return undefined;
        return get().improvementsByKey[normalizedKey];
    },
}));

export const selectImprovements = (state: ImprovementStore) => state.improvements;
export const selectImprovementsByKey = (state: ImprovementStore) => state.improvementsByKey;
export const selectImprovementLoading = (state: ImprovementStore) => state.loading;
export const selectImprovementLoaded = (state: ImprovementStore) => state.loaded;
export const selectImprovementError = (state: ImprovementStore) => state.error;

export const selectImprovementByKey = (key: string) => (state: ImprovementStore) =>
    state.improvementsByKey[normalizeImprovementKey(key)];
