import React from "react";
import ActionArchiveRail from "@/components/Codex/ActionArchiveRail";
import AbilityArchiveRail from "@/components/Codex/AbilityArchiveRail";
import CodexResultList from "@/components/Codex/CodexResultList";
import DiplomacyArchiveRail from "@/components/Codex/DiplomacyArchiveRail";
import DistrictArchiveRail from "@/components/Codex/DistrictArchiveRail";
import EquipmentArchiveRail from "@/components/Codex/EquipmentArchiveRail";
import HeroArchiveRail from "@/components/Codex/HeroArchiveRail";
import ImprovementArchiveRail from "@/components/Codex/ImprovementArchiveRail";
import StatusArchiveRail from "@/components/Codex/StatusArchiveRail";
import TraitArchiveRail from "@/components/Codex/TraitArchiveRail";
import {
    type ActiveCodexFactFilters,
    type CodexFactFilterOption,
} from "@/lib/codex/codexAbilityArchiveFilters";
import {
    type ActiveEquipmentArchiveFilters,
    type EquipmentArchiveFilterGroup,
    type EquipmentArchiveFilterKey,
} from "@/lib/codex/codexEquipmentArchiveFilters";
import type {
    ActiveHeroArchiveFilters,
    HeroArchiveFilterGroup,
    HeroArchiveFilterKey,
} from "@/lib/codex/codexHeroArchiveFilters";
import type {
    ImprovementArchiveCategory,
    ImprovementCategoryFilterOption,
} from "@/lib/codex/codexImprovementArchiveFilters";
import type { StatusScopeFilterOption } from "@/lib/codex/codexStatusArchiveFilters";
import type { TraitArchiveType, TraitTypeFilterOption } from "@/lib/codex/codexTraitArchiveFilters";
import type { ActionArchiveType, ActionTypeFilterOption } from "@/lib/codex/codexActionArchiveFilters";
import type {
    DiplomacyArchiveCategory,
    DiplomacyCategoryFilterOption,
} from "@/lib/codex/codexDiplomacyArchiveFilters";
import type {
    DistrictArchiveCategory,
    DistrictCategoryFilterOption,
} from "@/lib/codex/codexDistrictArchiveFilters";
import type { CodexListItem } from "@/lib/codex/codexPresentation";
import { ALL_CODEX_KIND } from "@/lib/codex/codexSearch";

type Props = {
    actionTotalCount: number;
    actionTypeFilter: ActionArchiveType | null;
    actionTypeOptions: readonly ActionTypeFilterOption[];
    activeFactFilters: ActiveCodexFactFilters;
    activeKind: string;
    activeKindLabel: string;
    diplomacyCategoryFilter: DiplomacyArchiveCategory | null;
    diplomacyCategoryOptions: readonly DiplomacyCategoryFilterOption[];
    diplomacyTotalCount: number;
    districtCategoryFilter: DistrictArchiveCategory | null;
    districtCategoryOptions: readonly DistrictCategoryFilterOption[];
    districtTotalCount: number;
    displayEntries: CodexListItem[];
    equipmentFilterGroups: readonly EquipmentArchiveFilterGroup[];
    activeEquipmentFilters: ActiveEquipmentArchiveFilters;
    activeHeroFilters: ActiveHeroArchiveFilters;
    error: string | null;
    filteredEntryCount: number;
    filterOptions: readonly CodexFactFilterOption[];
    improvementCategoryFilter: ImprovementArchiveCategory | null;
    improvementCategoryOptions: readonly ImprovementCategoryFilterOption[];
    improvementTotalCount: number;
    isAbilityCatalogMode: boolean;
    isActionArchiveMode: boolean;
    isDistrictArchiveMode: boolean;
    isEquipmentArchiveMode: boolean;
    isHeroArchiveMode: boolean;
    isImprovementArchiveMode: boolean;
    isDiplomacyArchiveMode: boolean;
    isStatusArchiveMode: boolean;
    isTraitArchiveMode: boolean;
    isVisible: boolean;
    loading: boolean;
    selectedEntryKey: string | null;
    statusScopeFilter: string | null;
    statusScopeOptions: readonly StatusScopeFilterOption[];
    heroFilterGroups: readonly HeroArchiveFilterGroup[];
    traitTotalCount: number;
    traitTypeFilter: TraitArchiveType | null;
    traitTypeOptions: readonly TraitTypeFilterOption[];
    onClearActionType: () => void;
    onClearFactFilters: () => void;
    onClearDiplomacyCategory: () => void;
    onClearDistrictCategory: () => void;
    onClearEquipmentFilters: () => void;
    onClearHeroFilters: () => void;
    onClearImprovementCategory: () => void;
    onClearStatusScope: () => void;
    onClearTraitType: () => void;
    onSelectEntry: (entry: CodexListItem) => void;
    onToggleActionType: (type: ActionArchiveType) => void;
    onToggleDiplomacyCategory: (category: DiplomacyArchiveCategory) => void;
    onToggleDistrictCategory: (category: DistrictArchiveCategory) => void;
    onToggleEquipmentFilter: (filterKey: EquipmentArchiveFilterKey, value: string) => void;
    onToggleHeroFilter: (filterKey: HeroArchiveFilterKey, value: string) => void;
    onToggleImprovementCategory: (category: ImprovementArchiveCategory) => void;
    onToggleStatusScope: (scope: string) => void;
    onToggleTraitType: (type: TraitArchiveType) => void;
    onToggleFactFilter: (label: string, value: string) => void;
};

const CodexLeftPane = React.forwardRef<HTMLDivElement, Props>(function CodexLeftPane(
    {
        actionTotalCount,
        actionTypeFilter,
        actionTypeOptions,
        activeFactFilters,
        activeKind,
        activeKindLabel,
        activeEquipmentFilters,
        activeHeroFilters,
        diplomacyCategoryFilter,
        diplomacyCategoryOptions,
        diplomacyTotalCount,
        districtCategoryFilter,
        districtCategoryOptions,
        districtTotalCount,
        displayEntries,
        equipmentFilterGroups,
        error,
        filteredEntryCount,
        filterOptions,
        heroFilterGroups,
        improvementCategoryFilter,
        improvementCategoryOptions,
        improvementTotalCount,
        isAbilityCatalogMode,
        isActionArchiveMode,
        isDiplomacyArchiveMode,
        isDistrictArchiveMode,
        isEquipmentArchiveMode,
        isHeroArchiveMode,
        isImprovementArchiveMode,
        isStatusArchiveMode,
        isTraitArchiveMode,
        isVisible,
        loading,
        selectedEntryKey,
        statusScopeFilter,
        statusScopeOptions,
        traitTotalCount,
        traitTypeFilter,
        traitTypeOptions,
        onClearActionType,
        onClearDiplomacyCategory,
        onClearDistrictCategory,
        onClearFactFilters,
        onClearEquipmentFilters,
        onClearHeroFilters,
        onClearImprovementCategory,
        onClearStatusScope,
        onClearTraitType,
        onSelectEntry,
        onToggleActionType,
        onToggleDiplomacyCategory,
        onToggleDistrictCategory,
        onToggleEquipmentFilter,
        onToggleHeroFilter,
        onToggleImprovementCategory,
        onToggleStatusScope,
        onToggleTraitType,
        onToggleFactFilter,
    },
    resultListRef
) {
    if (!isVisible) return null;

    return (
        <aside
            className={`codex-resultsPane ${
                isActionArchiveMode || isAbilityCatalogMode || isDiplomacyArchiveMode || isDistrictArchiveMode || isEquipmentArchiveMode || isHeroArchiveMode || isImprovementArchiveMode || isStatusArchiveMode || isTraitArchiveMode
                    ? "codex-resultsPane--catalog"
                    : ""
            }`}
            aria-label={
                isActionArchiveMode
                    ? "Action archive filters"
                    : isAbilityCatalogMode
                    ? "Ability catalog filters"
                    : isDiplomacyArchiveMode
                    ? "Diplomacy archive filters"
                    : isDistrictArchiveMode
                    ? "District archive filters"
                    : isEquipmentArchiveMode
                        ? "Equipment archive filters"
                    : isHeroArchiveMode
                        ? "Hero archive filters"
                    : isImprovementArchiveMode
                        ? "Improvement archive filters"
                    : isStatusArchiveMode
                        ? "Status archive filters"
                    : isTraitArchiveMode
                        ? "Trait archive filters"
                        : "Codex results"
            }
        >
            {!isActionArchiveMode && !isAbilityCatalogMode && !isDiplomacyArchiveMode && !isDistrictArchiveMode && !isEquipmentArchiveMode && !isHeroArchiveMode && !isImprovementArchiveMode && !isStatusArchiveMode && !isTraitArchiveMode ? (
                <div className="codex-resultsPane__header">
                    <div>
                        <div className="codex-sectionLabel">Results</div>
                        <div className="codex-resultsPane__title">
                            {activeKind === ALL_CODEX_KIND
                                ? "All encyclopedia entries"
                                : activeKindLabel}
                        </div>
                    </div>
                    <div className="codex-resultsPane__count">{filteredEntryCount}</div>
                </div>
            ) : null}

            {isActionArchiveMode ? (
                <ActionArchiveRail
                    activeType={actionTypeFilter}
                    options={actionTypeOptions}
                    totalCount={actionTotalCount}
                    onClearType={onClearActionType}
                    onToggleType={onToggleActionType}
                />
            ) : null}

            {isDiplomacyArchiveMode ? (
                <DiplomacyArchiveRail
                    activeCategory={diplomacyCategoryFilter}
                    options={diplomacyCategoryOptions}
                    totalCount={diplomacyTotalCount}
                    onClearCategory={onClearDiplomacyCategory}
                    onToggleCategory={onToggleDiplomacyCategory}
                />
            ) : null}

            {isDistrictArchiveMode ? (
                <DistrictArchiveRail
                    activeCategory={districtCategoryFilter}
                    options={districtCategoryOptions}
                    totalCount={districtTotalCount}
                    onClearCategory={onClearDistrictCategory}
                    onToggleCategory={onToggleDistrictCategory}
                />
            ) : null}

            {isAbilityCatalogMode ? (
                <AbilityArchiveRail
                    activeFilters={activeFactFilters}
                    filterOptions={filterOptions}
                    onClearFilters={onClearFactFilters}
                    onToggleFilter={onToggleFactFilter}
                />
            ) : null}

            {isEquipmentArchiveMode ? (
                <EquipmentArchiveRail
                    activeFilters={activeEquipmentFilters}
                    groups={equipmentFilterGroups}
                    onClearFilters={onClearEquipmentFilters}
                    onToggleFilter={onToggleEquipmentFilter}
                />
            ) : null}

            {isHeroArchiveMode ? (
                <HeroArchiveRail
                    activeFilters={activeHeroFilters}
                    groups={heroFilterGroups}
                    onClearFilters={onClearHeroFilters}
                    onToggleFilter={onToggleHeroFilter}
                />
            ) : null}

            {isImprovementArchiveMode ? (
                <ImprovementArchiveRail
                    activeCategory={improvementCategoryFilter}
                    options={improvementCategoryOptions}
                    totalCount={improvementTotalCount}
                    onClearCategory={onClearImprovementCategory}
                    onToggleCategory={onToggleImprovementCategory}
                />
            ) : null}

            {isStatusArchiveMode ? (
                <StatusArchiveRail
                    activeScope={statusScopeFilter}
                    options={statusScopeOptions}
                    onClearScope={onClearStatusScope}
                    onToggleScope={onToggleStatusScope}
                />
            ) : null}

            {isTraitArchiveMode ? (
                <TraitArchiveRail
                    activeType={traitTypeFilter}
                    options={traitTypeOptions}
                    totalCount={traitTotalCount}
                    onClearType={onClearTraitType}
                    onToggleType={onToggleTraitType}
                />
            ) : null}

            {!isActionArchiveMode && !isAbilityCatalogMode && !isDiplomacyArchiveMode && !isDistrictArchiveMode && !isEquipmentArchiveMode && !isHeroArchiveMode && !isImprovementArchiveMode && !isStatusArchiveMode && !isTraitArchiveMode ? (
                <CodexResultList
                    ref={resultListRef}
                    entries={displayEntries}
                    selectedEntryKey={selectedEntryKey}
                    loading={loading}
                    error={error}
                    onSelect={onSelectEntry}
                />
            ) : null}
        </aside>
    );
});

export default CodexLeftPane;
