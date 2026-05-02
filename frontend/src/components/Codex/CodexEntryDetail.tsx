import type { RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import RelatedEntries from "./RelatedEntries";

type Props = {
    entry: CodexEntry | null;
    relatedEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectRelated: (entry: CodexEntry) => void;
};

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function CodexEntryDetail({
    entry,
    relatedEntries,
    titleRef,
    onSelectRelated,
}: Props) {
    if (!entry) {
        return (
            <section className="codex-detail codex-detail--empty" aria-live="polite">
                <div className="codex-sectionLabel">Codex entry</div>
                <h2 className="codex-detail__title">Choose an entry</h2>
                <p className="codex-detail__placeholder">
                    Search or browse the encyclopedia to inspect descriptions, links, and supporting game data.
                </p>
            </section>
        );
    }

    const hasDescription = entry.descriptionLines.some((line) => line.trim().length > 0);

    return (
        <article className="codex-detail">
            <div className="codex-detail__metaRow">
                <span className="codex-detail__kind">{formatKindLabel(entry.exportKind)}</span>
            </div>

            <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                {renderCodexLabel(getCodexEntryLabel(entry))}
            </h2>

            <section className="codex-detail__section" aria-labelledby="codex-description-heading">
                <div className="codex-sectionLabel" id="codex-description-heading">
                    Description
                </div>

                {hasDescription ? (
                    <div className="codex-detail__description">
                        {entry.descriptionLines.map((line, index) => (
                            <p key={`${entry.entryKey}-${index}`} className="codex-detail__line">
                                {renderDescriptionLine(line)}
                            </p>
                        ))}
                    </div>
                ) : (
                    <p className="codex-detail__placeholder">No public description has been added for this entry yet.</p>
                )}
            </section>

            <RelatedEntries entries={relatedEntries} onSelect={onSelectRelated} />
        </article>
    );
}
