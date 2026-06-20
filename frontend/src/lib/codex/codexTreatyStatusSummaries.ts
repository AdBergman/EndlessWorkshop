import {
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import {
    getCodexReadablePreviewLine,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexTreatyStatusSummary = {
    target: CodexEntry;
    label: string;
    metadata: string;
    previewLine: string;
};

function normalizeKind(kind: string): string {
    return kind.trim().toLowerCase();
}

function treatyStatusContext(entry: CodexEntry): string {
    const scope = entry.facts?.find((fact) => fact.label.trim().toLowerCase() === "scope")?.value.trim();
    const duration = entry.facts?.find((fact) => fact.label.trim().toLowerCase() === "duration")?.value.trim();
    if (scope && duration) return `${scope} / ${duration}`;
    if (scope) return scope;
    if (duration) return duration;

    return getCodexRelatedContext(entry);
}

function treatyStatusPreviewLine(entry: CodexEntry): string {
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

export function isTreatyAppliedStatusSummarySection(entry: CodexEntry, sectionLabel: string): boolean {
    return normalizeKind(entry.exportKind) === "diplomatictreaties" &&
        sectionLabel.trim().toLowerCase() === "applied statuses";
}

export function buildTreatyStatusSummary(
    item: CodexStructuredSectionItem,
    relatedEntries: readonly CodexEntry[]
): CodexTreatyStatusSummary | null {
    const referenceKey = item.referenceKey?.trim();
    if (!referenceKey) return null;

    const target = relatedEntries.find((entry) => entry.entryKey === referenceKey);
    if (!target) return null;

    const isStatus = target.kind?.trim().toLowerCase() === "status" ||
        target.category?.trim().toLowerCase() === "status" ||
        target.entryKey.startsWith("Status_") ||
        target.entryKey.startsWith("HeroStatus_");
    if (!isStatus) return null;

    return {
        target,
        label: getCodexEntryLabel(target),
        metadata: treatyStatusContext(target),
        previewLine: treatyStatusPreviewLine(target),
    };
}
