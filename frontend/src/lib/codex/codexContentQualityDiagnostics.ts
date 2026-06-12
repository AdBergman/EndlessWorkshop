import type { CodexEntry, CodexMetadataFact, CodexMetadataSection, CodexMetadataSectionItem } from "../../types/dataTypes";

export type CodexContentQualitySeverity = "critical" | "high" | "medium" | "low";
export type CodexContentQualityOwner = "EWShop" | "Exporter" | "Both";

export type CodexContentQualityFindingKind =
    | "duplicate-fact-line"
    | "formula-like-text"
    | "metadata-gap"
    | "missing-player-context"
    | "no-op-effect"
    | "placeholder-text"
    | "raw-internal-label"
    | "raw-internal-text";

export type CodexContentQualitySurface =
    | "displayName"
    | "descriptionLine"
    | "factLabel"
    | "factValue"
    | "sectionTitle"
    | "sectionLine"
    | "sectionItemLabel"
    | "sectionItemFactLabel"
    | "sectionItemFactValue"
    | "sectionItemLine";

export type CodexContentQualityFinding = {
    exportKind: string;
    entryKey: string;
    displayName: string;
    kind: CodexContentQualityFindingKind;
    severity: CodexContentQualitySeverity;
    owner: CodexContentQualityOwner;
    surface: CodexContentQualitySurface | "entry";
    path: string;
    value: string;
    reason: string;
    recommendation: string;
};

export type CodexContentQualityReport = {
    entryCount: number;
    findingCount: number;
    findings: CodexContentQualityFinding[];
    countsByKind: Partial<Record<CodexContentQualityFindingKind, number>>;
    countsByOwner: Partial<Record<CodexContentQualityOwner, number>>;
    countsBySeverity: Partial<Record<CodexContentQualitySeverity, number>>;
    countsByExportKind: Record<string, number>;
};

type TextCandidate = {
    surface: CodexContentQualitySurface;
    path: string;
    value: string;
};

type RuleConfig = {
    placeholderPatterns: RegExp[];
    rawTextPatterns: RegExp[];
    formulaTextPatterns: RegExp[];
    rawLabels: Set<string>;
    classificationLabels: Set<string>;
};

const DEFAULT_RULES: RuleConfig = {
    placeholderPatterns: [
        /(^|[^A-Za-z0-9])TBD($|[^A-Za-z0-9])/i,
        /(^|[^A-Za-z0-9])TODO($|[^A-Za-z0-9])/i,
        /\bplaceholder\b/i,
        /\bmissing\s+(?:copy|description|public\s+text|text)\b/i,
        /(^|[^A-Za-z0-9])Specific\d{1,3}($|[^A-Za-z0-9])/i,
    ],
    rawTextPatterns: [
        /\bUnitClass_[A-Za-z0-9_]+\b/,
        /\bActionType[A-Za-z0-9_]+\b/,
        /\bEffect_[A-Za-z0-9_]+\b/,
        /\bDescriptor[A-Za-z0-9_]*\b/,
        /\b[A-Za-z]+CostModifier_[A-Za-z0-9_]+\b/,
        /\b[A-Za-z]+Definition_[A-Za-z0-9_]+\b/,
        /%Effect_[A-Za-z0-9_]+/,
        /^[A-Za-z]+_[A-Za-z0-9_]+$/,
    ],
    formulaTextPatterns: [
        /^[*][0-9.]+\s+/,
        /%Tiles\b/,
        /%Effect_[A-Za-z0-9_]+/,
        /\bon\s+%[A-Za-z0-9_]+\b/i,
    ],
    rawLabels: new Set([
        "display value",
        "modifier definition",
        "operation",
        "reference key",
        "target scope",
        "value type",
    ]),
    classificationLabels: new Set([
        "category",
        "chapter",
        "class",
        "disposition",
        "era",
        "faction",
        "kind",
        "mandatory",
        "quadrant",
        "rarity",
        "role",
        "slot",
        "tier",
        "type",
        "ui category",
    ]),
};

const CATEGORY_RULES: Partial<Record<string, Partial<RuleConfig>>> = {};

function normalizeExportKind(value: string | null | undefined): string {
    return value?.trim().toLowerCase() || "unknown";
}

function normalizeComparable(value: string): string {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function addCount<K extends string>(counts: Partial<Record<K, number>>, key: K) {
    counts[key] = (counts[key] ?? 0) + 1;
}

function rulesForKind(exportKind: string): RuleConfig {
    const categoryRules = CATEGORY_RULES[exportKind] ?? {};

    return {
        placeholderPatterns: categoryRules.placeholderPatterns ?? DEFAULT_RULES.placeholderPatterns,
        rawTextPatterns: categoryRules.rawTextPatterns ?? DEFAULT_RULES.rawTextPatterns,
        formulaTextPatterns: categoryRules.formulaTextPatterns ?? DEFAULT_RULES.formulaTextPatterns,
        rawLabels: categoryRules.rawLabels ?? DEFAULT_RULES.rawLabels,
        classificationLabels: categoryRules.classificationLabels ?? DEFAULT_RULES.classificationLabels,
    };
}

function splitPrefixedLine(line: string): { label: string; value: string } | null {
    const match = line.match(/^([^:]{2,48}):\s*(.+)$/);
    if (!match) return null;

    return {
        label: match[1].trim(),
        value: match[2].trim(),
    };
}

function factKey(label: string, value: string): string {
    return `${normalizeComparable(label)}=${normalizeComparable(value)}`;
}

function createFinding(
    entry: CodexEntry,
    kind: CodexContentQualityFindingKind,
    severity: CodexContentQualitySeverity,
    owner: CodexContentQualityOwner,
    candidate: Pick<TextCandidate, "surface" | "path" | "value"> | { surface: "entry"; path: string; value: string },
    reason: string,
    recommendation: string
): CodexContentQualityFinding {
    return {
        exportKind: normalizeExportKind(entry.exportKind),
        entryKey: entry.entryKey,
        displayName: entry.displayName,
        kind,
        severity,
        owner,
        surface: candidate.surface,
        path: candidate.path,
        value: candidate.value,
        reason,
        recommendation,
    };
}

function collectFacts(entry: CodexEntry): CodexMetadataFact[] {
    return entry.facts ?? [];
}

function collectTextCandidates(entry: CodexEntry): TextCandidate[] {
    const candidates: TextCandidate[] = [
        { surface: "displayName", path: "displayName", value: entry.displayName },
    ];

    entry.descriptionLines.forEach((line, index) => {
        candidates.push({ surface: "descriptionLine", path: `descriptionLines[${index}]`, value: line });
    });

    collectFacts(entry).forEach((fact, index) => {
        candidates.push({ surface: "factLabel", path: `facts[${index}].label`, value: fact.label });
        candidates.push({ surface: "factValue", path: `facts[${index}].value`, value: fact.value });
    });

    (entry.sections ?? []).forEach((section, sectionIndex) => {
        candidates.push({ surface: "sectionTitle", path: `sections[${sectionIndex}].title`, value: section.title });
        (section.lines ?? []).forEach((line, lineIndex) => {
            candidates.push({
                surface: "sectionLine",
                path: `sections[${sectionIndex}].lines[${lineIndex}]`,
                value: line,
            });
        });
        (section.items ?? []).forEach((item, itemIndex) => {
            candidates.push({
                surface: "sectionItemLabel",
                path: `sections[${sectionIndex}].items[${itemIndex}].label`,
                value: item.label,
            });
            (item.facts ?? []).forEach((fact, factIndex) => {
                candidates.push({
                    surface: "sectionItemFactLabel",
                    path: `sections[${sectionIndex}].items[${itemIndex}].facts[${factIndex}].label`,
                    value: fact.label,
                });
                candidates.push({
                    surface: "sectionItemFactValue",
                    path: `sections[${sectionIndex}].items[${itemIndex}].facts[${factIndex}].value`,
                    value: fact.value,
                });
            });
            (item.lines ?? []).forEach((line, lineIndex) => {
                candidates.push({
                    surface: "sectionItemLine",
                    path: `sections[${sectionIndex}].items[${itemIndex}].lines[${lineIndex}]`,
                    value: line,
                });
            });
        });
    });

    return candidates.filter((candidate) => candidate.value.trim().length > 0);
}

function hasSectionContent(sections: CodexMetadataSection[] | undefined): boolean {
    return (sections ?? []).some((section) =>
        section.title.trim().length > 0 ||
        (section.lines ?? []).some((line) => line.trim().length > 0) ||
        (section.items ?? []).some(hasSectionItemContent)
    );
}

function hasSectionItemContent(item: CodexMetadataSectionItem): boolean {
    return item.label.trim().length > 0 ||
        (item.lines ?? []).some((line) => line.trim().length > 0) ||
        (item.facts ?? []).some((fact) => fact.label.trim().length > 0 || fact.value.trim().length > 0);
}

function isClassificationOnly(entry: CodexEntry, rules: RuleConfig): boolean {
    const facts = collectFacts(entry);
    if (facts.length === 0) return false;

    return facts.every((fact) => rules.classificationLabels.has(normalizeComparable(fact.label)));
}

function diagnoseTextCandidate(
    entry: CodexEntry,
    candidate: TextCandidate,
    rules: RuleConfig
): CodexContentQualityFinding[] {
    const value = candidate.value.trim();
    const label = normalizeComparable(value);
    const findings: CodexContentQualityFinding[] = [];

    if (
        (candidate.surface === "factLabel" || candidate.surface === "sectionItemFactLabel") &&
        rules.rawLabels.has(label)
    ) {
        findings.push(createFinding(
            entry,
            "raw-internal-label",
            "high",
            "Both",
            candidate,
            "A raw mechanics/database label is visible in public Codex content.",
            "EWShop can hide or relabel safe cases; exporter should prefer player-facing labels."
        ));
    }

    if (rules.placeholderPatterns.some((pattern) => pattern.test(value))) {
        findings.push(createFinding(
            entry,
            "placeholder-text",
            "critical",
            "Exporter",
            candidate,
            "Placeholder or generated identifier text appears in a player-facing field.",
            "Replace with public copy or suppress the entry until public text exists."
        ));
    }

    if (rules.rawTextPatterns.some((pattern) => pattern.test(value))) {
        findings.push(createFinding(
            entry,
            "raw-internal-text",
            "high",
            "Exporter",
            candidate,
            "Internal key-like text appears where players expect readable content.",
            "Export a public display label, effect sentence, or typed reference instead of the raw key."
        ));
    }

    if (/^[+-]0(?:\.0+)?(?=$|[\s%])/.test(value)) {
        findings.push(createFinding(
            entry,
            "no-op-effect",
            "medium",
            "Both",
            candidate,
            "A zero-value effect is exported as if it were a benefit or cost.",
            "EWShop can suppress exact no-op lines; exporter should avoid emitting them as public effects."
        ));
    }

    if (rules.formulaTextPatterns.some((pattern) => pattern.test(value))) {
        findings.push(createFinding(
            entry,
            "formula-like-text",
            "medium",
            "Exporter",
            candidate,
            "Formula-style text is visible without player-facing explanation.",
            "Export a readable effect sentence or add metadata that identifies the affected stat/resource."
        ));
    }

    return findings;
}

function diagnoseDuplicateFactLines(entry: CodexEntry): CodexContentQualityFinding[] {
    const factKeys = new Set(collectFacts(entry).map((fact) => factKey(fact.label, fact.value)));

    return entry.descriptionLines.flatMap((line, index) => {
        const prefixedLine = splitPrefixedLine(line.trim());
        if (!prefixedLine || !factKeys.has(factKey(prefixedLine.label, prefixedLine.value))) {
            return [];
        }

        return createFinding(
            entry,
            "duplicate-fact-line",
            "medium",
            "EWShop",
            { surface: "descriptionLine", path: `descriptionLines[${index}]`, value: line },
            "A description line repeats a fact that is already available as structured metadata.",
            "Hide exact duplicate fact-prefixed lines in EWShop detail/summary rendering."
        );
    });
}

function diagnoseMetadataGaps(entry: CodexEntry): CodexContentQualityFinding[] {
    if ((entry.facts ?? []).length > 0) return [];

    const prefixedLines = entry.descriptionLines
        .map((line, index) => ({ line, index, parsed: splitPrefixedLine(line.trim()) }))
        .filter((line): line is { line: string; index: number; parsed: { label: string; value: string } } =>
            line.parsed !== null
        );

    if (prefixedLines.length < 2) return [];

    return [
        createFinding(
            entry,
            "metadata-gap",
            "high",
            "Exporter",
            { surface: "entry", path: "descriptionLines", value: `${prefixedLines.length} prefixed lines` },
            "The entry exposes fact-shaped text but does not provide structured facts.",
            "Export these fields as Codex facts so EWShop does not need text-prefix parsing."
        ),
    ];
}

function diagnoseMissingContext(entry: CodexEntry, rules: RuleConfig): CodexContentQualityFinding[] {
    const hasDescription = entry.descriptionLines.some((line) => line.trim().length > 0);
    const hasFacts = (entry.facts ?? []).some((fact) => fact.label.trim().length > 0 || fact.value.trim().length > 0);
    const hasSections = hasSectionContent(entry.sections);

    if (!hasDescription && !hasFacts && !hasSections) {
        return [
            createFinding(
                entry,
                "missing-player-context",
                "critical",
                "Exporter",
                { surface: "entry", path: "entry", value: "empty entry" },
                "The entry has no public facts, sections, or description.",
                "Add player-facing description or structured metadata before treating this as complete Codex content."
            ),
        ];
    }

    if (!hasDescription && !hasSections && isClassificationOnly(entry, rules)) {
        return [
            createFinding(
                entry,
                "missing-player-context",
                "high",
                "Exporter",
                { surface: "entry", path: "facts", value: "classification facts only" },
                "The entry only has classification facts, not gameplay impact or source context.",
                "Add effects, unlocks, requirements, source, or strategic summary metadata."
            ),
        ];
    }

    return [];
}

function diagnoseEntry(entry: CodexEntry): CodexContentQualityFinding[] {
    const exportKind = normalizeExportKind(entry.exportKind);
    const rules = rulesForKind(exportKind);

    return [
        ...collectTextCandidates(entry).flatMap((candidate) => diagnoseTextCandidate(entry, candidate, rules)),
        ...diagnoseDuplicateFactLines(entry),
        ...diagnoseMetadataGaps(entry),
        ...diagnoseMissingContext(entry, rules),
    ];
}

function sortFindings(findings: CodexContentQualityFinding[]): CodexContentQualityFinding[] {
    const severityRank: Record<CodexContentQualitySeverity, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };

    return [...findings].sort((left, right) =>
        severityRank[left.severity] - severityRank[right.severity] ||
        left.exportKind.localeCompare(right.exportKind) ||
        left.entryKey.localeCompare(right.entryKey) ||
        left.path.localeCompare(right.path) ||
        left.kind.localeCompare(right.kind)
    );
}

export function createCodexContentQualityReport(entries: readonly CodexEntry[]): CodexContentQualityReport {
    const findings = sortFindings(entries.flatMap(diagnoseEntry));
    const countsByKind: Partial<Record<CodexContentQualityFindingKind, number>> = {};
    const countsByOwner: Partial<Record<CodexContentQualityOwner, number>> = {};
    const countsBySeverity: Partial<Record<CodexContentQualitySeverity, number>> = {};
    const countsByExportKind: Record<string, number> = {};

    findings.forEach((finding) => {
        addCount(countsByKind, finding.kind);
        addCount(countsByOwner, finding.owner);
        addCount(countsBySeverity, finding.severity);
        countsByExportKind[finding.exportKind] = (countsByExportKind[finding.exportKind] ?? 0) + 1;
    });

    return {
        entryCount: entries.length,
        findingCount: findings.length,
        findings,
        countsByKind,
        countsByOwner,
        countsBySeverity,
        countsByExportKind,
    };
}

function formatCounts(counts: Record<string, number> | Partial<Record<string, number>>): string[] {
    const rows = Object.entries(counts)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, count]) => `- ${key}: ${count}`);

    return rows.length > 0 ? rows : ["- none"];
}

function formatFinding(finding: CodexContentQualityFinding): string {
    return [
        `- [${finding.severity}] ${finding.owner} ${finding.exportKind}:${finding.entryKey}`,
        `${finding.kind}`,
        `${finding.path}`,
        JSON.stringify(finding.value),
        `reason: ${finding.reason}`,
        `next: ${finding.recommendation}`,
    ].join(" | ");
}

function representativeFindings(
    report: CodexContentQualityReport,
    owners: CodexContentQualityOwner[],
    limit: number
): CodexContentQualityFinding[] {
    const seen = new Set<string>();
    const findings: CodexContentQualityFinding[] = [];

    for (const finding of report.findings) {
        if (!owners.includes(finding.owner)) continue;

        const key = `${finding.owner}:${finding.kind}:${finding.exportKind}`;
        if (seen.has(key)) continue;

        seen.add(key);
        findings.push(finding);
        if (findings.length >= limit) break;
    }

    return findings;
}

export function formatCodexContentQualityReport(
    report: CodexContentQualityReport,
    options: { detailLimit?: number } = {}
): string {
    const detailLimit = options.detailLimit ?? 200;
    const ewshopCandidates = representativeFindings(report, ["EWShop", "Both"], 40);
    const exporterCandidates = representativeFindings(report, ["Exporter", "Both"], 40);

    return [
        "CODEX CONTENT QUALITY DIAGNOSTIC",
        "================================",
        "",
        `entries scanned: ${report.entryCount}`,
        `findings: ${report.findingCount}`,
        "",
        "SUMMARY BY SEVERITY",
        "-------------------",
        ...formatCounts(report.countsBySeverity),
        "",
        "SUMMARY BY OWNER",
        "----------------",
        ...formatCounts(report.countsByOwner),
        "",
        "SUMMARY BY ISSUE TYPE",
        "---------------------",
        ...formatCounts(report.countsByKind),
        "",
        "SUMMARY BY CATEGORY",
        "-------------------",
        ...formatCounts(report.countsByExportKind),
        "",
        "TOP EWSHOP CANDIDATES",
        "---------------------",
        ...(ewshopCandidates.length > 0 ? ewshopCandidates.map(formatFinding) : ["- none"]),
        "",
        "TOP EXPORTER / EDITORIAL CANDIDATES",
        "------------------------------------",
        ...(exporterCandidates.length > 0 ? exporterCandidates.map(formatFinding) : ["- none"]),
        "",
        `DETAILS (FIRST ${detailLimit})`,
        "-------------------",
        ...(report.findings.length > 0 ? report.findings.slice(0, detailLimit).map(formatFinding) : ["- none"]),
    ].join("\n");
}
