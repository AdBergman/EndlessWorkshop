import { getRawIcon } from "./iconManifest";

// Frontend bridge for current exporter token gaps. Use raw manifest keys here so
// future semantic exporter entries can replace these aliases without UI changes.
export type DescriptionTokenIconAlias = {
    path: string;
    color?: string;
    variants?: Record<string, { path: string; color?: string }>;
};

const TOKEN_RAW_KEY_ALIASES: Record<string, string[]> = {
    cadaverscolored: ["necrophage_District_Appendage00_Tier1_v2"],
    coral: ["effect_EmpireBonus_CoralHealthRegen"],
    determination: ["unitAbility_Hero_DexterityTrad"],
    doublearrow: ["technologyWindowLinkPrerequisiteUnlocked", "technologyWindowLinkPrerequisite"],
    food: ["constructibleCategoryFood"],
    influence: ["status_Empire_InfluencePerCouncilor"],
    intuition: ["unitAbility_Hero_IntellectTrad"],
    intuiton: ["unitAbility_Hero_IntellectTrad"],
    luxury: ["breakdownSourcesTypesBoosterResource"],
    might: ["unitAbility_Hero_StrengthTrad"],
    militarycolored: ["constructibleCategoryMilitary"],
    money: ["actionCostModifier_Bribe_Decrease00"],
    populationcategory_01: ["populationCategory_01"],
    populationcategory_02: ["populationCategory_02"],
    populationcategory_03: ["effect_EmpireBonus_PopSlot_Category03_OnCapital_00"],
    populationcategory_homeless: ["populationCategory_Homeless"],
    publicorder: ["status_Empire_Approval_High"],
    resilience: ["unitAbility_Hero_ConstitutionTrad"],
    resourceall: ["resourceTypeAny"],
    resourceluxury: ["breakdownSourcesTypesBoosterResource"],
    technology: ["aspect_Technology_00"],
};

function normalizeToken(token: string): string {
    const trimmed = token.trim();
    const unwrapped = trimmed.startsWith("[") && trimmed.endsWith("]")
        ? trimmed.slice(1, -1).trim()
        : trimmed;

    return unwrapped.toLowerCase();
}

function rawIconFromCandidates(rawKeys: readonly string[]): string | null {
    for (const rawKey of rawKeys) {
        const path = getRawIcon(rawKey);
        if (path) return path;
    }

    return null;
}

function numberedResourceAlias(rawKind: "Luxury" | "Strategic", numberText: string): DescriptionTokenIconAlias | null {
    const resourceNumber = Number(numberText);
    if (!Number.isInteger(resourceNumber) || resourceNumber < 1) {
        return null;
    }

    const path = getRawIcon(`extractor_${rawKind}${String(resourceNumber).padStart(2, "0")}`);
    return path ? { path } : null;
}

function attackRangeAlias(): DescriptionTokenIconAlias | null {
    const variants = Object.fromEntries(
        Array.from({ length: 7 }, (_, index) => {
            const range = String(index + 1);
            const path = getRawIcon(`unitAbility_Ranged_${range}`);
            return path ? [range, { path }] : null;
        }).filter((entry): entry is [string, { path: string }] => !!entry)
    );
    const path = variants["1"]?.path;

    return path ? { path, variants } : null;
}

export function getDescriptionTokenAliasIcon(token: string): DescriptionTokenIconAlias | null {
    const normalizedToken = normalizeToken(token);

    if (normalizedToken === "attackrange") {
        return attackRangeAlias();
    }

    const luxuryMatch = normalizedToken.match(/^luxury(\d{1,2})$/);
    if (luxuryMatch) {
        return numberedResourceAlias("Luxury", luxuryMatch[1] ?? "");
    }

    const strategicMatch = normalizedToken.match(/^strategic(\d{1,2})(?:colored)?$/);
    if (strategicMatch) {
        return numberedResourceAlias("Strategic", strategicMatch[1] ?? "");
    }

    const rawKeys = TOKEN_RAW_KEY_ALIASES[normalizedToken];
    if (!rawKeys) {
        return null;
    }

    const path = rawIconFromCandidates(rawKeys);
    return path ? { path } : null;
}
