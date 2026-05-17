import {
    formatQuestArchiveCountSummary,
    QUEST_ARCHIVE_ALL,
    type QuestArchiveFilterOption,
    type QuestArchiveFilters,
    type QuestArchiveModel,
} from "@/features/quests/questArchiveModel";

type QuestProgressionRailProps = {
    archive: QuestArchiveModel;
    onSelectQuest: (questKey: string) => void;
    onUpdateFilters: (filters: Partial<QuestArchiveFilters>) => void;
    onClearFilters: () => void;
};

function pluralize(count: number, singular: string): string {
    return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function optionLabel(option: QuestArchiveFilterOption): string {
    return `${option.label} (${option.count})`;
}

function FilterSelect({
    label,
    value,
    allLabel,
    options,
    onChange,
}: {
    label: string;
    value: string;
    allLabel: string;
    options: QuestArchiveFilterOption[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="questExplorer-filterField">
            <span>{label}</span>
            <select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
                <option value={QUEST_ARCHIVE_ALL}>{allLabel}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {optionLabel(option)}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default function QuestProgressionRail({
    archive,
    onSelectQuest,
    onUpdateFilters,
    onClearFilters,
}: QuestProgressionRailProps) {
    const rail = archive.rail;
    const filters = archive.filters;

    return (
        <aside className="questExplorer-rail" aria-label="Quest archive">
            <header className="questExplorer-rail__header">
                <div>
                    <div className="questExplorer-sectionLabel">Archive</div>
                    <h2>Quest Archive</h2>
                    <p>{formatQuestArchiveCountSummary(archive.counts)}</p>
                </div>
                <span className="questExplorer-count">{`${archive.counts.visibleGroups}/${archive.counts.totalGroups}`}</span>
            </header>

            <div className="questExplorer-archiveControls" aria-label="Archive filters">
                <label className="questExplorer-filterField questExplorer-filterField--search">
                    <span>Search</span>
                    <input
                        type="search"
                        value={filters.searchText}
                        placeholder="Title, key, objectives, rewards..."
                        aria-label="Search quest archive"
                        onChange={(event) => onUpdateFilters({ searchText: event.currentTarget.value })}
                    />
                </label>

                <div className="questExplorer-filterGrid">
                    <FilterSelect
                        label="Faction"
                        value={filters.faction}
                        allLabel="All"
                        options={archive.factionOptions}
                        onChange={(faction) => onUpdateFilters({ faction })}
                    />
                    <FilterSelect
                        label="Type"
                        value={filters.category}
                        allLabel="All types"
                        options={archive.categoryOptions}
                        onChange={(category) => onUpdateFilters({ category })}
                    />
                    <FilterSelect
                        label="Chapter"
                        value={filters.chapter}
                        allLabel="All chapters"
                        options={archive.chapterOptions}
                        onChange={(chapter) => onUpdateFilters({ chapter })}
                    />
                    <FilterSelect
                        label="Branch"
                        value={filters.branchVariant}
                        allLabel="All branches"
                        options={archive.branchVariantOptions}
                        onChange={(branchVariant) => onUpdateFilters({ branchVariant })}
                    />
                </div>

                {archive.hasActiveFilters ? (
                    <button
                        type="button"
                        className="questExplorer-clearFilters"
                        onClick={onClearFilters}
                    >
                        Clear filters
                    </button>
                ) : null}
            </div>

            <div className="questExplorer-rail__list">
                {rail.items.length === 0 ? (
                    <p className="questExplorer-muted questExplorer-railEmpty">No archive entries match these filters.</p>
                ) : null}
                {rail.items.map((item) => (
                    <button
                        type="button"
                        className={`questExplorer-railItem${item.isSelected ? " is-selected" : ""}`}
                        key={item.questKey}
                        aria-pressed={item.isSelected}
                        onClick={() => onSelectQuest(item.questKey)}
                    >
                        <span className="questExplorer-railItem__topline">
                            {item.chapterLabel ? <span>{item.chapterLabel}</span> : null}
                            {item.branchLabel ? <span>{item.branchLabel}</span> : null}
                            <span>{pluralize(item.memberCount, "entry")}</span>
                        </span>
                        <span className="questExplorer-railItem__title">{item.title}</span>
                        {item.subtitle ? (
                            <span className="questExplorer-railItem__subtitle">{item.subtitle}</span>
                        ) : null}
                        {item.flags.length > 0 ? (
                            <span className="questExplorer-railItem__flags">
                                {item.flags.map((flag) => (
                                    <span className="questExplorer-pill" key={flag}>
                                        {flag}
                                    </span>
                                ))}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>
        </aside>
    );
}
