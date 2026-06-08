import {
    formatCodexMajorFactionLabel,
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexStructuredFact = {
    label: string;
    value: string;
    sourceLine: string;
};

export type CodexStructuredSection = {
    label: string;
    lines: string[];
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
    councilors: new Set(["Faction", "Role"]),
    equipment: new Set(["Type", "Slot", "Rarity", "Tier", "Access pool", "Value"]),
    heroes: new Set(["Faction", "Class"]),
    minorfactions: new Set(["Disposition", "Faction affinity", "Population", "Unit", "Trait"]),
    populations: new Set(["Faction", "Type", "Base food cost"]),
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
    councilors: ["Faction", "Role"],
    equipment: ["Type", "Slot", "Rarity", "Tier"],
    heroes: ["Faction", "Class"],
    minorfactions: ["Disposition", "Faction affinity", "Population", "Unit"],
    populations: ["Type", "Faction", "Base food cost"],
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

    if (/^(Tier|Cost|Value|Base food cost)$/i.test(fact.label)) {
        return `${fact.label} ${value}`;
    }

    return value;
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

export function parseCodexStructuredDescription(entry: Pick<CodexEntry, "exportKind" | "descriptionLines">): CodexStructuredDescription {
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

export function getCodexStructuredSummary(entry: Pick<CodexEntry, "exportKind" | "descriptionLines">): string {
    const kind = normalizeKind(entry.exportKind);
    const parsed = parseCodexStructuredDescription(entry);
    const preferredLabels = SUMMARY_FACT_LABELS_BY_KIND[kind] ?? [];
    const summaryParts = preferredLabels
        .map((label) => parsed.facts.find((fact) => fact.label === label))
        .filter((fact): fact is CodexStructuredFact => Boolean(fact))
        .map(formatSummaryFact)
        .filter(Boolean);

    if (summaryParts.length > 0) {
        return summaryParts.slice(0, 4).join(" / ");
    }

    if (kind === "populations" && parsed.timeline.length > 0) {
        return `${parsed.timeline.length} population ${parsed.timeline.length === 1 ? "threshold" : "thresholds"}`;
    }

    return "";
}
