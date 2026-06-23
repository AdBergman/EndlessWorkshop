import React from "react";
import ActionArchiveRail from "@/components/Codex/ActionArchiveRail";
import AbilityArchiveRail from "@/components/Codex/AbilityArchiveRail";
import CodexResultList from "@/components/Codex/CodexResultList";
import DiplomacyArchiveRail from "@/components/Codex/DiplomacyArchiveRail";
import DistrictArchiveRail from "@/components/Codex/DistrictArchiveRail";
import EquipmentArchiveRail from "@/components/Codex/EquipmentArchiveRail";
import HeroArchiveRail from "@/components/Codex/HeroArchiveRail";
import ImprovementArchiveRail from "@/components/Codex/ImprovementArchiveRail";
import PopulationArchiveRail from "@/components/Codex/PopulationArchiveRail";
import QuestArchiveRail from "@/components/Codex/QuestArchiveRail";
import StatusArchiveRail from "@/components/Codex/StatusArchiveRail";
import TechArchiveRail from "@/components/Codex/TechArchiveRail";
import TraitArchiveRail from "@/components/Codex/TraitArchiveRail";
import UnitArchiveRail from "@/components/Codex/UnitArchiveRail";
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
import type {
    ActiveTechArchiveFilters,
    TechArchiveFilterGroup,
    TechArchiveFilterKey,
} from "@/lib/codex/codexTechArchiveFilters";
import type { TraitArchiveType, TraitTypeFilterOption } from "@/lib/codex/codexTraitArchiveFilters";
import type {
    ActiveUnitArchiveFilters,
    UnitArchiveFilterGroup,
    UnitArchiveFilterKey,
} from "@/lib/codex/codexUnitArchiveFilters";
import type { ActionArchiveType, ActionTypeFilterOption } from "@/lib/codex/codexActionArchiveFilters";
import type {
    PopulationArchiveFilterValue,
    PopulationTypeFilterOption,
} from "@/lib/codex/codexPopulationArchiveFilters";
import type {
    DiplomacyArchiveCategory,
    DiplomacyCategoryFilterOption,
} from "@/lib/codex/codexDiplomacyArchiveFilters";
import type {
    DistrictArchiveCategory,
    DistrictCategoryFilterOption,
} from "@/lib/codex/codexDistrictArchiveFilters";
import type {
    QuestArchiveFilterValue,
    QuestCategoryFilterGroup,
} from "@/lib/codex/codexQuestArchiveFilters";
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
    activeTechFilters: ActiveTechArchiveFilters;
    activeUnitFilters: ActiveUnitArchiveFilters;
    error: string | null;
    filteredEntryCount: number;
    filterOptions: readonly CodexFactFilterOption[];
    improvementCategoryFilter: ImprovementArchiveCategory | null;
    improvementCategoryOptions: readonly ImprovementCategoryFilterOption[];
    improvementTotalCount: number;
    populationTypeFilter: PopulationArchiveFilterValue | null;
    populationTypeOptions: readonly PopulationTypeFilterOption[];
    populationTotalCount: number;
    isAbilityCatalogMode: boolean;
    isActionArchiveMode: boolean;
    isDistrictArchiveMode: boolean;
    isEquipmentArchiveMode: boolean;
    isHeroArchiveMode: boolean;
    isImprovementArchiveMode: boolean;
    isPopulationArchiveMode: boolean;
    isQuestArchiveMode: boolean;
    isDiplomacyArchiveMode: boolean;
    isStatusArchiveMode: boolean;
    isTechArchiveMode: boolean;
    isTraitArchiveMode: boolean;
    isUnitArchiveMode: boolean;
    isVisible: boolean;
    loading: boolean;
    selectedEntryKey: string | null;
    questCategoryFilter: QuestArchiveFilterValue | null;
    questCategoryGroups: readonly QuestCategoryFilterGroup[];
    questTotalCount: number;
    statusScopeFilter: string | null;
    statusScopeOptions: readonly StatusScopeFilterOption[];
    techFilterGroups: readonly TechArchiveFilterGroup[];
    heroFilterGroups: readonly HeroArchiveFilterGroup[];
    traitTotalCount: number;
    traitTypeFilter: TraitArchiveType | null;
    traitTypeOptions: readonly TraitTypeFilterOption[];
    unitFilterGroups: readonly UnitArchiveFilterGroup[];
    onClearActionType: () => void;
    onClearFactFilters: () => void;
    onClearDiplomacyCategory: () => void;
    onClearDistrictCategory: () => void;
    onClearEquipmentFilters: () => void;
    onClearHeroFilters: () => void;
    onClearUnitFilters: () => void;
    onClearImprovementCategory: () => void;
    onClearPopulationType: () => void;
    onClearQuestCategory: () => void;
    onClearStatusScope: () => void;
    onClearTechFilters: () => void;
    onClearTraitType: () => void;
    onSelectEntry: (entry: CodexListItem) => void;
    onToggleActionType: (type: ActionArchiveType) => void;
    onToggleDiplomacyCategory: (category: DiplomacyArchiveCategory) => void;
    onToggleDistrictCategory: (category: DistrictArchiveCategory) => void;
    onToggleEquipmentFilter: (filterKey: EquipmentArchiveFilterKey, value: string) => void;
    onToggleHeroFilter: (filterKey: HeroArchiveFilterKey, value: string) => void;
    onToggleUnitFilter: (filterKey: UnitArchiveFilterKey, value: string) => void;
    onToggleImprovementCategory: (category: ImprovementArchiveCategory) => void;
    onTogglePopulationType: (type: PopulationArchiveFilterValue) => void;
    onToggleQuestCategory: (category: QuestArchiveFilterValue) => void;
    onToggleStatusScope: (scope: string) => void;
    onToggleTechFilter: (filterKey: TechArchiveFilterKey, value: string) => void;
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
        activeTechFilters,
        activeUnitFilters,
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
        populationTypeFilter,
        populationTypeOptions,
        populationTotalCount,
        isAbilityCatalogMode,
        isActionArchiveMode,
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
        isVisible,
        loading,
        selectedEntryKey,
        questCategoryFilter,
        questCategoryGroups,
        questTotalCount,
        statusScopeFilter,
        statusScopeOptions,
        techFilterGroups,
        traitTotalCount,
        traitTypeFilter,
        traitTypeOptions,
        unitFilterGroups,
        onClearActionType,
        onClearDiplomacyCategory,
        onClearDistrictCategory,
        onClearFactFilters,
        onClearEquipmentFilters,
        onClearHeroFilters,
        onClearUnitFilters,
        onClearImprovementCategory,
        onClearPopulationType,
        onClearQuestCategory,
        onClearStatusScope,
        onClearTechFilters,
        onClearTraitType,
        onSelectEntry,
        onToggleActionType,
        onToggleDiplomacyCategory,
        onToggleDistrictCategory,
        onToggleEquipmentFilter,
        onToggleHeroFilter,
        onToggleUnitFilter,
        onToggleImprovementCategory,
        onTogglePopulationType,
        onToggleQuestCategory,
        onToggleStatusScope,
        onToggleTechFilter,
        onToggleTraitType,
        onToggleFactFilter,
    },
    resultListRef
) {
    if (!isVisible) return null;

    return (
        <aside
            className={`codex-resultsPane ${
                isActionArchiveMode || isAbilityCatalogMode || isDiplomacyArchiveMode || isDistrictArchiveMode || isEquipmentArchiveMode || isHeroArchiveMode || isImprovementArchiveMode || isStatusArchiveMode || isTechArchiveMode || isTraitArchiveMode
                    || isPopulationArchiveMode || isQuestArchiveMode || isUnitArchiveMode
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
                    : isUnitArchiveMode
                        ? "Unit archive filters"
                    : isImprovementArchiveMode
                        ? "Improvement archive filters"
                    : isPopulationArchiveMode
                        ? "Population archive filters"
                    : isQuestArchiveMode
                        ? "Quest archive filters"
                    : isStatusArchiveMode
                        ? "Status archive filters"
                    : isTechArchiveMode
                        ? "Tech archive filters"
                    : isTraitArchiveMode
                        ? "Trait archive filters"
                        : "Codex results"
            }
        >
            {!isActionArchiveMode && !isAbilityCatalogMode && !isDiplomacyArchiveMode && !isDistrictArchiveMode && !isEquipmentArchiveMode && !isHeroArchiveMode && !isUnitArchiveMode && !isImprovementArchiveMode && !isPopulationArchiveMode && !isQuestArchiveMode && !isStatusArchiveMode && !isTechArchiveMode && !isTraitArchiveMode ? (
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

            {isQuestArchiveMode ? (
                <QuestArchiveRail
                    activeCategory={questCategoryFilter}
                    groups={questCategoryGroups}
                    totalCount={questTotalCount}
                    onClearCategory={onClearQuestCategory}
                    onToggleCategory={onToggleQuestCategory}
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

            {isUnitArchiveMode ? (
                <UnitArchiveRail
                    activeFilters={activeUnitFilters}
                    groups={unitFilterGroups}
                    onClearFilters={onClearUnitFilters}
                    onToggleFilter={onToggleUnitFilter}
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

            {isPopulationArchiveMode ? (
                <PopulationArchiveRail
                    activeType={populationTypeFilter}
                    options={populationTypeOptions}
                    totalCount={populationTotalCount}
                    onClearType={onClearPopulationType}
                    onToggleType={onTogglePopulationType}
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

            {isTechArchiveMode ? (
                <TechArchiveRail
                    activeFilters={activeTechFilters}
                    groups={techFilterGroups}
                    onClearFilters={onClearTechFilters}
                    onToggleFilter={onToggleTechFilter}
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

            {!isActionArchiveMode && !isAbilityCatalogMode && !isDiplomacyArchiveMode && !isDistrictArchiveMode && !isEquipmentArchiveMode && !isHeroArchiveMode && !isUnitArchiveMode && !isImprovementArchiveMode && !isPopulationArchiveMode && !isQuestArchiveMode && !isStatusArchiveMode && !isTechArchiveMode && !isTraitArchiveMode ? (
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
