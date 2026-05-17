import type { QuestProgressionRailModel } from "@/features/quests/questExplorerTypes";

type QuestProgressionRailProps = {
    rail: QuestProgressionRailModel;
    onSelectQuest: (questKey: string) => void;
};

export default function QuestProgressionRail({ rail, onSelectQuest }: QuestProgressionRailProps) {
    return (
        <aside className="questExplorer-rail" aria-label="Quest progression">
            <header className="questExplorer-rail__header">
                <div>
                    <div className="questExplorer-sectionLabel">Progression</div>
                    <h2>Quest Archive</h2>
                </div>
                <span className="questExplorer-count">{rail.questCount}</span>
            </header>

            <div className="questExplorer-rail__list">
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
