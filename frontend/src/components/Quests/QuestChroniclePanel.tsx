import type {
    QuestChronicleModel,
    QuestChoiceSummaryModel,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestObjectiveGroupModel,
    QuestProgressGateRowModel,
} from "@/features/quests/questExplorerTypes";
import QuestTranscript from "./QuestTranscript";

type QuestChroniclePanelProps = {
    chronicle: QuestChronicleModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectStep: (stepIndex: number) => void;
    onSelectQuest: (questKey: string) => void;
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

function QuestBranchLink({
    link,
    onSelectQuest,
}: {
    link: QuestLinkModel;
    onSelectQuest: (questKey: string) => void;
}) {
    return (
        <button
            type="button"
            className="questExplorer-linkButton"
            onClick={() => onSelectQuest(link.questKey)}
        >
            <span className="questExplorer-linkButton__main">
                <span className="questExplorer-linkButton__label">{link.label}</span>
                <span className="questExplorer-provenanceBadge">{link.provenanceLabel}</span>
            </span>
            {link.contextLabel ? (
                <span className="questExplorer-linkButton__context">{link.contextLabel}</span>
            ) : null}
            {link.debugLabel ? <span className="questExplorer-linkButton__debug">{link.debugLabel}</span> : null}
        </button>
    );
}

function PathBranches({
    choice,
    onSelectQuest,
}: {
    choice: QuestChoiceSummaryModel | null;
    onSelectQuest: (questKey: string) => void;
}) {
    if (!choice || choice.nextQuestLinks.length === 0) {
        return <p className="questExplorer-muted">No branch target recorded for this choice.</p>;
    }

    return (
        <dl className="questExplorer-branchList">
            {choice.nextQuestLinks.map((link, index) => (
                <div key={`${link.provenance}:${link.questKey}:${index}`}>
                    <dt>Path outcome</dt>
                    <dd>
                        <QuestBranchLink link={link} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function OutcomeBranches({
    nextQuestLink,
    failQuestLink,
    onSelectQuest,
}: {
    nextQuestLink: QuestLinkModel | null;
    failQuestLink: QuestLinkModel | null;
    onSelectQuest: (questKey: string) => void;
}) {
    if (!nextQuestLink && !failQuestLink) {
        return <p className="questExplorer-muted">No outcome target recorded.</p>;
    }

    return (
        <dl className="questExplorer-branchList">
            {nextQuestLink ? (
                <div>
                    <dt>Success outcome</dt>
                    <dd>
                        <QuestBranchLink link={nextQuestLink} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ) : null}
            {failQuestLink ? (
                <div>
                    <dt>Failure outcome</dt>
                    <dd>
                        <QuestBranchLink link={failQuestLink} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ) : null}
        </dl>
    );
}

function LineSummary({ lines, emptyLabel }: { lines: string[]; emptyLabel: string }) {
    return <span>{lines.length > 0 ? lines.join(" / ") : emptyLabel}</span>;
}

function ProgressGateRows({ rows }: { rows: QuestProgressGateRowModel[] }) {
    if (rows.length === 0) {
        return <p className="questExplorer-muted">No progress gates recorded.</p>;
    }

    return (
        <div className="questExplorer-progressGateRows">
            {rows.map((row, index) => (
                <div className="questExplorer-progressGateRow" key={row.id}>
                    <div className="questExplorer-progressGateRow__index">{`Gate ${index + 1}`}</div>
                    <dl>
                        <div>
                            <dt>Available from</dt>
                            <dd>
                                <LineSummary lines={row.selectionLines} emptyLabel="Start" />
                            </dd>
                        </div>
                        <div>
                            <dt>Completes at</dt>
                            <dd>
                                <LineSummary lines={row.completionLines} emptyLabel="No completion threshold" />
                            </dd>
                        </div>
                        {row.forbiddenLines.length > 0 ? (
                            <div>
                                <dt>Blocked at</dt>
                                <dd>
                                    <LineSummary lines={row.forbiddenLines} emptyLabel="No limit" />
                                </dd>
                            </div>
                        ) : null}
                        {row.failureLines.length > 0 ? (
                            <div>
                                <dt>Failure</dt>
                                <dd>
                                    <LineSummary lines={row.failureLines} emptyLabel="No failure threshold" />
                                </dd>
                            </div>
                        ) : null}
                        {row.rewardLines.length > 0 ? (
                            <div>
                                <dt>Reward</dt>
                                <dd>
                                    <LineSummary lines={row.rewardLines} emptyLabel="No reward" />
                                </dd>
                            </div>
                        ) : null}
                    </dl>
                </div>
            ))}
        </div>
    );
}

function ObjectiveGroupButton({
    group,
    onSelectStep,
}: {
    group: QuestObjectiveGroupModel;
    onSelectStep: (stepIndex: number) => void;
}) {
    return (
        <button
            type="button"
            className={`questExplorer-stepButton${group.isSelected ? " is-selected" : ""}`}
            key={group.id}
            aria-pressed={group.isSelected}
            onClick={() => onSelectStep(group.representativeStepIndex)}
        >
            <span>{group.title}</span>
            <small>{group.debugLabel ?? `Objective ${group.representativeStepIndex}`}</small>
        </button>
    );
}

function ObjectiveGroupSection({
    label,
    groups,
    emptyLabel,
    onSelectStep,
}: {
    label: string;
    groups: QuestObjectiveGroupModel[];
    emptyLabel: string;
    onSelectStep: (stepIndex: number) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-muted">{emptyLabel}</p>;
    }

    return (
        <section className="questExplorer-chronicleSection" aria-labelledby={`quest-${label.toLowerCase().replace(/\s+/g, "-")}-heading`}>
            <div className="questExplorer-sectionLabel" id={`quest-${label.toLowerCase().replace(/\s+/g, "-")}-heading`}>
                {label}
            </div>
            <div className="questExplorer-stepList">
                {groups.map((group) => (
                    <ObjectiveGroupButton
                        group={group}
                        key={group.id}
                        onSelectStep={onSelectStep}
                    />
                ))}
            </div>
        </section>
    );
}

function ProgressRequirementsSection({
    groups,
    onSelectQuest,
}: {
    groups: QuestObjectiveGroupModel[];
    onSelectQuest: (questKey: string) => void;
}) {
    if (groups.length === 0) return null;

    return (
        <section className="questExplorer-chronicleSection" aria-labelledby="quest-progress-requirements-heading">
            <div className="questExplorer-sectionLabel" id="quest-progress-requirements-heading">
                Progress Requirements
            </div>
            <div className="questExplorer-progressRequirementList">
                {groups.map((group) => (
                    <div className="questExplorer-progressRequirement" key={group.id}>
                        <header>
                            <h3>{group.title}</h3>
                            {group.debugLabel ? <span>{group.debugLabel}</span> : null}
                        </header>
                        <TextLines
                            lines={group.descriptionLines}
                            emptyLabel="No progress requirement description recorded."
                        />
                        <ProgressGateRows rows={group.gateRows} />
                        <TextLines
                            lines={group.rewardLines}
                            emptyLabel="No rewards recorded."
                        />
                        <OutcomeBranches
                            nextQuestLink={group.nextQuestLink}
                            failQuestLink={group.failQuestLink}
                            onSelectQuest={onSelectQuest}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function QuestChroniclePanel({
    chronicle,
    onSelectChoice,
    onSelectStep,
    onSelectQuest,
}: QuestChroniclePanelProps) {
    const progressGateGroups = chronicle.objectiveGroups.filter((group) => group.kind === "progressGate");
    const objectiveGroups = chronicle.objectiveGroups.filter((group) => group.kind === "objective");
    const selectedObjectiveGroup = chronicle.selectedObjectiveGroup;
    const shouldShowObjectivePicker = objectiveGroups.length > 1;

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
                    Paths
                </div>
                {chronicle.choices.length === 0 ? (
                    <p className="questExplorer-muted">No paths are attached to this quest.</p>
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

            {chronicle.objectiveGroups.length === 0 ? (
                <section className="questExplorer-chronicleSection" aria-labelledby="quest-objectives-heading">
                    <div className="questExplorer-sectionLabel" id="quest-objectives-heading">
                        Objectives
                    </div>
                    <p className="questExplorer-muted">No objectives or progress gates are attached to this path.</p>
                </section>
            ) : null}

            <ProgressRequirementsSection
                groups={progressGateGroups}
                onSelectQuest={onSelectQuest}
            />

            {shouldShowObjectivePicker ? (
                <ObjectiveGroupSection
                    label="Objectives"
                    groups={objectiveGroups}
                    emptyLabel="No objectives are attached to this path."
                    onSelectStep={onSelectStep}
                />
            ) : null}

            <section className="questExplorer-detailGrid" aria-label="Selected quest details">
                <div className="questExplorer-detailBlock">
                    <h3>Selected Path</h3>
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
                            <PathBranches choice={chronicle.selectedChoice} onSelectQuest={onSelectQuest} />
                        </>
                    ) : (
                        <p className="questExplorer-muted">No path selected.</p>
                    )}
                </div>

                {selectedObjectiveGroup ? (
                    <div className="questExplorer-detailBlock">
                        <h3>{shouldShowObjectivePicker ? "Selected Objective" : "Objective"}</h3>
                        <p className="questExplorer-objective">{selectedObjectiveGroup.title}</p>
                        <TextLines
                            lines={selectedObjectiveGroup.descriptionLines}
                            emptyLabel="No objective description recorded."
                        />
                        <LineGroups groups={selectedObjectiveGroup.requirementGroups} />
                        <TextLines
                            lines={selectedObjectiveGroup.rewardLines}
                            emptyLabel="No rewards recorded."
                        />
                        <OutcomeBranches
                            nextQuestLink={selectedObjectiveGroup.nextQuestLink}
                            failQuestLink={selectedObjectiveGroup.failQuestLink}
                            onSelectQuest={onSelectQuest}
                        />
                    </div>
                ) : null}
            </section>

            <QuestTranscript blocks={chronicle.transcriptBlocks} />
        </article>
    );
}
