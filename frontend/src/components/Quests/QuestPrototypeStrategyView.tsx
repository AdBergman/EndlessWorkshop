import {
    objectivePhaseLabel,
    type QuestExplorerBranchSummary,
    type QuestExplorerPrototypeViewModel,
} from "@/features/quests/questExplorerPrototypeViewModel";
import {
    LineStack,
    LinkButton,
    MetaPill,
    ProgressionLinks,
    RequirementList,
    RewardList,
} from "./QuestPrototypePrimitives";

type QuestPrototypeStrategyViewProps = {
    viewModel: QuestExplorerPrototypeViewModel;
    onSelectBranch: (branchKey: string) => void;
    onSelectQuest: (entryKey: string) => void;
};

function BranchOutcome({
    branch,
    onSelectBranch,
    onSelectQuest,
}: {
    branch: QuestExplorerBranchSummary;
    onSelectBranch: (branchKey: string) => void;
    onSelectQuest: (entryKey: string) => void;
}) {
    return (
        <article className={`questPrototype-branchRow${branch.isSelected ? " is-selected" : ""}`}>
            <button
                type="button"
                className="questPrototype-branchRow__title"
                aria-pressed={branch.isSelected}
                onClick={() => onSelectBranch(branch.branchKey)}
            >
                <span>{branch.label}</span>
                {branch.groupLabel ? <small>{branch.groupLabel}</small> : null}
            </button>

            <div className="questPrototype-branchRow__body">
                <section>
                    <h5>Conditions</h5>
                    <LineStack lines={branch.conditions} emptyLabel="No conditions recorded." />
                </section>
                <section>
                    <h5>Requirements</h5>
                    <RequirementList requirements={branch.requirements} />
                </section>
                <section>
                    <h5>Rewards</h5>
                    <RewardList rewards={branch.rewards} />
                </section>
                <section>
                    <h5>Leads to</h5>
                    {branch.nextLinks.length === 0 &&
                    branch.failureLinks.length === 0 &&
                    branch.convergenceLinks.length === 0 ? (
                        <p className="questPrototype-muted">No branch outcome recorded.</p>
                    ) : (
                        <div className="questPrototype-inlineLinks">
                            {[...branch.nextLinks, ...branch.failureLinks, ...branch.convergenceLinks].map((link, index) => (
                                <LinkButton
                                    key={`${link.relationLabel}:${link.entryKey}:${index}`}
                                    link={link}
                                    onSelectQuest={onSelectQuest}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </article>
    );
}

export default function QuestPrototypeStrategyView({
    viewModel,
    onSelectBranch,
    onSelectQuest,
}: QuestPrototypeStrategyViewProps) {
    const entry = viewModel.selectedEntry;
    const qualityWarnings = entry.quality?.warnings ?? [];

    return (
        <article className="questPrototype-strategy" aria-labelledby="quest-strategy-prototype-title">
            <header className="questPrototype-hero questPrototype-hero--strategy">
                <div>
                    <span className="questPrototype-kicker">Strategy Mode</span>
                    <h3 id="quest-strategy-prototype-title">{entry.title}</h3>
                </div>
                <div className="questPrototype-contextPills">
                    {entry.navigation.factionName ? <MetaPill>{entry.navigation.factionName}</MetaPill> : null}
                    {entry.navigation.chapterLabel ? <MetaPill>{entry.navigation.chapterLabel}</MetaPill> : null}
                    {entry.navigation.stepLabel ? <MetaPill>{entry.navigation.stepLabel}</MetaPill> : null}
                </div>
                <LineStack lines={entry.summaryLines} emptyLabel="No summary lines recorded." />
            </header>

            <div className="questPrototype-strategyGrid">
                <section className="questPrototype-strategyPane" aria-labelledby="quest-objectives-title">
                    <div className="questPrototype-sectionHeading">
                        <span className="questPrototype-kicker">Objectives</span>
                        <h4 id="quest-objectives-title">Strategic scan</h4>
                    </div>

                    <div className="questPrototype-objectiveList">
                        {entry.strategyView.objectives.map((objective, index) => (
                            <article className="questPrototype-objective" key={`${objective.text}:${index}`}>
                                <header>
                                    <h5>{objective.text}</h5>
                                    {objectivePhaseLabel(objective) ? (
                                        <MetaPill>{objectivePhaseLabel(objective)}</MetaPill>
                                    ) : null}
                                </header>
                                <div className="questPrototype-objective__columns">
                                    <section>
                                        <h6>Requirements</h6>
                                        <RequirementList requirements={objective.requirements} />
                                    </section>
                                    <section>
                                        <h6>Rewards</h6>
                                        <RewardList rewards={objective.rewards} />
                                    </section>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <aside className="questPrototype-strategyAside" aria-label="Progression continuity">
                    <section className="questPrototype-sideBlock">
                        <div className="questPrototype-sectionHeading">
                            <span className="questPrototype-kicker">Progression</span>
                            <h4>Continuity</h4>
                        </div>
                        <ProgressionLinks
                            previousLinks={viewModel.previousLinks}
                            nextLinks={viewModel.nextLinks}
                            failureLinks={viewModel.failureLinks}
                            convergenceLinks={viewModel.convergenceLinks}
                            onSelectQuest={onSelectQuest}
                        />
                    </section>

                    {qualityWarnings.length > 0 ? (
                        <section className="questPrototype-sideBlock">
                            <div className="questPrototype-sectionHeading">
                                <span className="questPrototype-kicker">Quality</span>
                                <h4>Warnings</h4>
                            </div>
                            <div className="questPrototype-warningList">
                                {qualityWarnings.map((warning) => (
                                    <p key={warning.code}>{warning.message}</p>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </aside>
            </div>

            <section className="questPrototype-branchComparison" aria-labelledby="quest-branch-comparison-title">
                <div className="questPrototype-sectionHeading">
                    <span className="questPrototype-kicker">Branch Outcomes</span>
                    <h4 id="quest-branch-comparison-title">Compare choices</h4>
                </div>

                {viewModel.branchSummaries.length === 0 ? (
                    <p className="questPrototype-muted">No strategic branches are attached to this quest.</p>
                ) : (
                    <div className="questPrototype-branchRows">
                        {viewModel.branchSummaries.map((branch) => (
                            <BranchOutcome
                                key={branch.branchKey}
                                branch={branch}
                                onSelectBranch={onSelectBranch}
                                onSelectQuest={onSelectQuest}
                            />
                        ))}
                    </div>
                )}
            </section>
        </article>
    );
}
