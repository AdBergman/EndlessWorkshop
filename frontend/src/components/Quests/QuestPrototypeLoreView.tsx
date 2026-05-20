import {
    formatSectionPhase,
    type QuestExplorerPrototypeViewModel,
} from "@/features/quests/questExplorerPrototypeViewModel";
import { LineStack, MetaPill, ProgressionLinks } from "./QuestPrototypePrimitives";

type QuestPrototypeLoreViewProps = {
    viewModel: QuestExplorerPrototypeViewModel;
    onSelectBranch: (branchKey: string) => void;
    onSelectQuest: (entryKey: string) => void;
};

export default function QuestPrototypeLoreView({
    viewModel,
    onSelectBranch,
    onSelectQuest,
}: QuestPrototypeLoreViewProps) {
    const entry = viewModel.selectedEntry;

    return (
        <article className="questPrototype-lore" aria-labelledby="quest-lore-prototype-title">
            <header className="questPrototype-hero">
                <div>
                    <span className="questPrototype-kicker">Lore Reader</span>
                    <h3 id="quest-lore-prototype-title">{entry.title}</h3>
                </div>
                <div className="questPrototype-contextPills">
                    {entry.navigation.chapterLabel ? <MetaPill>{entry.navigation.chapterLabel}</MetaPill> : null}
                    {entry.navigation.stepLabel ? <MetaPill>{entry.navigation.stepLabel}</MetaPill> : null}
                    {entry.questType ? <MetaPill>{entry.questType}</MetaPill> : null}
                </div>
                <LineStack lines={entry.summaryLines} emptyLabel="No summary lines recorded." />
            </header>

            <section className="questPrototype-reader" aria-label="Transcript">
                {entry.loreView.sections.map((section) => (
                    <article className="questPrototype-transcriptSection" key={section.sectionKey}>
                        <header>
                            <span>{formatSectionPhase(section)}</span>
                            {typeof section.stepIndex === "number" ? <small>{`Step ${section.stepIndex + 1}`}</small> : null}
                        </header>
                        <div className="questPrototype-transcriptLines">
                            {section.lines.map((line, index) => (
                                <div
                                    className={`questPrototype-transcriptLine questPrototype-transcriptLine--${line.role}`}
                                    key={`${section.sectionKey}:${index}`}
                                >
                                    <span>{line.speakerLabel ?? (line.role === "narrator" ? "Archive" : "Unknown")}</span>
                                    <p>{line.text}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </section>

            {viewModel.branchSummaries.length > 0 ? (
                <section className="questPrototype-choiceBand" aria-labelledby="quest-lore-branches-title">
                    <div className="questPrototype-sectionHeading">
                        <span className="questPrototype-kicker">Branch Choices</span>
                        <h4 id="quest-lore-branches-title">Choose a recorded outcome</h4>
                    </div>
                    <div className="questPrototype-choiceList">
                        {viewModel.branchSummaries.map((choice) => (
                            <button
                                type="button"
                                className={`questPrototype-choice ${choice.isSelected ? "is-selected" : ""}`}
                                aria-pressed={choice.isSelected}
                                key={choice.branchKey}
                                onClick={() => onSelectBranch(choice.branchKey)}
                            >
                                <strong>{choice.label}</strong>
                                {choice.groupLabel ? <span>{choice.groupLabel}</span> : null}
                                <LineStack
                                    lines={choice.outcomePreviewLines}
                                    emptyLabel="No lore preview recorded."
                                />
                                {choice.nextLinks.length > 0 ? (
                                    <span className="questPrototype-choice__outcome">
                                        {`Leads to ${choice.nextLinks.map((link) => link.label).join(", ")}`}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="questPrototype-continuity" aria-labelledby="quest-lore-continuity-title">
                <div className="questPrototype-sectionHeading">
                    <span className="questPrototype-kicker">Continuity</span>
                    <h4 id="quest-lore-continuity-title">Progression trail</h4>
                </div>
                <ProgressionLinks
                    previousLinks={viewModel.previousLinks}
                    nextLinks={viewModel.nextLinks}
                    failureLinks={viewModel.failureLinks}
                    convergenceLinks={viewModel.convergenceLinks}
                    onSelectQuest={onSelectQuest}
                />
            </section>
        </article>
    );
}
