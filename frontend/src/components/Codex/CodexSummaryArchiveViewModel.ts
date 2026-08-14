import { getFactionIconPath } from "@/features/icons/factionIconResolver";
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
import {
    MAX_DIPLOMACY_SIGNAL_LINES,
    MAX_DISTRICT_EFFECT_PREVIEW_LINES,
    MAX_EQUIPMENT_EFFECT_PREVIEW_LINES,
    MAX_HERO_STAT_PREVIEW_LINES,
    MAX_IMPROVEMENT_EFFECT_PREVIEW_LINES,
    MAX_POPULATION_THRESHOLD_PREVIEW_LINES,
    MAX_POPULATION_WORKER_PREVIEW_LINES,
    MAX_QUEST_PREVIEW_LINES,
    MAX_STATUS_EFFECT_PREVIEW_LINES,
    MAX_TECH_EFFECT_PREVIEW_LINES,
    MAX_UNIT_STAT_PREVIEW_LINES,
    MAX_VICTORY_CONDITION_PREVIEW_LINES,
    QUEST_ARCHIVE_LINK_KINDS,
    QUEST_ARCHIVE_PREVIEW_SECTION_ORDER,
    STATUS_ARCHIVE_EXCLUDED_SECTIONS,
    STATUS_ARCHIVE_PRIMARY_SECTIONS,
    type DiplomacyArchiveMetadataItem,
    type DistrictArchiveMetadataItem,
    type DistrictExtractedResourceLink,
    type HeroArchiveMetadataItem,
    type HeroFactionIdentity,
    type ImprovementArchiveMetadataItem,
    type PopulationArchivePreviewLine,
    type PopulationFactionIdentity,
    type QuestArchiveLink,
    type TechArchiveMetadataItem,
    type UnitArchiveMetadataItem,
    type UnitFactionIdentity,
    type VictoryConditionArchiveMetadataItem,
    normalizeAbilityTaxonomyText,
    type VictoryConditionArchivePreviewLine,
} from "./CodexSummaryDetailViewModel";

export function getActionArchivePreview(entry: CodexEntry): string {
    if (entry.exportKind.trim().toLowerCase() !== "actions") return "";

    const descriptionPreview = getCodexEntryPreview(entry, 240);
    if (descriptionPreview) return descriptionPreview;

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectPreview = effectsSection ? getStructuredSectionPreviewLines(effectsSection)[0] : "";

    return effectPreview ? formatCodexMajorFactionText(effectPreview) : "";
}

export function getStructuredSectionPreviewLines(section: ReturnType<typeof parseCodexStructuredDescription>["sections"][number]): string[] {
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

export function normalizeQuestPreviewText(value: string): string {
    return normalizeAbilityTaxonomyText(value)
        .replace(/^objective:\s*/i, "")
        .replace(/^requirements?:\s*/i, "")
        .replace(/^rewards?:\s*/i, "")
        .replace(/^effects?:\s*/i, "");
}

export function getQuestArchivePreviewLines(entry: CodexEntry, fallbackPreview: string): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "quests") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const lines: string[] = [];
    const seen = new Set<string>();
    const normalizedFallback = normalizeQuestPreviewText(fallbackPreview);

    const addLine = (label: string, line: string) => {
        const value = line.trim();
        if (!value) return;

        const normalizedValue = normalizeQuestPreviewText(value);
        if (!normalizedValue || normalizedValue === normalizedFallback || seen.has(normalizedValue)) return;

        seen.add(normalizedValue);
        lines.push(`${label}: ${value}`);
    };

    for (const wantedLabel of QUEST_ARCHIVE_PREVIEW_SECTION_ORDER) {
        const section = parsed.sections.find((candidate) =>
            candidate.label.trim().toLowerCase() === wantedLabel
        );
        if (!section) continue;

        const displayLabel = section.label.trim();
        getStructuredSectionPreviewLines(section).forEach((line) => addLine(displayLabel, line));
        if (lines.length >= MAX_QUEST_PREVIEW_LINES) break;
    }

    return lines.slice(0, MAX_QUEST_PREVIEW_LINES);
}

export function isQuestArchiveLinkKind(entry: CodexEntry): boolean {
    return QUEST_ARCHIVE_LINK_KINDS.has(entry.exportKind.trim().toLowerCase());
}

export function getQuestArchiveLinks(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): QuestArchiveLink[] {
    if (entry.exportKind.trim().toLowerCase() !== "quests") return [];

    const links: QuestArchiveLink[] = [];
    const seenKeys = new Set<string>();

    const addEntry = (target: CodexEntry | undefined, label?: string) => {
        if (!target || !isQuestArchiveLinkKind(target) || seenKeys.has(target.entryKey)) return;

        seenKeys.add(target.entryKey);
        links.push({
            entry: target,
            label: label?.trim() || getCodexEntryLabel(target),
        });
    };

    const parsed = parseCodexStructuredDescription(entry);
    for (const section of parsed.sections) {
        for (const item of section.items ?? []) {
            addEntry(resolveCodexReference(item.referenceKey, referenceIndexes), item.label);
        }
    }

    for (const relatedEntry of resolveRelatedEntries(entry, referenceIndexes)) {
        addEntry(relatedEntry);
    }

    return links;
}

export function getStatusArchiveEffectPreviewLines(entry: CodexEntry): string[] {
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

export function getEquipmentArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "equipment") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_EQUIPMENT_EFFECT_PREVIEW_LINES);
}

export function getTechArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "tech") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_TECH_EFFECT_PREVIEW_LINES);
}

export function getTechArchiveUnlockLinks(
    entry: CodexEntry,
    relatedEntries: readonly CodexEntry[]
): TechUnlockSummary[] {
    if (entry.exportKind.trim().toLowerCase() !== "tech") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const unlocksSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "unlocks"
    );
    if (!unlocksSection?.items) return [];

    return unlocksSection.items
        .map((item) => buildTechUnlockSummary(item, relatedEntries))
        .filter((item): item is TechUnlockSummary => item !== null);
}

export function getVictoryConditionRequiredFormula(entry: CodexEntry): string {
    if (entry.exportKind.trim().toLowerCase() !== "victoryconditions") return "";

    const formulaFact = (entry.facts ?? []).find((fact) => {
        const normalizedLabel = fact.label.trim().toLowerCase();
        return normalizedLabel.startsWith("required ") &&
            normalizedLabel.endsWith(" formula") &&
            normalizedLabel !== "required hold duration formula";
    });

    return formulaFact?.value.trim() ?? "";
}

export function getVictoryConditionArchiveDescription(entry: CodexEntry, fallbackPreview: string): string {
    if (entry.exportKind.trim().toLowerCase() !== "victoryconditions") {
        return fallbackPreview;
    }

    return (entry.descriptionLines ?? [])
        .map((line) => formatCodexMajorFactionText(line.replace(/\s+/g, " ").trim()))
        .find((line) => line.length > 0) ?? fallbackPreview;
}

export function getVictoryConditionArchiveMetadata(entry: CodexEntry): VictoryConditionArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "victoryconditions") return [];

    const items: VictoryConditionArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Current exported-game value").forEach((value) =>
        addValue("current", `Current ${value}`)
    );
    getCodexFactValues(entry, "Current exported-game hold duration").forEach((value) =>
        addValue("hold", `Hold ${value}`)
    );
    getCodexFactValues(entry, "Victory path").forEach((value) => addValue("path", value));

    return items;
}

export function getVictoryConditionArchivePreviewLines(entry: CodexEntry): VictoryConditionArchivePreviewLine[] {
    if (entry.exportKind.trim().toLowerCase() !== "victoryconditions") return [];

    const lines: VictoryConditionArchivePreviewLine[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, label: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        lines.push({ key, label, value: trimmedValue });
    };

    getCodexFactValues(entry, "Objective").forEach((value) =>
        addValue("objective", "Objective", value)
    );
    addValue("requirement", "Requirement", getVictoryConditionRequiredFormula(entry));
    getCodexFactValues(entry, "Threshold note").forEach((value) =>
        addValue("note", "Note", value)
    );

    return lines.slice(0, MAX_VICTORY_CONDITION_PREVIEW_LINES);
}

export function getHeroArchiveStatPreviewLines(entry: CodexEntry): string[] {
    return getCodexHeroStatGroups(entry)
        .flatMap((group) => group.lines)
        .slice(0, MAX_HERO_STAT_PREVIEW_LINES);
}

export function getHeroClassMetadata(entry: CodexEntry): HeroArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "heroes") return [];

    const items: HeroArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Class").forEach((value) => addValue("class", value));

    return items;
}

export function getHeroFactionIdentity(entry: CodexEntry, relatedEntries: readonly CodexEntry[]): HeroFactionIdentity | null {
    if (entry.exportKind.trim().toLowerCase() !== "heroes") return null;

    const relatedFaction = relatedEntries.find((relatedEntry) => {
        const relatedKind = relatedEntry.exportKind.trim().toLowerCase();
        return relatedKind === "factions" || relatedKind === "minorfactions";
    });
    if (relatedFaction) {
        return {
            label: getCodexEntryLabel(relatedFaction),
            iconPath: getFactionIconPath(relatedFaction.entryKey),
        };
    }

    const fallbackFaction = getCodexFactValues(entry, "Faction")[0]?.trim();
    return fallbackFaction ? { label: fallbackFaction, iconPath: null } : null;
}

export function getHeroGrantedAbilityLinks(entry: CodexEntry, relatedEntries: readonly CodexEntry[]): CodexEntry[] {
    if (entry.exportKind.trim().toLowerCase() !== "heroes") return [];

    const seenKeys = new Set<string>();
    const abilityLinks: CodexEntry[] = [];

    for (const relatedEntry of relatedEntries) {
        if (relatedEntry.exportKind.trim().toLowerCase() !== "abilities") continue;
        if (seenKeys.has(relatedEntry.entryKey)) continue;

        seenKeys.add(relatedEntry.entryKey);
        abilityLinks.push(relatedEntry);
    }

    return abilityLinks;
}

export function getUnitArchiveStatPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "units") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const statsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "stats"
    );
    const statLines = statsSection ? getStructuredSectionPreviewLines(statsSection) : [];

    return statLines.slice(0, MAX_UNIT_STAT_PREVIEW_LINES);
}

export function getUnitArchiveMetadata(entry: CodexEntry): UnitArchiveMetadataItem[] {
    if (entry.exportKind.trim().toLowerCase() !== "units") return [];

    const items: UnitArchiveMetadataItem[] = [];
    const seenValues = new Set<string>();

    const addValue = (key: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${key}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ key, value: trimmedValue });
    };

    getCodexFactValues(entry, "Class").forEach((value) => addValue("class", value));
    getCodexFactValues(entry, "Tier").forEach((value) => addValue("tier", formatUnitTierLabel(value)));

    return items;
}

export function getUnitFactionIdentity(entry: CodexEntry, relatedEntries: readonly CodexEntry[]): UnitFactionIdentity | null {
    if (entry.exportKind.trim().toLowerCase() !== "units") return null;

    const relatedFaction = relatedEntries.find((relatedEntry) => {
        const relatedKind = relatedEntry.exportKind.trim().toLowerCase();
        return relatedKind === "factions" || relatedKind === "minorfactions";
    });
    if (relatedFaction) {
        return {
            label: getCodexEntryLabel(relatedFaction),
            iconPath: getFactionIconPath(relatedFaction.entryKey),
        };
    }

    const fallbackFaction = getCodexFactValues(entry, "Faction")[0]?.trim();
    return fallbackFaction ? { label: fallbackFaction, iconPath: null } : null;
}

export function getImprovementArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "improvements") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_IMPROVEMENT_EFFECT_PREVIEW_LINES);
}

export function getDistrictArchiveEffectPreviewLines(entry: CodexEntry): string[] {
    if (entry.exportKind.trim().toLowerCase() !== "districts") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const effectsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "effects"
    );
    const effectLines = effectsSection ? getStructuredSectionPreviewLines(effectsSection) : [];

    return effectLines.slice(0, MAX_DISTRICT_EFFECT_PREVIEW_LINES);
}

export function formatDistrictTierValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";
    return trimmedValue === "0" ? "Tier 0" : `Tier ${trimmedValue}`;
}

export function getDistrictArchiveMetadata(entry: CodexEntry): DistrictArchiveMetadataItem[] {
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

export function getDistrictExtractedResourceLinks(
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

export function getImprovementArchiveMetadata(entry: CodexEntry): ImprovementArchiveMetadataItem[] {
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

export function getPopulationFactionIdentity(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): PopulationFactionIdentity | null {
    const factionFact = (entry.facts ?? []).find((fact) =>
        fact.label.trim().toLowerCase() === "faction" && fact.value.trim()
    );
    if (!factionFact) return null;

    const linkedFaction = resolveCodexReference(factionFact.referenceKey, referenceIndexes);
    if (
        linkedFaction &&
        ["factions", "minorfactions"].includes(linkedFaction.exportKind.trim().toLowerCase())
    ) {
        const label = getCodexEntryLabel(linkedFaction);
        return label
            ? {
                label,
                iconPath: getFactionIconPath(linkedFaction.entryKey),
            }
            : null;
    }

    const fallbackLabel = formatCodexMajorFactionText(factionFact.value.trim());
    return fallbackLabel ? {
        label: fallbackLabel,
        iconPath: null,
    } : null;
}

export function getPopulationArchiveFactionIdentity(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): PopulationFactionIdentity | null {
    if (entry.exportKind.trim().toLowerCase() !== "populations") return null;

    return getPopulationFactionIdentity(entry, referenceIndexes);
}

export function getPopulationWorkerPreviewLines(entry: CodexEntry): PopulationArchivePreviewLine[] {
    if (entry.exportKind.trim().toLowerCase() !== "populations") return [];

    const parsed = parseCodexStructuredDescription(entry);
    const workerSection = parsed.sections.find((section) => {
        const label = section.label.trim().toLowerCase();
        return label === "worker" || label === "worker effects";
    });
    const workerLines = workerSection ? getStructuredSectionPreviewLines(workerSection) : [];

    return workerLines.slice(0, MAX_POPULATION_WORKER_PREVIEW_LINES).map((value, index) => ({
        key: `worker-${index}`,
        label: "Worker",
        value,
    }));
}

export function getPopulationThresholdRewardPreviewLines(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): PopulationArchivePreviewLine[] {
    if (entry.exportKind.trim().toLowerCase() !== "populations") return [];

    const thresholdSection = (entry.sections ?? []).find((section) =>
        section.title?.trim().toLowerCase().includes("threshold")
    );
    const previewLines: PopulationArchivePreviewLine[] = [];

    for (const item of thresholdSection?.items ?? []) {
        const label = item.label?.trim();
        if (!label) continue;

        const rewardFact = (item.facts ?? []).find((fact) =>
            fact.label?.trim().toLowerCase() === "reward" && fact.value?.trim()
        );
        const referenceKey = item.referenceKey?.trim() || rewardFact?.referenceKey?.trim() || "";
        const linkedEntry = resolveCodexReference(referenceKey, referenceIndexes);
        const value = rewardFact?.value?.trim() || (item.lines ?? []).find((line) => line.trim())?.trim() || "";
        if (!value) continue;

        previewLines.push({
            key: `threshold-${label}-${referenceKey || value}`,
            label: label.replace(/^At\s+/i, ""),
            value,
            ...(linkedEntry ? { linkedEntry } : {}),
        });

        if (previewLines.length >= MAX_POPULATION_THRESHOLD_PREVIEW_LINES) break;
    }

    return previewLines;
}

export function getPopulationArchivePreviewLines(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes
): PopulationArchivePreviewLine[] {
    if (entry.exportKind.trim().toLowerCase() !== "populations") return [];

    return [
        ...getPopulationWorkerPreviewLines(entry),
        ...getPopulationThresholdRewardPreviewLines(entry, referenceIndexes),
    ];
}

export function compactDiplomacyPreviewLine(value: string): string {
    return formatCodexMajorFactionText(value.replace(/\s+/g, " ").trim());
}

export function truncateDiplomacyPreviewLine(value: string, maxLength = 240): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trimEnd()}…`;
}

export function getDiplomacyDescriptionPreview(entry: CodexEntry): string {
    const rawPreview = (entry.descriptionLines ?? [])
        .map(compactDiplomacyPreviewLine)
        .find((line) => line.length > 0);

    return rawPreview ? truncateDiplomacyPreviewLine(rawPreview) : "";
}

export function getDiplomacyArchivePreview(entry: CodexEntry, fallbackPreview: string): string {
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

export function isDiplomacyMechanicalSignal(line: string): boolean {
    const trimmedLine = line.trim();

    return /\[[^\]]+\]/.test(trimmedLine) || /^[+-]\s*\d/.test(trimmedLine);
}

export function getDiplomacyArchiveSignalLines(
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

export function formatDiplomacyBilateralValue(value: string): string {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "yes") return "Bilateral";
    if (normalizedValue === "no") return "One-sided";

    return value.trim();
}

export function getDiplomacyArchiveMetadata(entry: CodexEntry): DiplomacyArchiveMetadataItem[] {
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

