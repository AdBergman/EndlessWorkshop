import type { QuestExplorerViewModel } from "@/features/quests/useQuestExplorerViewModel";
import QuestChroniclePanel from "./QuestChroniclePanel";
import QuestMetadataPanel from "./QuestMetadataPanel";
import QuestProgressionRail from "./QuestProgressionRail";

type QuestExplorerLayoutProps = {
    viewModel: QuestExplorerViewModel;
};

function QuestExplorerState({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <section className="questExplorer-state" aria-live="polite">
            <div className="questExplorer-sectionLabel">Quest Explorer</div>
            <h2>{title}</h2>
            <p>{message}</p>
        </section>
    );
}

export default function QuestExplorerLayout({ viewModel }: QuestExplorerLayoutProps) {
    if (viewModel.status === "loading") {
        return (
            <QuestExplorerState
                title="Loading quest archive"
                message="Quest data is being loaded from the archive."
            />
        );
    }

    if (viewModel.status === "error") {
        return (
            <QuestExplorerState
                title="Quest archive unavailable"
                message={viewModel.error ?? "Quest data could not be loaded."}
            />
        );
    }

    if (viewModel.status === "empty" || !viewModel.chronicle || !viewModel.metadata) {
        return (
            <QuestExplorerState
                title="No quests available"
                message="No quest records are available for the explorer yet."
            />
        );
    }

    return (
        <section className="questExplorer-workspace" aria-label="Quest Explorer workspace">
            <QuestProgressionRail
                rail={viewModel.rail}
                onSelectQuest={viewModel.actions.selectQuest}
            />

            <div className="questExplorer-mainPane">
                <QuestChroniclePanel
                    chronicle={viewModel.chronicle}
                    onSelectStep={viewModel.actions.selectStep}
                    onSelectQuest={viewModel.actions.selectQuest}
                />
                <QuestMetadataPanel
                    chronicle={viewModel.chronicle}
                    metadata={viewModel.metadata}
                    onSelectChoice={viewModel.actions.selectChoice}
                    onSelectQuest={viewModel.actions.selectQuest}
                />
            </div>
        </section>
    );
}
