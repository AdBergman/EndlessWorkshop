import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, District, Improvement } from "@/types/dataTypes";

type ConstructibleRichSource = Pick<
    District,
    "districtKey" | "unlockTechnologyKeys" | "levelUp" | "placementPrerequisites"
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
    unlockedBy: CodexConstructibleLink[];
    upgradesInto: CodexConstructibleLink[];
    placementLines: string[];
};

const EMPTY_CONSTRUCTIBLE_RICH_ENRICHMENT: CodexConstructibleRichEnrichment = {
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
    const neighbourTiles = source.placementPrerequisites?.neighbourTiles;
    if (!neighbourTiles) return [];

    const operator = normalizeKey(neighbourTiles.operator).toLowerCase();
    const territoryConstraint = normalizeKey(neighbourTiles.territoryConstraint).toLowerCase();

    if (operator === "anytile" && territoryConstraint === "sameregion") {
        return ["Adjacent tile in same region"];
    }

    return [];
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
