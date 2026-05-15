import type { CodexEntry } from "@/types/dataTypes";

export const ALL_CODEX_KIND = "all";
const AUTOCOMPLETE_LIMIT = 8;

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
});

function normalize(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
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

    return [
        entry.displayName,
        entry.entryKey,
        entry.exportKind,
        entry.category ?? "",
        entry.kind ?? "",
        entry.descriptionLines.join(" "),
    ].some((value) => normalize(value).includes(normalizedQuery));
}

export function scoreCodexEntryMatch(entry: CodexEntry, query: string): number {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return 0;

    const displayName = normalize(entry.displayName);
    const entryKey = normalize(entry.entryKey);
    const description = normalize(entry.descriptionLines.join(" "));
    const exportKind = normalize(entry.exportKind);
    const category = normalize(entry.category);
    const sourceKind = normalize(entry.kind);

    let score = -1;

    if (displayName === normalizedQuery) {
        score = Math.max(score, 1200);
    } else if (displayName.startsWith(normalizedQuery)) {
        score = Math.max(score, 960);
    } else if (displayName.includes(normalizedQuery)) {
        score = Math.max(score, 840);
    }

    if (entryKey === normalizedQuery) {
        score = Math.max(score, 720);
    } else if (entryKey.startsWith(normalizedQuery)) {
        score = Math.max(score, 620);
    } else if (entryKey.includes(normalizedQuery)) {
        score = Math.max(score, 520);
    }

    if (description.includes(normalizedQuery)) {
        score = Math.max(score, 320);
    }

    if (exportKind.includes(normalizedQuery)) {
        score = Math.max(score, 180);
    }

    if (category.includes(normalizedQuery) || sourceKind.includes(normalizedQuery)) {
        score = Math.max(score, 220);
    }

    if (score < 0) {
        return score;
    }

    if (displayName.includes(normalizedQuery)) {
        score += Math.max(0, 40 - displayName.indexOf(normalizedQuery));
        score += Math.max(0, 24 - Math.min(displayName.length, 24));
    }

    if (entryKey.includes(normalizedQuery)) {
        score += Math.max(0, 18 - entryKey.indexOf(normalizedQuery));
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

    const filtered = entries.filter((entry) => {
        if (normalizedKind && normalizedKind !== ALL_CODEX_KIND && entry.exportKind !== normalizedKind) {
            return false;
        }

        return entryMatchesQuery(entry, normalizedQuery);
    });

    if (!normalizedQuery) {
        return sortCodexEntries(filtered);
    }

    return [...filtered].sort((left, right) => compareCodexEntryMatches(left, right, normalizedQuery));
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
