import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { District, Improvement } from "@/types/dataTypes";

type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

type LoadOptions = {
    force?: boolean;
};

type Store = {
    districts: District[];
    districtsByKey: Record<string, District>;
    districtKeys: string[];
    duplicateDistrictKeys: string[];

    improvements: Improvement[];
    improvementsByKey: Record<string, Improvement>;
    improvementKeys: string[];
    duplicateImprovementKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    load: (opts?: LoadOptions) => Promise<void>;
    refresh: () => Promise<void>;
    invalidate: () => void;
    reset: () => void;

    getDistrictByKey: (key: string) => District | undefined;
    getImprovementByKey: (key: string) => Improvement | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeEntityKey = (key: string | null | undefined) => (key ?? "").trim();

const normalizeDistrict = (district: District): District => ({
    ...district,
    districtKey: normalizeEntityKey(district.districtKey),
    displayName: district.displayName ?? "",
    descriptionLines: (district.descriptionLines ?? []).filter(
        (line): line is string => typeof line === "string"
    ),
});

const normalizeImprovement = (improvement: Improvement): Improvement => ({
    ...improvement,
    improvementKey: normalizeEntityKey(improvement.improvementKey),
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
        const key = normalizeEntityKey(getKey(item));
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

    improvements: [] as Improvement[],
    improvementsByKey: {} as Record<string, Improvement>,
    improvementKeys: [] as string[],
    duplicateImprovementKeys: [] as string[],

    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (districtReason?: unknown, improvementReason?: unknown) => {
    const parts: string[] = [];
    if (districtReason) {
        parts.push(`districts: ${(districtReason as Error)?.message ?? String(districtReason)}`);
    }
    if (improvementReason) {
        parts.push(
            `improvements: ${(improvementReason as Error)?.message ?? String(improvementReason)}`
        );
    }
    return parts.length > 0 ? `Failed to load ${parts.join("; ")}` : null;
};

export const useDistrictImprovementStore = create<Store>((set, get) => ({
    ...initialState,

    load: async (opts) => {
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
            const [districtRes, improvementRes] = await Promise.allSettled([
                apiClient.getDistricts(),
                apiClient.getImprovements(),
            ]);

            const next: Partial<Store> = {
                loading: false,
                loaded: districtRes.status === "fulfilled" && improvementRes.status === "fulfilled",
                lastLoadedAt: new Date().toISOString(),
                error:
                    districtRes.status === "rejected" || improvementRes.status === "rejected"
                        ? formatLoadError(
                              districtRes.status === "rejected" ? districtRes.reason : undefined,
                              improvementRes.status === "rejected" ? improvementRes.reason : undefined
                          )
                        : null,
            };

            if (districtRes.status === "fulfilled") {
                const normalizedDistricts = districtRes.value.map(normalizeDistrict);
                const districts = normalizeCollection(
                    normalizedDistricts,
                    (district) => district.districtKey
                );

                next.districts = districts.items;
                next.districtsByKey = districts.byKey;
                next.districtKeys = districts.keys;
                next.duplicateDistrictKeys = districts.duplicateKeys;
            } else {
                console.error("Failed to fetch districts from API.", districtRes.reason);
                next.districts = [];
                next.districtsByKey = {};
                next.districtKeys = [];
                next.duplicateDistrictKeys = [];
            }

            if (improvementRes.status === "fulfilled") {
                const normalizedImprovements = improvementRes.value.map(normalizeImprovement);
                const improvements = normalizeCollection(
                    normalizedImprovements,
                    (improvement) => improvement.improvementKey
                );

                next.improvements = improvements.items;
                next.improvementsByKey = improvements.byKey;
                next.improvementKeys = improvements.keys;
                next.duplicateImprovementKeys = improvements.duplicateKeys;
            } else {
                console.error("Failed to fetch improvements from API.", improvementRes.reason);
                next.improvements = [];
                next.improvementsByKey = {};
                next.improvementKeys = [];
                next.duplicateImprovementKeys = [];
            }

            set(next);
            inflightLoad = null;
        })();

        return inflightLoad;
    },

    refresh: async () => {
        await get().load({ force: true });
    },

    invalidate: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    getDistrictByKey: (key) => {
        const normalizedKey = normalizeEntityKey(key);
        if (!normalizedKey) return undefined;
        return get().districtsByKey[normalizedKey];
    },

    getImprovementByKey: (key) => {
        const normalizedKey = normalizeEntityKey(key);
        if (!normalizedKey) return undefined;
        return get().improvementsByKey[normalizedKey];
    },
}));

export const selectDistricts = (state: Store) => state.districts;
export const selectImprovements = (state: Store) => state.improvements;
export const selectDistrictsByKey = (state: Store) => state.districtsByKey;
export const selectImprovementsByKey = (state: Store) => state.improvementsByKey;
export const selectDistrictImprovementLoading = (state: Store) => state.loading;
export const selectDistrictImprovementLoaded = (state: Store) => state.loaded;
export const selectDistrictImprovementError = (state: Store) => state.error;

export const selectDistrictByKey = (key: string) => (state: Store) =>
    state.districtsByKey[normalizeEntityKey(key)];

export const selectImprovementByKey = (key: string) => (state: Store) =>
    state.improvementsByKey[normalizeEntityKey(key)];
