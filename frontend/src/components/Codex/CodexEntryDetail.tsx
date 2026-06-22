import { useEffect, useMemo, type RefObject } from "react";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    buildCodexFactionPackageGroups,
    buildCodexRichFactionPackageGroups,
    getCodexFactionPackageEntryKeys,
} from "@/lib/codex/codexFactionPackage";
import {
    formatCodexKindLabel,
    getCodexDetailContextLines,
    getCodexEntryLabel,
} from "@/lib/codex/codexPresentation";
import { getDisplayedGrantedAbilityKeys } from "@/lib/codex/codexGrantedAbilityPreviews";
import { getDisplayedPopulationThresholdTargetKeys } from "@/lib/codex/codexPopulationThresholdTargets";
import { buildStatusRelationshipSourceEntries } from "@/lib/codex/codexStatusRelationships";
import {
    buildCodexTechRichEnrichment,
    hasCodexTechRichEnrichment,
} from "@/lib/codex/codexTechRichEnrichment";
import {
    buildCodexUnitRichEnrichment,
    hasCodexUnitRichEnrichment,
} from "@/lib/codex/codexUnitRichEnrichment";
import {
    selectFactionByKey,
    selectFactionLoaded,
    selectFactionLoading,
    useFactionStore,
} from "@/stores/factionStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import type { CodexEntry } from "@/types/dataTypes";
import CodexFactionDetail from "./CodexFactionDetail";
import CodexFactionPackage from "./CodexFactionPackage";
import CodexStructuredDetail from "./CodexStructuredDetail";
import CodexTechPrerequisiteSection from "./CodexTechPrerequisiteSection";
import CodexUnitProfileSection from "./CodexUnitProfileSection";
import RelatedEntries from "./RelatedEntries";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";

type Props = {
    entry: CodexEntry | null;
    allEntries: readonly CodexEntry[];
    relatedEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectRelated: (entry: CodexEntry) => void;
};

export default function CodexEntryDetail({
    entry,
    allEntries,
    relatedEntries,
    titleRef,
    onSelectRelated,
}: Props) {
    const richTechByKey = useTechStore((state) => state.techsByKey);
    const richUnitByKey = useUnitStore((state) => state.unitsByKey);
    const normalizedEntryKey = entry?.entryKey.trim() ?? "";
    const richFaction = useFactionStore(selectFactionByKey(normalizedEntryKey));
    const factionsLoaded = useFactionStore(selectFactionLoaded);
    const factionsLoading = useFactionStore(selectFactionLoading);
    const loadFactions = useFactionStore((state) => state.loadFactions);
    const techRichEnrichment = useMemo(
        () => entry
            ? buildCodexTechRichEnrichment(entry, richTechByKey, allEntries)
            : { prerequisites: [], exclusivePrerequisites: [] },
        [entry, richTechByKey, allEntries]
    );
    const unitRichEnrichment = useMemo(
        () => entry
            ? buildCodexUnitRichEnrichment(entry, richUnitByKey, allEntries)
            : { previousUnit: null, evolvesInto: [] },
        [entry, richUnitByKey, allEntries]
    );
    const normalizedExportKind = entry?.exportKind.trim().toLowerCase() ?? "";
    const isFactionEntry = normalizedExportKind === "factions";
    const isMinorFactionEntry = normalizedExportKind === "minorfactions";
    const isFactionLikeEntry = isFactionEntry || isMinorFactionEntry;
    const factionPackageGroups = useMemo(() => {
        if (!entry || !isFactionLikeEntry) return [];

        const richGroups = buildCodexRichFactionPackageGroups(entry, richFaction, allEntries);
        if (richGroups.length > 0) return richGroups;

        return isFactionEntry ? buildCodexFactionPackageGroups(entry, allEntries) : [];
    }, [allEntries, entry, isFactionEntry, isFactionLikeEntry, richFaction]);
    const richFactionPackageEntryKeys = useMemo(
        () => (richFaction ? getCodexFactionPackageEntryKeys(factionPackageGroups) : []),
        [factionPackageGroups, richFaction]
    );

    useEffect(() => {
        if (!isFactionLikeEntry || factionsLoaded || factionsLoading) return;

        void loadFactions();
    }, [factionsLoaded, factionsLoading, isFactionLikeEntry, loadFactions]);

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

    const isAbilityEntry = normalizedExportKind === "abilities";
    const isStatusEntry = normalizedExportKind === "statuses";
    const isTechEntry = normalizedExportKind === "tech";
    const isUnitEntry = normalizedExportKind === "units";
    const detailContextLines = isAbilityEntry ? [] : getCodexDetailContextLines(entry);
    const showKind = entry.exportKind !== "quests";
    const kindLabel = formatCodexKindLabel(entry.exportKind);
    const displayedGrantedAbilityKeys = getDisplayedGrantedAbilityKeys(entry, relatedEntries);
    const displayedThresholdTargetKeys = getDisplayedPopulationThresholdTargetKeys(entry, relatedEntries);
    const hiddenRelatedEntryKeys = new Set([
        ...displayedGrantedAbilityKeys,
        ...displayedThresholdTargetKeys,
        ...richFactionPackageEntryKeys,
    ]);
    const relatedEntriesForDisplay = hiddenRelatedEntryKeys.size > 0
        ? relatedEntries.filter((relatedEntry) => (
            !hiddenRelatedEntryKeys.has(relatedEntry.entryKey)
        ))
        : relatedEntries;
    const statusRelationshipSourceEntries = isStatusEntry
        ? buildStatusRelationshipSourceEntries(entry, allEntries)
        : [];
    const showTechRichEnrichment = isTechEntry && hasCodexTechRichEnrichment(techRichEnrichment);
    const showUnitRichEnrichment = isUnitEntry && hasCodexUnitRichEnrichment(unitRichEnrichment);

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

            {isFactionEntry ? (
                <CodexFactionDetail
                    entry={entry}
                    packageGroups={factionPackageGroups}
                    onSelectEntry={onSelectRelated}
                />
            ) : (
                <CodexStructuredDetail
                    entry={entry}
                    relatedEntries={relatedEntries}
                    onSelectInlineEntry={onSelectRelated}
                />
            )}

            {isMinorFactionEntry ? (
                <CodexFactionPackage groups={factionPackageGroups} onSelectEntry={onSelectRelated} />
            ) : null}

            {showTechRichEnrichment ? (
                <CodexTechPrerequisiteSection
                    enrichment={techRichEnrichment}
                    onSelect={onSelectRelated}
                />
            ) : null}

            {showUnitRichEnrichment ? (
                <CodexUnitProfileSection
                    enrichment={unitRichEnrichment}
                    onSelect={onSelectRelated}
                />
            ) : null}

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
