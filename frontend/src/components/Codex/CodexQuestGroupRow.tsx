import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { type CodexQuestGroupEntry } from "@/lib/codex/codexPresentation";

type Props = {
    group: CodexQuestGroupEntry;
    selectedEntryKey: string | null;
    onSelect: (entry: CodexQuestGroupEntry) => void;
};

export default function CodexQuestGroupRow({ group, selectedEntryKey, onSelect }: Props) {
    const isSelected = group.nodes.some((node) => node.entryKey === selectedEntryKey);
    const variantMeta = group.variantCount > 1
        ? `${group.variantCount} questlines`
        : group.variants[0]?.isAlternate
            ? group.variants[0].variantLabel
            : null;

    return (
        <div className={`codex-questGroup ${isSelected ? "is-selected" : ""}`}>
            <button
                type="button"
                className="codex-questGroup__header"
                data-entry-key={group.entryKey}
                aria-pressed={isSelected}
                onClick={() => onSelect(group)}
            >
                <span className="codex-questGroup__title">{renderCodexLabel(group.displayName)}</span>
                <span className="codex-questGroup__meta">
                    <span>{group.groupContext}</span>
                    {variantMeta ? <span>{variantMeta}</span> : null}
                    <span>{group.nodeCount} quest nodes</span>
                </span>
            </button>
        </div>
    );
}
