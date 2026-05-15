import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { maybePublishCodexTokenAudit } from "@/lib/codex/codexTokenAudit";
import { buildEntriesByKey, buildEntriesByKindKey, resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { filterCodexEntries } from "@/lib/codex/codexSearch";
import { isValidDisplayName } from "@/lib/codex/codexValidation";
import type { CodexEntry } from "@/types/dataTypes";

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

function normalizeEntry(entry: CodexEntry): CodexEntry {
    return {
        exportKind: (entry.exportKind ?? "").trim().toLowerCase(),
        entryKey: (entry.entryKey ?? "").trim(),
        displayName: entry.displayName ?? "",
        category: typeof entry.category === "string" ? entry.category.trim() || null : null,
        kind: typeof entry.kind === "string" ? entry.kind.trim() || null : null,
        descriptionLines: (entry.descriptionLines ?? []).filter((line): line is string => typeof line === "string"),
        referenceKeys: (entry.referenceKeys ?? []).filter((key): key is string => typeof key === "string"),
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
