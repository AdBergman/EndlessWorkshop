import type {
    QuestChronicleModel,
    QuestMetadataModel,
    QuestObjectiveGroupModel,
} from "@/features/quests/questExplorerTypes";
import {
    QuestLineGroups as LineGroups,
    QuestOutcomeBranches as OutcomeBranches,
    QuestPathBranches as PathBranches,
    QuestPathSelector as PathSelector,
    QuestProgressGateRows as ProgressGateRows,
    QuestReferenceTrail,
    QuestTextLines as TextLines,
} from "./QuestExplorerPrimitives";
import QuestTranscript from "./QuestTranscript";

type QuestLorePanelProps = {
    chronicle: QuestChronicleModel;
    metadata: QuestMetadataModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectQuest: (questKey: string) => void;
    onSelectStep: (stepIndex: number) => void;
};

function ObjectiveNotes({
    selectedObjectiveGroup,
    shouldShowObjectivePicker,
    objectiveGroups,
    onSelectQuest,
    onSelectStep,
}: {
    selectedObjectiveGroup: QuestObjectiveGroupModel | null;
    shouldShowObjectivePicker: boolean;
    objectiveGroups: QuestObjectiveGroupModel[];
    onSelectQuest: (questKey: string) => void;
    onSelectStep: (stepIndex: number) => void;
}) {
    if (objectiveGroups.length === 0 && !selectedObjectiveGroup) {
        return <p className="questExplorer-muted">No objectives are attached to this branch.</p>;
    }

    return (
        <>
            {shouldShowObjectivePicker ? (
                <div className="questExplorer-stepList">
                    {objectiveGroups.map((group) => (
                        <button
                            type="button"
                            className={`questExplorer-stepButton${group.isSelected ? " is-selected" : ""}`}
                            key={group.id}
                            aria-pressed={group.isSelected}
                            onClick={() => onSelectStep(group.representativeStepIndex)}
                        >
                            <span>{group.title}</span>
                            <small>{group.summaryLabel ?? `Objective ${group.representativeStepIndex + 1}`}</small>
                        </button>
                    ))}
                </div>
            ) : null}

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
        </>
    );
}

export default function QuestLorePanel({
    chronicle,
    metadata,
    onSelectChoice,
    onSelectQuest,
    onSelectStep,
}: QuestLorePanelProps) {
    const progressGateGroups = chronicle.objectiveGroups.filter((group) => group.kind === "progressGate");
    const objectiveGroups = chronicle.objectiveGroups.filter((group) => group.kind === "objective");
    const selectedObjectiveGroup = chronicle.selectedObjectiveGroup;
    const shouldShowObjectivePicker = objectiveGroups.length > 1;

    return (
        <article
            className="questExplorer-chronicle questExplorer-chronicle--lore"
            aria-labelledby="quest-lore-title"
        >
            <header className="questExplorer-chronicle__header">
                <div className="questExplorer-sectionLabel">Lore Chronicle</div>
                <h2 id="quest-lore-title">{chronicle.title}</h2>
                <TextLines
                    lines={chronicle.descriptionLines}
                    emptyLabel="No archive description is available for this quest."
                />
            </header>

            <QuestTranscript
                blocks={chronicle.transcriptBlocks}
                heading="Dialogue Chronicle"
                variant="flow"
            />

            <section className="questExplorer-chronicleSection" aria-labelledby="quest-lore-paths-heading">
                <div className="questExplorer-sectionLabel" id="quest-lore-paths-heading">
                    Story Branches
                </div>
                <PathSelector choices={chronicle.choices} onSelectChoice={onSelectChoice} />
                {chronicle.selectedChoice ? (
                    <div className="questExplorer-loreSelectedPath">
                        <p className="questExplorer-pathTitle">{chronicle.selectedChoice.title}</p>
                        <TextLines
                            lines={chronicle.selectedChoice.descriptionLines}
                            emptyLabel="No choice description recorded."
                        />
                    </div>
                ) : null}
            </section>

            <details className="questExplorer-loreSecondary">
                <summary>Strategy Notes</summary>

                {progressGateGroups.length > 0 ? (
                    <section className="questExplorer-chronicleSection" aria-labelledby="quest-lore-gates-heading">
                        <div className="questExplorer-sectionLabel" id="quest-lore-gates-heading">
                            Progress Gates
                        </div>
                        <div className="questExplorer-progressRequirementList">
                            {progressGateGroups.map((group) => (
                                <div className="questExplorer-progressRequirement" key={group.id}>
                                    <header>
                                        <h3>{group.title}</h3>
                                        {group.summaryLabel ? <span>{group.summaryLabel}</span> : null}
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
                ) : null}

                <section className="questExplorer-chronicleSection" aria-labelledby="quest-lore-objectives-heading">
                    <div className="questExplorer-sectionLabel" id="quest-lore-objectives-heading">
                        Objectives
                    </div>
                    <ObjectiveNotes
                        selectedObjectiveGroup={selectedObjectiveGroup}
                        shouldShowObjectivePicker={shouldShowObjectivePicker}
                        objectiveGroups={objectiveGroups}
                        onSelectQuest={onSelectQuest}
                        onSelectStep={onSelectStep}
                    />
                </section>

                <section className="questExplorer-chronicleSection" aria-labelledby="quest-lore-path-notes-heading">
                    <div className="questExplorer-sectionLabel" id="quest-lore-path-notes-heading">
                        Branch Notes
                    </div>
                    {chronicle.selectedChoice ? (
                        <div className="questExplorer-pathPanel__selectedPath">
                            <p className="questExplorer-pathTitle">{chronicle.selectedChoice.title}</p>
                            <LineGroups groups={chronicle.selectedChoice.requirementGroups} />
                            <TextLines
                                lines={chronicle.selectedChoice.rewardLines}
                                emptyLabel="No choice rewards recorded."
                            />
                            <PathBranches choice={chronicle.selectedChoice} onSelectQuest={onSelectQuest} />
                        </div>
                    ) : (
                        <p className="questExplorer-muted">No branch selected.</p>
                    )}
                </section>
            </details>

            <QuestReferenceTrail metadata={metadata} onSelectQuest={onSelectQuest} />
        </article>
    );
}
