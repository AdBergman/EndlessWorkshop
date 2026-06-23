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
    buildCodexConstructibleRichEnrichment,
    getCodexConstructibleRichEnrichmentEntryKeys,
    hasCodexConstructibleRichEnrichment,
} from "@/lib/codex/codexConstructibleRichEnrichment";
import {
    buildCodexHeroRichEnrichment,
    getCodexHeroRichEnrichmentEntryKeys,
    hasCodexHeroRichEnrichment,
} from "@/lib/codex/codexHeroRichEnrichment";
import { getCodexHeroStatGroups } from "@/lib/codex/codexHeroStats";
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
import { useDistrictStore } from "@/stores/districtStore";
import { useHeroStore } from "@/stores/heroStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useSkillStore } from "@/stores/skillStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import type { CodexEntry } from "@/types/dataTypes";
import CodexConstructiblePlanningSection from "./CodexConstructiblePlanningSection";
import CodexFactionDetail from "./CodexFactionDetail";
import CodexFactionPackage from "./CodexFactionPackage";
import CodexHeroProfileSection from "./CodexHeroProfileSection";
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
    const richDistrictByKey = useDistrictStore((state) => state.districtsByKey);
    const districtStoreLoaded = useDistrictStore((state) => state.loaded);
    const districtStoreLoading = useDistrictStore((state) => state.loading);
    const loadDistricts = useDistrictStore((state) => state.loadDistricts);
    const richImprovementByKey = useImprovementStore((state) => state.improvementsByKey);
    const improvementStoreLoaded = useImprovementStore((state) => state.loaded);
    const improvementStoreLoading = useImprovementStore((state) => state.loading);
    const loadImprovements = useImprovementStore((state) => state.loadImprovements);
    const heroByKey = useHeroStore((state) => state.heroesByKey);
    const heroStoreLoaded = useHeroStore((state) => state.loaded);
    const heroStoreLoading = useHeroStore((state) => state.loading);
    const loadHeroes = useHeroStore((state) => state.loadHeroes);
    const skillTreesByKey = useSkillStore((state) => state.skillTreesByKey);
    const skillTiersByKey = useSkillStore((state) => state.skillTiersByKey);
    const skillsByKey = useSkillStore((state) => state.skillsByKey);
    const skillDefaultsByHeroKey = useSkillStore((state) => state.heroSkillDefaultsByHeroKey);
    const skillStoreLoaded = useSkillStore((state) => state.loaded);
    const skillStoreLoading = useSkillStore((state) => state.loading);
    const loadSkills = useSkillStore((state) => state.loadSkills);
    const normalizedEntryKey = entry?.entryKey.trim() ?? "";
    const normalizedExportKind = entry?.exportKind.trim().toLowerCase() ?? "";
    const isHeroEntry = normalizedExportKind === "heroes";
    const isDistrictEntry = normalizedExportKind === "districts";
    const isImprovementEntry = normalizedExportKind === "improvements";
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
    const heroRichEnrichment = useMemo(
        () => entry
            ? buildCodexHeroRichEnrichment(
                    entry,
                    heroByKey,
                    skillTreesByKey,
                    skillTiersByKey,
                    skillsByKey,
                    skillDefaultsByHeroKey,
                    allEntries
                )
            : { origin: null, classLabel: null, skillPathTypes: [], startingSkills: [], skillOptions: [] },
        [allEntries, entry, heroByKey, skillDefaultsByHeroKey, skillTiersByKey, skillTreesByKey, skillsByKey]
    );
    const constructibleRichEnrichment = useMemo(
        () => entry
            ? buildCodexConstructibleRichEnrichment(
                    entry,
                    richDistrictByKey,
                    richImprovementByKey,
                    allEntries
                )
            : { unlockedBy: [], upgradesInto: [], placementLines: [] },
        [allEntries, entry, richDistrictByKey, richImprovementByKey]
    );
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

    useEffect(() => {
        if (!isHeroEntry || heroStoreLoaded || heroStoreLoading) return;

        void loadHeroes();
    }, [heroStoreLoaded, heroStoreLoading, isHeroEntry, loadHeroes]);

    useEffect(() => {
        if (!isHeroEntry || skillStoreLoaded || skillStoreLoading) return;

        void loadSkills();
    }, [isHeroEntry, loadSkills, skillStoreLoaded, skillStoreLoading]);

    useEffect(() => {
        if (!isDistrictEntry || districtStoreLoaded || districtStoreLoading) return;

        void loadDistricts();
    }, [districtStoreLoaded, districtStoreLoading, isDistrictEntry, loadDistricts]);

    useEffect(() => {
        if (!isImprovementEntry || improvementStoreLoaded || improvementStoreLoading) return;

        void loadImprovements();
    }, [improvementStoreLoaded, improvementStoreLoading, isImprovementEntry, loadImprovements]);

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
        ...getCodexHeroRichEnrichmentEntryKeys(heroRichEnrichment),
        ...getCodexConstructibleRichEnrichmentEntryKeys(constructibleRichEnrichment),
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
    const showHeroRichEnrichment = isHeroEntry && hasCodexHeroRichEnrichment(heroRichEnrichment);
    const heroStatGroups = isHeroEntry ? getCodexHeroStatGroups(entry) : [];
    const showHeroProfile = isHeroEntry && (showHeroRichEnrichment || heroStatGroups.length > 0);
    const showConstructibleRichEnrichment = (isDistrictEntry || isImprovementEntry) &&
        hasCodexConstructibleRichEnrichment(constructibleRichEnrichment);

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
            ) : showHeroRichEnrichment ? null : (
                <CodexStructuredDetail
                    entry={entry}
                    allEntries={allEntries}
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

            {showHeroProfile ? (
                <CodexHeroProfileSection
                    enrichment={heroRichEnrichment}
                    statGroups={heroStatGroups}
                    onSelect={onSelectRelated}
                />
            ) : null}

            {showConstructibleRichEnrichment ? (
                <CodexConstructiblePlanningSection
                    enrichment={constructibleRichEnrichment}
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
