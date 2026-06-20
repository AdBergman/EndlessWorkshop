import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CodexEntryDetail from "@/components/Codex/CodexEntryDetail";
import CodexLeftPane from "@/components/Codex/CodexLeftPane";
import CodexOverview from "@/components/Codex/CodexOverview";
import CodexSummaryDetail from "@/components/Codex/CodexSummaryDetail";
import CodexTopPanel from "@/components/Codex/CodexTopPanel";
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
import {
    buildActionTypeFilterOptions,
    filterActionEntriesByType,
    type ActionArchiveType,
} from "@/lib/codex/codexActionArchiveFilters";
import {
    buildDiplomacyCategoryFilterOptions,
    filterDiplomacyEntriesByCategory,
    type DiplomacyArchiveCategory,
} from "@/lib/codex/codexDiplomacyArchiveFilters";
import {
    buildDistrictCategoryFilterOptions,
    filterDistrictEntriesByCategory,
    type DistrictArchiveCategory,
} from "@/lib/codex/codexDistrictArchiveFilters";
import {
    buildAbilityArchiveFilterOptions,
    entryMatchesAbilityArchiveFilters,
    getAbilityArchiveFactFilterConfig,
    getAbilityArchiveSummary,
    getActiveAbilityArchiveFilterItems,
    type ActiveCodexFactFilters,
} from "@/lib/codex/codexAbilityArchiveFilters";
import {
    buildEquipmentArchiveFilterGroups,
    EMPTY_EQUIPMENT_ARCHIVE_FILTERS,
    entryMatchesEquipmentArchiveFilters,
    hasActiveEquipmentArchiveFilters,
    type ActiveEquipmentArchiveFilters,
    type EquipmentArchiveFilterKey,
} from "@/lib/codex/codexEquipmentArchiveFilters";
import {
    buildHeroArchiveFilterGroups,
    EMPTY_HERO_ARCHIVE_FILTERS,
    entryMatchesHeroArchiveFilters,
    hasActiveHeroArchiveFilters,
    type ActiveHeroArchiveFilters,
    type HeroArchiveFilterKey,
} from "@/lib/codex/codexHeroArchiveFilters";
import {
    buildImprovementCategoryFilterOptions,
    filterImprovementEntriesByCategory,
    type ImprovementArchiveCategory,
} from "@/lib/codex/codexImprovementArchiveFilters";
import {
    buildStatusScopeFilterOptions,
    filterStatusEntriesByScope,
} from "@/lib/codex/codexStatusArchiveFilters";
import {
    buildTraitTypeFilterOptions,
    filterTraitEntriesByType,
    type TraitArchiveType,
} from "@/lib/codex/codexTraitArchiveFilters";
import {
    getCodexCategoryMode,
    isDirectRoutableHiddenCodexKind,
    isVisibleTopLevelCodexKind,
    normalizeCodexKind,
    PREFERRED_CODEX_KIND_ORDER,
    supportsFullWidthReferenceOverview,
} from "@/lib/codex/codexCategoryConfig";
import { resolveRelatedEntries } from "@/lib/codex/codexRefs";
import { sortResourceReferenceEntries } from "@/lib/codex/codexShallowReferencePreview";
import { useCodexStore } from "@/stores/codexStore";
import "./CodexPage.css";

type SelectionIntent = "passive" | "related";

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
    const [activeActionType, setActiveActionType] = useState<ActionArchiveType | null>(null);
    const [activeDiplomacyCategory, setActiveDiplomacyCategory] = useState<DiplomacyArchiveCategory | null>(null);
    const [activeDistrictCategory, setActiveDistrictCategory] = useState<DistrictArchiveCategory | null>(null);
    const [activeFactFilters, setActiveFactFilters] = useState<ActiveCodexFactFilters>({});
    const [activeEquipmentFilters, setActiveEquipmentFilters] = useState<ActiveEquipmentArchiveFilters>(
        EMPTY_EQUIPMENT_ARCHIVE_FILTERS
    );
    const [activeHeroFilters, setActiveHeroFilters] = useState<ActiveHeroArchiveFilters>(
        EMPTY_HERO_ARCHIVE_FILTERS
    );
    const [activeImprovementCategory, setActiveImprovementCategory] = useState<ImprovementArchiveCategory | null>(null);
    const [activeStatusScope, setActiveStatusScope] = useState<string | null>(null);
    const [activeTraitType, setActiveTraitType] = useState<TraitArchiveType | null>(null);

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

        const knownKinds = PREFERRED_CODEX_KIND_ORDER
            .filter((kind) => kindCounts.has(kind))
            .filter(isVisibleTopLevelCodexKind);
        const extraKinds = Array.from(kindCounts.keys())
            .filter((kind) => !PREFERRED_CODEX_KIND_ORDER.includes(kind))
            .filter(isVisibleTopLevelCodexKind)
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
    const categoryMode = getCodexCategoryMode(activeKind);
    const isActionArchiveMode = categoryMode === "actionArchive";
    const isAbilityCatalogMode = categoryMode === "abilityArchive";
    const isDiplomacyArchiveMode = categoryMode === "diplomacyArchive";
    const isDistrictArchiveMode = categoryMode === "districtArchive";
    const isEquipmentArchiveMode = categoryMode === "equipmentArchive";
    const isHeroArchiveMode = categoryMode === "heroArchive";
    const isImprovementArchiveMode = categoryMode === "improvementArchive";
    const isStatusArchiveMode = categoryMode === "statusArchive";
    const isTraitArchiveMode = categoryMode === "traitArchive";

    const factFilterConfig = useMemo(
        () => getAbilityArchiveFactFilterConfig(activeKind),
        [activeKind]
    );

    useEffect(() => {
        if (isActionArchiveMode) return;

        setActiveActionType((current) => current ? null : current);
    }, [isActionArchiveMode]);

    const actionTypeOptions = useMemo(
        () => (
            isActionArchiveMode
                ? buildActionTypeFilterOptions(searchFilteredEntries)
                : []
        ),
        [isActionArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isDiplomacyArchiveMode) return;

        setActiveDiplomacyCategory((current) => current ? null : current);
    }, [isDiplomacyArchiveMode]);

    const diplomacyCategoryOptions = useMemo(
        () => (
            isDiplomacyArchiveMode
                ? buildDiplomacyCategoryFilterOptions(searchFilteredEntries)
                : []
        ),
        [isDiplomacyArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isDistrictArchiveMode) return;

        setActiveDistrictCategory((current) => current ? null : current);
    }, [isDistrictArchiveMode]);

    const districtCategoryOptions = useMemo(
        () => (
            isDistrictArchiveMode
                ? buildDistrictCategoryFilterOptions(searchFilteredEntries)
                : []
        ),
        [isDistrictArchiveMode, searchFilteredEntries]
    );

    const factFilterOptions = useMemo(
        () => buildAbilityArchiveFilterOptions(searchFilteredEntries, factFilterConfig, activeFactFilters),
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

    useEffect(() => {
        if (isEquipmentArchiveMode) return;

        setActiveEquipmentFilters((current) => (
            hasActiveEquipmentArchiveFilters(current) ? EMPTY_EQUIPMENT_ARCHIVE_FILTERS : current
        ));
    }, [isEquipmentArchiveMode]);

    const equipmentFilterGroups = useMemo(
        () => (
            isEquipmentArchiveMode
                ? buildEquipmentArchiveFilterGroups(searchFilteredEntries, activeEquipmentFilters)
                : []
        ),
        [activeEquipmentFilters, isEquipmentArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isHeroArchiveMode) return;

        setActiveHeroFilters((current) => (
            hasActiveHeroArchiveFilters(current) ? EMPTY_HERO_ARCHIVE_FILTERS : current
        ));
    }, [isHeroArchiveMode]);

    const heroFilterGroups = useMemo(
        () => (
            isHeroArchiveMode
                ? buildHeroArchiveFilterGroups(searchFilteredEntries, activeHeroFilters)
                : []
        ),
        [activeHeroFilters, isHeroArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isImprovementArchiveMode) return;

        setActiveImprovementCategory((current) => current ? null : current);
    }, [isImprovementArchiveMode]);

    const improvementCategoryOptions = useMemo(
        () => (
            isImprovementArchiveMode
                ? buildImprovementCategoryFilterOptions(searchFilteredEntries)
                : []
        ),
        [isImprovementArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isStatusArchiveMode) return;

        setActiveStatusScope((current) => current ? null : current);
    }, [isStatusArchiveMode]);

    const statusScopeOptions = useMemo(
        () => (
            isStatusArchiveMode
                ? buildStatusScopeFilterOptions(searchFilteredEntries)
                : []
        ),
        [isStatusArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isTraitArchiveMode) return;

        setActiveTraitType((current) => current ? null : current);
    }, [isTraitArchiveMode]);

    const traitTypeOptions = useMemo(
        () => (
            isTraitArchiveMode
                ? buildTraitTypeFilterOptions(searchFilteredEntries)
                : []
        ),
        [isTraitArchiveMode, searchFilteredEntries]
    );

    const filteredEntries = useMemo(
        () => {
            if (isActionArchiveMode) {
                return filterActionEntriesByType(searchFilteredEntries, activeActionType);
            }

            if (isDiplomacyArchiveMode) {
                return filterDiplomacyEntriesByCategory(searchFilteredEntries, activeDiplomacyCategory);
            }

            if (isDistrictArchiveMode) {
                return filterDistrictEntriesByCategory(searchFilteredEntries, activeDistrictCategory);
            }

            if (isAbilityCatalogMode) {
                if (Object.keys(activeFactFilters).length === 0) {
                    return searchFilteredEntries;
                }

                return searchFilteredEntries.filter((entry) =>
                    entryMatchesAbilityArchiveFilters(entry, activeFactFilters, factFilterConfig)
                );
            }

            if (isStatusArchiveMode) {
                return filterStatusEntriesByScope(searchFilteredEntries, activeStatusScope);
            }

            if (isImprovementArchiveMode) {
                return filterImprovementEntriesByCategory(searchFilteredEntries, activeImprovementCategory);
            }

            if (isTraitArchiveMode) {
                return filterTraitEntriesByType(searchFilteredEntries, activeTraitType);
            }

            if (isEquipmentArchiveMode) {
                if (!hasActiveEquipmentArchiveFilters(activeEquipmentFilters)) {
                    return searchFilteredEntries;
                }

                return searchFilteredEntries.filter((entry) =>
                    entryMatchesEquipmentArchiveFilters(entry, activeEquipmentFilters)
                );
            }

            if (isHeroArchiveMode) {
                if (!hasActiveHeroArchiveFilters(activeHeroFilters)) {
                    return searchFilteredEntries;
                }

                return searchFilteredEntries.filter((entry) =>
                    entryMatchesHeroArchiveFilters(entry, activeHeroFilters)
                );
            }

            return searchFilteredEntries;
        },
        [
            activeActionType,
            activeDiplomacyCategory,
            activeDistrictCategory,
            activeEquipmentFilters,
            activeFactFilters,
            activeHeroFilters,
            activeImprovementCategory,
            activeStatusScope,
            activeTraitType,
            factFilterConfig,
            isActionArchiveMode,
            isAbilityCatalogMode,
            isDiplomacyArchiveMode,
            isDistrictArchiveMode,
            isEquipmentArchiveMode,
            isHeroArchiveMode,
            isImprovementArchiveMode,
            isStatusArchiveMode,
            isTraitArchiveMode,
            searchFilteredEntries,
        ]
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
    const activeFactFilterItems = useMemo(
        () => getActiveAbilityArchiveFilterItems(activeFactFilters, factFilterConfig),
        [activeFactFilters, factFilterConfig]
    );
    const abilityArchiveSummary = useMemo(
        () => (
            isAbilityCatalogMode
                ? getAbilityArchiveSummary(activeFactFilterItems, filteredEntries.length)
                : null
        ),
        [activeFactFilterItems, filteredEntries.length, isAbilityCatalogMode]
    );

    const displayEntries = useMemo<CodexListItem[]>(() => {
        const groupedEntries = groupQuestListItems(filteredEntries);

        if (activeKind === ALL_CODEX_KIND) {
            return groupedEntries;
        }

        return [createCodexSummaryEntry(activeKind, activeKindLabel, filteredEntries.length), ...groupedEntries];
    }, [activeKind, activeKindLabel, filteredEntries]);

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
                isDirectRoutableHiddenCodexKind(activeKind) &&
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

    const returnActionFiltersToArchive = useCallback(() => {
        if (!isActionArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isActionArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnDiplomacyFiltersToArchive = useCallback(() => {
        if (!isDiplomacyArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isDiplomacyArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnDistrictFiltersToArchive = useCallback(() => {
        if (!isDistrictArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isDistrictArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnAbilityFiltersToArchive = useCallback(() => {
        if (!isAbilityCatalogMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isAbilityCatalogMode, selectedEntryParam, updateSelectedEntry]);

    const returnStatusFiltersToArchive = useCallback(() => {
        if (!isStatusArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isStatusArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnTraitFiltersToArchive = useCallback(() => {
        if (!isTraitArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isTraitArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnEquipmentFiltersToArchive = useCallback(() => {
        if (!isEquipmentArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isEquipmentArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnHeroFiltersToArchive = useCallback(() => {
        if (!isHeroArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isHeroArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const returnImprovementFiltersToArchive = useCallback(() => {
        if (!isImprovementArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, isImprovementArchiveMode, selectedEntryParam, updateSelectedEntry]);

    const clearActionType = useCallback(() => {
        setActiveActionType(null);
        returnActionFiltersToArchive();
    }, [returnActionFiltersToArchive]);

    const toggleActionType = useCallback((type: ActionArchiveType) => {
        setActiveActionType((current) => current === type ? null : type);
        returnActionFiltersToArchive();
    }, [returnActionFiltersToArchive]);

    const clearDiplomacyCategory = useCallback(() => {
        setActiveDiplomacyCategory(null);
        returnDiplomacyFiltersToArchive();
    }, [returnDiplomacyFiltersToArchive]);

    const toggleDiplomacyCategory = useCallback((category: DiplomacyArchiveCategory) => {
        setActiveDiplomacyCategory((current) => current === category ? null : category);
        returnDiplomacyFiltersToArchive();
    }, [returnDiplomacyFiltersToArchive]);

    const clearDistrictCategory = useCallback(() => {
        setActiveDistrictCategory(null);
        returnDistrictFiltersToArchive();
    }, [returnDistrictFiltersToArchive]);

    const toggleDistrictCategory = useCallback((category: DistrictArchiveCategory) => {
        setActiveDistrictCategory((current) => current === category ? null : category);
        returnDistrictFiltersToArchive();
    }, [returnDistrictFiltersToArchive]);

    const clearFactFilters = useCallback(() => {
        setActiveFactFilters({});
        returnAbilityFiltersToArchive();
    }, [returnAbilityFiltersToArchive]);

    const toggleFactFilter = useCallback((label: string, value: string) => {
        setActiveFactFilters((current) => {
            const next = { ...current };
            if (next[label] === value) {
                delete next[label];
            } else {
                next[label] = value;
            }
            return next;
        });
        returnAbilityFiltersToArchive();
    }, [returnAbilityFiltersToArchive]);

    const clearEquipmentFilters = useCallback(() => {
        setActiveEquipmentFilters(EMPTY_EQUIPMENT_ARCHIVE_FILTERS);
        returnEquipmentFiltersToArchive();
    }, [returnEquipmentFiltersToArchive]);

    const toggleEquipmentFilter = useCallback((filterKey: EquipmentArchiveFilterKey, value: string) => {
        setActiveEquipmentFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnEquipmentFiltersToArchive();
    }, [returnEquipmentFiltersToArchive]);

    const clearHeroFilters = useCallback(() => {
        setActiveHeroFilters(EMPTY_HERO_ARCHIVE_FILTERS);
        returnHeroFiltersToArchive();
    }, [returnHeroFiltersToArchive]);

    const toggleHeroFilter = useCallback((filterKey: HeroArchiveFilterKey, value: string) => {
        setActiveHeroFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnHeroFiltersToArchive();
    }, [returnHeroFiltersToArchive]);

    const clearImprovementCategory = useCallback(() => {
        setActiveImprovementCategory(null);
        returnImprovementFiltersToArchive();
    }, [returnImprovementFiltersToArchive]);

    const toggleImprovementCategory = useCallback((category: ImprovementArchiveCategory) => {
        setActiveImprovementCategory((current) => current === category ? null : category);
        returnImprovementFiltersToArchive();
    }, [returnImprovementFiltersToArchive]);

    const clearStatusScope = useCallback(() => {
        setActiveStatusScope(null);
        returnStatusFiltersToArchive();
    }, [returnStatusFiltersToArchive]);

    const toggleStatusScope = useCallback((scope: string) => {
        setActiveStatusScope((current) => current === scope ? null : scope);
        returnStatusFiltersToArchive();
    }, [returnStatusFiltersToArchive]);

    const clearTraitType = useCallback(() => {
        setActiveTraitType(null);
        returnTraitFiltersToArchive();
    }, [returnTraitFiltersToArchive]);

    const toggleTraitType = useCallback((type: TraitArchiveType) => {
        setActiveTraitType((current) => current === type ? null : type);
        returnTraitFiltersToArchive();
    }, [returnTraitFiltersToArchive]);

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
                <CodexTopPanel
                    activeKind={activeKind}
                    categoryCount={filterOptions.length - 1}
                    categoryShelfOptions={categoryShelfOptions}
                    enableCategoryShelf={!isOverviewState}
                    entryCount={entries.length}
                    resultCount={filteredEntries.length}
                    searchSuggestions={autocompleteEntries}
                    searchValue={query}
                    totalSearchCount={entries.length}
                    useCompactHeader={useCompactHeader}
                    onConfirmSearch={() => {
                        const firstVisibleEntry = filteredEntries[0];
                        if (firstVisibleEntry) {
                            selectEntry(firstVisibleEntry);
                        }
                    }}
                    onSearchChange={setQuery}
                    onSelectCategory={selectKind}
                    onSelectSearchSuggestion={(entry) => {
                        setQuery(entry.displayName);
                        selectEntry(entry);
                    }}
                />

                <div
                    className={`codex-workspace ${isOverviewState ? "codex-workspace--overview" : ""} ${
                        isFullWidthReferenceOverviewState ? "codex-workspace--referenceOverview" : ""
                    } ${
                        isActionArchiveMode ? "codex-workspace--actionArchive" : ""
                    } ${
                        isAbilityCatalogMode ? "codex-workspace--abilityCatalog" : ""
                    } ${
                        isDiplomacyArchiveMode ? "codex-workspace--diplomacyArchive" : ""
                    } ${
                        isDistrictArchiveMode ? "codex-workspace--districtArchive" : ""
                    } ${
                        isEquipmentArchiveMode ? "codex-workspace--equipmentArchive" : ""
                    } ${
                        isHeroArchiveMode ? "codex-workspace--heroArchive" : ""
                    } ${
                        isImprovementArchiveMode ? "codex-workspace--improvementArchive" : ""
                    } ${
                        isStatusArchiveMode ? "codex-workspace--statusArchive" : ""
                    } ${
                        isTraitArchiveMode ? "codex-workspace--traitArchive" : ""
                    }`}
                >
                    <CodexLeftPane
                        ref={resultListRef}
                        actionTotalCount={isActionArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        actionTypeFilter={activeActionType}
                        actionTypeOptions={actionTypeOptions}
                        activeFactFilters={activeFactFilters}
                        activeEquipmentFilters={activeEquipmentFilters}
                        activeHeroFilters={activeHeroFilters}
                        activeKind={activeKind}
                        activeKindLabel={activeKindLabel}
                        diplomacyCategoryFilter={activeDiplomacyCategory}
                        diplomacyCategoryOptions={diplomacyCategoryOptions}
                        diplomacyTotalCount={isDiplomacyArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        districtCategoryFilter={activeDistrictCategory}
                        districtCategoryOptions={districtCategoryOptions}
                        districtTotalCount={isDistrictArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        displayEntries={displayEntries}
                        equipmentFilterGroups={equipmentFilterGroups}
                        error={error}
                        filteredEntryCount={filteredEntries.length}
                        filterOptions={factFilterOptions}
                        heroFilterGroups={heroFilterGroups}
                        improvementCategoryFilter={activeImprovementCategory}
                        improvementCategoryOptions={improvementCategoryOptions}
                        improvementTotalCount={isImprovementArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        isActionArchiveMode={isActionArchiveMode}
                        isAbilityCatalogMode={isAbilityCatalogMode}
                        isDiplomacyArchiveMode={isDiplomacyArchiveMode}
                        isDistrictArchiveMode={isDistrictArchiveMode}
                        isEquipmentArchiveMode={isEquipmentArchiveMode}
                        isHeroArchiveMode={isHeroArchiveMode}
                        isImprovementArchiveMode={isImprovementArchiveMode}
                        isStatusArchiveMode={isStatusArchiveMode}
                        isTraitArchiveMode={isTraitArchiveMode}
                        isVisible={showResultsPane}
                        loading={loading}
                        selectedEntryKey={selectedListItem?.entryKey ?? null}
                        statusScopeFilter={activeStatusScope}
                        statusScopeOptions={statusScopeOptions}
                        traitTotalCount={isTraitArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        traitTypeFilter={activeTraitType}
                        traitTypeOptions={traitTypeOptions}
                        onClearActionType={clearActionType}
                        onClearDiplomacyCategory={clearDiplomacyCategory}
                        onClearDistrictCategory={clearDistrictCategory}
                        onClearFactFilters={clearFactFilters}
                        onClearEquipmentFilters={clearEquipmentFilters}
                        onClearHeroFilters={clearHeroFilters}
                        onClearImprovementCategory={clearImprovementCategory}
                        onClearStatusScope={clearStatusScope}
                        onClearTraitType={clearTraitType}
                        onSelectEntry={(entry) => selectEntry(entry)}
                        onToggleActionType={toggleActionType}
                        onToggleDiplomacyCategory={toggleDiplomacyCategory}
                        onToggleDistrictCategory={toggleDistrictCategory}
                        onToggleEquipmentFilter={toggleEquipmentFilter}
                        onToggleHeroFilter={toggleHeroFilter}
                        onToggleImprovementCategory={toggleImprovementCategory}
                        onToggleStatusScope={toggleStatusScope}
                        onToggleTraitType={toggleTraitType}
                        onToggleFactFilter={toggleFactFilter}
                    />

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
                                    titleOverride={abilityArchiveSummary?.title}
                                    contextOverride={abilityArchiveSummary?.context}
                                    searchQuery={deferredQuery}
                                    hasActiveFilters={hasActiveFactFilters}
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
