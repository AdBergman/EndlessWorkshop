import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { IconImg } from "@/features/icons/IconImg";
import { buildAbilityInlineLinkCandidates } from "@/lib/codex/codexAbilityInlineLinks";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexMajorFactionText,
    getCodexEntryPreview,
    getCodexEntryLabel,
    getCodexSecondaryContext,
    type CodexListItem,
    type CodexSummaryEntry,
} from "@/lib/codex/codexPresentation";
import {
    buildCodexFactionArchivePreview,
    getCodexFactionAffinityLabel,
    getCodexFactionSummaryPreview,
    getCodexFactionStrategicPreview,
    getCodexFactionTraitSummary,
} from "@/lib/codex/codexFactionPresentation";
import { getCodexShallowReferencePreview } from "@/lib/codex/codexShallowReferencePreview";
import {
    buildGrantedAbilityPreview,
    isGrantedAbilityPreviewSection,
    type CodexGrantedAbilityPreview as GrantedAbilityPreview,
} from "@/lib/codex/codexGrantedAbilityPreviews";
import {
    getCodexReadablePreviewLine,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import { resolveRelatedEntries, type CodexReferenceIndexes } from "@/lib/codex/codexRefs";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import { isDistrictArchiveEntry } from "@/lib/codex/codexDistrictArchiveFilters";
import type { CodexEntry, District } from "@/types/dataTypes";
import CodexAbilityEffectLine from "./CodexAbilityEffectLine";
import CodexInlineEntityLink from "./CodexInlineEntityLink";
import { DiplomacyArchiveRow, EquipmentArchiveRow, QuestArchiveRow, TechArchiveRow } from "./CodexSummaryProgressionRows";
import { HeroArchiveRow, UnitArchiveRow } from "./CodexSummaryRosterRows";
import {
    MAX_EQUIPMENT_GRANTED_ABILITY_LINKS,
    MAX_HERO_GRANTED_ABILITY_LINKS,
    MAX_QUEST_INLINE_LINKS,
    MAX_TECH_UNLOCK_LINKS,
    MAX_UNIT_GRANTED_ABILITY_LINKS,
    getAbilityCatalogEffectPreviewLines,
    getAbilityCatalogMetadata,
    getAbilityCatalogPreview,
    getEquipmentArchiveMetadata,
    getOverviewMetadata,
    getStatusArchiveMetadata,
    getTechArchiveMetadata,
    isSameAbilityPreviewLine,
    supportsRichOverviewRow,
} from "./CodexSummaryDetailViewModel";
import {
    getActionArchivePreview,
    getDiplomacyArchiveMetadata,
    getDiplomacyArchivePreview,
    getDiplomacyArchiveSignalLines,
    getDistrictArchiveEffectPreviewLines,
    getDistrictArchiveDisplayName,
    getDistrictArchiveMetadata,
    getDistrictArchivePlanningLines,
    getDistrictExtractedResourceLinks,
    getEquipmentArchiveEffectPreviewLines,
    getHeroArchiveStatPreviewLines,
    getHeroClassMetadata,
    getHeroFactionIdentity,
    getHeroGrantedAbilityLinks,
    getImprovementArchiveEffectPreviewLines,
    getImprovementArchiveMetadata,
    getPopulationArchiveFactionIdentity,
    getPopulationArchivePreviewLines,
    getQuestArchiveLinks,
    getQuestArchivePreviewLines,
    getStatusArchiveEffectPreviewLines,
    getTechArchiveEffectPreviewLines,
    getTechArchiveUnlockLinks,
    getUnitArchiveMetadata,
    getUnitArchiveStatPreviewLines,
    getUnitFactionIdentity,
    getVictoryConditionArchiveDescription,
    getVictoryConditionArchiveMetadata,
    getVictoryConditionArchivePreviewLines,
} from "./CodexSummaryArchiveViewModel";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    allEntries: CodexEntry[];
    referenceIndexes: CodexReferenceIndexes;
    richDistrictByKey?: Readonly<Record<string, District | undefined>>;
    onSelectEntry: (entry: CodexListItem) => void;
    searchQuery: string;
    hasActiveFilters: boolean;
};

export default function CodexSummaryList({
    summaryEntry,
    entries,
    allEntries,
    referenceIndexes,
    richDistrictByKey = {},
    onSelectEntry,
    searchQuery,
    hasActiveFilters,
}: Props) {
    return (
            <div className="codex-summaryList" aria-label={`${summaryEntry.summaryLabel} overview`}>
                {entries.length > 0 ? (
                    entries.map((entry) => {
                        const isActionEntry = entry.exportKind.trim().toLowerCase() === "actions";
                        const normalizedExportKind = entry.exportKind.trim().toLowerCase();
                        const isFactionEntry = normalizedExportKind === "factions";
                        const isFactionLikeEntry = isFactionEntry || normalizedExportKind === "minorfactions";
                        const factionArchivePreview = isFactionLikeEntry
                            ? buildCodexFactionArchivePreview(entry, allEntries)
                            : null;
                        const factionArchiveClass = factionArchivePreview
                            ? normalizedExportKind === "minorfactions"
                                ? "codex-summaryList__item--factionArchive codex-summaryList__item--minorFactionArchive"
                                : "codex-summaryList__item--factionArchive codex-summaryList__item--majorFactionArchive"
                            : "";
                        const factionAffinity = isFactionEntry ? getCodexFactionAffinityLabel(entry) : null;
                        const factionTraits = isFactionEntry ? getCodexFactionTraitSummary(entry) : "";
                        const factionStrategicPreview = isFactionEntry ? getCodexFactionStrategicPreview(entry) : "";
                        const readablePreview = !isFactionEntry && !isActionEntry
                            ? getCodexReadablePreviewLine(entry)
                            : "";
                        const basePreview = isFactionEntry
                            ? factionStrategicPreview ||
                                factionTraits ||
                                getCodexFactionSummaryPreview(entry) ||
                                getCodexEntryPreview(entry, 240)
                            : readablePreview || getCodexEntryPreview(entry, 240);
                        const preview = isActionEntry
                            ? getActionArchivePreview(entry)
                            : getDiplomacyArchivePreview(entry, basePreview);
                        const secondaryContext = isActionEntry
                            ? ""
                            : (
                                factionAffinity
                                    ? `Affinity: ${factionAffinity}`
                                    : getCodexSecondaryContext(entry)
                            );
                        const showRichOverviewRow = supportsRichOverviewRow(entry);
                        const useCatalogRowHierarchy = entry.exportKind.trim().toLowerCase() === "abilities";
                        const useStatusArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "statuses";
                        const useEquipmentArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "equipment";
                        const useImprovementArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "improvements";
                        const useDistrictArchiveRowHierarchy = isDistrictArchiveEntry(entry);
                        const useDiplomacyArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "diplomatictreaties";
                        const useHeroArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "heroes";
                        const usePopulationArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "populations";
                        const useQuestArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "quests";
                        const useTechArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "tech";
                        const useUnitArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "units";
                        const useVictoryConditionArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "victoryconditions";
                        const overviewMetadata = showRichOverviewRow ? getOverviewMetadata(entry) : [];
                        const abilityCatalogMetadata = useCatalogRowHierarchy ? getAbilityCatalogMetadata(entry) : [];
                        const statusArchiveMetadata = useStatusArchiveRowHierarchy ? getStatusArchiveMetadata(entry) : [];
                        const equipmentArchiveMetadata = useEquipmentArchiveRowHierarchy ? getEquipmentArchiveMetadata(entry) : [];
                        const heroRelatedEntries = useHeroArchiveRowHierarchy
                            ? resolveRelatedEntries(entry, referenceIndexes)
                            : [];
                        const heroFactionIdentity = useHeroArchiveRowHierarchy
                            ? getHeroFactionIdentity(entry, heroRelatedEntries)
                            : null;
                        const heroClassMetadata = useHeroArchiveRowHierarchy ? getHeroClassMetadata(entry) : [];
                        const improvementArchiveMetadata = useImprovementArchiveRowHierarchy ? getImprovementArchiveMetadata(entry) : [];
                        const districtArchiveMetadata = useDistrictArchiveRowHierarchy
                            ? getDistrictArchiveMetadata(entry, richDistrictByKey, allEntries)
                            : [];
                        const populationFactionIdentity = usePopulationArchiveRowHierarchy
                            ? getPopulationArchiveFactionIdentity(entry, referenceIndexes)
                            : null;
                        const populationArchivePreviewLines = usePopulationArchiveRowHierarchy
                            ? getPopulationArchivePreviewLines(entry, referenceIndexes)
                            : [];
                        const diplomacyArchiveMetadata = useDiplomacyArchiveRowHierarchy ? getDiplomacyArchiveMetadata(entry) : [];
                        const diplomacyArchiveSignalLines = useDiplomacyArchiveRowHierarchy
                            ? getDiplomacyArchiveSignalLines(entry, allEntries, preview)
                            : [];
                        const questArchivePreviewLines = useQuestArchiveRowHierarchy
                            ? getQuestArchivePreviewLines(entry, preview)
                            : [];
                        const questArchiveLinks = useQuestArchiveRowHierarchy
                            ? getQuestArchiveLinks(entry, referenceIndexes)
                            : [];
                        const visibleQuestArchiveLinks = questArchiveLinks.slice(0, MAX_QUEST_INLINE_LINKS);
                        const questArchiveLinkOverflowCount = Math.max(
                            0,
                            questArchiveLinks.length - visibleQuestArchiveLinks.length
                        );
                        const techRelatedEntries = useTechArchiveRowHierarchy
                            ? resolveRelatedEntries(entry, referenceIndexes)
                            : [];
                        const techArchiveMetadata = useTechArchiveRowHierarchy ? getTechArchiveMetadata(entry) : [];
                        const techEffectPreviewLines = useTechArchiveRowHierarchy
                            ? getTechArchiveEffectPreviewLines(entry)
                            : [];
                        const techUnlockLinks = useTechArchiveRowHierarchy
                            ? getTechArchiveUnlockLinks(entry, techRelatedEntries)
                            : [];
                        const visibleTechUnlockLinks = techUnlockLinks.slice(0, MAX_TECH_UNLOCK_LINKS);
                        const techUnlockOverflowCount = Math.max(
                            0,
                            techUnlockLinks.length - visibleTechUnlockLinks.length
                        );
                        const victoryConditionArchiveMetadata = useVictoryConditionArchiveRowHierarchy
                            ? getVictoryConditionArchiveMetadata(entry)
                            : [];
                        const victoryConditionArchiveDescription = useVictoryConditionArchiveRowHierarchy
                            ? getVictoryConditionArchiveDescription(entry, preview)
                            : "";
                        const victoryConditionArchivePreviewLines = useVictoryConditionArchiveRowHierarchy
                            ? getVictoryConditionArchivePreviewLines(entry)
                            : [];
                        const catalogPreview = useCatalogRowHierarchy
                            ? getAbilityCatalogPreview(preview, overviewMetadata)
                            : preview;
                        const abilityEffectPreviewLines = useCatalogRowHierarchy
                            ? getAbilityCatalogEffectPreviewLines(entry, searchQuery)
                            : [];
                        const abilityInlineLinkCandidates = useCatalogRowHierarchy
                            ? buildAbilityInlineLinkCandidates(entry, resolveRelatedEntries(entry, referenceIndexes))
                            : [];
                        const statusEffectPreviewLines = useStatusArchiveRowHierarchy
                            ? getStatusArchiveEffectPreviewLines(entry)
                            : [];
                        const equipmentEffectPreviewLines = useEquipmentArchiveRowHierarchy
                            ? getEquipmentArchiveEffectPreviewLines(entry)
                            : [];
                        const heroStatPreviewLines = useHeroArchiveRowHierarchy
                            ? getHeroArchiveStatPreviewLines(entry)
                            : [];
                        const heroGrantedAbilityLinks = useHeroArchiveRowHierarchy
                            ? getHeroGrantedAbilityLinks(entry, heroRelatedEntries)
                            : [];
                        const visibleHeroGrantedAbilityLinks = heroGrantedAbilityLinks.slice(0, MAX_HERO_GRANTED_ABILITY_LINKS);
                        const heroGrantedAbilityOverflowCount = Math.max(
                            0,
                            heroGrantedAbilityLinks.length - visibleHeroGrantedAbilityLinks.length
                        );
                        const unitRelatedEntries = useUnitArchiveRowHierarchy
                            ? resolveRelatedEntries(entry, referenceIndexes)
                            : [];
                        const unitFactionIdentity = useUnitArchiveRowHierarchy
                            ? getUnitFactionIdentity(entry, unitRelatedEntries)
                            : null;
                        const unitArchiveMetadata = useUnitArchiveRowHierarchy ? getUnitArchiveMetadata(entry) : [];
                        const unitStatPreviewLines = useUnitArchiveRowHierarchy
                            ? getUnitArchiveStatPreviewLines(entry)
                            : [];
                        const unitGrantedAbilityPreviews = useUnitArchiveRowHierarchy
                            ? parseCodexStructuredDescription(entry).sections
                                .filter((section) => isGrantedAbilityPreviewSection(entry, section.label))
                                .flatMap((section) => section.items ?? [])
                                .map((item) => buildGrantedAbilityPreview(item, unitRelatedEntries))
                                .filter((item): item is GrantedAbilityPreview => item !== null)
                            : [];
                        const visibleUnitGrantedAbilityPreviews = unitGrantedAbilityPreviews
                            .slice(0, MAX_UNIT_GRANTED_ABILITY_LINKS);
                        const unitGrantedAbilityOverflowCount = Math.max(
                            0,
                            unitGrantedAbilityPreviews.length - visibleUnitGrantedAbilityPreviews.length
                        );
                        const improvementEffectPreviewLines = useImprovementArchiveRowHierarchy
                            ? getImprovementArchiveEffectPreviewLines(entry)
                            : [];
                        const districtEffectPreviewLines = useDistrictArchiveRowHierarchy
                            ? getDistrictArchiveEffectPreviewLines(entry, allEntries, richDistrictByKey)
                            : [];
                        const districtExtractedResourceLinks = useDistrictArchiveRowHierarchy
                            ? getDistrictExtractedResourceLinks(entry, referenceIndexes)
                            : [];
                        const districtArchivePlanningLines = useDistrictArchiveRowHierarchy
                            ? getDistrictArchivePlanningLines(entry, richDistrictByKey, allEntries)
                            : [];
                        const equipmentGrantedAbilityPreviews = useEquipmentArchiveRowHierarchy
                            ? parseCodexStructuredDescription(entry).sections
                                .filter((section) => isGrantedAbilityPreviewSection(entry, section.label))
                                .flatMap((section) => section.items ?? [])
                                .map((item) => buildGrantedAbilityPreview(item, resolveRelatedEntries(entry, referenceIndexes)))
                                .filter((item): item is GrantedAbilityPreview => item !== null)
                            : [];
                        const visibleEquipmentGrantedAbilityPreviews = equipmentGrantedAbilityPreviews
                            .slice(0, MAX_EQUIPMENT_GRANTED_ABILITY_LINKS);
                        const equipmentGrantedAbilityOverflowCount = Math.max(
                            0,
                            equipmentGrantedAbilityPreviews.length - visibleEquipmentGrantedAbilityPreviews.length
                        );
                        const visibleCatalogPreview = (
                            useCatalogRowHierarchy &&
                            catalogPreview !== null &&
                            abilityEffectPreviewLines.some((line) => isSameAbilityPreviewLine(catalogPreview, line))
                        )
                            ? null
                            : catalogPreview;
                        const shallowPreview = factionArchivePreview
                            ? {
                                context: factionArchivePreview.context,
                                effectLines: factionArchivePreview.lines,
                                iconEntry: factionArchivePreview.iconEntry,
                                links: [],
                            }
                            : getCodexShallowReferencePreview(entry, allEntries, preview);

                        if (shallowPreview) {
                            return (
                                <div
                                    key={entry.entryKey}
                                    className={`codex-summaryList__item codex-summaryList__item--shallow ${
                                        factionArchiveClass
                                    }`}
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

                                    {factionArchivePreview?.links.length ? (
                                        <div
                                            className="codex-summaryList__factionLinks"
                                            aria-label={`${getCodexEntryLabel(entry)} associated entries`}
                                        >
                                            {factionArchivePreview.links.map((link) => (
                                                <span
                                                    className="codex-summaryList__factionLink"
                                                    key={`${entry.entryKey}-${link.prefix}-${link.entry.entryKey}`}
                                                >
                                                    <span className="codex-summaryList__factionLinkPrefix">
                                                        {link.prefix}:
                                                    </span>
                                                    <CodexInlineEntityLink
                                                        entry={link.entry}
                                                        onSelect={(linkedEntry) => onSelectEntry(linkedEntry)}
                                                    >
                                                        {renderCodexLabel(link.label)}
                                                    </CodexInlineEntityLink>
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        }

                        if (useCatalogRowHierarchy) {
                            return (
                                <div
                                    key={entry.entryKey}
                                    className="codex-summaryList__item codex-summaryList__item--catalog"
                                >
                                    <button
                                        type="button"
                                        className="codex-summaryList__entryButton codex-summaryList__entryButton--catalog"
                                        onClick={() => onSelectEntry(entry)}
                                    >
                                        <span className="codex-summaryList__titleLine">
                                            <span className="codex-summaryList__titleIdentity">
                                                <CodexEntryIcon
                                                    entry={entry}
                                                    label={getCodexEntryLabel(entry)}
                                                    className="codex-kindIcon codex-kindIcon--summaryEntry"
                                                    size={20}
                                                />
                                                <span className="codex-summaryList__name">
                                                    {renderCodexLabel(getCodexEntryLabel(entry))}
                                                </span>
                                            </span>
                                            {abilityCatalogMetadata.length > 0 ? (
                                                <span
                                                    className="codex-summaryList__metadata codex-summaryList__metadata--ability"
                                                    aria-label="Exported metadata"
                                                >
                                                    {abilityCatalogMetadata.map((item) => (
                                                        <span
                                                            key={`${item.key}-${item.value}`}
                                                            className="codex-summaryList__metadataText"
                                                        >
                                                            {item.value}
                                                        </span>
                                                    ))}
                                                </span>
                                            ) : null}
                                        </span>
                                        {visibleCatalogPreview !== null ? (
                                            <span className="codex-summaryList__description">
                                                {visibleCatalogPreview || "No public description has been added for this entry yet."}
                                            </span>
                                        ) : null}
                                    </button>
                                    {abilityEffectPreviewLines.length > 0 ? (
                                        <span
                                            className="codex-summaryList__effectPreview"
                                            aria-label="Effect preview"
                                        >
                                            {abilityEffectPreviewLines.map((line, index) => (
                                                <CodexAbilityEffectLine
                                                    as="span"
                                                    className="codex-summaryList__effectPreviewLine"
                                                    inlineLinkCandidates={abilityInlineLinkCandidates}
                                                    key={`${entry.entryKey}-effect-preview-${index}`}
                                                    line={line}
                                                    lineKey={`${entry.entryKey}-effect-preview-${index}`}
                                                    onSelectInlineEntry={(inlineEntry) => onSelectEntry(inlineEntry)}
                                                />
                                            ))}
                                        </span>
                                    ) : null}
                                </div>
                            );
                        }

                        if (useStatusArchiveRowHierarchy) {
                            return (
                                <button
                                    key={entry.entryKey}
                                    type="button"
                                    className="codex-summaryList__item codex-summaryList__item--statusArchive"
                                    onClick={() => onSelectEntry(entry)}
                                >
                                    <span className="codex-summaryList__titleLine">
                                        <span className="codex-summaryList__titleIdentity">
                                            <span className="codex-summaryList__name">
                                                {renderCodexLabel(getCodexEntryLabel(entry))}
                                            </span>
                                        </span>
                                        {statusArchiveMetadata.length > 0 ? (
                                            <span
                                                className="codex-summaryList__metadata codex-summaryList__metadata--status"
                                                aria-label="Status metadata"
                                            >
                                                {statusArchiveMetadata.map((item) => (
                                                    <span
                                                        key={`${item.key}-${item.value}`}
                                                        className="codex-summaryList__metadataText"
                                                    >
                                                        {item.value}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </span>

                                    <span
                                        className="codex-summaryList__statusEffects"
                                        aria-label="Status effect preview"
                                    >
                                        {statusEffectPreviewLines.length > 0 ? (
                                            statusEffectPreviewLines.map((line, index) => (
                                                <span
                                                    className="codex-summaryList__statusEffectLine"
                                                    key={`${entry.entryKey}-status-preview-${index}`}
                                                >
                                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="codex-summaryList__statusFallback">
                                                No public mechanics exported yet.
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        }

                        if (useVictoryConditionArchiveRowHierarchy) {
                            return (
                                <button
                                    key={entry.entryKey}
                                    type="button"
                                    className="codex-summaryList__item codex-summaryList__item--victoryConditionArchive"
                                    onClick={() => onSelectEntry(entry)}
                                >
                                    <span className="codex-summaryList__titleLine">
                                        <span className="codex-summaryList__titleIdentity">
                                            <span className="codex-summaryList__name">
                                                {renderCodexLabel(getCodexEntryLabel(entry))}
                                            </span>
                                        </span>
                                        {victoryConditionArchiveMetadata.length > 0 ? (
                                            <span
                                                className="codex-summaryList__metadata codex-summaryList__metadata--victoryCondition"
                                                aria-label="Victory condition metadata"
                                            >
                                                {victoryConditionArchiveMetadata.map((item) => (
                                                    <span
                                                        key={`${item.key}-${item.value}`}
                                                        className="codex-summaryList__metadataText"
                                                    >
                                                        {item.value}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </span>

                                    {victoryConditionArchiveDescription ? (
                                        <span className="codex-summaryList__description">
                                            {renderDescriptionLine(formatCodexMajorFactionText(victoryConditionArchiveDescription))}
                                        </span>
                                    ) : null}

                                    {victoryConditionArchivePreviewLines.length > 0 ? (
                                        <span
                                            className="codex-summaryList__victoryConditionSignals"
                                            aria-label="Victory condition planning summary"
                                        >
                                            {victoryConditionArchivePreviewLines.map((line) => (
                                                <span
                                                    className={`codex-summaryList__victoryConditionSignal codex-summaryList__victoryConditionSignal--${line.key}`}
                                                    key={`${entry.entryKey}-victory-condition-${line.key}`}
                                                >
                                                    <span className="codex-summaryList__victoryConditionSignalLabel">
                                                        {line.label}:
                                                    </span>
                                                    <span className="codex-summaryList__victoryConditionSignalValue">
                                                        {renderDescriptionLine(formatCodexMajorFactionText(line.value))}
                                                    </span>
                                                </span>
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="codex-summaryList__statusFallback">
                                            No public victory condition facts exported yet.
                                        </span>
                                    )}
                                </button>
                            );
                        }

                        if (usePopulationArchiveRowHierarchy) {
                            return (
                                <div
                                    key={entry.entryKey}
                                    className="codex-summaryList__item codex-summaryList__item--populationArchive"
                                >
                                    <span className="codex-summaryList__titleLine">
                                        <button
                                            type="button"
                                            className="codex-summaryList__entryButton codex-summaryList__entryButton--populationTitle"
                                            onClick={() => onSelectEntry(entry)}
                                        >
                                            <span className="codex-summaryList__titleIdentity">
                                                <span className="codex-summaryList__name">
                                                    {renderCodexLabel(getCodexEntryLabel(entry))}
                                                </span>
                                            </span>
                                        </button>

                                        {populationFactionIdentity ? (
                                            <span
                                                className="codex-summaryList__metadata codex-summaryList__metadata--population"
                                                aria-label="Population faction"
                                            >
                                                {populationFactionIdentity.iconPath ? (
                                                    <span
                                                        className="codex-summaryList__metadataIcon"
                                                        aria-label={populationFactionIdentity.label}
                                                        title={populationFactionIdentity.label}
                                                    >
                                                        <IconImg
                                                            path={populationFactionIdentity.iconPath}
                                                            title={populationFactionIdentity.label}
                                                            className="codex-kindIcon codex-kindIcon--summaryFaction"
                                                            size={18}
                                                            decorative
                                                        />
                                                    </span>
                                                ) : null}
                                                <span className="codex-summaryList__metadataText">
                                                    {populationFactionIdentity.label}
                                                </span>
                                            </span>
                                        ) : null}
                                    </span>

                                    <div
                                        className="codex-summaryList__populationEffects"
                                        aria-label="Population planning preview"
                                    >
                                        {populationArchivePreviewLines.length > 0 ? (
                                            populationArchivePreviewLines.map((line) => (
                                                <span
                                                    className={`codex-summaryList__populationEffectLine codex-summaryList__populationEffectLine--${line.key.startsWith("worker") ? "worker" : "threshold"}`}
                                                    key={`${entry.entryKey}-${line.key}`}
                                                >
                                                    <span className="codex-summaryList__populationEffectLabel">
                                                        {line.label}:
                                                    </span>
                                                    {line.linkedEntry ? (
                                                        <CodexInlineEntityLink
                                                            entry={line.linkedEntry}
                                                            onSelect={(linkedEntry) => onSelectEntry(linkedEntry)}
                                                        >
                                                            {renderCodexLabel(line.value)}
                                                        </CodexInlineEntityLink>
                                                    ) : (
                                                        <span className="codex-summaryList__populationEffectValue">
                                                            {renderDescriptionLine(formatCodexMajorFactionText(line.value))}
                                                        </span>
                                                    )}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="codex-summaryList__statusFallback">
                                                No public population effects exported yet.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        if (useEquipmentArchiveRowHierarchy) {
                            return (
                                <EquipmentArchiveRow
                                    entry={entry}
                                    equipmentArchiveMetadata={equipmentArchiveMetadata}
                                    equipmentEffectPreviewLines={equipmentEffectPreviewLines}
                                    equipmentGrantedAbilityOverflowCount={equipmentGrantedAbilityOverflowCount}
                                    onSelectEntry={onSelectEntry}
                                    visibleEquipmentGrantedAbilityPreviews={visibleEquipmentGrantedAbilityPreviews}
                                />
                            );
                        }

                        if (useHeroArchiveRowHierarchy) {
                            return (
                                <HeroArchiveRow
                                    entry={entry}
                                    heroClassMetadata={heroClassMetadata}
                                    heroFactionIdentity={heroFactionIdentity}
                                    heroGrantedAbilityOverflowCount={heroGrantedAbilityOverflowCount}
                                    heroStatPreviewLines={heroStatPreviewLines}
                                    onSelectEntry={onSelectEntry}
                                    visibleHeroGrantedAbilityLinks={visibleHeroGrantedAbilityLinks}
                                />
                            );
                        }

                        if (useUnitArchiveRowHierarchy) {
                            return (
                                <UnitArchiveRow
                                    entry={entry}
                                    onSelectEntry={onSelectEntry}
                                    unitArchiveMetadata={unitArchiveMetadata}
                                    unitFactionIdentity={unitFactionIdentity}
                                    unitGrantedAbilityOverflowCount={unitGrantedAbilityOverflowCount}
                                    unitStatPreviewLines={unitStatPreviewLines}
                                    visibleUnitGrantedAbilityPreviews={visibleUnitGrantedAbilityPreviews}
                                />
                            );
                        }

                        if (useImprovementArchiveRowHierarchy) {
                            return (
                                <button
                                    key={entry.entryKey}
                                    type="button"
                                    className="codex-summaryList__item codex-summaryList__item--improvementArchive"
                                    onClick={() => onSelectEntry(entry)}
                                >
                                    <span className="codex-summaryList__titleLine">
                                        <span className="codex-summaryList__titleIdentity">
                                            <span className="codex-summaryList__name">
                                                {renderCodexLabel(getCodexEntryLabel(entry))}
                                            </span>
                                        </span>
                                        {improvementArchiveMetadata.length > 0 ? (
                                            <span
                                                className="codex-summaryList__metadata codex-summaryList__metadata--improvement"
                                                aria-label="Improvement metadata"
                                            >
                                                {improvementArchiveMetadata.map((item) => (
                                                    <span
                                                        key={`${item.key}-${item.value}`}
                                                        className="codex-summaryList__metadataText"
                                                    >
                                                        {item.value}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </span>

                                    <span
                                        className="codex-summaryList__improvementEffects"
                                        aria-label="Improvement effect preview"
                                    >
                                        {improvementEffectPreviewLines.length > 0 ? (
                                            improvementEffectPreviewLines.map((line, index) => (
                                                <span
                                                    className="codex-summaryList__improvementEffectLine"
                                                    key={`${entry.entryKey}-improvement-preview-${index}`}
                                                >
                                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="codex-summaryList__statusFallback">
                                                No public improvement effects exported yet.
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        }

                        if (useDistrictArchiveRowHierarchy) {
                            const districtArchiveDisplayName = getDistrictArchiveDisplayName(
                                entry,
                                allEntries,
                                richDistrictByKey
                            );

                            return (
                                <div
                                    key={entry.entryKey}
                                    className="codex-summaryList__item codex-summaryList__item--districtArchive"
                                >
                                    <button
                                        type="button"
                                        className="codex-summaryList__entryButton codex-summaryList__entryButton--district"
                                        onClick={() => onSelectEntry(entry)}
                                    >
                                        <span className="codex-summaryList__titleLine">
                                            <span className="codex-summaryList__titleIdentity">
                                                <span className="codex-summaryList__name">
                                                    {renderCodexLabel(districtArchiveDisplayName)}
                                                </span>
                                            </span>
                                            {districtArchiveMetadata.length > 0 ? (
                                                <span
                                                    className="codex-summaryList__metadata codex-summaryList__metadata--district"
                                                    aria-label="District metadata"
                                                >
                                                    {districtArchiveMetadata.map((item) => (
                                                        <span
                                                            key={`${item.key}-${item.value}`}
                                                            className="codex-summaryList__metadataText"
                                                        >
                                                            {item.value}
                                                        </span>
                                                    ))}
                                                </span>
                                            ) : null}
                                        </span>

                                        <span
                                            className="codex-summaryList__districtEffects"
                                            aria-label="District effect preview"
                                        >
                                            {districtEffectPreviewLines.length > 0 ? (
                                                districtEffectPreviewLines.map((line, index) => (
                                                    <span
                                                        className="codex-summaryList__districtEffectLine"
                                                        key={`${entry.entryKey}-district-preview-${index}`}
                                                    >
                                                        {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                    </span>
                                                ))
                                            ) : null}
                                        </span>

                                        {districtArchivePlanningLines.length > 0 ? (
                                            <span
                                                className="codex-summaryList__districtPlanning"
                                                aria-label="District planning preview"
                                            >
                                                {districtArchivePlanningLines.map((line) => (
                                                    <span
                                                        className="codex-summaryList__districtPlanningLine"
                                                        key={`${entry.entryKey}-planning-${line}`}
                                                    >
                                                        {line}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </button>

                                    {districtExtractedResourceLinks.length > 0 ? (
                                        <div
                                            className="codex-summaryList__grantedAbilityLinks"
                                            aria-label="Extracted resource"
                                        >
                                            <span className="codex-summaryList__grantedAbilityLinksLabel">
                                                Extracts:
                                            </span>
                                            <span className="codex-summaryList__grantedAbilityLinkList">
                                                {districtExtractedResourceLinks.map((link, index) => (
                                                    <span
                                                        className="codex-summaryList__grantedAbilityLinkItem"
                                                        key={`${entry.entryKey}-${link.entry.entryKey}`}
                                                    >
                                                        {index > 0 ? (
                                                            <span
                                                                className="codex-summaryList__grantedAbilitySeparator"
                                                                aria-hidden="true"
                                                            >
                                                                ·
                                                            </span>
                                                        ) : null}
                                                        <CodexInlineEntityLink
                                                            entry={link.entry}
                                                            onSelect={(resourceEntry) => onSelectEntry(resourceEntry)}
                                                        >
                                                            {renderCodexLabel(link.label)}
                                                        </CodexInlineEntityLink>
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        }

                        if (useDiplomacyArchiveRowHierarchy) {
                            return (
                                <DiplomacyArchiveRow
                                    diplomacyArchiveMetadata={diplomacyArchiveMetadata}
                                    diplomacyArchiveSignalLines={diplomacyArchiveSignalLines}
                                    entry={entry}
                                    onSelectEntry={onSelectEntry}
                                    preview={preview}
                                />
                            );
                        }

                        if (useQuestArchiveRowHierarchy) {
                            return (
                                <QuestArchiveRow
                                    entry={entry}
                                    onSelectEntry={onSelectEntry}
                                    preview={preview}
                                    questArchiveLinkOverflowCount={questArchiveLinkOverflowCount}
                                    questArchivePreviewLines={questArchivePreviewLines}
                                    visibleQuestArchiveLinks={visibleQuestArchiveLinks}
                                />
                            );
                        }

                        if (useTechArchiveRowHierarchy) {
                            return (
                                <TechArchiveRow
                                    entry={entry}
                                    onSelectEntry={onSelectEntry}
                                    techArchiveMetadata={techArchiveMetadata}
                                    techEffectPreviewLines={techEffectPreviewLines}
                                    techUnlockOverflowCount={techUnlockOverflowCount}
                                    visibleTechUnlockLinks={visibleTechUnlockLinks}
                                />
                            );
                        }

                        return (
                            <button
                                key={entry.entryKey}
                                type="button"
                                className="codex-summaryList__item"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <span className="codex-summaryList__titleLine">
                                    <span className="codex-summaryList__titleIdentity">
                                        {showRichOverviewRow ? (
                                            <CodexEntryIcon
                                                entry={entry}
                                                label={getCodexEntryLabel(entry)}
                                                className="codex-kindIcon codex-kindIcon--summaryEntry"
                                                size={20}
                                            />
                                        ) : null}
                                        <span className="codex-summaryList__name">
                                            {renderCodexLabel(getCodexEntryLabel(entry))}
                                        </span>
                                    </span>
                                </span>
                                {secondaryContext ? (
                                    <span className="codex-summaryList__context">{secondaryContext}</span>
                                ) : null}
                                {overviewMetadata.length > 0 ? (
                                    <span className="codex-summaryList__metadata" aria-label="Exported metadata">
                                        {overviewMetadata.map((item) => (
                                            <span
                                                key={`${item.label}-${item.value}`}
                                                className="codex-summaryList__metadataChip"
                                            >
                                                <span className="codex-summaryList__metadataLabel">
                                                    {item.label}
                                                </span>
                                                <span className="codex-summaryList__metadataValue">
                                                    {item.value}
                                                </span>
                                            </span>
                                        ))}
                                    </span>
                                ) : null}
                                <span className="codex-summaryList__description">
                                    {preview || "No public description has been added for this entry yet."}
                                </span>
                            </button>
                        );
                    })
                ) : summaryEntry.summaryKind.trim().toLowerCase() === "abilities" ? (
                    <div className="codex-summaryList__empty">
                        <strong>No abilities matched.</strong>
                        <span>
                            {hasActiveFilters || searchQuery.trim()
                                ? "Clear filters or change the search query to browse the archive."
                                : "No ability entries are available in this archive."}
                        </span>
                    </div>
                ) : (
                    <p className="codex-detail__placeholder">
                        No {summaryEntry.summaryLabel.toLowerCase()} entries match the current search.
                    </p>
                )}
            </div>
    );
}
