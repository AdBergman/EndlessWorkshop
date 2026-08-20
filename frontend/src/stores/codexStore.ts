import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { maybePublishCodexTokenAudit } from "@/lib/codex/codexTokenAudit";
import { buildEntriesByKey, buildEntriesByKindKey, resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { filterCodexEntries } from "@/lib/codex/codexSearch";
import { isValidDisplayName } from "@/lib/codex/codexValidation";
import type {
    CodexEntry,
    CodexKindSummary,
    CodexMetadataFact,
    CodexMetadataSection,
    CodexMetadataSectionItem,
    CodexSvgIcon,
} from "@/types/dataTypes";

export type CodexLoadStatus = "idle" | "loading" | "loaded" | "error";

type Store = {
    entries: CodexEntry[];
    entriesByKey: Record<string, CodexEntry>;
    entriesByKind: Record<string, CodexEntry[]>;
    entriesByKindKey: Record<string, Record<string, CodexEntry>>;
    categorySummaries: CodexKindSummary[];
    loading: boolean;
    error: string | null;
    fullLoaded: boolean;
    categoryLoadStates: Record<string, CodexLoadStatus>;
    categoryErrors: Record<string, string | null>;
    categoryLoadedAt: Record<string, string | undefined>;
    prefetching: boolean;
    summaryLoaded: boolean;
    summaryLoading: boolean;
    summaryError: string | null;
    lastLoadedAt?: string;

    loadEntries: (opts?: { force?: boolean }) => Promise<void>;
    loadCategory: (category: string, opts?: { force?: boolean }) => Promise<void>;
    prefetchCategories: (categories: readonly string[]) => Promise<void>;
    loadSummary: (opts?: { force?: boolean }) => Promise<void>;
    reset: () => void;

    getEntry: (exportKind: string, entryKey: string) => CodexEntry | undefined;
    getEntryByKey: (key: string) => CodexEntry | undefined;
    getEntriesByKind: (kind: string) => CodexEntry[];
    getRelatedEntries: (entry: CodexEntry) => CodexEntry[];
    searchEntries: (query: string, kind?: string) => CodexEntry[];
};

let inflightLoad: Promise<void> | null = null;
let fullRequestVersion = 0;
let inflightSummaryLoad: Promise<void> | null = null;
let summaryRequestVersion = 0;
const inflightCategoryLoads = new Map<string, Promise<void>>();
const categoryRequestVersions = new Map<string, number>();
let cacheGeneration = 0;
let inflightPrefetch: Promise<void> | null = null;
let prefetchRunId = 0;

const CATEGORY_PREFETCH_CONCURRENCY = 2;

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

    const referenceKey = typeof item.referenceKey === "string" ? item.referenceKey.trim() || null : null;
    const facts = cleanFacts(item.facts);
    const lines = cleanStrings(item.lines);
    if (!referenceKey && facts.length === 0 && lines.length === 0) return null;

    return { label, referenceKey, facts, lines };
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

function cleanSvgIcon(value: unknown): CodexSvgIcon | null {
    const candidate = value as CodexSvgIcon | null | undefined;
    if (!candidate || typeof candidate.source !== "string" || typeof candidate.key !== "string") return null;

    const source = candidate.source.trim();
    const key = candidate.key.trim();
    return source && key ? { source, key } : null;
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
        svgIcon: cleanSvgIcon(entry.svgIcon),
    };
}

function normalizeSummary(summary: CodexKindSummary): CodexKindSummary | null {
    const exportKind = normalizeBonusDerivedKind({
        exportKind: summary.exportKind,
        entryKey: "",
        displayName: "",
        category: null,
        kind: null,
        descriptionLines: [],
        referenceKeys: [],
    }).trim().toLowerCase();
    const count = Number(summary.count);

    if (!exportKind || !Number.isFinite(count) || count <= 0) return null;
    return { exportKind, count };
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

function buildSummariesFromEntries(entries: CodexEntry[]): CodexKindSummary[] {
    const countsByKind = entries.reduce<Record<string, number>>((acc, entry) => {
        if (!entry.exportKind) return acc;

        acc[entry.exportKind] = (acc[entry.exportKind] ?? 0) + 1;
        return acc;
    }, {});

    return Object.entries(countsByKind).map(([exportKind, count]) => ({ exportKind, count }));
}

function normalizeEntries(rawEntries: CodexEntry[]): CodexEntry[] {
    return rawEntries
        .map(normalizeEntry)
        .filter((entry) => entry.entryKey.length > 0)
        .filter((entry) => isValidDisplayName(entry.displayName));
}

function sortEntriesForStableIndexes(entries: CodexEntry[]): CodexEntry[] {
    return [...entries].sort((left, right) => {
        const kindOrder = left.exportKind.localeCompare(right.exportKind);
        if (kindOrder !== 0) return kindOrder;

        const nameOrder = left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" });
        if (nameOrder !== 0) return nameOrder;

        return left.entryKey.localeCompare(right.entryKey, undefined, { sensitivity: "base" });
    });
}

function entryState(entries: CodexEntry[]) {
    const stableEntries = sortEntriesForStableIndexes(entries);
    return {
        entries: stableEntries,
        entriesByKey: buildEntriesByKey(stableEntries),
        entriesByKind: buildEntriesByKind(stableEntries),
        entriesByKindKey: buildEntriesByKindKey(stableEntries),
    };
}

function replaceCategoryEntries(
    existingEntries: CodexEntry[],
    category: string,
    categoryEntries: CodexEntry[]
): CodexEntry[] {
    return [
        ...existingEntries.filter((entry) => entry.exportKind !== category),
        ...categoryEntries,
    ];
}

function loadedCategoryStates(entries: CodexEntry[]): Record<string, CodexLoadStatus> {
    return Object.fromEntries(
        [...new Set(entries.map((entry) => entry.exportKind))]
            .map((category) => [category, "loaded" as const])
    );
}

export const useCodexStore = create<Store>((set, get) => ({
    entries: [],
    entriesByKey: {},
    entriesByKind: {},
    entriesByKindKey: {},
    categorySummaries: [],
    loading: false,
    error: null,
    fullLoaded: false,
    categoryLoadStates: {},
    categoryErrors: {},
    categoryLoadedAt: {},
    prefetching: false,
    summaryLoaded: false,
    summaryLoading: false,
    summaryError: null,
    lastLoadedAt: undefined,

    loadEntries: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && inflightLoad) {
            return inflightLoad;
        }

        if (!force && state.fullLoaded) {
            return;
        }

        if (force) {
            cacheGeneration += 1;
            prefetchRunId += 1;
        }
        const requestGeneration = cacheGeneration;
        const requestVersion = ++fullRequestVersion;

        set({ loading: true, error: null, ...(force ? { prefetching: false } : {}) });

        const request: Promise<void> = (async () => {
            try {
                const rawEntries = await apiClient.getCodex();
                if (requestGeneration !== cacheGeneration) return;

                const entries = normalizeEntries(rawEntries);
                const loadedAt = new Date().toISOString();
                const categoryStates = loadedCategoryStates(entries);
                // A complete snapshot is authoritative over any older category slices still in flight.
                cacheGeneration += 1;
                summaryRequestVersion += 1;

                set({
                    ...entryState(entries),
                    categorySummaries: buildSummariesFromEntries(entries),
                    loading: false,
                    error: null,
                    fullLoaded: true,
                    categoryLoadStates: categoryStates,
                    categoryErrors: Object.fromEntries(Object.keys(categoryStates).map((category) => [category, null])),
                    categoryLoadedAt: Object.fromEntries(Object.keys(categoryStates).map((category) => [category, loadedAt])),
                    summaryLoaded: true,
                    summaryLoading: false,
                    summaryError: null,
                    lastLoadedAt: loadedAt,
                });

                maybePublishCodexTokenAudit(rawEntries);
            } catch (err) {
                if (requestGeneration !== cacheGeneration) return;
                console.error("Failed to load codex:", err);
                set({
                    loading: false,
                    error: (err as Error)?.message ?? "Failed to load codex.",
                });
            } finally {
                if (requestVersion === fullRequestVersion) {
                    inflightLoad = null;
                }
            }
        })();

        inflightLoad = request;
        return request;
    },

    loadCategory: async (category, opts) => {
        const normalizedCategory = (category ?? "").trim().toLowerCase();
        if (!normalizedCategory) return;

        const force = opts?.force ?? false;
        const state = get();
        const existingRequest = inflightCategoryLoads.get(normalizedCategory);
        if (!force && existingRequest) {
            return existingRequest;
        }
        if (!force && (state.fullLoaded || state.categoryLoadStates[normalizedCategory] === "loaded")) {
            return;
        }

        const requestVersion = (categoryRequestVersions.get(normalizedCategory) ?? 0) + 1;
        categoryRequestVersions.set(normalizedCategory, requestVersion);
        const requestGeneration = cacheGeneration;

        set((current) => ({
            categoryLoadStates: {
                ...current.categoryLoadStates,
                [normalizedCategory]: "loading",
            },
            categoryErrors: {
                ...current.categoryErrors,
                [normalizedCategory]: null,
            },
        }));

        const request: Promise<void> = (async () => {
            try {
                const rawEntries = await apiClient.getCodexCategory(normalizedCategory);
                if (
                    requestGeneration !== cacheGeneration ||
                    categoryRequestVersions.get(normalizedCategory) !== requestVersion
                ) {
                    return;
                }

                const categoryEntries = normalizeEntries(rawEntries)
                    .filter((entry) => entry.exportKind === normalizedCategory);
                const loadedAt = new Date().toISOString();

                set((current) => ({
                    ...entryState(replaceCategoryEntries(current.entries, normalizedCategory, categoryEntries)),
                    categoryLoadStates: {
                        ...current.categoryLoadStates,
                        [normalizedCategory]: "loaded",
                    },
                    categoryErrors: {
                        ...current.categoryErrors,
                        [normalizedCategory]: null,
                    },
                    categoryLoadedAt: {
                        ...current.categoryLoadedAt,
                        [normalizedCategory]: loadedAt,
                    },
                }));
            } catch (err) {
                if (
                    requestGeneration !== cacheGeneration ||
                    categoryRequestVersions.get(normalizedCategory) !== requestVersion
                ) {
                    return;
                }

                console.error(`Failed to load codex category '${normalizedCategory}':`, err);
                set((current) => ({
                    categoryLoadStates: {
                        ...current.categoryLoadStates,
                        [normalizedCategory]: "error",
                    },
                    categoryErrors: {
                        ...current.categoryErrors,
                        [normalizedCategory]: (err as Error)?.message ?? "Failed to load Codex category.",
                    },
                }));
            } finally {
                if (categoryRequestVersions.get(normalizedCategory) === requestVersion) {
                    inflightCategoryLoads.delete(normalizedCategory);
                }
            }
        })();

        inflightCategoryLoads.set(normalizedCategory, request);
        return request;
    },

    prefetchCategories: async (categories) => {
        if (inflightPrefetch) return inflightPrefetch;

        const queue = [...new Set(categories
            .map((category) => (category ?? "").trim().toLowerCase())
            .filter(Boolean))]
            .filter((category) => get().categoryLoadStates[category] !== "loaded");
        if (queue.length === 0 || get().fullLoaded) return;

        const runId = ++prefetchRunId;
        let nextIndex = 0;
        set({ prefetching: true });
        const worker = async () => {
            while (runId === prefetchRunId && !get().loading && !get().fullLoaded) {
                const category = queue[nextIndex];
                nextIndex += 1;
                if (!category) return;
                await get().loadCategory(category);
            }
        };

        const request = Promise.all(
            Array.from(
                { length: Math.min(CATEGORY_PREFETCH_CONCURRENCY, queue.length) },
                () => worker()
            )
        ).then(() => undefined).finally(() => {
            if (runId === prefetchRunId) {
                inflightPrefetch = null;
                set({ prefetching: false });
            }
        });

        inflightPrefetch = request;
        return request;
    },

    loadSummary: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.fullLoaded) {
            set({
                categorySummaries: buildSummariesFromEntries(state.entries),
                summaryLoaded: true,
                summaryLoading: false,
                summaryError: null,
            });
            return;
        }

        if (!force && state.summaryLoading && inflightSummaryLoad) {
            return inflightSummaryLoad;
        }

        if (!force && state.categorySummaries.length > 0) {
            return;
        }

        set({ summaryLoading: true, summaryError: null });

        const requestGeneration = cacheGeneration;
        const requestVersion = ++summaryRequestVersion;
        const request: Promise<void> = (async () => {
            try {
                const summaries = (await apiClient.getCodexSummary())
                    .map((summary) => normalizeSummary(summary))
                    .filter((summary): summary is CodexKindSummary => summary !== null);
                if (requestGeneration !== cacheGeneration || requestVersion !== summaryRequestVersion) return;

                set({
                    categorySummaries: summaries,
                    summaryLoaded: true,
                    summaryLoading: false,
                    summaryError: null,
                });
            } catch (err) {
                if (requestGeneration !== cacheGeneration || requestVersion !== summaryRequestVersion) return;
                console.error("Failed to load codex summary:", err);
                set({
                    summaryLoaded: false,
                    summaryLoading: false,
                    summaryError: (err as Error)?.message ?? "Failed to load codex summary.",
                });
            } finally {
                if (requestVersion === summaryRequestVersion) {
                    inflightSummaryLoad = null;
                }
            }
        })();

        inflightSummaryLoad = request;
        return request;
    },

    reset: () => {
        cacheGeneration += 1;
        fullRequestVersion += 1;
        summaryRequestVersion += 1;
        prefetchRunId += 1;
        inflightLoad = null;
        inflightSummaryLoad = null;
        inflightCategoryLoads.clear();
        categoryRequestVersions.clear();
        inflightPrefetch = null;
        set({
            entries: [],
            entriesByKey: {},
            entriesByKind: {},
            entriesByKindKey: {},
            categorySummaries: [],
            loading: false,
            error: null,
            fullLoaded: false,
            categoryLoadStates: {},
            categoryErrors: {},
            categoryLoadedAt: {},
            prefetching: false,
            summaryLoaded: false,
            summaryLoading: false,
            summaryError: null,
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
