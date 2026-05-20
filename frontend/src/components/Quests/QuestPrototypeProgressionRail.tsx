import type {
    QuestExplorerRailFaction,
    QuestExplorerRailEntry,
} from "@/features/quests/questExplorerPrototypeViewModel";
import { MetaPill } from "./QuestPrototypePrimitives";

type QuestPrototypeProgressionRailProps = {
    rail: QuestExplorerRailFaction[];
    isOpen: boolean;
    onClose: () => void;
    onSelectQuest: (entryKey: string) => void;
};

function RailEntryButton({
    entry,
    onSelectQuest,
}: {
    entry: QuestExplorerRailEntry;
    onSelectQuest: (entryKey: string) => void;
}) {
    const stateClass = `questPrototype-railEntry--${entry.state}`;

    return (
        <button
            type="button"
            className={`questPrototype-railEntry ${stateClass}`}
            aria-current={entry.state === "current" ? "page" : undefined}
            onClick={() => onSelectQuest(entry.entryKey)}
        >
            <span className="questPrototype-railEntry__marker" aria-hidden="true" />
            <span className="questPrototype-railEntry__body">
                <span className="questPrototype-railEntry__meta">
                    {entry.stepLabel ? <span>{entry.stepLabel}</span> : null}
                    {entry.branchLabel ? <span>{entry.branchLabel}</span> : null}
                    {entry.hasChoices ? <span>Branch</span> : null}
                    {entry.hasConvergence ? <span>Convergence</span> : null}
                </span>
                <span className="questPrototype-railEntry__title">{entry.title}</span>
                <span className="questPrototype-railEntry__flags">
                    {entry.questType ? <MetaPill>{entry.questType}</MetaPill> : null}
                    {entry.isMandatory ? <MetaPill>Required</MetaPill> : null}
                    {entry.isKeyNarrativeBeat ? <MetaPill>Key beat</MetaPill> : null}
                </span>
            </span>
        </button>
    );
}

export default function QuestPrototypeProgressionRail({
    rail,
    isOpen,
    onClose,
    onSelectQuest,
}: QuestPrototypeProgressionRailProps) {
    const totalEntries = rail.reduce(
        (total, faction) =>
            total + faction.questLines.reduce(
                (questLineTotal, questLine) =>
                    questLineTotal + questLine.chapters.reduce(
                        (chapterTotal, chapter) => chapterTotal + chapter.entries.length,
                        0
                    ),
                0
            ),
        0
    );

    return (
        <aside
            className={`questPrototype-rail${isOpen ? " is-open" : ""}`}
            aria-label="Quest progression rail"
        >
            <header className="questPrototype-railHeader">
                <div>
                    <span className="questPrototype-kicker">Progression Atlas</span>
                    <h3>Chronicle Rail</h3>
                    <p>{`${totalEntries} entries across ${rail.length} archive groups`}</p>
                </div>
                <button
                    type="button"
                    className="questPrototype-railClose"
                    aria-label="Close progression rail"
                    onClick={onClose}
                >
                    Close
                </button>
            </header>

            <div className="questPrototype-railScroll">
                {rail.map((faction) => (
                    <section className="questPrototype-railFaction" key={faction.factionKey}>
                        <h4>{faction.label}</h4>
                        {faction.questLines.map((questLine) => (
                            <section
                                className="questPrototype-railQuestLine"
                                key={questLine.questLineKey}
                            >
                                <h5>{questLine.label}</h5>
                                {questLine.chapters.map((chapter) => (
                                    <section
                                        className="questPrototype-railChapter"
                                        key={chapter.chapterKey}
                                    >
                                        <div className="questPrototype-railChapter__label">
                                            {chapter.label}
                                        </div>
                                        <div className="questPrototype-railEntries">
                                            {chapter.entries.map((entry) => (
                                                <RailEntryButton
                                                    key={entry.entryKey}
                                                    entry={entry}
                                                    onSelectQuest={onSelectQuest}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </section>
                        ))}
                    </section>
                ))}
            </div>
        </aside>
    );
}
