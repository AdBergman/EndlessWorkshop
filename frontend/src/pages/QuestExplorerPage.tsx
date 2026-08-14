import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    LoreContinuousProgression,
    LoreOpening,
    LoreSectionList,
} from "@/components/Quests/LoreReader";
import {
    QuestProgressionDebugPanel,
    type QuestModeDebugChoicePaths,
} from "@/components/Quests/QuestProgressionDebugPanel";
import {
    filterQuestEntries,
    selectQuestError,
    selectQuestExplorer,
    selectQuestLoaded,
    selectQuestLoading,
    selectSelectedQuest,
    useQuestStore,
} from "@/stores/questStore";
import {
    DEFAULT_QUEST_EXPLORER_MODE,
    normalizeQuestExplorerMode,
    type QuestExplorerMode,
} from "@/features/quests/questExplorerMode";
import {
    getQuestCategoryKey,
    getQuestCategoryLabel,
    majorFactionInfoForQuest,
    QUEST_CATEGORY_OPTIONS,
} from "@/features/quests/questCategories";
import {
    buildQuestRailGroups,
    resolveRailSelectionKey,
} from "@/features/quests/questRail";
import {
    EMPTY_CHOICE_PATH,
    findDetailProgression,
    progressionContextKey,
} from "@/features/quests/questPathFlow";
import {
    activeLoreSegmentForModel,
    buildLoreFlowModel,
} from "@/features/quests/questLoreFlow";
import {
    buildStrategyFlowModel,
} from "@/features/quests/questStrategyFlow";
import {
    LORE_SCROLL_ENTRY_QUERY_PARAM,
    useQuestExplorerLoreScrollUrl,
} from "@/features/quests/useQuestExplorerLoreScrollUrl";
import { useQuestExplorerPathState } from "@/features/quests/useQuestExplorerPathState";
import {
    decodeQuestChoicePath,
    encodeQuestChoicePath,
    questChoicePathTokensEqual,
    QUEST_CHOICE_QUERY_PARAM,
} from "@/features/quests/questExplorerUrlState";
import { questChapterDisplayLabel } from "@/features/quests/questDisplay";
import {
    selectSetSelectedFaction,
    selectSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import type { QuestExplorerEntry } from "@/types/questTypes";
import { CategorySelector, QuestList } from "./QuestExplorerRail";
import { EntryStrategyContent, LoreHeader, StrategyHeader, StrategyOverview } from "./QuestExplorerStrategyContent";
import { choiceDebugDetailsForStep, stepTitle } from "./QuestExplorerStrategyDebug";
import { StrategyProgression } from "./QuestExplorerStrategyProgression";
import "@/components/Quests/QuestExplorer.css";

function routeEntryKey(pathname: string): string | null {
    const raw = pathname.replace(/^\/quests\/?/, "").trim();
    if (!raw) return null;
    const firstSegment = raw.split("/")[0] ?? "";
    if (!firstSegment) return null;
    try {
        return decodeURIComponent(firstSegment);
    } catch {
        return firstSegment;
    }
}

function questPath(entryKey: string, mode: QuestExplorerMode, debugQuestProgression = false): string {
    const params = new URLSearchParams();
    if (mode !== DEFAULT_QUEST_EXPLORER_MODE) params.set("mode", mode);
    if (debugQuestProgression) params.set("debugQuestProgression", "true");
    const query = params.toString();
    return `/quests/${encodeURIComponent(entryKey)}${query ? `?${query}` : ""}`;
}

function isQuestProgressionDebugEnabled(searchParams: URLSearchParams): boolean {
    return searchParams.get("debugQuestProgression") === "true";
}

function compactMeta(entry: QuestExplorerEntry): string {
    const nav = entry.navigation;
    return [
        nav.factionName,
        nav.questLineName,
        nav.chapterLabel,
        nav.stepLabel,
        nav.branchLabel,
    ].filter(Boolean).join(" / ");
}

export default function QuestExplorerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const contentRef = useRef<HTMLElement | null>(null);
    const requestedFactionSyncKeyRef = useRef<string | null>(null);

    const loading = useQuestStore(selectQuestLoading);
    const loaded = useQuestStore(selectQuestLoaded);
    const error = useQuestStore(selectQuestError);
    const questExplorer = useQuestStore(selectQuestExplorer);
    const entries = useQuestStore((state) => state.entries);
    const entriesByKey = useQuestStore((state) => state.entriesByKey);
    const selectedEntry = useQuestStore(selectSelectedQuest);
    const selectedEntryKey = useQuestStore((state) => state.selectedEntryKey);
    const filters = useQuestStore((state) => state.filters);
    const mode = useQuestStore((state) => state.mode);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const setSelectedFaction = useFactionSelectionStore(selectSetSelectedFaction);
    const loadQuestExplorer = useQuestStore((state) => state.loadQuestExplorer);
    const setSelectedEntryKey = useQuestStore((state) => state.setSelectedEntryKey);
    const setMode = useQuestStore((state) => state.setMode);
    const setFilters = useQuestStore((state) => state.setFilters);
    const resolveEntryKey = useQuestStore((state) => state.resolveEntryKey);
    const [showRawHiddenRows, setShowRawHiddenRows] = useState(false);

    const requestedEntryKey = routeEntryKey(location.pathname) ?? searchParams.get("quest");
    const requestedMode = normalizeQuestExplorerMode(searchParams.get("mode"));
    const debugQuestProgression = isQuestProgressionDebugEnabled(searchParams);
    const strategyChoiceTokenKey = searchParams.getAll(QUEST_CHOICE_QUERY_PARAM).join("\u0001");
    const initialStrategyChoicePath = useMemo(
        () => decodeQuestChoicePath(strategyChoiceTokenKey ? strategyChoiceTokenKey.split("\u0001") : []),
        [strategyChoiceTokenKey]
    );
    const visibleEntries = useMemo(
        () => filterQuestEntries(entries, filters, selectedFaction),
        [entries, filters, selectedFaction]
    );
    const visibleEntryKeys = useMemo(
        () => new Set(visibleEntries.map((entry) => entry.entryKey)),
        [visibleEntries]
    );
    const progression = questExplorer?.progression ?? null;
    const railGroups = useMemo(
        () => buildQuestRailGroups(entries, progression, visibleEntryKeys),
        [entries, progression, visibleEntryKeys]
    );
    const railEntryCount = useMemo(
        () => railGroups.reduce((total, group) => total + group.items.length, 0),
        [railGroups]
    );
    const selectedProgression = useMemo(
        () => findDetailProgression(progression, selectedEntry, requestedEntryKey),
        [progression, requestedEntryKey, selectedEntry]
    );
    const selectedProgressionKey = useMemo(
        () => progressionContextKey(selectedProgression, selectedEntryKey),
        [selectedEntryKey, selectedProgression]
    );
    const {
        strategyChoicePath,
        strategyChoiceRevision,
        loreChoicePathsByContext,
        chooseExplicitChoice,
    } = useQuestExplorerPathState({
        mode,
        selectedEntryKey,
        selectedProgression,
        selectedProgressionKey,
        initialStrategyChoicePath,
    });
    const strategyFlowModel = useMemo(
        () => buildStrategyFlowModel({
            progression: selectedProgression,
            fullProgression: progression,
            entriesByKey,
            choicePath: strategyChoicePath,
            showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
            getStepTitle: (step, entry) => stepTitle(step, entry, entriesByKey),
        }),
        [debugQuestProgression, entriesByKey, progression, selectedProgression, showRawHiddenRows, strategyChoicePath]
    );
    const loreFlowModel = useMemo(
        () => buildLoreFlowModel({
            selectedProgression,
            fullProgression: progression,
            entriesByKey,
            loreChoicePathsByContext,
            showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
        }),
        [debugQuestProgression, entriesByKey, loreChoicePathsByContext, progression, selectedProgression, showRawHiddenRows]
    );
    const {
        scrollActiveRailEntryKey,
        applyPassiveScroll,
    } = useQuestExplorerLoreScrollUrl({
        mode: requestedMode,
        selectedEntryKey,
        selectedProgressionKey,
        segmentRailEntryKeys: loreFlowModel.segmentRailEntryKeys,
    });
    const activeLoreSegment = activeLoreSegmentForModel(loreFlowModel, mode === "lore" ? scrollActiveRailEntryKey : null);
    const activeDebugFlow = mode === "lore" ? activeLoreSegment?.flow ?? null : strategyFlowModel?.flow ?? null;
    const activeDebugProgression = mode === "lore" ? activeLoreSegment?.progression ?? selectedProgression : selectedProgression;
    const activeDebugLoreContextKey = mode === "lore" ? activeLoreSegment?.contextKey ?? selectedProgressionKey : selectedProgressionKey;
    const activeDebugLoreChoicePath = loreChoicePathsByContext[activeDebugLoreContextKey] ?? EMPTY_CHOICE_PATH;
    const activeDebugChoicePath = mode === "strategy" ? strategyChoicePath : activeDebugLoreChoicePath;
    const debugChoicePathsByMode = useMemo<QuestModeDebugChoicePaths>(
        () => ({ strategy: strategyChoicePath, lore: activeDebugLoreChoicePath }),
        [activeDebugLoreChoicePath, strategyChoicePath]
    );
    const loreSegmentObserverKey = useMemo(
        () => loreFlowModel.segments.map((segment) => segment.segmentKey).join("|"),
        [loreFlowModel.segments]
    );
    const activeRailEntry = mode === "lore"
        ? scrollActiveRailEntryKey
            ? entriesByKey[scrollActiveRailEntryKey] ?? selectedEntry
            : selectedEntry
        // Strategy continuation projections describe dossier status, not canonical rail selection.
        : selectedEntry;
    const selectedRailEntryKey = useMemo(
        () => resolveRailSelectionKey(activeRailEntry, railGroups),
        [activeRailEntry, railGroups]
    );
    const firstVisibleRailEntryKey = useMemo(
        () => railGroups.flatMap((group) => group.items)[0]?.entry.entryKey ?? visibleEntries[0]?.entryKey ?? null,
        [railGroups, visibleEntries]
    );

    useEffect(() => {
        void loadQuestExplorer();
    }, [loadQuestExplorer]);

    useEffect(() => {
        if (mode !== requestedMode) setMode(requestedMode);
    }, [mode, requestedMode, setMode]);

    useEffect(() => {
        if (requestedMode !== mode) return;

        const currentTokens = searchParams.getAll(QUEST_CHOICE_QUERY_PARAM);
        const nextTokens = mode === "strategy" ? encodeQuestChoicePath(strategyChoicePath) : [];
        if (
            mode === "strategy"
            && currentTokens.length > 0
            && initialStrategyChoicePath.length > 0
            && strategyChoicePath.length === 0
        ) return;
        if (
            mode === "strategy"
            && currentTokens.length === 0
            && nextTokens.length > 0
            && strategyChoiceRevision === 0
        ) return;
        if (questChoicePathTokensEqual(currentTokens, nextTokens)) return;

        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.delete(QUEST_CHOICE_QUERY_PARAM);
            nextTokens.forEach((token) => nextParams.append(QUEST_CHOICE_QUERY_PARAM, token));
            return nextParams;
        }, { replace: true });
    }, [
        initialStrategyChoicePath.length,
        mode,
        requestedMode,
        searchParams,
        setSearchParams,
        strategyChoicePath,
        strategyChoiceRevision,
    ]);

    useEffect(() => {
        if (mode !== "lore") return;
        const rootElement = contentRef.current;
        if (!rootElement || typeof IntersectionObserver === "undefined") return;

        const segmentElements = Array.from(rootElement.querySelectorAll<HTMLElement>("[data-lore-segment-key]"));
        if (segmentElements.length === 0) return;

        const visibleEntriesByElement = new Map<Element, IntersectionObserverEntry>();
        const rootStyle = window.getComputedStyle(rootElement);
        const observerRoot = rootStyle.overflowY === "visible" ? null : rootElement;
        const selectVisibleSegment = () => {
            const visibleSegments = [...visibleEntriesByElement.values()]
                .filter((entry) => entry.isIntersecting)
                .sort((left, right) => {
                    const ratioDelta = right.intersectionRatio - left.intersectionRatio;
                    if (Math.abs(ratioDelta) > 0.05) return ratioDelta;
                    return Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top);
                });
            const railEntryKey = visibleSegments[0]?.target.getAttribute("data-rail-entry-key")?.trim() ?? "";
            if (railEntryKey) applyPassiveScroll(railEntryKey);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleEntriesByElement.set(entry.target, entry);
                } else {
                    visibleEntriesByElement.delete(entry.target);
                }
            });
            selectVisibleSegment();
        }, {
            root: observerRoot,
            rootMargin: "-18% 0px -62% 0px",
            threshold: [0, 0.01, 0.25, 0.5],
        });

        segmentElements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [applyPassiveScroll, loreSegmentObserverKey, mode, selectedProgressionKey]);

    useEffect(() => {
        if (!debugQuestProgression) setShowRawHiddenRows(false);
    }, [debugQuestProgression]);

    useEffect(() => {
        if (!loaded) return;

        if (requestedEntryKey) {
            const resolved = resolveEntryKey(requestedEntryKey);
            if (resolved && visibleEntryKeys.has(resolved)) {
                requestedFactionSyncKeyRef.current = requestedEntryKey;
                if (resolved !== selectedEntryKey) {
                    setSelectedEntryKey(resolved);
                }
                return;
            }
            if (resolved && !visibleEntryKeys.has(resolved)) {
                const resolvedEntry = entriesByKey[resolved] ?? null;
                const routeFaction = resolvedEntry ? majorFactionInfoForQuest(resolvedEntry) : null;
                if (
                    routeFaction
                    && requestedFactionSyncKeyRef.current !== requestedEntryKey
                    && selectedFaction.enumFaction !== routeFaction.enumFaction
                ) {
                    requestedFactionSyncKeyRef.current = requestedEntryKey;
                    setSelectedFaction(routeFaction);
                    return;
                }

                const fallbackEntryKey = firstVisibleRailEntryKey;
                if (fallbackEntryKey !== selectedEntryKey) {
                    setSelectedEntryKey(fallbackEntryKey);
                }
                if (fallbackEntryKey) {
                    navigate(questPath(fallbackEntryKey, mode, debugQuestProgression), { replace: true });
                }
                return;
            }
            if (!resolved && selectedEntryKey) {
                setSelectedEntryKey(null);
            }
            return;
        }

        requestedFactionSyncKeyRef.current = null;
        if (!selectedEntryKey || !visibleEntryKeys.has(selectedEntryKey)) {
            setSelectedEntryKey(firstVisibleRailEntryKey);
        }
    }, [debugQuestProgression, entriesByKey, firstVisibleRailEntryKey, loaded, mode, navigate, requestedEntryKey, resolveEntryKey, selectedEntryKey, selectedFaction.enumFaction, setSelectedEntryKey, setSelectedFaction, visibleEntryKeys]);

    const categoryOptions = useMemo(() => (
        QUEST_CATEGORY_OPTIONS.map((option) => ({
            ...option,
            count: buildQuestRailGroups(
                entries,
                progression,
                new Set(filterQuestEntries(
                    entries,
                    { searchText: filters.searchText, category: option.key },
                    selectedFaction
                ).map((entry) => entry.entryKey))
            ).reduce((total, group) => total + group.items.length, 0),
        }))
    ), [entries, filters.searchText, progression, selectedFaction]);

    const applyCanonicalNavigation = useCallback((entryKey: string) => {
        // Future rollback/default navigation inference should attach here so
        // intentional navigation stays separate from passive Lore scroll and explicit decisions.
        applyPassiveScroll(null);
        setSelectedEntryKey(entryKey);
        navigate(questPath(entryKey, mode, debugQuestProgression));
    }, [applyPassiveScroll, debugQuestProgression, mode, navigate, setSelectedEntryKey]);

    const changeMode = (nextMode: QuestExplorerMode) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(LORE_SCROLL_ENTRY_QUERY_PARAM);
        applyPassiveScroll(null);
        setMode(nextMode);
        if (nextMode === DEFAULT_QUEST_EXPLORER_MODE) {
            nextParams.delete("mode");
        } else {
            nextParams.set("mode", nextMode);
        }
        setSearchParams(nextParams, { replace: true });
    };

    const missingRequestedEntry = loaded && requestedEntryKey && !resolveEntryKey(requestedEntryKey);
    const detailBreadcrumb = selectedEntry
        ? [
            getQuestCategoryLabel(selectedEntry.questType),
            selectedProgression
                ? questChapterDisplayLabel(selectedProgression.chapter, {
                    entry: selectedEntry,
                    questline: selectedProgression.questline,
                })
                : selectedEntry.navigation.chapterLabel,
        ].filter((part): part is string => Boolean(part))
        : [];
    const strategySummary = selectedEntry
        ? selectedEntry.summaryLines[0] ?? compactMeta(selectedEntry)
        : null;
    const isMajorFactionStrategyView = mode === "strategy" && selectedEntry
        ? getQuestCategoryKey(selectedEntry.questType) === "faction"
        : false;

    return (
        <main className="questExplorer-page">
            <h1 className="seo-hidden">Endless Legend 2 Quest Explorer</h1>

            <section className="questExplorer" aria-label="Quest Explorer">
                <aside className="questExplorer-sidebar">
                    <header>
                        <div>
                            <h2>Quest Archive</h2>
                        </div>
                        <div className="questExplorer-sidebarCount">
                            <strong>{railEntryCount} / {entries.length}</strong>
                            <small>Quests</small>
                        </div>
                    </header>

                    <div className="questExplorer-filters">
                        <label className="questExplorer-filterField questExplorer-filterField--search">
                            <span>Search</span>
                            <input
                                type="search"
                                value={filters.searchText}
                                placeholder="Search quests..."
                                onChange={(event) => setFilters({ searchText: event.currentTarget.value })}
                            />
                        </label>
                        <CategorySelector
                            value={filters.category}
                            options={categoryOptions}
                            onChange={(category) => setFilters({ category })}
                        />
                    </div>

                    <QuestList
                        groups={railGroups}
                        selectedRailEntryKey={selectedRailEntryKey}
                        onSelectEntry={applyCanonicalNavigation}
                    />
                </aside>

                <section className="questExplorer-detail" aria-live="polite">
                    {loading ? <div className="questExplorer-state">Loading quest explorer...</div> : null}
                    {error ? <div className="questExplorer-state questExplorer-state--error">{error}</div> : null}
                    {missingRequestedEntry ? (
                        <div className="questExplorer-state questExplorer-state--error">
                            No quest entry or alias matches <code>{requestedEntryKey}</code>.
                        </div>
                    ) : null}
                    {!loading && !error && !selectedEntry ? (
                        <div className="questExplorer-state">
                            {entries.length === 0 ? "No quest explorer entries are available." : "No quest matches the current filters."}
                        </div>
                    ) : null}

                    {selectedEntry ? (
                        <>
                            {mode === "strategy" ? (
                                <StrategyHeader
                                    entry={selectedEntry}
                                    breadcrumb={detailBreadcrumb}
                                    mode={mode}
                                    onModeChange={changeMode}
                                    progression={selectedProgression}
                                    summary={strategySummary}
                                />
                            ) : (
                                <LoreHeader
                                    entry={selectedEntry}
                                    breadcrumb={detailBreadcrumb}
                                    mode={mode}
                                    onModeChange={changeMode}
                                    progression={selectedProgression}
                                />
                            )}

                            <section
                                className={`questExplorer-content questExplorer-content--${mode}${isMajorFactionStrategyView ? " questExplorer-content--majorFactionStrategy" : ""}`}
                                ref={contentRef}
                            >
                                {mode === "strategy" ? (
                                    <>
                                        {!selectedProgression ? <StrategyOverview entry={selectedEntry} /> : null}
                                        {selectedProgression ? (
                                            <StrategyProgression
                                                progression={selectedProgression}
                                                fullProgression={progression}
                                                model={strategyFlowModel}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
                                                shortenRequirementLabels={isMajorFactionStrategyView}
                                                onChoose={chooseExplicitChoice}
                                            />
                                        ) : (
                                            <section className="questExplorer-questPathFallback questExplorer-strategyFallback" aria-label="Selected progression">
                                                <EntryStrategyContent entry={selectedEntry} />
                                            </section>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {!selectedProgression ? <LoreOpening entry={selectedEntry} /> : null}
                                        {selectedProgression ? (
                                            <LoreContinuousProgression
                                                model={loreFlowModel}
                                                entriesByKey={entriesByKey}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
                                                onChoose={(segment, step, choice) => chooseExplicitChoice(step, choice, segment.progression, segment.contextKey)}
                                                activeRailEntryKey={scrollActiveRailEntryKey}
                                                getStepTitle={(step, entry) => stepTitle(step, entry, entriesByKey)}
                                                getDebugChoiceDetails={debugQuestProgression
                                                    ? (segment, renderedStep, isActiveDebugSegment) => (
                                                        isActiveDebugSegment
                                                            ? choiceDebugDetailsForStep(
                                                                renderedStep.step,
                                                                [...renderedStep.choices, ...renderedStep.revealedContinuations],
                                                                renderedStep.choiceDiagnostics,
                                                                segment.progression,
                                                                progression,
                                                                entriesByKey,
                                                                renderedStep.revealedContinuations
                                                            )
                                                            : undefined
                                                    )
                                                    : undefined}
                                            />
                                        ) : (
                                            <section className="questExplorer-questPathFallback questExplorer-loreFallback" aria-label="Selected progression">
                                                <LoreSectionList entry={selectedEntry} />
                                            </section>
                                        )}
                                    </>
                                )}
                                {debugQuestProgression ? (
                                    <QuestProgressionDebugPanel
                                        selectedEntry={selectedEntry}
                                        progression={activeDebugProgression}
                                        flow={activeDebugFlow}
                                        entriesByKey={entriesByKey}
                                        activeMode={mode}
                                        activeChoicePath={activeDebugChoicePath}
                                        debugChoicePathsByMode={debugChoicePathsByMode}
                                        loreContextKey={activeDebugLoreContextKey}
                                        showRawHiddenRows={showRawHiddenRows}
                                        onToggleRawHiddenRows={setShowRawHiddenRows}
                                    />
                                ) : null}
                            </section>
                        </>
                    ) : null}
                </section>
            </section>
        </main>
    );
}
