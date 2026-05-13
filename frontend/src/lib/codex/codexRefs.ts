import {
    codexEntryEntityRef,
    parseCodexEntityKey,
    parseCodexEntityRef,
    parseEntityRefId,
    type EntityRef,
} from "@/lib/entityRef/entityRef";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexReference = string | EntityRef<"codex">;

export type CodexReferenceIndexes = {
    entriesByKey: Record<string, CodexEntry>;
    entriesByKindKey?: Record<string, Record<string, CodexEntry>>;
};

function normalizeEntryKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeExportKind(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function buildEntriesByKey(entries: readonly CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        const entryKey = normalizeEntryKey(entry.entryKey);
        if (entryKey) {
            acc[entryKey] = entry;
        }
        return acc;
    }, {});
}

export function buildEntriesByKindKey(entries: readonly CodexEntry[]): Record<string, Record<string, CodexEntry>> {
    return entries.reduce<Record<string, Record<string, CodexEntry>>>((acc, entry) => {
        const exportKind = normalizeExportKind(entry.exportKind);
        const entryKey = normalizeEntryKey(entry.entryKey);
        if (!exportKind || !entryKey) return acc;

        if (!acc[exportKind]) {
            acc[exportKind] = {};
        }

        acc[exportKind][entryKey] = entry;
        return acc;
    }, {});
}

function resolveCodexIdentity(
    identity: { exportKind: string; entryKey: string } | null,
    indexes: CodexReferenceIndexes
): CodexEntry | undefined {
    if (!identity || !indexes.entriesByKindKey) return undefined;

    return indexes.entriesByKindKey[identity.exportKind]?.[identity.entryKey];
}

export function resolveCodexReference(
    reference: CodexReference | null | undefined,
    indexes: CodexReferenceIndexes
): CodexEntry | undefined {
    if (!reference) return undefined;

    if (typeof reference !== "string") {
        return resolveCodexIdentity(parseCodexEntityRef(reference), indexes);
    }

    const referenceKey = normalizeEntryKey(reference);
    if (!referenceKey) return undefined;

    const parsedEntityRef = parseEntityRefId(referenceKey);
    if (parsedEntityRef?.kind === "codex") {
        const typedEntry = resolveCodexIdentity(parseCodexEntityRef(parsedEntityRef), indexes);
        if (typedEntry) return typedEntry;
    }

    const parsedCodexKey = parseCodexEntityKey(referenceKey);
    const typedEntry = resolveCodexIdentity(parsedCodexKey, indexes);
    if (typedEntry) return typedEntry;

    return indexes.entriesByKey[referenceKey];
}

export function resolveRelatedEntries(
    entry: CodexEntry | null | undefined,
    indexes: CodexReferenceIndexes
): CodexEntry[] {
    if (!entry) return [];

    const selfKey = normalizeEntryKey(entry.entryKey);
    if (!selfKey) return [];

    const seen = new Set<string>();
    const resolved: CodexEntry[] = [];

    for (const rawKey of entry.referenceKeys ?? []) {
        const referenceKey = normalizeEntryKey(rawKey);
        if (!referenceKey || referenceKey === selfKey) {
            continue;
        }

        const relatedEntry = resolveCodexReference(referenceKey, indexes);
        if (!relatedEntry) {
            continue;
        }

        const relatedEntryRef = codexEntryEntityRef(relatedEntry);
        const relatedIdentity = relatedEntryRef?.key ?? normalizeEntryKey(relatedEntry.entryKey);
        if (!relatedIdentity || seen.has(relatedIdentity)) {
            continue;
        }

        if (
            normalizeExportKind(relatedEntry.exportKind) === normalizeExportKind(entry.exportKind) &&
            normalizeEntryKey(relatedEntry.entryKey) === selfKey
        ) {
            continue;
        }

        seen.add(relatedIdentity);
        resolved.push(relatedEntry);
    }

    return resolved;
}
