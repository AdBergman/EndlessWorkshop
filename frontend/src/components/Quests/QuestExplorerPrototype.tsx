import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import { useQuestExplorerPrototype } from "@/features/quests/useQuestExplorerPrototype";
import QuestPrototypeLoreView from "./QuestPrototypeLoreView";
import QuestPrototypeProgressionRail from "./QuestPrototypeProgressionRail";
import QuestPrototypeStrategyView from "./QuestPrototypeStrategyView";
import "./QuestExplorerPrototype.css";

function ModeSwitch({
    mode,
    onModeChange,
}: {
    mode: QuestExplorerMode;
    onModeChange: (mode: QuestExplorerMode) => void;
}) {
    return (
        <div className="questPrototype-modeSwitch" aria-label="Quest Explorer mode">
            <button
                type="button"
                className={mode === "strategy" ? "is-selected" : ""}
                aria-pressed={mode === "strategy"}
                onClick={() => onModeChange("strategy")}
            >
                Strategy
            </button>
            <button
                type="button"
                className={mode === "lore" ? "is-selected" : ""}
                aria-pressed={mode === "lore"}
                onClick={() => onModeChange("lore")}
            >
                Lore
            </button>
        </div>
    );
}

export default function QuestExplorerPrototype() {
    const { viewModel, isRailOpen, actions } = useQuestExplorerPrototype();
    const entry = viewModel.selectedEntry;
    const contextParts = [
        entry.navigation.factionName,
        entry.navigation.questLineName,
        entry.navigation.chapterLabel,
    ].filter(Boolean);

    return (
        <section className="questPrototype" aria-labelledby="quest-prototype-title">
            <header className="questPrototype-topbar">
                <div className="questPrototype-heading">
                    <span className="questPrototype-kicker">Quest Archive</span>
                    <h2 id="quest-prototype-title">Strategic Chronicle</h2>
                    <p>{contextParts.join(" / ")}</p>
                </div>

                <div className="questPrototype-topbarActions">
                    <button
                        type="button"
                        className="questPrototype-railToggle"
                        onClick={actions.openRail}
                    >
                        Progression
                    </button>
                    <ModeSwitch mode={viewModel.mode} onModeChange={actions.setMode} />
                </div>
            </header>

            <div className="questPrototype-workspace">
                <QuestPrototypeProgressionRail
                    rail={viewModel.rail}
                    isOpen={isRailOpen}
                    onClose={actions.closeRail}
                    onSelectQuest={actions.selectQuest}
                />

                {isRailOpen ? (
                    <button
                        type="button"
                        className="questPrototype-railBackdrop"
                        aria-label="Close progression rail"
                        onClick={actions.closeRail}
                    />
                ) : null}

                <div className="questPrototype-main">
                    {viewModel.mode === "lore" ? (
                        <QuestPrototypeLoreView
                            viewModel={viewModel}
                            onSelectBranch={actions.selectBranch}
                            onSelectQuest={actions.selectQuest}
                        />
                    ) : (
                        <QuestPrototypeStrategyView
                            viewModel={viewModel}
                            onSelectBranch={actions.selectBranch}
                            onSelectQuest={actions.selectQuest}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
