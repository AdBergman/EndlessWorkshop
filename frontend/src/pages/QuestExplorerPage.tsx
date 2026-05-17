import QuestExplorerLayout from "@/components/Quests/QuestExplorerLayout";
import { useQuestExplorerViewModel } from "@/features/quests/useQuestExplorerViewModel";
import "@/components/Quests/QuestExplorer.css";

export default function QuestExplorerPage() {
    const viewModel = useQuestExplorerViewModel();

    return (
        <main className="questExplorer-page">
            <h1 className="seo-hidden">
                Endless Legend 2 Quest Explorer and Strategic Archive
            </h1>

            <section className="questExplorer-surface" aria-labelledby="quest-explorer-title">
                <header className="questExplorer-header">
                    <div>
                        <div className="questExplorer-eyebrow">Quest Archive</div>
                        <h2 id="quest-explorer-title">Quest Explorer</h2>
                    </div>
                </header>

                <QuestExplorerLayout viewModel={viewModel} />
            </section>
        </main>
    );
}
