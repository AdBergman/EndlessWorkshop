import type {
    QuestChronicleModel,
    QuestLineGroupModel,
    QuestStepSummaryModel,
} from "@/features/quests/questExplorerTypes";
import QuestTranscript from "./QuestTranscript";

type QuestChroniclePanelProps = {
    chronicle: QuestChronicleModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectStep: (stepIndex: number) => void;
};

function TextLines({ lines, emptyLabel }: { lines: string[]; emptyLabel: string }) {
    if (lines.length === 0) {
        return <p className="questExplorer-muted">{emptyLabel}</p>;
    }

    return (
        <div className="questExplorer-lines">
            {lines.map((line, index) => (
                <p key={`${line}:${index}`}>{line}</p>
            ))}
        </div>
    );
}

function LineGroups({ groups }: { groups: QuestLineGroupModel[] }) {
    if (groups.length === 0) {
        return <p className="questExplorer-muted">No requirements recorded.</p>;
    }

    return (
        <div className="questExplorer-lineGroups">
            {groups.map((group) => (
                <section className="questExplorer-lineGroup" key={group.id}>
                    <h5>{group.label}</h5>
                    <TextLines lines={group.lines} emptyLabel="No lines recorded." />
                </section>
            ))}
        </div>
    );
}

function StepBranches({ step }: { step: QuestStepSummaryModel | null }) {
    if (!step?.nextQuestLink && !step?.failQuestLink) {
        return <p className="questExplorer-muted">No branch target recorded for this step.</p>;
    }

    return (
        <dl className="questExplorer-branchList">
            {step.nextQuestLink ? (
                <div>
                    <dt>Next</dt>
                    <dd>{step.nextQuestLink.label}</dd>
                </div>
            ) : null}
            {step.failQuestLink ? (
                <div>
                    <dt>Failure</dt>
                    <dd>{step.failQuestLink.label}</dd>
                </div>
            ) : null}
        </dl>
    );
}

export default function QuestChroniclePanel({
    chronicle,
    onSelectChoice,
    onSelectStep,
}: QuestChroniclePanelProps) {
    return (
        <article className="questExplorer-chronicle" aria-labelledby="quest-chronicle-title">
            <header className="questExplorer-chronicle__header">
                <div className="questExplorer-sectionLabel">Strategic Chronicle</div>
                <h2 id="quest-chronicle-title">{chronicle.title}</h2>
                <TextLines
                    lines={chronicle.descriptionLines}
                    emptyLabel="No archive description is available for this quest."
                />
            </header>

            <section className="questExplorer-chronicleSection" aria-labelledby="quest-choice-heading">
                <div className="questExplorer-sectionLabel" id="quest-choice-heading">
                    Choices
                </div>
                {chronicle.choices.length === 0 ? (
                    <p className="questExplorer-muted">No choices are attached to this quest.</p>
                ) : (
                    <div className="questExplorer-choiceList">
                        {chronicle.choices.map((choice) => (
                            <button
                                type="button"
                                className={`questExplorer-choiceButton${choice.isSelected ? " is-selected" : ""}`}
                                key={choice.choiceKey}
                                aria-pressed={choice.isSelected}
                                onClick={() => onSelectChoice(choice.choiceKey)}
                            >
                                <span>{choice.title}</span>
                                {choice.nextQuestLinks.length > 0 ? (
                                    <small>{`${choice.nextQuestLinks.length} next`}</small>
                                ) : null}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="questExplorer-chronicleSection" aria-labelledby="quest-step-heading">
                <div className="questExplorer-sectionLabel" id="quest-step-heading">
                    Objectives
                </div>
                {chronicle.steps.length === 0 ? (
                    <p className="questExplorer-muted">No steps are attached to this choice.</p>
                ) : (
                    <div className="questExplorer-stepList">
                        {chronicle.steps.map((step) => (
                            <button
                                type="button"
                                className={`questExplorer-stepButton${step.isSelected ? " is-selected" : ""}`}
                                key={step.stepIndex}
                                aria-pressed={step.isSelected}
                                onClick={() => onSelectStep(step.stepIndex)}
                            >
                                <span>{step.title}</span>
                                <small>{`Step ${step.stepIndex}`}</small>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="questExplorer-detailGrid" aria-label="Selected quest details">
                <div className="questExplorer-detailBlock">
                    <h3>Selected Choice</h3>
                    {chronicle.selectedChoice ? (
                        <>
                            <TextLines
                                lines={chronicle.selectedChoice.descriptionLines}
                                emptyLabel="No choice description recorded."
                            />
                            <LineGroups groups={chronicle.selectedChoice.requirementGroups} />
                            <TextLines
                                lines={chronicle.selectedChoice.rewardLines}
                                emptyLabel="No choice rewards recorded."
                            />
                        </>
                    ) : (
                        <p className="questExplorer-muted">No choice selected.</p>
                    )}
                </div>

                <div className="questExplorer-detailBlock">
                    <h3>Selected Objective</h3>
                    {chronicle.selectedStep ? (
                        <>
                            {chronicle.selectedStep.objectiveText ? (
                                <p className="questExplorer-objective">{chronicle.selectedStep.objectiveText}</p>
                            ) : null}
                            <TextLines
                                lines={chronicle.selectedStep.descriptionLines}
                                emptyLabel="No step description recorded."
                            />
                            <LineGroups groups={chronicle.selectedStep.requirementGroups} />
                            <TextLines
                                lines={chronicle.selectedStep.rewardLines}
                                emptyLabel="No step rewards recorded."
                            />
                            <StepBranches step={chronicle.selectedStep} />
                        </>
                    ) : (
                        <p className="questExplorer-muted">No objective selected.</p>
                    )}
                </div>
            </section>

            <QuestTranscript blocks={chronicle.transcriptBlocks} />
        </article>
    );
}
