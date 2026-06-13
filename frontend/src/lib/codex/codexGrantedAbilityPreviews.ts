import {
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexGrantedAbilityPreview = {
    ability: CodexEntry;
    label: string;
    metadata: string;
    effectLine: string;
};

const GRANTED_ABILITY_PREVIEW_KINDS = new Set(["equipment", "heroes", "units"]);

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

export function isGrantedAbilityPreviewSection(entry: CodexEntry, sectionLabel: string): boolean {
    return GRANTED_ABILITY_PREVIEW_KINDS.has(normalizeKind(entry.exportKind)) &&
        sectionLabel.trim().toLowerCase() === "granted abilities";
}

export function buildGrantedAbilityPreview(
    item: CodexStructuredSectionItem,
    relatedEntries: CodexEntry[]
): CodexGrantedAbilityPreview | null {
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

export function getDisplayedGrantedAbilityKeys(
    entry: CodexEntry,
    relatedEntries: CodexEntry[]
): Set<string> {
    const displayedAbilityKeys = new Set<string>();
    if (!GRANTED_ABILITY_PREVIEW_KINDS.has(normalizeKind(entry.exportKind))) {
        return displayedAbilityKeys;
    }

    const parsed = parseCodexStructuredDescription(entry);

    for (const section of parsed.sections) {
        if (!isGrantedAbilityPreviewSection(entry, section.label)) continue;

        for (const item of section.items ?? []) {
            const preview = buildGrantedAbilityPreview(item, relatedEntries);
            if (preview) {
                displayedAbilityKeys.add(preview.ability.entryKey);
            }
        }
    }

    return displayedAbilityKeys;
}
