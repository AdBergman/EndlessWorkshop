import type { TechUnlockRef } from "@/types/dataTypes";
import type { ConstructibleUnlockKind } from "@/utils/unlocks";
import { getRawIcon } from "./iconManifest";

type TechUnlockIconKind = ConstructibleUnlockKind | "Constructible";

const RESOLVED_KIND_RAW_KEYS: Record<TechUnlockIconKind, string> = {
    Unit: "resourceUnit",
    District: "factionTrait_Custom_Specific38",
    Improvement: "cityConstructionModeImprovement",
    Constructible: "aspect_Technology_00",
};

const CATEGORY_RAW_KEYS: Record<string, string> = {
    approval: "constructibleCategoryPublicOrder",
    bridge: "constructibleCategoryBridge",
    culture: "constructibleCategoryInfluence",
    dust: "constructibleCategoryMoney",
    empireprogression: "aspect_Technology_00",
    food: "constructibleCategoryFood_0f7ad3bf",
    industry: "constructibleCategoryIndustry_0d839acc",
    influence: "constructibleCategoryInfluence",
    military: "constructibleCategoryMilitary",
    money: "constructibleCategoryMoney",
    population: "constructibleCategoryPopulation",
    publicorder: "constructibleCategoryPublicOrder",
    resource: "constructibleCategoryResource",
    science: "constructibleCategoryScience",
    terraformation: "constructibleCategoryTerraformation",
    unit: "resourceUnit",
};

function normalize(value: string | null | undefined): string {
    return (value ?? "").trim().replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function getRawPath(rawKey: string | null | undefined): string | null {
    return rawKey ? getRawIcon(rawKey) : null;
}

export function getTechUnlockIconPath(
    unlock: TechUnlockRef,
    resolvedKind?: TechUnlockIconKind | null
): string | null {
    if (resolvedKind && resolvedKind !== "Constructible") {
        const resolvedPath = getRawPath(RESOLVED_KIND_RAW_KEYS[resolvedKind]);
        if (resolvedPath) return resolvedPath;
    }

    const categoryPath = getRawPath(CATEGORY_RAW_KEYS[normalize(unlock.unlockCategory)]);
    if (categoryPath) return categoryPath;

    const constructibleKindPath = getRawPath(CATEGORY_RAW_KEYS[normalize(unlock.constructibleKind)]);
    if (constructibleKindPath) return constructibleKindPath;

    const typePath = getRawPath(CATEGORY_RAW_KEYS[normalize(unlock.unlockType)]);
    if (typePath) return typePath;

    return getRawPath(resolvedKind ? RESOLVED_KIND_RAW_KEYS[resolvedKind] : RESOLVED_KIND_RAW_KEYS.Constructible);
}
