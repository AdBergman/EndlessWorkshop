import type {
    ActiveTechArchiveFilters,
    TechArchiveFilterGroup,
    TechArchiveFilterKey,
} from "@/lib/codex/codexTechArchiveFilters";

type Props = {
    activeFilters: ActiveTechArchiveFilters;
    groups: readonly TechArchiveFilterGroup[];
    onClearFilters: () => void;
    onToggleFilter: (filterKey: TechArchiveFilterKey, value: string) => void;
};

function isActiveFilter(
    activeFilters: ActiveTechArchiveFilters,
    filterKey: TechArchiveFilterKey,
    value: string
): boolean {
    return activeFilters[filterKey] === value;
}

export default function TechArchiveRail({
    activeFilters,
    groups,
    onClearFilters,
    onToggleFilter,
}: Props) {
    const hasActiveFilters = Boolean(activeFilters.era || activeFilters.quadrant || activeFilters.faction);

    return (
        <div className="codex-resultsFilters" aria-label="Tech filters">
            <div className="codex-resultsFilters__controls">
                {groups.map((group, groupIndex) => (
                    <div
                        className="codex-resultsFilters__group"
                        key={group.key}
                        role="group"
                        aria-label={group.label}
                    >
                        <div className="codex-resultsFilters__groupHeader">
                            <span className="codex-resultsFilters__groupLabel">{group.label}</span>
                            {groupIndex === 0 ? (
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
                                const isActive = isActiveFilter(activeFilters, group.key, option.value);

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
