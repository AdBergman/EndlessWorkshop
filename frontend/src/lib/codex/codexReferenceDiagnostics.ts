import {
    isEntityKind,
    parseCodexEntityKey,
    parseCodexEntityRef,
    parseEntityRefId,
    type CodexIdentity,
    type EntityKind,
    type EntityRef,
} from "@/lib/entityRef/entityRef";
import type { CodexEntry } from "@/types/dataTypes";
import { type CodexReferenceIndexes, resolveCodexReference } from "./codexRefs";

export type ImportedDomainKind = Exclude<EntityKind, "codex">;

export type CodexReferenceDiagnosticKind =
    | "resolved-typed-ref"
    | "raw-fallback-ref"
    | "unresolved-ref"
    | "unresolved-imported-domain-ref"
    | "malformed-ref";

export type CodexReferenceDiagnosticReason =
    | "empty-reference"
    | "invalid-reference-shape"
    | "invalid-entity-kind"
    | "malformed-entity-ref-id"
    | "malformed-codex-ref";

export type CodexReferenceDiagnostic = {
    kind: CodexReferenceDiagnosticKind;
    raw: string;
    index?: number;
    resolvedEntry?: CodexEntry;
    identity?: CodexIdentity;
    importedKindHint?: ImportedDomainKind;
    reason?: CodexReferenceDiagnosticReason;
    usedRawFallback?: boolean;
    isAmbiguousRawKey?: boolean;
    rawMatchedKinds?: string[];
    isDuplicate?: boolean;
    duplicateOfIndex?: number;
};

const IMPORTED_DOMAIN_PREFIX_HINTS: Array<[RegExp, ImportedDomainKind]> = [
    [/^tech[_:]/i, "tech"],
    [/^unit[_:]/i, "unit"],
    [/^district[_:]/i, "district"],
    [/^improvement[_:]/i, "improvement"],
    [/^(ability|unitability)[_:]/i, "ability"],
    [/^hero[_:]/i, "hero"],
    [/^(population|populationcategory)[_:]/i, "population"],
];

function normalizeReferenceKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isEntityRefLike(value: unknown): value is { kind?: unknown; key?: unknown } {
    return Boolean(value && typeof value === "object" && ("kind" in value || "key" in value));
}

function stringifyReference(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (isEntityRefLike(value)) return `${String(value.kind)}:${String(value.key)}`;
    return "";
}

function inferImportedDomainKind(referenceKey: string): ImportedDomainKind | undefined {
    return IMPORTED_DOMAIN_PREFIX_HINTS.find(([pattern]) => pattern.test(referenceKey))?.[1];
}

function getEntityRefKindPrefix(referenceKey: string): EntityKind | null {
    const separatorIndex = referenceKey.indexOf(":");
    if (separatorIndex <= 0) return null;

    const rawKind = referenceKey.slice(0, separatorIndex);
    return isEntityKind(rawKind) ? rawKind : null;
}

function getRawMatchedKinds(referenceKey: string, indexes: CodexReferenceIndexes): string[] {
    if (!indexes.entriesByKindKey) return [];

    return Object.entries(indexes.entriesByKindKey)
        .filter(([, entriesByKey]) => Boolean(entriesByKey[referenceKey]))
        .map(([kind]) => kind)
        .sort((left, right) => left.localeCompare(right));
}

function withRawFallbackMetadata(
    diagnostic: CodexReferenceDiagnostic,
    referenceKey: string,
    indexes: CodexReferenceIndexes
): CodexReferenceDiagnostic {
    const rawMatchedKinds = getRawMatchedKinds(referenceKey, indexes);
    if (rawMatchedKinds.length === 0) return diagnostic;

    return {
        ...diagnostic,
        isAmbiguousRawKey: rawMatchedKinds.length > 1,
        rawMatchedKinds,
    };
}

function getResolvedIdentity(entry: CodexEntry | undefined): string {
    if (!entry) return "";
    return `${entry.exportKind.trim().toLowerCase()}:${entry.entryKey.trim()}`;
}

function diagnoseEntityRefLike(
    reference: { kind?: unknown; key?: unknown },
    indexes: CodexReferenceIndexes
): CodexReferenceDiagnostic {
    const raw = stringifyReference(reference);
    const kind = reference.kind;

    if (typeof kind !== "string" || !isEntityKind(kind)) {
        return {
            kind: "malformed-ref",
            raw,
            reason: "invalid-entity-kind",
        };
    }

    if (kind !== "codex") {
        return {
            kind: "unresolved-imported-domain-ref",
            raw,
            importedKindHint: kind,
        };
    }

    if (typeof reference.key !== "string" || reference.key.trim().length === 0) {
        return {
            kind: "malformed-ref",
            raw,
            reason: "malformed-codex-ref",
        };
    }

    const codexRef = reference as EntityRef<"codex">;
    const identity = parseCodexEntityRef(codexRef);
    if (!identity) {
        return {
            kind: "malformed-ref",
            raw,
            reason: "malformed-codex-ref",
        };
    }

    const resolvedEntry = resolveCodexReference(codexRef, indexes);
    if (resolvedEntry) {
        return {
            kind: "resolved-typed-ref",
            raw,
            identity,
            resolvedEntry,
        };
    }

    return {
        kind: "unresolved-ref",
        raw,
        identity,
    };
}

export function diagnoseCodexReference(
    reference: unknown,
    indexes: CodexReferenceIndexes,
    index?: number
): CodexReferenceDiagnostic {
    if (isEntityRefLike(reference)) {
        return {
            ...diagnoseEntityRefLike(reference, indexes),
            index,
        };
    }

    if (typeof reference !== "string") {
        return {
            kind: "malformed-ref",
            raw: stringifyReference(reference),
            index,
            reason: "invalid-reference-shape",
        };
    }

    const referenceKey = normalizeReferenceKey(reference);
    if (!referenceKey) {
        return {
            kind: "malformed-ref",
            raw: referenceKey,
            index,
            reason: "empty-reference",
        };
    }

    const entityKindPrefix = getEntityRefKindPrefix(referenceKey);
    const parsedEntityRef = parseEntityRefId(referenceKey);
    if (entityKindPrefix && !parsedEntityRef) {
        const resolvedEntry = indexes.entriesByKey[referenceKey];
        return withRawFallbackMetadata(
            {
                kind: "malformed-ref",
                raw: referenceKey,
                index,
                resolvedEntry,
                usedRawFallback: Boolean(resolvedEntry),
                reason: "malformed-entity-ref-id",
            },
            referenceKey,
            indexes
        );
    }

    if (parsedEntityRef) {
        if (parsedEntityRef.kind === "codex") {
            const codexRef = parsedEntityRef as EntityRef<"codex">;
            const identity = parseCodexEntityRef(codexRef);
            const resolvedEntry = resolveCodexReference(codexRef, indexes);

            return resolvedEntry
                ? { kind: "resolved-typed-ref", raw: referenceKey, index, identity: identity ?? undefined, resolvedEntry }
                : { kind: "unresolved-ref", raw: referenceKey, index, identity: identity ?? undefined };
        }

        return {
            kind: "unresolved-imported-domain-ref",
            raw: referenceKey,
            index,
            importedKindHint: parsedEntityRef.kind,
        };
    }

    const parsedCodexKey = parseCodexEntityKey(referenceKey);
    if (parsedCodexKey) {
        const resolvedEntry = resolveCodexReference(referenceKey, indexes);
        if (resolvedEntry) {
            return {
                kind: "resolved-typed-ref",
                raw: referenceKey,
                index,
                identity: parsedCodexKey,
                resolvedEntry,
            };
        }
    }

    const resolvedEntry = indexes.entriesByKey[referenceKey];
    if (resolvedEntry) {
        return withRawFallbackMetadata(
            {
                kind: "raw-fallback-ref",
                raw: referenceKey,
                index,
                resolvedEntry,
                usedRawFallback: true,
            },
            referenceKey,
            indexes
        );
    }

    const importedKindHint = inferImportedDomainKind(referenceKey);
    if (importedKindHint) {
        return {
            kind: "unresolved-imported-domain-ref",
            raw: referenceKey,
            index,
            importedKindHint,
        };
    }

    return {
        kind: "unresolved-ref",
        raw: referenceKey,
        index,
        identity: parsedCodexKey ?? undefined,
    };
}

export function diagnoseCodexRelatedReferences(
    entry: Pick<CodexEntry, "referenceKeys"> | null | undefined,
    indexes: CodexReferenceIndexes
): CodexReferenceDiagnostic[] {
    if (!entry) return [];

    const firstSeenByIdentity = new Map<string, number>();

    return (entry.referenceKeys ?? []).map((reference, index) => {
        const diagnostic = diagnoseCodexReference(reference, indexes, index);
        const identity = getResolvedIdentity(diagnostic.resolvedEntry) || diagnostic.raw;
        const duplicateOfIndex = firstSeenByIdentity.get(identity);

        if (duplicateOfIndex !== undefined) {
            return {
                ...diagnostic,
                isDuplicate: true,
                duplicateOfIndex,
            };
        }

        firstSeenByIdentity.set(identity, index);
        return diagnostic;
    });
}
