import type {
    QuestChronicleModel,
    QuestMetadataModel,
} from "@/features/quests/questExplorerTypes";
import {
    QuestLineGroups as LineGroups,
    QuestPathBranches as PathBranches,
    QuestPathSelector as PathSelector,
    QuestRecordContext,
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
        <aside className="questExplorer-metadata questExplorer-pathPanel" aria-label="Path and outcomes">
            <header>
                <div className="questExplorer-sectionLabel">Selected Quest</div>
                <h3>Path & Outcomes</h3>
            </header>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-paths-heading">
                <h4 id="quest-paths-heading">Paths</h4>
                <PathSelector choices={chronicle.choices} onSelectChoice={onSelectChoice} />
            </section>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-selected-path-heading">
                <h4 id="quest-selected-path-heading">Selected Path</h4>
                {chronicle.selectedChoice ? (
                    <div className="questExplorer-pathPanel__selectedPath">
                        <p className="questExplorer-pathTitle">{chronicle.selectedChoice.title}</p>
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
                    <p className="questExplorer-muted">No path selected.</p>
                )}
            </section>

            <QuestRecordContext metadata={metadata} />

            <QuestReferenceTrail metadata={metadata} onSelectQuest={onSelectQuest} />
        </aside>
    );
}
