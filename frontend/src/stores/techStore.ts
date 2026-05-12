import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { Tech } from "@/types/dataTypes";

type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

type LoadOptions = {
    force?: boolean;
};

type TechStore = {
    techs: Tech[];
    techsByKey: Record<string, Tech>;
    techKeys: string[];
    duplicateTechKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadTechs: (opts?: LoadOptions) => Promise<void>;
    refreshTechs: () => Promise<void>;
    invalidateTechs: () => void;
    reset: () => void;

    replaceTechs: (techs: Tech[]) => void;
    getTechByKey: (key: string) => Tech | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeTechKey = (key: string | null | undefined) => (key ?? "").trim();

const normalizeTech = (tech: Tech): Tech => ({
    ...tech,
    techKey: normalizeTechKey(tech.techKey),
    factions: (tech.factions ?? []).map((faction) => faction.toUpperCase()),
    descriptionLines: (tech.descriptionLines ?? []).filter(
        (line): line is string => typeof line === "string"
    ),
    unlocks: (tech.unlocks ?? []).filter((unlock): unlock is Tech["unlocks"][number] => !!unlock),
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
        const key = normalizeTechKey(getKey(item));
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
    techs: [] as Tech[],
    techsByKey: {} as Record<string, Tech>,
    techKeys: [] as string[],
    duplicateTechKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load techs: ${(reason as Error)?.message ?? String(reason)}`;

const normalizeTechCollection = (rawTechs: Tech[]) => {
    const normalizedTechs = rawTechs.map(normalizeTech);
    return normalizeCollection(normalizedTechs, (tech) => tech.techKey);
};

export const useTechStore = create<TechStore>((set, get) => ({
    ...initialState,

    loadTechs: async (opts) => {
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
                const techs = normalizeTechCollection(await apiClient.getTechs());

                set({
                    techs: techs.items,
                    techsByKey: techs.byKey,
                    techKeys: techs.keys,
                    duplicateTechKeys: techs.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch techs from API.", err);
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

    refreshTechs: async () => {
        await get().loadTechs({ force: true });
    },

    invalidateTechs: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    replaceTechs: (rawTechs) => {
        const techs = normalizeTechCollection(rawTechs);

        set({
            techs: techs.items,
            techsByKey: techs.byKey,
            techKeys: techs.keys,
            duplicateTechKeys: techs.duplicateKeys,
            loading: false,
            loaded: true,
            error: null,
            lastLoadedAt: new Date().toISOString(),
        });
    },

    getTechByKey: (key) => {
        const normalizedKey = normalizeTechKey(key);
        if (!normalizedKey) return undefined;
        return get().techsByKey[normalizedKey];
    },
}));

export const selectTechs = (state: TechStore) => state.techs;
export const selectTechsByKey = (state: TechStore) => state.techsByKey;
export const selectTechLoading = (state: TechStore) => state.loading;
export const selectTechLoaded = (state: TechStore) => state.loaded;
export const selectTechError = (state: TechStore) => state.error;

export const selectTechByKey = (key: string) => (state: TechStore) =>
    state.techsByKey[normalizeTechKey(key)];

export const getTechsByKeys = (
    techKeys: string[],
    techsByKey: Record<string, Tech>
): Tech[] =>
    techKeys
        .map((key) => techsByKey[normalizeTechKey(key)])
        .filter((tech): tech is Tech => !!tech);

export const selectTechsByKeys = (techKeys: string[]) => (state: TechStore) =>
    getTechsByKeys(techKeys, state.techsByKey);
