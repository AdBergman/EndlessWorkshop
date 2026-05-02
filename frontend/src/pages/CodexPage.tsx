import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CodexEntryDetail from "@/components/Codex/CodexEntryDetail";
import CodexResultList from "@/components/Codex/CodexResultList";
import CodexSearch from "@/components/Codex/CodexSearch";
import KindFilter from "@/components/Codex/KindFilter";
import {
    ALL_CODEX_KIND,
    entryMatchesQuery,
    filterCodexEntries,
    getAutocompleteEntries,
} from "@/lib/codex/codexSearch";
import { resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import "./CodexPage.css";

const PREFERRED_KIND_ORDER = [
    "abilities",
    "councilors",
    "districts",
    "equipment",
    "factions",
    "heroes",
    "improvements",
    "populations",
    "tech",
    "units",
];

type SelectionIntent = "passive" | "related";

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function CodexPage() {
    const entries = useCodexStore((state) => state.entries);
    const entriesByKey = useCodexStore((state) => state.entriesByKey);
    const loading = useCodexStore((state) => state.loading);
    const error = useCodexStore((state) => state.error);

    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [activeKind, setActiveKind] = useState(ALL_CODEX_KIND);
    const [selectionIntent, setSelectionIntent] = useState<SelectionIntent>("passive");

    const deferredQuery = useDeferredValue(query);
    const selectedEntryKey = (searchParams.get("entry") ?? "").trim() || null;

    const resultListRef = useRef<HTMLDivElement>(null);
    const detailTitleRef = useRef<HTMLHeadingElement>(null);

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
                label: formatKindLabel(kind),
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

    const selectedEntry = useMemo(() => {
        if (!selectedEntryKey) {
            return filteredEntries[0] ?? null;
        }

        return filteredEntries.find((entry) => entry.entryKey === selectedEntryKey) ?? null;
    }, [filteredEntries, selectedEntryKey]);

    const resolvedRelatedEntries = useMemo(
        () => resolveRelatedEntries(selectedEntry, entriesByKey),
        [selectedEntry, entriesByKey]
    );

    const updateSelectedEntry = useCallback(
        (entryKey: string | null) => {
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

    const selectEntry = useCallback(
        (entry: CodexEntry, intent: SelectionIntent = "passive") => {
            if (activeKind !== ALL_CODEX_KIND && entry.exportKind !== activeKind) {
                setActiveKind(ALL_CODEX_KIND);
            }

            if (query && !entryMatchesQuery(entry, query)) {
                setQuery("");
            }

            setSelectionIntent(intent);
            updateSelectedEntry(entry.entryKey);
        },
        [activeKind, query, updateSelectedEntry]
    );

    useEffect(() => {
        if (activeKind === ALL_CODEX_KIND) return;

        const filterStillExists = filterOptions.some((option) => option.kind === activeKind);
        if (!filterStillExists) {
            setActiveKind(ALL_CODEX_KIND);
        }
    }, [activeKind, filterOptions]);

    useEffect(() => {
        if (loading) return;

        const firstVisibleEntry = filteredEntries[0] ?? null;
        const isSelectedVisible = Boolean(
            selectedEntryKey && filteredEntries.some((entry) => entry.entryKey === selectedEntryKey)
        );

        if (!firstVisibleEntry) {
            if (selectedEntryKey) {
                updateSelectedEntry(null);
            }
            return;
        }

        if (!isSelectedVisible) {
            updateSelectedEntry(firstVisibleEntry.entryKey);
        }
    }, [filteredEntries, loading, selectedEntryKey, updateSelectedEntry]);

    useEffect(() => {
        if (!selectedEntry) return;

        const rowButtons = Array.from(
            resultListRef.current?.querySelectorAll<HTMLElement>("[data-entry-key]") ?? []
        );
        const matchingRow = rowButtons.find((row) => row.dataset.entryKey === selectedEntry.entryKey);

        matchingRow?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
        });
    }, [selectedEntry]);

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
                        <div className="codex-eyebrow">Workshop Codex</div>
                        <h2 className="codex-pageTitle" id="codex-page-title">
                            Encyclopedia
                        </h2>
                    </div>

                    <CodexSearch
                        value={query}
                        onChange={setQuery}
                        resultCount={filteredEntries.length}
                        totalCount={entries.length}
                        suggestions={autocompleteEntries}
                        onSelectSuggestion={(entry) => {
                            setQuery(entry.displayName || entry.entryKey);
                            selectEntry(entry);
                        }}
                        onConfirmQuery={() => {
                            const firstVisibleEntry = filteredEntries[0];
                            if (firstVisibleEntry) {
                                selectEntry(firstVisibleEntry);
                            }
                        }}
                    />
                </header>

                <div className="codex-filterRail">
                    <KindFilter
                        options={filterOptions}
                        activeKind={activeKind}
                        onSelect={setActiveKind}
                    />
                </div>

                <div className="codex-workspace">
                    <aside className="codex-resultsPane" aria-label="Codex results">
                        <div className="codex-resultsPane__header">
                            <div>
                                <div className="codex-sectionLabel">Results</div>
                                <div className="codex-resultsPane__title">
                                    {activeKind === ALL_CODEX_KIND
                                        ? "All encyclopedia entries"
                                        : filterOptions.find((option) => option.kind === activeKind)?.label ??
                                          "Filtered entries"}
                                </div>
                            </div>
                            <div className="codex-resultsPane__count">{filteredEntries.length}</div>
                        </div>

                        <CodexResultList
                            ref={resultListRef}
                            entries={filteredEntries}
                            selectedEntryKey={selectedEntry?.entryKey ?? null}
                            loading={loading}
                            error={error}
                            onSelect={(entry) => selectEntry(entry)}
                        />
                    </aside>

                    <section className="codex-detailPane" aria-label="Selected codex entry">
                        <div className="codex-detailPane__sticky">
                            <CodexEntryDetail
                                entry={selectedEntry}
                                relatedEntries={resolvedRelatedEntries}
                                titleRef={detailTitleRef}
                                onSelectRelated={(entry) => selectEntry(entry, "related")}
                            />
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
