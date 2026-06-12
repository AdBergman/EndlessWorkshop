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
    bonuses: new Set(["Category", "Kind"]),
    councilors: new Set(["Faction", "Role"]),
    equipment: new Set(["Type", "Slot", "Rarity", "Tier", "Access pool", "Value"]),
    heroes: new Set(["Faction", "Class"]),
    minorfactions: new Set(["Disposition", "Faction affinity", "Population", "Unit", "Trait"]),
    modifiers: new Set(["Category", "Kind", "Cost type", "Operation", "Value", "Display value"]),
    populations: new Set(["Faction", "Type", "Base food cost"]),
    statuses: new Set(["Category", "Kind", "Duration", "Stacking"]),
    traits: new Set(["Category", "Cost", "Required affinity", "Excludes"]),
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
    modifiers: ["Category", "Kind", "Cost type", "Value"],
    populations: ["Type", "Faction", "Base food cost"],
    statuses: ["Category", "Kind", "Duration"],
    traits: ["Category", "Cost", "Required affinity"],
};

function normalizeKind(kind: string | null | undefined): string {
    return (kind ?? "").trim().toLowerCase();
}

function cleanValue(value: string): string {
    const trimmed = value.trim();
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

function addSection(sections: CodexStructuredSection[], label: string, line: string) {
    const existing = sections.find((section) => section.label === label);

    if (existing) {
        existing.lines.push(line);
        return;
    }

    sections.push({ label, lines: [line] });
}

function exportedFactToStructuredFact(fact: CodexMetadataFact): CodexStructuredFact | null {
    if (!fact?.label?.trim() || !fact?.value?.trim()) return null;

    const label = fact.label.trim();
    const value = cleanValue(fact.value);
    return { label, value, sourceLine: `${label}: ${value}` };
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

function exportedItemToStructuredItem(item: CodexMetadataSectionItem): CodexStructuredSectionItem | null {
    const label = item?.label?.trim();
    if (!label) return null;

    const referenceKey = item.referenceKey?.trim() || null;
    const facts = (item.facts ?? [])
        .map(exportedFactToStructuredFact)
        .filter((fact): fact is CodexStructuredFact => fact !== null);
    const lines = (item.lines ?? [])
        .map((line) => line.trim())
        .filter(Boolean)
        .map(cleanValue);

    if (!referenceKey && facts.length === 0 && lines.length === 0) return null;

    return { label, referenceKey, facts, lines };
}

function parseExportedStructuredMetadata(entry: Pick<CodexEntry, "exportKind" | "facts" | "sections">): CodexStructuredDescription | null {
    const kind = normalizeKind(entry.exportKind);
    const facts = (entry.facts ?? [])
        .map(exportedFactToStructuredFact)
        .filter((fact): fact is CodexStructuredFact => fact !== null);

    const sections: CodexStructuredSection[] = [];
    const timeline: CodexStructuredTimelineItem[] = [];

    for (const section of entry.sections ?? []) {
        const title = section.title?.trim();
        if (!title) continue;

        const lines = (section.lines ?? [])
            .map((line) => line.trim())
            .filter(Boolean)
            .map(cleanValue);

        const isPopulationThresholdSection =
            kind === "populations" && title.toLowerCase().includes("threshold");

        if (isPopulationThresholdSection) {
            const itemTimeline = (section.items ?? [])
                .map(exportedItemToTimelineItem)
                .filter((item): item is CodexStructuredTimelineItem => item !== null);

            timeline.push(...itemTimeline);
        } else {
            const items = (section.items ?? [])
                .map(exportedItemToStructuredItem)
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
        sections,
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

        bodyLines.push(line);
    }

    return {
        facts,
        sections,
        timeline,
        bodyLines,
        hasStructuredContent: facts.length > 0 || sections.length > 0 || timeline.length > 0,
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
