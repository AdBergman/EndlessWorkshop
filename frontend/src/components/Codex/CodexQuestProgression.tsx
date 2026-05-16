import {
    getCodexQuestNodeLabel,
    parseCodexQuestContext,
    type CodexQuestGroupEntry,
} from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    group: CodexQuestGroupEntry | null;
    selectedEntryKey: string | null;
    onSelectNode: (entry: CodexEntry) => void;
};

export default function CodexQuestProgression({ group, selectedEntryKey, onSelectNode }: Props) {
    if (!group) return null;

    return (
        <section className="codex-questPath" aria-labelledby="codex-quest-path-heading">
            <div className="codex-sectionLabel" id="codex-quest-path-heading">
                Quest Progression
            </div>

            <div className="codex-questPath__variants">
                {group.variants.map((variant) => (
                    <div className="codex-questPath__variant" key={variant.variantKey}>
                        <div className="codex-questPath__variantLabel">
                            <span>{variant.variantLabel}</span>
                            <span>{variant.nodeCount} nodes</span>
                        </div>

                        <div className="codex-questPath__nodes" aria-label={`${variant.variantLabel} progression`}>
                            {variant.nodes.map((entry, index) => {
                                const context = parseCodexQuestContext(entry);
                                const isSelected = entry.entryKey === selectedEntryKey;

                                return (
                                    <span className="codex-questPath__nodeWrap" key={entry.entryKey}>
                                        {index > 0 ? (
                                            <span className="codex-questPath__arrow" aria-hidden="true">
                                                -&gt;
                                            </span>
                                        ) : null}
                                        <button
                                            type="button"
                                            className={`codex-questPath__node ${isSelected ? "is-selected" : ""}`}
                                            data-entry-key={entry.entryKey}
                                            aria-pressed={isSelected}
                                            onClick={() => onSelectNode(entry)}
                                        >
                                            {context?.nodeLabel ?? getCodexQuestNodeLabel(entry)}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
