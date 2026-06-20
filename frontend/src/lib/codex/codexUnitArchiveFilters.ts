import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type UnitArchiveFilterKey = "class" | "faction" | "tier";

export type ActiveUnitArchiveFilters = {
    class: string | null;
    faction: string | null;
    tier: string | null;
};

export type UnitArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type UnitArchiveFilterGroup = {
    key: UnitArchiveFilterKey;
    label: string;
    options: UnitArchiveFilterOption[];
};

export const UNIT_CLASS_FACT_LABEL = "Class";
export const UNIT_FACTION_FACT_LABEL = "Faction";
export const UNIT_TIER_FACT_LABEL = "Tier";

export const EMPTY_UNIT_ARCHIVE_FILTERS: ActiveUnitArchiveFilters = {
    class: null,
    faction: null,
    tier: null,
};

const UNIT_CLASS_ORDER = [
    "Infantry",
    "Ranged",
    "Cavalry",
    "Cavalry Ranged",
    "Flying",
    "Flying Ranged",
    "Swarm",
    "Flying Swarm",
    "Juggernaught",
    "Juggernaught Ranged",
];

function factLabelForFilter(filterKey: UnitArchiveFilterKey): string {
    if (filterKey === "class") return UNIT_CLASS_FACT_LABEL;
    if (filterKey === "faction") return UNIT_FACTION_FACT_LABEL;
    return UNIT_TIER_FACT_LABEL;
}

function getUnitClassOrderIndex(value: string): number {
    const index = UNIT_CLASS_ORDER.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase());
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

export function formatUnitTierLabel(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";
    return /^tier\b/i.test(trimmedValue) ? trimmedValue : `Tier ${trimmedValue}`;
}

export function hasActiveUnitArchiveFilters(filters: ActiveUnitArchiveFilters): boolean {
    return Boolean(filters.class || filters.faction || filters.tier);
}

function entryMatchesUnitFilter(
    entry: CodexEntry,
    filterKey: UnitArchiveFilterKey,
    value: string | null
): boolean {
    if (!value) return true;
    return entryHasCodexFactValue(entry, factLabelForFilter(filterKey), value);
}

export function entryMatchesUnitArchiveFilters(
    entry: CodexEntry,
    filters: ActiveUnitArchiveFilters
): boolean {
    return entryMatchesUnitFilter(entry, "class", filters.class) &&
        entryMatchesUnitFilter(entry, "faction", filters.faction) &&
        entryMatchesUnitFilter(entry, "tier", filters.tier);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveUnitArchiveFilters,
    optionKey: UnitArchiveFilterKey
): readonly CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "class" && !entryMatchesUnitFilter(entry, "class", filters.class)) {
            return false;
        }

        if (optionKey !== "faction" && !entryMatchesUnitFilter(entry, "faction", filters.faction)) {
            return false;
        }

        if (optionKey !== "tier" && !entryMatchesUnitFilter(entry, "tier", filters.tier)) {
            return false;
        }

        return true;
    });
}

function buildFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveUnitArchiveFilters,
    filterKey: UnitArchiveFilterKey
): UnitArchiveFilterOption[] {
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
        .map(([value, count]) => ({
            value,
            label: filterKey === "tier" ? formatUnitTierLabel(value) : value,
            count,
        }))
        .sort((left, right) => {
            if (filterKey === "class") {
                const leftIndex = getUnitClassOrderIndex(left.value);
                const rightIndex = getUnitClassOrderIndex(right.value);
                if (leftIndex !== rightIndex) return leftIndex - rightIndex;
            }

            if (filterKey === "tier") {
                const leftNumber = Number(left.value);
                const rightNumber = Number(right.value);
                if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
                    return leftNumber - rightNumber;
                }
            }

            return left.label.localeCompare(right.label);
        });
}

export function buildUnitArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveUnitArchiveFilters
): UnitArchiveFilterGroup[] {
    return [
        {
            key: "class",
            label: "Class",
            options: buildFilterOptions(entries, filters, "class"),
        },
        {
            key: "faction",
            label: "Faction",
            options: buildFilterOptions(entries, filters, "faction"),
        },
        {
            key: "tier",
            label: "Tier",
            options: buildFilterOptions(entries, filters, "tier"),
        },
    ];
}
