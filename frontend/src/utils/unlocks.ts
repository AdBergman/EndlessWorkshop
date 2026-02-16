import { Tech, Improvement, District, Unit, TechUnlockRef } from "@/types/dataTypes";

export type UnlockedImprovement = Improvement & { era: number };
export type UnlockedDistrict = District & { era: number };
export type UnlockedUnit = Unit & { era: number };

const normalizeKey = (k: string) => k.trim();

const getTechUnlocksOfType = (tech: Tech, unlockType: string): TechUnlockRef[] => {
    const t = unlockType.trim().toUpperCase();
    return (tech.unlocks ?? []).filter(
        (u) => (u.unlockType ?? "").trim().toUpperCase() === t && !!u.unlockKey?.trim()
    );
};

const buildEarliestEraByUnlockKey = (selectedTechs: Tech[], unlockType: string) => {
    const earliestEraByKey = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const u of getTechUnlocksOfType(tech, unlockType)) {
            const key = normalizeKey(u.unlockKey);
            const prev = earliestEraByKey.get(key);
            if (prev === undefined || era < prev) earliestEraByKey.set(key, era);
        }
    }

    return earliestEraByKey;
};

export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvements: Improvement[]
): UnlockedImprovement[] => {
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "Constructible");

    return improvements
        .filter((imp) => !!imp.improvementKey && earliestEraByUnlockKey.has(normalizeKey(imp.improvementKey)))
        .map((imp) => ({
            ...imp,
            era: earliestEraByUnlockKey.get(normalizeKey(imp.improvementKey)) ?? 1,
        }))
        .sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));
};

export const getUnlockedDistricts = (
    selectedTechs: Tech[],
    districts: District[]
): UnlockedDistrict[] => {
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "Constructible");

    return districts
        .filter((d) => !!d.districtKey && earliestEraByUnlockKey.has(normalizeKey(d.districtKey)))
        .map((d) => ({
            ...d,
            era: earliestEraByUnlockKey.get(normalizeKey(d.districtKey)) ?? 1,
        }))
        .sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));
};

// Units are still legacy (backend not done yet), so keep this logic aligned to your current unlockType.
export const getUnlockedUnits = (selectedTechs: Tech[], units: Unit[]): UnlockedUnit[] => {
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "Unit");

    return units
        .filter((u) => !!u.unitKey && earliestEraByUnlockKey.has(normalizeKey(u.unitKey)))
        .map((u) => ({
            ...u,
            era: earliestEraByUnlockKey.get(normalizeKey(u.unitKey)) ?? 1,
        }))
        .sort((a, b) => a.era - b.era || a.name.localeCompare(b.name));
};