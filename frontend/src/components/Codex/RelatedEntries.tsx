import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { formatCodexKindLabel, getCodexRelatedContext } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entries: CodexEntry[];
    onSelect: (entry: CodexEntry) => void;
};

export default function RelatedEntries({ entries, onSelect }: Props) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <section className="codex-related" aria-labelledby="codex-related-heading">
            <div className="codex-sectionLabel" id="codex-related-heading">
                Related entries
            </div>

            <div className="codex-related__list">
                {entries.map((entry) => {
                    const relatedContext = getCodexRelatedContext(entry);
                    const contextLabel = relatedContext.startsWith("Quest ·")
                        ? relatedContext
                        : relatedContext
                            ? `${formatCodexKindLabel(entry.exportKind)} / ${relatedContext}`
                            : formatCodexKindLabel(entry.exportKind);

                    return (
                        <button
                            key={entry.entryKey}
                            type="button"
                            className="codex-related__chip"
                            onClick={() => onSelect(entry)}
                        >
                            <span className="codex-related__name">{renderCodexLabel(entry.displayName)}</span>
                            <span className="codex-related__kind">{contextLabel}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
