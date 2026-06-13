import {
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexUnitGrantedAbilityPreview = {
    ability: CodexEntry;
    label: string;
    metadata: string;
    effectLine: string;
};

function normalizeKind(kind: string): string {
    return kind.trim().toLowerCase();
}

function isAbilityEntry(entry: CodexEntry): boolean {
    return normalizeKind(entry.exportKind) === "abilities";
}

function firstSectionLine(entry: CodexEntry, label: string): string {
    const parsed = parseCodexStructuredDescription(entry);
    const section = parsed.sections.find((candidate) =>
        candidate.label.trim().toLowerCase() === label
    );
    return section?.lines.find((line) => line.trim().length > 0) ?? "";
}

export function isUnitGrantedAbilitiesSection(entry: CodexEntry, sectionLabel: string): boolean {
    return normalizeKind(entry.exportKind) === "units" &&
        sectionLabel.trim().toLowerCase() === "granted abilities";
}

export function buildUnitGrantedAbilityPreview(
    item: CodexStructuredSectionItem,
    relatedEntries: CodexEntry[]
): CodexUnitGrantedAbilityPreview | null {
    const referenceKey = item.referenceKey?.trim();
    if (!referenceKey) return null;

    const ability = relatedEntries.find((entry) =>
        entry.entryKey === referenceKey && isAbilityEntry(entry)
    );
    if (!ability) return null;

    return {
        ability,
        label: getCodexEntryLabel(ability),
        metadata: getCodexRelatedContext(ability),
        effectLine: firstSectionLine(ability, "effects"),
    };
}
