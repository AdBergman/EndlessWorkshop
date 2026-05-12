import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { Unit } from "@/types/dataTypes";

type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

type LoadOptions = {
    force?: boolean;
};

type UnitStore = {
    units: Unit[];
    unitsByKey: Record<string, Unit>;
    unitKeys: string[];
    duplicateUnitKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadUnits: (opts?: LoadOptions) => Promise<void>;
    refreshUnits: () => Promise<void>;
    invalidateUnits: () => void;
    reset: () => void;

    getUnitByKey: (key: string) => Unit | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeUnitKey = (key: string | null | undefined) => (key ?? "").trim();

const normalizeUnit = (unit: Unit): Unit => ({
    ...unit,
    unitKey: normalizeUnitKey(unit.unitKey),
    displayName: unit.displayName ?? "",
    artId: unit.artId ?? null,
    faction: unit.faction ?? null,
    isMajorFaction: unit.isMajorFaction ?? false,
    isHero: unit.isHero ?? false,
    isChosen: unit.isChosen ?? false,
    spawnType: unit.spawnType ?? null,
    previousUnitKey: unit.previousUnitKey ?? null,
    nextEvolutionUnitKeys: (unit.nextEvolutionUnitKeys ?? []).filter(
        (key): key is string => typeof key === "string"
    ),
    evolutionTierIndex: unit.evolutionTierIndex ?? null,
    unitClassKey: unit.unitClassKey ?? null,
    attackSkillKey: unit.attackSkillKey ?? null,
    abilityKeys: (unit.abilityKeys ?? []).filter((key): key is string => typeof key === "string"),
    descriptionLines: (unit.descriptionLines ?? []).filter(
        (line): line is string => typeof line === "string"
    ),
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
        const key = normalizeUnitKey(getKey(item));
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
    units: [] as Unit[],
    unitsByKey: {} as Record<string, Unit>,
    unitKeys: [] as string[],
    duplicateUnitKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load units: ${(reason as Error)?.message ?? String(reason)}`;

export const useUnitStore = create<UnitStore>((set, get) => ({
    ...initialState,

    loadUnits: async (opts) => {
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
                const normalizedUnits = (await apiClient.getUnits()).map(normalizeUnit);
                const units = normalizeCollection(normalizedUnits, (unit) => unit.unitKey);

                set({
                    units: units.items,
                    unitsByKey: units.byKey,
                    unitKeys: units.keys,
                    duplicateUnitKeys: units.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch units from API.", err);
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

    refreshUnits: async () => {
        await get().loadUnits({ force: true });
    },

    invalidateUnits: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    getUnitByKey: (key) => {
        const normalizedKey = normalizeUnitKey(key);
        if (!normalizedKey) return undefined;
        return get().unitsByKey[normalizedKey];
    },
}));

export const selectUnits = (state: UnitStore) => state.units;
export const selectUnitsByKey = (state: UnitStore) => state.unitsByKey;
export const selectUnitLoading = (state: UnitStore) => state.loading;
export const selectUnitLoaded = (state: UnitStore) => state.loaded;
export const selectUnitError = (state: UnitStore) => state.error;

export const selectUnitByKey = (key: string) => (state: UnitStore) =>
    state.unitsByKey[normalizeUnitKey(key)];
