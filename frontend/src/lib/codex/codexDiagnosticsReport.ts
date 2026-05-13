import {
    diagnoseDescriptionLine,
    type DescriptionDiagnosticKind,
    type DescriptionTokenDiagnostic,
} from "@/lib/descriptionLine/descriptionDiagnostics";
import type { CodexEntry } from "@/types/dataTypes";
import { buildEntriesByKey, buildEntriesByKindKey, type CodexReferenceIndexes } from "./codexRefs";
import {
    diagnoseCodexRelatedReferences,
    type CodexReferenceDiagnostic,
    type CodexReferenceDiagnosticKind,
} from "./codexReferenceDiagnostics";
import {
    classifyCodexReferenceDiagnostic,
    classifyDescriptionTokenDiagnostic,
    type CodexDiagnosticClassification,
} from "./codexDiagnosticClassification";

export type DescriptorDiagnosticField = "displayName" | "descriptionLine";

export type CodexDescriptorDiagnostic = {
    field: DescriptorDiagnosticField;
    line: string;
    lineIndex?: number;
    diagnostic: DescriptionTokenDiagnostic;
};

export type CodexEntryDiagnostics = {
    exportKind: string;
    entryKey: string;
    displayName: string;
    referenceDiagnostics: CodexReferenceDiagnostic[];
    descriptorDiagnostics: CodexDescriptorDiagnostic[];
};

export type DiagnosticKindCounts<K extends string> = Partial<Record<K, number>>;

export type DiagnosticSignalBucket = CodexDiagnosticClassification["bucket"];

export type CodexDiagnosticsReport = {
    entries: CodexEntryDiagnostics[];
    referenceCounts: DiagnosticKindCounts<CodexReferenceDiagnosticKind>;
    descriptorCounts: DiagnosticKindCounts<DescriptionDiagnosticKind>;
    referenceCountsByExportKind: Record<string, DiagnosticKindCounts<CodexReferenceDiagnosticKind>>;
    descriptorCountsByExportKind: Record<string, DiagnosticKindCounts<DescriptionDiagnosticKind>>;
    signalCounts: DiagnosticKindCounts<DiagnosticSignalBucket>;
    duplicateReferenceCount: number;
};

function normalizeExportKind(value: string): string {
    return value.trim().toLowerCase() || "unknown";
}

function addCount<K extends string>(counts: DiagnosticKindCounts<K>, kind: K) {
    counts[kind] = (counts[kind] ?? 0) + 1;
}

function getOrCreateKindCounts<K extends string>(
    groupedCounts: Record<string, DiagnosticKindCounts<K>>,
    exportKind: string
): DiagnosticKindCounts<K> {
    if (!groupedCounts[exportKind]) {
        groupedCounts[exportKind] = {};
    }

    return groupedCounts[exportKind];
}

function createIndexes(entries: readonly CodexEntry[]): CodexReferenceIndexes {
    return {
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
    };
}

function diagnoseEntryDescriptors(entry: CodexEntry): CodexDescriptorDiagnostic[] {
    const displayNameDiagnostics = diagnoseDescriptionLine(entry.displayName).map((diagnostic) => ({
        field: "displayName" as const,
        line: entry.displayName,
        diagnostic,
    }));

    const descriptionDiagnostics = entry.descriptionLines.flatMap((line, lineIndex) =>
        diagnoseDescriptionLine(line).map((diagnostic) => ({
            field: "descriptionLine" as const,
            line,
            lineIndex,
            diagnostic,
        }))
    );

    return [...displayNameDiagnostics, ...descriptionDiagnostics];
}

export function createCodexDiagnosticsReport(entries: readonly CodexEntry[]): CodexDiagnosticsReport {
    const indexes = createIndexes(entries);
    const referenceCounts: DiagnosticKindCounts<CodexReferenceDiagnosticKind> = {};
    const descriptorCounts: DiagnosticKindCounts<DescriptionDiagnosticKind> = {};
    const referenceCountsByExportKind: Record<string, DiagnosticKindCounts<CodexReferenceDiagnosticKind>> = {};
    const descriptorCountsByExportKind: Record<string, DiagnosticKindCounts<DescriptionDiagnosticKind>> = {};
    const signalCounts: DiagnosticKindCounts<DiagnosticSignalBucket> = {};
    let duplicateReferenceCount = 0;

    const entryReports = entries.map((entry) => {
        const exportKind = normalizeExportKind(entry.exportKind);
        const referenceDiagnostics = diagnoseCodexRelatedReferences(entry, indexes);
        const descriptorDiagnostics = diagnoseEntryDescriptors(entry);

        referenceDiagnostics.forEach((diagnostic) => {
            addCount(referenceCounts, diagnostic.kind);
            addCount(getOrCreateKindCounts(referenceCountsByExportKind, exportKind), diagnostic.kind);
            addCount(signalCounts, classifyCodexReferenceDiagnostic(diagnostic).bucket);
            if (diagnostic.isDuplicate) {
                duplicateReferenceCount += 1;
            }
        });

        descriptorDiagnostics.forEach(({ diagnostic }) => {
            addCount(descriptorCounts, diagnostic.kind);
            addCount(getOrCreateKindCounts(descriptorCountsByExportKind, exportKind), diagnostic.kind);
            addCount(signalCounts, classifyDescriptionTokenDiagnostic(diagnostic).bucket);
        });

        return {
            exportKind,
            entryKey: entry.entryKey,
            displayName: entry.displayName,
            referenceDiagnostics,
            descriptorDiagnostics,
        };
    });

    return {
        entries: entryReports,
        referenceCounts,
        descriptorCounts,
        referenceCountsByExportKind,
        descriptorCountsByExportKind,
        signalCounts,
        duplicateReferenceCount,
    };
}

function formatCounts<K extends string>(counts: DiagnosticKindCounts<K>): string[] {
    const rows = Object.entries(counts)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([kind, count]) => `- ${kind}: ${count}`);

    return rows.length > 0 ? rows : ["- none"];
}

function formatGroupedCounts<K extends string>(groupedCounts: Record<string, DiagnosticKindCounts<K>>): string[] {
    const exportKinds = Object.keys(groupedCounts).sort((left, right) => left.localeCompare(right));
    if (exportKinds.length === 0) return ["- none"];

    return exportKinds.flatMap((exportKind) => [
        `- ${exportKind}`,
        ...formatCounts(groupedCounts[exportKind]).map((line) => `  ${line}`),
    ]);
}

function formatSignalSummary(counts: DiagnosticKindCounts<DiagnosticSignalBucket>): string[] {
    return [
        `- high-signal warnings: ${counts["high-signal-warning"] ?? 0}`,
        `- token vocabulary gaps: ${counts["token-vocabulary-gap"] ?? 0}`,
        `- expected/internal noise: ${counts["expected-internal-noise"] ?? 0}`,
        `- expected style tokens: ${counts["expected-style-token"] ?? 0}`,
        `- other diagnostics: ${counts.other ?? 0}`,
    ];
}

function formatReferenceDetail(entry: CodexEntryDiagnostics, diagnostic: CodexReferenceDiagnostic): string {
    const flags = [
        diagnostic.usedRawFallback ? "raw fallback" : "",
        diagnostic.isAmbiguousRawKey ? `ambiguous: ${diagnostic.rawMatchedKinds?.join(", ")}` : "",
        diagnostic.isDuplicate ? `duplicate of #${diagnostic.duplicateOfIndex}` : "",
        diagnostic.importedKindHint ? `imported: ${diagnostic.importedKindHint}` : "",
        diagnostic.reason ? `reason: ${diagnostic.reason}` : "",
    ].filter(Boolean);
    const suffix = flags.length > 0 ? ` (${flags.join("; ")})` : "";

    return `- ${entry.exportKind}:${entry.entryKey} ref[${diagnostic.index ?? "?"}] ${diagnostic.kind} ${diagnostic.raw}${suffix}`;
}

function formatDescriptorDetail(entry: CodexEntryDiagnostics, diagnostic: CodexDescriptorDiagnostic): string {
    const token = diagnostic.diagnostic.token || diagnostic.diagnostic.raw;
    const location =
        diagnostic.field === "descriptionLine"
            ? `${diagnostic.field}[${diagnostic.lineIndex ?? "?"}]`
            : diagnostic.field;
    const hint = diagnostic.diagnostic.entityKindHint
        ? ` (entity-like: ${diagnostic.diagnostic.entityKindHint})`
        : diagnostic.diagnostic.reason
          ? ` (reason: ${diagnostic.diagnostic.reason})`
          : "";

    return `- ${entry.exportKind}:${entry.entryKey} ${location} ${diagnostic.diagnostic.kind} ${token}${hint}`;
}

export function formatCodexDiagnosticsReport(report: CodexDiagnosticsReport): string {
    const referenceDetails = report.entries.flatMap((entry) =>
        entry.referenceDiagnostics.map((diagnostic) => formatReferenceDetail(entry, diagnostic))
    );
    const descriptorDetails = report.entries.flatMap((entry) =>
        entry.descriptorDiagnostics.map((diagnostic) => formatDescriptorDetail(entry, diagnostic))
    );

    return [
        "CODEX DIAGNOSTICS REPORT",
        "========================",
        "",
        "REFERENCE SUMMARY",
        "-----------------",
        ...formatCounts(report.referenceCounts),
        `- duplicate references: ${report.duplicateReferenceCount}`,
        "",
        "DIAGNOSTIC SIGNAL SUMMARY",
        "-------------------------",
        ...formatSignalSummary(report.signalCounts),
        "",
        "REFERENCE SUMMARY BY EXPORT KIND",
        "--------------------------------",
        ...formatGroupedCounts(report.referenceCountsByExportKind),
        "",
        "DESCRIPTOR SUMMARY",
        "------------------",
        ...formatCounts(report.descriptorCounts),
        "",
        "DESCRIPTOR SUMMARY BY EXPORT KIND",
        "---------------------------------",
        ...formatGroupedCounts(report.descriptorCountsByExportKind),
        "",
        "REFERENCE DETAILS",
        "-----------------",
        ...(referenceDetails.length > 0 ? referenceDetails : ["- none"]),
        "",
        "DESCRIPTOR DETAILS",
        "------------------",
        ...(descriptorDetails.length > 0 ? descriptorDetails : ["- none"]),
    ].join("\n");
}
