import { getCodexEntryLabel, stripCodexDescriptionLine } from "@/lib/codex/codexPresentation";
import { resolveCodexReference } from "@/lib/codex/codexRefs";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry, CodexMetadataSectionItem } from "@/types/dataTypes";

type ShallowReferencePreview = {
    context: string;
    preview: string;
};

const SHALLOW_REFERENCE_KINDS = new Set(["resources", "counciloreffects", "partnereffects"]);

function normalizeKind(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function normalizeText(value: string | null | undefined): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
}

function joinUnique(parts: readonly string[], separator = " · "): string {
    const seen = new Set<string>();
    const uniqueParts: string[] = [];

    for (const part of parts) {
        const normalized = normalizeText(part);
        const key = normalized.toLowerCase();
        if (!normalized || seen.has(key)) continue;
        seen.add(key);
        uniqueParts.push(normalized);
    }

    return uniqueParts.join(separator);
}

function formatResourceContext(entry: CodexEntry, fallbackContext: string): string {
    const typeFact = entry.facts?.find((fact) => normalizeText(fact.label).toLowerCase() === "type");
    const resourceType = normalizeText(typeFact?.value);
    if (!resourceType) return fallbackContext;

    return /resource/i.test(resourceType) ? resourceType : `${resourceType} / Resource`;
}

function sectionItems(entry: CodexEntry, title: string): CodexMetadataSectionItem[] {
    return entry.sections?.find((section) => normalizeText(section.title).toLowerCase() === title.toLowerCase())
        ?.items ?? [];
}

function formatExtractorSummary(entry: CodexEntry, entriesByKey: Record<string, CodexEntry>): string {
    const extractors = sectionItems(entry, "Extractors")
        .map((item) => {
            const relatedEntry = resolveCodexReference(item.referenceKey, { entriesByKey });
            return relatedEntry ? stripCodexDescriptionLine(getCodexEntryLabel(relatedEntry)) : "";
        })
        .filter(Boolean);

    if (extractors.length === 0) return "";

    const [first, second, ...rest] = extractors;
    const visible = [first, second].filter(Boolean).join(", ");
    return rest.length > 0 ? `Extractors: ${visible}, +${rest.length}` : `Extractors: ${visible}`;
}

function hasReferenceTo(entry: CodexEntry, targetKey: string): boolean {
    return [
        ...(entry.publicContextKeys ?? []),
        ...(entry.referenceKeys ?? []),
        ...(entry.facts ?? []).map((fact) => fact.referenceKey),
    ].some((referenceKey) => normalizeText(referenceKey) === targetKey);
}

function formatEffectSourceSummary(entry: CodexEntry, allEntries: readonly CodexEntry[]): string {
    const source = allEntries.find((candidate) => (
        normalizeKind(candidate.exportKind) === "councilors" &&
        hasReferenceTo(candidate, entry.entryKey)
    ));

    return source ? `Source: ${getCodexEntryLabel(source)}` : "";
}

export function isShallowReferenceKind(kind: string | null | undefined): boolean {
    return SHALLOW_REFERENCE_KINDS.has(normalizeKind(kind));
}

export function getCodexShallowReferencePreview(
    entry: CodexEntry,
    allEntries: readonly CodexEntry[],
    fallbackContext: string,
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
        return {
            context: formatResourceContext(entry, fallbackContext),
            preview: joinUnique([
                getCodexReadablePreviewLine(entry) || fallbackPreview,
                formatExtractorSummary(entry, entriesByKey),
            ]),
        };
    }

    return {
        context: fallbackContext,
        preview: joinUnique([
            getCodexReadablePreviewLine(entry) || fallbackPreview,
            formatEffectSourceSummary(entry, allEntries),
        ]),
    };
}
