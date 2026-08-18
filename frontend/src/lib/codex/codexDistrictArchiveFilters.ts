import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import type { CodexEntry, District } from "@/types/dataTypes";

export type DistrictArchiveFilterKey = "type" | "focus" | "placement" | "faction" | "tier";

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
    type: DistrictArchiveType | null;
    tier: string;
    focus: DistrictArchiveCategory | null;
    placement: DistrictArchivePlacement | null;
    faction: string | null;
};

export type DistrictArchiveType =
    | "coreYield"
    | "cityBase"
    | "infrastructure"
    | "resourceExtractor"
    | "wonderAnomaly"
    | "unclassified";

export type DistrictArchivePlacement =
    | "normalExpansion"
    | "freePlacement"
    | "river"
    | "resourceDeposit"
    | "pointOfInterest"
    | "terrainRestricted";

export const DISTRICT_CATEGORY_FACT_LABEL = "Category";
export const DISTRICT_TIER_FACT_LABEL = "Tier";
export const DEFAULT_DISTRICT_ARCHIVE_FILTERS: ActiveDistrictArchiveFilters = {
    type: null,
    tier: "",
    focus: null,
    placement: null,
    faction: null,
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

const DISTRICT_TYPE_ORDER: Array<{ value: DistrictArchiveType; label: string }> = [
    { value: "coreYield", label: "Core yield" },
    { value: "cityBase", label: "City base" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "resourceExtractor", label: "Resource extractor" },
    { value: "wonderAnomaly", label: "Wonder / anomaly" },
    { value: "unclassified", label: "Unclassified" },
];

const DISTRICT_PLACEMENT_FILTERS: Array<{ value: DistrictArchivePlacement; label: string }> = [
    { value: "normalExpansion", label: "Normal expansion" },
    { value: "freePlacement", label: "No adjacency" },
    { value: "river", label: "River" },
    { value: "resourceDeposit", label: "Resource deposit" },
    { value: "pointOfInterest", label: "Point of interest" },
    { value: "terrainRestricted", label: "Terrain restricted" },
];

function normalizeDistrictArchiveCategory(value: string): DistrictArchiveCategory | null {
    const trimmedValue = value.trim();
    return DISTRICT_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

function getDistrictTypeForCategory(value: string): DistrictArchiveType {
    const category = normalizeDistrictArchiveCategory(value);
    if (!category) return "unclassified";

    if (["Food", "Industry", "Money", "Science", "Influence", "Population"].includes(category)) {
        return "coreYield";
    }

    if (category === "City" || category === "Foundation") {
        return "cityBase";
    }

    if (["Military", "Bridge", "Trade"].includes(category)) {
        return "infrastructure";
    }

    if (category === "Resource") {
        return "resourceExtractor";
    }

    if (category === "ArtificialWonder" || category === "Anomaly") {
        return "wonderAnomaly";
    }

    return "unclassified";
}

function normalizeDistrictTier(value: string): string | null {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    return DISTRICT_TIER_ORDER.includes(trimmedValue) ? trimmedValue : null;
}

function parseDistrictTierValue(value: string): string | null {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    return /^\d+$/.test(trimmedValue) ? trimmedValue : null;
}

function compareDistrictTierValues(a: string, b: string): number {
    const orderA = DISTRICT_TIER_ORDER.indexOf(a);
    const orderB = DISTRICT_TIER_ORDER.indexOf(b);
    if (orderA >= 0 && orderB >= 0) return orderA - orderB;
    if (orderA >= 0) return -1;
    if (orderB >= 0) return 1;

    const numericA = Number(a);
    const numericB = Number(b);
    if (Number.isFinite(numericA) && Number.isFinite(numericB)) return numericA - numericB;

    return a.localeCompare(b);
}

export function getDistrictCategoryDisplayLabel(value: string): string {
    const category = normalizeDistrictArchiveCategory(value);
    return category ? DISTRICT_CATEGORY_DISPLAY_LABELS[category] : value.trim();
}

export function formatDistrictTierFilterLabel(value: string): string {
    const tier = parseDistrictTierValue(value);
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
    value: string | null,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): boolean {
    if (!value) return true;

    if (filterKey === "type") {
        return getDistrictEntryTypeFilters(entry).includes(value as DistrictArchiveType);
    }

    if (filterKey === "tier") {
        return getDistrictEntryTierValues(entry).includes(value);
    }

    if (filterKey === "focus") {
        return entryHasCodexFactValue(entry, DISTRICT_CATEGORY_FACT_LABEL, value);
    }

    if (filterKey === "placement") {
        return getDistrictEntryPlacementFilters(entry, richDistrictByKey).includes(value as DistrictArchivePlacement);
    }

    return getDistrictEntryFactionFilters(entry, richDistrictByKey).includes(value);
}

export function entryMatchesDistrictArchiveFilters(
    entry: CodexEntry,
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): boolean {
    return optionMatchesFilter(entry, "type", filters.type, richDistrictByKey) &&
        optionMatchesFilter(entry, "tier", filters.tier, richDistrictByKey) &&
        optionMatchesFilter(entry, "focus", filters.focus, richDistrictByKey) &&
        optionMatchesFilter(entry, "placement", filters.placement, richDistrictByKey) &&
        optionMatchesFilter(entry, "faction", filters.faction, richDistrictByKey);
}

function entriesForOptionCounts(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    optionKey: DistrictArchiveFilterKey,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): CodexEntry[] {
    return entries.filter((entry) => {
        if (optionKey !== "type" && !optionMatchesFilter(entry, "type", filters.type, richDistrictByKey)) {
            return false;
        }

        if (optionKey !== "tier" && !optionMatchesFilter(entry, "tier", filters.tier, richDistrictByKey)) {
            return false;
        }

        if (optionKey !== "focus" && !optionMatchesFilter(entry, "focus", filters.focus, richDistrictByKey)) {
            return false;
        }

        if (
            optionKey !== "placement" &&
            !optionMatchesFilter(entry, "placement", filters.placement, richDistrictByKey)
        ) {
            return false;
        }

        if (optionKey !== "faction" && !optionMatchesFilter(entry, "faction", filters.faction, richDistrictByKey)) {
            return false;
        }

        return true;
    });
}

function buildTypeFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "type", richDistrictByKey)
    );
    const counts = countEntries.reduce<Map<DistrictArchiveType, number>>((acc, entry) => {
        const seenTypes = new Set<DistrictArchiveType>();

        for (const type of getDistrictEntryTypeFilters(entry)) {
            if (seenTypes.has(type)) continue;

            seenTypes.add(type);
            acc.set(type, (acc.get(type) ?? 0) + 1);
        }

        return acc;
    }, new Map<DistrictArchiveType, number>());

    return DISTRICT_TYPE_ORDER
        .map((option) => ({
            ...option,
            count: counts.get(option.value) ?? 0,
        }))
        .filter((option) => option.count > 0);
}

function buildTierFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "tier", richDistrictByKey)
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

    const orderedValues = Array.from(counts.keys()).sort(compareDistrictTierValues);

    return orderedValues
        .map((value) => ({
            value,
            label: formatDistrictTierFilterLabel(value),
            count: counts.get(value) ?? 0,
        }))
        .filter((option) => option.count > 0);
}

function buildFocusFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "focus", richDistrictByKey)
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

    return DISTRICT_CATEGORY_ORDER
        .map((value) => ({
            value,
            label: DISTRICT_CATEGORY_DISPLAY_LABELS[value],
            count: counts.get(value) ?? 0,
        }))
        .filter((option) => option.count > 0);
}

function buildPlacementFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "placement", richDistrictByKey)
    );
    const counts = countEntries.reduce<Map<DistrictArchivePlacement, number>>((acc, entry) => {
        const seenPlacements = new Set<DistrictArchivePlacement>();

        for (const placement of getDistrictEntryPlacementFilters(entry, richDistrictByKey)) {
            if (seenPlacements.has(placement)) continue;

            seenPlacements.add(placement);
            acc.set(placement, (acc.get(placement) ?? 0) + 1);
        }

        return acc;
    }, new Map<DistrictArchivePlacement, number>());

    return DISTRICT_PLACEMENT_FILTERS
        .map((option) => ({
            ...option,
            count: counts.get(option.value) ?? 0,
        }))
        .filter((option) => option.count > 0);
}

function buildFactionFilterOptions(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterOption[] {
    const countEntries = collapseDuplicateDistrictArchiveEntries(
        entriesForOptionCounts(entries, filters, "faction", richDistrictByKey)
    );
    const counts = countEntries.reduce<Map<string, number>>((acc, entry) => {
        const seenFactions = new Set<string>();

        for (const faction of getDistrictEntryFactionFilters(entry, richDistrictByKey)) {
            if (seenFactions.has(faction)) continue;

            seenFactions.add(faction);
            acc.set(faction, (acc.get(faction) ?? 0) + 1);
        }

        return acc;
    }, new Map<string, number>());

    return Array.from(counts.entries())
        .sort((a, b) => {
            if (a[0] === "universal") return -1;
            if (b[0] === "universal") return 1;
            if (a[0] === "specific") return 1;
            if (b[0] === "specific") return -1;
            return formatDistrictFactionLabel(a[0]).localeCompare(formatDistrictFactionLabel(b[0]));
        })
        .map(([value, count]) => ({
            value,
            label: formatDistrictFactionLabel(value),
            count,
        }))
        .filter((option) => option.count > 0);
}

export function buildDistrictArchiveFilterGroups(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFilterGroup[] {
    return [
        {
            key: "type",
            label: "Type",
            options: buildTypeFilterOptions(entries, filters, richDistrictByKey),
        },
        {
            key: "focus",
            label: "Yield / role",
            options: buildFocusFilterOptions(entries, filters, richDistrictByKey),
        },
        {
            key: "placement",
            label: "Placement",
            options: buildPlacementFilterOptions(entries, filters, richDistrictByKey),
        },
        {
            key: "faction",
            label: "Faction",
            options: buildFactionFilterOptions(entries, filters, richDistrictByKey),
        },
        {
            key: "tier",
            label: "Progression",
            options: buildTierFilterOptions(entries, filters, richDistrictByKey),
        },
    ];
}

export function filterDistrictEntriesByArchiveFilters(
    entries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    preferredEntryKey?: string | null,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): CodexEntry[] {
    return collapseDuplicateDistrictArchiveEntries(
        entries.filter((entry) => entryMatchesDistrictArchiveFilters(entry, filters, richDistrictByKey)),
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

    return [];
}

export function getDistrictEntryTypeLabels(entry: CodexEntry): string[] {
    return getDistrictEntryTypeFilters(entry).map(formatDistrictTypeLabel);
}

function getDistrictEntryTypeFilters(entry: CodexEntry): DistrictArchiveType[] {
    const categoryValues = getCodexFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL);
    if (categoryValues.length === 0) return ["unclassified"];

    return Array.from(new Set(categoryValues.map(getDistrictTypeForCategory)));
}

function formatDistrictTypeLabel(value: DistrictArchiveType): string {
    return DISTRICT_TYPE_ORDER.find((option) => option.value === value)?.label ?? value;
}

export function getDistrictEntryFactionLabels(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string[] {
    return getDistrictEntryFactionFilters(entry, richDistrictByKey).map(formatDistrictFactionLabel);
}

function getDistrictEntryFactionFilters(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string[] {
    const richDistrict = richDistrictByKey[entry.entryKey.trim()];
    if (!richDistrict) return [];

    const factionKey = normalizeFactionFilterKey(richDistrict.factionKey);
    if (factionKey) return [factionKey];

    if (richDistrict.isFactionSpecific === true) return ["specific"];
    if (richDistrict.isFactionSpecific === false) return ["universal"];

    return [];
}

function formatDistrictFactionLabel(value: string): string {
    const normalizedValue = value.trim();
    const lowerValue = normalizedValue.toLowerCase();
    if (lowerValue === "universal") return "Universal";
    if (lowerValue === "specific") return "Faction-specific";

    return normalizedValue
        .replace(/^Faction_/, "")
        .replace(/\bKinOfSheredyn\b/gi, "Kin of Sheredyn")
        .replace(/\bLastLord\b/gi, "Last Lords")
        .replace(/\bMukag\b/gi, "Tahuk")
        .replace(/\bNecrophage\b/gi, "Necrophages")
        .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
        .replace(/_/g, " ")
        .trim()
        .replace(/\s+/g, " ");
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

function normalizePlacementKey(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function normalizeFactionFilterKey(value: string | null | undefined): string {
    return (value ?? "").trim();
}

function getDistrictEntryPlacementFilters(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): DistrictArchivePlacement[] {
    const district = richDistrictByKey[entry.entryKey.trim()];
    const placement = district?.placementPrerequisites;
    if (!placement) return [];

    const values = new Set<DistrictArchivePlacement>();
    const neighbourOperator = normalizePlacementKey(placement.neighbourTiles?.operator);
    const territoryConstraint = normalizePlacementKey(placement.neighbourTiles?.territoryConstraint);
    if (neighbourOperator === "anytile" && territoryConstraint === "sameregion") {
        values.add("normalExpansion");
    } else if (neighbourOperator === "notile") {
        values.add("freePlacement");
    }

    const terrain = placement.terrain;
    if (
        normalizePlacementKey(terrain?.constraint) === "forbidden" ||
        terrain?.canBuildOnWasteland === false ||
        terrain?.canBuildOnMud === false
    ) {
        values.add("terrainRestricted");
    }

    const riverConstraint = normalizePlacementKey(placement.river?.constraint);
    if (riverConstraint === "anyriver" || riverConstraint === "rivernormal") {
        values.add("river");
    }

    const pointOfInterest = placement.pointOfInterest;
    const pointOfInterestConstraint = normalizePlacementKey(pointOfInterest?.constraint);
    if (pointOfInterestConstraint === "authorized" && (pointOfInterest?.pointOfInterestKeys ?? []).length > 0) {
        values.add("pointOfInterest");

        if ((pointOfInterest?.pointOfInterestKeys ?? []).some((key) =>
            normalizePlacementKey(key).includes("resourcedeposit")
        )) {
            values.add("resourceDeposit");
        }
    } else if (pointOfInterestConstraint === "anypoibutresourcedeposit") {
        values.add("pointOfInterest");
    }

    return Array.from(values);
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
