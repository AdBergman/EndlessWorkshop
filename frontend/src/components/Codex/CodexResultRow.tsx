import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexSecondaryContext,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";

type Props = {
    entry: CodexListItem;
    isSelected: boolean;
    onSelect: (entry: CodexListItem) => void;
};

export default function CodexResultRow({ entry, isSelected, onSelect }: Props) {
    const previewLine = getCodexDescriptionPreviewLine(entry.descriptionLines);
    const isSummary = isCodexSummaryEntry(entry);
    const secondaryContext = isSummary ? "" : getCodexSecondaryContext(entry);
    const kindLabel = isSummary ? "Overview" : formatCodexKindLabel(entry.exportKind);

    return (
        <button
            type="button"
            className={`codex-resultRow ${isSelected ? "is-selected" : ""}`}
            data-entry-key={entry.entryKey}
            aria-pressed={isSelected}
            onClick={() => onSelect(entry)}
        >
            <span className="codex-resultRow__titleLine">
                <CodexEntryIcon
                    entry={entry}
                    label={kindLabel}
                    className="codex-kindIcon codex-kindIcon--result"
                    size={18}
                />
                <span className="codex-resultRow__title">{renderCodexLabel(getCodexEntryLabel(entry))}</span>
            </span>
            <span className="codex-resultRow__meta">
                <span className="codex-resultRow__kind">{kindLabel}</span>
                {secondaryContext ? (
                    <span className="codex-resultRow__context">{secondaryContext}</span>
                ) : null}
            </span>

            {previewLine ? <span className="codex-resultRow__preview">{previewLine}</span> : null}
        </button>
    );
}
