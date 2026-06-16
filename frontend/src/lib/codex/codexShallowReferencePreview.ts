import { getCodexEntryLabel, stripCodexDescriptionLine } from "@/lib/codex/codexPresentation";
import { resolveCodexReference } from "@/lib/codex/codexRefs";
import type { CodexEntry, CodexMetadataSection, CodexMetadataSectionItem } from "@/types/dataTypes";

type ShallowReferencePreview = {
    context: string;
    effectLines: string[];
    links: ShallowReferenceLink[];
};

export type ShallowReferenceLink = {
    label: string;
    entry: CodexEntry;
    prefix: string;
};

const SHALLOW_REFERENCE_KINDS = new Set(["resources", "counciloreffects", "partnereffects"]);

function normalizeKind(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function normalizeText(value: string | null | undefined): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
}

function uniqueValues(parts: readonly string[]): string[] {
    const seen = new Set<string>();
    const uniqueParts: string[] = [];

    for (const part of parts) {
        const normalized = normalizeText(part);
        const key = normalized.toLowerCase();
        if (!normalized || seen.has(key)) continue;
        seen.add(key);
        uniqueParts.push(normalized);
    }

    return uniqueParts;
}

function findFactValue(entry: CodexEntry, label: string): string {
    return normalizeText(entry.facts?.find((fact) => normalizeText(fact.label).toLowerCase() === label.toLowerCase())
        ?.value);
}

function formatResourceContext(entry: CodexEntry): string {
    const resourceType = findFactValue(entry, "Type").replace(/\s+resource$/i, "");
    return resourceType;
}

function formatEffectContext(entry: CodexEntry): string {
    const kind = findFactValue(entry, "Kind") || normalizeText(entry.kind);
    const role = findFactValue(entry, "Role") || findFactValue(entry, "Scope");

    if (role) return role;
    if (!/^(councilor effect|partner effect)$/i.test(kind)) return kind;

    return "";
}

function sectionItems(entry: CodexEntry, title: string): CodexMetadataSectionItem[] {
    return entry.sections?.find((section) => normalizeText(section.title).toLowerCase() === title.toLowerCase())
        ?.items ?? [];
}

function sectionLines(entry: CodexEntry, title: string): string[] {
    const matchingSections = entry.sections?.filter((section: CodexMetadataSection) => (
        normalizeText(section.title).toLowerCase() === title.toLowerCase()
    )) ?? [];

    return uniqueValues(matchingSections.flatMap((section) => section.lines ?? []));
}

function fallbackEffectLines(entry: CodexEntry, fallbackPreview: string): string[] {
    const effects = sectionLines(entry, "Effects");
    return effects.length > 0 ? effects : uniqueValues([fallbackPreview]);
}

function extractorLinks(entry: CodexEntry, entriesByKey: Record<string, CodexEntry>): ShallowReferenceLink[] {
    return sectionItems(entry, "Extractors")
        .map((item) => {
            const relatedEntry = resolveCodexReference(item.referenceKey, { entriesByKey });
            return relatedEntry
                ? {
                    label: stripCodexDescriptionLine(getCodexEntryLabel(relatedEntry)),
                    entry: relatedEntry,
                    prefix: "Extractor",
                }
                : null;
        })
        .filter((link): link is ShallowReferenceLink => Boolean(link));
}

function isTieredExtractor(entryKey: string): boolean {
    return /_Tier\d+$/i.test(entryKey);
}

function primaryExtractorLinks(links: readonly ShallowReferenceLink[]): ShallowReferenceLink[] {
    if (links.length <= 1) return [...links];

    const baseExtractors = links.filter((link) => !isTieredExtractor(link.entry.entryKey));
    return baseExtractors.length === 1 ? baseExtractors : [...links];
}

function hasReferenceTo(entry: CodexEntry, targetKey: string): boolean {
    return [
        ...(entry.publicContextKeys ?? []),
        ...(entry.referenceKeys ?? []),
        ...(entry.facts ?? []).map((fact) => fact.referenceKey),
    ].some((referenceKey) => normalizeText(referenceKey) === targetKey);
}

function sourceLink(entry: CodexEntry, allEntries: readonly CodexEntry[]): ShallowReferenceLink | null {
    const source = allEntries.find((candidate) => (
        normalizeKind(candidate.exportKind) === "councilors" &&
        hasReferenceTo(candidate, entry.entryKey)
    ));

    return source
        ? {
            label: getCodexEntryLabel(source),
            entry: source,
            prefix: "Source",
        }
        : null;
}

export function isShallowReferenceKind(kind: string | null | undefined): boolean {
    return SHALLOW_REFERENCE_KINDS.has(normalizeKind(kind));
}

export function getCodexShallowReferencePreview(
    entry: CodexEntry,
    allEntries: readonly CodexEntry[],
    fallbackPreview: string
): ShallowReferencePreview | null {
    const kind = normalizeKind(entry.exportKind);
    if (!isShallowReferenceKind(kind)) return null;

    const entriesByKey = allEntries.reduce<Record<string, CodexEntry>>((acc, candidate) => {
        const entryKey = normalizeText(candidate.entryKey);
        if (entryKey) acc[entryKey] = candidate;
        return acc;
    }, {});

    if (kind === "resources") {
        const links = extractorLinks(entry, entriesByKey);

        return {
            context: formatResourceContext(entry),
            effectLines: fallbackEffectLines(entry, fallbackPreview),
            links: primaryExtractorLinks(links),
        };
    }

    const source = sourceLink(entry, allEntries);

    return {
        context: formatEffectContext(entry),
        effectLines: fallbackEffectLines(entry, fallbackPreview),
        links: source ? [source] : [],
    };
}
