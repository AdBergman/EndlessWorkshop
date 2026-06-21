import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, Tech } from "@/types/dataTypes";

type TechRichPrerequisiteSource = Pick<Tech, "techKey" | "prereq" | "excludes"> & {
    technologyPrerequisiteTechKeys?: readonly string[] | null;
    exclusiveTechnologyPrerequisiteTechKeys?: readonly string[] | null;
};

export type CodexTechPrerequisiteLink = {
    entry: CodexEntry;
    label: string;
};

export type CodexTechRichEnrichment = {
    prerequisites: CodexTechPrerequisiteLink[];
    exclusivePrerequisites: CodexTechPrerequisiteLink[];
};

const EMPTY_TECH_RICH_ENRICHMENT: CodexTechRichEnrichment = {
    prerequisites: [],
    exclusivePrerequisites: [],
};

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isTechEntry(entry: CodexEntry): boolean {
    return entry.exportKind.trim().toLowerCase() === "tech";
}

function uniqueKeys(keys: readonly string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || seen.has(key)) continue;

        seen.add(key);
        unique.push(key);
    }

    return unique;
}

function readPrerequisiteKeys(
    richTech: TechRichPrerequisiteSource,
    arrayField: "technologyPrerequisiteTechKeys" | "exclusiveTechnologyPrerequisiteTechKeys",
    legacyField: "prereq" | "excludes"
): string[] {
    const arrayKeys = richTech[arrayField];
    if (Array.isArray(arrayKeys) && arrayKeys.length > 0) {
        return uniqueKeys(arrayKeys);
    }

    const legacyKey = normalizeKey(richTech[legacyField]);
    return legacyKey ? [legacyKey] : [];
}

function buildPublicCodexTechIndex(entries: readonly CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        if (!isTechEntry(entry)) return acc;

        const entryKey = normalizeKey(entry.entryKey);
        if (entryKey) acc[entryKey] = entry;

        return acc;
    }, {});
}

function resolvePrerequisiteLinks(
    keys: readonly string[],
    publicCodexTechByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexTechPrerequisiteLink[] {
    const links: CodexTechPrerequisiteLink[] = [];
    const seen = new Set<string>();

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || key === currentEntryKey || seen.has(key)) continue;

        const entry = publicCodexTechByKey[key];
        if (!entry) continue;

        seen.add(key);
        links.push({
            entry,
            label: getCodexEntryLabel(entry),
        });
    }

    return links;
}

export function buildCodexTechRichEnrichment(
    entry: CodexEntry,
    richTechByKey: Readonly<Record<string, TechRichPrerequisiteSource | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexTechRichEnrichment {
    if (!isTechEntry(entry)) return EMPTY_TECH_RICH_ENRICHMENT;

    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_TECH_RICH_ENRICHMENT;

    const richTech = richTechByKey[currentEntryKey];
    if (!richTech) return EMPTY_TECH_RICH_ENRICHMENT;

    const publicCodexTechByKey = buildPublicCodexTechIndex(allEntries);
    const prerequisiteKeys = readPrerequisiteKeys(richTech, "technologyPrerequisiteTechKeys", "prereq");
    const exclusivePrerequisiteKeys = readPrerequisiteKeys(
        richTech,
        "exclusiveTechnologyPrerequisiteTechKeys",
        "excludes"
    );

    return {
        prerequisites: resolvePrerequisiteLinks(prerequisiteKeys, publicCodexTechByKey, currentEntryKey),
        exclusivePrerequisites: resolvePrerequisiteLinks(
            exclusivePrerequisiteKeys,
            publicCodexTechByKey,
            currentEntryKey
        ),
    };
}

export function hasCodexTechRichEnrichment(enrichment: CodexTechRichEnrichment): boolean {
    return enrichment.prerequisites.length > 0 || enrichment.exclusivePrerequisites.length > 0;
}
