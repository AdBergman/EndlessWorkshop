import { getCodexTopLevelVisibility, normalizeCodexKind } from "./codexCategoryConfig.ts";
import {
    classifyCodexReferenceDiagnostic,
    type CodexDiagnosticSeverity,
} from "./codexDiagnosticClassification.ts";
import {
    diagnoseCodexReference,
    diagnoseCodexRelatedReferences,
    type CodexReferenceDiagnostic,
} from "./codexReferenceDiagnostics.ts";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    type CodexReferenceIndexes,
} from "./codexRefs.ts";
import type { CodexEntry } from "../../types/dataTypes.ts";

export type CodexReferenceDiagnosticSourceField = "referenceKeys" | "publicContextKeys";

export type CodexReferenceVisibilityClass =
    | "resolved-public"
    | "resolved-hidden-support"
    | "resolved-local-only"
    | "likely-public-target"
    | "likely-hidden-support-target"
    | "likely-local-only-target"
    | "imported-domain-target"
    | "mechanical-or-internal"
    | "unknown";

export type CodexReferenceDiagnosticReportItem = {
    sourceCategory: string;
    sourceEntryKey: string;
    sourceDisplayName: string;
    sourceField: CodexReferenceDiagnosticSourceField;
    sourceIndex: number;
    referencedKey: string;
    targetPrefix: string;
    diagnosticKind: CodexReferenceDiagnostic["kind"];
    severity: CodexDiagnosticSeverity;
    classification: string;
    visibilityClass: CodexReferenceVisibilityClass;
    resolvedTargetCategory?: string;
    resolvedTargetEntryKey?: string;
    resolvedTargetDisplayName?: string;
};

export type CodexReferenceDiagnosticReport = {
    totalReferences: number;
    totalUnresolved: number;
    items: CodexReferenceDiagnosticReportItem[];
};

const HIDDEN_SUPPORT_PREFIXES = [
    "Modifier",
    "ActionCostModifier",
    "FactionTrait_ConstructibleCostModifierDefinition",
];

const MECHANICAL_OR_INTERNAL_PREFIXES = [
    "Effect",
    "Tag",
    "UnitAbility",
    "UnitActionAbility",
];

const PUBLIC_TARGET_PREFIXES = [
    "Ability",
    "District",
    "DistrictImprovement",
    "Equipment",
    "Faction",
    "Hero",
    "MinorFaction",
    "Population",
    "Resource",
    "Status",
    "Technology",
    "Trait",
    "Unit",
];

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function displayName(entry: CodexEntry): string {
    return normalize(entry.displayName) || normalize(entry.entryKey) || "(unnamed)";
}

function targetPrefix(referenceKey: string): string {
    const raw = normalize(referenceKey);
    if (!raw) return "";

    const codexIdentityMatch = raw.match(/^codex:([^:%]+)%3A/i);
    if (codexIdentityMatch?.[1]) return codexIdentityMatch[1];

    return raw.split(/[_:]/)[0] ?? raw;
}

function resolvedVisibilityClass(entry: CodexEntry): CodexReferenceVisibilityClass {
    const visibility = getCodexTopLevelVisibility(entry.exportKind);
    if (visibility === "hidden") return "resolved-hidden-support";
    if (visibility === "localOnly") return "resolved-local-only";
    return "resolved-public";
}

function unresolvedVisibilityClass(diagnostic: CodexReferenceDiagnostic): CodexReferenceVisibilityClass {
    const identityKind = diagnostic.identity?.exportKind;
    if (identityKind) {
        const visibility = getCodexTopLevelVisibility(identityKind);
        if (visibility === "hidden") return "likely-hidden-support-target";
        if (visibility === "localOnly") return "likely-local-only-target";
        return "likely-public-target";
    }

    const prefix = targetPrefix(diagnostic.raw);

    if (diagnostic.kind === "unresolved-imported-domain-ref") {
        return "imported-domain-target";
    }

    if (HIDDEN_SUPPORT_PREFIXES.some((candidate) => prefix === candidate || diagnostic.raw.startsWith(candidate))) {
        return "likely-hidden-support-target";
    }

    if (MECHANICAL_OR_INTERNAL_PREFIXES.some((candidate) => prefix === candidate || diagnostic.raw.startsWith(candidate))) {
        return "mechanical-or-internal";
    }

    if (PUBLIC_TARGET_PREFIXES.includes(prefix)) {
        return "likely-public-target";
    }

    return "unknown";
}

function visibilityClass(diagnostic: CodexReferenceDiagnostic): CodexReferenceVisibilityClass {
    return diagnostic.resolvedEntry
        ? resolvedVisibilityClass(diagnostic.resolvedEntry)
        : unresolvedVisibilityClass(diagnostic);
}

function buildIndexes(entries: readonly CodexEntry[]): CodexReferenceIndexes {
    return {
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
    };
}

function diagnoseEntryField(
    entry: CodexEntry,
    field: CodexReferenceDiagnosticSourceField,
    indexes: CodexReferenceIndexes
): CodexReferenceDiagnostic[] {
    if (field === "referenceKeys") {
        return diagnoseCodexRelatedReferences(entry, indexes);
    }

    return (entry.publicContextKeys ?? [])
        .map((reference, index) => diagnoseCodexReference(reference, indexes, index));
}

function toReportItem(
    entry: CodexEntry,
    field: CodexReferenceDiagnosticSourceField,
    diagnostic: CodexReferenceDiagnostic
): CodexReferenceDiagnosticReportItem {
    const classification = classifyCodexReferenceDiagnostic(diagnostic);
    const resolvedTarget = diagnostic.resolvedEntry;

    return {
        sourceCategory: normalizeCodexKind(entry.exportKind),
        sourceEntryKey: normalize(entry.entryKey),
        sourceDisplayName: displayName(entry),
        sourceField: field,
        sourceIndex: diagnostic.index ?? 0,
        referencedKey: diagnostic.raw,
        targetPrefix: targetPrefix(diagnostic.raw),
        diagnosticKind: diagnostic.kind,
        severity: classification.severity,
        classification: classification.label,
        visibilityClass: visibilityClass(diagnostic),
        resolvedTargetCategory: resolvedTarget ? normalizeCodexKind(resolvedTarget.exportKind) : undefined,
        resolvedTargetEntryKey: resolvedTarget ? normalize(resolvedTarget.entryKey) : undefined,
        resolvedTargetDisplayName: resolvedTarget ? displayName(resolvedTarget) : undefined,
    };
}

function compareReportItems(
    left: CodexReferenceDiagnosticReportItem,
    right: CodexReferenceDiagnosticReportItem
): number {
    return left.sourceCategory.localeCompare(right.sourceCategory) ||
        left.sourceEntryKey.localeCompare(right.sourceEntryKey) ||
        left.sourceField.localeCompare(right.sourceField) ||
        left.sourceIndex - right.sourceIndex ||
        left.referencedKey.localeCompare(right.referencedKey);
}

export function createCodexReferenceDiagnosticReport(
    entries: readonly CodexEntry[]
): CodexReferenceDiagnosticReport {
    const indexes = buildIndexes(entries);
    const fields: CodexReferenceDiagnosticSourceField[] = ["publicContextKeys", "referenceKeys"];
    const allItems: CodexReferenceDiagnosticReportItem[] = [];
    let totalReferences = 0;

    for (const entry of entries) {
        for (const field of fields) {
            const diagnostics = diagnoseEntryField(entry, field, indexes);
            totalReferences += diagnostics.length;
            for (const diagnostic of diagnostics) {
                if (diagnostic.kind === "resolved-typed-ref" || diagnostic.kind === "raw-fallback-ref") {
                    continue;
                }

                allItems.push(toReportItem(entry, field, diagnostic));
            }
        }
    }

    const items = allItems.sort(compareReportItems);
    return {
        totalReferences,
        totalUnresolved: items.length,
        items,
    };
}

export function formatCodexReferenceDiagnosticReport(
    report: CodexReferenceDiagnosticReport,
    options: { limit?: number } = {}
): string {
    const limit = options.limit ?? report.items.length;
    const visibleItems = report.items.slice(0, limit);

    return [
        "# Codex Reference Diagnostics",
        "",
        "Status: generated engineering diagnostic",
        "",
        "## Summary",
        "",
        `- total references checked: ${report.totalReferences}`,
        `- unresolved or malformed references: ${report.totalUnresolved}`,
        "",
        "## Findings",
        "",
        "| Source category | Source entry | Field | Missing/reference key | Target prefix | Kind | Visibility class | Classification |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
        ...visibleItems.map((item) =>
            `| ${item.sourceCategory} | ${item.sourceDisplayName} (${item.sourceEntryKey}) | ${item.sourceField}[${item.sourceIndex}] | ${item.referencedKey} | ${item.targetPrefix || "-"} | ${item.diagnosticKind} | ${item.visibilityClass} | ${item.classification} |`
        ),
        report.items.length > visibleItems.length
            ? `\n_${report.items.length - visibleItems.length} additional finding(s) omitted by limit._`
            : "",
    ].filter((line) => line !== "").join("\n");
}
