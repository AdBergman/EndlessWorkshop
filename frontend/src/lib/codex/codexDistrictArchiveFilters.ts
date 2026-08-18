import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry, District } from "@/types/dataTypes";

export type DistrictArchiveFilterKey = "family";

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

export type DistrictFamilyGroup =
    | "core"
    | "infrastructure"
    | "kin"
    | "lords"
    | "tahuk"
    | "aspects"
    | "necrophages"
    | "other";

export type ActiveDistrictArchiveFilters = {
    family: DistrictFamilyGroup | null;
};

export type DistrictArchiveFamily = {
    familyKey: string;
    displayName: string;
    representativeEntry: CodexEntry;
    entries: CodexEntry[];
    group: DistrictFamilyGroup;
    categoryLabels: string[];
    factionLabel: string | null;
    isResourceExtractorFamily: boolean;
};

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
    family: null,
};
const DISTRICT_ARCHIVE_EXPORT_KINDS = new Set(["districts", "extractors"]);

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

const DISTRICT_FAMILY_GROUPS: Array<{ value: DistrictFamilyGroup; label: string }> = [
    { value: "core", label: "Core" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "kin", label: "Kin" },
    { value: "lords", label: "Lords" },
    { value: "tahuk", label: "Tahuk" },
    { value: "aspects", label: "Aspects" },
    { value: "necrophages", label: "Necrophages" },
    { value: "other", label: "Other" },
];

const CORE_CATEGORY_VALUES = new Set<DistrictArchiveCategory>([
    "City",
    "Food",
    "Industry",
    "Money",
    "Science",
    "Influence",
    "Military",
    "Population",
]);

const INFRASTRUCTURE_CATEGORY_VALUES = new Set<DistrictArchiveCategory>([
    "Bridge",
    "Foundation",
    "Resource",
    "Trade",
]);

function normalizeDistrictArchiveCategory(value: string): DistrictArchiveCategory | null {
    const trimmedValue = value.trim();
    return DISTRICT_CATEGORY_ORDER.find((candidate) => candidate.toLowerCase() === trimmedValue.toLowerCase()) ?? null;
}

export function getDistrictCategoryDisplayLabel(value: string): string {
    const category = normalizeDistrictArchiveCategory(value);
    return category ? DISTRICT_CATEGORY_DISPLAY_LABELS[category] : value.trim();
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

export function hasActiveDistrictArchiveFilters(filters: ActiveDistrictArchiveFilters): boolean {
    return Boolean(filters.family);
}

export function buildDistrictArchiveFilterGroups(
    visibleEntries: readonly CodexEntry[],
    _filters: ActiveDistrictArchiveFilters,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {},
    allDistrictEntries: readonly CodexEntry[] = visibleEntries
): DistrictArchiveFilterGroup[] {
    const visibleEntryKeys = new Set(visibleEntries.map((entry) => entry.entryKey));
    const families = buildDistrictArchiveFamilies(allDistrictEntries, richDistrictByKey)
        .filter((family) => family.entries.some((entry) => visibleEntryKeys.has(entry.entryKey)));
    const counts = families.reduce<Map<DistrictFamilyGroup, number>>((acc, family) => {
        acc.set(family.group, (acc.get(family.group) ?? 0) + 1);
        return acc;
    }, new Map<DistrictFamilyGroup, number>());

    return [{
        key: "family",
        label: "Family",
        options: DISTRICT_FAMILY_GROUPS
            .map((option) => ({
                ...option,
                count: counts.get(option.value) ?? 0,
            }))
            .filter((option) => option.count > 0),
    }];
}

export function filterDistrictEntriesByArchiveFilters(
    visibleEntries: readonly CodexEntry[],
    filters: ActiveDistrictArchiveFilters,
    preferredEntryKey?: string | null,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {},
    allDistrictEntries: readonly CodexEntry[] = visibleEntries
): CodexEntry[] {
    const visibleEntryKeys = new Set(visibleEntries.map((entry) => entry.entryKey));
    const families = buildDistrictArchiveFamilies(allDistrictEntries, richDistrictByKey)
        .filter((family) => family.entries.some((entry) => visibleEntryKeys.has(entry.entryKey)))
        .filter((family) => !filters.family || family.group === filters.family);

    return sortDistrictArchiveFamilies(families, preferredEntryKey)
        .map((family) => family.representativeEntry);
}

export function buildDistrictArchiveFamilies(
    entries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFamily[] {
    const districtEntries = entries.filter(isDistrictArchiveEntry);
    const familyEntries = districtEntries.reduce<Map<string, CodexEntry[]>>((acc, entry) => {
        const familyKey = getDistrictFamilyKey(entry, richDistrictByKey);
        const existing = acc.get(familyKey) ?? [];
        existing.push(entry);
        acc.set(familyKey, existing);
        return acc;
    }, new Map<string, CodexEntry[]>());

    const families = Array.from(familyEntries.entries())
        .map(([familyKey, familyEntryList]) =>
            buildDistrictArchiveFamily(familyKey, familyEntryList, richDistrictByKey)
        );

    return disambiguateDuplicateFamilyDisplayNames(families);
}

export function isDistrictArchiveEntry(entry: CodexEntry): boolean {
    return DISTRICT_ARCHIVE_EXPORT_KINDS.has(entry.exportKind.trim().toLowerCase());
}

export function findDistrictArchiveFamilyForEntry(
    entry: CodexEntry,
    allDistrictEntries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): DistrictArchiveFamily | null {
    const families = buildDistrictArchiveFamilies(allDistrictEntries, richDistrictByKey);
    return families.find((family) =>
        family.entries.some((candidate) => candidate.entryKey === entry.entryKey)
    ) ?? null;
}

export function getDistrictArchiveFamilyLabel(value: DistrictFamilyGroup): string {
    return DISTRICT_FAMILY_GROUPS.find((option) => option.value === value)?.label ?? value;
}

export function getDistrictEntryFactionLabels(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string[] {
    const factionKey = getDistrictFactionKey(entry, richDistrictByKey);
    return factionKey ? [formatDistrictFactionLabel(factionKey)] : ["Universal"];
}

export function formatDistrictTierFilterLabel(value: string): string {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    return /^\d+$/.test(trimmedValue) ? `Tier ${trimmedValue}` : value.trim();
}

export function getDistrictEntryPlacementFilters(
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
        terrain &&
        (
            normalizePlacementKey(terrain.constraint) === "forbidden" ||
            terrain.canBuildOnWasteland === false ||
            terrain.canBuildOnMud === false
        )
    ) {
        values.add("terrainRestricted");
    }

    const riverConstraint = normalizePlacementKey(placement.river?.constraint);
    if (riverConstraint && riverConstraint !== "noriver") {
        values.add("river");
    }

    const pointOfInterestConstraint = normalizePlacementKey(placement.pointOfInterest?.constraint);
    if (
        pointOfInterestConstraint === "noresourcedeposit" ||
        (placement.pointOfInterest?.pointOfInterestKeys ?? []).some((key) =>
            normalizePlacementKey(key).includes("resourcedeposit")
        )
    ) {
        values.add("resourceDeposit");
    }
    if (pointOfInterestConstraint && pointOfInterestConstraint !== "nopoi") {
        values.add("pointOfInterest");
    }

    return Array.from(values);
}

function buildDistrictArchiveFamily(
    familyKey: string,
    familyEntries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): DistrictArchiveFamily {
    const entries = sortDistrictFamilyEntries(familyEntries, richDistrictByKey);
    const representativeEntry = entries[0];
    const group = getDistrictFamilyGroup(representativeEntry, richDistrictByKey);
    const categoryLabels = getFamilyCategoryLabels(entries, richDistrictByKey);
    const factionKey = getDistrictFactionKey(representativeEntry, richDistrictByKey);
    const isResourceExtractorFamily = entries.some((entry) => isGenericResourceExtractor(entry, richDistrictByKey));

    return {
        familyKey,
        displayName: getDistrictFamilyDisplayName(representativeEntry, richDistrictByKey),
        representativeEntry,
        entries,
        group,
        categoryLabels,
        factionLabel: factionKey ? formatDistrictFactionLabel(factionKey) : null,
        isResourceExtractorFamily,
    };
}

function sortDistrictArchiveFamilies(
    families: readonly DistrictArchiveFamily[],
    preferredEntryKey?: string | null
): DistrictArchiveFamily[] {
    return [...families].sort((left, right) => {
        const leftHasPreferred = preferredEntryKey && left.entries.some((entry) => entry.entryKey === preferredEntryKey);
        const rightHasPreferred = preferredEntryKey && right.entries.some((entry) => entry.entryKey === preferredEntryKey);
        if (leftHasPreferred && !rightHasPreferred) return -1;
        if (!leftHasPreferred && rightHasPreferred) return 1;

        const groupOrder = getFamilyGroupOrder(left.group) - getFamilyGroupOrder(right.group);
        if (groupOrder !== 0) return groupOrder;

        return left.displayName.localeCompare(right.displayName);
    });
}

function sortDistrictFamilyEntries(
    entries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): CodexEntry[] {
    return [...entries].sort((left, right) => {
        const leftProgressionPrefix = hasProgressionPrefix(getCodexEntryLabel(left)) ? 1 : 0;
        const rightProgressionPrefix = hasProgressionPrefix(getCodexEntryLabel(right)) ? 1 : 0;
        if (leftProgressionPrefix !== rightProgressionPrefix) {
            return leftProgressionPrefix - rightProgressionPrefix;
        }

        const leftTier = getDistrictTierNumber(left, richDistrictByKey);
        const rightTier = getDistrictTierNumber(right, richDistrictByKey);
        if (leftTier !== rightTier) return leftTier - rightTier;

        return rightScore(right, richDistrictByKey) - rightScore(left, richDistrictByKey);
    });
}

function rightScore(entry: CodexEntry, richDistrictByKey: Readonly<Record<string, District | undefined>>): number {
    const richDistrict = richDistrictByKey[entry.entryKey.trim()];
    const effectsSection = parseCodexStructuredDescription(entry).sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );

    return ((effectsSection?.lines.length ?? 0) * 10) +
        ((entry.sections ?? []).length * 2) +
        ((richDistrict?.descriptionLines ?? []).length * 3) +
        ((richDistrict?.constructionCost ?? []).length * 4) +
        (richDistrict?.placementPrerequisites ? 4 : 0);
}

function getDistrictTierNumber(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): number {
    const factTier = getCodexFactValues(entry, DISTRICT_TIER_FACT_LABEL)
        .map((value) => value.trim().replace(/^tier\s*/i, ""))
        .find((value) => /^\d+$/.test(value));
    if (factTier) return Number(factTier);

    const richTier = richDistrictByKey[entry.entryKey.trim()]?.tier;
    return typeof richTier === "number" && Number.isFinite(richTier) ? richTier : Number.MAX_SAFE_INTEGER;
}

function getDistrictFamilyKey(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string {
    const faction = getDistrictFactionKey(entry, richDistrictByKey) || "universal";
    const familyDisplayName = getDistrictFamilyDisplayName(entry, richDistrictByKey);
    const familyName = normalizeFamilyName(familyDisplayName);

    if (isGenericResourceExtractor(entry, richDistrictByKey)) {
        return `${faction}::resource::extractor`;
    }

    return `${faction}::${familyName}`;
}

export function getDistrictFamilyDisplayName(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>> = {}
): string {
    const category = getDistrictCategory(entry, richDistrictByKey);
    const rawName = getCodexEntryLabel(entry).trim();
    if (isGenericResourceExtractor(entry, richDistrictByKey)) {
        return "Extractor";
    }

    const normalizedName = rawName
        .replace(/^\[[^\]]+\]\s*/, "")
        .replace(/^(Advanced|Grand|Great|Sacred|Divine)\s+/i, "")
        .trim();

    if (normalizedName.toLowerCase() === "habitations") {
        return "Communal Habitations";
    }
    if (normalizedName.toLowerCase() === "oculum") {
        return "Holy Oculum";
    }

    return normalizedName || rawName || category || "District";
}

function getDistrictFamilyGroup(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): DistrictFamilyGroup {
    const factionKey = (getDistrictFactionKey(entry, richDistrictByKey) ?? "").toLowerCase();
    if (factionKey === "kinofsheredyn") return "kin";
    if (factionKey === "lastlord") return "lords";
    if (factionKey === "mukag") return "tahuk";
    if (factionKey === "mangroveofharmony") return "aspects";
    if (factionKey === "necrophage") return "necrophages";

    const displayName = getDistrictFamilyDisplayName(entry, richDistrictByKey).toLowerCase();
    if (isInfrastructureFamilyName(displayName)) {
        return "infrastructure";
    }

    const category = normalizeDistrictArchiveCategory(getDistrictCategory(entry, richDistrictByKey) ?? "");
    if (category && CORE_CATEGORY_VALUES.has(category)) return "core";
    if (category && INFRASTRUCTURE_CATEGORY_VALUES.has(category)) return "infrastructure";

    return "other";
}

function getFamilyGroupOrder(value: DistrictFamilyGroup): number {
    return DISTRICT_FAMILY_GROUPS.findIndex((option) => option.value === value);
}

function disambiguateDuplicateFamilyDisplayNames(families: readonly DistrictArchiveFamily[]): DistrictArchiveFamily[] {
    const displayNameCounts = families.reduce<Map<string, number>>((counts, family) => {
        const normalizedDisplayName = normalizeFamilyName(family.displayName);
        counts.set(normalizedDisplayName, (counts.get(normalizedDisplayName) ?? 0) + 1);
        return counts;
    }, new Map<string, number>());

    return families.map((family) => {
        const normalizedDisplayName = normalizeFamilyName(family.displayName);
        if ((displayNameCounts.get(normalizedDisplayName) ?? 0) <= 1) {
            return family;
        }

        if (family.factionLabel) {
            return {
                ...family,
                displayName: `${family.displayName} (${family.factionLabel})`,
            };
        }

        return family;
    });
}

function getFamilyCategoryLabels(
    entries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string[] {
    const values = new Set<string>();
    for (const entry of entries) {
        const category = getDistrictCategory(entry, richDistrictByKey);
        if (category && category.trim().toLowerCase() !== "none") {
            values.add(getDistrictCategoryDisplayLabel(category));
        }
    }

    return Array.from(values);
}

function getDistrictCategory(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string | null {
    const factCategory = getCodexFactValues(entry, DISTRICT_CATEGORY_FACT_LABEL)[0]?.trim();
    if (factCategory) return factCategory;

    return richDistrictByKey[entry.entryKey.trim()]?.category?.trim() || null;
}

function getDistrictFactionKey(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): string | null {
    const richDistrict = richDistrictByKey[entry.entryKey.trim()];
    return richDistrict?.factionKey?.trim() || null;
}

function formatDistrictFactionLabel(value: string): string {
    const normalizedValue = value.trim();
    const lowerValue = normalizedValue.toLowerCase();
    if (lowerValue === "kinofsheredyn") return "Kin";
    if (lowerValue === "lastlord") return "Lords";
    if (lowerValue === "mukag") return "Tahuk";
    if (lowerValue === "mangroveofharmony") return "Aspects";
    if (lowerValue === "necrophage") return "Necrophages";

    return normalizedValue
        .replace(/^Faction_/, "")
        .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
        .replace(/_/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function isGenericResourceExtractor(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): boolean {
    const category = normalizeDistrictArchiveCategory(getDistrictCategory(entry, richDistrictByKey) ?? "");
    return category === "Resource" && /\bExtractor\b/i.test(getCodexEntryLabel(entry));
}

function isInfrastructureFamilyName(value: string): boolean {
    return [
        "bridge",
        "camp",
        "dam",
        "extractor",
        "foundation",
        "pacified village",
        "temporary bridge",
        "trading post",
    ].includes(value.trim().toLowerCase());
}

function normalizeFamilyName(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasProgressionPrefix(value: string): boolean {
    return /^(Advanced|Grand|Great|Sacred|Divine)\s+/i.test(value.trim());
}

function normalizePlacementKey(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}
