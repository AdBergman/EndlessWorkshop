import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveCodexReference,
    type CodexReferenceIndexes,
} from "@/lib/codex/codexRefs";
import { codexEntryEntityRef } from "@/lib/entityRef/entityRef";
import type { CodexEntry } from "@/types/dataTypes";

const STATUS_SOURCE_KINDS = new Set([
    "abilities",
    "diplomatictreaties",
    "actions",
    "factions",
]);

function normalizeKind(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isSameCodexEntry(left: CodexEntry, right: CodexEntry): boolean {
    return normalizeKind(left.exportKind) === normalizeKind(right.exportKind) &&
        normalizeKey(left.entryKey) === normalizeKey(right.entryKey);
}

function hasExactReferenceToStatus(candidate: CodexEntry, status: CodexEntry, indexes: CodexReferenceIndexes): boolean {
    const relationshipKeys = [
        ...(candidate.publicContextKeys ?? []),
        ...(candidate.referenceKeys ?? []),
    ];

    return relationshipKeys.some((referenceKey) => {
        const resolvedEntry = resolveCodexReference(referenceKey, indexes);
        return resolvedEntry ? isSameCodexEntry(resolvedEntry, status) : false;
    });
}

export function buildStatusRelationshipSourceEntries(
    status: CodexEntry | null | undefined,
    entries: readonly CodexEntry[]
): CodexEntry[] {
    if (!status || normalizeKind(status.exportKind) !== "statuses") {
        return [];
    }

    const indexes = {
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
    };
    const seen = new Set<string>();
    const sources: CodexEntry[] = [];

    for (const entry of entries) {
        const kind = normalizeKind(entry.exportKind);
        if (!STATUS_SOURCE_KINDS.has(kind)) continue;
        if (isSameCodexEntry(entry, status)) continue;
        if (!hasExactReferenceToStatus(entry, status, indexes)) continue;

        const entryRef = codexEntryEntityRef(entry);
        const identity = entryRef?.key ?? normalizeKey(entry.entryKey);
        if (!identity || seen.has(identity)) continue;

        seen.add(identity);
        sources.push(entry);
    }

    return sources;
}
