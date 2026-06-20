import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type EquipmentArchiveFilterKey = "type" | "rarity";

export type ActiveEquipmentArchiveFilters = {
    type: string | null;
    rarity: string | null;
};

export type EquipmentArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type EquipmentArchiveFilterGroup = {
    key: EquipmentArchiveFilterKey;
    label: string;
    options: EquipmentArchiveFilterOption[];
};

export const EQUIPMENT_TYPE_FACT_LABEL = "Type";
export const EQUIPMENT_RARITY_FACT_LABEL = "Rarity";

export const EMPTY_EQUIPMENT_ARCHIVE_FILTERS: ActiveEquipmentArchiveFilters = {
    type: null,
    rarity: null,
};

const EQUIPMENT_TYPE_ORDER = [
    "One-Handed Weapon",
    "Two-Handed Weapon",
    "Bow",
    "Exotic",
    "Armor",
    "Accessory",
    "Consumable",
];

const EQUIPMENT_RARITY_ORDER = [
    "Legendary",
    "Rare",
    "Uncommon",
    "Common",
];

function optionOrderIndex(order: readonly string[], value: string): number {
    const index = order.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase());
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function factLabelForFilter(filterKey: EquipmentArchiveFilterKey): string {
    return filterKey === "type" ? EQUIPMENT_TYPE_FACT_LABEL : EQUIPMENT_RARITY_FACT_LABEL;
}

function optionOrderForFilter(filterKey: EquipmentArchiveFilterKey): readonly string[] {
    return filterKey === "type" ? EQUIPMENT_TYPE_ORDER : EQUIPMENT_RARITY_ORDER;
}

export function hasActiveEquipmentArchiveFilters(filters: ActiveEquipmentArchiveFilters): boolean {
    return Boolean(filters.type || filters.rarity);
}

function entryMatchesEquipmentFilter(
    entry: CodexEntry,
    filterKey: EquipmentArchiveFilterKey,
    value: string | null
): boolean {
    if (!value) return true;
    return entryHasCodexFactValue(entry, factLabelForFilter(filterKey), value);
}

export function entryMatchesEquipmentArchiveFilters(
    entry: CodexEntry,
    filters: ActiveEquipmentArchiveFilters
): boolean {
    return entryMatchesEquipmentFilter(entry, "type", filters.type) &&
        entryMatchesEquipmentFilter(entry, "rarity", filters.rarity);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveEquipmentArchiveFilters,
    optionKey: EquipmentArchiveFilterKey
): readonly CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "type" && !entryMatchesEquipmentFilter(entry, "type", filters.type)) {
            return false;
        }

        if (optionKey !== "rarity" && !entryMatchesEquipmentFilter(entry, "rarity", filters.rarity)) {
            return false;
        }

        return true;
    });
}

function buildFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveEquipmentArchiveFilters,
    filterKey: EquipmentArchiveFilterKey
): EquipmentArchiveFilterOption[] {
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

    const order = optionOrderForFilter(filterKey);

    return Array.from(counts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((left, right) => {
            const leftIndex = optionOrderIndex(order, left.value);
            const rightIndex = optionOrderIndex(order, right.value);
            if (leftIndex !== rightIndex) return leftIndex - rightIndex;
            return left.label.localeCompare(right.label);
        });
}

export function buildEquipmentArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveEquipmentArchiveFilters
): EquipmentArchiveFilterGroup[] {
    return [
        {
            key: "type",
            label: "Type",
            options: buildFilterOptions(entries, filters, "type"),
        },
        {
            key: "rarity",
            label: "Rarity",
            options: buildFilterOptions(entries, filters, "rarity"),
        },
    ];
}
