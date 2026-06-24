import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { apiClient, type DataFreshness } from "@/api/apiClient";
import CodexEntryDetail from "@/components/Codex/CodexEntryDetail";
import CodexLeftPane from "@/components/Codex/CodexLeftPane";
import CodexOverview, { type CodexOverviewFreshness } from "@/components/Codex/CodexOverview";
import CodexSummaryDetail from "@/components/Codex/CodexSummaryDetail";
import CodexTopPanel from "@/components/Codex/CodexTopPanel";
import {
    createCodexSummaryEntry,
    formatCodexKindLabel,
    getCodexSummaryEntryKey,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
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
    buildQuestCategoryFilterGroups,
    filterQuestEntriesByCategory,
    type QuestArchiveFilterValue,
} from "@/lib/codex/codexQuestArchiveFilters";
import {
    buildPopulationTypeFilterOptions,
    filterPopulationEntriesByType,
    type PopulationArchiveFilterValue,
} from "@/lib/codex/codexPopulationArchiveFilters";
import {
    buildStatusScopeFilterOptions,
    filterStatusEntriesByScope,
} from "@/lib/codex/codexStatusArchiveFilters";
import {
    buildTechArchiveFilterGroups,
    EMPTY_TECH_ARCHIVE_FILTERS,
    entryMatchesTechArchiveFilters,
    hasActiveTechArchiveFilters,
    type ActiveTechArchiveFilters,
    type TechArchiveFilterKey,
} from "@/lib/codex/codexTechArchiveFilters";
import {
    buildTraitTypeFilterOptions,
    filterTraitEntriesByType,
    type TraitArchiveType,
} from "@/lib/codex/codexTraitArchiveFilters";
import {
    buildUnitArchiveFilterGroups,
    EMPTY_UNIT_ARCHIVE_FILTERS,
    entryMatchesUnitArchiveFilters,
    hasActiveUnitArchiveFilters,
    type ActiveUnitArchiveFilters,
    type UnitArchiveFilterKey,
} from "@/lib/codex/codexUnitArchiveFilters";
import {
    getCodexCategoryMode,
    isLocalCodexTopLevelVisibilityEnabled,
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

function formatCodexSnapshotDate(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
        year: "numeric",
    }).format(date);
}

function toCodexOverviewFreshness(dataFreshness: DataFreshness | null | undefined): CodexOverviewFreshness | null {
    if (
        !dataFreshness?.available ||
        !dataFreshness.game ||
        !dataFreshness.gameVersion ||
        !dataFreshness.exportedAtUtc
    ) {
        return null;
    }

    const snapshotDate = formatCodexSnapshotDate(dataFreshness.exportedAtUtc);
    if (!snapshotDate) return null;

    return {
        mainLine: `${dataFreshness.game} v${dataFreshness.gameVersion}`,
        snapshotDate,
    };
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
    const [activeUnitFilters, setActiveUnitFilters] = useState<ActiveUnitArchiveFilters>(
        EMPTY_UNIT_ARCHIVE_FILTERS
    );
    const [activeImprovementCategory, setActiveImprovementCategory] = useState<ImprovementArchiveCategory | null>(null);
    const [activePopulationType, setActivePopulationType] = useState<PopulationArchiveFilterValue | null>(null);
    const [activeQuestCategory, setActiveQuestCategory] = useState<QuestArchiveFilterValue | null>(null);
    const [activeStatusScope, setActiveStatusScope] = useState<string | null>(null);
    const [activeTechFilters, setActiveTechFilters] = useState<ActiveTechArchiveFilters>(
        EMPTY_TECH_ARCHIVE_FILTERS
    );
    const [activeTraitType, setActiveTraitType] = useState<TraitArchiveType | null>(null);
    const [dataFreshness, setDataFreshness] = useState<CodexOverviewFreshness | null>(null);

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

    useEffect(() => {
        let cancelled = false;

        apiClient.getDataFreshness()
            .then((nextDataFreshness) => {
                if (cancelled) return;

                setDataFreshness(toCodexOverviewFreshness(nextDataFreshness));
            })
            .catch(() => {
                if (cancelled) return;

                setDataFreshness(null);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const includeLocalOnlyCategories = isLocalCodexTopLevelVisibilityEnabled();

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
            .filter((kind) => isVisibleTopLevelCodexKind(kind, {
                includeLocalOnly: includeLocalOnlyCategories,
            }));
        const extraKinds = Array.from(kindCounts.keys())
            .filter((kind) => !PREFERRED_CODEX_KIND_ORDER.includes(kind))
            .filter((kind) => isVisibleTopLevelCodexKind(kind, {
                includeLocalOnly: includeLocalOnlyCategories,
            }))
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
    }, [entries, includeLocalOnlyCategories]);

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
    const isPopulationArchiveMode = categoryMode === "populationArchive";
    const isQuestArchiveMode = categoryMode === "questArchive";
    const isStatusArchiveMode = categoryMode === "statusArchive";
    const isTechArchiveMode = categoryMode === "techArchive";
    const isTraitArchiveMode = categoryMode === "traitArchive";
    const isUnitArchiveMode = categoryMode === "unitArchive";

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
        if (isUnitArchiveMode) return;

        setActiveUnitFilters((current) => (
            hasActiveUnitArchiveFilters(current) ? EMPTY_UNIT_ARCHIVE_FILTERS : current
        ));
    }, [isUnitArchiveMode]);

    const unitFilterGroups = useMemo(
        () => (
            isUnitArchiveMode
                ? buildUnitArchiveFilterGroups(searchFilteredEntries, activeUnitFilters)
                : []
        ),
        [activeUnitFilters, isUnitArchiveMode, searchFilteredEntries]
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
        if (isPopulationArchiveMode) return;

        setActivePopulationType((current) => current ? null : current);
    }, [isPopulationArchiveMode]);

    const populationTypeOptions = useMemo(
        () => (
            isPopulationArchiveMode
                ? buildPopulationTypeFilterOptions(searchFilteredEntries)
                : []
        ),
        [isPopulationArchiveMode, searchFilteredEntries]
    );

    useEffect(() => {
        if (isQuestArchiveMode) return;

        setActiveQuestCategory((current) => current ? null : current);
    }, [isQuestArchiveMode]);

    const codexReferenceIndexes = useMemo(
        () => ({ entriesByKey, entriesByKindKey }),
        [entriesByKey, entriesByKindKey]
    );

    const questCategoryGroups = useMemo(
        () => (
            isQuestArchiveMode
                ? buildQuestCategoryFilterGroups(searchFilteredEntries, codexReferenceIndexes)
                : []
        ),
        [codexReferenceIndexes, isQuestArchiveMode, searchFilteredEntries]
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
        if (isTechArchiveMode) return;

        setActiveTechFilters((current) => (
            hasActiveTechArchiveFilters(current) ? EMPTY_TECH_ARCHIVE_FILTERS : current
        ));
    }, [isTechArchiveMode]);

    const techFilterGroups = useMemo(
        () => (
            isTechArchiveMode
                ? buildTechArchiveFilterGroups(searchFilteredEntries, activeTechFilters)
                : []
        ),
        [activeTechFilters, isTechArchiveMode, searchFilteredEntries]
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

            if (isTechArchiveMode) {
                if (!hasActiveTechArchiveFilters(activeTechFilters)) {
                    return searchFilteredEntries;
                }

                return searchFilteredEntries.filter((entry) =>
                    entryMatchesTechArchiveFilters(entry, activeTechFilters)
                );
            }

            if (isImprovementArchiveMode) {
                return filterImprovementEntriesByCategory(searchFilteredEntries, activeImprovementCategory);
            }

            if (isPopulationArchiveMode) {
                return filterPopulationEntriesByType(searchFilteredEntries, activePopulationType);
            }

            if (isQuestArchiveMode) {
                return filterQuestEntriesByCategory(searchFilteredEntries, activeQuestCategory, codexReferenceIndexes);
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

            if (isUnitArchiveMode) {
                if (!hasActiveUnitArchiveFilters(activeUnitFilters)) {
                    return searchFilteredEntries;
                }

                return searchFilteredEntries.filter((entry) =>
                    entryMatchesUnitArchiveFilters(entry, activeUnitFilters)
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
            activePopulationType,
            activeQuestCategory,
            codexReferenceIndexes,
            activeStatusScope,
            activeTechFilters,
            activeTraitType,
            activeUnitFilters,
            factFilterConfig,
            isActionArchiveMode,
            isAbilityCatalogMode,
            isDiplomacyArchiveMode,
            isDistrictArchiveMode,
            isEquipmentArchiveMode,
            isHeroArchiveMode,
            isImprovementArchiveMode,
            isPopulationArchiveMode,
            isQuestArchiveMode,
            isStatusArchiveMode,
            isTechArchiveMode,
            isTraitArchiveMode,
            isUnitArchiveMode,
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
        if (activeKind === ALL_CODEX_KIND) {
            return filteredEntries;
        }

        return [createCodexSummaryEntry(activeKind, activeKindLabel, filteredEntries.length), ...filteredEntries];
    }, [activeKind, activeKindLabel, filteredEntries]);

    const groupedFilteredEntries = useMemo(
        () => filteredEntries,
        [filteredEntries]
    );

    const selectedListItem = useMemo(() => {
        if (!selectedEntryKey) return null;

        for (const entry of displayEntries) {
            if (entry.entryKey === selectedEntryKey) return entry;
        }

        return null;
    }, [displayEntries, selectedEntryKey]);

    const selectedEntry = useMemo(
        () => (
            selectedListItem && !isCodexSummaryEntry(selectedListItem)
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
    const isOverviewLoading = isOverviewState && loading && entries.length === 0;
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
        () => resolveRelatedEntries(selectedEntry, codexReferenceIndexes),
        [codexReferenceIndexes, selectedEntry]
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

        const scrollEntryKey = selectedListItem.entryKey;
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
    }, [selectedListItem]);

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

    const returnFiltersToArchive = useCallback((isArchiveMode: boolean) => {
        if (!isArchiveMode || !selectedEntryParam) return;

        updateSelectedEntry(null, { category: activeKind });
    }, [activeKind, selectedEntryParam, updateSelectedEntry]);

    const clearActionType = useCallback(() => {
        setActiveActionType(null);
        returnFiltersToArchive(isActionArchiveMode);
    }, [isActionArchiveMode, returnFiltersToArchive]);

    const toggleActionType = useCallback((type: ActionArchiveType) => {
        setActiveActionType((current) => current === type ? null : type);
        returnFiltersToArchive(isActionArchiveMode);
    }, [isActionArchiveMode, returnFiltersToArchive]);

    const clearDiplomacyCategory = useCallback(() => {
        setActiveDiplomacyCategory(null);
        returnFiltersToArchive(isDiplomacyArchiveMode);
    }, [isDiplomacyArchiveMode, returnFiltersToArchive]);

    const toggleDiplomacyCategory = useCallback((category: DiplomacyArchiveCategory) => {
        setActiveDiplomacyCategory((current) => current === category ? null : category);
        returnFiltersToArchive(isDiplomacyArchiveMode);
    }, [isDiplomacyArchiveMode, returnFiltersToArchive]);

    const clearDistrictCategory = useCallback(() => {
        setActiveDistrictCategory(null);
        returnFiltersToArchive(isDistrictArchiveMode);
    }, [isDistrictArchiveMode, returnFiltersToArchive]);

    const toggleDistrictCategory = useCallback((category: DistrictArchiveCategory) => {
        setActiveDistrictCategory((current) => current === category ? null : category);
        returnFiltersToArchive(isDistrictArchiveMode);
    }, [isDistrictArchiveMode, returnFiltersToArchive]);

    const clearFactFilters = useCallback(() => {
        setActiveFactFilters({});
        returnFiltersToArchive(isAbilityCatalogMode);
    }, [isAbilityCatalogMode, returnFiltersToArchive]);

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
        returnFiltersToArchive(isAbilityCatalogMode);
    }, [isAbilityCatalogMode, returnFiltersToArchive]);

    const clearEquipmentFilters = useCallback(() => {
        setActiveEquipmentFilters(EMPTY_EQUIPMENT_ARCHIVE_FILTERS);
        returnFiltersToArchive(isEquipmentArchiveMode);
    }, [isEquipmentArchiveMode, returnFiltersToArchive]);

    const toggleEquipmentFilter = useCallback((filterKey: EquipmentArchiveFilterKey, value: string) => {
        setActiveEquipmentFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnFiltersToArchive(isEquipmentArchiveMode);
    }, [isEquipmentArchiveMode, returnFiltersToArchive]);

    const clearHeroFilters = useCallback(() => {
        setActiveHeroFilters(EMPTY_HERO_ARCHIVE_FILTERS);
        returnFiltersToArchive(isHeroArchiveMode);
    }, [isHeroArchiveMode, returnFiltersToArchive]);

    const toggleHeroFilter = useCallback((filterKey: HeroArchiveFilterKey, value: string) => {
        setActiveHeroFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnFiltersToArchive(isHeroArchiveMode);
    }, [isHeroArchiveMode, returnFiltersToArchive]);

    const clearUnitFilters = useCallback(() => {
        setActiveUnitFilters(EMPTY_UNIT_ARCHIVE_FILTERS);
        returnFiltersToArchive(isUnitArchiveMode);
    }, [isUnitArchiveMode, returnFiltersToArchive]);

    const toggleUnitFilter = useCallback((filterKey: UnitArchiveFilterKey, value: string) => {
        setActiveUnitFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnFiltersToArchive(isUnitArchiveMode);
    }, [isUnitArchiveMode, returnFiltersToArchive]);

    const clearImprovementCategory = useCallback(() => {
        setActiveImprovementCategory(null);
        returnFiltersToArchive(isImprovementArchiveMode);
    }, [isImprovementArchiveMode, returnFiltersToArchive]);

    const toggleImprovementCategory = useCallback((category: ImprovementArchiveCategory) => {
        setActiveImprovementCategory((current) => current === category ? null : category);
        returnFiltersToArchive(isImprovementArchiveMode);
    }, [isImprovementArchiveMode, returnFiltersToArchive]);

    const clearPopulationType = useCallback(() => {
        setActivePopulationType(null);
        returnFiltersToArchive(isPopulationArchiveMode);
    }, [isPopulationArchiveMode, returnFiltersToArchive]);

    const togglePopulationType = useCallback((type: PopulationArchiveFilterValue) => {
        setActivePopulationType((current) => current === type ? null : type);
        returnFiltersToArchive(isPopulationArchiveMode);
    }, [isPopulationArchiveMode, returnFiltersToArchive]);

    const clearQuestCategory = useCallback(() => {
        setActiveQuestCategory(null);
        returnFiltersToArchive(isQuestArchiveMode);
    }, [isQuestArchiveMode, returnFiltersToArchive]);

    const toggleQuestCategory = useCallback((category: QuestArchiveFilterValue) => {
        setActiveQuestCategory((current) => current === category ? null : category);
        returnFiltersToArchive(isQuestArchiveMode);
    }, [isQuestArchiveMode, returnFiltersToArchive]);

    const clearStatusScope = useCallback(() => {
        setActiveStatusScope(null);
        returnFiltersToArchive(isStatusArchiveMode);
    }, [isStatusArchiveMode, returnFiltersToArchive]);

    const toggleStatusScope = useCallback((scope: string) => {
        setActiveStatusScope((current) => current === scope ? null : scope);
        returnFiltersToArchive(isStatusArchiveMode);
    }, [isStatusArchiveMode, returnFiltersToArchive]);

    const clearTechFilters = useCallback(() => {
        setActiveTechFilters(EMPTY_TECH_ARCHIVE_FILTERS);
        returnFiltersToArchive(isTechArchiveMode);
    }, [isTechArchiveMode, returnFiltersToArchive]);

    const toggleTechFilter = useCallback((filterKey: TechArchiveFilterKey, value: string) => {
        setActiveTechFilters((current) => ({
            ...current,
            [filterKey]: current[filterKey] === value ? null : value,
        }));
        returnFiltersToArchive(isTechArchiveMode);
    }, [isTechArchiveMode, returnFiltersToArchive]);

    const clearTraitType = useCallback(() => {
        setActiveTraitType(null);
        returnFiltersToArchive(isTraitArchiveMode);
    }, [isTraitArchiveMode, returnFiltersToArchive]);

    const toggleTraitType = useCallback((type: TraitArchiveType) => {
        setActiveTraitType((current) => current === type ? null : type);
        returnFiltersToArchive(isTraitArchiveMode);
    }, [isTraitArchiveMode, returnFiltersToArchive]);

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
                    categoryShelfOptions={categoryShelfOptions}
                    enableCategoryShelf={!isOverviewState}
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
                        isUnitArchiveMode ? "codex-workspace--unitArchive" : ""
                    } ${
                        isImprovementArchiveMode ? "codex-workspace--improvementArchive" : ""
                    } ${
                        isPopulationArchiveMode ? "codex-workspace--populationArchive" : ""
                    } ${
                        isQuestArchiveMode ? "codex-workspace--questArchive" : ""
                    } ${
                        isStatusArchiveMode ? "codex-workspace--statusArchive" : ""
                    } ${
                        isTechArchiveMode ? "codex-workspace--techArchive" : ""
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
                        activeTechFilters={activeTechFilters}
                        activeUnitFilters={activeUnitFilters}
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
                        populationTypeFilter={activePopulationType}
                        populationTypeOptions={populationTypeOptions}
                        populationTotalCount={isPopulationArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        isActionArchiveMode={isActionArchiveMode}
                        isAbilityCatalogMode={isAbilityCatalogMode}
                        isDiplomacyArchiveMode={isDiplomacyArchiveMode}
                        isDistrictArchiveMode={isDistrictArchiveMode}
                        isEquipmentArchiveMode={isEquipmentArchiveMode}
                        isHeroArchiveMode={isHeroArchiveMode}
                        isImprovementArchiveMode={isImprovementArchiveMode}
                        isPopulationArchiveMode={isPopulationArchiveMode}
                        isQuestArchiveMode={isQuestArchiveMode}
                        isStatusArchiveMode={isStatusArchiveMode}
                        isTechArchiveMode={isTechArchiveMode}
                        isTraitArchiveMode={isTraitArchiveMode}
                        isUnitArchiveMode={isUnitArchiveMode}
                        isVisible={showResultsPane}
                        loading={loading}
                        questCategoryFilter={activeQuestCategory}
                        questCategoryGroups={questCategoryGroups}
                        questTotalCount={isQuestArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        selectedEntryKey={selectedListItem?.entryKey ?? null}
                        statusScopeFilter={activeStatusScope}
                        statusScopeOptions={statusScopeOptions}
                        techFilterGroups={techFilterGroups}
                        traitTotalCount={isTraitArchiveMode ? searchFilteredEntries.length : filteredEntries.length}
                        traitTypeFilter={activeTraitType}
                        traitTypeOptions={traitTypeOptions}
                        unitFilterGroups={unitFilterGroups}
                        onClearActionType={clearActionType}
                        onClearDiplomacyCategory={clearDiplomacyCategory}
                        onClearDistrictCategory={clearDistrictCategory}
                        onClearFactFilters={clearFactFilters}
                        onClearEquipmentFilters={clearEquipmentFilters}
                        onClearHeroFilters={clearHeroFilters}
                        onClearUnitFilters={clearUnitFilters}
                        onClearImprovementCategory={clearImprovementCategory}
                        onClearPopulationType={clearPopulationType}
                        onClearQuestCategory={clearQuestCategory}
                        onClearStatusScope={clearStatusScope}
                        onClearTechFilters={clearTechFilters}
                        onClearTraitType={clearTraitType}
                        onSelectEntry={(entry) => selectEntry(entry)}
                        onToggleActionType={toggleActionType}
                        onToggleDiplomacyCategory={toggleDiplomacyCategory}
                        onToggleDistrictCategory={toggleDistrictCategory}
                        onToggleEquipmentFilter={toggleEquipmentFilter}
                        onToggleHeroFilter={toggleHeroFilter}
                        onToggleUnitFilter={toggleUnitFilter}
                        onToggleImprovementCategory={toggleImprovementCategory}
                        onTogglePopulationType={togglePopulationType}
                        onToggleQuestCategory={toggleQuestCategory}
                        onToggleStatusScope={toggleStatusScope}
                        onToggleTechFilter={toggleTechFilter}
                        onToggleTraitType={toggleTraitType}
                        onToggleFactFilter={toggleFactFilter}
                    />

                    <section
                        className="codex-detailPane"
                        aria-label={isOverviewState ? "Codex overview" : "Selected codex entry"}
                    >
                        <div className="codex-detailPane__body">
                            {isOverviewState ? (
                                <CodexOverview
                                    dataFreshness={dataFreshness}
                                    isLoading={isOverviewLoading}
                                    options={overviewOptions}
                                    onSelectKind={selectKind}
                                />
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
