import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry } from "@/types/dataTypes";

export type DistrictArchiveFilterKey = "tier" | "focus";

export type DistrictArchiveCategory =
    | "City"
    | "Food"
    | "Industry"
    | "Money"
    | "Science"
    | "Influence"
    | "Military"
    | "Resource"
    | "Bridge"
    | "Population"
    | "Trade"
    | "Foundation"
    | "ArtificialWonder"
    | "Anomaly";

export type DistrictCategoryFilterOption = {
    value: DistrictArchiveCategory;
    label: string;
    count: number;
};

export type DistrictArchiveFilterOption = {
    value: string;
    label: string;
    count: number;
};

export type DistrictArchiveFilterGroup = {
    key: DistrictArchiveFilterKey;
    label: string;
    options: DistrictArchiveFilterOption[];
};

export type ActiveDistrictArchiveFilters = {
    tier: string;
    focus: DistrictArchiveCategory | null;
};

export const DISTRICT_CATEGORY_FACT_LABEL = "Category";
export const DISTRICT_TIER_FACT_LABEL = "Tier";
export const DEFAULT_DISTRICT_ARCHIVE_TIER = "1";
export const DEFAULT_DISTRICT_ARCHIVE_FILTERS: ActiveDistrictArchiveFilters = {
    tier: DEFAULT_DISTRICT_ARCHIVE_TIER,
    focus: null,
};

const DISTRICT_CATEGORY_ORDER: DistrictArchiveCategory[] = [
    "City",
    "Food",
    "Industry",
    "Money",
    "Science",
    "Influence",
    "Military",
    "Resource",
    "Bridge",
    "Population",
    "Trade",
    "Foundation",
    "ArtificialWonder",
    "Anomaly",
];

const DISTRICT_CATEGORY_DISPLAY_LABELS: Record<DistrictArchiveCategory, string> = {
    Anomaly: "Anomaly",
    ArtificialWonder: "Wonder",
    Bridge: "Bridge",
    City: "City",
    Food: "Food",
    Foundation: "Foundation",
    Industry: "Industry",
    Influence: "Influence",
    Military: "Military",
    Money: "Dust",
    Population: "Population",
    Resource: "Resource",
    Science: "Science",
    Trade: "Trade",
};

const DISTRICT_TIER_ORDER = ["1", "2", "3"];

function normalizeDistrictArchiveCategory(value: string): DistrictArchiveCategory | null {
    const trimmedValue = value.trim();
    return DISTRICT_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

function normalizeDistrictTier(value: string): string | null {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    return DISTRICT_TIER_ORDER.includes(trimmedValue) ? trimmedValue : null;
}

function parseDistrictTierValue(value: string): string | null {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    return /^\d+$/.test(trimmedValue) ? trimmedValue : null;
}

export function getDistrictCategoryDisplayLabel(value: string): string {
    const category = normalizeDistrictArchiveCategory(value);
    return category ? DISTRICT_CATEGORY_DISPLAY_LABELS[category] : value.trim();
}

export function formatDistrictTierFilterLabel(value: string): string {
    const tier = normalizeDistrictTier(value);
    return tier ? `Tier ${tier}` : value.trim();
}

export function buildDistrictCategoryFilterOptions(
    entries: readonly CodexEntry[]
): DistrictCategoryFilterOption[] {
    const counts = entries.reduce<Map<DistrictArchiveCategory, number>>((acc, entry) => {
        const seenCategories = new Set<DistrictArchiveCategory>();

        for (const value of getCodexFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL)) {
            const category = normalizeDistrictArchiveCategory(value);
            if (!category || seenCategories.has(category)) continue;

            seenCategories.add(category);
            acc.set(category, (acc.get(category) ?? 0) + 1);
        }

        return acc;
    }, new Map<DistrictArchiveCategory, number>());

    return DISTRICT_CATEGORY_ORDER.map((value) => ({
        value,
        label: DISTRICT_CATEGORY_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

function optionMatchesFilter(
    entry: CodexEntry,
    filterKey: DistrictArchiveFilterKey,
    value: string | null
): boolean {
    if (!value) return true;

    if (filterKey === "tier") {
        return getDistrictEntryTierValues(entry).includes(value);
    }

    return entryHasCodexFactValue(entry, DISTRICT_CATEGORY_FACT_LABEL, value);
}

export function entryMatchesDistrictArchiveFilters(
    entry: CodexEntry,
    filters: ActiveDistrictArchiveFilters
): boolean {
    return optionMatchesFilter(entry, "tier", filters.tier) &&
        optionMatchesFilter(entry, "focus", filters.focus);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    optionKey: DistrictArchiveFilterKey
): CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "tier" && !optionMatchesFilter(entry, "tier", filters.tier)) {
            return false;
        }

        if (optionKey !== "focus" && !optionMatchesFilter(entry, "focus", filters.focus)) {
            return false;
        }

        return true;
    });
}

function buildTierFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "tier")
    );
    const counts = countEntries.reduce<Map<string, number>>((acc, entry) => {
        const seenValues = new Set<string>();

        for (const tier of getDistrictEntryTierValues(entry)) {
            if (seenValues.has(tier)) continue;

            seenValues.add(tier);
            acc.set(tier, (acc.get(tier) ?? 0) + 1);
        }

        return acc;
    }, new Map<string, number>());

    return DISTRICT_TIER_ORDER.map((value) => ({
        value,
        label: formatDistrictTierFilterLabel(value),
        count: counts.get(value) ?? 0,
    }));
}

function buildFocusFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "focus")
    );
    const counts = countEntries.reduce<Map<DistrictArchiveCategory, number>>((acc, entry) => {
        const seenCategories = new Set<DistrictArchiveCategory>();

        for (const value of getCodexFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL)) {
            const category = normalizeDistrictArchiveCategory(value);
            if (!category || seenCategories.has(category)) continue;

            seenCategories.add(category);
            acc.set(category, (acc.get(category) ?? 0) + 1);
        }

        return acc;
    }, new Map<DistrictArchiveCategory, number>());

    return DISTRICT_CATEGORY_ORDER.map((value) => ({
        value,
        label: DISTRICT_CATEGORY_DISPLAY_LABELS[value],
        count: counts.get(value) ?? 0,
    }));
}

export function buildDistrictArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters
): DistrictArchiveFilterGroup[] {
    return [
        {
            key: "tier",
            label: "Tier",
            options: buildTierFilterOptions(entries, filters),
        },
        {
            key: "focus",
            label: "Focus",
            options: buildFocusFilterOptions(entries, filters),
        },
    ];
}

export function filterDistrictEntriesByArchiveFilters(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    preferredEntryKey?: string | null
): CodexEntry[] {
    return collapseDuplicateDistrictArchiveEntries(
        entries.filter((entry) => entryMatchesDistrictArchiveFilters(entry, filters)),
        preferredEntryKey
    );
}

function getDistrictEntryTierValues(entry: CodexEntry): string[] {
    const factTiers = getCodexFactValues(entry, DISTRICT_TIER_FACT_LABEL)
        .map(parseDistrictTierValue)
        .filter((tier): tier is string => Boolean(tier));

    if (factTiers.length > 0) {
        return Array.from(new Set(factTiers));
    }

    const keyTier = entry.entryKey.match(/(?:^|[_-])Tier(\d+)(?:[_-]|$)/i)?.[1] ?? null;
    if (keyTier) {
        return [keyTier];
    }

    return [DEFAULT_DISTRICT_ARCHIVE_TIER];
}

function getComparableFactValues(entry: CodexEntry, label: string): string {
    return getCodexFactValues(entry, label)
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join("|");
}

function getEffectSignature(entry: CodexEntry): string {
    return (entry.sections ?? [])
        .filter((section) => section.title.trim().toLowerCase() === "effects")
        .flatMap((section) => section.lines ?? [])
        .map((line) => line.trim().replace(/\s+/g, " ").toLowerCase())
        .filter(Boolean)
        .join("|");
}

function getDistrictArchiveDisplaySignature(entry: CodexEntry): string {
    return [
        entry.displayName.trim().toLowerCase(),
        getComparableFactValues(entry, DISTRICT_TIER_FACT_LABEL),
        getComparableFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL),
        getEffectSignature(entry),
    ].join("::");
}

export function collapseDuplicateDistrictArchiveEntries(
    entries: readonly CodexEntry[],
    preferredEntryKey?: string | null
): CodexEntry[] {
    const preferredKey = preferredEntryKey?.trim() ?? "";
    const groups = new Map<string, CodexEntry>();

    for (const entry of entries) {
        const signature = getDistrictArchiveDisplaySignature(entry);
        const current = groups.get(signature);

        if (!current || (preferredKey && entry.entryKey === preferredKey)) {
            groups.set(signature, entry);
        }
    }

    return Array.from(groups.values());
}
