import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, Unit } from "@/types/dataTypes";

type UnitRichEvolutionSource = Pick<
    Unit,
    "unitKey" | "previousUnitKey" | "nextEvolutionUnitKeys"
>;

export type CodexUnitEvolutionLink = {
    entry: CodexEntry;
    label: string;
};

export type CodexUnitRichEnrichment = {
    previousUnit: CodexUnitEvolutionLink | null;
    evolvesInto: CodexUnitEvolutionLink[];
};

const EMPTY_UNIT_RICH_ENRICHMENT: CodexUnitRichEnrichment = {
    previousUnit: null,
    evolvesInto: [],
};

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isUnitEntry(entry: CodexEntry): boolean {
    return entry.exportKind.trim().toLowerCase() === "units";
}

function buildPublicCodexUnitIndex(entries: readonly CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        if (!isUnitEntry(entry)) return acc;

        const entryKey = normalizeKey(entry.entryKey);
        if (entryKey) acc[entryKey] = entry;

        return acc;
    }, {});
}

function resolveUnitLink(
    key: string,
    publicCodexUnitByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexUnitEvolutionLink | null {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey || normalizedKey === currentEntryKey) return null;

    const entry = publicCodexUnitByKey[normalizedKey];
    if (!entry) return null;

    return {
        entry,
        label: getCodexEntryLabel(entry),
    };
}

function resolveUnitLinks(
    keys: readonly string[],
    publicCodexUnitByKey: Record<string, CodexEntry>,
    currentEntryKey: string
): CodexUnitEvolutionLink[] {
    const links: CodexUnitEvolutionLink[] = [];
    const seen = new Set<string>();

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || key === currentEntryKey || seen.has(key)) continue;

        const link = resolveUnitLink(key, publicCodexUnitByKey, currentEntryKey);
        if (!link) continue;

        seen.add(key);
        links.push(link);
    }

    return links;
}

export function buildCodexUnitRichEnrichment(
    entry: CodexEntry,
    richUnitByKey: Readonly<Record<string, UnitRichEvolutionSource | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexUnitRichEnrichment {
    if (!isUnitEntry(entry)) return EMPTY_UNIT_RICH_ENRICHMENT;

    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_UNIT_RICH_ENRICHMENT;

    const richUnit = richUnitByKey[currentEntryKey];
    if (!richUnit) return EMPTY_UNIT_RICH_ENRICHMENT;

    const publicCodexUnitByKey = buildPublicCodexUnitIndex(allEntries);
    const previousUnit = richUnit.previousUnitKey
        ? resolveUnitLink(richUnit.previousUnitKey, publicCodexUnitByKey, currentEntryKey)
        : null;
    const evolvesInto = resolveUnitLinks(
        richUnit.nextEvolutionUnitKeys ?? [],
        publicCodexUnitByKey,
        currentEntryKey
    );

    return {
        previousUnit,
        evolvesInto,
    };
}

export function hasCodexUnitRichEnrichment(enrichment: CodexUnitRichEnrichment): boolean {
    return enrichment.previousUnit !== null || enrichment.evolvesInto.length > 0;
}
