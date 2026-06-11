import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { maybePublishCodexTokenAudit } from "@/lib/codex/codexTokenAudit";
import { buildEntriesByKey, buildEntriesByKindKey, resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { filterCodexEntries } from "@/lib/codex/codexSearch";
import { isValidDisplayName } from "@/lib/codex/codexValidation";
import type { CodexEntry, CodexMetadataFact, CodexMetadataSection, CodexMetadataSectionItem } from "@/types/dataTypes";

type Store = {
    entries: CodexEntry[];
    entriesByKey: Record<string, CodexEntry>;
    entriesByKind: Record<string, CodexEntry[]>;
    entriesByKindKey: Record<string, Record<string, CodexEntry>>;
    loading: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadEntries: (opts?: { force?: boolean }) => Promise<void>;
    reset: () => void;

    getEntry: (exportKind: string, entryKey: string) => CodexEntry | undefined;
    getEntryByKey: (key: string) => CodexEntry | undefined;
    getEntriesByKind: (kind: string) => CodexEntry[];
    getRelatedEntries: (entry: CodexEntry) => CodexEntry[];
    searchEntries: (query: string, kind?: string) => CodexEntry[];
};

let inflightLoad: Promise<void> | null = null;

function cleanStrings(values: unknown): string[] {
    return Array.isArray(values)
        ? values.filter((value): value is string => typeof value === "string")
        : [];
}

function cleanFact(fact: CodexMetadataFact | null | undefined): CodexMetadataFact | null {
    if (!fact || typeof fact.label !== "string" || typeof fact.value !== "string") return null;

    const label = fact.label.trim();
    const value = fact.value.trim();
    if (!label || !value) return null;

    return {
        label,
        value,
        referenceKey: typeof fact.referenceKey === "string" ? fact.referenceKey.trim() || null : null,
    };
}

function cleanFacts(values: unknown): CodexMetadataFact[] {
    return Array.isArray(values)
        ? values
            .map((value) => cleanFact(value as CodexMetadataFact))
            .filter((value): value is CodexMetadataFact => value !== null)
        : [];
}

function cleanSectionItem(item: CodexMetadataSectionItem | null | undefined): CodexMetadataSectionItem | null {
    if (!item || typeof item.label !== "string") return null;

    const label = item.label.trim();
    if (!label) return null;

    const facts = cleanFacts(item.facts);
    const lines = cleanStrings(item.lines);
    if (facts.length === 0 && lines.length === 0) return null;

    return { label, facts, lines };
}

function cleanSections(values: unknown): CodexMetadataSection[] {
    if (!Array.isArray(values)) return [];

    return values
        .map((section): CodexMetadataSection | null => {
            const candidate = section as CodexMetadataSection;
            if (!candidate || typeof candidate.title !== "string") return null;

            const title = candidate.title.trim();
            if (!title) return null;

            const lines = cleanStrings(candidate.lines);
            const items = Array.isArray(candidate.items)
                ? candidate.items
                    .map((item) => cleanSectionItem(item))
                    .filter((item): item is CodexMetadataSectionItem => item !== null)
                : [];

            if (lines.length === 0 && items.length === 0) return null;
            return { title, lines, items };
        })
        .filter((section): section is CodexMetadataSection => section !== null);
}

function isBonusStatusEntry(entry: CodexEntry): boolean {
    const category = (entry.category ?? "").trim().toLowerCase();
    const kind = (entry.kind ?? "").trim().toLowerCase();
    const key = (entry.entryKey ?? "").trim();
    return category === "status" ||
        kind === "status" ||
        key.startsWith("Status_") ||
        key.startsWith("HeroStatus_") ||
        key.startsWith("TreatyPublicOpinion_");
}

function isBonusModifierEntry(entry: CodexEntry): boolean {
    const category = (entry.category ?? "").trim().toLowerCase();
    const kind = (entry.kind ?? "").trim().toLowerCase();
    const key = (entry.entryKey ?? "").trim();
    return category === "cost modifier" ||
        kind === "cost modifier" ||
        key.includes("CostModifier") ||
        key.includes("CostModifer");
}

function normalizeBonusDerivedKind(entry: CodexEntry): string {
    const exportKind = (entry.exportKind ?? "").trim().toLowerCase();
    if (exportKind !== "bonuses") return exportKind;

    if (isBonusStatusEntry(entry)) return "statuses";
    if (isBonusModifierEntry(entry)) return "modifiers";
    return exportKind;
}

function normalizeEntry(entry: CodexEntry): CodexEntry {
    return {
        exportKind: normalizeBonusDerivedKind(entry),
        entryKey: (entry.entryKey ?? "").trim(),
        displayName: entry.displayName ?? "",
        category: typeof entry.category === "string" ? entry.category.trim() || null : null,
        kind: typeof entry.kind === "string" ? entry.kind.trim() || null : null,
        descriptionLines: cleanStrings(entry.descriptionLines),
        referenceKeys: cleanStrings(entry.referenceKeys),
        facts: cleanFacts(entry.facts),
        sections: cleanSections(entry.sections),
        publicContextKeys: cleanStrings(entry.publicContextKeys),
    };
}

function buildEntriesByKind(entries: CodexEntry[]): Record<string, CodexEntry[]> {
    return entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
        if (!entry.exportKind) return acc;

        if (!acc[entry.exportKind]) {
            acc[entry.exportKind] = [];
        }

        acc[entry.exportKind].push(entry);
        return acc;
    }, {});
}

export const useCodexStore = create<Store>((set, get) => ({
    entries: [],
    entriesByKey: {},
    entriesByKind: {},
    entriesByKindKey: {},
    loading: false,
    error: null,
    lastLoadedAt: undefined,

    loadEntries: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) {
            return inflightLoad;
        }

        if (!force && state.entries.length > 0) {
            return;
        }

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const rawEntries = await apiClient.getCodex();
                const entries = rawEntries
                    .map(normalizeEntry)
                    .filter((entry) => entry.entryKey.length > 0)
                    .filter((entry) => isValidDisplayName(entry.displayName));

                set({
                    entries,
                    entriesByKey: buildEntriesByKey(entries),
                    entriesByKind: buildEntriesByKind(entries),
                    entriesByKindKey: buildEntriesByKindKey(entries),
                    loading: false,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });

                maybePublishCodexTokenAudit(rawEntries);
            } catch (err) {
                console.error("Failed to load codex:", err);
                set({
                    loading: false,
                    error: (err as Error)?.message ?? "Failed to load codex.",
                });
            } finally {
                inflightLoad = null;
            }
        })();

        return inflightLoad;
    },

    reset: () => {
        inflightLoad = null;
        set({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            loading: false,
            error: null,
            lastLoadedAt: undefined,
        });
    },

    getEntry: (exportKind, entryKey) => {
        const normalizedKind = (exportKind ?? "").trim().toLowerCase();
        const normalizedKey = (entryKey ?? "").trim();
        if (!normalizedKind || !normalizedKey) return undefined;
        return get().entriesByKindKey[normalizedKind]?.[normalizedKey];
    },

    getEntryByKey: (key) => {
        const normalizedKey = (key ?? "").trim();
        if (!normalizedKey) return undefined;
        return get().entriesByKey[normalizedKey];
    },

    getEntriesByKind: (kind) => {
        const normalizedKind = (kind ?? "").trim().toLowerCase();
        if (!normalizedKind) return [];
        return get().entriesByKind[normalizedKind] ?? [];
    },

    getRelatedEntries: (entry) => {
        return resolveRelatedEntries(entry, {
            entriesByKey: get().entriesByKey,
            entriesByKindKey: get().entriesByKindKey,
        });
    },

    searchEntries: (query, kind) => {
        return filterCodexEntries(get().entries, {
            query,
            kind,
        });
    },
}));
