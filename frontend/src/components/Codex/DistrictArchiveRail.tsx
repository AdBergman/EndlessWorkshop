import type {
    ActiveDistrictArchiveFilters,
    DistrictArchiveFilterGroup,
    DistrictArchiveFilterKey,
} from "@/lib/codex/codexDistrictArchiveFilters";

type Props = {
    activeFilters: ActiveDistrictArchiveFilters;
    groups: readonly DistrictArchiveFilterGroup[];
    onClearFilters: () => void;
    onToggleFilter: (filterKey: DistrictArchiveFilterKey, value: string) => void;
};

export default function DistrictArchiveRail({
    activeFilters,
    groups,
    onClearFilters,
    onToggleFilter,
}: Props) {
    const hasActiveFilters = activeFilters.tier !== "1" || Boolean(activeFilters.focus);

    return (
        <div className="codex-resultsFilters" aria-label="District filters">
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
                                    Reset
                                </button>
                            ) : null}
                        </div>

                        <div className="codex-resultsFilters__chips">
                            {group.options.map((option) => {
                                const isActive = activeFilters[group.key] === option.value;

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
