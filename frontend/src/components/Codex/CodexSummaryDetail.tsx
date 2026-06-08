import type { RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    getCodexEntryPreview,
    getCodexEntryLabel,
    getCodexSecondaryContext,
    isCodexQuestGroupEntry,
    type CodexListItem,
    type CodexSummaryEntry,
} from "@/lib/codex/codexPresentation";
import {
    getCodexFactionAffinityLabel,
    getCodexFactionSummaryPreview,
    getCodexFactionTraitSummary,
} from "@/lib/codex/codexFactionPresentation";
import { getCodexStructuredSummary } from "@/lib/codex/codexStructuredDescription";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
};

export default function CodexSummaryDetail({ summaryEntry, entries, titleRef, onSelectEntry }: Props) {
    return (
        <article className="codex-detail codex-detail--summary">
            <div className="codex-summaryDossier">
                <div className="codex-detail__metaRow">
                    <span className="codex-detail__kind">{summaryEntry.summaryLabel}</span>
                    <span className="codex-detail__context">Archive dossier</span>
                </div>

                <div className="codex-summaryDossier__hero">
                    <div>
                        <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                            {renderCodexLabel(summaryEntry.displayName)}
                        </h2>
                        <p className="codex-detail__summaryLead">{summaryEntry.descriptionLines[0]}</p>
                    </div>

                    <div
                        className="codex-summaryDossier__count"
                        aria-label={`${summaryEntry.summaryCount} records in view`}
                    >
                        <strong>{summaryEntry.summaryCount}</strong>
                        <span>records</span>
                    </div>
                </div>
            </div>

            <div className="codex-summaryList" aria-label={`${summaryEntry.summaryLabel} overview`}>
                {entries.length > 0 ? (
                    entries.map((entry) => {
                        if (isCodexQuestGroupEntry(entry)) {
                            const variantMeta = entry.variantCount > 1
                                ? `${entry.variantCount} questlines`
                                : entry.variants[0]?.isAlternate
                                    ? entry.variants[0].variantLabel
                                    : null;

                            return (
                                <button
                                    key={entry.entryKey}
                                    type="button"
                                    className="codex-summaryList__item"
                                    onClick={() => onSelectEntry(entry)}
                                >
                                    <span className="codex-summaryList__name">
                                        {renderCodexLabel(getCodexEntryLabel(entry))}
                                    </span>
                                    <span className="codex-summaryList__context">
                                        {[entry.groupContext, variantMeta, `${entry.nodeCount} quest nodes`]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </span>
                                    <span className="codex-summaryList__description">
                                        A grouped quest chapter with compact progression in the detail view.
                                    </span>
                                </button>
                            );
                        }

                        const isFactionEntry = entry.exportKind.trim().toLowerCase() === "factions";
                        const factionAffinity = isFactionEntry ? getCodexFactionAffinityLabel(entry) : null;
                        const factionTraits = isFactionEntry ? getCodexFactionTraitSummary(entry) : "";
                        const structuredSummary = !isFactionEntry ? getCodexStructuredSummary(entry) : "";
                        const preview = isFactionEntry
                            ? factionTraits || getCodexFactionSummaryPreview(entry) || getCodexEntryPreview(entry, 240)
                            : structuredSummary || getCodexEntryPreview(entry, 240);
                        const secondaryContext = factionAffinity
                            ? `Affinity: ${factionAffinity}`
                            : getCodexSecondaryContext(entry);

                        return (
                            <button
                                key={entry.entryKey}
                                type="button"
                                className="codex-summaryList__item"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <span className="codex-summaryList__name">
                                    {renderCodexLabel(getCodexEntryLabel(entry))}
                                </span>
                                {secondaryContext ? (
                                    <span className="codex-summaryList__context">{secondaryContext}</span>
                                ) : null}
                                <span className="codex-summaryList__description">
                                    {preview || "No public description has been added for this entry yet."}
                                </span>
                            </button>
                        );
                    })
                ) : (
                    <p className="codex-detail__placeholder">
                        No {summaryEntry.summaryLabel.toLowerCase()} entries match the current search.
                    </p>
                )}
            </div>
        </article>
    );
}
