import { useMemo, type RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    type CodexListItem,
    type CodexSummaryEntry,
} from "@/lib/codex/codexPresentation";
import { isShallowReferenceKind } from "@/lib/codex/codexShallowReferencePreview";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
} from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";
import CodexSummaryList from "./CodexSummaryList";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    allEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
    titleOverride?: string;
    contextOverride?: string;
    searchQuery?: string;
    hasActiveFilters?: boolean;
};

export default function CodexSummaryDetail({
    summaryEntry,
    entries,
    allEntries,
    titleRef,
    onSelectEntry,
    titleOverride,
    contextOverride,
    searchQuery = "",
    hasActiveFilters = false,
}: Props) {
    const isShallowReferenceSummary = isShallowReferenceKind(summaryEntry.summaryKind);
    const summaryContext = contextOverride ?? (isShallowReferenceSummary ? "Reference list" : "Category overview");
    const summaryTitle = titleOverride ?? summaryEntry.displayName;
    const referenceIndexes = useMemo(
        () => ({
            entriesByKey: buildEntriesByKey(allEntries),
            entriesByKindKey: buildEntriesByKindKey(allEntries),
        }),
        [allEntries]
    );

    return (
        <article className="codex-detail codex-detail--summary">
            <div
                className={`codex-summaryDossier ${isShallowReferenceSummary ? "codex-summaryDossier--reference" : ""}`}
            >
                <div className="codex-detail__metaRow">
                    <span className="codex-detail__kind">{summaryEntry.summaryLabel}</span>
                    <span className="codex-detail__context">{summaryContext}</span>
                </div>

                <div className="codex-summaryDossier__hero">
                    <div>
                        <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                            {renderCodexLabel(summaryTitle)}
                        </h2>
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

            <CodexSummaryList
                allEntries={allEntries}
                entries={entries}
                hasActiveFilters={hasActiveFilters}
                onSelectEntry={onSelectEntry}
                referenceIndexes={referenceIndexes}
                searchQuery={searchQuery}
                summaryEntry={summaryEntry}
            />
        </article>
    );
}
