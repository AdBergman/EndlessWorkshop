import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, District, Improvement } from "@/types/dataTypes";

type ConstructibleRichSource = Pick<
    District,
    | "districtKey"
    | "tier"
    | "constructibleLevel"
    | "constructionCost"
    | "isFactionSpecific"
    | "isVariant"
    | "unlockTechnologyKeys"
    | "levelUp"
    | "placementPrerequisites"
> | Pick<
    Improvement,
    "improvementKey" | "unlockTechnologyKeys" | "placementPrerequisites"
>;

export type CodexConstructibleLink = {
    entry: CodexEntry;
    label: string;
    note?: string;
};

export type CodexConstructibleRichEnrichment = {
    profileLines: string[];
    unlockedBy: CodexConstructibleLink[];
    upgradesInto: CodexConstructibleLink[];
    placementLines: string[];
};

const EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT: CodexConstructibleRichEnrichment = {
    profileLines: [],
    unlockedBy: [],
    upgradesInto: [],
    placementLines: [],
};

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizedExportKind(entry: CodexEntry): string {
    return entry.exportKind.trim().toLowerCase();
}

function isTechEntry(entry: CodexEntry): boolean {
    return normalizedExportKind(entry) === "tech";
}

function isDistrictEntry(entry: CodexEntry): boolean {
    return normalizedExportKind(entry) === "districts";
}

function isImprovementEntry(entry: CodexEntry): boolean {
    return normalizedExportKind(entry) === "improvements";
}

function buildPublicCodexIndex(
    entries: readonly CodexEntry[],
    predicate: (entry: CodexEntry) => boolean
): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        if (!predicate(entry)) return acc;

        const entryKey = normalizeKey(entry.entryKey);
        if (entryKey) acc[entryKey] = entry;

        return acc;
    }, {});
}

function resolveLinks(
    keys: readonly string[],
    publicCodexEntryByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexConstructibleLink[] {
    const links: CodexConstructibleLink[] = [];
    const seen = new Set<string>();

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || key === currentEntryKey || seen.has(key)) continue;

        const entry = publicCodexEntryByKey[key];
        if (!entry) continue;

        seen.add(key);
        links.push({
            entry,
            label: getCodexEntryLabel(entry),
        });
    }

    return links;
}

function buildUpgradeLink(
    district: Pick<District, "levelUp">,
    publicCodexDistrictByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexConstructibleLink[] {
    const targetKey = normalizeKey(district.levelUp?.targetDistrictKey);
    if (!targetKey || targetKey === currentEntryKey) return [];

    const entry = publicCodexDistrictByKey[targetKey];
    if (!entry) return [];

    const adjacentCount = district.levelUp?.requiredAdjacentDistrictCount;
    const note = Number.isFinite(adjacentCount) && adjacentCount !== null
        ? `${adjacentCount} adjacent ${adjacentCount === 1 ? "district" : "districts"}`
        : undefined;

    return [{
        entry,
        label: getCodexEntryLabel(entry),
        note,
    }];
}

function buildPlacementLines(source: Pick<ConstructibleRichSource, "placementPrerequisites">): string[] {
    const lines: string[] = [];
    const neighbourTiles = source.placementPrerequisites?.neighbourTiles;

    if (neighbourTiles) {
        const operator = normalizeKey(neighbourTiles.operator).toLowerCase();
        const territoryConstraint = normalizeKey(neighbourTiles.territoryConstraint).toLowerCase();

        if (operator === "anytile" && territoryConstraint === "sameregion") {
            lines.push("Adjacent tile in same region");
        } else if (operator === "notile") {
            lines.push("No neighbouring tile required");
        }
    }

    const terrain = source.placementPrerequisites?.terrain;
    if (terrain) {
        const terrainKeys = terrain.terrainTypeKeys ?? [];
        const terrainLabels = terrainKeys.map(formatPlacementKey).filter(Boolean);
        if (normalizeKey(terrain.constraint).toLowerCase() === "forbidden" && terrainLabels.length > 0) {
            lines.push(`Forbidden terrain: ${terrainLabels.join(", ")}`);
        }
        if (terrain.canBuildOnWasteland === false) {
            lines.push("Cannot build on wasteland");
        }
        if (terrain.canBuildOnMud === false) {
            lines.push("Cannot build on mud");
        }
    }

    const riverConstraint = normalizeKey(source.placementPrerequisites?.river?.constraint).toLowerCase();
    if (riverConstraint === "noriver") {
        lines.push("No river");
    } else if (riverConstraint === "anyriver") {
        lines.push("Requires river");
    } else if (riverConstraint === "rivernormal") {
        lines.push("Requires normal river");
    }

    const pointOfInterest = source.placementPrerequisites?.pointOfInterest;
    const pointOfInterestConstraint = normalizeKey(pointOfInterest?.constraint).toLowerCase();
    if (pointOfInterestConstraint === "noresourcedeposit") {
        lines.push("No resource deposit");
    } else if (pointOfInterestConstraint === "nopoi") {
        lines.push("No point of interest");
    } else if (pointOfInterestConstraint === "anypoibutresourcedeposit") {
        lines.push("Any point of interest except resource deposit");
    } else if (pointOfInterestConstraint === "authorized") {
        const pointOfInterestLabels = (pointOfInterest?.pointOfInterestKeys ?? [])
            .map(formatPlacementKey)
            .filter(Boolean);
        if (pointOfInterestLabels.length > 0) {
            lines.push(`Requires: ${pointOfInterestLabels.join(", ")}`);
        }
    }

    return lines;
}

function formatPlacementKey(value: string): string {
    const normalized = normalizeKey(value)
        .replace(/^TerrainType_/, "")
        .replace(/^POI_/, "")
        .replace(/_/g, " ");
    if (!normalized) return "";

    return normalized
        .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
        .replace(/([0-9])([A-Za-z])/g, "$1 $2")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildDistrictProfileLines(
    district: Pick<
        District,
        "tier" | "constructibleLevel" | "constructionCost" | "isFactionSpecific" | "isVariant"
    >
): string[] {
    const lines: string[] = [];

    if (typeof district.tier === "number" && Number.isFinite(district.tier)) {
        lines.push(`Tier ${district.tier}`);
    }

    if (
        typeof district.constructibleLevel === "number" &&
        Number.isFinite(district.constructibleLevel) &&
        district.constructibleLevel !== 0
    ) {
        lines.push(`Constructible level ${district.constructibleLevel}`);
    }

    if (district.isFactionSpecific) {
        lines.push("Faction-specific variant");
    } else if (district.isVariant) {
        lines.push("Variant");
    }

    const constructionCost = district.constructionCost ?? [];
    if (constructionCost.length > 0) {
        lines.push(`Cost: ${constructionCost.join(", ")}`);
    }

    return lines;
}

export function buildCodexConstructibleRichEnrichment(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    richImprovementByKey: Readonly<Record<string, Improvement | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexConstructibleRichEnrichment {
    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT;

    const publicCodexTechByKey = buildPublicCodexIndex(allEntries, isTechEntry);

    if (isDistrictEntry(entry)) {
        const richDistrict = richDistrictByKey[currentEntryKey];
        if (!richDistrict) return EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT;

        const publicCodexDistrictByKey = buildPublicCodexIndex(allEntries, isDistrictEntry);

        return {
            profileLines: buildDistrictProfileLines(richDistrict),
            unlockedBy: resolveLinks(
                richDistrict.unlockTechnologyKeys ?? [],
                publicCodexTechByKey,
                currentEntryKey
            ),
            upgradesInto: buildUpgradeLink(richDistrict, publicCodexDistrictByKey, currentEntryKey),
            placementLines: buildPlacementLines(richDistrict),
        };
    }

    if (isImprovementEntry(entry)) {
        const richImprovement = richImprovementByKey[currentEntryKey];
        if (!richImprovement) return EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT;

        return {
            profileLines: [],
            unlockedBy: resolveLinks(
                richImprovement.unlockTechnologyKeys ?? [],
                publicCodexTechByKey,
                currentEntryKey
            ),
            upgradesInto: [],
            placementLines: buildPlacementLines(richImprovement),
        };
    }

    return EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT;
}

export function hasCodexConstructibleRichEnrichment(
    enrichment: CodexConstructibleRichEnrichment
): boolean {
    return (
        enrichment.profileLines.length > 0 ||
        enrichment.unlockedBy.length > 0 ||
        enrichment.upgradesInto.length > 0 ||
        enrichment.placementLines.length > 0
    );
}

export function getCodexConstructibleRichEnrichmentEntryKeys(
    enrichment: CodexConstructibleRichEnrichment
): string[] {
    return [...enrichment.unlockedBy, ...enrichment.upgradesInto].map((link) => link.entry.entryKey);
}
