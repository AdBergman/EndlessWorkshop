import {
    getCodexTopLevelVisibility,
    normalizeCodexKind,
    type CodexTopLevelVisibility,
} from "./codexCategoryConfig.ts";
import {
    classifyCodexReferenceDiagnostic,
    type CodexDiagnosticSeverity,
} from "./codexDiagnosticClassification.ts";
import {
    diagnoseCodexReference,
    diagnoseCodexRelatedReferences,
    type ImportedDomainKind,
    type CodexReferenceDiagnostic,
} from "./codexReferenceDiagnostics.ts";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    type CodexReferenceIndexes,
} from "./codexRefs.ts";
import type { CodexEntry } from "../../types/dataTypes.ts";

export type CodexReferenceDiagnosticSourceField = "referenceKeys" | "publicContextKeys";

export type CodexDiagnosticRootCauseClass =
    | "EWShop frontend/projection"
    | "EWShop backend/import"
    | "relationship/reference policy"
    | "expected thin/internal data"
    | "proven exporter/source gap"
    | "unresolved pending further evidence";

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
    sourceVisibility: CodexTopLevelVisibility;
    sourceEntryKey: string;
    sourceDisplayName: string;
    sourceField: CodexReferenceDiagnosticSourceField;
    sourceIndex: number;
    referencedKey: string;
    targetPrefix: string;
    diagnosticKind: CodexReferenceDiagnostic["kind"];
    importedDomainKindHint?: ImportedDomainKind;
    severity: CodexDiagnosticSeverity;
    classification: string;
    rootCauseClass: CodexDiagnosticRootCauseClass;
    visibilityClass: CodexReferenceVisibilityClass;
    isDuplicateAcrossSourceFields: boolean;
    resolvedTargetCategory?: string;
    resolvedTargetEntryKey?: string;
    resolvedTargetDisplayName?: string;
};

export type CodexReferencePolicyFindingKind =
    | "public-to-hidden-support-target"
    | "public-to-local-only-target"
    | "public-raw-fallback-reference";

export type CodexReferencePolicyReportItem = {
    findingKind: CodexReferencePolicyFindingKind;
    sourceCategory: string;
    sourceVisibility: CodexTopLevelVisibility;
    sourceEntryKey: string;
    sourceDisplayName: string;
    sourceField: CodexReferenceDiagnosticSourceField;
    sourceIndex: number;
    referencedKey: string;
    targetPrefix: string;
    resolvedTargetCategory: string;
    resolvedTargetVisibility: CodexTopLevelVisibility;
    resolvedTargetEntryKey: string;
    resolvedTargetDisplayName: string;
    diagnosticKind: CodexReferenceDiagnostic["kind"];
    rootCauseClass: CodexDiagnosticRootCauseClass;
};

export type CodexDuplicateIdentitySeverity = "review" | "info";

export type CodexDuplicateIdentityGroup = {
    sourceCategory: string;
    sourceVisibility: CodexTopLevelVisibility;
    displayName: string;
    entryCount: number;
    entryKeys: string[];
    severity: CodexDuplicateIdentitySeverity;
    rootCauseClass: CodexDiagnosticRootCauseClass;
    classification: string;
};

export type CodexThinRecordItem = {
    sourceCategory: string;
    sourceVisibility: CodexTopLevelVisibility;
    sourceEntryKey: string;
    sourceDisplayName: string;
    rootCauseClass: CodexDiagnosticRootCauseClass;
    classification: string;
};

export type CodexReferenceCategorySummary = {
    sourceCategory: string;
    sourceVisibility: CodexTopLevelVisibility;
    entryCount: number;
    referenceCount: number;
    unresolvedCount: number;
    uniqueUnresolvedRelationshipCount: number;
    policyFindingCount: number;
    rawFallbackReferenceCount: number;
    duplicateIdentityGroupCount: number;
    thinRecordCount: number;
};

export type CodexReferenceDiagnosticReport = {
    totalReferences: number;
    totalUnresolved: number;
    totalUniqueUnresolvedRelationships: number;
    totalPublicSourceUnresolved: number;
    totalPublicSourceUniqueUnresolvedRelationships: number;
    totalRelationshipPolicyFindings: number;
    totalDuplicateIdentityGroups: number;
    totalPublicDuplicateIdentityGroups: number;
    totalThinPublicRecords: number;
    categorySummaries: CodexReferenceCategorySummary[];
    items: CodexReferenceDiagnosticReportItem[];
    relationshipPolicyItems: CodexReferencePolicyReportItem[];
    duplicateIdentityGroups: CodexDuplicateIdentityGroup[];
    thinRecordItems: CodexThinRecordItem[];
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

const MECHANICAL_OR_INTERNAL_PATTERNS = [
    /(^|_)Effect[_:]/i,
    /^ConstructibleFamily[_:]/i,
    /^Declaration_FactionQuest[_:]/i,
    /^TechnologyEra[_:]/i,
];

const PUBLIC_TARGET_PREFIXES = [
    "Ability",
    "Councilor",
    "CouncilorEffect",
    "DiplomaticTreaty",
    "District",
    "DistrictImprovement",
    "Equipment",
    "Faction",
    "Hero",
    "MinorFaction",
    "NaturalWonder",
    "PartnerEffect",
    "Population",
    "ProtectorateTrait",
    "Resource",
    "Status",
    "Technology",
    "Trait",
    "Unit",
    "VictoryCondition",
    "VictoryPath",
];

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function displayName(entry: CodexEntry): string {
    return normalize(entry.displayName) || normalize(entry.entryKey) || "(unnamed)";
}

function normalizedDisplayName(entry: CodexEntry): string {
    return displayName(entry).replace(/\s+/g, " ").trim().toLowerCase();
}

function targetPrefix(referenceKey: string): string {
    const raw = normalize(referenceKey);
    if (!raw) return "";

    const codexIdentityMatch = raw.match(/^codex:([^:%]+)%3A/i);
    if (codexIdentityMatch?.[1]) return codexIdentityMatch[1];

    return raw.split(/[_:]/)[0] ?? raw;
}

function isMechanicalOrInternalReference(referenceKey: string): boolean {
    const raw = normalize(referenceKey);
    const prefix = targetPrefix(raw);

    return MECHANICAL_OR_INTERNAL_PREFIXES.some((candidate) => prefix === candidate || raw.startsWith(candidate)) ||
        MECHANICAL_OR_INTERNAL_PATTERNS.some((pattern) => pattern.test(raw));
}

function resolvedVisibilityClass(entry: CodexEntry): CodexReferenceVisibilityClass {
    const visibility = getCodexTopLevelVisibility(entry.exportKind);
    if (visibility === "hidden") return "resolved-hidden-support";
    if (visibility === "localOnly") return "resolved-local-only";
    return "resolved-public";
}

function sourceVisibility(entry: CodexEntry): CodexTopLevelVisibility {
    return getCodexTopLevelVisibility(entry.exportKind);
}

// Quest imported-domain refs are policy noise only while Quests stay hidden and route-owned.
function isQuestRouteOwnedPolicyActive(): boolean {
    return getCodexTopLevelVisibility("quests") === "hidden";
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

    if (HIDDEN_SUPPORT_PREFIXES.some((candidate) => prefix === candidate || diagnostic.raw.startsWith(candidate))) {
        return "likely-hidden-support-target";
    }

    if (isMechanicalOrInternalReference(diagnostic.raw)) {
        return "mechanical-or-internal";
    }

    if (diagnostic.kind === "unresolved-imported-domain-ref") {
        return "imported-domain-target";
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

function rootCauseForUnresolvedDiagnostic(
    entry: CodexEntry,
    diagnostic: CodexReferenceDiagnostic
): CodexDiagnosticRootCauseClass {
    if (sourceVisibility(entry) === "hidden") {
        return "expected thin/internal data";
    }

    const targetVisibility = visibilityClass(diagnostic);
    if (targetVisibility === "mechanical-or-internal" || targetVisibility === "likely-hidden-support-target") {
        return "expected thin/internal data";
    }

    if (targetVisibility === "likely-local-only-target") {
        return "relationship/reference policy";
    }

    if (
        diagnostic.kind === "unresolved-imported-domain-ref" &&
        diagnostic.importedKindHint === "quest" &&
        isQuestRouteOwnedPolicyActive()
    ) {
        return "relationship/reference policy";
    }

    return "unresolved pending further evidence";
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
        sourceVisibility: sourceVisibility(entry),
        sourceEntryKey: normalize(entry.entryKey),
        sourceDisplayName: displayName(entry),
        sourceField: field,
        sourceIndex: diagnostic.index ?? 0,
        referencedKey: diagnostic.raw,
        targetPrefix: targetPrefix(diagnostic.raw),
        diagnosticKind: diagnostic.kind,
        importedDomainKindHint: diagnostic.importedKindHint,
        severity: classification.severity,
        classification: classification.label,
        rootCauseClass: rootCauseForUnresolvedDiagnostic(entry, diagnostic),
        visibilityClass: visibilityClass(diagnostic),
        isDuplicateAcrossSourceFields: false,
        resolvedTargetCategory: resolvedTarget ? normalizeCodexKind(resolvedTarget.exportKind) : undefined,
        resolvedTargetEntryKey: resolvedTarget ? normalize(resolvedTarget.entryKey) : undefined,
        resolvedTargetDisplayName: resolvedTarget ? displayName(resolvedTarget) : undefined,
    };
}

function toPolicyReportItem(
    entry: CodexEntry,
    field: CodexReferenceDiagnosticSourceField,
    diagnostic: CodexReferenceDiagnostic,
    findingKind: CodexReferencePolicyFindingKind
): CodexReferencePolicyReportItem | null {
    const resolvedTarget = diagnostic.resolvedEntry;
    if (!resolvedTarget) return null;

    return {
        findingKind,
        sourceCategory: normalizeCodexKind(entry.exportKind),
        sourceVisibility: sourceVisibility(entry),
        sourceEntryKey: normalize(entry.entryKey),
        sourceDisplayName: displayName(entry),
        sourceField: field,
        sourceIndex: diagnostic.index ?? 0,
        referencedKey: diagnostic.raw,
        targetPrefix: targetPrefix(diagnostic.raw),
        resolvedTargetCategory: normalizeCodexKind(resolvedTarget.exportKind),
        resolvedTargetVisibility: sourceVisibility(resolvedTarget),
        resolvedTargetEntryKey: normalize(resolvedTarget.entryKey),
        resolvedTargetDisplayName: displayName(resolvedTarget),
        diagnosticKind: diagnostic.kind,
        rootCauseClass: "relationship/reference policy",
    };
}

function policyFindingKind(
    entry: CodexEntry,
    diagnostic: CodexReferenceDiagnostic
): CodexReferencePolicyFindingKind | null {
    if (sourceVisibility(entry) !== "public") return null;

    if (!diagnostic.resolvedEntry) return null;

    const isSelfReference = normalizeCodexKind(diagnostic.resolvedEntry.exportKind) === normalizeCodexKind(entry.exportKind) &&
        normalize(diagnostic.resolvedEntry.entryKey) === normalize(entry.entryKey);
    if (isSelfReference && diagnostic.kind === "raw-fallback-ref") return null;

    const targetVisibility = sourceVisibility(diagnostic.resolvedEntry);
    if (targetVisibility === "hidden") return "public-to-hidden-support-target";
    if (targetVisibility === "localOnly") return "public-to-local-only-target";
    if (diagnostic.kind === "raw-fallback-ref") return "public-raw-fallback-reference";
    return null;
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

function comparePolicyItems(
    left: CodexReferencePolicyReportItem,
    right: CodexReferencePolicyReportItem
): number {
    const priorityByKind: Record<CodexReferencePolicyFindingKind, number> = {
        "public-to-hidden-support-target": 0,
        "public-to-local-only-target": 1,
        "public-raw-fallback-reference": 2,
    };

    return priorityByKind[left.findingKind] - priorityByKind[right.findingKind] ||
        left.sourceCategory.localeCompare(right.sourceCategory) ||
        left.sourceEntryKey.localeCompare(right.sourceEntryKey) ||
        left.sourceField.localeCompare(right.sourceField) ||
        left.sourceIndex - right.sourceIndex ||
        left.referencedKey.localeCompare(right.referencedKey);
}

function unresolvedRelationshipIdentity(item: Pick<
    CodexReferenceDiagnosticReportItem,
    "sourceCategory" | "sourceEntryKey" | "referencedKey" | "diagnosticKind"
>): string {
    return [
        item.sourceCategory,
        item.sourceEntryKey,
        item.referencedKey,
        item.diagnosticKind,
    ].join("\u0000");
}

function withDuplicateAcrossFieldMetadata(
    items: CodexReferenceDiagnosticReportItem[]
): CodexReferenceDiagnosticReportItem[] {
    const countsByRelationship = items.reduce<Record<string, number>>((acc, item) => {
        const key = unresolvedRelationshipIdentity(item);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});

    return items.map((item) => ({
        ...item,
        isDuplicateAcrossSourceFields: (countsByRelationship[unresolvedRelationshipIdentity(item)] ?? 0) > 1,
    }));
}

function countUniqueUnresolvedRelationships(items: readonly CodexReferenceDiagnosticReportItem[]): number {
    return new Set(items.map(unresolvedRelationshipIdentity)).size;
}

function buildDuplicateIdentityGroups(entries: readonly CodexEntry[]): CodexDuplicateIdentityGroup[] {
    const grouped = entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
        const category = normalizeCodexKind(entry.exportKind);
        const name = normalizedDisplayName(entry);
        if (!category || !name) return acc;

        const key = `${category}\u0000${name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {});

    return Object.values(grouped)
        .filter((group) => group.length > 1)
        .map((group) => {
            const firstEntry = group[0];
            const visibility = sourceVisibility(firstEntry);
            const severity: CodexDuplicateIdentitySeverity = visibility === "public" ? "review" : "info";
            const rootCauseClass: CodexDiagnosticRootCauseClass = visibility === "public"
                ? "unresolved pending further evidence"
                : "expected thin/internal data";

            return {
                sourceCategory: normalizeCodexKind(firstEntry.exportKind),
                sourceVisibility: visibility,
                displayName: displayName(firstEntry),
                entryCount: group.length,
                entryKeys: group.map((entry) => normalize(entry.entryKey)).sort((left, right) => left.localeCompare(right)),
                severity,
                rootCauseClass,
                classification: visibility === "public"
                    ? "duplicate player-facing display identity requires review"
                    : "duplicate hidden/local display identity",
            };
        })
        .sort((left, right) =>
            (left.severity === "review" ? 0 : 1) - (right.severity === "review" ? 0 : 1) ||
            left.sourceCategory.localeCompare(right.sourceCategory) ||
            left.displayName.localeCompare(right.displayName)
        );
}

function hasStrictPublicContent(entry: CodexEntry): boolean {
    return (entry.descriptionLines ?? []).length > 0 ||
        (entry.facts ?? []).length > 0 ||
        (entry.sections ?? []).length > 0 ||
        (entry.referenceKeys ?? []).length > 0 ||
        (entry.publicContextKeys ?? []).length > 0;
}

function buildThinRecordItems(entries: readonly CodexEntry[]): CodexThinRecordItem[] {
    return entries
        .filter((entry) => sourceVisibility(entry) === "public")
        .filter((entry) => !hasStrictPublicContent(entry))
        .map((entry) => ({
            sourceCategory: normalizeCodexKind(entry.exportKind),
            sourceVisibility: sourceVisibility(entry),
            sourceEntryKey: normalize(entry.entryKey),
            sourceDisplayName: displayName(entry),
            rootCauseClass: "unresolved pending further evidence" as CodexDiagnosticRootCauseClass,
            classification: "public record has no description, facts, sections, or references",
        }))
        .sort((left, right) =>
            left.sourceCategory.localeCompare(right.sourceCategory) ||
            left.sourceEntryKey.localeCompare(right.sourceEntryKey)
        );
}

function buildCategorySummaries(
    entries: readonly CodexEntry[],
    items: readonly CodexReferenceDiagnosticReportItem[],
    policyItems: readonly CodexReferencePolicyReportItem[],
    duplicateIdentityGroups: readonly CodexDuplicateIdentityGroup[],
    thinRecordItems: readonly CodexThinRecordItem[],
    referenceCountByCategory: Record<string, number>
): CodexReferenceCategorySummary[] {
    const entriesByCategory = entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
        const category = normalizeCodexKind(entry.exportKind);
        if (!acc[category]) acc[category] = [];
        acc[category].push(entry);
        return acc;
    }, {});

    return Object.entries(entriesByCategory)
        .map(([category, categoryEntries]) => {
            const categoryItems = items.filter((item) => item.sourceCategory === category);
            const categoryPolicyItems = policyItems.filter((item) => item.sourceCategory === category);
            const duplicateGroups = duplicateIdentityGroups.filter((group) => group.sourceCategory === category);
            const thinRecords = thinRecordItems.filter((item) => item.sourceCategory === category);

            return {
                sourceCategory: category,
                sourceVisibility: sourceVisibility(categoryEntries[0]),
                entryCount: categoryEntries.length,
                referenceCount: referenceCountByCategory[category] ?? 0,
                unresolvedCount: categoryItems.length,
                uniqueUnresolvedRelationshipCount: countUniqueUnresolvedRelationships(categoryItems),
                policyFindingCount: categoryPolicyItems.length,
                rawFallbackReferenceCount: categoryPolicyItems.filter((item) => item.diagnosticKind === "raw-fallback-ref").length,
                duplicateIdentityGroupCount: duplicateGroups.length,
                thinRecordCount: thinRecords.length,
            };
        })
        .sort((left, right) => left.sourceCategory.localeCompare(right.sourceCategory));
}

export function createCodexReferenceDiagnosticReport(
    entries: readonly CodexEntry[]
): CodexReferenceDiagnosticReport {
    const indexes = buildIndexes(entries);
    const fields: CodexReferenceDiagnosticSourceField[] = ["publicContextKeys", "referenceKeys"];
    const allItems: CodexReferenceDiagnosticReportItem[] = [];
    const policyItems: CodexReferencePolicyReportItem[] = [];
    const referenceCountByCategory: Record<string, number> = {};
    let totalReferences = 0;

    for (const entry of entries) {
        const category = normalizeCodexKind(entry.exportKind);
        for (const field of fields) {
            const diagnostics = diagnoseEntryField(entry, field, indexes);
            totalReferences += diagnostics.length;
            referenceCountByCategory[category] = (referenceCountByCategory[category] ?? 0) + diagnostics.length;
            for (const diagnostic of diagnostics) {
                const findingKind = policyFindingKind(entry, diagnostic);
                if (findingKind) {
                    const policyItem = toPolicyReportItem(entry, field, diagnostic, findingKind);
                    if (policyItem) policyItems.push(policyItem);
                }

                if (diagnostic.kind === "resolved-typed-ref" || diagnostic.kind === "raw-fallback-ref") {
                    continue;
                }

                allItems.push(toReportItem(entry, field, diagnostic));
            }
        }
    }

    const items = withDuplicateAcrossFieldMetadata(allItems).sort(compareReportItems);
    const relationshipPolicyItems = policyItems.sort(comparePolicyItems);
    const duplicateIdentityGroups = buildDuplicateIdentityGroups(entries);
    const thinRecordItems = buildThinRecordItems(entries);
    const publicItems = items.filter((item) => item.sourceVisibility === "public");
    const publicDuplicateIdentityGroups = duplicateIdentityGroups.filter((group) => group.sourceVisibility === "public");

    return {
        totalReferences,
        totalUnresolved: items.length,
        totalUniqueUnresolvedRelationships: countUniqueUnresolvedRelationships(items),
        totalPublicSourceUnresolved: publicItems.length,
        totalPublicSourceUniqueUnresolvedRelationships: countUniqueUnresolvedRelationships(publicItems),
        totalRelationshipPolicyFindings: relationshipPolicyItems.length,
        totalDuplicateIdentityGroups: duplicateIdentityGroups.length,
        totalPublicDuplicateIdentityGroups: publicDuplicateIdentityGroups.length,
        totalThinPublicRecords: thinRecordItems.length,
        categorySummaries: buildCategorySummaries(
            entries,
            items,
            relationshipPolicyItems,
            duplicateIdentityGroups,
            thinRecordItems,
            referenceCountByCategory
        ),
        items,
        relationshipPolicyItems,
        duplicateIdentityGroups,
        thinRecordItems,
    };
}

export function formatCodexReferenceDiagnosticReport(
    report: CodexReferenceDiagnosticReport,
    options: { limit?: number } = {}
): string {
    const limit = options.limit ?? report.items.length;
    const visibleItems = report.items.slice(0, limit);
    const visiblePolicyItems = report.relationshipPolicyItems.slice(0, limit);
    const visibleDuplicateGroups = report.duplicateIdentityGroups.slice(0, limit);
    const visibleThinRecords = report.thinRecordItems.slice(0, limit);

    return [
        "# Codex Reference Diagnostics",
        "",
        "Status: generated engineering diagnostic",
        "",
        "## Summary",
        "",
        `- total references checked: ${report.totalReferences}`,
        `- unresolved or malformed references: ${report.totalUnresolved}`,
        `- unique unresolved relationships: ${report.totalUniqueUnresolvedRelationships}`,
        `- public-source unresolved or malformed references: ${report.totalPublicSourceUnresolved}`,
        `- public-source unique unresolved relationships: ${report.totalPublicSourceUniqueUnresolvedRelationships}`,
        `- relationship policy / contract findings: ${report.totalRelationshipPolicyFindings}`,
        `- duplicate display identity groups: ${report.totalDuplicateIdentityGroups}`,
        `- public duplicate display identity groups: ${report.totalPublicDuplicateIdentityGroups}`,
        `- strict thin public records: ${report.totalThinPublicRecords}`,
        "",
        "## Category Summary",
        "",
        "| Category | Visibility | Entries | References | Unresolved | Unique unresolved | Policy/contract | Raw fallback | Duplicate identities | Strict thin |",
        "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
        ...report.categorySummaries.map((summary) =>
            `| ${summary.sourceCategory} | ${summary.sourceVisibility} | ${summary.entryCount} | ${summary.referenceCount} | ${summary.unresolvedCount} | ${summary.uniqueUnresolvedRelationshipCount} | ${summary.policyFindingCount} | ${summary.rawFallbackReferenceCount} | ${summary.duplicateIdentityGroupCount} | ${summary.thinRecordCount} |`
        ),
        "",
        "## Findings",
        "",
        "| Source category | Source visibility | Source entry | Field | Missing/reference key | Target prefix | Kind | Imported hint | Visibility class | Classification | Root cause class | Duplicate across fields |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ...visibleItems.map((item) =>
            `| ${item.sourceCategory} | ${item.sourceVisibility} | ${item.sourceDisplayName} (${item.sourceEntryKey}) | ${item.sourceField}[${item.sourceIndex}] | ${item.referencedKey} | ${item.targetPrefix || "-"} | ${item.diagnosticKind} | ${item.importedDomainKindHint ?? "-"} | ${item.visibilityClass} | ${item.classification} | ${item.rootCauseClass} | ${item.isDuplicateAcrossSourceFields ? "yes" : "no"} |`
        ),
        report.items.length > visibleItems.length
            ? `\n_${report.items.length - visibleItems.length} additional finding(s) omitted by limit._`
            : "",
        "",
        "## Relationship Policy / Contract Findings",
        "",
        "| Finding | Source category | Source entry | Field | Reference key | Target category | Target visibility | Target entry | Root cause class |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ...visiblePolicyItems.map((item) =>
            `| ${item.findingKind} | ${item.sourceCategory} | ${item.sourceDisplayName} (${item.sourceEntryKey}) | ${item.sourceField}[${item.sourceIndex}] | ${item.referencedKey} | ${item.resolvedTargetCategory} | ${item.resolvedTargetVisibility} | ${item.resolvedTargetDisplayName} (${item.resolvedTargetEntryKey}) | ${item.rootCauseClass} |`
        ),
        report.relationshipPolicyItems.length > visiblePolicyItems.length
            ? `\n_${report.relationshipPolicyItems.length - visiblePolicyItems.length} additional policy/contract finding(s) omitted by limit._`
            : "",
        "",
        "## Duplicate Display Identity Groups",
        "",
        "| Category | Visibility | Display name | Entries | Severity | Classification | Root cause class |",
        "| --- | --- | --- | ---: | --- | --- | --- |",
        ...visibleDuplicateGroups.map((group) =>
            `| ${group.sourceCategory} | ${group.sourceVisibility} | ${group.displayName} | ${group.entryCount} | ${group.severity} | ${group.classification} | ${group.rootCauseClass} |`
        ),
        report.duplicateIdentityGroups.length > visibleDuplicateGroups.length
            ? `\n_${report.duplicateIdentityGroups.length - visibleDuplicateGroups.length} additional duplicate identity group(s) omitted by limit._`
            : "",
        "",
        "## Strict Thin Public Records",
        "",
        "| Category | Entry | Classification | Root cause class |",
        "| --- | --- | --- | --- |",
        ...visibleThinRecords.map((item) =>
            `| ${item.sourceCategory} | ${item.sourceDisplayName} (${item.sourceEntryKey}) | ${item.classification} | ${item.rootCauseClass} |`
        ),
        report.thinRecordItems.length > visibleThinRecords.length
            ? `\n_${report.thinRecordItems.length - visibleThinRecords.length} additional strict thin public record(s) omitted by limit._`
            : "",
    ].filter((line) => line !== "").join("\n");
}
