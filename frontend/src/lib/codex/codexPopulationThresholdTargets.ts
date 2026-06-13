import {
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import {
    getCodexReadablePreviewLine,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry, CodexMetadataSectionItem } from "@/types/dataTypes";

export type CodexPopulationThresholdTargetSummary = {
    target: CodexEntry;
    label: string;
    metadata: string;
    previewLine: string;
};

function normalizeKind(kind: string): string {
    return kind.trim().toLowerCase();
}

function thresholdTargetContext(entry: CodexEntry): string {
    const category = entry.category?.trim();
    const kind = entry.kind?.trim();
    if (category && kind && category.toLowerCase() !== kind.toLowerCase()) {
        return `${category} / ${kind}`;
    }
    if (kind) return kind;

    return getCodexRelatedContext(entry);
}

function thresholdTargetPreviewLine(entry: CodexEntry): string {
    const parsed = parseCodexStructuredDescription(entry);
    for (const section of parsed.sections) {
        const sectionLine = section.lines.find((line) => line.trim().length > 0);
        if (sectionLine) return sectionLine;

        for (const item of section.items ?? []) {
            const itemLine = item.lines.find((line) => line.trim().length > 0);
            if (itemLine) return itemLine;
        }
    }

    return getCodexDescriptionPreviewLine(entry.descriptionLines) ||
        getCodexReadablePreviewLine(entry);
}

export function isPopulationThresholdRewardsSection(entry: CodexEntry, sectionLabel: string): boolean {
    return normalizeKind(entry.exportKind) === "populations" &&
        sectionLabel.trim().toLowerCase() === "threshold rewards";
}

export function buildPopulationThresholdTargetSummary(
    item: CodexMetadataSectionItem,
    relatedEntries: CodexEntry[]
): CodexPopulationThresholdTargetSummary | null {
    const referenceKey = item.referenceKey?.trim();
    if (!referenceKey) return null;

    const target = relatedEntries.find((entry) => entry.entryKey === referenceKey);
    if (!target) return null;

    return {
        target,
        label: getCodexEntryLabel(target),
        metadata: thresholdTargetContext(target),
        previewLine: thresholdTargetPreviewLine(target),
    };
}

export function findPopulationThresholdTargetSummary(
    entry: CodexEntry,
    thresholdLabel: string,
    relatedEntries: CodexEntry[]
): CodexPopulationThresholdTargetSummary | null {
    if (normalizeKind(entry.exportKind) !== "populations") {
        return null;
    }

    const normalizedLabel = thresholdLabel.trim().toLowerCase();

    for (const section of entry.sections ?? []) {
        if (section.title?.trim().toLowerCase() !== "threshold rewards") continue;

        const item = (section.items ?? []).find((candidate) =>
            candidate.label?.trim().toLowerCase() === normalizedLabel
        );
        if (!item) continue;

        return buildPopulationThresholdTargetSummary(item, relatedEntries);
    }

    return null;
}

export function getDisplayedPopulationThresholdTargetKeys(
    entry: CodexEntry,
    relatedEntries: CodexEntry[]
): Set<string> {
    const displayedTargetKeys = new Set<string>();
    if (normalizeKind(entry.exportKind) !== "populations") {
        return displayedTargetKeys;
    }

    for (const section of entry.sections ?? []) {
        if (!isPopulationThresholdRewardsSection(entry, section.title)) continue;

        for (const item of section.items ?? []) {
            const summary = buildPopulationThresholdTargetSummary(item, relatedEntries);
            if (summary) {
                displayedTargetKeys.add(summary.target.entryKey);
            }
        }
    }

    return displayedTargetKeys;
}
