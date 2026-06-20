import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type HeroArchiveFilterKey = "class" | "faction";

export type ActiveHeroArchiveFilters = {
    class: string | null;
    faction: string | null;
};

export type HeroArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type HeroArchiveFilterGroup = {
    key: HeroArchiveFilterKey;
    label: string;
    options: HeroArchiveFilterOption[];
};

export const HERO_CLASS_FACT_LABEL = "Class";
export const HERO_FACTION_FACT_LABEL = "Faction";

export const EMPTY_HERO_ARCHIVE_FILTERS: ActiveHeroArchiveFilters = {
    class: null,
    faction: null,
};

const HERO_CLASS_ORDER = [
    "Infantry Hero",
    "Ranged Hero",
    "Juggernaught Hero",
    "Cavalry Hero",
    "Flying Hero",
    "Cavalry Ranged Hero",
    "Flying Ranged Hero",
    "Flying Swarm Hero",
    "Juggernaught Ranged Hero",
    "Flying Swarm",
];

function factLabelForFilter(filterKey: HeroArchiveFilterKey): string {
    return filterKey === "class" ? HERO_CLASS_FACT_LABEL : HERO_FACTION_FACT_LABEL;
}

function optionOrderIndex(value: string): number {
    const index = HERO_CLASS_ORDER.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase());
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

export function hasActiveHeroArchiveFilters(filters: ActiveHeroArchiveFilters): boolean {
    return Boolean(filters.class || filters.faction);
}

function entryMatchesHeroFilter(
    entry: CodexEntry,
    filterKey: HeroArchiveFilterKey,
    value: string | null
): boolean {
    if (!value) return true;
    return entryHasCodexFactValue(entry, factLabelForFilter(filterKey), value);
}

export function entryMatchesHeroArchiveFilters(
    entry: CodexEntry,
    filters: ActiveHeroArchiveFilters
): boolean {
    return entryMatchesHeroFilter(entry, "class", filters.class) &&
        entryMatchesHeroFilter(entry, "faction", filters.faction);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveHeroArchiveFilters,
    optionKey: HeroArchiveFilterKey
): readonly CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "class" && !entryMatchesHeroFilter(entry, "class", filters.class)) {
            return false;
        }

        if (optionKey !== "faction" && !entryMatchesHeroFilter(entry, "faction", filters.faction)) {
            return false;
        }

        return true;
    });
}

function buildFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveHeroArchiveFilters,
    filterKey: HeroArchiveFilterKey
): HeroArchiveFilterOption[] {
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
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((left, right) => {
            if (filterKey === "class") {
                const leftIndex = optionOrderIndex(left.value);
                const rightIndex = optionOrderIndex(right.value);
                if (leftIndex !== rightIndex) return leftIndex - rightIndex;
            }

            return left.label.localeCompare(right.label);
        });
}

export function buildHeroArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveHeroArchiveFilters
): HeroArchiveFilterGroup[] {
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
    ];
}
