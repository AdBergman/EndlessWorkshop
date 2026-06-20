import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type TechArchiveFilterKey = "era" | "quadrant" | "faction";

export type ActiveTechArchiveFilters = {
    era: string | null;
    quadrant: string | null;
    faction: string | null;
};

export type TechArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type TechArchiveFilterGroup = {
    key: TechArchiveFilterKey;
    label: string;
    options: TechArchiveFilterOption[];
};

export const TECH_ERA_FACT_LABEL = "Era";
export const TECH_QUADRANT_FACT_LABEL = "Quadrant";
export const TECH_FACTION_FACT_LABEL = "Faction";

export const EMPTY_TECH_ARCHIVE_FILTERS: ActiveTechArchiveFilters = {
    era: null,
    quadrant: null,
    faction: null,
};

const TECH_QUADRANT_ORDER = [
    "Development",
    "Discovery",
    "Society",
    "Defense",
];

function factLabelForFilter(filterKey: TechArchiveFilterKey): string {
    if (filterKey === "era") return TECH_ERA_FACT_LABEL;
    if (filterKey === "quadrant") return TECH_QUADRANT_FACT_LABEL;
    return TECH_FACTION_FACT_LABEL;
}

export function formatTechEraLabel(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return /^era\b/i.test(trimmedValue) ? trimmedValue : `Era ${trimmedValue}`;
}

function optionLabelForFilter(filterKey: TechArchiveFilterKey, value: string): string {
    return filterKey === "era" ? formatTechEraLabel(value) : value.trim();
}

function optionOrderIndex(filterKey: TechArchiveFilterKey, value: string): number {
    if (filterKey === "era") {
        const numericValue = Number(value.trim());
        return Number.isFinite(numericValue) ? numericValue : Number.MAX_SAFE_INTEGER;
    }

    if (filterKey === "quadrant") {
        const index = TECH_QUADRANT_ORDER.findIndex((candidate) =>
            candidate.toLowerCase() === value.trim().toLowerCase()
        );
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
    }

    return Number.MAX_SAFE_INTEGER;
}

export function hasActiveTechArchiveFilters(filters: ActiveTechArchiveFilters): boolean {
    return Boolean(filters.era || filters.quadrant || filters.faction);
}

function entryMatchesTechFilter(
    entry: CodexEntry,
    filterKey: TechArchiveFilterKey,
    value: string | null
): boolean {
    if (!value) return true;
    return entryHasCodexFactValue(entry, factLabelForFilter(filterKey), value);
}

export function entryMatchesTechArchiveFilters(
    entry: CodexEntry,
    filters: ActiveTechArchiveFilters
): boolean {
    return entryMatchesTechFilter(entry, "era", filters.era) &&
        entryMatchesTechFilter(entry, "quadrant", filters.quadrant) &&
        entryMatchesTechFilter(entry, "faction", filters.faction);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveTechArchiveFilters,
    optionKey: TechArchiveFilterKey
): readonly CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "era" && !entryMatchesTechFilter(entry, "era", filters.era)) {
            return false;
        }

        if (optionKey !== "quadrant" && !entryMatchesTechFilter(entry, "quadrant", filters.quadrant)) {
            return false;
        }

        if (optionKey !== "faction" && !entryMatchesTechFilter(entry, "faction", filters.faction)) {
            return false;
        }

        return true;
    });
}

function buildFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveTechArchiveFilters,
    filterKey: TechArchiveFilterKey
): TechArchiveFilterOption[] {
    const counts = entriesForOptionCounts(entries, filters, filterKey)
        .reduce<Map<string, number>>((acc, entry) => {
            const seenValues = new Set<string>();

            for (const value of getCodexFactValues(entry, factLabelForFilter(filterKey))) {
                if (seenValues.has(value)) continue;

                seenValues.add(value);
                acc.set(value, (acc.get(value) ?? 0) + 1);
            }

            return acc;
        }, new Map<string, number>());

    return Array.from(counts.entries())
        .map(([value, count]) => ({ value, label: optionLabelForFilter(filterKey, value), count }))
        .sort((left, right) => {
            const leftIndex = optionOrderIndex(filterKey, left.value);
            const rightIndex = optionOrderIndex(filterKey, right.value);
            if (leftIndex !== rightIndex) return leftIndex - rightIndex;
            if (right.count !== left.count && filterKey === "faction") return right.count - left.count;
            return left.label.localeCompare(right.label);
        });
}

export function buildTechArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveTechArchiveFilters
): TechArchiveFilterGroup[] {
    return [
        {
            key: "era",
            label: "Era",
            options: buildFilterOptions(entries, filters, "era"),
        },
        {
            key: "quadrant",
            label: "Quadrant",
            options: buildFilterOptions(entries, filters, "quadrant"),
        },
        {
            key: "faction",
            label: "Faction",
            options: buildFilterOptions(entries, filters, "faction"),
        },
    ];
}
