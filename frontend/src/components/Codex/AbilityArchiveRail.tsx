import type {
    ActiveCodexFactFilters,
    CodexFactFilterOption,
} from "@/lib/codex/codexAbilityArchiveFilters";

type Props = {
    activeFilters: ActiveCodexFactFilters;
    filterOptions: readonly CodexFactFilterOption[];
    onClearFilters: () => void;
    onToggleFilter: (label: string, value: string) => void;
};

export default function AbilityArchiveRail({
    activeFilters,
    filterOptions,
    onClearFilters,
    onToggleFilter,
}: Props) {
    if (filterOptions.length === 0) return null;

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className="codex-resultsFilters" aria-label="Abilities filters">
            <div className="codex-resultsFilters__controls">
                {filterOptions.map((filter, index) => (
                    <div
                        key={filter.label}
                        className="codex-resultsFilters__group"
                        role="group"
                        aria-label={filter.displayLabel}
                    >
                        <div className="codex-resultsFilters__groupHeader">
                            <span className="codex-resultsFilters__groupLabel">
                                {filter.displayLabel}
                            </span>
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
                            {filter.values.map((option) => {
                                const isActive = activeFilters[filter.label] === option.value;
                                const isDisabled = option.count === 0;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`codex-resultsFilters__chip ${
                                            isActive ? "is-active" : ""
                                        }`}
                                        onClick={() => {
                                            if (isDisabled) return;
                                            onToggleFilter(filter.label, option.value);
                                        }}
                                        aria-pressed={isActive}
                                        aria-label={`${option.value} ${option.count}`}
                                        aria-disabled={isDisabled || undefined}
                                        disabled={isDisabled}
                                    >
                                        <span>{option.value}</span>
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
