import type { RefObject } from "react";
import { getCodexEntryLabel, getCodexEntryPreview, type CodexSummaryEntry } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexEntry) => void;
};

export default function CodexSummaryDetail({ summaryEntry, entries, titleRef, onSelectEntry }: Props) {
    return (
        <article className="codex-detail codex-detail--summary">
            <div className="codex-detail__metaRow">
                <span className="codex-detail__kind">{summaryEntry.summaryLabel}</span>
            </div>

            <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                {summaryEntry.displayName}
            </h2>

            <p className="codex-detail__summaryLead">{summaryEntry.descriptionLines[0]}</p>

            <div className="codex-summaryList" aria-label={`${summaryEntry.summaryLabel} overview`}>
                {entries.length > 0 ? (
                    entries.map((entry) => {
                        const preview = getCodexEntryPreview(entry, 240);

                        return (
                            <button
                                key={entry.entryKey}
                                type="button"
                                className="codex-summaryList__item"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <span className="codex-summaryList__name">{getCodexEntryLabel(entry)}</span>
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
