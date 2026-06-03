import type { CodexEntry } from "@/types/dataTypes";
import { formatCodexMajorFactionText, stripCodexDescriptionLine } from "./codexPresentation";

export type CodexFactionTrait = {
    name: string;
    titleLine: string;
    bodyLines: string[];
};

export type CodexFactionDescription = {
    affinityLine: string | null;
    traits: CodexFactionTrait[];
    ungroupedLines: string[];
};

const AFFINITY_RE = /^Affinity:\s*(.*)$/i;
const TRAIT_RE = /^Trait:\s*(.*)$/i;

function cleanLine(line: string): string {
    return line.trim();
}

function stripLabel(line: string, label: "Affinity" | "Trait"): string {
    const pattern = label === "Affinity" ? AFFINITY_RE : TRAIT_RE;
    const match = cleanLine(line).match(pattern);
    return (match?.[1] ?? "").trim();
}

function cleanPreviewText(line: string): string {
    return stripCodexDescriptionLine(formatCodexMajorFactionText(line));
}

export function parseCodexFactionDescription(lines: readonly string[]): CodexFactionDescription {
    const traits: CodexFactionTrait[] = [];
    const ungroupedLines: string[] = [];
    let affinityLine: string | null = null;
    let activeTrait: CodexFactionTrait | null = null;

    for (const rawLine of lines) {
        const line = cleanLine(rawLine);
        if (!line) continue;

        if (!affinityLine && AFFINITY_RE.test(line)) {
            affinityLine = line;
            continue;
        }

        const traitMatch = line.match(TRAIT_RE);
        if (traitMatch) {
            activeTrait = {
                name: (traitMatch[1] ?? "").trim() || "Unnamed trait",
                titleLine: line,
                bodyLines: [],
            };
            traits.push(activeTrait);
            continue;
        }

        if (activeTrait) {
            activeTrait.bodyLines.push(line);
        } else {
            ungroupedLines.push(line);
        }
    }

    return { affinityLine, traits, ungroupedLines };
}

export function getCodexFactionAffinityLabel(entry: Pick<CodexEntry, "descriptionLines">): string | null {
    const parsed = parseCodexFactionDescription(entry.descriptionLines);
    if (!parsed.affinityLine) return null;

    const affinity = stripLabel(parsed.affinityLine, "Affinity");
    return affinity ? cleanPreviewText(affinity) : null;
}

export function getCodexFactionTraitNames(entry: Pick<CodexEntry, "descriptionLines">): string[] {
    return parseCodexFactionDescription(entry.descriptionLines)
        .traits
        .map((trait) => cleanPreviewText(stripLabel(trait.titleLine, "Trait") || trait.name))
        .filter(Boolean);
}

export function getCodexFactionTraitSummary(
    entry: Pick<CodexEntry, "descriptionLines">,
    traitLimit = 3
): string {
    const traitNames = getCodexFactionTraitNames(entry);
    const visibleTraits = traitNames.slice(0, traitLimit);
    const hiddenTraitCount = Math.max(0, traitNames.length - visibleTraits.length);
    const traits = [
        ...visibleTraits,
        hiddenTraitCount > 0 ? `+${hiddenTraitCount} ${hiddenTraitCount === 1 ? "trait" : "traits"}` : null,
    ].filter(Boolean).join(", ");

    return traits ? `Traits: ${traits}` : "";
}

export function getCodexFactionSummaryPreview(
    entry: Pick<CodexEntry, "descriptionLines">,
    traitLimit = 3
): string {
    const affinity = getCodexFactionAffinityLabel(entry);
    const traitText = getCodexFactionTraitSummary(entry, traitLimit);

    return [
        affinity ? `Affinity: ${affinity}` : null,
        traitText || null,
    ].filter(Boolean).join(" · ");
}
