import { getFactionIconPath } from "@/features/icons/factionIconResolver";
import { getStatusScopeDisplayLabel } from "@/lib/codex/codexStatusArchiveFilters";
import {
    formatCodexMajorFactionText,
    getCodexEntryPreview,
    getCodexEntryLabel,
} from "@/lib/codex/codexPresentation";
import { getCodexHeroStatGroups } from "@/lib/codex/codexHeroStats";
import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import {
    buildTechUnlockSummary,
    type CodexTechUnlockSummary as TechUnlockSummary,
} from "@/lib/codex/codexTechUnlockSummaries";
import { buildTreatyStatusSummary } from "@/lib/codex/codexTreatyStatusSummaries";
import { getDiplomacyCategoryDisplayLabel } from "@/lib/codex/codexDiplomacyArchiveFilters";
import { getDistrictCategoryDisplayLabel } from "@/lib/codex/codexDistrictArchiveFilters";
import { getImprovementCategoryDisplayLabel } from "@/lib/codex/codexImprovementArchiveFilters";
import { formatUnitTierLabel } from "@/lib/codex/codexUnitArchiveFilters";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import {
    resolveCodexReference,
    resolveRelatedEntries,
    type CodexReferenceIndexes,
} from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

export type OverviewMetadataConfig = {
    label: string;
    displayLabel: string;
    shouldDisplayValue?: (value: string) => boolean;
};
export type OverviewMetadataItem = {
    label: string;
    value: string;
};
export type AbilityCatalogMetadataItem = {
    key: string;
    value: string;
};
export type StatusArchiveMetadataItem = {
    key: string;
    value: string;
};
export type EquipmentArchiveMetadataItem = {
    key: string;
    value: string;
};
export type HeroArchiveMetadataItem = {
    key: string;
    value: string;
};
export type HeroFactionIdentity = {
    label: string;
    iconPath: string | null;
};
export type UnitArchiveMetadataItem = {
    key: string;
    value: string;
};
export type UnitFactionIdentity = {
    label: string;
    iconPath: string | null;
};
export type DiplomacyArchiveMetadataItem = {
    key: string;
    value: string;
};
export type QuestArchiveLink = {
    entry: CodexEntry;
    label: string;
};
export type TechArchiveMetadataItem = {
    key: string;
    value: string;
};
export type VictoryConditionArchiveMetadataItem = {
    key: string;
    value: string;
};
export type VictoryConditionArchivePreviewLine = {
    key: string;
    label: string;
    value: string;
};
export type DistrictArchiveMetadataItem = {
    key: string;
    value: string;
};
export type DistrictExtractedResourceLink = {
    entry: CodexEntry;
    label: string;
};
export type ImprovementArchiveMetadataItem = {
    key: string;
    value: string;
};
export type PopulationFactionIdentity = {
    label: string;
    iconPath: string | null;
};
export type PopulationArchivePreviewLine = {
    key: string;
    label: string;
    value: string;
    linkedEntry?: CodexEntry;
};

export const OVERVIEW_METADATA_BY_KIND: Record<string, OverviewMetadataConfig[]> = {
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
export const MAX_OVERVIEW_METADATA_ITEMS = 5;
export const MAX_ABILITY_EFFECT_PREVIEW_LINES = 7;
export const MAX_STATUS_EFFECT_PREVIEW_LINES = 3;
export const MAX_EQUIPMENT_EFFECT_PREVIEW_LINES = 5;
export const MAX_HERO_STAT_PREVIEW_LINES = 6;
export const MAX_HERO_GRANTED_ABILITY_LINKS = 3;
export const MAX_UNIT_STAT_PREVIEW_LINES = 6;
export const MAX_UNIT_GRANTED_ABILITY_LINKS = 3;
export const MAX_IMPROVEMENT_EFFECT_PREVIEW_LINES = 5;
export const MAX_DISTRICT_EFFECT_PREVIEW_LINES = 5;
export const MAX_POPULATION_WORKER_PREVIEW_LINES = 3;
export const MAX_POPULATION_THRESHOLD_PREVIEW_LINES = 3;
export const MAX_DIPLOMACY_SIGNAL_LINES = 2;
export const MAX_QUEST_PREVIEW_LINES = 3;
export const MAX_QUEST_INLINE_LINKS = 5;
export const MAX_EQUIPMENT_GRANTED_ABILITY_LINKS = 3;
export const MAX_TECH_EFFECT_PREVIEW_LINES = 4;
export const MAX_TECH_UNLOCK_LINKS = 4;
export const MAX_VICTORY_CONDITION_PREVIEW_LINES = 3;
export const ABILITY_TAXONOMY_TERMS = new Set([
    "ability",
    "abilities",
    "active",
    "combat",
    "mixed",
    "passive",
    "reaction",
    "tactical",
]);
export const STATUS_ARCHIVE_PRIMARY_SECTIONS = ["status mechanics", "effects"];
export const STATUS_ARCHIVE_EXCLUDED_SECTIONS = new Set([
    "linked cost modifier",
]);
export const QUEST_ARCHIVE_PREVIEW_SECTION_ORDER = [
    "objective",
    "requirements",
    "rewards",
    "effects",
];
export const QUEST_ARCHIVE_LINK_KINDS = new Set([
    "districts",
    "equipment",
    "heroes",
    "improvements",
    "resources",
    "statuses",
    "tech",
    "traits",
    "units",
]);

export function normalizeAbilityTaxonomyText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function isExceptionalAbilityCost(value: string): boolean {
    const normalizedValue = normalizeAbilityTaxonomyText(value);
    if (!normalizedValue) return false;

    if (normalizedValue === "free") return true;
    if (/^0\s+battle\s+tokens?$/.test(normalizedValue)) return true;
    if (/^[1-3]\s+battle\s+tokens?$/.test(normalizedValue)) return false;

    return true;
}

export function formatAbilityTargetValue(value: string): string {
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

export function formatAbilityRangeValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return /^range\b/i.test(trimmedValue) ? trimmedValue : `Range ${trimmedValue}`;
}

export function formatAbilityCostValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    if (normalizeAbilityTaxonomyText(trimmedValue) === "free") return "Free";
    return /^cost\b/i.test(trimmedValue) ? trimmedValue : `Cost ${trimmedValue}`;
}

export function formatStatusDurationValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return trimmedValue.replace(/^1\s+turns$/i, "1 turn");
}

export function getOverviewMetadata(entry: CodexEntry): OverviewMetadataItem[] {
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

export function getAbilityCatalogMetadata(entry: CodexEntry): AbilityCatalogMetadataItem[] {
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

export function getStatusArchiveMetadata(entry: CodexEntry): StatusArchiveMetadataItem[] {
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
    getCodexFactValues(entry, "Polarity").forEach((value) =>
        addValue("polarity", value)
    );

    return items;
}

export function formatTechEraValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return /^era\b/i.test(trimmedValue) ? trimmedValue : `Era ${trimmedValue}`;
}

export function getTechArchiveMetadata(entry: CodexEntry): TechArchiveMetadataItem[] {
    const items: TechArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Era").forEach((value) => addValue("era", formatTechEraValue(value)));
    getCodexFactValues(entry, "Quadrant").forEach((value) => addValue("quadrant", value));
    getCodexFactValues(entry, "Faction").forEach((value) => addValue("faction", value));

    return items;
}

export function formatEquipmentTierValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";
    return trimmedValue === "0" ? "Base" : `Tier ${trimmedValue}`;
}

export function formatEquipmentValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    const numericValue = Number(trimmedValue);
    const displayValue = Number.isFinite(numericValue)
        ? String(Number.parseFloat(numericValue.toFixed(2)))
        : trimmedValue;

    return `Value ${displayValue}`;
}

export function getEquipmentArchiveMetadata(entry: CodexEntry): EquipmentArchiveMetadataItem[] {
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

export function isAbilitySetupPreviewLine(value: string): boolean {
    const normalizedValue = normalizeAbilityTaxonomyText(value);
    if (!normalizedValue) return false;

    return /\brange\s+\d+\b/.test(normalizedValue) || /\bcost\s+/.test(normalizedValue);
}

export function supportsRichOverviewRow(entry: CodexEntry): boolean {
    return Object.prototype.hasOwnProperty.call(
        OVERVIEW_METADATA_BY_KIND,
        entry.exportKind.trim().toLowerCase()
    );
}

export function isAbilityTaxonomyOnlyLine(value: string, metadata: readonly OverviewMetadataItem[]): boolean {
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

export function getAbilityCatalogPreview(preview: string, metadata: readonly OverviewMetadataItem[]): string | null {
    if (!preview) return "";
    if (isAbilitySetupPreviewLine(preview)) return null;
    return isAbilityTaxonomyOnlyLine(preview, metadata) ? null : preview;
}

export function getAbilityCatalogEffectPreviewLines(entry: CodexEntry, searchQuery = ""): string[] {
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

export function isSameAbilityPreviewLine(left: string | null, right: string): boolean {
    return normalizeAbilityTaxonomyText(left ?? "") === normalizeAbilityTaxonomyText(right);
}

