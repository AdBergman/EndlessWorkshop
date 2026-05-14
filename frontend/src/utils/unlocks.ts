import { Tech, Improvement, District, Unit, TechUnlockRef } from "@/types/dataTypes";
import { normalizeEntityRef, type EntityRef } from "@/lib/entityRef/entityRef";

export type UnlockedImprovement = Improvement & { era: number };
export type UnlockedDistrict = District & { era: number };
export type UnlockedUnit = Unit & { era: number };
export type ConstructibleUnlockKind = "District" | "Improvement" | "Unit";
export type ConstructibleEntityRef = EntityRef<"district" | "improvement" | "unit">;

export type ConstructibleUnlockResolution =
    | {
          kind: "District";
          key: string;
          district: District;
          displayName: string;
      }
    | {
          kind: "Improvement";
          key: string;
          improvement: Improvement;
          displayName: string;
      }
    | {
          kind: "Unit";
          key: string;
          unit: Unit;
          displayName: string;
      };

export type FallbackUnlockDescription = {
    kind: ConstructibleUnlockKind | "Constructible";
    key: string;
    descriptionLines: string[];
};

type ConstructibleUnlockDeps = {
    districtsByKey: Record<string, District>;
    improvementsByKey: Record<string, Improvement>;
    unitsByKey: Record<string, Unit>;
};

export type UnlockedConstructibles = {
    districts: UnlockedDistrict[];
    improvements: UnlockedImprovement[];
    units: UnlockedUnit[];
};

const normalizeKey = (k: string) => k.trim();

const normType = (t: string | undefined) => (t ?? "").trim().toUpperCase();

const normKind = (kind: string | null | undefined): ConstructibleUnlockKind | null => {
    const normalized = (kind ?? "").trim().toUpperCase();
    if (normalized === "DISTRICT" || normalized === "DISTRICTS") return "District";
    if (normalized === "IMPROVEMENT" || normalized === "IMPROVEMENTS") return "Improvement";
    if (normalized === "UNIT" || normalized === "UNITS") return "Unit";
    return null;
};

const getExplicitConstructibleKind = (unlock: TechUnlockRef): ConstructibleUnlockKind | null =>
    normKind(unlock.unlockCategory) ?? normKind(unlock.constructibleKind);

const isConstructibleLikeUnlock = (unlock: TechUnlockRef) => {
    const type = normType(unlock.unlockType);
    return type === "CONSTRUCTIBLE" || type === "UNIT";
};

const cleanDescriptionLines = (lines: string[] | null | undefined) =>
    (lines ?? [])
        .map((line) => (line ?? "").trim())
        .filter((line) => line.length > 0);

const toByKey = <T,>(items: T[], getKey: (item: T) => string | null | undefined) =>
    items.reduce<Record<string, T>>((acc, item) => {
        const key = normalizeKey(getKey(item) ?? "");
        if (key) acc[key] = item;
        return acc;
    }, {});

const sortUnlockedByEraAndName = <T extends { era: number; displayName: string }>(items: T[]) =>
    items.sort((a, b) => a.era - b.era || a.displayName.localeCompare(b.displayName));

const resolveUnitByKey = (key: string, unitsByKey: Record<string, Unit>) =>
    unitsByKey[key];

const constructibleEntityKind = (
    kind: ConstructibleUnlockKind
): ConstructibleEntityRef["kind"] => {
    switch (kind) {
        case "District":
            return "district";
        case "Improvement":
            return "improvement";
        case "Unit":
            return "unit";
    }
};

const toConstructibleEntityRef = (
    kind: ConstructibleEntityRef["kind"],
    key: string
): ConstructibleEntityRef | null => normalizeEntityRef({ kind, key }) as ConstructibleEntityRef | null;

export function getTechUnlockConstructibleCandidateRefs(unlock: TechUnlockRef): ConstructibleEntityRef[] {
    const key = normalizeKey(unlock.unlockKey ?? "");
    if (!key || !isConstructibleLikeUnlock(unlock)) return [];

    if (normType(unlock.unlockType) === "UNIT") {
        const ref = toConstructibleEntityRef("unit", key);
        return ref ? [ref] : [];
    }

    const explicitKind = getExplicitConstructibleKind(unlock);
    if (explicitKind) {
        const ref = toConstructibleEntityRef(constructibleEntityKind(explicitKind), key);
        return ref ? [ref] : [];
    }

    return (["unit", "district", "improvement"] as const)
        .map((kind) => toConstructibleEntityRef(kind, key))
        .filter((ref): ref is ConstructibleEntityRef => !!ref);
}

export const resolveDistrictUnlock = (
    unlock: TechUnlockRef,
    districtsByKey: Record<string, District>
) => {
    const key = normalizeKey(unlock.unlockKey ?? "");
    if (!key || !isConstructibleLikeUnlock(unlock)) return null;

    const explicitKind = getExplicitConstructibleKind(unlock);
    if (explicitKind && explicitKind !== "District") return null;

    return districtsByKey[key] ?? null;
};

export const resolveImprovementUnlock = (
    unlock: TechUnlockRef,
    improvementsByKey: Record<string, Improvement>
) => {
    const key = normalizeKey(unlock.unlockKey ?? "");
    if (!key || !isConstructibleLikeUnlock(unlock)) return null;

    const explicitKind = getExplicitConstructibleKind(unlock);
    if (explicitKind && explicitKind !== "Improvement") return null;

    return improvementsByKey[key] ?? null;
};

export const resolveConstructibleUnlock = (
    unlock: TechUnlockRef,
    deps: ConstructibleUnlockDeps
): ConstructibleUnlockResolution | null => {
    const { districtsByKey, improvementsByKey, unitsByKey } = deps;
    const candidateRefs = getTechUnlockConstructibleCandidateRefs(unlock);

    for (const candidateRef of candidateRefs) {
        if (candidateRef.kind === "unit") {
            const unit = resolveUnitByKey(candidateRef.key, unitsByKey);
            if (unit) {
                return {
                    kind: "Unit",
                    key: candidateRef.key,
                    unit,
                    displayName: unit.displayName ?? candidateRef.key,
                };
            }
            continue;
        }

        if (candidateRef.kind === "district") {
            const district = districtsByKey[candidateRef.key];
            if (district) {
                return {
                    kind: "District",
                    key: candidateRef.key,
                    district,
                    displayName: district.displayName ?? candidateRef.key,
                };
            }
            continue;
        }

        const improvement = improvementsByKey[candidateRef.key];
        if (improvement) {
            return {
                kind: "Improvement",
                key: candidateRef.key,
                improvement,
                displayName: improvement.displayName ?? candidateRef.key,
            };
        }

    }

    return null;
};

export const getFallbackUnlockDescription = (unlock: TechUnlockRef): FallbackUnlockDescription | null => {
    const key = normalizeKey(unlock.unlockKey ?? "");
    if (!key || !isConstructibleLikeUnlock(unlock)) return null;

    const descriptionLines = cleanDescriptionLines(unlock.fallbackDescriptionLines);
    if (descriptionLines.length === 0) return null;

    return {
        kind: getExplicitConstructibleKind(unlock) ?? (normType(unlock.unlockType) === "UNIT" ? "Unit" : "Constructible"),
        key,
        descriptionLines,
    };
};

export const getUnlockedConstructiblesByKey = (
    selectedTechs: Tech[],
    deps: ConstructibleUnlockDeps
): UnlockedConstructibles => {
    const earliestDistrictEraByKey = new Map<string, number>();
    const earliestImprovementEraByKey = new Map<string, number>();
    const earliestUnitEraByKey = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const unlock of tech.unlocks ?? []) {
            const resolved = resolveConstructibleUnlock(unlock, deps);
            if (!resolved) continue;

            const eraByKey =
                resolved.kind === "District"
                    ? earliestDistrictEraByKey
                    : resolved.kind === "Improvement"
                      ? earliestImprovementEraByKey
                      : earliestUnitEraByKey;

            const prev = eraByKey.get(resolved.key);
            if (prev === undefined || era < prev) eraByKey.set(resolved.key, era);
        }
    }

    return {
        districts: sortUnlockedByEraAndName(
            Array.from(earliestDistrictEraByKey.entries())
                .map(([key, era]) => {
                    const district = deps.districtsByKey[key];
                    return district ? { ...district, era } : null;
                })
                .filter((district): district is UnlockedDistrict => !!district)
        ),
        improvements: sortUnlockedByEraAndName(
            Array.from(earliestImprovementEraByKey.entries())
                .map(([key, era]) => {
                    const improvement = deps.improvementsByKey[key];
                    return improvement ? { ...improvement, era } : null;
                })
                .filter((improvement): improvement is UnlockedImprovement => !!improvement)
        ),
        units: sortUnlockedByEraAndName(
            Array.from(earliestUnitEraByKey.entries())
                .map(([key, era]) => {
                    const unit = resolveUnitByKey(key, deps.unitsByKey);
                    return unit ? { ...unit, era } : null;
                })
                .filter((unit): unit is UnlockedUnit => !!unit)
        ),
    };
};

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
    const earliestEraByUnlockKey = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const unlock of tech.unlocks ?? []) {
            const improvement = resolveImprovementUnlock(unlock, improvementsByKey);
            if (!improvement) continue;

            const key = normalizeKey(improvement.improvementKey);
            const prev = earliestEraByUnlockKey.get(key);
            if (prev === undefined || era < prev) earliestEraByUnlockKey.set(key, era);
        }
    }

    return sortUnlockedByEraAndName(
        Array.from(earliestEraByUnlockKey.entries())
            .map(([key, era]) => {
                const improvement = improvementsByKey[key];
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
    const earliestEraByUnlockKey = new Map<string, number>();

    for (const tech of selectedTechs) {
        const era = tech.era ?? 1;

        for (const unlock of tech.unlocks ?? []) {
            const district = resolveDistrictUnlock(unlock, districtsByKey);
            if (!district) continue;

            const key = normalizeKey(district.districtKey);
            const prev = earliestEraByUnlockKey.get(key);
            if (prev === undefined || era < prev) earliestEraByUnlockKey.set(key, era);
        }
    }

    return sortUnlockedByEraAndName(
        Array.from(earliestEraByUnlockKey.entries())
            .map(([key, era]) => {
                const district = districtsByKey[key];
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
