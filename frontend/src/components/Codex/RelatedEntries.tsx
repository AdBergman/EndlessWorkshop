import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { formatCodexKindLabel, getCodexEntryLabel, getCodexRelatedContext } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entries: CodexEntry[];
    onSelect: (entry: CodexEntry) => void;
};

type RelatedEntryGroup = {
    kind: string;
    label: string;
    entries: CodexEntry[];
};

function groupRelatedEntries(entries: CodexEntry[]): RelatedEntryGroup[] {
    const groups = new Map<string, RelatedEntryGroup>();

    entries.forEach((entry) => {
        const kind = entry.exportKind.trim().toLowerCase() || "unknown";
        const existing = groups.get(kind);

        if (existing) {
            existing.entries.push(entry);
            return;
        }

        groups.set(kind, {
            kind,
            label: formatCodexKindLabel(kind),
            entries: [entry],
        });
    });

    return Array.from(groups.values()).sort((left, right) => left.label.localeCompare(right.label));
}

export default function RelatedEntries({ entries, onSelect }: Props) {
    if (entries.length === 0) {
        return null;
    }

    const groups = groupRelatedEntries(entries);

    return (
        <section className="codex-related" aria-labelledby="codex-related-heading">
            <div className="codex-sectionLabel" id="codex-related-heading">
                Related entries
            </div>

            <div className="codex-related__groups">
                {groups.map((group) => (
                    <div className="codex-related__group" key={group.kind}>
                        <div className="codex-related__groupHeader">
                            <span>{group.label}</span>
                            <span>{group.entries.length}</span>
                        </div>

                        <div className="codex-related__list">
                            {group.entries.map((entry) => {
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
                                        <span className="codex-related__name">{renderCodexLabel(getCodexEntryLabel(entry))}</span>
                                        <span className="codex-related__kind">{contextLabel}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
