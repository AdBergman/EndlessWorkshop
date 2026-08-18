import type { CodexEntry, RichFaction } from "@/types/dataTypes";
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

export type CodexFactionProfileMetric = {
    id: string;
    label: string;
    value: string;
};

export type CodexFactionStrategyProfile = {
    kindLabel: string;
    affinityLabel: string | null;
    loreLine: string | null;
    signalLines: string[];
    metrics: CodexFactionProfileMetric[];
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

function metric(
    id: string,
    label: string,
    count: number | null | undefined,
    singular: string,
    plural = `${singular}s`
): CodexFactionProfileMetric | null {
    if (typeof count !== "number" || count <= 0) return null;

    return {
        id,
        label,
        value: `${count} ${count === 1 ? singular : plural}`,
    };
}

export function buildCodexFactionStrategyProfile(
    entry: Pick<CodexEntry, "exportKind" | "descriptionLines" | "facts" | "sections">,
    packageCounts: Readonly<Record<string, number>>,
    richFaction?: Pick<RichFaction, "lore"> | null
): CodexFactionStrategyProfile {
    const kind = entry.exportKind.trim().toLowerCase();
    const parsed = parseCodexFactionDescription(entry.descriptionLines);
    const isMinorFaction = kind === "minorfactions";
    const affinityLabel = isMinorFaction
        ? getFactValue(entry, "Faction affinity")
        : getCodexFactionAffinityLabel(entry);
    const disposition = isMinorFaction ? getFactValue(entry, "Disposition") : null;
    const loreLine = cleanPreviewText(richFaction?.lore ?? "") || (getSectionLines(entry, "Identity")[0] ?? null);
    const signalLines = isMinorFaction ? [] : getCodexFactionStrategicLines(entry, 3);
    const questCount = packageCounts.quests ?? 0;
    const questMetric = questCount > 0
        ? {
            id: "quests",
            label: isMinorFaction ? "Quest" : "Questline",
            value: questCount === 1 ? "Available" : `${questCount} available`,
        }
        : null;
    const metrics = [
        affinityLabel ? { id: "affinity", label: "Affinity", value: affinityLabel } : null,
        disposition ? { id: "disposition", label: "Disposition", value: disposition } : null,
        metric("traits", isMinorFaction ? "Protectorate Traits" : "Traits", isMinorFaction
            ? packageCounts.traits
            : parsed.traits.length, "trait"),
        metric("population", "Population", packageCounts.population, "population", "populations"),
        metric("units", isMinorFaction ? "Core Unit" : "Core Units", packageCounts.units, "unit"),
        metric("tech", "Faction Techs", packageCounts.tech, "tech", "techs"),
        metric("heroes", "Heroes", packageCounts.heroes, "hero", "heroes"),
        questMetric,
    ].filter((item): item is CodexFactionProfileMetric => Boolean(item));

    return {
        kindLabel: isMinorFaction ? "Minor faction profile" : "Major faction profile",
        affinityLabel,
        loreLine,
        signalLines: signalLines.map(cleanPreviewText).filter(Boolean),
        metrics,
    };
}
