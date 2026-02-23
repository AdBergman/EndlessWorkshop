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

export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvements: Improvement[]
): UnlockedImprovement[] => {
    // Improvements unlocked by CONSTRUCTIBLE where unlockKey == improvementKey
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "CONSTRUCTIBLE");

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
    // Districts unlocked by CONSTRUCTIBLE where unlockKey == districtKey
    const earliestEraByUnlockKey = buildEarliestEraByUnlockKey(selectedTechs, "CONSTRUCTIBLE");

    return districts
        .filter((d) => !!d.districtKey && earliestEraByUnlockKey.has(normalizeKey(d.districtKey)))
        .map((d) => ({
            ...d,
            era: earliestEraByUnlockKey.get(normalizeKey(d.districtKey)) ?? 1,
        }))
        .sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));
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