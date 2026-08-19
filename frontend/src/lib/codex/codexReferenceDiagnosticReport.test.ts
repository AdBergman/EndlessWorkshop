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
            "| tech | public | Source Tech (Tech_Source) | referenceKeys[0] | DistrictImprovement_Missing | DistrictImprovement | unresolved-ref | - | likely-public-target | user-facing unresolved reference | unresolved pending further evidence | no |"
        );
    });

    it("reports public records that resolve to hidden support targets without treating them as unresolved", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "actions",
                entryKey: "Action_Source",
                displayName: "Source Action",
                referenceKeys: [entityRefId(codexEntityRef("bonuses", "Modifier_Target")!)],
            }),
            entry({
                exportKind: "bonuses",
                entryKey: "Modifier_Target",
                displayName: "Target Modifier",
            }),
        ]);

        expect(report.totalUnresolved).toBe(0);
        expect(report.relationshipPolicyItems).toEqual([
            expect.objectContaining({
                findingKind: "public-to-hidden-support-target",
                sourceCategory: "actions",
                resolvedTargetCategory: "bonuses",
                resolvedTargetVisibility: "hidden",
                rootCauseClass: "relationship/reference policy",
            }),
        ]);
    });

    it("deduplicates unresolved relationships across public context and reference keys", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "abilities",
                entryKey: "Ability_Source",
                displayName: "Source Ability",
                publicContextKeys: ["Status_Missing"],
                referenceKeys: ["Status_Missing"],
            }),
        ]);

        expect(report.totalUnresolved).toBe(2);
        expect(report.totalUniqueUnresolvedRelationships).toBe(1);
        expect(report.items).toEqual([
            expect.objectContaining({
                sourceField: "publicContextKeys",
                isDuplicateAcrossSourceFields: true,
            }),
            expect.objectContaining({
                sourceField: "referenceKeys",
                isDuplicateAcrossSourceFields: true,
            }),
        ]);
    });

    it("does not report raw-fallback self references as relationship policy findings", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Aware",
                displayName: "Aware",
                publicContextKeys: ["UnitAbility_Aware"],
            }),
        ]);

        expect(report.totalUnresolved).toBe(0);
        expect(report.relationshipPolicyItems).toEqual([]);
    });

    it("reports duplicate player-facing display identities by category", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "districts",
                entryKey: "District_A",
                displayName: "Farm",
            }),
            entry({
                exportKind: "districts",
                entryKey: "District_B",
                displayName: "Farm",
            }),
        ]);

        expect(report.duplicateIdentityGroups).toEqual([
            expect.objectContaining({
                sourceCategory: "districts",
                sourceVisibility: "public",
                displayName: "Farm",
                entryCount: 2,
                severity: "review",
                rootCauseClass: "unresolved pending further evidence",
            }),
        ]);
    });

    it("classifies faction-prefixed effect references as mechanical/internal diagnostic noise", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "improvements",
                entryKey: "Mukag_DistrictImprovement_00",
                displayName: "Celestial Guidance",
                referenceKeys: ["Mukag_Effect_DistrictImprovement_00"],
            }),
        ]);

        expect(report.items).toEqual([
            expect.objectContaining({
                referencedKey: "Mukag_Effect_DistrictImprovement_00",
                visibilityClass: "mechanical-or-internal",
                rootCauseClass: "expected thin/internal data",
            }),
        ]);
    });

    it("infers specific minor faction quest references as quest-domain policy ambiguity", () => {
        const report = createCodexReferenceDiagnosticReport([
            entry({
                exportKind: "minorFactions",
                entryKey: "MinorFaction_MangroveOfHarmony",
                displayName: "Mangrove of Harmony",
                referenceKeys: ["MinorFaction_SpecificQuest_MangroveOfHarmony01"],
            }),
        ]);

        expect(report.items).toEqual([
            expect.objectContaining({
                referencedKey: "MinorFaction_SpecificQuest_MangroveOfHarmony01",
                diagnosticKind: "unresolved-imported-domain-ref",
                importedDomainKindHint: "quest",
                rootCauseClass: "relationship/reference policy",
            }),
        ]);
    });
});
