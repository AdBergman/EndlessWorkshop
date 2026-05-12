import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { District } from "@/types/dataTypes";

type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

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
        const key = normalizeDistrictKey(getKey(item));
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
                    (district) => district.districtKey
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
