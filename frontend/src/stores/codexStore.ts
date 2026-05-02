import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import type { CodexEntry } from "@/types/dataTypes";

type Store = {
    entries: CodexEntry[];
    entriesByKey: Record<string, CodexEntry>;
    entriesByKind: Record<string, CodexEntry[]>;
    loading: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadEntries: (opts?: { force?: boolean }) => Promise<void>;
    reset: () => void;

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
        descriptionLines: (entry.descriptionLines ?? []).filter((line): line is string => typeof line === "string"),
        referenceKeys: (entry.referenceKeys ?? []).filter((key): key is string => typeof key === "string"),
    };
}

function buildEntriesByKey(entries: CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        if (entry.entryKey) {
            acc[entry.entryKey] = entry;
        }
        return acc;
    }, {});
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
                    .filter((entry) => entry.entryKey.length > 0);

                set({
                    entries,
                    entriesByKey: buildEntriesByKey(entries),
                    entriesByKind: buildEntriesByKind(entries),
                    loading: false,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
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
            loading: false,
            error: null,
            lastLoadedAt: undefined,
        });
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
        if (!entry) return [];

        const selfKey = (entry.entryKey ?? "").trim();
        if (!selfKey) return [];

        const { entriesByKey } = get();
        return (entry.referenceKeys ?? [])
            .filter((key) => {
                const normalizedKey = (key ?? "").trim();
                return normalizedKey.length > 0 && normalizedKey !== selfKey;
            })
            .map((key) => entriesByKey[key])
            .filter((related): related is CodexEntry => Boolean(related));
    },

    searchEntries: (query, kind) => {
        const normalizedQuery = (query ?? "").trim().toLowerCase();
        const pool = kind ? get().getEntriesByKind(kind) : get().entries;

        if (!normalizedQuery) {
            return pool;
        }

        return pool.filter((entry) => {
            const displayName = entry.displayName.toLowerCase();
            const entryKey = entry.entryKey.toLowerCase();
            const description = entry.descriptionLines.join(" ").toLowerCase();

            return (
                displayName.includes(normalizedQuery) ||
                entryKey.includes(normalizedQuery) ||
                description.includes(normalizedQuery)
            );
        });
    },
}));
