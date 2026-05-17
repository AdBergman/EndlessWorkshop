import type {
    QuestChronicleModel,
    QuestObjectiveGroupModel,
} from "@/features/quests/questExplorerTypes";
import {
    QuestLineGroups as LineGroups,
    QuestOutcomeBranches as OutcomeBranches,
    QuestProgressGateRows as ProgressGateRows,
    QuestTextLines as TextLines,
} from "./QuestExplorerPrimitives";
import QuestTranscript from "./QuestTranscript";

type QuestChroniclePanelProps = {
    chronicle: QuestChronicleModel;
    onSelectStep: (stepIndex: number) => void;
    onSelectQuest: (questKey: string) => void;
};

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
            <small>{group.summaryLabel ?? `Objective ${group.representativeStepIndex + 1}`}</small>
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
                Progress Gates
            </div>
            <div className="questExplorer-progressRequirementList">
                {groups.map((group) => (
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
    );
}

export default function QuestChroniclePanel({
    chronicle,
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

            {selectedObjectiveGroup ? (
                <section className="questExplorer-detailGrid" aria-label="Selected quest details">
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
                </section>
            ) : null}

            <QuestTranscript blocks={chronicle.transcriptBlocks} />
        </article>
    );
}
