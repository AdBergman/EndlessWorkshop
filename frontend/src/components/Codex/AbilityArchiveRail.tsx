import type {
    ActiveCodexFactFilterItem,
    ActiveCodexFactFilters,
    CodexFactFilterOption,
} from "@/lib/codex/codexAbilityArchiveFilters";

type Props = {
    activeFilters: ActiveCodexFactFilters;
    activeFilterItems: readonly ActiveCodexFactFilterItem[];
    filterOptions: readonly CodexFactFilterOption[];
    onRemoveFilter: (label: string) => void;
    onToggleFilter: (label: string, value: string) => void;
};

export default function AbilityArchiveRail({
    activeFilters,
    activeFilterItems,
    filterOptions,
    onRemoveFilter,
    onToggleFilter,
}: Props) {
    if (filterOptions.length === 0) return null;

    return (
        <div className="codex-resultsFilters" aria-label="Abilities filters">
            <div className="codex-resultsFilters__controls">
                {activeFilterItems.length > 0 ? (
                    <div className="codex-resultsFilters__activeGroup">
                        <span className="codex-resultsFilters__groupLabel">Current shelf</span>
                        <div
                            className="codex-resultsFilters__active"
                            aria-label="Active filters"
                        >
                            {activeFilterItems.map((item) => (
                                <button
                                    key={`${item.label}-${item.value}`}
                                    type="button"
                                    className="codex-resultsFilters__activeChip"
                                    onClick={() => onRemoveFilter(item.label)}
                                    aria-label={`Remove ${item.displayLabel}: ${item.value}`}
                                >
                                    <span>{item.value}</span>
                                    <span aria-hidden="true">x</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {filterOptions.map((filter) => (
                    <div
                        key={filter.label}
                        className="codex-resultsFilters__group"
                        role="group"
                        aria-label={filter.displayLabel}
                    >
                        <span className="codex-resultsFilters__groupLabel">
                            {filter.displayLabel}
                        </span>
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
