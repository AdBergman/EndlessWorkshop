import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import QuestExplorerModeSwitch from "@/components/Quests/QuestExplorerModeSwitch";
import {
    filterQuestEntries,
    selectQuestError,
    selectQuestLoaded,
    selectQuestLoading,
    selectSelectedQuest,
    useQuestStore,
} from "@/stores/questStore";
import {
    DEFAULT_QUEST_EXPLORER_MODE,
    normalizeQuestExplorerMode,
    type QuestExplorerMode,
} from "@/features/quests/questExplorerMode";
import {
    getQuestCategoryLabel,
    QUEST_CATEGORY_OPTIONS,
    type QuestCategoryKey,
} from "@/features/quests/questCategories";
import {
    buildQuestRailGroups,
    resolveRailSelectionKey,
    type QuestRailGroup,
} from "@/features/quests/questRail";
import {
    selectSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import type {
    QuestBranch,
    QuestExplorerEntry,
    Requirement,
    Reward,
} from "@/types/questTypes";
import "@/components/Quests/QuestExplorer.css";

type Group<T> = {
    id: string;
    label: string;
    order: number;
    items: T[];
};

function routeEntryKey(pathname: string): string | null {
    const raw = pathname.replace(/^\/quests\/?/, "").trim();
    if (!raw) return null;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function questPath(entryKey: string, mode: QuestExplorerMode): string {
    const query = mode === DEFAULT_QUEST_EXPLORER_MODE ? "" : `?mode=${mode}`;
    return `/quests/${encodeURIComponent(entryKey)}${query}`;
}

function fallbackLabel(
    label: string | null | undefined,
    key: string | null | undefined,
    empty: string | null = "Unassigned"
): string | null {
    // TODO: keep raw key fallback only until exporter/backend supplies all display labels.
    return label || key || empty;
}

function compactMeta(entry: QuestExplorerEntry): string {
    const nav = entry.navigation;
    return [
        fallbackLabel(nav.factionName, nav.factionKey, null),
        fallbackLabel(nav.questLineName, nav.questLineKey, null),
        nav.chapterLabel,
        nav.stepLabel,
        nav.branchLabel,
    ].filter(Boolean).join(" / ");
}

function groupByLabel<T>(
    values: T[],
    getLabel: (value: T) => string | null,
    getOrder: (value: T) => number | null
): Group<T>[] {
    const groups = new Map<string, Group<T>>();
    values.forEach((value, index) => {
        const label = getLabel(value) || "General";
        const id = `${label}:${getOrder(value) ?? index}`;
        const current = groups.get(id);
        if (current) {
            current.items.push(value);
        } else {
            groups.set(id, {
                id,
                label,
                order: getOrder(value) ?? Number.MAX_SAFE_INTEGER,
                items: [value],
            });
        }
    });
    return [...groups.values()].sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
}

function CategorySelector({
    value,
    options,
    onChange,
}: {
    value: QuestCategoryKey;
    options: Array<{ key: QuestCategoryKey; label: string; count: number }>;
    onChange: (value: QuestCategoryKey) => void;
}) {
    return (
        <fieldset className="questExplorer-categorySelector">
            <legend>Category</legend>
            <div className="questExplorer-categoryOptions">
                {options.map((option) => (
                    <label
                        className={`questExplorer-categoryOption${option.key === value ? " is-selected" : ""}`}
                        key={option.key}
                    >
                        <input
                            type="radio"
                            name="quest-category"
                            value={option.key}
                            checked={option.key === value}
                            onChange={() => onChange(option.key)}
                        />
                        <span>{option.label}</span>
                        <small>{option.count}</small>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function QuestList({
    groups,
    selectedRailEntryKey,
    onSelectEntry,
}: {
    groups: QuestRailGroup[];
    selectedRailEntryKey: string | null;
    onSelectEntry: (entryKey: string) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-emptyList">No quests match these filters.</p>;
    }

    return (
        <div className="questExplorer-list">
            {groups.map((group) => (
                <div className="questExplorer-listGroup" key={group.key}>
                    {group.items.map((item) => (
                        <button
                            type="button"
                            className={`questExplorer-listItem${item.entry.entryKey === selectedRailEntryKey ? " is-selected" : ""}`}
                            aria-current={item.entry.entryKey === selectedRailEntryKey ? "page" : undefined}
                            onClick={() => onSelectEntry(item.entry.entryKey)}
                            key={item.key}
                        >
                            <span className="questExplorer-listItemTitle">{item.title}</span>
                            <span className="questExplorer-listItemMeta">
                                <span>{item.chapterLabel}</span>
                                <small>{item.metaLabel}</small>
                            </span>
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}

function LoreMode({ entry }: { entry: QuestExplorerEntry }) {
    const sections = entry.loreView.sections;

    if (sections.length === 0) {
        return <p className="questExplorer-emptyState">No lore sections are attached to this quest.</p>;
    }

    return (
        <div className="questExplorer-loreFlow">
            {sections.map((section) => (
                <section className="questExplorer-loreSection" key={section.sectionKey} aria-label={section.phase}>
                    <header>
                        <span>{section.phase}</span>
                        {[section.choiceKey, section.objectiveKey].filter(Boolean).map((value) => (
                            <code key={value}>{value}</code>
                        ))}
                    </header>

                    <div className="questExplorer-loreLines">
                        {section.lines.map((line, index) => (
                            <article
                                className={`questExplorer-loreLine questExplorer-loreLine--${line.role || "narrator"}`}
                                key={`${section.sectionKey}:${index}`}
                            >
                                <div>{line.speakerLabel || line.role || "Narrator"}</div>
                                <p>{line.text}</p>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function RequirementGroups({ requirements }: { requirements: Requirement[] }) {
    const groups = groupByLabel(requirements, (item) => item.groupLabel || item.kind, (item) => item.groupOrder);

    if (groups.length === 0) return null;

    return (
        <div className="questExplorer-strategyGroups">
            {groups.map((group) => (
                <section className="questExplorer-strategyGroup" key={group.id}>
                    <h4>{group.label}</h4>
                    <ul>
                        {group.items.map((requirement) => (
                            <li key={requirement.requirementKey}>
                                <span>{requirement.displayText}</span>
                                {[requirement.referenceDisplayName, requirement.targetLabel, requirement.state].filter(Boolean).length > 0 ? (
                                    <small>
                                        {[requirement.referenceDisplayName, requirement.targetLabel, requirement.state].filter(Boolean).join(" / ")}
                                    </small>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

function RewardGroups({ rewards }: { rewards: Reward[] }) {
    const groups = groupByLabel(rewards, (item) => item.groupLabel || item.kind, (item) => item.groupOrder);

    if (groups.length === 0) return null;

    return (
        <div className="questExplorer-strategyGroups">
            {groups.map((group) => (
                <section className="questExplorer-strategyGroup questExplorer-strategyGroup--reward" key={group.id}>
                    <h4>{group.label}</h4>
                    <ul>
                        {group.items.map((reward) => (
                            <li key={reward.rewardKey}>
                                <span>{reward.displayText}</span>
                                {[reward.amount == null ? null : String(reward.amount), reward.formulaText, reward.assetDisplayName, reward.referenceDisplayName, reward.targetScopeLabel].filter(Boolean).length > 0 ? (
                                    <small>
                                        {[reward.amount == null ? null : String(reward.amount), reward.formulaText, reward.assetDisplayName, reward.referenceDisplayName, reward.targetScopeLabel].filter(Boolean).join(" / ")}
                                    </small>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

function StrategyMode({ entry }: { entry: QuestExplorerEntry }) {
    const objectives = entry.strategyView.objectives;

    if (objectives.length === 0) {
        return <p className="questExplorer-emptyState">No strategy objectives are attached to this quest.</p>;
    }

    return (
        <div className="questExplorer-strategyFlow">
            {objectives.map((objective, index) => (
                <article className="questExplorer-objective" key={objective.objectiveKey ?? `${entry.entryKey}:objective:${index}`}>
                    <header>
                        <span>{objective.phase || "Objective"}</span>
                        {objective.objectiveKey ? <code>{objective.objectiveKey}</code> : null}
                    </header>
                    <p>{objective.text}</p>
                    <RequirementGroups requirements={objective.requirements} />
                    <RewardGroups rewards={objective.rewards} />
                </article>
            ))}
        </div>
    );
}

function LinkButtons({
    label,
    entryKeys,
    entriesByKey,
    onSelectEntry,
}: {
    label: string;
    entryKeys: string[];
    entriesByKey: Record<string, QuestExplorerEntry>;
    onSelectEntry: (entryKey: string) => void;
}) {
    if (entryKeys.length === 0) return null;

    return (
        <section className="questExplorer-linkGroup" aria-label={label}>
            <h4>{label}</h4>
            <div>
                {entryKeys.map((entryKey) => {
                    const target = entriesByKey[entryKey];
                    return (
                        <button
                            type="button"
                            key={entryKey}
                            onClick={() => target && onSelectEntry(target.entryKey)}
                            disabled={!target}
                        >
                            {target?.title ?? entryKey}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function BranchCard({
    branch,
    entriesByKey,
    onSelectEntry,
}: {
    branch: QuestBranch;
    entriesByKey: Record<string, QuestExplorerEntry>;
    onSelectEntry: (entryKey: string) => void;
}) {
    return (
        <article className="questExplorer-branch">
            <header>
                <div>
                    <span>{branch.groupLabel || branch.groupKey || "Choice"}</span>
                    <h4>{branch.label}</h4>
                </div>
                {branch.choiceKey ? <code>{branch.choiceKey}</code> : null}
            </header>
            {branch.lore?.outcomePreviewLines.length ? (
                <p>{branch.lore.outcomePreviewLines.join(" ")}</p>
            ) : null}
            {branch.strategy?.conditions.length ? (
                <ul className="questExplorer-branchConditions">
                    {branch.strategy.conditions.map((condition, index) => (
                        <li key={`${branch.branchKey}:condition:${index}`}>{condition}</li>
                    ))}
                </ul>
            ) : null}
            <LinkButtons
                label="Next"
                entryKeys={branch.nextEntryKeys}
                entriesByKey={entriesByKey}
                onSelectEntry={onSelectEntry}
            />
        </article>
    );
}

function BranchNavigation({
    entry,
    entriesByKey,
    onSelectEntry,
}: {
    entry: QuestExplorerEntry;
    entriesByKey: Record<string, QuestExplorerEntry>;
    onSelectEntry: (entryKey: string) => void;
}) {
    return (
        <footer className="questExplorer-bottom">
            {entry.branches.length > 0 ? (
                <section className="questExplorer-branches" aria-label="Branches and choices">
                    <h3>Branches</h3>
                    <div>
                        {entry.branches.map((branch) => (
                            <BranchCard
                                key={branch.branchKey}
                                branch={branch}
                                entriesByKey={entriesByKey}
                                onSelectEntry={onSelectEntry}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            <div className="questExplorer-navGroups">
                <LinkButtons label="Previous" entryKeys={entry.navigation.previousEntryKeys} entriesByKey={entriesByKey} onSelectEntry={onSelectEntry} />
                <LinkButtons label="Next" entryKeys={entry.navigation.nextEntryKeys} entriesByKey={entriesByKey} onSelectEntry={onSelectEntry} />
                <LinkButtons label="Failure" entryKeys={entry.navigation.failureEntryKeys} entriesByKey={entriesByKey} onSelectEntry={onSelectEntry} />
                <LinkButtons label="Converges Into" entryKeys={entry.navigation.convergesIntoEntryKeys} entriesByKey={entriesByKey} onSelectEntry={onSelectEntry} />
            </div>
        </footer>
    );
}

export default function QuestExplorerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const loading = useQuestStore(selectQuestLoading);
    const loaded = useQuestStore(selectQuestLoaded);
    const error = useQuestStore(selectQuestError);
    const entries = useQuestStore((state) => state.entries);
    const entriesByKey = useQuestStore((state) => state.entriesByKey);
    const selectedEntry = useQuestStore(selectSelectedQuest);
    const selectedEntryKey = useQuestStore((state) => state.selectedEntryKey);
    const filters = useQuestStore((state) => state.filters);
    const mode = useQuestStore((state) => state.mode);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const loadQuestExplorer = useQuestStore((state) => state.loadQuestExplorer);
    const setSelectedEntryKey = useQuestStore((state) => state.setSelectedEntryKey);
    const setMode = useQuestStore((state) => state.setMode);
    const setFilters = useQuestStore((state) => state.setFilters);
    const resolveEntryKey = useQuestStore((state) => state.resolveEntryKey);

    const requestedEntryKey = routeEntryKey(location.pathname) ?? searchParams.get("quest");
    const requestedMode = normalizeQuestExplorerMode(searchParams.get("mode"));
    const visibleEntries = useMemo(
        () => filterQuestEntries(entries, filters, selectedFaction),
        [entries, filters, selectedFaction]
    );
    const visibleEntryKeys = useMemo(
        () => new Set(visibleEntries.map((entry) => entry.entryKey)),
        [visibleEntries]
    );
    const railGroups = useMemo(() => buildQuestRailGroups(visibleEntries), [visibleEntries]);
    const railEntryCount = useMemo(
        () => railGroups.reduce((total, group) => total + group.items.length, 0),
        [railGroups]
    );
    const selectedRailEntryKey = useMemo(
        () => resolveRailSelectionKey(selectedEntry, railGroups, entriesByKey),
        [entriesByKey, railGroups, selectedEntry]
    );

    useEffect(() => {
        void loadQuestExplorer();
    }, [loadQuestExplorer]);

    useEffect(() => {
        if (mode !== requestedMode) setMode(requestedMode);
    }, [mode, requestedMode, setMode]);

    useEffect(() => {
        if (!loaded) return;

        if (requestedEntryKey) {
            const resolved = resolveEntryKey(requestedEntryKey);
            if (resolved && visibleEntryKeys.has(resolved)) {
                if (resolved !== selectedEntryKey) {
                    setSelectedEntryKey(resolved);
                }
                return;
            }
            if (resolved && !visibleEntryKeys.has(resolved)) {
                const fallbackEntryKey = visibleEntries[0]?.entryKey ?? null;
                if (fallbackEntryKey !== selectedEntryKey) {
                    setSelectedEntryKey(fallbackEntryKey);
                }
                if (fallbackEntryKey) {
                    navigate(questPath(fallbackEntryKey, mode), { replace: true });
                }
                return;
            }
            if (!resolved && selectedEntryKey) {
                setSelectedEntryKey(null);
            }
            return;
        }

        if (!selectedEntryKey || !visibleEntryKeys.has(selectedEntryKey)) {
            setSelectedEntryKey(visibleEntries[0]?.entryKey ?? null);
        }
    }, [loaded, mode, navigate, requestedEntryKey, resolveEntryKey, selectedEntryKey, setSelectedEntryKey, visibleEntries, visibleEntryKeys]);

    const categoryOptions = useMemo(() => (
        QUEST_CATEGORY_OPTIONS.map((option) => ({
            ...option,
            count: buildQuestRailGroups(filterQuestEntries(
                    entries,
                    { searchText: filters.searchText, category: option.key },
                    selectedFaction
                ))
                .reduce((total, group) => total + group.items.length, 0),
        }))
    ), [entries, filters.searchText, selectedFaction]);

    const selectEntry = (entryKey: string) => {
        setSelectedEntryKey(entryKey);
        navigate(questPath(entryKey, mode));
    };

    const changeMode = (nextMode: QuestExplorerMode) => {
        setMode(nextMode);
        const nextParams = new URLSearchParams(searchParams);
        if (nextMode === DEFAULT_QUEST_EXPLORER_MODE) {
            nextParams.delete("mode");
        } else {
            nextParams.set("mode", nextMode);
        }
        setSearchParams(nextParams, { replace: true });
    };

    const missingRequestedEntry = loaded && requestedEntryKey && !resolveEntryKey(requestedEntryKey);

    return (
        <main className="questExplorer-page">
            <h1 className="seo-hidden">Endless Legend 2 Quest Explorer</h1>

            <section className="questExplorer" aria-label="Quest Explorer">
                <aside className="questExplorer-sidebar">
                    <header>
                        <div>
                            <span>Quest Archive</span>
                            <h2>Progression</h2>
                        </div>
                        <strong>{railEntryCount}/{entries.length}</strong>
                    </header>

                    <div className="questExplorer-filters">
                        <label className="questExplorer-filterField questExplorer-filterField--search">
                            <span>Search</span>
                            <input
                                type="search"
                                value={filters.searchText}
                                placeholder="Title, alias, objective, reward..."
                                onChange={(event) => setFilters({ searchText: event.currentTarget.value })}
                            />
                        </label>
                        <CategorySelector
                            value={filters.category}
                            options={categoryOptions}
                            onChange={(category) => setFilters({ category })}
                        />
                    </div>

                    <QuestList
                        groups={railGroups}
                        selectedRailEntryKey={selectedRailEntryKey}
                        onSelectEntry={selectEntry}
                    />
                </aside>

                <section className="questExplorer-detail" aria-live="polite">
                    {loading ? <div className="questExplorer-state">Loading quest explorer...</div> : null}
                    {error ? <div className="questExplorer-state questExplorer-state--error">{error}</div> : null}
                    {missingRequestedEntry ? (
                        <div className="questExplorer-state questExplorer-state--error">
                            No quest entry or alias matches <code>{requestedEntryKey}</code>.
                        </div>
                    ) : null}
                    {!loading && !error && !selectedEntry ? (
                        <div className="questExplorer-state">
                            {entries.length === 0 ? "No quest explorer entries are available." : "No quest matches the current filters."}
                        </div>
                    ) : null}

                    {selectedEntry ? (
                        <>
                            <header className="questExplorer-headerCard">
                                <div>
                                    <span>{getQuestCategoryLabel(selectedEntry.questType)}</span>
                                    <h2>{selectedEntry.title}</h2>
                                    <p>{compactMeta(selectedEntry)}</p>
                                </div>
                                <QuestExplorerModeSwitch mode={mode} onModeChange={changeMode} />
                            </header>

                            {selectedEntry.summaryLines.length > 0 ? (
                                <section className="questExplorer-summary" aria-label="Summary">
                                    {selectedEntry.summaryLines.map((line, index) => (
                                        <p key={`${selectedEntry.entryKey}:summary:${index}`}>{line}</p>
                                    ))}
                                </section>
                            ) : null}

                            <section className="questExplorer-content">
                                {mode === "lore" ? <LoreMode entry={selectedEntry} /> : <StrategyMode entry={selectedEntry} />}
                            </section>

                            <BranchNavigation
                                entry={selectedEntry}
                                entriesByKey={entriesByKey}
                                onSelectEntry={selectEntry}
                            />
                        </>
                    ) : null}
                </section>
            </section>
        </main>
    );
}
