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

type DistrictReferenceOptions = {
    richDistrictsLoaded?: boolean;
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

    const links: CodexDistrictReferenceLink[] = [];
    const seenLabels = new Set<string>();

    for (const familyEntry of family.entries) {
        const label = getCodexEntryLabel(familyEntry);
        const normalizedLabel = label.trim().toLowerCase();
        if (!normalizedLabel || seenLabels.has(normalizedLabel)) continue;

        seenLabels.add(normalizedLabel);
        const richDistrict = richDistrictByKey[familyEntry.entryKey.trim()];
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

    getCodexFactValues(entry, "Category").forEach((value) =>
        add(getDistrictCategoryDisplayLabel(value))
    );
    if (richDistrict?.category && getCodexFactValues(entry, "Category").length === 0) {
        add(getDistrictCategoryDisplayLabel(richDistrict.category));
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
        add(`Cost: ${constructionCost.join(", ")}`);
    }

    return items;
}

function formatDistrictTierDetailLabel(value: string): string {
    const trimmedValue = value.trim().replace(/^tier\s*/i, "");
    if (!trimmedValue) return "";

    return /^\d+$/.test(trimmedValue) ? `Tier ${trimmedValue}` : value.trim();
}

function buildPlacementLines(richDistrict: District | undefined, richDistrictsLoaded: boolean): string[] {
    const neighbourTiles = richDistrict?.placementPrerequisites?.neighbourTiles;
    const lines: string[] = [];

    if (neighbourTiles) {
        const operator = normalizeKey(neighbourTiles.operator).toLowerCase();
        const territoryConstraint = normalizeKey(neighbourTiles.territoryConstraint).toLowerCase();

        if (operator === "anytile" && territoryConstraint === "sameregion") {
            lines.push("Adjacent tile in same region");
        }

        if (neighbourTiles.ignoreCliff === true) {
            lines.push("Cliffs ignored for adjacency");
        }
    }

    if (lines.length === 0 && richDistrictsLoaded) {
        lines.push("Specific terrain, river, and POI restrictions are not available in this view.");
    }

    return lines;
}

function buildRecordNotes(
    entry: CodexEntry,
    richDistrict: District | undefined,
    effectLines: readonly string[],
    richDistrictsLoaded: boolean
): string[] {
    const notes: string[] = [];

    if (effectLines.length === 0) {
        notes.push("No public effects exported for this district record.");
    }

    if (getCodexFactValues(entry, "Tier").length === 0 && richDistrict?.tier == null) {
        notes.push("No public tier exported; archive browsing treats tierless rows as Tier 1.");
    }

    if (!richDistrict && richDistrictsLoaded) {
        notes.push("Rich planning profile is not available for this district.");
    }

    if (richDistrict?.isPlayerFacing === false) {
        notes.push("Rich data marks this as non-player-facing.");
    }

    const requiredFactionTraitKeys = richDistrict?.levelUp?.requiredFactionTraitKeys ?? [];
    if (requiredFactionTraitKeys.length > 0) {
        notes.push("Next upgrade has an additional faction trait prerequisite.");
    }

    return notes;
}

export function buildCodexDistrictReferenceModel(
    entry: CodexEntry,
    richDistrictByKey: Readonly<Record<string, District | undefined>>,
    allEntries: readonly CodexEntry[],
    options: DistrictReferenceOptions = {}
): CodexDistrictReferenceModel {
    if (!isDistrictEntry(entry)) return EMPTY_DISTRICT_REFERENCE;

    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_DISTRICT_REFERENCE;

    const richDistrict = richDistrictByKey[currentEntryKey];
    const publicCodexTechByKey = buildPublicCodexIndex(allEntries, isTechEntry);
    const publicCodexDistrictByKey = buildPublicCodexIndex(allEntries, isDistrictEntry);
    const publicCodexResourceByKey = buildPublicCodexIndex(allEntries, isResourceEntry);
    const effectLines = getEffectLines(entry);
    const richDistrictsLoaded = options.richDistrictsLoaded ?? true;
    const family = findDistrictArchiveFamilyForEntry(entry, allEntries, richDistrictByKey);
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
        placementLines: buildPlacementLines(richDistrict, richDistrictsLoaded),
        recordNotes: buildRecordNotes(entry, richDistrict, effectLines, richDistrictsLoaded),
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
