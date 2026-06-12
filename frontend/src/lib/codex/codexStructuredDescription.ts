import {
    formatCodexMajorFactionLabel,
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexEntry, CodexMetadataFact, CodexMetadataSectionItem } from "@/types/dataTypes";

export type CodexStructuredFact = {
    label: string;
    value: string;
    sourceLine: string;
};

export type CodexStructuredSectionItem = {
    label: string;
    referenceKey: string | null;
    facts: CodexStructuredFact[];
    lines: string[];
};

export type CodexStructuredSection = {
    label: string;
    lines: string[];
    items?: CodexStructuredSectionItem[];
};

export type CodexStructuredTimelineItem = {
    label: string;
    value: string;
    sourceLine: string;
};

export type CodexStructuredDescription = {
    facts: CodexStructuredFact[];
    sections: CodexStructuredSection[];
    timeline: CodexStructuredTimelineItem[];
    bodyLines: string[];
    hasStructuredContent: boolean;
};

const FACT_LABELS_BY_KIND: Record<string, Set<string>> = {
    abilities: new Set(["Category", "Target", "Range", "Cost", "Shape"]),
    actions: new Set(["Category", "Kind", "Reference key", "Action type", "UI category"]),
    bonuses: new Set(["Category", "Kind"]),
    councilors: new Set(["Faction", "Role"]),
    diplomatictreaties: new Set(["Category", "Bilateral", "Duration", "Kind"]),
    districts: new Set(["Kind", "Category", "Tier"]),
    equipment: new Set(["Type", "Slot", "Rarity", "Tier", "Access pool", "Value"]),
    heroes: new Set(["Faction", "Class"]),
    improvements: new Set(["Kind", "Category"]),
    minorfactions: new Set(["Disposition", "Faction affinity", "Population", "Unit", "Trait"]),
    modifiers: new Set(["Category", "Kind", "Cost type", "Operation", "Value", "Display value"]),
    populations: new Set(["Faction", "Type", "Base food cost"]),
    statuses: new Set(["Category", "Kind", "Duration", "Stacking"]),
    tech: new Set(["Kind", "Tier", "Faction", "Era", "Quadrant"]),
    traits: new Set(["Category", "Cost", "Required affinity", "Excludes"]),
    units: new Set(["Kind", "Tier", "Faction", "Class", "Spawn type"]),
};

const SECTION_LABELS_BY_KIND: Record<string, Record<string, string>> = {
    councilors: {
        "Councilor effect": "Councilor effect",
        "Partner effect": "Partner effect",
    },
    populations: {
        Worker: "Worker",
    },
};

const SUMMARY_FACT_LABELS_BY_KIND: Record<string, string[]> = {
    abilities: ["Category", "Target", "Range", "Cost"],
    bonuses: ["Category", "Kind"],
    councilors: ["Role", "Councilor effect", "Partner effect"],
    districts: ["Category", "Tier", "Kind"],
    equipment: ["Type", "Slot", "Rarity", "Tier"],
    heroes: ["Faction", "Class"],
    improvements: ["Category"],
    minorfactions: ["Disposition", "Faction affinity", "Population", "Unit"],
    modifiers: ["Cost type", "Effect", "Category"],
    populations: ["Type", "Faction", "Base food cost"],
    statuses: ["Category", "Kind", "Duration"],
    traits: ["Category", "Cost", "Required affinity"],
};

const SECTION_PRIORITY_BY_KIND: Record<string, string[]> = {
    equipment: ["granted abilities", "effects"],
    traits: ["unlocks", "exclusions", "granted abilities", "effects"],
    heroes: ["stats"],
    units: ["stats"],
    quests: ["objective", "requirements", "rewards", "choices", "effects"],
};

function normalizeKind(kind: string | null | undefined): string {
    return (kind ?? "").trim().toLowerCase();
}

function cleanValue(value: string): string {
    const trimmed = value.trim();
    const classMatch = trimmed.match(/^UnitClass_(.+)$/i);
    if (classMatch) {
        return classMatch[1]
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .trim();
    }

    return formatCodexMajorFactionLabel(trimmed) ?? formatCodexMajorFactionText(trimmed);
}

function cleanPreviewValue(value: string): string {
    return stripCodexDescriptionLine(cleanValue(value));
}

function formatSummaryFact(fact: CodexStructuredFact): string {
    const value = cleanPreviewValue(fact.value);
    if (!value) return "";

    if (/^(Tier|Range|Cost|Value|Base food cost)$/i.test(fact.label)) {
        return `${fact.label} ${value}`;
    }

    return value;
}

function findSummaryFact(kind: string, facts: CodexStructuredFact[], label: string): CodexStructuredFact | undefined {
    if (kind === "traits" && label === "Category") {
        return facts.find((fact) =>
            fact.label === label && fact.value.trim().toLowerCase() !== "faction"
        ) ?? facts.find((fact) => fact.label === label);
    }

    if (kind === "heroes" && label === "Faction") {
        return facts.find((fact) =>
            fact.label === label && fact.value.trim().toLowerCase() !== "hero"
        );
    }

    return facts.find((fact) => fact.label === label);
}

function appendMinorFactionAssociatedContent(
    parsed: CodexStructuredDescription,
    summaryParts: string[]
): string[] {
    const associated = parsed.sections.find((section) => section.label.toLowerCase() === "associated content");
    if (!associated) return summaryParts;

    const seen = new Set(summaryParts.map((part) => part.trim().toLowerCase()));
    const out = [...summaryParts];
    for (const line of associated.lines) {
        const value = cleanPreviewValue(line);
        const key = value.toLowerCase();
        if (!value || seen.has(key)) continue;

        seen.add(key);
        out.push(value);
        if (out.length >= 4) break;
    }

    return out;
}

function splitPrefixedLine(line: string): { label: string; value: string } | null {
    const match = line.match(/^([^:]{2,48}):\s*(.+)$/);
    if (!match) return null;

    return {
        label: match[1].trim(),
        value: match[2].trim(),
    };
}

function parsePopulationThreshold(line: string): CodexStructuredTimelineItem | null {
    const match = line.match(/^At\s+(\d+)\s+population:\s*(.+)$/i);
    if (!match) return null;

    return {
        label: `${Number.parseInt(match[1], 10)} population`,
        value: cleanValue(match[2]),
        sourceLine: line,
    };
}

function hasFact(facts: CodexStructuredFact[], label: string, value: string): boolean {
    return facts.some((fact) =>
        fact.label.toLowerCase() === label.toLowerCase() &&
        fact.value.toLowerCase() === value.toLowerCase()
    );
}

function normalizeComparable(value: string): string {
    return value.trim().toLowerCase();
}

function hasDisplayValueFact(facts: CodexStructuredFact[]): boolean {
    return facts.some((fact) => normalizeComparable(fact.label) === "display value");
}

function hasMatchingFact(facts: CodexStructuredFact[], label: string, value: string): boolean {
    const normalizedLabel = normalizeComparable(label);
    const normalizedValue = normalizeComparable(value);
    return facts.some((fact) =>
        normalizeComparable(fact.label) === normalizedLabel &&
        normalizeComparable(fact.value) === normalizedValue
    );
}

function isDuplicateKindFact(fact: CodexStructuredFact, facts: CodexStructuredFact[]): boolean {
    if (normalizeComparable(fact.label) !== "kind") return false;

    return facts.some((candidate) =>
        normalizeComparable(candidate.label) === "category" &&
        normalizeComparable(candidate.value) === normalizeComparable(fact.value)
    );
}

function isPublicFact(kind: string, fact: CodexStructuredFact, facts: CodexStructuredFact[]): boolean {
    const label = normalizeComparable(fact.label);

    if (label === "reference key") return false;
    if (isDuplicateKindFact(fact, facts)) return false;

    if (kind === "modifiers" && hasDisplayValueFact(facts) && (label === "operation" || label === "value")) {
        return false;
    }

    return true;
}

function filterPublicFacts(kind: string, facts: CodexStructuredFact[]): CodexStructuredFact[] {
    return facts.filter((fact) => isPublicFact(kind, fact, facts));
}

function isNonPlayerLine(kind: string, line: string): boolean {
    if ((kind === "heroes" || kind === "units") && /\bleader priority\b/i.test(line)) {
        return true;
    }

    return false;
}

function filterPublicLines(kind: string, lines: string[]): string[] {
    return lines.filter((line) => !isNonPlayerLine(kind, line));
}

function isDuplicateFactLine(line: string, facts: CodexStructuredFact[]): boolean {
    const prefixedLine = splitPrefixedLine(line);
    if (!prefixedLine) return false;

    return hasMatchingFact(facts, prefixedLine.label, cleanValue(prefixedLine.value));
}

function addSection(sections: CodexStructuredSection[], label: string, line: string) {
    const existing = sections.find((section) => section.label === label);

    if (existing) {
        existing.lines.push(line);
        return;
    }

    sections.push({ label, lines: [line] });
}

function orderSections(kind: string, sections: CodexStructuredSection[]): CodexStructuredSection[] {
    const priorityLabels = SECTION_PRIORITY_BY_KIND[kind] ?? [];
    if (priorityLabels.length === 0 || sections.length < 2) return sections;

    return sections
        .map((section, index) => ({
            section,
            index,
            priority: priorityLabels.indexOf(normalizeComparable(section.label)),
        }))
        .sort((left, right) => {
            const leftPriority = left.priority >= 0 ? left.priority : Number.MAX_SAFE_INTEGER;
            const rightPriority = right.priority >= 0 ? right.priority : Number.MAX_SAFE_INTEGER;
            if (leftPriority !== rightPriority) return leftPriority - rightPriority;
            return left.index - right.index;
        })
        .map(({ section }) => section);
}

function exportedFactToStructuredFact(fact: CodexMetadataFact): CodexStructuredFact | null {
    if (!fact?.label?.trim() || !fact?.value?.trim()) return null;

    const label = fact.label.trim();
    const value = cleanValue(fact.value);
    return { label, value, sourceLine: `${label}: ${value}` };
}

function formatPlayerFacingFact(kind: string, fact: CodexStructuredFact): CodexStructuredFact {
    const label = normalizeComparable(fact.label);
    const value = fact.value.trim();

    if (kind === "diplomatictreaties" && label === "bilateral") {
        const normalizedValue = normalizeComparable(value);
        const participation = normalizedValue === "yes"
            ? "Bilateral"
            : normalizedValue === "no"
                ? "One-sided"
                : value;

        return {
            label: "Participation",
            value: participation,
            sourceLine: `Participation: ${participation}`,
        };
    }

    if (kind === "equipment" && label === "access pool") {
        return {
            label: "Source",
            value,
            sourceLine: `Source: ${value}`,
        };
    }

    if (kind === "equipment" && label === "value") {
        const numericValue = Number(value);
        const displayValue = Number.isFinite(numericValue)
            ? String(Number.parseFloat(numericValue.toFixed(2)))
            : value;

        return {
            label: "Market value",
            value: displayValue,
            sourceLine: `Market value: ${displayValue}`,
        };
    }

    if ((kind === "equipment" || kind === "units" || kind === "districts") && label === "tier" && value === "0") {
        return {
            label: fact.label,
            value: "Base",
            sourceLine: `${fact.label}: Base`,
        };
    }

    if (kind === "modifiers" && label === "display value") {
        return {
            label: "Effect",
            value,
            sourceLine: `Effect: ${value}`,
        };
    }

    return fact;
}

function itemValue(item: CodexMetadataSectionItem): string {
    const lineValue = (item.lines ?? [])
        .map((line) => line.trim())
        .filter(Boolean)
        .join("; ");

    if (lineValue) return cleanValue(lineValue);

    const rewardFact = (item.facts ?? []).find((fact) => fact.label?.trim().toLowerCase() === "reward");
    if (rewardFact?.value?.trim()) return cleanValue(rewardFact.value);

    const factSummary = (item.facts ?? [])
        .filter((fact) => fact.label?.trim() && fact.value?.trim())
        .map((fact) => `${fact.label.trim()}: ${cleanValue(fact.value)}`)
        .join("; ");

    return factSummary;
}

function exportedItemToTimelineItem(item: CodexMetadataSectionItem): CodexStructuredTimelineItem | null {
    const label = item?.label?.trim();
    if (!label) return null;

    const value = itemValue(item);
    if (!value) return null;

    return { label, value, sourceLine: `${label}: ${value}` };
}

function exportedItemToStructuredItem(kind: string, item: CodexMetadataSectionItem): CodexStructuredSectionItem | null {
    const label = item?.label?.trim();
    if (!label) return null;

    const referenceKey = item.referenceKey?.trim() || null;
    const rawFacts = (item.facts ?? [])
        .map(exportedFactToStructuredFact)
        .filter((fact): fact is CodexStructuredFact => fact !== null);
    const facts = filterPublicFacts(kind, rawFacts)
        .map((fact) => formatPlayerFacingFact(kind, fact));
    const lines = (item.lines ?? [])
        .map((line) => line.trim())
        .filter(Boolean)
        .map(cleanValue);
    const publicLines = filterPublicLines(kind, lines)
        .filter((line) => !isDuplicateFactLine(line, facts));

    if (!referenceKey && facts.length === 0 && publicLines.length === 0) return null;

    return { label, referenceKey, facts, lines: publicLines };
}

function parseExportedStructuredMetadata(entry: Pick<CodexEntry, "exportKind" | "facts" | "sections">): CodexStructuredDescription | null {
    const kind = normalizeKind(entry.exportKind);
    const rawFacts = (entry.facts ?? [])
        .map(exportedFactToStructuredFact)
        .filter((fact): fact is CodexStructuredFact => fact !== null);
    const facts = filterPublicFacts(kind, rawFacts)
        .map((fact) => formatPlayerFacingFact(kind, fact));

    const sections: CodexStructuredSection[] = [];
    const timeline: CodexStructuredTimelineItem[] = [];

    for (const section of entry.sections ?? []) {
        const title = section.title?.trim();
        if (!title) continue;

        const rawLines = (section.lines ?? [])
            .map((line) => line.trim())
            .filter(Boolean)
            .map(cleanValue);
        const lines = filterPublicLines(kind, rawLines)
            .filter((line) => !isDuplicateFactLine(line, facts));

        const isPopulationThresholdSection =
            kind === "populations" && title.toLowerCase().includes("threshold");

        if (isPopulationThresholdSection) {
            const itemTimeline = (section.items ?? [])
                .map(exportedItemToTimelineItem)
                .filter((item): item is CodexStructuredTimelineItem => item !== null);

            timeline.push(...itemTimeline);
        } else {
            const items = (section.items ?? [])
                .map((item) => exportedItemToStructuredItem(kind, item))
                .filter((item): item is CodexStructuredSectionItem => item !== null);

            if (lines.length > 0 || items.length > 0) {
                sections.push({ label: title, lines, ...(items.length > 0 ? { items } : {}) });
            }
        }

        if (isPopulationThresholdSection && lines.length > 0) {
            sections.push({ label: title, lines });
        }
    }

    if (facts.length === 0 && sections.length === 0 && timeline.length === 0) {
        return null;
    }

    return {
        facts,
        sections: orderSections(kind, sections),
        timeline,
        bodyLines: [],
        hasStructuredContent: true,
    };
}

export function parseCodexStructuredDescription(
    entry: Pick<CodexEntry, "exportKind" | "descriptionLines" | "facts" | "sections">
): CodexStructuredDescription {
    const exportedMetadata = parseExportedStructuredMetadata(entry);
    if (exportedMetadata) return exportedMetadata;

    const kind = normalizeKind(entry.exportKind);
    const factLabels = FACT_LABELS_BY_KIND[kind] ?? new Set<string>();
    const sectionLabels = SECTION_LABELS_BY_KIND[kind] ?? {};
    const facts: CodexStructuredFact[] = [];
    const sections: CodexStructuredSection[] = [];
    const timeline: CodexStructuredTimelineItem[] = [];
    const bodyLines: string[] = [];

    for (const rawLine of entry.descriptionLines ?? []) {
        const line = rawLine.trim();
        if (!line) continue;

        const threshold = kind === "populations" ? parsePopulationThreshold(line) : null;
        if (threshold) {
            timeline.push(threshold);
            continue;
        }

        const prefixedLine = splitPrefixedLine(line);
        if (prefixedLine) {
            const label = prefixedLine.label;
            const value = cleanValue(prefixedLine.value);

            if (factLabels.has(label)) {
                if (!hasFact(facts, label, value)) {
                    facts.push({ label, value, sourceLine: line });
                }
                continue;
            }

            const sectionLabel = sectionLabels[label];
            if (sectionLabel) {
                addSection(sections, sectionLabel, value);
                continue;
            }
        }

        if (isNonPlayerLine(kind, line) || isDuplicateFactLine(line, facts)) {
            continue;
        }

        bodyLines.push(line);
    }

    const publicFacts = filterPublicFacts(kind, facts)
        .map((fact) => formatPlayerFacingFact(kind, fact));

    return {
        facts: publicFacts,
        sections: orderSections(kind, sections),
        timeline,
        bodyLines,
        hasStructuredContent: publicFacts.length > 0 || sections.length > 0 || timeline.length > 0,
    };
}

export function getCodexStructuredSummary(
    entry: Pick<CodexEntry, "exportKind" | "descriptionLines" | "facts" | "sections">
): string {
    const kind = normalizeKind(entry.exportKind);
    const parsed = parseCodexStructuredDescription(entry);
    const preferredLabels = SUMMARY_FACT_LABELS_BY_KIND[kind] ?? [];
    const summaryParts = preferredLabels
        .map((label) => findSummaryFact(kind, parsed.facts, label))
        .filter((fact): fact is CodexStructuredFact => Boolean(fact))
        .map(formatSummaryFact)
        .filter(Boolean);
    const enrichedSummaryParts = kind === "minorfactions"
        ? appendMinorFactionAssociatedContent(parsed, summaryParts)
        : summaryParts;

    if (enrichedSummaryParts.length > 0) {
        return enrichedSummaryParts.slice(0, 4).join(" / ");
    }

    if (kind === "populations" && parsed.timeline.length > 0) {
        return `${parsed.timeline.length} population ${parsed.timeline.length === 1 ? "threshold" : "thresholds"}`;
    }

    return "";
}

export function getCodexReadablePreviewLine(
    entry: Pick<CodexEntry, "exportKind" | "descriptionLines" | "facts" | "sections">
): string {
    const structuredSummary = getCodexStructuredSummary(entry);
    if (structuredSummary) return structuredSummary;

    const parsed = parseCodexStructuredDescription(entry);
    const bodyLine = parsed.bodyLines
        .map(cleanPreviewValue)
        .find((line) => line.length > 0);
    if (bodyLine) return bodyLine;

    for (const section of parsed.sections) {
        const sectionLine = section.lines
            .map(cleanPreviewValue)
            .find((line) => line.length > 0);
        if (sectionLine) return sectionLine;

        for (const item of section.items ?? []) {
            const itemLine = item.lines
                .map(cleanPreviewValue)
                .find((line) => line.length > 0);
            if (itemLine) return itemLine;

            const fact = item.facts.find((candidate) => candidate.value.trim().length > 0);
            if (fact) return cleanPreviewValue(fact.value);
        }
    }

    const timelineItem = parsed.timeline.find((item) => item.value.trim().length > 0);
    if (timelineItem) return cleanPreviewValue(timelineItem.value);

    return "";
}
