import { resolveCodexReference, type CodexReferenceIndexes } from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

export type QuestCodexReferenceSource = {
    displayText: string;
    referenceKind: string | null;
    referenceKey: string | null;
    referenceDisplayName: string | null;
    codexEntryKey: string | null;
    assetKind?: string | null;
    assetKey?: string | null;
    assetDisplayName?: string | null;
};

const QUEST_REFERENCE_KIND_TO_CODEX_EXPORT_KINDS: Record<string, string[]> = {
    action: ["actions"],
    actiontype: ["actions"],
    declaration: ["diplomatictreaties"],
    district: ["districts"],
    equipment: ["equipment"],
    empireaction: ["actions"],
    empireactiontype: ["actions"],
    faction: ["factions"],
    factionaction: ["actions"],
    factionactiontype: ["actions"],
    factiontrait: ["traits"],
    diplomatictreaty: ["diplomatictreaties"],
    diplomatictreaties: ["diplomatictreaties"],
    hero: ["heroes", "units"],
    herotrait: ["traits"],
    improvement: ["improvements"],
    minorfaction: ["minorfactions"],
    population: ["populations"],
    tech: ["tech"],
    technology: ["tech"],
    treaty: ["diplomatictreaties"],
    trait: ["traits"],
    unit: ["units"],
};

function cleanString(value: string | null | undefined): string {
    return value?.trim() ?? "";
}

function normalizeQuestReferenceKind(value: string | null | undefined): string {
    return cleanString(value).replace(/[\s_-]+/g, "").toLowerCase();
}

function resolveTypedQuestReference(
    kind: string | null | undefined,
    key: string | null | undefined,
    indexes: CodexReferenceIndexes
): CodexEntry | undefined {
    const referenceKey = cleanString(key);
    if (!referenceKey || !indexes.entriesByKindKey) return undefined;

    const exportKinds = QUEST_REFERENCE_KIND_TO_CODEX_EXPORT_KINDS[normalizeQuestReferenceKind(kind)] ?? [];
    for (const exportKind of exportKinds) {
        const entry = indexes.entriesByKindKey[exportKind]?.[referenceKey];
        if (entry) return entry;
    }

    return undefined;
}

export function resolveQuestCodexReference(
    source: QuestCodexReferenceSource,
    indexes: CodexReferenceIndexes
): CodexEntry | undefined {
    const directEntry = resolveCodexReference(source.codexEntryKey, indexes);
    if (directEntry) return directEntry;

    const referenceEntry = resolveTypedQuestReference(source.referenceKind, source.referenceKey, indexes);
    if (referenceEntry) return referenceEntry;

    return resolveTypedQuestReference(source.assetKind, source.assetKey, indexes);
}

export function codexEntryHref(entry: CodexEntry): string {
    return `/codex?entry=${encodeURIComponent(entry.entryKey)}`;
}
