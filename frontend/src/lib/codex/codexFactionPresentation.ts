import type { CodexEntry } from "@/types/dataTypes";
import { formatCodexMajorFactionText, stripCodexDescriptionLine } from "./codexPresentation";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveRelatedEntries,
    type CodexReferenceIndexes,
} from "./codexRefs";

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
    iconEntry: CodexEntry;
    lines: string[];
    links: CodexFactionArchiveLink[];
};

export type CodexFactionArchiveLink = {
    entry: CodexEntry;
    label: string;
    prefix: string;
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

function isLowSignalMajorFactionLine(line: string): boolean {
    return /public opinion due to neighbors/i.test(line);
}

function majorFactionLineScore(line: string): number {
    const normalized = line.toLowerCase();
    let score = 0;

    if (/[+-]\d/.test(normalized)) score += 2;
    if (/\b(can|cannot|do not|doesn't|only|unique|special|without|enable|unlock)\b/.test(normalized)) score += 3;
    if (/\b(city cap|attachable|population|corpses|burrows|science|holy|actions|battle|unit|district|influence cost|health regeneration|approval|dust|food|shield|foundation|coral|hunted|illuminated|speciali[sz]ation)\b/.test(normalized)) score += 3;
    if (isLowSignalMajorFactionLine(line)) score -= 5;

    return score;
}

export function getCodexFactionArchiveStrategicLines(
    entry: Pick<CodexEntry, "descriptionLines" | "sections">,
    lineLimit = 3
): string[] {
    const lines = getCodexFactionStrategicLines(entry, 12);
    const rankedLines = lines
        .map((line, index) => ({ index, line, score: majorFactionLineScore(line) }))
        .filter((item) => item.score > 0)
        .sort((left, right) => {
            const scoreDelta = right.score - left.score;
            return scoreDelta !== 0 ? scoreDelta : left.index - right.index;
        })
        .slice(0, lineLimit)
        .sort((left, right) => left.index - right.index)
        .map((item) => item.line);

    if (rankedLines.length > 0) return rankedLines;

    return lines.filter((line) => !isLowSignalMajorFactionLine(line)).slice(0, lineLimit);
}

export function getCodexFactionStrategicPreview(
    entry: Pick<CodexEntry, "descriptionLines" | "sections">,
    lineLimit = 1
): string {
    return getCodexFactionStrategicLines(entry, lineLimit).join(" ");
}

function normalizeKind(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function getLinkFactValue(entry: CodexEntry, label: string): string | null {
    const normalizedLabel = label.trim().toLowerCase();
    const fact = entry.facts?.find((item) => item.label.trim().toLowerCase() === normalizedLabel);
    const value = fact?.value?.trim();
    return value ? value : null;
}

function getMinorFactionUnitPrefix(entry: CodexEntry): string {
    const tier = getLinkFactValue(entry, "Tier");

    if (tier === "2") return "Elite Unit";
    if (tier === "1") return "Upgraded Unit";

    return "Unit";
}

function getMinorFactionTraitPrefix(entry: CodexEntry): string {
    const traitType = getLinkFactValue(entry, "Trait type");

    return traitType ? `${traitType} Trait` : "Trait";
}

function dedupeArchiveLinks(links: readonly CodexFactionArchiveLink[]): CodexFactionArchiveLink[] {
    const seen = new Set<string>();
    const out: CodexFactionArchiveLink[] = [];

    for (const link of links) {
        const key = [
            link.prefix.trim().toLowerCase(),
            link.label.trim().toLowerCase(),
            (link.entry.descriptionLines ?? []).map((line) => line.trim()).join("\n").toLowerCase(),
        ].join("::");
        if (!key || seen.has(key)) continue;

        seen.add(key);
        out.push(link);
    }

    return out;
}

function relatedLinks(
    entry: CodexEntry,
    referenceIndexes: CodexReferenceIndexes,
    kind: string,
    prefix: string,
    limit: number,
    getPrefix: (relatedEntry: CodexEntry) => string = () => prefix
): CodexFactionArchiveLink[] {
    const relatedEntries = resolveRelatedEntries(entry, referenceIndexes);

    return dedupeArchiveLinks(
        relatedEntries
            .filter((relatedEntry) => normalizeKind(relatedEntry.exportKind) === normalizeKind(kind))
            .map((relatedEntry) => ({
                entry: relatedEntry,
                label: cleanPreviewText(relatedEntry.displayName || relatedEntry.entryKey),
                prefix: getPrefix(relatedEntry),
            }))
    ).slice(0, limit);
}

export function buildCodexFactionArchivePreview(
    entry: CodexEntry,
    allEntries: readonly CodexEntry[]
): CodexFactionArchivePreview | null {
    const kind = entry.exportKind.trim().toLowerCase();

    if (kind === "factions") {
        const affinity = getCodexFactionAffinityLabel(entry);

        return {
            context: affinity ? `Affinity: ${affinity}` : "",
            iconEntry: entry,
            lines: getCodexFactionArchiveStrategicLines(entry, 3),
            links: [],
        };
    }

    if (kind === "minorfactions") {
        const disposition = getFactValue(entry, "Disposition");
        const identityLine = getSectionLines(entry, "Identity")[0] ?? null;
        const referenceIndexes = {
            entriesByKey: buildEntriesByKey(allEntries),
            entriesByKindKey: buildEntriesByKindKey(allEntries),
        };
        const populationLinks = relatedLinks(entry, referenceIndexes, "populations", "Population", 1);
        const unitLinks = relatedLinks(entry, referenceIndexes, "units", "Unit", 2, getMinorFactionUnitPrefix);
        const traitLinks = relatedLinks(entry, referenceIndexes, "traits", "Trait", 2, getMinorFactionTraitPrefix);
        const lines = [
            identityLine,
        ].filter((line): line is string => Boolean(line));

        return {
            context: disposition ?? "",
            iconEntry: entry,
            lines,
            links: [...populationLinks, ...unitLinks, ...traitLinks],
        };
    }

    return null;
}
