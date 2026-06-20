import React from "react";
import AbilityArchiveRail from "@/components/Codex/AbilityArchiveRail";
import CodexResultList from "@/components/Codex/CodexResultList";
import StatusArchiveRail from "@/components/Codex/StatusArchiveRail";
import {
    type ActiveCodexFactFilters,
    type CodexFactFilterOption,
} from "@/lib/codex/codexAbilityArchiveFilters";
import type { StatusScopeFilterOption } from "@/lib/codex/codexStatusArchiveFilters";
import type { CodexListItem } from "@/lib/codex/codexPresentation";
import { ALL_CODEX_KIND } from "@/lib/codex/codexSearch";

type Props = {
    activeFactFilters: ActiveCodexFactFilters;
    activeKind: string;
    activeKindLabel: string;
    displayEntries: CodexListItem[];
    error: string | null;
    filteredEntryCount: number;
    filterOptions: readonly CodexFactFilterOption[];
    isAbilityCatalogMode: boolean;
    isStatusArchiveMode: boolean;
    isVisible: boolean;
    loading: boolean;
    selectedEntryKey: string | null;
    statusScopeFilter: string | null;
    statusScopeOptions: readonly StatusScopeFilterOption[];
    onClearFactFilters: () => void;
    onClearStatusScope: () => void;
    onSelectEntry: (entry: CodexListItem) => void;
    onToggleStatusScope: (scope: string) => void;
    onToggleFactFilter: (label: string, value: string) => void;
};

const CodexLeftPane = React.forwardRef<HTMLDivElement, Props>(function CodexLeftPane(
    {
        activeFactFilters,
        activeKind,
        activeKindLabel,
        displayEntries,
        error,
        filteredEntryCount,
        filterOptions,
        isAbilityCatalogMode,
        isStatusArchiveMode,
        isVisible,
        loading,
        selectedEntryKey,
        statusScopeFilter,
        statusScopeOptions,
        onClearFactFilters,
        onClearStatusScope,
        onSelectEntry,
        onToggleStatusScope,
        onToggleFactFilter,
    },
    resultListRef
) {
    if (!isVisible) return null;

    return (
        <aside
            className={`codex-resultsPane ${
                isAbilityCatalogMode || isStatusArchiveMode ? "codex-resultsPane--catalog" : ""
            }`}
            aria-label={
                isAbilityCatalogMode
                    ? "Ability catalog filters"
                    : isStatusArchiveMode
                        ? "Status archive filters"
                        : "Codex results"
            }
        >
            {!isAbilityCatalogMode && !isStatusArchiveMode ? (
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

            {isStatusArchiveMode ? (
                <StatusArchiveRail
                    activeScope={statusScopeFilter}
                    options={statusScopeOptions}
                    onClearScope={onClearStatusScope}
                    onToggleScope={onToggleStatusScope}
                />
            ) : null}

            {!isAbilityCatalogMode && !isStatusArchiveMode ? (
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
