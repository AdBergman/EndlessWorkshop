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

export type CodexTechUnlockSummary = {
    target: CodexEntry;
    label: string;
    metadata: string;
    previewLine: string;
};

function normalizeKind(kind: string): string {
    return kind.trim().toLowerCase();
}

function unlockTargetContext(entry: CodexEntry): string {
    const category = entry.category?.trim();
    const kind = entry.kind?.trim();
    if (category && kind && category.toLowerCase() !== kind.toLowerCase()) {
        return `${category} / ${kind}`;
    }
    if (kind) return kind;

    return getCodexRelatedContext(entry);
}

function unlockTargetPreviewLine(entry: CodexEntry): string {
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

export function isTechUnlockSummarySection(entry: CodexEntry, sectionLabel: string): boolean {
    return normalizeKind(entry.exportKind) === "tech" &&
        sectionLabel.trim().toLowerCase() === "unlocks";
}

export function buildTechUnlockSummary(
    item: CodexStructuredSectionItem,
    relatedEntries: readonly CodexEntry[]
): CodexTechUnlockSummary | null {
    const referenceKey = item.referenceKey?.trim();
    if (!referenceKey) return null;

    const target = relatedEntries.find((entry) => entry.entryKey === referenceKey);
    if (!target) return null;

    return {
        target,
        label: getCodexEntryLabel(target),
        metadata: unlockTargetContext(target),
        previewLine: unlockTargetPreviewLine(target),
    };
}
