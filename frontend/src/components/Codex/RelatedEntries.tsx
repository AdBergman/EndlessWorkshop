import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";
import { CodexKindIcon } from "@/features/icons/CodexKindIcon";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";

type Props = {
    entries: CodexEntry[];
    onSelect: (entry: CodexEntry) => void;
    priorityMode?: "default" | "faction";
    headingLabel?: string;
};

type RelatedEntryGroup = {
    kind: string;
    label: string;
    entries: CodexEntry[];
};

const FACTION_RELATED_KIND_ORDER = [
    "traits",
    "units",
    "tech",
    "districts",
    "heroes",
    "populations",
];

function groupRelatedEntries(entries: CodexEntry[], priorityMode: Props["priorityMode"]): RelatedEntryGroup[] {
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

    return Array.from(groups.values()).sort((left, right) => {
        if (priorityMode === "faction") {
            const leftPriority = FACTION_RELATED_KIND_ORDER.indexOf(left.kind);
            const rightPriority = FACTION_RELATED_KIND_ORDER.indexOf(right.kind);
            const leftRank = leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority;
            const rightRank = rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority;

            if (leftRank !== rightRank) return leftRank - rightRank;
        }

        return left.label.localeCompare(right.label);
    });
}

export default function RelatedEntries({ entries, onSelect, priorityMode = "default", headingLabel = "Related entries" }: Props) {
    if (entries.length === 0) {
        return null;
    }

    const groups = groupRelatedEntries(entries, priorityMode);

    return (
        <section className="codex-related" aria-labelledby="codex-related-heading">
            <div className="codex-sectionLabel" id="codex-related-heading">
                {headingLabel}
            </div>

            <div className="codex-related__groups">
                {groups.map((group) => (
                    <div className="codex-related__group" key={group.kind}>
                        <div className="codex-related__groupHeader">
                            <span className="codex-related__groupLabel">
                                <CodexKindIcon
                                    kind={group.kind}
                                    label={group.label}
                                    className="codex-kindIcon codex-kindIcon--relatedGroup"
                                    size={16}
                                />
                                <span>{group.label}</span>
                            </span>
                            <span>{group.entries.length}</span>
                        </div>

                        <div className="codex-related__list">
                            {group.entries.map((entry) => {
                                const entryLabel = getCodexEntryLabel(entry);
                                const kindLabel = formatCodexKindLabel(entry.exportKind);
                                const relatedContext = getCodexRelatedContext(entry);
                                const contextLabel = relatedContext.startsWith("Quest ·")
                                    ? relatedContext
                                    : relatedContext
                                        ? `${kindLabel} / ${relatedContext}`
                                        : kindLabel;
                                const previewLine = getCodexReadablePreviewLine(entry) ||
                                    getCodexDescriptionPreviewLine(entry.descriptionLines);
                                const accessibilityLabel = [entryLabel, contextLabel, previewLine]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <button
                                        key={entry.entryKey}
                                        type="button"
                                        className="codex-related__chip"
                                        aria-label={accessibilityLabel}
                                        onClick={() => onSelect(entry)}
                                    >
                                        <CodexEntryIcon
                                            entry={entry}
                                            label={kindLabel}
                                            className="codex-kindIcon codex-kindIcon--relatedChip"
                                            size={16}
                                        />
                                        <span className="codex-related__copy">
                                            <span className="codex-related__name">{renderCodexLabel(entryLabel)}</span>
                                            <span className="codex-related__kind">{contextLabel}</span>
                                            {previewLine ? (
                                                <span className="codex-related__preview">{previewLine}</span>
                                            ) : null}
                                        </span>
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
