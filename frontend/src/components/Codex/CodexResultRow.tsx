import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entry: CodexEntry;
    isSelected: boolean;
    onSelect: (entry: CodexEntry) => void;
};

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function CodexResultRow({ entry, isSelected, onSelect }: Props) {
    const previewLine = entry.descriptionLines
        .map((line) => stripDescriptionTokens(line))
        .find((line) => line.length > 0);

    return (
        <button
            type="button"
            className={`codex-resultRow ${isSelected ? "is-selected" : ""}`}
            data-entry-key={entry.entryKey}
            aria-pressed={isSelected}
            onClick={() => onSelect(entry)}
        >
            <span className="codex-resultRow__title">{entry.displayName || entry.entryKey}</span>
            <span className="codex-resultRow__meta">
                <span className="codex-resultRow__kind">{formatKindLabel(entry.exportKind)}</span>
                <span className="codex-resultRow__key">{entry.entryKey}</span>
            </span>

            {previewLine ? <span className="codex-resultRow__preview">{previewLine}</span> : null}
        </button>
    );
}
