import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entries: CodexEntry[];
    onSelect: (entry: CodexEntry) => void;
};

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

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
                {entries.map((entry) => (
                    <button
                        key={entry.entryKey}
                        type="button"
                        className="codex-related__chip"
                        onClick={() => onSelect(entry)}
                    >
                        <span className="codex-related__name">{entry.displayName || entry.entryKey}</span>
                        <span className="codex-related__kind">{formatKindLabel(entry.exportKind)}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
