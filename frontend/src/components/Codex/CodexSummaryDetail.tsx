import type { RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    getCodexEntryPreview,
    getCodexSecondaryContext,
    isCodexQuestGroupEntry,
    type CodexListItem,
    type CodexSummaryEntry,
} from "@/lib/codex/codexPresentation";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
};

export default function CodexSummaryDetail({ summaryEntry, entries, titleRef, onSelectEntry }: Props) {
    return (
        <article className="codex-detail codex-detail--summary">
            <div className="codex-detail__metaRow">
                <span className="codex-detail__kind">{summaryEntry.summaryLabel}</span>
            </div>

            <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                {renderCodexLabel(summaryEntry.displayName)}
            </h2>

            <p className="codex-detail__summaryLead">{summaryEntry.descriptionLines[0]}</p>

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
                                        {renderCodexLabel(entry.displayName)}
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

                        const preview = getCodexEntryPreview(entry, 240);
                        const secondaryContext = getCodexSecondaryContext(entry);

                        return (
                            <button
                                key={entry.entryKey}
                                type="button"
                                className="codex-summaryList__item"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <span className="codex-summaryList__name">
                                    {renderCodexLabel(entry.displayName)}
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
