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
import { getCodexShallowReferencePreview } from "@/lib/codex/codexShallowReferencePreview";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    allEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
};

export default function CodexSummaryDetail({ summaryEntry, entries, allEntries, titleRef, onSelectEntry }: Props) {
    return (
        <article className="codex-detail codex-detail--summary">
            <div className="codex-summaryDossier">
                <div className="codex-detail__metaRow">
                    <span className="codex-detail__kind">{summaryEntry.summaryLabel}</span>
                    <span className="codex-detail__context">Category overview</span>
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
                        aria-label={`${summaryEntry.summaryCount} entries in view`}
                    >
                        <strong>{summaryEntry.summaryCount}</strong>
                        <span>entries</span>
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
                        const readablePreview = !isFactionEntry ? getCodexReadablePreviewLine(entry) : "";
                        const preview = isFactionEntry
                            ? factionTraits || getCodexFactionSummaryPreview(entry) || getCodexEntryPreview(entry, 240)
                            : readablePreview || getCodexEntryPreview(entry, 240);
                        const secondaryContext = factionAffinity
                            ? `Affinity: ${factionAffinity}`
                            : getCodexSecondaryContext(entry);
                        const shallowPreview = !isFactionEntry
                            ? getCodexShallowReferencePreview(entry, allEntries, secondaryContext, preview)
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
                                {shallowPreview?.context || secondaryContext ? (
                                    <span className="codex-summaryList__context">
                                        {shallowPreview?.context || secondaryContext}
                                    </span>
                                ) : null}
                                <span className="codex-summaryList__description">
                                    {shallowPreview?.preview || preview || "No public description has been added for this entry yet."}
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
