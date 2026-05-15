import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CodexEntryDetail from "@/components/Codex/CodexEntryDetail";
import CodexOverview from "@/components/Codex/CodexOverview";
import CodexResultList from "@/components/Codex/CodexResultList";
import CodexSearch from "@/components/Codex/CodexSearch";
import CodexSummaryDetail from "@/components/Codex/CodexSummaryDetail";
import KindFilter from "@/components/Codex/KindFilter";
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
import { resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { useCodexStore } from "@/stores/codexStore";
import "./CodexPage.css";

const PREFERRED_KIND_ORDER = [
    "abilities",
    "councilors",
    "districts",
    "equipment",
    "factions",
    "heroes",
    "improvements",
    "minorfactions",
    "populations",
    "quests",
    "tech",
    "traits",
    "units",
];

type SelectionIntent = "passive" | "related";

export default function CodexPage() {
    const location = useLocation();
    const entries = useCodexStore((state) => state.entries);
    const entriesByKey = useCodexStore((state) => state.entriesByKey);
    const entriesByKindKey = useCodexStore((state) => state.entriesByKindKey);
    const loading = useCodexStore((state) => state.loading);
    const error = useCodexStore((state) => state.error);

    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [activeKind, setActiveKind] = useState(ALL_CODEX_KIND);
    const [selectionIntent, setSelectionIntent] = useState<SelectionIntent>("passive");
    const [expandedQuestGroupKeys, setExpandedQuestGroupKeys] = useState<Set<string>>(() => new Set());

    const deferredQuery = useDeferredValue(query);
    const selectedEntryKey = (searchParams.get("entry") ?? "").trim() || null;
    const codexResetNonce = (location.state as { codexResetNonce?: string } | null)?.codexResetNonce ?? null;

    const resultListRef = useRef<HTMLDivElement>(null);
    const detailTitleRef = useRef<HTMLHeadingElement>(null);
    const suppressNextPlainRouteResetRef = useRef(false);
    const lastHandledResetNonceRef = useRef<string | null>(null);

    const filterOptions = useMemo(() => {
        const kindCounts = entries.reduce<Map<string, number>>((acc, entry) => {
            const nextCount = (acc.get(entry.exportKind) ?? 0) + 1;
            acc.set(entry.exportKind, nextCount);
            return acc;
        }, new Map<string, number>());

        const knownKinds = PREFERRED_KIND_ORDER.filter((kind) => kindCounts.has(kind));
        const extraKinds = Array.from(kindCounts.keys())
            .filter((kind) => !PREFERRED_KIND_ORDER.includes(kind))
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

    const filteredEntries = useMemo(
        () => filterCodexEntries(entries, { query: deferredQuery, kind: activeKind }),
        [entries, deferredQuery, activeKind]
    );

    const autocompleteEntries = useMemo(
        () => getAutocompleteEntries(entries, { query, kind: activeKind, limit: 7 }),
        [entries, query, activeKind]
    );

    const activeKindLabel = useMemo(
        () => filterOptions.find((option) => option.kind === activeKind)?.label ?? formatCodexKindLabel(activeKind),
        [activeKind, filterOptions]
    );
    const hasDeferredQuery = deferredQuery.trim().length > 0;

    const displayEntries = useMemo<CodexListItem[]>(() => {
        const groupedEntries = groupQuestListItems(filteredEntries, {
            expandedGroupKeys: expandedQuestGroupKeys,
            selectedEntryKey,
            query: deferredQuery,
        });

        if (activeKind === ALL_CODEX_KIND) {
            return groupedEntries;
        }

        return [createCodexSummaryEntry(activeKind, activeKindLabel, filteredEntries.length, query), ...groupedEntries];
    }, [activeKind, activeKindLabel, deferredQuery, expandedQuestGroupKeys, filteredEntries, query, selectedEntryKey]);

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
    const overviewOptions = useMemo(
        () => filterOptions.filter((option) => option.kind !== ALL_CODEX_KIND),
        [filterOptions]
    );
    const isOverviewState =
        activeKind === ALL_CODEX_KIND &&
        !hasDeferredQuery &&
        (!selectedEntryKey || selectedListItem === null);
    const isPlainRouteReset =
        location.pathname === "/codex" &&
        location.search === "" &&
        Boolean(codexResetNonce);

    const resolvedRelatedEntries = useMemo(
        () => resolveRelatedEntries(selectedEntry, { entriesByKey, entriesByKindKey }),
        [selectedEntry, entriesByKey, entriesByKindKey]
    );

    const updateSelectedEntry = useCallback(
        (entryKey: string | null, options?: { suppressPlainRouteReset?: boolean }) => {
            if (!entryKey && options?.suppressPlainRouteReset) {
                suppressNextPlainRouteResetRef.current = true;
            }

            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);

                    if (entryKey) {
                        nextParams.set("entry", entryKey);
                    } else {
                        nextParams.delete("entry");
                    }

                    return nextParams;
                },
                { replace: true }
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

    const toggleQuestGroup = useCallback((groupKey: string) => {
        setExpandedQuestGroupKeys((current) => {
            const next = new Set(current);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    }, []);

    const selectEntry = useCallback(
        (entry: CodexListItem, intent: SelectionIntent = "passive") => {
            const selectableEntryKey = getSelectableEntryKey(entry);
            if (!selectableEntryKey) return;

            if (activeKind !== ALL_CODEX_KIND && entry.exportKind !== activeKind) {
                setActiveKind(ALL_CODEX_KIND);
            }

            if (query && !isCodexSummaryEntry(entry) && !entryMatchesQuery(entry, query)) {
                setQuery("");
            }

            setSelectionIntent(intent);
            updateSelectedEntry(selectableEntryKey);
        },
        [activeKind, getSelectableEntryKey, query, updateSelectedEntry]
    );

    const selectKind = useCallback(
        (kind: string) => {
            setActiveKind(kind);
            setSelectionIntent("passive");

            if (kind === ALL_CODEX_KIND) {
                updateSelectedEntry(null, { suppressPlainRouteReset: true });
                return;
            }

            updateSelectedEntry(getCodexSummaryEntryKey(kind));
        },
        [updateSelectedEntry]
    );

    useEffect(() => {
        if (location.pathname !== "/codex" || location.search !== "") return;

        if (suppressNextPlainRouteResetRef.current) {
            suppressNextPlainRouteResetRef.current = false;
            return;
        }

        if (codexResetNonce && lastHandledResetNonceRef.current === codexResetNonce) {
            return;
        }

        if (!codexResetNonce && !selectedEntryKey && query.length === 0 && activeKind === ALL_CODEX_KIND) {
            return;
        }

        lastHandledResetNonceRef.current = codexResetNonce;
        setQuery("");
        setActiveKind(ALL_CODEX_KIND);
        setSelectionIntent("passive");
    }, [codexResetNonce, location.pathname, location.search]);

    useEffect(() => {
        if (activeKind === ALL_CODEX_KIND) return;

        const filterStillExists = filterOptions.some((option) => option.kind === activeKind);
        if (!filterStillExists) {
            setActiveKind(ALL_CODEX_KIND);
        }
    }, [activeKind, filterOptions]);

    useEffect(() => {
        if (loading) return;
        if (isPlainRouteReset) return;

        const firstVisibleEntry = displayEntries[0] ?? null;
        const isSelectedVisible = Boolean(selectedEntryKey && selectedListItem);
        const shouldShowOverview = activeKind === ALL_CODEX_KIND && !hasDeferredQuery && !isSelectedVisible;

        if (!firstVisibleEntry) {
            if (selectedEntryKey) {
                updateSelectedEntry(null);
            }
            return;
        }

        if (shouldShowOverview) {
            return;
        }

        if (!isSelectedVisible) {
            updateSelectedEntry(getSelectableEntryKey(firstVisibleEntry));
        }
    }, [
        activeKind,
        displayEntries,
        getSelectableEntryKey,
        hasDeferredQuery,
        isPlainRouteReset,
        loading,
        selectedEntryKey,
        selectedListItem,
        updateSelectedEntry,
    ]);

    useEffect(() => {
        if (!selectedListItem) return;

        const rowButtons = Array.from(
            resultListRef.current?.querySelectorAll<HTMLElement>("[data-entry-key]") ?? []
        );
        const matchingRow = rowButtons.find((row) => row.dataset.entryKey === selectedListItem.entryKey);

        if (typeof matchingRow?.scrollIntoView === "function") {
            matchingRow.scrollIntoView({
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [selectedListItem]);

    useEffect(() => {
        if (selectionIntent !== "related" || !selectedEntry) return;

        detailTitleRef.current?.focus({ preventScroll: true });
        detailTitleRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setSelectionIntent("passive");
    }, [selectionIntent, selectedEntry]);

    return (
        <main className="codex-page">
            <h1 className="seo-hidden">
                Endless Legend 2 Codex, Encyclopedia, and Workshop Reference Explorer
            </h1>

            <section className="codex-surface" aria-labelledby="codex-page-title">
                <header className="codex-header">
                    <div className="codex-header__copy">
                        <h2 className="codex-pageTitle" id="codex-page-title">
                            Encyclopedia
                        </h2>
                    </div>

                    <div className="codex-filterRail">
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
                        />
                        <KindFilter
                            options={filterOptions}
                            activeKind={activeKind}
                            onSelect={selectKind}
                        />
                    </div>
                </header>

                <div className="codex-workspace">
                    <aside className="codex-resultsPane" aria-label="Codex results">
                        <div className="codex-resultsPane__header">
                            <div>
                                <div className="codex-sectionLabel">Results</div>
                                <div className="codex-resultsPane__title">
                                    {activeKind === ALL_CODEX_KIND
                                        ? "All encyclopedia entries"
                                        : activeKindLabel}
                                </div>
                            </div>
                            <div className="codex-resultsPane__count">{filteredEntries.length}</div>
                        </div>

                        <CodexResultList
                            ref={resultListRef}
                            entries={displayEntries}
                            selectedEntryKey={selectedListItem?.entryKey ?? null}
                            loading={loading}
                            error={error}
                            onSelect={(entry) => selectEntry(entry)}
                            onToggleQuestGroup={toggleQuestGroup}
                        />
                    </aside>

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
                                    entries={filteredEntries}
                                    titleRef={detailTitleRef}
                                    onSelectEntry={(entry) => selectEntry(entry)}
                                />
                            ) : (
                                <CodexEntryDetail
                                    entry={selectedEntry}
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
