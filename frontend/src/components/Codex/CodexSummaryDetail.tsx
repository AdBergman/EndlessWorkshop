import type { RefObject } from "react";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexMajorFactionText,
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
import {
    getCodexShallowReferencePreview,
    isShallowReferenceKind,
} from "@/lib/codex/codexShallowReferencePreview";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    allEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
};

export default function CodexSummaryDetail({ summaryEntry, entries, allEntries, titleRef, onSelectEntry }: Props) {
    const isShallowReferenceSummary = isShallowReferenceKind(summaryEntry.summaryKind);
    const summaryContext = isShallowReferenceSummary ? "Reference list" : "Category overview";
    const summaryLead = isShallowReferenceSummary
        ? "Scan exported effect lines and exact linked entries in a compact reference list."
        : summaryEntry.descriptionLines[0];

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
                            {renderCodexLabel(summaryEntry.displayName)}
                        </h2>
                        <p className="codex-detail__summaryLead">{summaryLead}</p>
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
                            ? getCodexShallowReferencePreview(entry, allEntries, preview)
                            : null;

                        if (shallowPreview) {
                            return (
                                <div
                                    key={entry.entryKey}
                                    className="codex-summaryList__item codex-summaryList__item--shallow"
                                >
                                    <div className="codex-summaryList__shallowHeader">
                                        <button
                                            type="button"
                                            className="codex-summaryList__entryButton"
                                            onClick={() => onSelectEntry(entry)}
                                        >
                                            {shallowPreview.iconEntry ? (
                                                <CodexEntryIcon
                                                    entry={shallowPreview.iconEntry}
                                                    label={getCodexEntryLabel(entry)}
                                                    className="codex-kindIcon codex-kindIcon--summaryResource"
                                                    size={20}
                                                />
                                            ) : null}
                                            <span className="codex-summaryList__name">
                                                {renderCodexLabel(getCodexEntryLabel(entry))}
                                            </span>
                                        </button>

                                        <div className="codex-summaryList__shallowMeta">
                                            {shallowPreview.context ? (
                                                <span className="codex-summaryList__context">
                                                    {shallowPreview.context}
                                                </span>
                                            ) : null}

                                            {shallowPreview.links.map((link) => (
                                                <button
                                                    key={`${entry.entryKey}-${link.prefix}-${link.entry.entryKey}`}
                                                    type="button"
                                                    className="codex-summaryList__link"
                                                    aria-label={`${link.prefix}: ${link.label}`}
                                                    onClick={() => onSelectEntry(link.entry)}
                                                >
                                                    <span>{link.prefix}:</span>
                                                    {renderCodexLabel(link.label)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {shallowPreview.effectLines.length > 0 ? (
                                        <div
                                            className="codex-summaryList__effects"
                                            aria-label={`${getCodexEntryLabel(entry)} effects`}
                                        >
                                            {shallowPreview.effectLines.map((line, index) => (
                                                <span
                                                    className="codex-summaryList__effectLine"
                                                    key={`${entry.entryKey}-effect-${index}`}
                                                >
                                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                </span>
                                            ))}
                                        </div>
                                    ) : shallowPreview.links.length === 0 ? (
                                        <span className="codex-summaryList__description">
                                            No public description has been added for this entry yet.
                                        </span>
                                    ) : null}
                                </div>
                            );
                        }

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
