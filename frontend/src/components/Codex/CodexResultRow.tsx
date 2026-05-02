import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import {
    getCodexEntryLabel,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";

type Props = {
    entry: CodexListItem;
    isSelected: boolean;
    onSelect: (entry: CodexListItem) => void;
};

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function CodexResultRow({ entry, isSelected, onSelect }: Props) {
    const previewLine = entry.descriptionLines
        .map((line) => stripDescriptionTokens(line))
        .find((line) => line.length > 0);
    const isSummary = isCodexSummaryEntry(entry);

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
                    {isSummary ? "Overview" : formatKindLabel(entry.exportKind)}
                </span>
            </span>

            {previewLine ? <span className="codex-resultRow__preview">{previewLine}</span> : null}
        </button>
    );
}
