import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export const POPULATION_TYPE_FACT_LABEL = "Type";
export const POPULATION_TYPE_OTHER_VALUE = "__population_type_other__";
const POPULATION_TYPE_GROUP_THRESHOLD = 4;

export type PopulationArchiveType =
    | "Major faction population"
    | "Minor faction population"
    | "Created by action"
    | "Population";

export type PopulationArchiveFilterValue = PopulationArchiveType | typeof POPULATION_TYPE_OTHER_VALUE;

export type PopulationTypeFilterOption = {
    value: PopulationArchiveFilterValue;
    label: string;
    count: number;
    typeValues: PopulationArchiveType[];
    isGrouped?: boolean;
};

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

    const individualOptions = POPULATION_TYPE_ORDER
        .map((value) => ({ value, count: counts.get(value) ?? 0 }))
        .filter(({ count }) => count > POPULATION_TYPE_GROUP_THRESHOLD)
        .map(({ value, count }) => ({
            value,
            label: POPULATION_TYPE_DISPLAY_LABELS[value],
            count,
            typeValues: [value],
        }));

    const groupedValues = POPULATION_TYPE_ORDER
        .map((value) => ({ value, count: counts.get(value) ?? 0 }))
        .filter(({ count }) => count > 0 && count <= POPULATION_TYPE_GROUP_THRESHOLD);

    if (groupedValues.length === 0) return individualOptions;

    return [
        ...individualOptions,
        {
            value: POPULATION_TYPE_OTHER_VALUE,
            label: "Other",
            count: groupedValues.reduce((total, { count }) => total + count, 0),
            typeValues: groupedValues.map(({ value }) => value),
            isGrouped: true,
        },
    ];
}

export function filterPopulationEntriesByType(
    entries: readonly CodexEntry[],
    activeType: PopulationArchiveFilterValue | null
): CodexEntry[] {
    if (!activeType) return [...entries];

    if (activeType === POPULATION_TYPE_OTHER_VALUE) {
        const groupedTypeValues = new Set(
            buildPopulationTypeFilterOptions(entries)
                .find((option) => option.value === POPULATION_TYPE_OTHER_VALUE)
                ?.typeValues ?? []
        );

        if (groupedTypeValues.size === 0) return [];

        return entries.filter((entry) =>
            getCodexFactValues(entry, POPULATION_TYPE_FACT_LABEL)
                .some((value) => {
                    const type = normalizePopulationArchiveType(value);
                    return type ? groupedTypeValues.has(type) : false;
                })
        );
    }

    return entries.filter((entry) =>
        entryHasCodexFactValue(entry, POPULATION_TYPE_FACT_LABEL, activeType)
    );
}
