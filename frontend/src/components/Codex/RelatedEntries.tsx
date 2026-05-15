import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { formatCodexKindLabel, getCodexEntryLabel, getCodexSecondaryContext } from "@/lib/codex/codexPresentation";
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
                    const secondaryContext = getCodexSecondaryContext(entry);

                    return (
                        <button
                            key={entry.entryKey}
                            type="button"
                            className="codex-related__chip"
                            onClick={() => onSelect(entry)}
                        >
                            <span className="codex-related__name">{renderCodexLabel(getCodexEntryLabel(entry))}</span>
                            <span className="codex-related__kind">
                                {secondaryContext
                                    ? `${formatCodexKindLabel(entry.exportKind)} / ${secondaryContext}`
                                    : formatCodexKindLabel(entry.exportKind)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
