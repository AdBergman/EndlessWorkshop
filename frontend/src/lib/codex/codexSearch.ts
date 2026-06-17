import type { CodexEntry } from "@/types/dataTypes";
import {
    formatCodexMajorFactionText,
    getCodexDescriptionPreviewText,
    getCodexEntryLabel,
} from "@/lib/codex/codexPresentation";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";

export const ALL_CODEX_KIND = "all";
const AUTOCOMPLETE_LIMIT = 8;

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
});

type CodexSearchDocument = {
    displayName: string;
    publicDisplayName: string;
    publicLabel: string;
    entryKey: string;
    publicEntryKey: string;
    exportKind: string;
    category: string;
    publicCategory: string;
    sourceKind: string;
    publicSourceKind: string;
    description: string;
    publicDescription: string;
    structuredMetadata: string;
};

const searchDocumentCache = new WeakMap<CodexEntry, CodexSearchDocument>();

function normalize(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function normalizedPublicText(value: string | null | undefined): string {
    return normalize(formatCodexMajorFactionText(value ?? ""));
}

function searchableDescription(entry: CodexEntry): string {
    return normalize(getCodexDescriptionPreviewText(entry.descriptionLines));
}

function searchableStructuredMetadata(entry: CodexEntry): string {
    const parsed = parseCodexStructuredDescription(entry);
    const values: string[] = [];

    parsed.facts.forEach((fact) => {
        values.push(fact.label, fact.value);
    });

    parsed.sections.forEach((section) => {
        values.push(section.label, ...section.lines);
        section.items?.forEach((item) => {
            values.push(item.label);
            if (item.referenceKey) values.push(item.referenceKey);
            item.lines.forEach((line) => values.push(line));
            item.facts.forEach((fact) => values.push(fact.label, fact.value));
        });
    });

    parsed.timeline.forEach((item) => {
        values.push(item.label, item.value);
    });

    parsed.bodyLines.forEach((line) => values.push(line));

    return normalize(values.join(" "));
}

function searchablePublicLabel(entry: Pick<CodexEntry, "displayName" | "entryKey">): string {
    return normalize(getCodexEntryLabel(entry));
}

function getSearchDocument(entry: CodexEntry): CodexSearchDocument {
    const cached = searchDocumentCache.get(entry);
    if (cached) return cached;

    const document = {
        displayName: normalize(entry.displayName),
        publicDisplayName: normalizedPublicText(entry.displayName),
        publicLabel: searchablePublicLabel(entry),
        entryKey: normalize(entry.entryKey),
        publicEntryKey: normalizedPublicText(entry.entryKey),
        exportKind: normalize(entry.exportKind),
        category: normalize(entry.category),
        publicCategory: normalizedPublicText(entry.category),
        sourceKind: normalize(entry.kind),
        publicSourceKind: normalizedPublicText(entry.kind),
        description: normalize(entry.descriptionLines.join(" ")),
        publicDescription: searchableDescription(entry),
        structuredMetadata: searchableStructuredMetadata(entry),
    };
    searchDocumentCache.set(entry, document);
    return document;
}

export function sortCodexEntries(entries: readonly CodexEntry[]): CodexEntry[] {
    return [...entries].sort((left, right) => {
        const nameComparison = collator.compare(left.displayName, right.displayName);
        if (nameComparison !== 0) return nameComparison;
        return collator.compare(left.entryKey, right.entryKey);
    });
}

export function entryMatchesQuery(entry: CodexEntry, query: string): boolean {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return true;
    const document = getSearchDocument(entry);

    return [
        document.displayName,
        document.entryKey,
        document.exportKind,
        document.category,
        document.sourceKind,
        document.description,
        document.structuredMetadata,
        document.publicLabel,
        document.publicDisplayName,
        document.publicEntryKey,
        document.publicCategory,
        document.publicSourceKind,
        document.publicDescription,
    ].some((value) => value.includes(normalizedQuery));
}

export function scoreCodexEntryMatch(entry: CodexEntry, query: string): number {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return 0;

    const document = getSearchDocument(entry);

    let score = -1;

    if (document.displayName === normalizedQuery) {
        score = Math.max(score, 1200);
    } else if (document.displayName.startsWith(normalizedQuery)) {
        score = Math.max(score, 960);
    } else if (document.displayName.includes(normalizedQuery)) {
        score = Math.max(score, 840);
    }

    if (document.publicLabel === normalizedQuery) {
        score = Math.max(score, 1180);
    } else if (document.publicLabel.startsWith(normalizedQuery)) {
        score = Math.max(score, 940);
    } else if (document.publicLabel.includes(normalizedQuery)) {
        score = Math.max(score, 820);
    }

    if (document.entryKey === normalizedQuery) {
        score = Math.max(score, 720);
    } else if (document.entryKey.startsWith(normalizedQuery)) {
        score = Math.max(score, 620);
    } else if (document.entryKey.includes(normalizedQuery)) {
        score = Math.max(score, 520);
    }

    if (
        document.description.includes(normalizedQuery) ||
        document.publicDescription.includes(normalizedQuery) ||
        document.structuredMetadata.includes(normalizedQuery)
    ) {
        score = Math.max(score, 320);
    }

    if (document.exportKind.includes(normalizedQuery)) {
        score = Math.max(score, 180);
    }

    if (
        document.category.includes(normalizedQuery) ||
        document.sourceKind.includes(normalizedQuery) ||
        document.publicCategory.includes(normalizedQuery) ||
        document.publicSourceKind.includes(normalizedQuery)
    ) {
        score = Math.max(score, 220);
    }

    if (score < 0) {
        return score;
    }

    const labelForBoost = document.publicLabel.includes(normalizedQuery) ? document.publicLabel : document.displayName;
    if (labelForBoost.includes(normalizedQuery)) {
        score += Math.max(0, 40 - labelForBoost.indexOf(normalizedQuery));
        score += Math.max(0, 24 - Math.min(labelForBoost.length, 24));
    }

    if (document.entryKey.includes(normalizedQuery)) {
        score += Math.max(0, 18 - document.entryKey.indexOf(normalizedQuery));
    }

    return score;
}

export function compareCodexEntryMatches(left: CodexEntry, right: CodexEntry, query: string): number {
    const scoreDelta = scoreCodexEntryMatch(right, query) - scoreCodexEntryMatch(left, query);
    if (scoreDelta !== 0) {
        return scoreDelta;
    }

    const nameComparison = collator.compare(left.displayName, right.displayName);
    if (nameComparison !== 0) {
        return nameComparison;
    }

    return collator.compare(left.entryKey, right.entryKey);
}

export function filterCodexEntries(
    entries: readonly CodexEntry[],
    opts: { query?: string; kind?: string | null } = {}
): CodexEntry[] {
    const normalizedKind = normalize(opts.kind);
    const normalizedQuery = normalize(opts.query);

    if (!normalizedQuery) {
        const filtered = entries.filter((entry) => {
            if (normalizedKind && normalizedKind !== ALL_CODEX_KIND && normalize(entry.exportKind) !== normalizedKind) {
                return false;
            }

            return true;
        });
        return sortCodexEntries(filtered);
    }

    const scored = entries.reduce<Array<{ entry: CodexEntry; score: number }>>((matches, entry) => {
        if (normalizedKind && normalizedKind !== ALL_CODEX_KIND && normalize(entry.exportKind) !== normalizedKind) {
            return matches;
        }

        const score = scoreCodexEntryMatch(entry, normalizedQuery);
        if (score >= 0) {
            matches.push({ entry, score });
        }

        return matches;
    }, []);

    return scored
        .sort((left, right) => {
            const scoreDelta = right.score - left.score;
            if (scoreDelta !== 0) {
                return scoreDelta;
            }

            const nameComparison = collator.compare(left.entry.displayName, right.entry.displayName);
            if (nameComparison !== 0) {
                return nameComparison;
            }

            return collator.compare(left.entry.entryKey, right.entry.entryKey);
        })
        .map(({ entry }) => entry);
}

export function getAutocompleteEntries(
    entries: readonly CodexEntry[],
    opts: { query?: string; kind?: string | null; limit?: number } = {}
): CodexEntry[] {
    const normalizedQuery = normalize(opts.query);
    if (!normalizedQuery) {
        return [];
    }

    return filterCodexEntries(entries, {
        query: normalizedQuery,
        kind: opts.kind,
    }).slice(0, opts.limit ?? AUTOCOMPLETE_LIMIT);
}
