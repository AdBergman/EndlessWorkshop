import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexFactFilterConfig = {
    label: string;
    displayLabel: string;
    allowedValues?: readonly string[];
    splitCommaSeparatedValues?: boolean;
    showZeroCountOptions?: boolean;
};

export type CodexFactFilterOption = CodexFactFilterConfig & {
    values: { value: string; count: number }[];
};

export type ActiveCodexFactFilters = Record<string, string>;

export type ActiveCodexFactFilterItem = {
    label: string;
    displayLabel: string;
    value: string;
};

export type AbilityArchiveSummary = {
    title: string;
    lead: string;
    context: string;
};

const ABILITY_ARCHIVE_FILTERS: readonly CodexFactFilterConfig[] = [
    {
        label: "Combat role",
        displayLabel: "Ability Role",
        allowedValues: [
            "Damage",
            "Status apply",
            "Shield",
            "Heal",
            "Movement",
            "Teleport",
            "Summon",
            "Push",
            "Status remove",
            "Reactive skill",
        ],
        splitCommaSeparatedValues: true,
        showZeroCountOptions: false,
    },
    {
        label: "Ability mechanic",
        displayLabel: "Mechanics",
        allowedValues: ["Active", "Passive", "Reaction", "Mixed"],
    },
    {
        label: "Ability source",
        displayLabel: "Sources",
        allowedValues: ["Battle skill", "Battle ability", "Unit ability event", "Mixed", "Battle reward"],
    },
];

function normalizeCodexKind(kind: string): string {
    return kind.trim().toLowerCase();
}

export function getAbilityArchiveFactFilterConfig(kind: string): readonly CodexFactFilterConfig[] {
    return normalizeCodexKind(kind) === "abilities" ? ABILITY_ARCHIVE_FILTERS : [];
}

export function getEntryFactFilterValues(entry: CodexEntry, filter: CodexFactFilterConfig): string[] {
    return getCodexFactValues(entry, filter.label).flatMap((value) => (
        filter.splitCommaSeparatedValues
            ? value.split(",").map((part) => part.trim()).filter(Boolean)
            : [value]
    ));
}

function uniqueEntryFactValues(entry: CodexEntry, filter: CodexFactFilterConfig): string[] {
    const seen = new Set<string>();
    const values: string[] = [];

    for (const value of getEntryFactFilterValues(entry, filter)) {
        if (seen.has(value)) continue;

        seen.add(value);
        values.push(value);
    }

    return values;
}

export function buildAbilityArchiveFilterOptions(
    entries: readonly CodexEntry[],
    filters: readonly CodexFactFilterConfig[],
    activeFilters: ActiveCodexFactFilters
): CodexFactFilterOption[] {
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return filters
        .map((filter) => {
            const counts = entries.reduce<Map<string, number>>((acc, entry) => {
                const filtersExceptCurrent = Object.fromEntries(
                    Object.entries(activeFilters).filter(([label]) => label !== filter.label)
                );
                if (!entryMatchesAbilityArchiveFilters(entry, filtersExceptCurrent, filters)) {
                    return acc;
                }

                for (const value of uniqueEntryFactValues(entry, filter)) {
                    acc.set(value, (acc.get(value) ?? 0) + 1);
                }

                return acc;
            }, new Map<string, number>());

            const values = filter.allowedValues
                ? filter.allowedValues
                    .map((value) => ({ value, count: counts.get(value) ?? 0 }))
                    .filter((option) =>
                        option.count > 0 ||
                        activeFilters[filter.label] === option.value ||
                        (hasActiveFilters && filter.showZeroCountOptions !== false)
                    )
                : Array.from(counts.entries())
                    .map(([value, count]) => ({ value, count }))
                    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));

            return { ...filter, values };
        });
}

export function entryMatchesAbilityArchiveFilters(
    entry: CodexEntry,
    activeFilters: ActiveCodexFactFilters,
    filterConfigs: readonly CodexFactFilterConfig[]
): boolean {
    return Object.entries(activeFilters).every(([label, value]) => {
        const filterConfig = filterConfigs.find((filter) => filter.label === label);
        if (!filterConfig) {
            return entryHasCodexFactValue(entry, label, value);
        }

        return getEntryFactFilterValues(entry, filterConfig).some((factValue) => factValue === value);
    });
}

export function getActiveAbilityArchiveFilterItems(
    activeFilters: ActiveCodexFactFilters,
    filters: readonly CodexFactFilterConfig[]
): ActiveCodexFactFilterItem[] {
    return filters.flatMap((filter) => {
        const value = activeFilters[filter.label];
        return value ? [{ label: filter.label, displayLabel: filter.displayLabel, value }] : [];
    });
}

function formatAbilityShelfValue(value: string): string {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function getAbilityArchiveSummary(
    activeFilters: readonly ActiveCodexFactFilterItem[],
    count: number
): AbilityArchiveSummary | null {
    if (activeFilters.length === 0) {
        return {
            title: "Ability Archive",
            lead: "Browse combat and empire abilities by role, mechanic, and source.",
            context: "Archive index",
        };
    }

    if (activeFilters.length === 1) {
        const shelfName = formatAbilityShelfValue(activeFilters[0].value);
        const abilityLabel = count === 1 ? "ability" : "abilities";

        return {
            title: `${shelfName} Abilities`,
            lead: `A curated shelf containing ${count} ${abilityLabel}.`,
            context: "Archive shelf",
        };
    }

    const abilityLabel = count === 1 ? "ability" : "abilities";
    const shelfLabel = activeFilters.length === 1 ? "shelf" : "shelves";

    return {
        title: "Filtered Abilities",
        lead: `${count} ${abilityLabel} matching ${activeFilters.length} selected ${shelfLabel}.`,
        context: "Archive shelf",
    };
}
