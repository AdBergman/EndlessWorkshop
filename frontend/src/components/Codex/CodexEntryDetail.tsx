import type { RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDetailContextLines,
    getCodexEntryLabel,
    getCodexQuestGroupDetailContextLines,
    type CodexQuestGroupEntry,
} from "@/lib/codex/codexPresentation";
import { getDisplayedGrantedAbilityKeys } from "@/lib/codex/codexGrantedAbilityPreviews";
import { getDisplayedPopulationThresholdTargetKeys } from "@/lib/codex/codexPopulationThresholdTargets";
import { buildStatusRelationshipSourceEntries } from "@/lib/codex/codexStatusRelationships";
import type { CodexEntry } from "@/types/dataTypes";
import CodexFactionDetail from "./CodexFactionDetail";
import CodexQuestProgression from "./CodexQuestProgression";
import CodexStructuredDetail from "./CodexStructuredDetail";
import RelatedEntries from "./RelatedEntries";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";

type Props = {
    entry: CodexEntry | null;
    questGroup: CodexQuestGroupEntry | null;
    allEntries: readonly CodexEntry[];
    relatedEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectRelated: (entry: CodexEntry) => void;
};

export default function CodexEntryDetail({
    entry,
    questGroup,
    allEntries,
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

    const isAbilityEntry = entry.exportKind.trim().toLowerCase() === "abilities";
    const isStatusEntry = entry.exportKind.trim().toLowerCase() === "statuses";
    const detailContextLines = isAbilityEntry ? [] : questGroup
        ? getCodexQuestGroupDetailContextLines(entry)
        : getCodexDetailContextLines(entry);
    const showKind = entry.exportKind !== "quests";
    const kindLabel = formatCodexKindLabel(entry.exportKind);
    const isFactionEntry = entry.exportKind.trim().toLowerCase() === "factions";
    const displayedGrantedAbilityKeys = getDisplayedGrantedAbilityKeys(entry, relatedEntries);
    const displayedThresholdTargetKeys = getDisplayedPopulationThresholdTargetKeys(entry, relatedEntries);
    const hiddenRelatedEntryKeys = new Set([
        ...displayedGrantedAbilityKeys,
        ...displayedThresholdTargetKeys,
    ]);
    const relatedEntriesForDisplay = hiddenRelatedEntryKeys.size > 0
        ? relatedEntries.filter((relatedEntry) => (
            !hiddenRelatedEntryKeys.has(relatedEntry.entryKey)
        ))
        : relatedEntries;
    const statusRelationshipSourceEntries = isStatusEntry
        ? buildStatusRelationshipSourceEntries(entry, allEntries)
        : [];

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
                <CodexFactionDetail
                    entry={entry}
                    allEntries={allEntries}
                    onSelectEntry={onSelectRelated}
                />
            ) : (
                <CodexStructuredDetail
                    entry={entry}
                    relatedEntries={relatedEntries}
                    onSelectInlineEntry={onSelectRelated}
                />
            )}

            {isStatusEntry ? (
                <RelatedEntries
                    entries={statusRelationshipSourceEntries}
                    onSelect={onSelectRelated}
                    headingLabel="Exact Status References"
                />
            ) : null}

            <RelatedEntries
                entries={relatedEntriesForDisplay}
                onSelect={onSelectRelated}
                priorityMode={isFactionEntry ? "faction" : "default"}
                headingLabel={isAbilityEntry ? "Linked Statuses & References" : "Related entries"}
            />
        </article>
    );
}
