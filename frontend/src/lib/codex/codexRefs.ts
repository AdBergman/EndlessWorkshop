import type { CodexEntry } from "@/types/dataTypes";

export function buildEntriesByKey(entries: readonly CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        const entryKey = (entry.entryKey ?? "").trim();
        if (entryKey) {
            acc[entryKey] = entry;
        }
        return acc;
    }, {});
}

export function resolveRelatedEntries(
    entry: CodexEntry | null | undefined,
    entriesByKey: Record<string, CodexEntry>
): CodexEntry[] {
    if (!entry) return [];

    const selfKey = (entry.entryKey ?? "").trim();
    if (!selfKey) return [];

    const seen = new Set<string>();
    const resolved: CodexEntry[] = [];

    for (const rawKey of entry.referenceKeys ?? []) {
        const referenceKey = (rawKey ?? "").trim();
        if (!referenceKey || referenceKey === selfKey || seen.has(referenceKey)) {
            continue;
        }

        const relatedEntry = entriesByKey[referenceKey];
        if (!relatedEntry) {
            continue;
        }

        seen.add(referenceKey);
        resolved.push(relatedEntry);
    }

    return resolved;
}
