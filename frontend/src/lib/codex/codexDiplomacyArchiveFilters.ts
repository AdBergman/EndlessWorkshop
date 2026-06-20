import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type DiplomacyArchiveCategory =
    | "war"
    | "defense"
    | "discovery"
    | "society"
    | "declarations"
    | "economy";

export type DiplomacyCategoryFilterOption = {
    value: DiplomacyArchiveCategory;
    label: string;
    count: number;
    categoryValues: string[];
};

export const DIPLOMACY_CATEGORY_FACT_LABEL = "Category";

const DIPLOMACY_CATEGORY_OPTIONS: Array<{
    value: DiplomacyArchiveCategory;
    label: string;
    categoryValues: string[];
}> = [
    { value: "war", label: "War", categoryValues: ["War"] },
    { value: "defense", label: "Defense", categoryValues: ["Beneficial Defense", "Hostile Defense"] },
    { value: "discovery", label: "Discovery", categoryValues: ["Beneficial Discovery"] },
    { value: "society", label: "Society", categoryValues: ["Beneficial Society"] },
    { value: "declarations", label: "Declarations", categoryValues: ["Repeatable Declaration"] },
    { value: "economy", label: "Economy", categoryValues: ["Beneficial Economy"] },
];

function normalizeDiplomacyCategoryValue(value: string): string {
    return value.trim().toLowerCase();
}

export function getDiplomacyCategoryDisplayLabel(value: string): string {
    const normalizedValue = normalizeDiplomacyCategoryValue(value);
    const matchingOption = DIPLOMACY_CATEGORY_OPTIONS.find((option) =>
        option.categoryValues.some((categoryValue) =>
            normalizeDiplomacyCategoryValue(categoryValue) === normalizedValue
        )
    );

    return matchingOption?.label ?? value.trim();
}

export function buildDiplomacyCategoryFilterOptions(
    entries: readonly CodexEntry[]
): DiplomacyCategoryFilterOption[] {
    const counts = entries.reduce<Map<string, number>>((acc, entry) => {
        const seenValues = new Set<string>();

        for (const value of getCodexFactValues(entry, DIPLOMACY_CATEGORY_FACT_LABEL)) {
            const normalizedValue = normalizeDiplomacyCategoryValue(value);
            if (!normalizedValue || seenValues.has(normalizedValue)) continue;

            seenValues.add(normalizedValue);
            acc.set(normalizedValue, (acc.get(normalizedValue) ?? 0) + 1);
        }

        return acc;
    }, new Map<string, number>());

    return DIPLOMACY_CATEGORY_OPTIONS.map((option) => ({
        ...option,
        count: option.categoryValues.reduce(
            (total, value) => total + (counts.get(normalizeDiplomacyCategoryValue(value)) ?? 0),
            0
        ),
    }));
}

export function filterDiplomacyEntriesByCategory(
    entries: readonly CodexEntry[],
    activeCategory: DiplomacyArchiveCategory | null
): CodexEntry[] {
    if (!activeCategory) return [...entries];

    const selectedOption = DIPLOMACY_CATEGORY_OPTIONS.find((option) => option.value === activeCategory);
    if (!selectedOption) return [];

    const acceptedValues = new Set(selectedOption.categoryValues.map(normalizeDiplomacyCategoryValue));

    return entries.filter((entry) =>
        getCodexFactValues(entry, DIPLOMACY_CATEGORY_FACT_LABEL)
            .some((value) => acceptedValues.has(normalizeDiplomacyCategoryValue(value)))
    );
}
