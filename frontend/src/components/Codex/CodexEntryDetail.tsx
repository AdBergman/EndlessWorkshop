import type { RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDetailContextLines,
    getCodexEntryLabel,
    getCodexQuestGroupDetailContextLines,
    type CodexQuestGroupEntry,
} from "@/lib/codex/codexPresentation";
import { getDisplayedUnitGrantedAbilityKeys } from "@/lib/codex/codexUnitGrantedAbilities";
import type { CodexEntry } from "@/types/dataTypes";
import CodexFactionDetail from "./CodexFactionDetail";
import CodexQuestProgression from "./CodexQuestProgression";
import CodexStructuredDetail from "./CodexStructuredDetail";
import RelatedEntries from "./RelatedEntries";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";

type Props = {
    entry: CodexEntry | null;
    questGroup: CodexQuestGroupEntry | null;
    relatedEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectRelated: (entry: CodexEntry) => void;
};

export default function CodexEntryDetail({
    entry,
    questGroup,
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

    const detailContextLines = questGroup
        ? getCodexQuestGroupDetailContextLines(entry)
        : getCodexDetailContextLines(entry);
    const showKind = entry.exportKind !== "quests";
    const kindLabel = formatCodexKindLabel(entry.exportKind);
    const isFactionEntry = entry.exportKind.trim().toLowerCase() === "factions";
    const displayedGrantedAbilityKeys = getDisplayedUnitGrantedAbilityKeys(entry, relatedEntries);
    const relatedEntriesForDisplay = displayedGrantedAbilityKeys.size > 0
        ? relatedEntries.filter((relatedEntry) => (
            relatedEntry.exportKind.trim().toLowerCase() !== "abilities" ||
            !displayedGrantedAbilityKeys.has(relatedEntry.entryKey)
        ))
        : relatedEntries;

    return (
        <article className="codex-detail">
            <div className="codex-detail__metaRow">
                <CodexEntryIcon
                    entry={entry}
                    label={kindLabel}
                    className="codex-kindIcon codex-kindIcon--detail"
                    size={20}
                />
                {showKind ? <span className="codex-detail__kind">{kindLabel}</span> : null}
                {detailContextLines.map((line) => (
                    <span className="codex-detail__context" key={line}>{line}</span>
                ))}
            </div>

            <h2 className="codex-detail__title" ref={titleRef} tabIndex={-1}>
                {renderCodexLabel(getCodexEntryLabel(entry))}
            </h2>

            <CodexQuestProgression
                group={questGroup}
                selectedEntryKey={entry.entryKey}
                onSelectNode={onSelectRelated}
            />

            {isFactionEntry ? (
                <CodexFactionDetail entry={entry} />
            ) : (
                <CodexStructuredDetail
                    entry={entry}
                    relatedEntries={relatedEntries}
                    onSelectInlineEntry={onSelectRelated}
                />
            )}

            <RelatedEntries
                entries={relatedEntriesForDisplay}
                onSelect={onSelectRelated}
                priorityMode={isFactionEntry ? "faction" : "default"}
            />
        </article>
    );
}
