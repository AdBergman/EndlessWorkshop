import type {
    ActiveUnitArchiveFilters,
    UnitArchiveFilterGroup,
    UnitArchiveFilterKey,
} from "@/lib/codex/codexUnitArchiveFilters";

type Props = {
    activeFilters: ActiveUnitArchiveFilters;
    groups: readonly UnitArchiveFilterGroup[];
    onClearFilters: () => void;
    onToggleFilter: (filterKey: UnitArchiveFilterKey, value: string) => void;
};

function isFilterActive(
    activeFilters: ActiveUnitArchiveFilters,
    filterKey: UnitArchiveFilterKey,
    value: string
): boolean {
    return activeFilters[filterKey] === value;
}

export default function UnitArchiveRail({
    activeFilters,
    groups,
    onClearFilters,
    onToggleFilter,
}: Props) {
    const hasActiveFilters = Boolean(activeFilters.class || activeFilters.faction || activeFilters.tier);

    return (
        <div className="codex-resultsFilters" aria-label="Unit filters">
            <div className="codex-resultsFilters__controls">
                {groups.map((group, index) => (
                    <div
                        className="codex-resultsFilters__group"
                        key={group.key}
                        role="group"
                        aria-label={group.label}
                    >
                        <div className="codex-resultsFilters__groupHeader">
                            <span className="codex-resultsFilters__groupLabel">{group.label}</span>
                            {index === 0 ? (
                                <button
                                    type="button"
                                    className={`codex-resultsFilters__clear ${
                                        hasActiveFilters ? "" : "is-hidden"
                                    }`}
                                    onClick={onClearFilters}
                                    aria-hidden={!hasActiveFilters}
                                    disabled={!hasActiveFilters}
                                    tabIndex={hasActiveFilters ? undefined : -1}
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>

                        <div className="codex-resultsFilters__chips">
                            {group.options.map((option) => {
                                const isActive = isFilterActive(activeFilters, group.key, option.value);

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`codex-resultsFilters__chip ${
                                            isActive ? "is-active" : ""
                                        }`}
                                        onClick={() => onToggleFilter(group.key, option.value)}
                                        aria-pressed={isActive}
                                        aria-label={`${option.label} ${option.count}`}
                                    >
                                        <span>{option.label}</span>
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
    );
}
