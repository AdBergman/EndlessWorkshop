import type {
    QuestArchiveFilterValue,
    QuestCategoryFilterGroup,
} from "@/lib/codex/codexQuestArchiveFilters";

type Props = {
    activeCategory: QuestArchiveFilterValue | null;
    groups: readonly QuestCategoryFilterGroup[];
    totalCount: number;
    onClearCategory: () => void;
    onToggleCategory: (category: QuestArchiveFilterValue) => void;
};

export default function QuestArchiveRail({
    activeCategory,
    groups,
    totalCount,
    onClearCategory,
    onToggleCategory,
}: Props) {
    const hasActiveCategory = Boolean(activeCategory);

    return (
        <div className="codex-resultsFilters" aria-label="Quest filters">
            <div className="codex-resultsFilters__controls">
                <div className="codex-resultsFilters__group" role="group" aria-label="Quest Category">
                    <div className="codex-resultsFilters__groupHeader">
                        <span className="codex-resultsFilters__groupLabel">Quest Category</span>
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

                        {groups[0]?.options.map((option) => {
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

                {groups.slice(1).map((group) => (
                    <div
                        className="codex-resultsFilters__group"
                        role="group"
                        aria-label={group.label}
                        key={group.label}
                    >
                        <div className="codex-resultsFilters__groupHeader">
                            <span className="codex-resultsFilters__groupLabel">{group.label}</span>
                        </div>

                        <div className="codex-resultsFilters__chips">
                            {group.options.map((option) => {
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
                ))}
            </div>
        </div>
    );
}
