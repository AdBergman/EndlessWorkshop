import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexSecondaryContext,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";

type Props = {
    entry: CodexListItem;
    isSelected: boolean;
    onSelect: (entry: CodexListItem) => void;
};

export default function CodexResultRow({ entry, isSelected, onSelect }: Props) {
    const previewLine = getCodexDescriptionPreviewLine(entry.descriptionLines);
    const isSummary = isCodexSummaryEntry(entry);
    const secondaryContext = isSummary ? "" : getCodexSecondaryContext(entry);

    return (
        <button
            type="button"
            className={`codex-resultRow ${isSelected ? "is-selected" : ""}`}
            data-entry-key={entry.entryKey}
            aria-pressed={isSelected}
            onClick={() => onSelect(entry)}
        >
            <span className="codex-resultRow__title">{renderCodexLabel(getCodexEntryLabel(entry))}</span>
            <span className="codex-resultRow__meta">
                <span className="codex-resultRow__kind">
                    {isSummary ? "Overview" : formatCodexKindLabel(entry.exportKind)}
                </span>
                {secondaryContext ? (
                    <span className="codex-resultRow__context">{secondaryContext}</span>
                ) : null}
            </span>

            {previewLine ? <span className="codex-resultRow__preview">{previewLine}</span> : null}
        </button>
    );
}
