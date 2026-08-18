import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import {
    findDistrictArchiveFamilyForEntry,
    getDistrictCategoryDisplayLabel,
    getDistrictFamilyDisplayName,
    isDistrictArchiveEntry,
} from "@/lib/codex/codexDistrictArchiveFilters";
import type { CodexEntry, District } from "@/types/dataTypes";

export type CodexDistrictReferenceLink = {
    entry: CodexEntry;
    label: string;
    note?: string;
};

export type CodexDistrictReferenceModel = {
    profileItems: string[];
    effectLines: string[];
    extractedResources: CodexDistrictReferenceLink[];
    unlockedBy: CodexDistrictReferenceLink[];
    progression: CodexDistrictReferenceLink[];
    upgradesFrom: CodexDistrictReferenceLink[];
    upgradesInto: CodexDistrictReferenceLink[];
    placementLines: string[];
    recordNotes: string[];
};

const EMPTY_DISTRICT_REFERENCE: CodexDistrictReferenceModel = {
    profileItems: [],
    effectLines: [],
    extractedResources: [],
    unlockedBy: [],
    progression: [],
    upgradesFrom: [],
    upgradesInto: [],
    placementLines: [],
    recordNotes: [],
};

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizedExportKind(entry: CodexEntry): string {
    return entry.exportKind.trim().toLowerCase();
}

function isDistrictEntry(entry: CodexEntry): boolean {
    return isDistrictArchiveEntry(entry);
}

function isResourceEntry(entry: CodexEntry): boolean {
    return normalizedExportKind(entry) === "resources";
}

function isTechEntry(entry: CodexEntry): boolean {
    return normalizedExportKind(entry) === "tech";
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
): CodexDistrictReferenceLink[] {
    const links: CodexDistrictReferenceLink[] = [];
    const seen = new Set<string>();

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || key === currentEntryKey || seen.has(key)) continue;

        const entry = publicCodexEntryByKey[key];
        if (!entry) continue;

        seen.add(key);
        links.push({ entry, label: getCodexEntryLabel(entry) });
    }

    return links;
}

function resolveUpgradeInto(
    district: District,
    publicCodexDistrictByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexDistrictReferenceLink[] {
    const targetKey = normalizeKey(district.levelUp?.targetDistrictKey);
    if (!targetKey || targetKey === currentEntryKey) return [];

    const entry = publicCodexDistrictByKey[targetKey];
    if (!entry) return [];

    return [{
        entry,
        label: getCodexEntryLabel(entry),
        note: formatUpgradeRequirementNote(district.levelUp?.requiredAdjacentDistrictCount),
    }];
}

function resolveUpgradeFrom(
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    publicCodexDistrictByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexDistrictReferenceLink[] {
    const links: CodexDistrictReferenceLink[] = [];
    const seen = new Set<string>();

    for (const district of Object.values(richDistrictByKey)) {
        if (!district) continue;

        const sourceKey = normalizeKey(district.districtKey);
        const targetKey = normalizeKey(district.levelUp?.targetDistrictKey);
        if (!sourceKey || !targetKey || targetKey !== currentEntryKey || seen.has(sourceKey)) continue;

        const entry = publicCodexDistrictByKey[sourceKey];
        if (!entry) continue;

        seen.add(sourceKey);
        links.push({
            entry,
            label: getCodexEntryLabel(entry),
            note: formatUpgradeRequirementNote(district.levelUp?.requiredAdjacentDistrictCount),
        });
    }

    return links;
}

function resolveFamilyProgression(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexDistrictReferenceLink[] {
    const family = findDistrictArchiveFamilyForEntry(entry, allEntries, richDistrictByKey);
    if (!family || family.entries.length <= 1) return [];

    if (family.isResourceExtractorFamily) {
        return getGenericExtractorProgressionLinks(family.entries);
    }

    const progressionEntries = getProgressionEntries(family.entries, richDistrictByKey);
    const links: CodexDistrictReferenceLink[] = [];
    const labelCounts = progressionEntries.reduce<Map<string, number>>((counts, familyEntry) => {
        const normalizedLabel = getCodexEntryLabel(familyEntry).trim().toLowerCase();
        counts.set(normalizedLabel, (counts.get(normalizedLabel) ?? 0) + 1);
        return counts;
    }, new Map<string, number>());
    const seenLabels = new Set<string>();

    for (const familyEntry of progressionEntries) {
        const richDistrict = richDistrictByKey[familyEntry.entryKey.trim()];
        const label = getProgressionLinkLabel(
            familyEntry,
            richDistrict,
            (labelCounts.get(getCodexEntryLabel(familyEntry).trim().toLowerCase()) ?? 0) > 1
        );
        const normalizedLabel = label.trim().toLowerCase();
        if (!normalizedLabel || seenLabels.has(normalizedLabel)) continue;

        seenLabels.add(normalizedLabel);
        links.push({
            entry: familyEntry,
            label,
            note: richDistrict?.levelUp?.targetDistrictKey
                ? formatUpgradeRequirementNote(richDistrict.levelUp.requiredAdjacentDistrictCount)
                : undefined,
        });
    }

    return links.length > 1 ? links : [];
}

function getProgressionEntries(
    entries: readonly CodexEntry[],
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): readonly CodexEntry[] {
    const tieredEntries = entries.filter((entry) => getDistrictProgressionTier(entry, richDistrictByKey) !== null);
    return tieredEntries.length > 1 ? tieredEntries : entries;
}

function getDistrictProgressionTier(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>
): number | null {
    const factTier = getCodexFactValues(entry, "Tier")[0]?.trim().replace(/^tier\s*/i, "");
    if (factTier && /^\d+$/.test(factTier)) return Number(factTier);

    const richTier = richDistrictByKey[entry.entryKey.trim()]?.tier;
    return typeof richTier === "number" && Number.isFinite(richTier) ? richTier : null;
}

function getProgressionLinkLabel(
    entry: CodexEntry,
    richDistrict: District | undefined,
    includeTier: boolean
): string {
    const label = getCodexEntryLabel(entry);
    if (!includeTier) return label;

    const tier = getCodexFactValues(entry, "Tier")[0]?.trim() ?? (
        typeof richDistrict?.tier === "number" ? String(richDistrict.tier) : ""
    );
    return tier ? `${label} (Tier ${tier})` : label;
}

function getGenericExtractorProgressionLinks(entries: readonly CodexEntry[]): CodexDistrictReferenceLink[] {
    const entryByLabel = new Map<string, CodexEntry>();
    for (const entry of entries) {
        const label = getGenericExtractorProgressionLabel(entry);
        if (!entryByLabel.has(label)) {
            entryByLabel.set(label, entry);
        }
    }

    return ["Extractor", "Advanced Extractor", "Grand Extractor"]
        .map((label) => {
            const entry = entryByLabel.get(label);
            return entry ? { entry, label } : null;
        })
        .filter((link): link is CodexDistrictReferenceLink => link !== null);
}

function getGenericExtractorProgressionLabel(entry: CodexEntry): string {
    const label = getCodexEntryLabel(entry);
    if (/^Grand\b/i.test(label)) return "Grand Extractor";
    if (/^Advanced\b/i.test(label)) return "Advanced Extractor";
    return "Extractor";
}

function formatUpgradeRequirementNote(requiredAdjacentDistrictCount: number | null | undefined): string | undefined {
    if (
        typeof requiredAdjacentDistrictCount !== "number" ||
        !Number.isFinite(requiredAdjacentDistrictCount)
    ) {
        return undefined;
    }

    return `${requiredAdjacentDistrictCount} adjacent ${
        requiredAdjacentDistrictCount === 1 ? "district" : "districts"
    }`;
}

function getEffectLines(entry: CodexEntry): string[] {
    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );

    if (effectsSection?.lines.length) {
        return effectsSection.lines;
    }

    return (entry.descriptionLines ?? [])
        .filter((line): line is string => typeof line === "string")
        .map((line) => line.trim())
        .filter(Boolean);
}

function getReferenceEffectLines(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    allEntries: readonly CodexEntry[]
): string[] {
    const family = findDistrictArchiveFamilyForEntry(entry, allEntries, richDistrictByKey);
    if (!family || family.isResourceExtractorFamily) return getEffectLines(entry);

    const lines: string[] = [];
    const seen = new Set<string>();
    for (const familyEntry of family.entries) {
        for (const line of getEffectLines(familyEntry)) {
            const value = line.trim();
            const normalizedValue = value.toLowerCase().replace(/\s+/g, " ");
            if (!value || seen.has(normalizedValue)) continue;

            seen.add(normalizedValue);
            lines.push(value);
        }
    }

    return lines;
}

function getExtractedResourceLinks(
    entry: CodexEntry,
    publicCodexResourceByKey: Record<string, CodexEntry>
): CodexDistrictReferenceLink[] {
    const parsed = parseCodexStructuredDescription(entry);
    const extractedResourceSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "extracted resource"
    );
    const links: CodexDistrictReferenceLink[] = [];
    const seenKeys = new Set<string>();

    for (const item of extractedResourceSection?.items ?? []) {
        const referenceKey = normalizeKey(item.referenceKey);
        if (!referenceKey || seenKeys.has(referenceKey)) continue;

        const entry = publicCodexResourceByKey[referenceKey];
        if (!entry) continue;

        seenKeys.add(referenceKey);
        links.push({
            entry,
            label: item.label.trim() || getCodexEntryLabel(entry),
        });
    }

    return links;
}

function buildProfileItems(entry: CodexEntry, richDistrict: District | undefined): string[] {
    const items: string[] = [];
    const seen = new Set<string>();

    const add = (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = trimmedValue.toLowerCase();
        if (seen.has(normalizedValue)) return;

        seen.add(normalizedValue);
        items.push(trimmedValue);
    };

    getCodexFactValues(entry, "Category")
        .filter((value) => value.trim().toLowerCase() !== "none")
        .forEach((value) => add(getDistrictCategoryDisplayLabel(value)));
    if (richDistrict?.category && getCodexFactValues(entry, "Category").length === 0) {
        if (richDistrict.category.trim().toLowerCase() !== "none") {
            add(getDistrictCategoryDisplayLabel(richDistrict.category));
        }
    }

    getCodexFactValues(entry, "Tier").forEach((value) =>
        add(formatDistrictTierDetailLabel(value))
    );
    if (typeof richDistrict?.tier === "number" && getCodexFactValues(entry, "Tier").length === 0) {
        add(`Tier ${richDistrict.tier}`);
    }

    if (
        typeof richDistrict?.constructibleLevel === "number" &&
        Number.isFinite(richDistrict.constructibleLevel) &&
        richDistrict.constructibleLevel !== 0
    ) {
        add(`Constructible level ${richDistrict.constructibleLevel}`);
    }

    if (richDistrict?.isFactionSpecific) add("Faction-specific");
    if (richDistrict?.isVariant) add("Variant");

    const constructionCost = richDistrict?.constructionCost ?? [];
    if (constructionCost.length > 0) {
        add(`Cost: ${formatDistrictConstructionCostLabel(constructionCost)}`);
    }

    return items;
}

function formatDistrictTierDetailLabel(value: string): string {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    if (!trimmedValue) return "";

    return /^\d+$/.test(trimmedValue) ? `Tier ${trimmedValue}` : value.trim();
}

export function formatDistrictConstructionCostLabel(constructionCost: readonly string[]): string {
    return constructionCost
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => {
            if (value.toLowerCase() === "none") return "No production cost";
            if (value.toLowerCase() === "turnbased") return "Turn-based";
            return value;
        })
        .map((value) => value.replace(/\bResource\d+\b/g, "Resource"))
        .join(" + ")
        .replace(/\s+/g, " ");
}

export function getDistrictPlacementLines(richDistrict: District | undefined): string[] {
    const lines: string[] = [];
    const placement = richDistrict?.placementPrerequisites;
    const neighbourTiles = placement?.neighbourTiles;

    if (neighbourTiles) {
        const operator = normalizeKey(neighbourTiles.operator).toLowerCase();
        const territoryConstraint = normalizeKey(neighbourTiles.territoryConstraint).toLowerCase();

        if (operator === "anytile" && territoryConstraint === "sameregion") {
            lines.push("Adjacent tile in same region");
        } else if (operator === "notile") {
            lines.push("No neighbouring tile required");
        }

        if (neighbourTiles.ignoreCliff === true) {
            lines.push("Cliffs ignored for adjacency");
        }
    }

    const terrain = placement?.terrain;
    if (terrain) {
        const terrainLabels = (terrain.terrainTypeKeys ?? [])
            .map(formatPlacementKey)
            .filter(Boolean);
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

    const riverConstraint = normalizeKey(placement?.river?.constraint).toLowerCase();
    if (riverConstraint === "noriver") {
        lines.push("No river");
    } else if (riverConstraint === "anyriver") {
        lines.push("Requires river");
    } else if (riverConstraint === "rivernormal") {
        lines.push("Requires normal river");
    }

    const pointOfInterest = placement?.pointOfInterest;
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

    const label = normalized
        .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
        .replace(/([0-9])([A-Za-z])/g, "$1 $2")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
    const lowerLabel = label.toLowerCase();
    if (/^resource deposit luxury \d+$/.test(lowerLabel)) {
        return "Luxury resource deposit";
    }
    if (/^resource deposit strategic \d+$/.test(lowerLabel)) {
        return "Strategic resource deposit";
    }
    if (/^resource deposit/.test(lowerLabel)) {
        return "Resource deposit";
    }

    return label;
}

function buildRecordNotes(
    entry: CodexEntry,
    richDistrict: District | undefined,
    effectLines: readonly string[]
): string[] {
    const notes: string[] = [];

    if (effectLines.length === 0) {
        notes.push("No listed strategic effects.");
    }

    const requiredFactionTraitKeys = richDistrict?.levelUp?.requiredFactionTraitKeys ?? [];
    if (requiredFactionTraitKeys.length > 0) {
        notes.push("Next upgrade requires a faction trait.");
    }

    return notes;
}

export function buildCodexDistrictReferenceModel(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexDistrictReferenceModel {
    if (!isDistrictEntry(entry)) return EMPTY_DISTRICT_REFERENCE;

    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_DISTRICT_REFERENCE;

    const richDistrict = richDistrictByKey[currentEntryKey];
    const publicCodexTechByKey = buildPublicCodexIndex(allEntries, isTechEntry);
    const publicCodexDistrictByKey = buildPublicCodexIndex(allEntries, isDistrictEntry);
    const publicCodexResourceByKey = buildPublicCodexIndex(allEntries, isResourceEntry);
    const family = findDistrictArchiveFamilyForEntry(entry, allEntries, richDistrictByKey);
    const effectLines = getReferenceEffectLines(entry, richDistrictByKey, allEntries);
    const familyDisplayName = family?.displayName ?? getDistrictFamilyDisplayName(entry, richDistrictByKey);

    return {
        profileItems: [
            familyDisplayName && familyDisplayName !== getCodexEntryLabel(entry) ? `Family: ${familyDisplayName}` : "",
            ...buildProfileItems(entry, richDistrict),
        ].filter((value): value is string => Boolean(value)),
        effectLines,
        extractedResources: getExtractedResourceLinks(entry, publicCodexResourceByKey),
        unlockedBy: resolveLinks(
            richDistrict?.unlockTechnologyKeys ?? [],
            publicCodexTechByKey,
            currentEntryKey
        ),
        progression: resolveFamilyProgression(entry, richDistrictByKey, allEntries),
        upgradesFrom: resolveUpgradeFrom(richDistrictByKey, publicCodexDistrictByKey, currentEntryKey),
        upgradesInto: richDistrict
            ? resolveUpgradeInto(richDistrict, publicCodexDistrictByKey, currentEntryKey)
            : [],
        placementLines: getDistrictPlacementLines(richDistrict),
        recordNotes: buildRecordNotes(entry, richDistrict, effectLines),
    };
}

export function hasCodexDistrictReferenceModel(model: CodexDistrictReferenceModel): boolean {
    return model.profileItems.length > 0 ||
        model.effectLines.length > 0 ||
        model.extractedResources.length > 0 ||
        model.unlockedBy.length > 0 ||
        model.progression.length > 0 ||
        model.upgradesFrom.length > 0 ||
        model.upgradesInto.length > 0 ||
        model.placementLines.length > 0 ||
        model.recordNotes.length > 0;
}

export function getCodexDistrictReferenceEntryKeys(model: CodexDistrictReferenceModel): string[] {
    return [
        ...model.extractedResources,
        ...model.unlockedBy,
        ...model.progression,
        ...model.upgradesFrom,
        ...model.upgradesInto,
    ].map((link) => link.entry.entryKey);
}
