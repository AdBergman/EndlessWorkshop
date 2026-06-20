import type {
    DistrictArchiveCategory,
    DistrictCategoryFilterOption,
} from "@/lib/codex/codexDistrictArchiveFilters";

type Props = {
    activeCategory: DistrictArchiveCategory | null;
    options: readonly DistrictCategoryFilterOption[];
    totalCount: number;
    onClearCategory: () => void;
    onToggleCategory: (category: DistrictArchiveCategory) => void;
};

export default function DistrictArchiveRail({
    activeCategory,
    options,
    totalCount,
    onClearCategory,
    onToggleCategory,
}: Props) {
    const hasActiveCategory = Boolean(activeCategory);

    return (
        <div className="codex-resultsFilters" aria-label="District filters">
            <div className="codex-resultsFilters__controls">
                <div className="codex-resultsFilters__group" role="group" aria-label="District Focus">
                    <div className="codex-resultsFilters__groupHeader">
                        <span className="codex-resultsFilters__groupLabel">District Focus</span>
                        <button
                            type="button"
                            className={`codex-resultsFilters__clear ${
                                hasActiveCategory ? "" : "is-hidden"
                            }`}
                            onClick={onClearCategory}
                            aria-hidden={!hasActiveCategory}
                            disabled={!hasActiveCategory}
                            tabIndex={hasActiveCategory ? undefined : -1}
                        >
                            Clear
                        </button>
                    </div>

                    <div className="codex-resultsFilters__chips">
                        <button
                            type="button"
                            className={`codex-resultsFilters__chip ${
                                !hasActiveCategory ? "is-active" : ""
                            }`}
                            onClick={onClearCategory}
                            aria-pressed={!hasActiveCategory}
                            aria-label={`All ${totalCount}`}
                        >
                            <span>All</span>
                            <span className="codex-resultsFilters__count">{totalCount}</span>
                        </button>

                        {options.map((option) => {
                            const isActive = activeCategory === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`codex-resultsFilters__chip ${
                                        isActive ? "is-active" : ""
                                    }`}
                                    onClick={() => onToggleCategory(option.value)}
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

