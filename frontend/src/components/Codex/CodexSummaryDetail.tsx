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
import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    summaryEntry: CodexSummaryEntry;
    entries: CodexListItem[];
    allEntries: CodexEntry[];
    titleRef: RefObject<HTMLHeadingElement | null>;
    onSelectEntry: (entry: CodexListItem) => void;
    titleOverride?: string;
    leadOverride?: string;
    contextOverride?: string;
};

type OverviewMetadataConfig = {
    label: string;
    displayLabel: string;
};
type OverviewMetadataItem = {
    label: string;
    value: string;
};

const OVERVIEW_METADATA_BY_KIND: Record<string, OverviewMetadataConfig[]> = {
    abilities: [
        { label: "Ability mechanic", displayLabel: "Mechanic" },
        { label: "Ability source", displayLabel: "Source" },
        { label: "Combat role", displayLabel: "Role" },
    ],
    statuses: [
        { label: "Scope", displayLabel: "Scope" },
        { label: "Duration", displayLabel: "Duration" },
    ],
};
const MAX_OVERVIEW_METADATA_ITEMS = 3;
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

function normalizeAbilityTaxonomyText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function getOverviewMetadata(entry: CodexEntry): OverviewMetadataItem[] {
    const configs = OVERVIEW_METADATA_BY_KIND[entry.exportKind.trim().toLowerCase()] ?? [];
    const seenValues = new Set<string>();
    const items: OverviewMetadataItem[] = [];

    for (const config of configs) {
        for (const value of getCodexFactValues(entry, config.label)) {
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
    return isAbilityTaxonomyOnlyLine(preview, metadata) ? null : preview;
}

function getAbilityCatalogContext(context: string, metadata: readonly OverviewMetadataItem[]): string {
    if (!context) return "";
    return isAbilityTaxonomyOnlyLine(context, metadata) ? "" : context;
}

export default function CodexSummaryDetail({
    summaryEntry,
    entries,
    allEntries,
    titleRef,
    onSelectEntry,
    titleOverride,
    leadOverride,
    contextOverride,
}: Props) {
    const isShallowReferenceSummary = isShallowReferenceKind(summaryEntry.summaryKind);
    const summaryContext = contextOverride ?? (isShallowReferenceSummary ? "Reference list" : "Category overview");
    const summaryLead = isShallowReferenceSummary
        ? "Scan exported effect lines and exact linked entries in a compact reference list."
        : leadOverride ?? summaryEntry.descriptionLines[0];
    const summaryTitle = titleOverride ?? summaryEntry.displayName;

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
                        const showRichOverviewRow = supportsRichOverviewRow(entry);
                        const useCatalogRowHierarchy = entry.exportKind.trim().toLowerCase() === "abilities";
                        const overviewMetadata = showRichOverviewRow ? getOverviewMetadata(entry) : [];
                        const catalogPreview = useCatalogRowHierarchy
                            ? getAbilityCatalogPreview(preview, overviewMetadata)
                            : preview;
                        const catalogSecondaryContext = useCatalogRowHierarchy
                            ? getAbilityCatalogContext(secondaryContext, overviewMetadata)
                            : secondaryContext;
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
                                className={`codex-summaryList__item ${
                                    useCatalogRowHierarchy ? "codex-summaryList__item--catalog" : ""
                                }`}
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
                                    {useCatalogRowHierarchy && overviewMetadata.length > 0 ? (
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
                                </span>
                                {useCatalogRowHierarchy ? (
                                    <>
                                        {catalogPreview !== null ? (
                                            <span className="codex-summaryList__description">
                                                {catalogPreview || "No public description has been added for this entry yet."}
                                            </span>
                                        ) : null}
                                        {catalogSecondaryContext ? (
                                            <span className="codex-summaryList__context">{catalogSecondaryContext}</span>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
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
