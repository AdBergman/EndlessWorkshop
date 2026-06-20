import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type DistrictArchiveCategory =
    | "City"
    | "Food"
    | "Industry"
    | "Money"
    | "Science"
    | "Influence"
    | "Military"
    | "Resource"
    | "Bridge"
    | "Population"
    | "Trade"
    | "Foundation"
    | "ArtificialWonder"
    | "Anomaly";

export type DistrictCategoryFilterOption = {
    value: DistrictArchiveCategory;
    label: string;
    count: number;
};

export const DISTRICT_CATEGORY_FACT_LABEL = "Category";

const DISTRICT_CATEGORY_ORDER: DistrictArchiveCategory[] = [
    "City",
    "Food",
    "Industry",
    "Money",
    "Science",
    "Influence",
    "Military",
    "Resource",
    "Bridge",
    "Population",
    "Trade",
    "Foundation",
    "ArtificialWonder",
    "Anomaly",
];

const DISTRICT_CATEGORY_DISPLAY_LABELS: Record<DistrictArchiveCategory, string> = {
    Anomaly: "Anomaly",
    ArtificialWonder: "Wonder",
    Bridge: "Bridge",
    City: "City",
    Food: "Food",
    Foundation: "Foundation",
    Industry: "Industry",
    Influence: "Influence",
    Military: "Military",
    Money: "Dust",
    Population: "Population",
    Resource: "Resource",
    Science: "Science",
    Trade: "Trade",
};

function normalizeDistrictArchiveCategory(value: string): DistrictArchiveCategory | null {
    const trimmedValue = value.trim();
    return DISTRICT_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function getDistrictCategoryDisplayLabel(value: string): string {
    const category = normalizeDistrictArchiveCategory(value);
    return category ? DISTRICT_CATEGORY_DISPLAY_LABELS[category] : value.trim();
}

export function buildDistrictCategoryFilterOptions(
    entries: readonly CodexEntry[]
): DistrictCategoryFilterOption[] {
    const counts = entries.reduce<Map<DistrictArchiveCategory, number>>((acc, entry) => {
        const seenCategories = new Set<DistrictArchiveCategory>();

        for (const value of getCodexFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL)) {
            const category = normalizeDistrictArchiveCategory(value);
            if (!category || seenCategories.has(category)) continue;

            seenCategories.add(category);
            acc.set(category, (acc.get(category) ?? 0) + 1);
        }

        return acc;
    }, new Map<DistrictArchiveCategory, number>());

    return DISTRICT_CATEGORY_ORDER.map((value) => ({
        value,
        label: DISTRICT_CATEGORY_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

export function filterDistrictEntriesByCategory(
    entries: readonly CodexEntry[],
    activeCategory: DistrictArchiveCategory | null
): CodexEntry[] {
    if (!activeCategory) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, DISTRICT_CATEGORY_FACT_LABEL, activeCategory)
    );
}

