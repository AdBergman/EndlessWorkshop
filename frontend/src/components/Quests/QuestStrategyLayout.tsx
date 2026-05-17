import type {
    QuestChronicleModel,
    QuestMetadataModel,
} from "@/features/quests/questExplorerTypes";
import QuestChroniclePanel from "./QuestChroniclePanel";
import QuestMetadataPanel from "./QuestMetadataPanel";

type QuestStrategyLayoutProps = {
    chronicle: QuestChronicleModel;
    metadata: QuestMetadataModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectQuest: (questKey: string) => void;
    onSelectStep: (stepIndex: number) => void;
};

export default function QuestStrategyLayout({
    chronicle,
    metadata,
    onSelectChoice,
    onSelectQuest,
    onSelectStep,
}: QuestStrategyLayoutProps) {
    return (
        <>
            <QuestChroniclePanel
                chronicle={chronicle}
                metadata={metadata}
                onSelectStep={onSelectStep}
                onSelectQuest={onSelectQuest}
            />
            <QuestMetadataPanel
                chronicle={chronicle}
                onSelectChoice={onSelectChoice}
                onSelectQuest={onSelectQuest}
            />
        </>
    );
}
