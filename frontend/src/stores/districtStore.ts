import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { District } from "@/types/dataTypes";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";

type LoadOptions = {
    force?: boolean;
};

type DistrictStore = {
    districts: District[];
    districtsByKey: Record<string, District>;
    districtKeys: string[];
    duplicateDistrictKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadDistricts: (opts?: LoadOptions) => Promise<void>;
    refreshDistricts: () => Promise<void>;
    invalidateDistricts: () => void;
    reset: () => void;

    getDistrictByKey: (key: string) => District | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeDistrictKey = (key: string | null | undefined) => (key ?? "").trim();

const normalizeDistrict = (district: District): District => ({
    ...district,
    districtKey: normalizeDistrictKey(district.districtKey),
    displayName: district.displayName ?? "",
    descriptionLines: (district.descriptionLines ?? []).filter(
        (line): line is string => typeof line === "string"
    ),
    unlockTechnologyKeys: stringList(district.unlockTechnologyKeys),
    levelUp: normalizeLevelUp(district.levelUp),
    placementPrerequisites: normalizePlacement(district.placementPrerequisites),
});

const initialState = {
    districts: [] as District[],
    districtsByKey: {} as Record<string, District>,
    districtKeys: [] as string[],
    duplicateDistrictKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load districts: ${(reason as Error)?.message ?? String(reason)}`;

function stringList(values: readonly unknown[] | null | undefined): string[] {
    return (values ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean);
}

function normalizeLevelUp(levelUp: District["levelUp"]): District["levelUp"] {
    if (!levelUp) return null;

    const targetDistrictKey = normalizeDistrictKey(levelUp.targetDistrictKey);
    const requiredAdjacentDistrictCount = Number.isFinite(levelUp.requiredAdjacentDistrictCount)
        ? levelUp.requiredAdjacentDistrictCount
        : null;

    return targetDistrictKey || requiredAdjacentDistrictCount !== null
        ? { targetDistrictKey: targetDistrictKey || null, requiredAdjacentDistrictCount }
        : null;
}

function normalizePlacement(
    placement: District["placementPrerequisites"]
): District["placementPrerequisites"] {
    const neighbourTiles = placement?.neighbourTiles;
    if (!neighbourTiles) return null;

    const operator = typeof neighbourTiles.operator === "string" ? neighbourTiles.operator.trim() : "";
    const territoryConstraint = typeof neighbourTiles.territoryConstraint === "string"
        ? neighbourTiles.territoryConstraint.trim()
        : "";
    const ignoreCliff = typeof neighbourTiles.ignoreCliff === "boolean" ? neighbourTiles.ignoreCliff : null;

    return operator || territoryConstraint || ignoreCliff !== null
        ? {
                neighbourTiles: {
                    operator: operator || null,
                    territoryConstraint: territoryConstraint || null,
                    ignoreCliff,
                },
            }
        : null;
}

export const useDistrictStore = create<DistrictStore>((set, get) => ({
    ...initialState,

    loadDistricts: async (opts) => {
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
                const normalizedDistricts = (await apiClient.getDistricts()).map(normalizeDistrict);
                const districts = normalizeCollection(
                    normalizedDistricts,
                    (district) => district.districtKey,
                    { normalizeKey: normalizeDistrictKey }
                );

                set({
                    districts: districts.items,
                    districtsByKey: districts.byKey,
                    districtKeys: districts.keys,
                    duplicateDistrictKeys: districts.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch districts from API.", err);
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

    refreshDistricts: async () => {
        await get().loadDistricts({ force: true });
    },

    invalidateDistricts: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    getDistrictByKey: (key) => {
        const normalizedKey = normalizeDistrictKey(key);
        if (!normalizedKey) return undefined;
        return get().districtsByKey[normalizedKey];
    },
}));

export const selectDistricts = (state: DistrictStore) => state.districts;
export const selectDistrictsByKey = (state: DistrictStore) => state.districtsByKey;
export const selectDistrictLoading = (state: DistrictStore) => state.loading;
export const selectDistrictLoaded = (state: DistrictStore) => state.loaded;
export const selectDistrictError = (state: DistrictStore) => state.error;

export const selectDistrictByKey = (key: string) => (state: DistrictStore) =>
    state.districtsByKey[normalizeDistrictKey(key)];
