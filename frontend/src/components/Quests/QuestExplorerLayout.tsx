import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import type { QuestExplorerViewModel } from "@/features/quests/useQuestExplorerViewModel";
import QuestLorePanel from "./QuestLorePanel";
import QuestProgressionRail from "./QuestProgressionRail";
import QuestStrategyLayout from "./QuestStrategyLayout";

type QuestExplorerLayoutProps = {
    mode: QuestExplorerMode;
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

export default function QuestExplorerLayout({ mode, viewModel }: QuestExplorerLayoutProps) {
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
                message="No quest entries are available for the explorer yet."
            />
        );
    }

    return (
        <section
            className={`questExplorer-workspace questExplorer-workspace--${mode}`}
            aria-label="Quest Explorer workspace"
        >
            <QuestProgressionRail
                archive={viewModel.archive}
                onSelectQuest={viewModel.actions.selectQuest}
                onUpdateFilters={viewModel.actions.updateArchiveFilters}
                onClearFilters={viewModel.actions.clearArchiveFilters}
            />

            <div className={`questExplorer-mainPane questExplorer-mainPane--${mode}`}>
                {mode === "lore" ? (
                    <QuestLorePanel
                        chronicle={viewModel.chronicle}
                        metadata={viewModel.metadata}
                        onSelectChoice={viewModel.actions.selectChoice}
                        onSelectQuest={viewModel.actions.selectQuest}
                        onSelectStep={viewModel.actions.selectStep}
                    />
                ) : (
                    <QuestStrategyLayout
                        chronicle={viewModel.chronicle}
                        metadata={viewModel.metadata}
                        onSelectChoice={viewModel.actions.selectChoice}
                        onSelectQuest={viewModel.actions.selectQuest}
                        onSelectStep={viewModel.actions.selectStep}
                    />
                )}
            </div>
        </section>
    );
}
