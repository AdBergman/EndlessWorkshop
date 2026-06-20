import React from "react";
import AbilityArchiveRail from "@/components/Codex/AbilityArchiveRail";
import CodexResultList from "@/components/Codex/CodexResultList";
import EquipmentArchiveRail from "@/components/Codex/EquipmentArchiveRail";
import StatusArchiveRail from "@/components/Codex/StatusArchiveRail";
import {
    type ActiveCodexFactFilters,
    type CodexFactFilterOption,
} from "@/lib/codex/codexAbilityArchiveFilters";
import {
    type ActiveEquipmentArchiveFilters,
    type EquipmentArchiveFilterGroup,
    type EquipmentArchiveFilterKey,
} from "@/lib/codex/codexEquipmentArchiveFilters";
import type { StatusScopeFilterOption } from "@/lib/codex/codexStatusArchiveFilters";
import type { CodexListItem } from "@/lib/codex/codexPresentation";
import { ALL_CODEX_KIND } from "@/lib/codex/codexSearch";

type Props = {
    activeFactFilters: ActiveCodexFactFilters;
    activeKind: string;
    activeKindLabel: string;
    displayEntries: CodexListItem[];
    equipmentFilterGroups: readonly EquipmentArchiveFilterGroup[];
    activeEquipmentFilters: ActiveEquipmentArchiveFilters;
    error: string | null;
    filteredEntryCount: number;
    filterOptions: readonly CodexFactFilterOption[];
    isAbilityCatalogMode: boolean;
    isEquipmentArchiveMode: boolean;
    isStatusArchiveMode: boolean;
    isVisible: boolean;
    loading: boolean;
    selectedEntryKey: string | null;
    statusScopeFilter: string | null;
    statusScopeOptions: readonly StatusScopeFilterOption[];
    onClearFactFilters: () => void;
    onClearEquipmentFilters: () => void;
    onClearStatusScope: () => void;
    onSelectEntry: (entry: CodexListItem) => void;
    onToggleEquipmentFilter: (filterKey: EquipmentArchiveFilterKey, value: string) => void;
    onToggleStatusScope: (scope: string) => void;
    onToggleFactFilter: (label: string, value: string) => void;
};

const CodexLeftPane = React.forwardRef<HTMLDivElement, Props>(function CodexLeftPane(
    {
        activeFactFilters,
        activeKind,
        activeKindLabel,
        activeEquipmentFilters,
        displayEntries,
        equipmentFilterGroups,
        error,
        filteredEntryCount,
        filterOptions,
        isAbilityCatalogMode,
        isEquipmentArchiveMode,
        isStatusArchiveMode,
        isVisible,
        loading,
        selectedEntryKey,
        statusScopeFilter,
        statusScopeOptions,
        onClearFactFilters,
        onClearEquipmentFilters,
        onClearStatusScope,
        onSelectEntry,
        onToggleEquipmentFilter,
        onToggleStatusScope,
        onToggleFactFilter,
    },
    resultListRef
) {
    if (!isVisible) return null;

    return (
        <aside
            className={`codex-resultsPane ${
                isAbilityCatalogMode || isEquipmentArchiveMode || isStatusArchiveMode ? "codex-resultsPane--catalog" : ""
            }`}
            aria-label={
                isAbilityCatalogMode
                    ? "Ability catalog filters"
                    : isEquipmentArchiveMode
                        ? "Equipment archive filters"
                    : isStatusArchiveMode
                        ? "Status archive filters"
                        : "Codex results"
            }
        >
            {!isAbilityCatalogMode && !isEquipmentArchiveMode && !isStatusArchiveMode ? (
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

            {isStatusArchiveMode ? (
                <StatusArchiveRail
                    activeScope={statusScopeFilter}
                    options={statusScopeOptions}
                    onClearScope={onClearStatusScope}
                    onToggleScope={onToggleStatusScope}
                />
            ) : null}

            {!isAbilityCatalogMode && !isEquipmentArchiveMode && !isStatusArchiveMode ? (
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
