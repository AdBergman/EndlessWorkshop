import {
    createCodexReferenceDiagnosticReport,
    formatCodexReferenceDiagnosticReport,
} from "@/lib/codex/codexReferenceDiagnosticReport";
import { codexEntityRef, entityRefId } from "@/lib/entityRef/entityRef";
import type { CodexEntry } from "@/types/dataTypes";

const entry = (overrides: Partial<CodexEntry>): CodexEntry => ({
    exportKind: "abilities",
    entryKey: "Ability_Source",
    displayName: "Source Ability",
    descriptionLines: [],
    referenceKeys: [],
    publicContextKeys: [],
    ...overrides,
});

describe("codexReferenceDiagnosticReport", () => {
    it("reports unresolved source category, entry, key, prefix, and context deterministically", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "abilities",
                entryKey: "Ability_Source",
                displayName: "Source Ability",
                referenceKeys: ["Status_Missing", "Status_Resolved"],
            }),
            entry({
                exportKind: "statuses",
                entryKey: "Status_Resolved",
                displayName: "Resolved Status",
            }),
        ]);

        expect(report.totalReferences).toBe(2);
        expect(report.items).toEqual([
            expect.objectContaining({
                sourceCategory: "abilities",
                sourceEntryKey: "Ability_Source",
                sourceDisplayName: "Source Ability",
                sourceField: "referenceKeys",
                sourceIndex: 0,
                referencedKey: "Status_Missing",
                targetPrefix: "Status",
                diagnosticKind: "unresolved-ref",
                visibilityClass: "likely-public-target",
                classification: "user-facing unresolved reference",
            }),
        ]);
    });

    it("classifies malformed typed refs and hidden support candidates without resolving them in UI", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "improvements",
                entryKey: "Improvement_Source",
                displayName: "Source Improvement",
                publicContextKeys: [
                    entityRefId(codexEntityRef("modifiers", "Modifier_Missing")!),
                    "Effect_Internal_Missing",
                ],
                referenceKeys: ["codex:statuses%3A%E0%A4%A"],
            }),
        ]);

        expect(report.items).toEqual([
            expect.objectContaining({
                sourceField: "publicContextKeys",
                referencedKey: "codex:modifiers%3AModifier_Missing",
                targetPrefix: "modifiers",
                diagnosticKind: "unresolved-ref",
                visibilityClass: "likely-hidden-support-target",
            }),
            expect.objectContaining({
                sourceField: "publicContextKeys",
                referencedKey: "Effect_Internal_Missing",
                targetPrefix: "Effect",
                diagnosticKind: "unresolved-ref",
                visibilityClass: "mechanical-or-internal",
            }),
            expect.objectContaining({
                sourceField: "referenceKeys",
                referencedKey: "codex:statuses%3A%E0%A4%A",
                targetPrefix: "statuses",
                diagnosticKind: "malformed-ref",
                visibilityClass: "unknown",
            }),
        ]);
    });

    it("formats a stable markdown table for release comparisons", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "tech",
                entryKey: "Tech_Source",
                displayName: "Source Tech",
                referenceKeys: ["DistrictImprovement_Missing"],
            }),
        ]);

        expect(formatCodexReferenceDiagnosticReport(report)).toContain(
            "| tech | Source Tech (Tech_Source) | referenceKeys[0] | DistrictImprovement_Missing | DistrictImprovement | unresolved-ref | likely-public-target | user-facing unresolved reference |"
        );
    });
});
