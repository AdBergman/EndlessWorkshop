import { useMemo, type RefObject } from "react";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { buildAbilityInlineLinkCandidates } from "@/lib/codex/codexAbilityInlineLinks";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import { getStatusScopeDisplayLabel } from "@/lib/codex/codexStatusArchiveFilters";
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
import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import {
    getCodexReadablePreviewLine,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveRelatedEntries,
} from "@/lib/codex/codexRefs";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import CodexAbilityEffectLine from "./CodexAbilityEffectLine";

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

type OverviewMetadataConfig = {
    label: string;
    displayLabel: string;
    shouldDisplayValue?: (value: string) => boolean;
};
type OverviewMetadataItem = {
    label: string;
    value: string;
};
type AbilityCatalogMetadataItem = {
    key: string;
    value: string;
};
type StatusArchiveMetadataItem = {
    key: string;
    value: string;
};

const OVERVIEW_METADATA_BY_KIND: Record<string, OverviewMetadataConfig[]> = {
    abilities: [
        { label: "Ability mechanic", displayLabel: "Mechanic" },
        { label: "Target", displayLabel: "Target" },
        { label: "Range", displayLabel: "Range" },
        { label: "Cost", displayLabel: "Cost", shouldDisplayValue: isExceptionalAbilityCost },
    ],
    statuses: [
        { label: "Scope", displayLabel: "Scope" },
        { label: "Duration", displayLabel: "Duration" },
    ],
};
const MAX_OVERVIEW_METADATA_ITEMS = 5;
const MAX_ABILITY_EFFECT_PREVIEW_LINES = 7;
const MAX_STATUS_EFFECT_PREVIEW_LINES = 3;
const ABILITY_TAXONOMY_TERMS = new Set([
    "ability",
    "abilities",
    "active",
    "combat",
    "mixed",
    "passive",
    "reaction",
    "tactical",
]);
const STATUS_ARCHIVE_PRIMARY_SECTIONS = ["status mechanics", "effects"];
const STATUS_ARCHIVE_EXCLUDED_SECTIONS = new Set([
    "linked cost modifier",
]);

function normalizeAbilityTaxonomyText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function isExceptionalAbilityCost(value: string): boolean {
    const normalizedValue = normalizeAbilityTaxonomyText(value);
    if (!normalizedValue) return false;

    if (normalizedValue === "free") return true;
    if (/^0\s+battle\s+tokens?$/.test(normalizedValue)) return true;
    if (/^[1-3]\s+battle\s+tokens?$/.test(normalizedValue)) return false;

    return true;
}

function formatAbilityTargetValue(value: string): string {
    return value
        .split(",")
        .map((part) =>
            part
                .trim()
                .replace(/\bEmptyTile\b/g, "Empty Tile")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
        )
        .filter(Boolean)
        .join(", ");
}

function formatAbilityRangeValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return /^range\b/i.test(trimmedValue) ? trimmedValue : `Range ${trimmedValue}`;
}

function formatAbilityCostValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    if (normalizeAbilityTaxonomyText(trimmedValue) === "free") return "Free";
    return /^cost\b/i.test(trimmedValue) ? trimmedValue : `Cost ${trimmedValue}`;
}

function formatStatusDurationValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return trimmedValue.replace(/^1\s+turns$/i, "1 turn");
}

function getOverviewMetadata(entry: CodexEntry): OverviewMetadataItem[] {
    const configs = OVERVIEW_METADATA_BY_KIND[entry.exportKind.trim().toLowerCase()] ?? [];
    const seenValues = new Set<string>();
    const items: OverviewMetadataItem[] = [];

    for (const config of configs) {
        for (const value of getCodexFactValues(entry, config.label)) {
            if (config.shouldDisplayValue && !config.shouldDisplayValue(value)) continue;

            const normalizedValue = `${config.label}:${value}`.toLowerCase();
            if (seenValues.has(normalizedValue)) continue;

            seenValues.add(normalizedValue);
            items.push({ label: config.displayLabel, value });
            if (items.length >= MAX_OVERVIEW_METADATA_ITEMS) {
                return items;
            }
        }
    }

    return items;
}

function getAbilityCatalogMetadata(entry: CodexEntry): AbilityCatalogMetadataItem[] {
    const items: AbilityCatalogMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Ability mechanic").forEach((value) => addValue("mechanic", value));
    getCodexFactValues(entry, "Target").forEach((value) => {
        const formattedValue = formatAbilityTargetValue(value);
        addValue("target", formattedValue ? `Target: ${formattedValue}` : "");
    });
    getCodexFactValues(entry, "Range").forEach((value) => addValue("range", formatAbilityRangeValue(value)));
    getCodexFactValues(entry, "Cost").forEach((value) => {
        if (!isExceptionalAbilityCost(value)) return;
        addValue("cost", formatAbilityCostValue(value));
    });

    return items;
}

function getStatusArchiveMetadata(entry: CodexEntry): StatusArchiveMetadataItem[] {
    const items: StatusArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Scope").forEach((value) =>
        addValue("scope", getStatusScopeDisplayLabel(value))
    );
    getCodexFactValues(entry, "Duration").forEach((value) =>
        addValue("duration", formatStatusDurationValue(value))
    );

    return items;
}

function isAbilitySetupPreviewLine(value: string): boolean {
    const normalizedValue = normalizeAbilityTaxonomyText(value);
    if (!normalizedValue) return false;

    return /\brange\s+\d+\b/.test(normalizedValue) || /\bcost\s+/.test(normalizedValue);
}

function supportsRichOverviewRow(entry: CodexEntry): boolean {
    return Object.prototype.hasOwnProperty.call(
        OVERVIEW_METADATA_BY_KIND,
        entry.exportKind.trim().toLowerCase()
    );
}

function isAbilityTaxonomyOnlyLine(value: string, metadata: readonly OverviewMetadataItem[]): boolean {
    const normalizedValue = normalizeAbilityTaxonomyText(value);
    if (!normalizedValue) return false;

    const metadataValues = new Set(metadata.map((item) => normalizeAbilityTaxonomyText(item.value)));
    const parts = normalizedValue
        .split("/")
        .map((part) => normalizeAbilityTaxonomyText(part))
        .filter(Boolean);

    if (parts.length === 0) return false;

    return parts.every((part) => metadataValues.has(part) || ABILITY_TAXONOMY_TERMS.has(part));
}

function getAbilityCatalogPreview(preview: string, metadata: readonly OverviewMetadataItem[]): string | null {
    if (!preview) return "";
    if (isAbilitySetupPreviewLine(preview)) return null;
    return isAbilityTaxonomyOnlyLine(preview, metadata) ? null : preview;
}

function getAbilityCatalogEffectPreviewLines(entry: CodexEntry, searchQuery = ""): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "abilities") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectLines: string[] = [];
    const seen = new Set<string>();

    const addLine = (line: string) => {
        for (const rawValue of line.split(/\r?\n/)) {
            const value = rawValue.trim();
            if (!value) continue;

            const normalized = normalizeAbilityTaxonomyText(value);
            if (seen.has(normalized)) continue;

            seen.add(normalized);
            effectLines.push(value);
        }
    };

    for (const section of parsed.sections) {
        if (section.label.trim().toLowerCase() !== "effects") continue;

        section.lines.forEach(addLine);
        for (const item of section.items ?? []) {
            item.lines.forEach(addLine);
            item.facts.forEach((fact) => addLine(fact.value));
        }
    }

    const normalizedSearchQuery = normalizeAbilityTaxonomyText(searchQuery);
    if (!normalizedSearchQuery) {
        return effectLines.slice(0, MAX_ABILITY_EFFECT_PREVIEW_LINES);
    }

    const selectedIndexes = new Set<number>();
    effectLines.forEach((line, index) => {
        if (
            selectedIndexes.size < MAX_ABILITY_EFFECT_PREVIEW_LINES &&
            normalizeAbilityTaxonomyText(line).includes(normalizedSearchQuery)
        ) {
            selectedIndexes.add(index);
        }
    });

    for (let index = 0; index < effectLines.length && selectedIndexes.size < MAX_ABILITY_EFFECT_PREVIEW_LINES; index += 1) {
        selectedIndexes.add(index);
    }

    return Array.from(selectedIndexes)
        .sort((left, right) => left - right)
        .map((index) => effectLines[index]);
}

function getStatusSectionPreviewLines(section: ReturnType<typeof parseCodexStructuredDescription>["sections"][number]): string[] {
    const previewLines: string[] = [];
    const seen = new Set<string>();

    const addLine = (line: string) => {
        for (const rawValue of line.split(/\r?\n/)) {
            const value = rawValue.trim();
            if (!value) continue;

            const normalized = normalizeAbilityTaxonomyText(value);
            if (seen.has(normalized)) continue;

            seen.add(normalized);
            previewLines.push(value);
        }
    };

    section.lines.forEach(addLine);

    if (section.lines.length === 0) {
        for (const item of section.items ?? []) {
            item.lines.forEach(addLine);

            if (item.lines.length === 0) {
                item.facts.forEach((fact) => addLine(fact.value));
            }
        }
    }

    return previewLines;
}

function getStatusArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "statuses") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const mechanicsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "status mechanics"
    );
    const mechanicsLines = mechanicsSection ? getStatusSectionPreviewLines(mechanicsSection) : [];
    if (mechanicsLines.length > 0) {
        return mechanicsLines.slice(0, MAX_STATUS_EFFECT_PREVIEW_LINES);
    }

    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectsLines = effectsSection ? getStatusSectionPreviewLines(effectsSection) : [];
    if (effectsLines.length > 0) {
        return effectsLines.slice(0, MAX_STATUS_EFFECT_PREVIEW_LINES);
    }

    for (const section of parsed.sections) {
        const normalizedLabel = section.label.trim().toLowerCase();
        if (
            STATUS_ARCHIVE_PRIMARY_SECTIONS.includes(normalizedLabel) ||
            STATUS_ARCHIVE_EXCLUDED_SECTIONS.has(normalizedLabel)
        ) {
            continue;
        }

        const previewLines = getStatusSectionPreviewLines(section);
        if (previewLines.length > 0) {
            return previewLines.slice(0, MAX_STATUS_EFFECT_PREVIEW_LINES);
        }
    }

    return [];
}

function isSameAbilityPreviewLine(left: string | null, right: string): boolean {
    return normalizeAbilityTaxonomyText(left ?? "") === normalizeAbilityTaxonomyText(right);
}

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
                        const showRichOverviewRow = supportsRichOverviewRow(entry);
                        const useCatalogRowHierarchy = entry.exportKind.trim().toLowerCase() === "abilities";
                        const useStatusArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "statuses";
                        const overviewMetadata = showRichOverviewRow ? getOverviewMetadata(entry) : [];
                        const abilityCatalogMetadata = useCatalogRowHierarchy ? getAbilityCatalogMetadata(entry) : [];
                        const statusArchiveMetadata = useStatusArchiveRowHierarchy ? getStatusArchiveMetadata(entry) : [];
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
                        const visibleCatalogPreview = (
                            useCatalogRowHierarchy &&
                            catalogPreview !== null &&
                            abilityEffectPreviewLines.some((line) => isSameAbilityPreviewLine(catalogPreview, line))
                        )
                            ? null
                            : catalogPreview;
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
        </article>
    );
}
