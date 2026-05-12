export const ENTITY_KINDS = [
    "tech",
    "unit",
    "district",
    "improvement",
    "codex",
    "ability",
    "hero",
    "population",
] as const;

export type EntityKind = (typeof ENTITY_KINDS)[number];

export type EntityRef<K extends EntityKind = EntityKind> = {
    kind: K;
    key: string;
};

export type RawEntityRef = {
    kind?: unknown;
    key?: unknown;
};

export type CodexIdentity = {
    exportKind: string;
    entryKey: string;
};

const ENTITY_KIND_SET = new Set<string>(ENTITY_KINDS);
const ENTITY_REF_SEPARATOR = ":";
const CODEX_KEY_SEPARATOR = ":";

function cleanKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeExportKind(value: unknown): string {
    return cleanKey(value).toLowerCase();
}

function encodePart(value: string): string {
    return encodeURIComponent(value);
}

function decodePart(value: string): string | null {
    try {
        return decodeURIComponent(value);
    } catch {
        return null;
    }
}

export function isEntityKind(value: unknown): value is EntityKind {
    return typeof value === "string" && ENTITY_KIND_SET.has(value);
}

export function normalizeEntityRef(ref: RawEntityRef | null | undefined): EntityRef | null {
    if (!ref || !isEntityKind(ref.kind)) return null;

    const key = cleanKey(ref.key);
    if (!key) return null;

    return {
        kind: ref.kind,
        key,
    };
}

export function entityRefId(ref: EntityRef): string {
    return `${ref.kind}${ENTITY_REF_SEPARATOR}${encodePart(ref.key)}`;
}

export function parseEntityRefId(id: string): EntityRef | null {
    const separatorIndex = id.indexOf(ENTITY_REF_SEPARATOR);
    if (separatorIndex <= 0) return null;

    const rawKind = id.slice(0, separatorIndex);
    if (!isEntityKind(rawKind)) return null;

    const decodedKey = decodePart(id.slice(separatorIndex + 1));
    const key = cleanKey(decodedKey);
    if (!key) return null;

    return {
        kind: rawKind,
        key,
    };
}

export function codexEntityKey(exportKind: string, entryKey: string): string | null {
    const normalizedExportKind = normalizeExportKind(exportKind);
    const normalizedEntryKey = cleanKey(entryKey);

    if (!normalizedExportKind || !normalizedEntryKey) return null;

    return `${encodePart(normalizedExportKind)}${CODEX_KEY_SEPARATOR}${encodePart(normalizedEntryKey)}`;
}

export function parseCodexEntityKey(key: string): CodexIdentity | null {
    const separatorIndex = key.indexOf(CODEX_KEY_SEPARATOR);
    if (separatorIndex <= 0) return null;

    const exportKind = decodePart(key.slice(0, separatorIndex));
    const entryKey = decodePart(key.slice(separatorIndex + 1));

    const normalizedExportKind = normalizeExportKind(exportKind);
    const normalizedEntryKey = cleanKey(entryKey);

    if (!normalizedExportKind || !normalizedEntryKey) return null;

    return {
        exportKind: normalizedExportKind,
        entryKey: normalizedEntryKey,
    };
}

export function codexEntityRef(exportKind: string, entryKey: string): EntityRef<"codex"> | null {
    const key = codexEntityKey(exportKind, entryKey);
    if (!key) return null;

    return {
        kind: "codex",
        key,
    };
}

export function parseCodexEntityRef(ref: EntityRef): CodexIdentity | null {
    if (ref.kind !== "codex") return null;
    return parseCodexEntityKey(ref.key);
}

export function techEntityRef(tech: Pick<{ techKey: string }, "techKey">): EntityRef<"tech"> | null {
    return normalizeEntityRef({ kind: "tech", key: tech.techKey }) as EntityRef<"tech"> | null;
}

export function unitEntityRef(unit: Pick<{ unitKey: string }, "unitKey">): EntityRef<"unit"> | null {
    return normalizeEntityRef({ kind: "unit", key: unit.unitKey }) as EntityRef<"unit"> | null;
}

export function districtEntityRef(
    district: Pick<{ districtKey: string }, "districtKey">
): EntityRef<"district"> | null {
    return normalizeEntityRef({ kind: "district", key: district.districtKey }) as EntityRef<"district"> | null;
}

export function improvementEntityRef(
    improvement: Pick<{ improvementKey: string }, "improvementKey">
): EntityRef<"improvement"> | null {
    return normalizeEntityRef({
        kind: "improvement",
        key: improvement.improvementKey,
    }) as EntityRef<"improvement"> | null;
}

export function abilityEntityRef(abilityKey: string): EntityRef<"ability"> | null {
    return normalizeEntityRef({ kind: "ability", key: abilityKey }) as EntityRef<"ability"> | null;
}

export function heroEntityRef(heroKey: string): EntityRef<"hero"> | null {
    return normalizeEntityRef({ kind: "hero", key: heroKey }) as EntityRef<"hero"> | null;
}

export function populationEntityRef(populationKey: string): EntityRef<"population"> | null {
    return normalizeEntityRef({ kind: "population", key: populationKey }) as EntityRef<"population"> | null;
}
