import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type PopulationArchiveType =
    | "Major faction population"
    | "Minor faction population"
    | "Created by action"
    | "Population";

export type PopulationTypeFilterOption = {
    value: PopulationArchiveType;
    label: string;
    count: number;
};

export const POPULATION_TYPE_FACT_LABEL = "Type";

const POPULATION_TYPE_ORDER: PopulationArchiveType[] = [
    "Major faction population",
    "Minor faction population",
    "Created by action",
    "Population",
];

const POPULATION_TYPE_DISPLAY_LABELS: Record<PopulationArchiveType, string> = {
    "Major faction population": "Major Faction",
    "Minor faction population": "Minor Faction",
    "Created by action": "Created by Action",
    Population: "Population",
};

function normalizePopulationArchiveType(value: string): PopulationArchiveType | null {
    const trimmedValue = value.trim();
    return POPULATION_TYPE_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function getPopulationTypeDisplayLabel(value: string): string {
    const type = normalizePopulationArchiveType(value);
    return type ? POPULATION_TYPE_DISPLAY_LABELS[type] : value.trim();
}

export function buildPopulationTypeFilterOptions(entries: readonly CodexEntry[]): PopulationTypeFilterOption[] {
    const counts = entries.reduce<Map<PopulationArchiveType, number>>((acc, entry) => {
        const seenTypes = new Set<PopulationArchiveType>();

        for (const value of getCodexFactValues(entry, POPULATION_TYPE_FACT_LABEL)) {
            const type = normalizePopulationArchiveType(value);
            if (!type || seenTypes.has(type)) continue;

            seenTypes.add(type);
            acc.set(type, (acc.get(type) ?? 0) + 1);
        }

        return acc;
    }, new Map<PopulationArchiveType, number>());

    return POPULATION_TYPE_ORDER.map((value) => ({
        value,
        label: POPULATION_TYPE_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

export function filterPopulationEntriesByType(
    entries: readonly CodexEntry[],
    activeType: PopulationArchiveType | null
): CodexEntry[] {
    if (!activeType) return [...entries];

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, POPULATION_TYPE_FACT_LABEL, activeType)
    );
}
