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

export type CodexFactionArchivePreview = {
    context: string;
    lines: string[];
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

function getFactValue(entry: Pick<CodexEntry, "facts">, label: string): string | null {
    const normalizedLabel = label.trim().toLowerCase();
    const value = (entry.facts ?? [])
        .find((fact) => fact.label.trim().toLowerCase() === normalizedLabel)
        ?.value
        ?.trim();

    return value ? cleanPreviewText(value) : null;
}

function getSectionLines(entry: Pick<CodexEntry, "sections">, title: string): string[] {
    return (entry.sections ?? [])
        .find((section) => section.title?.trim().toLowerCase() === title.toLowerCase())
        ?.lines
        ?.map((line) => cleanPreviewText(line))
        .filter(Boolean) ?? [];
}

function getMinorFactionDescriptionValue(
    entry: Pick<CodexEntry, "descriptionLines">,
    label: string,
    limit = 1
): string[] {
    const prefix = `${label.toLowerCase()}:`;

    return entry.descriptionLines
        .map(cleanLine)
        .filter((line) => line.toLowerCase().startsWith(prefix))
        .map((line) => cleanPreviewText(line.slice(prefix.length)))
        .filter(Boolean)
        .slice(0, limit);
}

function joinLimited(label: string, values: readonly string[], limit: number): string | null {
    const visibleValues = values
        .map(cleanPreviewText)
        .filter(Boolean)
        .slice(0, limit);

    return visibleValues.length > 0 ? `${label}: ${visibleValues.join(" / ")}` : null;
}

export function getCodexFactionStrategicLines(
    entry: Pick<CodexEntry, "descriptionLines" | "sections">,
    lineLimit = 3
): string[] {
    const parsed = parseCodexFactionDescription(entry.descriptionLines);
    const lines = [
        ...getSectionLines(entry, "Effects"),
        ...parsed.ungroupedLines.map(cleanPreviewText),
    ].filter(Boolean);

    return Array.from(new Set(lines)).slice(0, lineLimit);
}

export function getCodexFactionStrategicPreview(
    entry: Pick<CodexEntry, "descriptionLines" | "sections">,
    lineLimit = 1
): string {
    return getCodexFactionStrategicLines(entry, lineLimit).join(" ");
}

export function buildCodexFactionArchivePreview(
    entry: Pick<CodexEntry, "exportKind" | "descriptionLines" | "facts" | "sections">
): CodexFactionArchivePreview | null {
    const kind = entry.exportKind.trim().toLowerCase();

    if (kind === "factions") {
        const affinity = getCodexFactionAffinityLabel(entry);

        return {
            context: affinity ? `Affinity: ${affinity}` : "",
            lines: getCodexFactionStrategicLines(entry, 2),
        };
    }

    if (kind === "minorfactions") {
        const disposition = getFactValue(entry, "Disposition");
        const affinity = getFactValue(entry, "Faction affinity");
        const unitLines = getMinorFactionDescriptionValue(entry, "Unit", 2);
        const traitLines = getSectionLines(entry, "Traits").slice(0, 2);
        const identityLine = getSectionLines(entry, "Identity")[0] ?? null;
        const context = [
            disposition,
            affinity ? `Affinity: ${affinity}` : null,
        ].filter(Boolean).join(" · ");
        const lines = [
            identityLine,
            joinLimited("Units", unitLines, 2),
            joinLimited("Traits", traitLines, 2),
        ].filter((line): line is string => Boolean(line));

        return {
            context,
            lines,
        };
    }

    return null;
}
