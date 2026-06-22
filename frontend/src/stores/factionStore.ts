import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";
import type { RichFaction } from "@/types/dataTypes";

type LoadOptions = {
    force?: boolean;
};

type FactionStore = {
    factions: RichFaction[];
    factionsByKey: Record<string, RichFaction>;
    factionKeys: string[];
    duplicateFactionKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadFactions: (opts?: LoadOptions) => Promise<void>;
    refreshFactions: () => Promise<void>;
    invalidateFactions: () => void;
    reset: () => void;

    replaceFactions: (factions: RichFaction[]) => void;
    getFactionByKey: (key: string) => RichFaction | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeFactionKey = (key: string | null | undefined) => (key ?? "").trim();

const stringList = (values: unknown): string[] =>
    Array.isArray(values)
        ? values
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
        : [];

const normalizeFaction = (faction: RichFaction): RichFaction => ({
    ...faction,
    factionKey: normalizeFactionKey(faction.factionKey),
    publicDisplayName: faction.publicDisplayName ?? "",
    lore: faction.lore ?? null,
    factionKind: faction.factionKind ?? null,
    affinityKey: faction.affinityKey ?? null,
    affinityType: faction.affinityType ?? null,
    traitKeys: stringList(faction.traitKeys),
    populationKeys: stringList(faction.populationKeys),
    unitKeys: stringList(faction.unitKeys),
    baseUnitKeys: stringList(faction.baseUnitKeys),
    heroKeys: stringList(faction.heroKeys),
    gatedTechnologyKeys: stringList(faction.gatedTechnologyKeys),
    startingFactionQuestKey: normalizeFactionKey(faction.startingFactionQuestKey) || null,
    specificQuestKeys: stringList(faction.specificQuestKeys),
    protectorateTraitKeys: stringList(faction.protectorateTraitKeys),
});

const initialState = {
    factions: [] as RichFaction[],
    factionsByKey: {} as Record<string, RichFaction>,
    factionKeys: [] as string[],
    duplicateFactionKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load factions: ${(reason as Error)?.message ?? String(reason)}`;

const normalizeFactionCollection = (rawFactions: RichFaction[]) => {
    const normalizedFactions = rawFactions.map(normalizeFaction);
    return normalizeCollection(normalizedFactions, (faction) => faction.factionKey, {
        normalizeKey: normalizeFactionKey,
    });
};

export const useFactionStore = create<FactionStore>((set, get) => ({
    ...initialState,

    loadFactions: async (opts) => {
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
                const factions = normalizeFactionCollection(await apiClient.getFactions());

                set({
                    factions: factions.items,
                    factionsByKey: factions.byKey,
                    factionKeys: factions.keys,
                    duplicateFactionKeys: factions.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch factions from API.", err);
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

    refreshFactions: async () => {
        await get().loadFactions({ force: true });
    },

    invalidateFactions: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    replaceFactions: (rawFactions) => {
        const factions = normalizeFactionCollection(rawFactions);

        set({
            factions: factions.items,
            factionsByKey: factions.byKey,
            factionKeys: factions.keys,
            duplicateFactionKeys: factions.duplicateKeys,
            loading: false,
            loaded: true,
            error: null,
            lastLoadedAt: new Date().toISOString(),
        });
    },

    getFactionByKey: (key) => {
        const normalizedKey = normalizeFactionKey(key);
        if (!normalizedKey) return undefined;
        return get().factionsByKey[normalizedKey];
    },
}));

export const selectFactions = (state: FactionStore) => state.factions;
export const selectFactionsByKey = (state: FactionStore) => state.factionsByKey;
export const selectFactionLoading = (state: FactionStore) => state.loading;
export const selectFactionLoaded = (state: FactionStore) => state.loaded;
export const selectFactionError = (state: FactionStore) => state.error;

export const selectFactionByKey = (key: string) => (state: FactionStore) =>
    state.factionsByKey[normalizeFactionKey(key)];
