import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type ImprovementArchiveCategory =
    | "City"
    | "Food"
    | "Industry"
    | "Money"
    | "Science"
    | "Influence"
    | "PublicOrder"
    | "Military"
    | "Resource"
    | "Bridge"
    | "Population"
    | "Trade";

export type ImprovementCategoryFilterOption = {
    value: ImprovementArchiveCategory;
    label: string;
    count: number;
};

export const IMPROVEMENT_CATEGORY_FACT_LABEL = "Category";

const IMPROVEMENT_CATEGORY_ORDER: ImprovementArchiveCategory[] = [
    "City",
    "Food",
    "Industry",
    "Money",
    "Science",
    "Influence",
    "PublicOrder",
    "Military",
    "Resource",
    "Bridge",
    "Population",
    "Trade",
];

const IMPROVEMENT_CATEGORY_DISPLAY_LABELS: Record<ImprovementArchiveCategory, string> = {
    Bridge: "Bridge",
    City: "City",
    Food: "Food",
    Industry: "Industry",
    Influence: "Influence",
    Military: "Military",
    Money: "Dust",
    Population: "Population",
    PublicOrder: "Approval",
    Resource: "Resource",
    Science: "Science",
    Trade: "Trade",
};

function normalizeImprovementArchiveCategory(value: string): ImprovementArchiveCategory | null {
    const trimmedValue = value.trim();
    return IMPROVEMENT_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function getImprovementCategoryDisplayLabel(value: string): string {
    const category = normalizeImprovementArchiveCategory(value);
    return category ? IMPROVEMENT_CATEGORY_DISPLAY_LABELS[category] : value.trim();
}

export function buildImprovementCategoryFilterOptions(
    entries: readonly CodexEntry[]
): ImprovementCategoryFilterOption[] {
    const counts = entries.reduce<Map<ImprovementArchiveCategory, number>>((acc, entry) => {
        const seenCategories = new Set<ImprovementArchiveCategory>();

        for (const value of getCodexFactValues(entry, IMPROVEMENT_CATEGORY_FACT_LABEL)) {
            const category = normalizeImprovementArchiveCategory(value);
            if (!category || seenCategories.has(category)) continue;

            seenCategories.add(category);
            acc.set(category, (acc.get(category) ?? 0) + 1);
        }

        return acc;
    }, new Map<ImprovementArchiveCategory, number>());

    return IMPROVEMENT_CATEGORY_ORDER.map((value) => ({
        value,
        label: IMPROVEMENT_CATEGORY_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

export function filterImprovementEntriesByCategory(
    entries: readonly CodexEntry[],
    activeCategory: ImprovementArchiveCategory | null
): CodexEntry[] {
    if (!activeCategory) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, IMPROVEMENT_CATEGORY_FACT_LABEL, activeCategory)
    );
}

