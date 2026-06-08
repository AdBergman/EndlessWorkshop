import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexSecondaryContext,
    isCodexSummaryEntry,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
import {
    getCodexFactionAffinityLabel,
    getCodexFactionTraitSummary,
} from "@/lib/codex/codexFactionPresentation";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";

type Props = {
    entry: CodexListItem;
    isSelected: boolean;
    onSelect: (entry: CodexListItem) => void;
};

export default function CodexResultRow({ entry, isSelected, onSelect }: Props) {
    const isSummary = isCodexSummaryEntry(entry);
    const isFactionEntry = !isSummary && entry.exportKind.trim().toLowerCase() === "factions";
    const factionAffinity = isFactionEntry ? getCodexFactionAffinityLabel(entry) : null;
    const factionTraits = isFactionEntry ? getCodexFactionTraitSummary(entry, 2) : "";
    const previewLine = factionTraits || getCodexDescriptionPreviewLine(entry.descriptionLines);
    const entryLabel = getCodexEntryLabel(entry);
    const secondaryContext = isSummary
        ? ""
        : factionAffinity
            ? `Affinity: ${factionAffinity}`
            : getCodexSecondaryContext(entry);
    const kindLabel = isSummary ? "Overview" : formatCodexKindLabel(entry.exportKind);
    const accessibilityLabel = [entryLabel, kindLabel, secondaryContext, previewLine].filter(Boolean).join(" ");
    const iconClassName = [
        "codex-kindIcon codex-kindIcon--result",
        isSummary ? "codex-kindIcon--monochrome" : null,
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className={`codex-resultRow ${isSelected ? "is-selected" : ""}`}
            data-entry-key={entry.entryKey}
            aria-pressed={isSelected}
            aria-label={accessibilityLabel}
            onClick={() => onSelect(entry)}
        >
            <span className="codex-resultRow__titleLine">
                <CodexEntryIcon
                    entry={entry}
                    label={kindLabel}
                    className={iconClassName}
                    size={18}
                />
                <span className="codex-resultRow__title">{renderCodexLabel(entryLabel)}</span>
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
