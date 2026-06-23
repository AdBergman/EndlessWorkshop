import type {
    PopulationArchiveFilterValue,
    PopulationTypeFilterOption,
} from "@/lib/codex/codexPopulationArchiveFilters";

type Props = {
    activeType: PopulationArchiveFilterValue | null;
    options: readonly PopulationTypeFilterOption[];
    totalCount: number;
    onClearType: () => void;
    onToggleType: (type: PopulationArchiveFilterValue) => void;
};

export default function PopulationArchiveRail({
    activeType,
    options,
    totalCount,
    onClearType,
    onToggleType,
}: Props) {
    const hasActiveType = Boolean(activeType);

    return (
        <div className="codex-resultsFilters" aria-label="Population filters">
            <div className="codex-resultsFilters__controls">
                <div className="codex-resultsFilters__group" role="group" aria-label="Type">
                    <div className="codex-resultsFilters__groupHeader">
                        <span className="codex-resultsFilters__groupLabel">Type</span>
                        <button
                            type="button"
                            className={`codex-resultsFilters__clear ${
                                hasActiveType ? "" : "is-hidden"
                            }`}
                            onClick={onClearType}
                            aria-hidden={!hasActiveType}
                            disabled={!hasActiveType}
                            tabIndex={hasActiveType ? undefined : -1}
                        >
                            Clear
                        </button>
                    </div>

                    <div className="codex-resultsFilters__chips">
                        <button
                            type="button"
                            className={`codex-resultsFilters__chip ${
                                !hasActiveType ? "is-active" : ""
                            }`}
                            onClick={onClearType}
                            aria-pressed={!hasActiveType}
                            aria-label={`All ${totalCount}`}
                        >
                            <span>All</span>
                            <span className="codex-resultsFilters__count">{totalCount}</span>
                        </button>

                        {options.map((option) => {
                            const isActive = activeType === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`codex-resultsFilters__chip ${
                                        isActive ? "is-active" : ""
                                    }`}
                                    onClick={() => onToggleType(option.value)}
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
            </div>
        </div>
    );
}
