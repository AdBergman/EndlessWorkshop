import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type ActionArchiveType =
    | "Action"
    | "Faction Action"
    | "Empire Action"
    | "Constructible Action"
    | "Terraforming Action"
    | "Army Action";

export type ActionTypeFilterOption = {
    value: ActionArchiveType;
    label: string;
    count: number;
};

export const ACTION_TYPE_FACT_LABEL = "Category";

const ACTION_TYPE_ORDER: ActionArchiveType[] = [
    "Action",
    "Faction Action",
    "Empire Action",
    "Constructible Action",
    "Terraforming Action",
    "Army Action",
];

const ACTION_TYPE_DISPLAY_LABELS: Record<ActionArchiveType, string> = {
    Action: "Action",
    "Faction Action": "Faction",
    "Empire Action": "Empire",
    "Constructible Action": "Constructible",
    "Terraforming Action": "Terraforming",
    "Army Action": "Army",
};

function normalizeActionArchiveType(value: string): ActionArchiveType | null {
    const trimmedValue = value.trim();
    return ACTION_TYPE_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function buildActionTypeFilterOptions(entries: readonly CodexEntry[]): ActionTypeFilterOption[] {
    const counts = entries.reduce<Map<ActionArchiveType, number>>((acc, entry) => {
        const seenTypes = new Set<ActionArchiveType>();

        for (const value of getCodexFactValues(entry, ACTION_TYPE_FACT_LABEL)) {
            const type = normalizeActionArchiveType(value);
            if (!type || seenTypes.has(type)) continue;

            seenTypes.add(type);
            acc.set(type, (acc.get(type) ?? 0) + 1);
        }

        return acc;
    }, new Map<ActionArchiveType, number>());

    return ACTION_TYPE_ORDER.map((value) => ({
        value,
        label: ACTION_TYPE_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

export function filterActionEntriesByType(
    entries: readonly CodexEntry[],
    activeType: ActionArchiveType | null
): CodexEntry[] {
    if (!activeType) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, ACTION_TYPE_FACT_LABEL, activeType)
    );
}
