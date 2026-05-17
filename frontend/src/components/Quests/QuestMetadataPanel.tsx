import type {
    QuestChronicleModel,
    QuestMetadataModel,
} from "@/features/quests/questExplorerTypes";
import {
    QuestLineGroups as LineGroups,
    QuestPathBranches as PathBranches,
    QuestPathSelector as PathSelector,
    QuestReferenceTrail,
    QuestTextLines as TextLines,
} from "./QuestExplorerPrimitives";

type QuestMetadataPanelProps = {
    chronicle: QuestChronicleModel;
    metadata: QuestMetadataModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectQuest: (questKey: string) => void;
};

export default function QuestMetadataPanel({
    chronicle,
    metadata,
    onSelectChoice,
    onSelectQuest,
}: QuestMetadataPanelProps) {
    return (
        <aside className="questExplorer-metadata questExplorer-pathPanel" aria-label="Quest branches">
            <header>
                <div className="questExplorer-sectionLabel">Selected Quest</div>
                <h3>Quest Branches</h3>
            </header>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-branches-heading">
                <h4 id="quest-branches-heading">Branches</h4>
                <PathSelector choices={chronicle.choices} onSelectChoice={onSelectChoice} />
            </section>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-selected-branch-heading">
                <h4 id="quest-selected-branch-heading">Selected Branch</h4>
                {chronicle.selectedChoice ? (
                    <div className="questExplorer-pathPanel__selectedPath">
                        {chronicle.selectedChoice.title ? (
                            <p className="questExplorer-pathTitle">{chronicle.selectedChoice.title}</p>
                        ) : null}
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
                    </div>
                ) : (
                    <p className="questExplorer-muted">No branch selected.</p>
                )}
            </section>

            <QuestReferenceTrail metadata={metadata} onSelectQuest={onSelectQuest} />
        </aside>
    );
}
