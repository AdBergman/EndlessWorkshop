import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";

type QuestExplorerModeSwitchProps = {
    mode: QuestExplorerMode;
    onModeChange: (mode: QuestExplorerMode) => void;
};

const modeOptions: Array<{ mode: QuestExplorerMode; label: string }> = [
    { mode: "strategy", label: "Strategy" },
    { mode: "lore", label: "Lore" },
];

export default function QuestExplorerModeSwitch({
    mode,
    onModeChange,
}: QuestExplorerModeSwitchProps) {
    return (
        <div className="questExplorer-modeSwitch" role="group" aria-label="Quest Explorer mode">
            {modeOptions.map((option) => (
                <button
                    type="button"
                    className={option.mode === mode ? "is-selected" : ""}
                    aria-pressed={option.mode === mode}
                    key={option.mode}
                    onClick={() => onModeChange(option.mode)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
