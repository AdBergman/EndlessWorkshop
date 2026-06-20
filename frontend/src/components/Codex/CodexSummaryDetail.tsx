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
    buildGrantedAbilityPreview,
    isGrantedAbilityPreviewSection,
    type CodexGrantedAbilityPreview as GrantedAbilityPreview,
} from "@/lib/codex/codexGrantedAbilityPreviews";
import { buildTreatyStatusSummary } from "@/lib/codex/codexTreatyStatusSummaries";
import { getDiplomacyCategoryDisplayLabel } from "@/lib/codex/codexDiplomacyArchiveFilters";
import { getDistrictCategoryDisplayLabel } from "@/lib/codex/codexDistrictArchiveFilters";
import { getImprovementCategoryDisplayLabel } from "@/lib/codex/codexImprovementArchiveFilters";
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
import CodexInlineEntityLink from "./CodexInlineEntityLink";

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
type EquipmentArchiveMetadataItem = {
    key: string;
    value: string;
};
type DiplomacyArchiveMetadataItem = {
    key: string;
    value: string;
};
type DistrictArchiveMetadataItem = {
    key: string;
    value: string;
};
type DistrictExtractedResourceLink = {
    entry: CodexEntry;
    label: string;
};
type ImprovementArchiveMetadataItem = {
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
const MAX_EQUIPMENT_EFFECT_PREVIEW_LINES = 5;
const MAX_IMPROVEMENT_EFFECT_PREVIEW_LINES = 5;
const MAX_DISTRICT_EFFECT_PREVIEW_LINES = 5;
const MAX_DIPLOMACY_SIGNAL_LINES = 2;
const MAX_EQUIPMENT_GRANTED_ABILITY_LINKS = 3;
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

function formatEquipmentTierValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";
    return trimmedValue === "0" ? "Base" : `Tier ${trimmedValue}`;
}

function formatEquipmentValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    const numericValue = Number(trimmedValue);
    const displayValue = Number.isFinite(numericValue)
        ? String(Number.parseFloat(numericValue.toFixed(2)))
        : trimmedValue;

    return `Value ${displayValue}`;
}

function getEquipmentArchiveMetadata(entry: CodexEntry): EquipmentArchiveMetadataItem[] {
    const items: EquipmentArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Type").forEach((value) => addValue("type", value));
    getCodexFactValues(entry, "Rarity").forEach((value) => addValue("rarity", value));
    getCodexFactValues(entry, "Tier").forEach((value) => addValue("tier", formatEquipmentTierValue(value)));
    getCodexFactValues(entry, "Value").forEach((value) => addValue("value", formatEquipmentValue(value)));

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

function getStructuredSectionPreviewLines(section: ReturnType<typeof parseCodexStructuredDescription>["sections"][number]): string[] {
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
    const mechanicsLines = mechanicsSection ? getStructuredSectionPreviewLines(mechanicsSection) : [];
    if (mechanicsLines.length > 0) {
        return mechanicsLines.slice(0, MAX_STATUS_EFFECT_PREVIEW_LINES);
    }

    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectsLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];
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

        const previewLines = getStructuredSectionPreviewLines(section);
        if (previewLines.length > 0) {
            return previewLines.slice(0, MAX_STATUS_EFFECT_PREVIEW_LINES);
        }
    }

    return [];
}

function getEquipmentArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "equipment") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_EQUIPMENT_EFFECT_PREVIEW_LINES);
}

function getImprovementArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "improvements") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_IMPROVEMENT_EFFECT_PREVIEW_LINES);
}

function getDistrictArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "districts") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_DISTRICT_EFFECT_PREVIEW_LINES);
}

function formatDistrictTierValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";
    return trimmedValue === "0" ? "Tier 0" : `Tier ${trimmedValue}`;
}

function getDistrictArchiveMetadata(entry: CodexEntry): DistrictArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "districts") return [];

    const items: DistrictArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Category").forEach((value) =>
        addValue("category", getDistrictCategoryDisplayLabel(value))
    );
    getCodexFactValues(entry, "Tier").forEach((value) =>
        addValue("tier", formatDistrictTierValue(value))
    );

    return items;
}

function getDistrictExtractedResourceLinks(
    entry: CodexEntry,
    referenceIndexes: { entriesByKey: Record<string, CodexEntry> }
): DistrictExtractedResourceLink[] {
    if (entry.exportKind.trim().toLowerCase() !== "districts") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const extractedResourceSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "extracted resource"
    );
    const links: DistrictExtractedResourceLink[] = [];
    const seenKeys = new Set<string>();

    for (const item of extractedResourceSection?.items ?? []) {
        const referenceKey = item.referenceKey?.trim();
        if (!referenceKey || seenKeys.has(referenceKey)) continue;

        const linkedEntry = referenceIndexes.entriesByKey[referenceKey];
        if (!linkedEntry) continue;

        seenKeys.add(referenceKey);
        links.push({
            entry: linkedEntry,
            label: item.label.trim() || getCodexEntryLabel(linkedEntry),
        });
    }

    return links;
}

function getImprovementArchiveMetadata(entry: CodexEntry): ImprovementArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "improvements") return [];

    const items: ImprovementArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Category").forEach((value) =>
        addValue("category", getImprovementCategoryDisplayLabel(value))
    );

    return items;
}

function compactDiplomacyPreviewLine(value: string): string {
    return formatCodexMajorFactionText(value.replace(/\s+/g, " ").trim());
}

function truncateDiplomacyPreviewLine(value: string, maxLength = 240): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trimEnd()}…`;
}

function getDiplomacyDescriptionPreview(entry: CodexEntry): string {
    const rawPreview = (entry.descriptionLines ?? [])
        .map(compactDiplomacyPreviewLine)
        .find((line) => line.length > 0);

    return rawPreview ? truncateDiplomacyPreviewLine(rawPreview) : "";
}

function getDiplomacyArchivePreview(entry: CodexEntry, fallbackPreview: string): string {
    if (entry.exportKind.trim().toLowerCase() !== "diplomatictreaties") {
        return fallbackPreview;
    }

    const descriptionPreview = getDiplomacyDescriptionPreview(entry);
    if (descriptionPreview) return descriptionPreview;

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectPreview = effectsSection ? getStructuredSectionPreviewLines(effectsSection)[0] : "";
    if (effectPreview) return effectPreview;

    const appliedStatusesSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "applied statuses"
    );
    const appliedStatusLabel = appliedStatusesSection?.items?.find((item) =>
        item.label.trim().length > 0
    )?.label.trim();

    return appliedStatusLabel || fallbackPreview;
}

function isDiplomacyMechanicalSignal(line: string): boolean {
    const trimmedLine = line.trim();

    return /\[[^\]]+\]/.test(trimmedLine) || /^[+-]\s*\d/.test(trimmedLine);
}

function getDiplomacyArchiveSignalLines(
    entry: CodexEntry,
    allEntries: readonly CodexEntry[],
    preview: string
): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "diplomatictreaties") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const signalLines: string[] = [];
    const seenSignals = new Set<string>();
    const normalizedPreview = normalizeAbilityTaxonomyText(preview);

    const addSignal = (line: string) => {
        const compactLine = compactDiplomacyPreviewLine(line);
        if (!compactLine || !isDiplomacyMechanicalSignal(compactLine)) return;

        const normalizedLine = normalizeAbilityTaxonomyText(compactLine);
        if (normalizedLine === normalizedPreview || seenSignals.has(normalizedLine)) return;

        seenSignals.add(normalizedLine);
        signalLines.push(compactLine);
    };

    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    if (effectsSection) {
        getStructuredSectionPreviewLines(effectsSection).forEach(addSignal);
    }

    const appliedStatusesSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "applied statuses"
    );
    for (const item of appliedStatusesSection?.items ?? []) {
        const summary = buildTreatyStatusSummary(item, allEntries);
        if (summary?.previewLine) {
            addSignal(summary.previewLine);
        }
    }

    return signalLines.slice(0, MAX_DIPLOMACY_SIGNAL_LINES);
}

function formatDiplomacyBilateralValue(value: string): string {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "yes") return "Bilateral";
    if (normalizedValue === "no") return "One-sided";

    return value.trim();
}

function getDiplomacyArchiveMetadata(entry: CodexEntry): DiplomacyArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "diplomatictreaties") return [];

    const items: DiplomacyArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Category").forEach((value) =>
        addValue("category", getDiplomacyCategoryDisplayLabel(value))
    );
    getCodexFactValues(entry, "Bilateral").forEach((value) =>
        addValue("bilateral", formatDiplomacyBilateralValue(value))
    );
    getCodexFactValues(entry, "Duration").forEach((value) =>
        addValue("duration", value)
    );

    return items;
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
                        const basePreview = isFactionEntry
                            ? factionTraits || getCodexFactionSummaryPreview(entry) || getCodexEntryPreview(entry, 240)
                            : readablePreview || getCodexEntryPreview(entry, 240);
                        const preview = getDiplomacyArchivePreview(entry, basePreview);
                        const secondaryContext = factionAffinity
                            ? `Affinity: ${factionAffinity}`
                            : getCodexSecondaryContext(entry);
                        const showRichOverviewRow = supportsRichOverviewRow(entry);
                        const useCatalogRowHierarchy = entry.exportKind.trim().toLowerCase() === "abilities";
                        const useStatusArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "statuses";
                        const useEquipmentArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "equipment";
                        const useImprovementArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "improvements";
                        const useDistrictArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "districts";
                        const useDiplomacyArchiveRowHierarchy = entry.exportKind.trim().toLowerCase() === "diplomatictreaties";
                        const overviewMetadata = showRichOverviewRow ? getOverviewMetadata(entry) : [];
                        const abilityCatalogMetadata = useCatalogRowHierarchy ? getAbilityCatalogMetadata(entry) : [];
                        const statusArchiveMetadata = useStatusArchiveRowHierarchy ? getStatusArchiveMetadata(entry) : [];
                        const equipmentArchiveMetadata = useEquipmentArchiveRowHierarchy ? getEquipmentArchiveMetadata(entry) : [];
                        const improvementArchiveMetadata = useImprovementArchiveRowHierarchy ? getImprovementArchiveMetadata(entry) : [];
                        const districtArchiveMetadata = useDistrictArchiveRowHierarchy ? getDistrictArchiveMetadata(entry) : [];
                        const diplomacyArchiveMetadata = useDiplomacyArchiveRowHierarchy ? getDiplomacyArchiveMetadata(entry) : [];
                        const diplomacyArchiveSignalLines = useDiplomacyArchiveRowHierarchy
                            ? getDiplomacyArchiveSignalLines(entry, allEntries, preview)
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
                        const improvementEffectPreviewLines = useImprovementArchiveRowHierarchy
                            ? getImprovementArchiveEffectPreviewLines(entry)
                            : [];
                        const districtEffectPreviewLines = useDistrictArchiveRowHierarchy
                            ? getDistrictArchiveEffectPreviewLines(entry)
                            : [];
                        const districtExtractedResourceLinks = useDistrictArchiveRowHierarchy
                            ? getDistrictExtractedResourceLinks(entry, referenceIndexes)
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

                        if (useEquipmentArchiveRowHierarchy) {
                            return (
                                <div
                                    key={entry.entryKey}
                                    className="codex-summaryList__item codex-summaryList__item--equipmentArchive"
                                >
                                    <button
                                        type="button"
                                        className="codex-summaryList__entryButton codex-summaryList__entryButton--equipment"
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
                                            {equipmentArchiveMetadata.length > 0 ? (
                                                <span
                                                    className="codex-summaryList__metadata codex-summaryList__metadata--equipment"
                                                    aria-label="Equipment metadata"
                                                >
                                                    {equipmentArchiveMetadata.map((item) => (
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
                                            className="codex-summaryList__equipmentEffects"
                                            aria-label="Equipment effect preview"
                                        >
                                            {equipmentEffectPreviewLines.length > 0 ? (
                                                equipmentEffectPreviewLines.map((line, index) => (
                                                    <span
                                                        className="codex-summaryList__equipmentEffectLine"
                                                        key={`${entry.entryKey}-equipment-preview-${index}`}
                                                    >
                                                        {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                    </span>
                                                ))
                                            ) : visibleEquipmentGrantedAbilityPreviews.length === 0 ? (
                                                <span className="codex-summaryList__statusFallback">
                                                    No public equipment effects exported yet.
                                                </span>
                                            ) : null}
                                        </span>
                                    </button>

                                    {visibleEquipmentGrantedAbilityPreviews.length > 0 ? (
                                        <div
                                            className="codex-summaryList__grantedAbilityLinks"
                                            aria-label="Granted abilities"
                                        >
                                            <span className="codex-summaryList__grantedAbilityLinksLabel">
                                                Grants:
                                            </span>
                                            <span className="codex-summaryList__grantedAbilityLinkList">
                                                {visibleEquipmentGrantedAbilityPreviews.map((grantedPreview, index) => (
                                                    <span
                                                        className="codex-summaryList__grantedAbilityLinkItem"
                                                        key={`${entry.entryKey}-${grantedPreview.ability.entryKey}`}
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
                                                            entry={grantedPreview.ability}
                                                            onSelect={(ability) => onSelectEntry(ability)}
                                                        >
                                                            {renderCodexLabel(grantedPreview.label)}
                                                        </CodexInlineEntityLink>
                                                    </span>
                                                ))}
                                                {equipmentGrantedAbilityOverflowCount > 0 ? (
                                                    <span className="codex-summaryList__grantedAbilityOverflow">
                                                        +{equipmentGrantedAbilityOverflowCount} more
                                                    </span>
                                                ) : null}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
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
                                                    {renderCodexLabel(getCodexEntryLabel(entry))}
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
                                            ) : (
                                                <span className="codex-summaryList__statusFallback">
                                                    No public district effects exported yet.
                                                </span>
                                            )}
                                        </span>
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
                                <button
                                    key={entry.entryKey}
                                    type="button"
                                    className="codex-summaryList__item codex-summaryList__item--diplomacyArchive"
                                    onClick={() => onSelectEntry(entry)}
                                >
                                    <span className="codex-summaryList__titleLine">
                                        <span className="codex-summaryList__titleIdentity">
                                            <span className="codex-summaryList__name">
                                                {renderCodexLabel(getCodexEntryLabel(entry))}
                                            </span>
                                        </span>
                                        {diplomacyArchiveMetadata.length > 0 ? (
                                            <span
                                                className="codex-summaryList__metadata codex-summaryList__metadata--diplomacy"
                                                aria-label="Treaty metadata"
                                            >
                                                {diplomacyArchiveMetadata.map((item) => (
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
                                    <span className="codex-summaryList__description">
                                        {preview
                                            ? renderDescriptionLine(formatCodexMajorFactionText(preview))
                                            : "No public description has been added for this entry yet."}
                                    </span>
                                    {diplomacyArchiveSignalLines.length > 0 ? (
                                        <span
                                            className="codex-summaryList__diplomacySignals"
                                            aria-label="Treaty effect signals"
                                        >
                                            {diplomacyArchiveSignalLines.map((line, index) => (
                                                <span
                                                    className="codex-summaryList__diplomacySignal"
                                                    key={`${entry.entryKey}-diplomacy-signal-${index}`}
                                                >
                                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                                </span>
                                            ))}
                                        </span>
                                    ) : null}
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
