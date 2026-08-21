import {
    codexEntryEntityRef,
    parseCodexEntityKey,
    parseCodexEntityRef,
    parseEntityRefId,
    type EntityRef,
} from "../entityRef/entityRef.ts";
import type { CodexEntry, CodexIdentityRecord } from "../../types/dataTypes.ts";

export type CodexReference = string | EntityRef<"codex">;

export type CodexReferenceIndexes = {
    entriesByKey: Record<string, CodexEntry>;
    entriesByKindKey?: Record<string, Record<string, CodexEntry>>;
};

export type CodexIdentityIndexes = {
    identitiesByKey: Record<string, CodexIdentityRecord>;
    identitiesByKindKey: Record<string, Record<string, CodexIdentityRecord>>;
};

export type CodexIdentityIndexState = CodexIdentityIndexes & {
    ambiguousIdentityKeys: Record<string, true>;
};

export type CodexRelatedTarget = {
    identity: CodexIdentityRecord;
    entry?: CodexEntry;
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

export function buildCodexIdentityIndexes(identities: readonly CodexIdentityRecord[]): CodexIdentityIndexState {
    const identitiesByKindKey: Record<string, Record<string, CodexIdentityRecord>> = {};
    const identitiesByKey: Record<string, CodexIdentityRecord> = {};
    const ambiguousIdentityKeys: Record<string, true> = {};

    for (const identity of identities) {
        const routeKind = normalizeExportKind(identity.routeKind);
        const entryKey = normalizeEntryKey(identity.entryKey);
        if (!routeKind || !entryKey) continue;

        const normalizedIdentity = {
            entryKey,
            displayName: identity.displayName,
            routeKind,
        };
        (identitiesByKindKey[routeKind] ??= {})[entryKey] = normalizedIdentity;

        if (ambiguousIdentityKeys[entryKey]) continue;
        const existing = identitiesByKey[entryKey];
        if (!existing) {
            identitiesByKey[entryKey] = normalizedIdentity;
        } else if (existing.routeKind !== routeKind) {
            delete identitiesByKey[entryKey];
            ambiguousIdentityKeys[entryKey] = true;
        }
    }

    return { identitiesByKey, identitiesByKindKey, ambiguousIdentityKeys };
}

export function codexIdentityFromEntry(entry: Pick<CodexEntry, "entryKey" | "displayName" | "exportKind">): CodexIdentityRecord {
    return {
        entryKey: normalizeEntryKey(entry.entryKey),
        displayName: entry.displayName,
        routeKind: normalizeExportKind(entry.exportKind),
    };
}

function resolveCodexEntryIdentity(
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
        return resolveCodexEntryIdentity(parseCodexEntityRef(reference), indexes);
    }

    const referenceKey = normalizeEntryKey(reference);
    if (!referenceKey) return undefined;

    const parsedEntityRef = parseEntityRefId(referenceKey);
    if (parsedEntityRef?.kind === "codex") {
        const typedEntry = resolveCodexEntryIdentity(parseCodexEntityRef(parsedEntityRef), indexes);
        if (typedEntry) return typedEntry;
    }

    const parsedCodexKey = parseCodexEntityKey(referenceKey);
    const typedEntry = resolveCodexEntryIdentity(parsedCodexKey, indexes);
    if (typedEntry) return typedEntry;

    return indexes.entriesByKey[referenceKey];
}

function resolveIdentityByTypedKey(
    identity: { exportKind: string; entryKey: string } | null,
    indexes: CodexIdentityIndexes
): CodexIdentityRecord | undefined {
    if (!identity) return undefined;
    return indexes.identitiesByKindKey[identity.exportKind]?.[identity.entryKey];
}

export function resolveCodexIdentity(
    reference: CodexReference | null | undefined,
    indexes: CodexIdentityIndexes
): CodexIdentityRecord | undefined {
    if (!reference) return undefined;

    if (typeof reference !== "string") {
        return resolveIdentityByTypedKey(parseCodexEntityRef(reference), indexes);
    }

    const referenceKey = normalizeEntryKey(reference);
    if (!referenceKey) return undefined;

    const parsedEntityRef = parseEntityRefId(referenceKey);
    if (parsedEntityRef?.kind === "codex") {
        const typedIdentity = resolveIdentityByTypedKey(parseCodexEntityRef(parsedEntityRef), indexes);
        if (typedIdentity) return typedIdentity;
    }

    const typedIdentity = resolveIdentityByTypedKey(parseCodexEntityKey(referenceKey), indexes);
    if (typedIdentity) return typedIdentity;

    return indexes.identitiesByKey[referenceKey];
}

export function isAmbiguousCodexIdentityKey(
    entryKey: string,
    indexes: CodexIdentityIndexes
): boolean {
    const normalizedKey = normalizeEntryKey(entryKey);
    if (!normalizedKey) return false;

    let matches = 0;
    for (const identitiesByKey of Object.values(indexes.identitiesByKindKey)) {
        if (identitiesByKey[normalizedKey]) {
            matches += 1;
            if (matches > 1) return true;
        }
    }
    return false;
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

    const relationshipKeys = [
        ...(entry.publicContextKeys ?? []),
        ...(entry.referenceKeys ?? []),
    ];

    for (const rawKey of relationshipKeys) {
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

export function resolveRelatedCodexTargets(
    entry: CodexEntry | null | undefined,
    entryIndexes: CodexReferenceIndexes,
    identityIndexes: CodexIdentityIndexes
): CodexRelatedTarget[] {
    if (!entry) return [];

    const selfKey = normalizeEntryKey(entry.entryKey);
    const selfKind = normalizeExportKind(entry.exportKind);
    const seen = new Set<string>();
    const targets: CodexRelatedTarget[] = [];

    for (const reference of [...(entry.publicContextKeys ?? []), ...(entry.referenceKeys ?? [])]) {
        const fullEntry = resolveCodexReference(reference, entryIndexes);
        const identity = resolveCodexIdentity(reference, identityIndexes) ?? (
            fullEntry && !isAmbiguousCodexIdentityKey(fullEntry.entryKey, identityIndexes)
                ? codexIdentityFromEntry(fullEntry)
                : undefined
        );
        if (!identity) continue;

        if (identity.entryKey === selfKey && identity.routeKind === selfKind) continue;
        const targetKey = `${identity.routeKind}:${identity.entryKey}`;
        if (seen.has(targetKey)) continue;

        seen.add(targetKey);
        targets.push({ identity, entry: fullEntry });
    }

    return targets;
}
