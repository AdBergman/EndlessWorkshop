import { Tech, Improvement, District, Unit, TechUnlockRef } from "@/types/dataTypes";

export type UnlockedImprovement = Improvement & { era: number };
export type UnlockedDistrict = District & { era: number };
export type UnlockedUnit = Unit & { era: number };

const normalizeKey = (k: string) => k.trim();

const normType = (t: string | undefined) => (t ?? "").trim().toUpperCase();

const getTechUnlocksOfType = (tech: Tech, unlockType: string): TechUnlockRef[] => {
    const t = unlockType.trim().toUpperCase();
    return (tech.unlocks ?? []).filter(
        (u) => normType(u.unlockType) === t && !!u.unlockKey?.trim()
    );
};

const buildEarliestEraByUnlockKey = (selectedTechs: Tech[], unlockType: string) => {
    const earliestEraByKey = new Map<string, number>();
    const t = unlockType.trim().toUpperCase();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const u of (tech.unlocks ?? [])) {
            if (normType(u.unlockType) !== t) continue;
            const key = u.unlockKey?.trim();
            if (!key) continue;

            const nk = normalizeKey(key);
            const prev = earliestEraByKey.get(nk);
            if (prev === undefined || era < prev) earliestEraByKey.set(nk, era);
        }
    }

    return earliestEraByKey;
};

const toByKey = <T,>(items: T[], getKey: (item: T) => string | null | undefined) =>
    items.reduce<Record<string, T>>((acc, item) => {
        const key = normalizeKey(getKey(item) ?? "");
        if (key) acc[key] = item;
        return acc;
    }, {});

const sortUnlockedByEraAndName = <T extends { era: number; displayName: string }>(items: T[]) =>
    items.sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));

export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvements: Improvement[]
): UnlockedImprovement[] => {
    return getUnlockedImprovementsByKey(
        selectedTechs,
        toByKey(improvements, (improvement) => improvement.improvementKey)
    );
};

export const getUnlockedImprovementsByKey = (
    selectedTechs: Tech[],
    improvementsByKey: Record<string, Improvement>
): UnlockedImprovement[] => {
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "CONSTRUCTIBLE");

    return sortUnlockedByEraAndName(
        Array.from(earliestEraByUnlockKey.entries())
            .map(([key, era]) => {
                const improvement = improvementsByKey[normalizeKey(key)];
                return improvement ? { ...improvement, era } : null;
            })
            .filter((improvement): improvement is UnlockedImprovement => !!improvement)
    );
};

export const getUnlockedDistricts = (
    selectedTechs: Tech[],
    districts: District[]
): UnlockedDistrict[] => {
    return getUnlockedDistrictsByKey(
        selectedTechs,
        toByKey(districts, (district) => district.districtKey)
    );
};

export const getUnlockedDistrictsByKey = (
    selectedTechs: Tech[],
    districtsByKey: Record<string, District>
): UnlockedDistrict[] => {
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "CONSTRUCTIBLE");

    return sortUnlockedByEraAndName(
        Array.from(earliestEraByUnlockKey.entries())
            .map(([key, era]) => {
                const district = districtsByKey[normalizeKey(key)];
                return district ? { ...district, era } : null;
            })
            .filter((district): district is UnlockedDistrict => !!district)
    );
};

const buildEarliestEraByUnitUnlockKey = (selectedTechs: Tech[]) => {
    const earliestEraByKey = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const u of tech.unlocks ?? []) {
            const key = u.unlockKey?.trim();
            if (!key) continue;

            const type = normType(u.unlockType);

            // Units are typically CONSTRUCTIBLE with unlockKey starting with Unit_
            const isUnitUnlock =
                (type === "CONSTRUCTIBLE" && key.startsWith("Unit_")) ||
                type === "UNIT";

            if (!isUnitUnlock) continue;

            const nk = normalizeKey(key);
            const prev = earliestEraByKey.get(nk);
            if (prev === undefined || era < prev) earliestEraByKey.set(nk, era);
        }
    }

    return earliestEraByKey;
};

export const getUnlockedUnits = (selectedTechs: Tech[], units: Unit[]): UnlockedUnit[] => {
    // Unit unlocks are key-based: unlock.unlockKey == unit.unitKey (e.g., Unit_Aspect_Giant)
    const earliestEraByUnlockKey = buildEarliestEraByUnitUnlockKey(selectedTechs);

    return units
        .filter((u) => !!u.unitKey && earliestEraByUnlockKey.has(normalizeKey(u.unitKey)))
        .map((u) => ({
            ...u,
            era: earliestEraByUnlockKey.get(normalizeKey(u.unitKey)) ?? 1,
        }))
        .sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));
};
