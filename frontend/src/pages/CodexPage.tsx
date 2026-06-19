import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CodexEntryDetail from "@/components/Codex/CodexEntryDetail";
import CodexOverview from "@/components/Codex/CodexOverview";
import CodexResultList from "@/components/Codex/CodexResultList";
import CodexSearch from "@/components/Codex/CodexSearch";
import CodexSummaryDetail from "@/components/Codex/CodexSummaryDetail";
import { CodexKindIcon } from "@/features/icons/CodexKindIcon";
import {
    createCodexSummaryEntry,
    formatCodexKindLabel,
    getCodexSummaryEntryKey,
    isCodexQuestGroupEntry,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
import { groupQuestListItems } from "@/lib/codex/codexQuestGrouping";
import {
    ALL_CODEX_KIND,
    entryMatchesQuery,
    filterCodexEntries,
    getAutocompleteEntries,
} from "@/lib/codex/codexSearch";
import { entryHasCodexFactValue, getCodexFactValues } from "@/lib/codex/codexFactValues";
import { resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { sortResourceReferenceEntries } from "@/lib/codex/codexShallowReferencePreview";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import "./CodexPage.css";

const PREFERRED_KIND_ORDER = [
    "abilities",
    "actions",
    "councilors",
    "counciloreffects",
    "partnereffects",
    "districts",
    "extractors",
    "resources",
    "equipment",
    "factions",
    "diplomatictreaties",
    "heroes",
    "improvements",
    "minorfactions",
    "populations",
    "quests",
    "statuses",
    "tech",
    "traits",
    "units",
];
const HIDDEN_TOP_LEVEL_KINDS = new Set(["bonuses", "extractors", "modifiers"]);
const VALID_HIDDEN_ROUTE_KINDS = new Set(["extractors"]);
const FULL_WIDTH_REFERENCE_OVERVIEW_KINDS = new Set(["counciloreffects", "partnereffects", "resources"]);

type SelectionIntent = "passive" | "related";
type CodexFactFilterConfig = {
    label: string;
    displayLabel: string;
    allowedValues?: readonly string[];
    splitCommaSeparatedValues?: boolean;
    showZeroCountOptions?: boolean;
};
type CodexFactFilterOption = CodexFactFilterConfig & {
    values: { value: string; count: number }[];
};
type ActiveCodexFactFilters = Record<string, string>;

const FACT_FILTERS_BY_KIND: Record<string, CodexFactFilterConfig[]> = {
    abilities: [
        {
            label: "Combat role",
            displayLabel: "Popular / Player-centric",
            allowedValues: [
                "Damage",
                "Status apply",
                "Shield",
                "Heal",
                "Movement",
                "Teleport",
                "Summon",
                "Push",
                "Status remove",
                "Reactive skill",
            ],
            splitCommaSeparatedValues: true,
            showZeroCountOptions: false,
        },
        {
            label: "Ability mechanic",
            displayLabel: "Mechanics",
            allowedValues: ["Active", "Passive", "Reaction", "Mixed"],
        },
        {
            label: "Ability source",
            displayLabel: "Sources",
            allowedValues: ["Battle skill", "Battle ability", "Unit ability event", "Mixed", "Battle reward"],
        },
    ],
};

function normalizeCodexKind(kind: string): string {
    return kind.trim().toLowerCase();
}

function supportsFullWidthReferenceOverview(kind: string): boolean {
    return FULL_WIDTH_REFERENCE_OVERVIEW_KINDS.has(normalizeCodexKind(kind));
}

function isVisibleTopLevelKind(kind: string): boolean {
    return !HIDDEN_TOP_LEVEL_KINDS.has(normalizeCodexKind(kind));
}

function getFactFilterConfig(kind: string): CodexFactFilterConfig[] {
    return FACT_FILTERS_BY_KIND[normalizeCodexKind(kind)] ?? [];
}

function getEntryFactFilterValues(entry: CodexEntry, filter: CodexFactFilterConfig): string[] {
    return getCodexFactValues(entry, filter.label).flatMap((value) => (
        filter.splitCommaSeparatedValues
            ? value.split(",").map((part) => part.trim()).filter(Boolean)
            : [value]
    ));
}

function uniqueEntryFactValues(entry: CodexEntry, filter: CodexFactFilterConfig): string[] {
    const seen = new Set<string>();
    const values: string[] = [];

    for (const value of getEntryFactFilterValues(entry, filter)) {
        if (seen.has(value)) continue;

        seen.add(value);
        values.push(value);
    }

    return values;
}

function buildFactFilterOptions(
    entries: readonly CodexEntry[],
    filters: readonly CodexFactFilterConfig[],
    activeFilters: ActiveCodexFactFilters
): CodexFactFilterOption[] {
    return filters
        .map((filter) => {
            const counts = entries.reduce<Map<string, number>>((acc, entry) => {
                const filtersExceptCurrent = Object.fromEntries(
                    Object.entries(activeFilters).filter(([label]) => label !== filter.label)
                );
                if (!entryMatchesFactFilters(entry, filtersExceptCurrent, filters)) {
                    return acc;
                }

                for (const value of uniqueEntryFactValues(entry, filter)) {
                    acc.set(value, (acc.get(value) ?? 0) + 1);
                }

                return acc;
            }, new Map<string, number>());

            const values = filter.allowedValues
                ? filter.allowedValues
                    .map((value) => ({ value, count: counts.get(value) ?? 0 }))
                    .filter((option) => filter.showZeroCountOptions !== false || option.count > 0)
                : Array.from(counts.entries())
                    .map(([value, count]) => ({ value, count }))
                    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));

            return { ...filter, values };
        })
        .filter((filter) => filter.values.length > 0);
}

function entryMatchesFactFilters(
    entry: CodexEntry,
    activeFilters: ActiveCodexFactFilters,
    filterConfigs: readonly CodexFactFilterConfig[]
): boolean {
    return Object.entries(activeFilters).every(([label, value]) => {
        const filterConfig = filterConfigs.find((filter) => filter.label === label);
        if (!filterConfig) {
            return entryHasCodexFactValue(entry, label, value);
        }

        return getEntryFactFilterValues(entry, filterConfig).some((factValue) => factValue === value);
    });
}

function getActiveFactFilterItems(
    activeFilters: ActiveCodexFactFilters,
    filters: readonly CodexFactFilterConfig[]
): { label: string; displayLabel: string; value: string }[] {
    return filters.flatMap((filter) => {
        const value = activeFilters[filter.label];
        return value ? [{ label: filter.label, displayLabel: filter.displayLabel, value }] : [];
    });
}

export default function CodexPage() {
    const location = useLocation();
    const entries = useCodexStore((state) => state.entries);
    const entriesByKey = useCodexStore((state) => state.entriesByKey);
    const entriesByKindKey = useCodexStore((state) => state.entriesByKindKey);
    const loading = useCodexStore((state) => state.loading);
    const error = useCodexStore((state) => state.error);
    const loadEntries = useCodexStore((state) => state.loadEntries);

    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [selectionIntent, setSelectionIntent] = useState<SelectionIntent>("passive");
    const [activeFactFilters, setActiveFactFilters] = useState<ActiveCodexFactFilters>({});

    const deferredQuery = useDeferredValue(query);
    const selectedEntryParam = (searchParams.get("entry") ?? "").trim() || null;
    const activeKind = (searchParams.get("category") ?? "").trim().toLowerCase() || ALL_CODEX_KIND;
    const selectedEntryKey = selectedEntryParam ?? (
        activeKind === ALL_CODEX_KIND ? null : getCodexSummaryEntryKey(activeKind)
    );
    const codexResetNonce = (location.state as { codexResetNonce?: string } | null)?.codexResetNonce ?? null;

    const resultListRef = useRef<HTMLDivElement>(null);
    const detailTitleRef = useRef<HTMLHeadingElement>(null);
    const suppressNextPlainRouteResetRef = useRef(false);
    const lastPlainRouteResetSignatureRef = useRef<string | null>(null);
    const lastHandledResetNonceRef = useRef<string | null>(null);

    useEffect(() => {
        void loadEntries();
    }, [loadEntries]);

    const filterOptions = useMemo(() => {
        const kindCounts = entries.reduce<Map<string, number>>((acc, entry) => {
            const exportKind = normalizeCodexKind(entry.exportKind);
            if (!exportKind) return acc;

            const nextCount = (acc.get(exportKind) ?? 0) + 1;
            acc.set(exportKind, nextCount);
            return acc;
        }, new Map<string, number>());

        const knownKinds = PREFERRED_KIND_ORDER
            .filter((kind) => kindCounts.has(kind))
            .filter(isVisibleTopLevelKind);
        const extraKinds = Array.from(kindCounts.keys())
            .filter((kind) => !PREFERRED_KIND_ORDER.includes(kind))
            .filter(isVisibleTopLevelKind)
            .sort((left, right) => left.localeCompare(right));

        const orderedKinds = [...knownKinds, ...extraKinds];

        return [
            { kind: ALL_CODEX_KIND, label: "All", count: entries.length },
            ...orderedKinds.map((kind) => ({
                kind,
                label: formatCodexKindLabel(kind),
                count: kindCounts.get(kind) ?? 0,
            })),
        ];
    }, [entries]);

    const searchFilteredEntries = useMemo(
        () => filterCodexEntries(entries, { query: deferredQuery, kind: activeKind }),
        [entries, deferredQuery, activeKind]
    );

    const factFilterConfig = useMemo(
        () => getFactFilterConfig(activeKind),
        [activeKind]
    );

    const factFilterOptions = useMemo(
        () => buildFactFilterOptions(searchFilteredEntries, factFilterConfig, activeFactFilters),
        [activeFactFilters, factFilterConfig, searchFilteredEntries]
    );

    useEffect(() => {
        const allowedLabels = new Set(factFilterConfig.map((filter) => filter.label));

        setActiveFactFilters((current) => {
            const next = Object.fromEntries(
                Object.entries(current).filter(([label, value]) => allowedLabels.has(label) && value.trim())
            );
            return Object.keys(next).length === Object.keys(current).length ? current : next;
        });
    }, [factFilterConfig]);

    const filteredEntries = useMemo(
        () => {
            if (Object.keys(activeFactFilters).length === 0) {
                return searchFilteredEntries;
            }

            return searchFilteredEntries.filter((entry) =>
                entryMatchesFactFilters(entry, activeFactFilters, factFilterConfig)
            );
        },
        [activeFactFilters, factFilterConfig, searchFilteredEntries]
    );

    const autocompleteEntries = useMemo(
        () => getAutocompleteEntries(entries, { query, kind: activeKind, limit: 7 }),
        [entries, query, activeKind]
    );

    const activeKindLabel = useMemo(
        () => filterOptions.find((option) => option.kind === activeKind)?.label ?? formatCodexKindLabel(activeKind),
        [activeKind, filterOptions]
    );
    const categoryShelfOptions = useMemo(
        () => filterOptions,
        [filterOptions]
    );
    const hasDeferredQuery = deferredQuery.trim().length > 0;
    const hasActiveFactFilters = Object.keys(activeFactFilters).length > 0;
    const isAbilityCatalogMode = activeKind === "abilities";
    const activeFactFilterItems = useMemo(
        () => getActiveFactFilterItems(activeFactFilters, factFilterConfig),
        [activeFactFilters, factFilterConfig]
    );

    const displayEntries = useMemo<CodexListItem[]>(() => {
        const groupedEntries = groupQuestListItems(filteredEntries);

        if (activeKind === ALL_CODEX_KIND) {
            return groupedEntries;
        }

        return [createCodexSummaryEntry(activeKind, activeKindLabel, filteredEntries.length, query), ...groupedEntries];
    }, [activeKind, activeKindLabel, filteredEntries, query]);

    const groupedFilteredEntries = useMemo(
        () => groupQuestListItems(filteredEntries),
        [filteredEntries]
    );

    const selectedListItem = useMemo(() => {
        if (!selectedEntryKey) return null;

        for (const entry of displayEntries) {
            if (entry.entryKey === selectedEntryKey) return entry;
            if (isCodexQuestGroupEntry(entry)) {
                const matchingNode = entry.nodes.find((node) => node.entryKey === selectedEntryKey);
                if (matchingNode) return matchingNode;
            }
        }

        return null;
    }, [displayEntries, selectedEntryKey]);

    const selectedEntry = useMemo(
        () => (
            selectedListItem && !isCodexSummaryEntry(selectedListItem) && !isCodexQuestGroupEntry(selectedListItem)
                ? selectedListItem
                : null
        ),
        [selectedListItem]
    );
    const selectedQuestGroup = useMemo(() => {
        if (!selectedEntryKey) return null;

        for (const entry of displayEntries) {
            if (!isCodexQuestGroupEntry(entry)) continue;
            if (entry.nodes.some((node) => node.entryKey === selectedEntryKey)) {
                return entry;
            }
        }

        return null;
    }, [displayEntries, selectedEntryKey]);
    const overviewOptions = useMemo(
        () => filterOptions.filter((option) => option.kind !== ALL_CODEX_KIND),
        [filterOptions]
    );
    const isOverviewState =
        activeKind === ALL_CODEX_KIND &&
        !hasDeferredQuery &&
        (!selectedEntryKey || selectedListItem === null);
    const isFullWidthReferenceOverviewState =
        supportsFullWidthReferenceOverview(activeKind) &&
        !hasDeferredQuery &&
        !selectedEntryParam &&
        Boolean(selectedListItem && isCodexSummaryEntry(selectedListItem));
    const summaryDetailEntries = useMemo(
        () => (
            isFullWidthReferenceOverviewState && activeKind === "resources"
                ? sortResourceReferenceEntries(groupedFilteredEntries)
                : groupedFilteredEntries
        ),
        [activeKind, groupedFilteredEntries, isFullWidthReferenceOverviewState]
    );
    const useCompactHeader = activeKind !== ALL_CODEX_KIND || Boolean(selectedEntryParam);
    const showResultsPane = !isOverviewState && !isFullWidthReferenceOverviewState;
    const isPlainRouteReset =
        location.pathname === "/codex" &&
        location.search === "" &&
        Boolean(codexResetNonce);

    const resolvedRelatedEntries = useMemo(
        () => resolveRelatedEntries(selectedEntry, { entriesByKey, entriesByKindKey }),
        [selectedEntry, entriesByKey, entriesByKindKey]
    );

    const updateSelectedEntry = useCallback(
        (entryKey: string | null, options?: { category?: string | null; replace?: boolean; suppressPlainRouteReset?: boolean }) => {
            if (!entryKey && options?.suppressPlainRouteReset) {
                suppressNextPlainRouteResetRef.current = true;
            }

            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);

                    if (options?.category === null) {
                        nextParams.delete("category");
                    } else if (options?.category) {
                        nextParams.set("category", options.category);
                    }

                    if (entryKey && !entryKey.startsWith("__summary__:")) {
                        nextParams.set("entry", entryKey);
                    } else {
                        nextParams.delete("entry");
                    }

                    return nextParams;
                },
                { replace: options?.replace ?? false }
            );
        },
        [setSearchParams]
    );

    const getSelectableEntryKey = useCallback((entry: CodexListItem | null): string | null => {
        if (!entry) return null;
        if (isCodexQuestGroupEntry(entry)) {
            return entry.nodes[0]?.entryKey ?? null;
        }
        return entry.entryKey;
    }, []);

    const selectKind = useCallback(
        (kind: string) => {
            setSelectionIntent("passive");

            if (kind === ALL_CODEX_KIND) {
                updateSelectedEntry(null, { category: null, suppressPlainRouteReset: true });
                return;
            }

            updateSelectedEntry(null, { category: kind });
        },
        [updateSelectedEntry]
    );

    const selectEntry = useCallback(
        (entry: CodexListItem, intent: SelectionIntent = "passive") => {
            const selectableEntryKey = getSelectableEntryKey(entry);
            if (!selectableEntryKey) return;

            if (isCodexSummaryEntry(entry)) {
                selectKind(entry.summaryKind);
                return;
            }

            const entryKind = normalizeCodexKind(entry.exportKind);
            const nextCategory = activeKind !== ALL_CODEX_KIND && entryKind === activeKind
                ? activeKind
                : null;

            if (activeKind !== ALL_CODEX_KIND && entryKind !== activeKind) {
                setSelectionIntent("passive");
            }

            if (query && !isCodexSummaryEntry(entry) && !entryMatchesQuery(entry, query)) {
                setQuery("");
            }

            setSelectionIntent(intent);
            updateSelectedEntry(selectableEntryKey, { category: nextCategory });
        },
        [activeKind, getSelectableEntryKey, query, selectKind, updateSelectedEntry]
    );

    useEffect(() => {
        if (location.pathname !== "/codex" || location.search !== "") {
            lastPlainRouteResetSignatureRef.current = null;
            return;
        }

        const plainRouteResetSignature = `${location.key}:${codexResetNonce ?? ""}`;
        if (lastPlainRouteResetSignatureRef.current === plainRouteResetSignature) {
            return;
        }
        lastPlainRouteResetSignatureRef.current = plainRouteResetSignature;

        if (suppressNextPlainRouteResetRef.current) {
            suppressNextPlainRouteResetRef.current = false;
            return;
        }

        if (codexResetNonce && lastHandledResetNonceRef.current === codexResetNonce) {
            return;
        }

        lastHandledResetNonceRef.current = codexResetNonce;
        setQuery("");
        setSelectionIntent("passive");
    }, [codexResetNonce, location.key, location.pathname, location.search]);

    useEffect(() => {
        if (loading) return;
        if (activeKind === ALL_CODEX_KIND) return;

        const filterStillExists =
            filterOptions.some((option) => option.kind === activeKind) ||
            (
                VALID_HIDDEN_ROUTE_KINDS.has(activeKind) &&
                entries.some((entry) => normalizeCodexKind(entry.exportKind) === activeKind)
            );
        if (!filterStillExists) {
            updateSelectedEntry(null, { category: null, replace: true });
        }
    }, [activeKind, entries, filterOptions, loading, updateSelectedEntry]);

    useEffect(() => {
        if (loading) return;
        if (isPlainRouteReset) return;

        const firstVisibleEntry = displayEntries[0] ?? null;
        const isSelectedVisible = Boolean(selectedEntryKey && selectedListItem);
        const shouldShowOverview = activeKind === ALL_CODEX_KIND && !hasDeferredQuery && !isSelectedVisible;

        if (!firstVisibleEntry) {
            if (selectedEntryKey) {
                updateSelectedEntry(null, { replace: true });
            }
            return;
        }

        if (shouldShowOverview) {
            return;
        }

        if (!isSelectedVisible) {
            if (activeKind !== ALL_CODEX_KIND && selectedEntryParam) {
                updateSelectedEntry(null, { category: activeKind, replace: true });
                return;
            }

            updateSelectedEntry(getSelectableEntryKey(firstVisibleEntry), { replace: true });
        }
    }, [
        activeKind,
        displayEntries,
        getSelectableEntryKey,
        hasDeferredQuery,
        isPlainRouteReset,
        loading,
        selectedEntryParam,
        selectedEntryKey,
        selectedListItem,
        updateSelectedEntry,
    ]);

    useEffect(() => {
        if (!selectedListItem) return;

        const scrollEntryKey = selectedQuestGroup?.entryKey ?? selectedListItem.entryKey;
        const rowButtons = Array.from(
            resultListRef.current?.querySelectorAll<HTMLElement>("[data-entry-key]") ?? []
        );
        const matchingRow = rowButtons.find((row) => row.dataset.entryKey === scrollEntryKey);

        if (typeof matchingRow?.scrollIntoView === "function") {
            matchingRow.scrollIntoView({
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [selectedListItem, selectedQuestGroup]);

    useEffect(() => {
        if (selectionIntent !== "related" || !selectedEntry) return;

        detailTitleRef.current?.focus({ preventScroll: true });
        if (typeof detailTitleRef.current?.scrollIntoView === "function") {
            detailTitleRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }

        setSelectionIntent("passive");
    }, [selectionIntent, selectedEntry]);

    const searchControl = (
        <CodexSearch
            value={query}
            onChange={setQuery}
            resultCount={filteredEntries.length}
            totalCount={entries.length}
            suggestions={autocompleteEntries}
            onSelectSuggestion={(entry) => {
                setQuery(entry.displayName);
                selectEntry(entry);
            }}
            onConfirmQuery={() => {
                const firstVisibleEntry = filteredEntries[0];
                if (firstVisibleEntry) {
                    selectEntry(firstVisibleEntry);
                }
            }}
            enableAutocomplete={false}
        />
    );

    return (
        <main className="codex-page">
            <h1 className="seo-hidden">
                Endless Legend 2 Codex, Encyclopedia, and Workshop Reference Explorer
            </h1>

            <section
                className="codex-surface"
                aria-labelledby={useCompactHeader ? undefined : "codex-page-title"}
                aria-label={useCompactHeader ? "Codex encyclopedia" : undefined}
            >
                <header className={`codex-header ${useCompactHeader ? "codex-header--compact" : ""}`}>
                    <div className={`codex-header__top ${useCompactHeader ? "codex-header__top--compact" : ""}`}>
                        <div className="codex-header__copy">
                            <div className="codex-eyebrow">Endless Workshop archive</div>
                            {!useCompactHeader ? (
                                <h2 className="codex-pageTitle" id="codex-page-title">
                                    Encyclopedia
                                </h2>
                            ) : null}
                        </div>

                        <div className="codex-header__stats" aria-label="Codex encyclopedia statistics">
                            <span className="codex-header__stat">
                                <strong>{entries.length}</strong>
                                <span>entries</span>
                            </span>
                            <span className="codex-header__stat">
                                <strong>{filterOptions.length - 1}</strong>
                                <span>categories</span>
                            </span>
                        </div>
                    </div>

                    <div className="codex-controlBand">
                        {searchControl}
                    </div>
                    {!isOverviewState ? (
                        <div className="codex-categoryShelf" aria-label="Codex categories">
                            <div className="codex-categoryShelf__label">Categories</div>
                            <div
                                className="codex-categoryShelf__chips codex-categoryShelf__chips--wrap"
                                role="toolbar"
                                aria-label="Filter codex by category"
                            >
                                {categoryShelfOptions.map((option) => {
                                    const isActive = option.kind === activeKind;

                                    return (
                                        <button
                                            key={option.kind}
                                            type="button"
                                            className={`codex-categoryShelf__chip codex-kindFilter__chip ${
                                                isActive ? "is-active" : ""
                                            }`}
                                            onClick={() => selectKind(option.kind)}
                                            aria-pressed={isActive}
                                            aria-label={`${option.label} ${option.count}`}
                                        >
                                            <CodexKindIcon
                                                kind={option.kind}
                                                label={option.label}
                                                className="codex-kindIcon codex-kindIcon--chip"
                                                size={15}
                                            />
                                            <span>{option.label}</span>
                                            <span className="codex-kindFilter__count">
                                                {isActive ? `${option.count} entries` : option.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </header>

                <div
                    className={`codex-workspace ${isOverviewState ? "codex-workspace--overview" : ""} ${
                        isFullWidthReferenceOverviewState ? "codex-workspace--referenceOverview" : ""
                    }`}
                >
                    {showResultsPane ? (
                        <aside
                            className={`codex-resultsPane ${isAbilityCatalogMode ? "codex-resultsPane--catalog" : ""}`}
                            aria-label={isAbilityCatalogMode ? "Ability catalog filters" : "Codex results"}
                        >
                            <div className="codex-resultsPane__header">
                                {isAbilityCatalogMode ? (
                                    <div className="codex-resultsPane__archiveIntro">
                                        <div className="codex-sectionLabel">Ability archive</div>
                                        <div className="codex-resultsPane__count">
                                            {`${filteredEntries.length} ${
                                                filteredEntries.length === 1 ? "ability" : "abilities"
                                            }`}
                                        </div>
                                        <p>Browse combat and empire abilities.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="codex-sectionLabel">Results</div>
                                            <div className="codex-resultsPane__title">
                                                {activeKind === ALL_CODEX_KIND
                                                    ? "All encyclopedia entries"
                                                    : activeKindLabel}
                                            </div>
                                        </div>
                                        <div className="codex-resultsPane__count">{filteredEntries.length}</div>
                                    </>
                                )}
                            </div>

                            {factFilterOptions.length > 0 ? (
                                <div className="codex-resultsFilters" aria-label={`${activeKindLabel} filters`}>
                                    <div className="codex-resultsFilters__controls">
                                        {activeFactFilterItems.length > 0 ? (
                                            <div className="codex-resultsFilters__activeGroup">
                                                <span className="codex-resultsFilters__groupLabel">Active filters</span>
                                                <div
                                                    className="codex-resultsFilters__active"
                                                    aria-label="Active filters"
                                                >
                                                    {activeFactFilterItems.map((item) => (
                                                        <button
                                                            key={`${item.label}-${item.value}`}
                                                            type="button"
                                                            className="codex-resultsFilters__activeChip"
                                                            onClick={() => {
                                                                setActiveFactFilters((current) => {
                                                                    const next = { ...current };
                                                                    delete next[item.label];
                                                                    return next;
                                                                });
                                                            }}
                                                            aria-label={`Remove ${item.displayLabel}: ${item.value}`}
                                                        >
                                                            <span>{item.value}</span>
                                                            <span aria-hidden="true">x</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                        {factFilterOptions.map((filter) => (
                                            <div
                                                key={filter.label}
                                                className="codex-resultsFilters__group"
                                                role="group"
                                                aria-label={filter.displayLabel}
                                            >
                                                <span className="codex-resultsFilters__groupLabel">
                                                    {filter.displayLabel}
                                                </span>
                                                <div className="codex-resultsFilters__chips">
                                                    {filter.values.map((option) => {
                                                        const isActive = activeFactFilters[filter.label] === option.value;
                                                        const isDisabled = option.count === 0;

                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                className={`codex-resultsFilters__chip ${
                                                                    isActive ? "is-active" : ""
                                                                }`}
                                                                onClick={() => {
                                                                    if (isDisabled) return;

                                                                    setActiveFactFilters((current) => {
                                                                        const next = { ...current };
                                                                        if (next[filter.label] === option.value) {
                                                                            delete next[filter.label];
                                                                        } else {
                                                                            next[filter.label] = option.value;
                                                                        }
                                                                        return next;
                                                                    });
                                                                }}
                                                                aria-pressed={isActive}
                                                                aria-label={`${option.value} ${option.count}`}
                                                                disabled={isDisabled}
                                                            >
                                                                <span>{option.value}</span>
                                                                <span className="codex-resultsFilters__count">
                                                                    {option.count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {!isAbilityCatalogMode ? (
                                <CodexResultList
                                    ref={resultListRef}
                                    entries={displayEntries}
                                    selectedEntryKey={selectedListItem?.entryKey ?? null}
                                    loading={loading}
                                    error={error}
                                    onSelect={(entry) => selectEntry(entry)}
                                />
                            ) : null}
                        </aside>
                    ) : null}

                    <section
                        className="codex-detailPane"
                        aria-label={isOverviewState ? "Codex overview" : "Selected codex entry"}
                    >
                        <div className="codex-detailPane__body">
                            {isOverviewState ? (
                                <CodexOverview options={overviewOptions} onSelectKind={selectKind} />
                            ) : selectedListItem && isCodexSummaryEntry(selectedListItem) ? (
                                <CodexSummaryDetail
                                    summaryEntry={selectedListItem}
                                    entries={summaryDetailEntries}
                                    allEntries={entries}
                                    titleRef={detailTitleRef}
                                    onSelectEntry={(entry) => selectEntry(entry)}
                                />
                            ) : (
                                <CodexEntryDetail
                                    entry={selectedEntry}
                                    questGroup={selectedQuestGroup}
                                    allEntries={entries}
                                    relatedEntries={resolvedRelatedEntries}
                                    titleRef={detailTitleRef}
                                    onSelectRelated={(entry) => selectEntry(entry, "related")}
                                />
                            )}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
