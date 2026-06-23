import { codexEntityRef, entityRefId } from "@/lib/entityRef/entityRef";
import {
    createCodexDiagnosticsReport,
    formatCodexDiagnosticsReport,
} from "./codexDiagnosticsReport";
import type { CodexEntry } from "@/types/dataTypes";

const entries: CodexEntry[] = [
    {
        exportKind: "abilities",
        entryKey: "Ability_A",
        displayName: "[DustColored] Ability A",
        descriptionLines: [
            "Unlocks [Unit_MissingImported] and [UnknownToken].",
            "Broken [DustColored line",
        ],
        referenceKeys: [
            "Shared_Key",
            entityRefId(codexEntityRef("heroes", "Hero_A")!),
            entityRefId(codexEntityRef("heroes", "Hero_A")!),
            "Unit_MissingImported",
            "Missing_Raw",
            "codex:heroes%3A%E0%A4%A",
        ],
    },
    {
        exportKind: "heroes",
        entryKey: "Hero_A",
        displayName: "Hero A",
        descriptionLines: ["Known hero."],
        referenceKeys: [],
    },
    {
        exportKind: "heroes",
        entryKey: "Shared_Key",
        displayName: "Hero Shared",
        descriptionLines: [],
        referenceKeys: [],
    },
    {
        exportKind: "units",
        entryKey: "Shared_Key",
        displayName: "Unit Shared",
        descriptionLines: ["[PopulationCategory_03]"],
        referenceKeys: [],
    },
];

describe("codexDiagnosticsReport", () => {
    it("groups reference and descriptor diagnostics by kind", () => {
        const report = createCodexDiagnosticsReport(entries);

        expect(report.referenceCounts).toEqual({
            "malformed-ref": 1,
            "raw-fallback-ref": 1,
            "resolved-typed-ref": 2,
            "unresolved-imported-domain-ref": 1,
            "unresolved-ref": 1,
        });
        expect(report.descriptorCounts).toEqual({
            "entity-like-token": 1,
            "known-style-token": 2,
            "malformed-token": 1,
            "unknown-token": 1,
        });
        expect(report.signalCounts).toEqual({
            "expected-style-token": 2,
            "high-signal-warning": 1,
            other: 8,
        });
        expect(report.duplicateReferenceCount).toBe(1);
    });

    it("groups diagnostics by export kind", () => {
        const report = createCodexDiagnosticsReport(entries);

        expect(report.referenceCountsByExportKind).toEqual({
            abilities: {
                "malformed-ref": 1,
                "raw-fallback-ref": 1,
                "resolved-typed-ref": 2,
                "unresolved-imported-domain-ref": 1,
                "unresolved-ref": 1,
            },
        });
        expect(report.descriptorCountsByExportKind).toEqual({
            abilities: {
                "entity-like-token": 1,
                "known-style-token": 1,
                "malformed-token": 1,
                "unknown-token": 1,
            },
            units: {
                "known-style-token": 1,
            },
        });
    });

    it("keeps duplicate and raw fallback metadata in entry details", () => {
        const report = createCodexDiagnosticsReport(entries);
        const abilityDiagnostics = report.entries.find((entry) => entry.entryKey === "Ability_A")!;

        expect(abilityDiagnostics.referenceDiagnostics[0]).toMatchObject({
            kind: "raw-fallback-ref",
            raw: "Shared_Key",
            isAmbiguousRawKey: true,
            rawMatchedKinds: ["heroes", "units"],
        });
        expect(abilityDiagnostics.referenceDiagnostics[2]).toMatchObject({
            kind: "resolved-typed-ref",
            isDuplicate: true,
            duplicateOfIndex: 1,
        });
        expect(abilityDiagnostics.referenceDiagnostics[3]).toMatchObject({
            kind: "unresolved-imported-domain-ref",
            importedKindHint: "unit",
        });
    });

    it("tracks resolved icon usage and manifest category coverage", () => {
        const report = createCodexDiagnosticsReport([
            {
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01",
                displayName: "[LuxuryResource01] Klax Extractor",
                descriptionLines: ["Extracts [LuxuryResource01] Klax."],
                referenceKeys: [],
            },
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Fly",
                displayName: "Fly",
                descriptionLines: ["Missing [UnknownIconToken]."],
                referenceKeys: [],
                svgIcon: { source: "ability-icons", key: "UnitAbility_Fly" },
            },
        ]);

        expect(report.iconUsage.resolvedTokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    token: "LuxuryResource01",
                    count: 2,
                    path: "/svg/constructibles/UI_Resource_Luxury_Klak.svg",
                }),
            ])
        );
        expect(report.iconUsage.unresolvedTokens).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    token: "UnknownIconToken",
                    count: 1,
                }),
            ])
        );
        expect(report.iconUsage.iconUsages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: "/svg/constructibles/UI_Resource_Luxury_Klak.svg",
                }),
                expect.objectContaining({
                    path: "/svg/unit-abilities/UI_UnitAbility_Fly.svg",
                }),
            ])
        );
        expect(report.iconUsage.categories.find((category) => category.category === "constructibles")?.usedPathCount)
            .toBeGreaterThan(0);
        expect(report.iconUsage.unusedCategories.length).toBeGreaterThan(0);
    });

    it("formats a deterministic developer-facing text report", () => {
        const text = formatCodexDiagnosticsReport(createCodexDiagnosticsReport(entries));

        expect(text).toContain("CODEX DIAGNOSTICS REPORT");
        expect(text).toContain("- raw-fallback-ref: 1");
        expect(text).toContain("- duplicate references: 1");
        expect(text).toContain("DIAGNOSTIC SIGNAL SUMMARY");
        expect(text).toContain("- high-signal warnings: 1");
        expect(text).toContain("- expected style tokens: 2");
        expect(text).toContain("ICON USAGE SUMMARY");
        expect(text).toContain("ICON USAGE BY CATEGORY");
        expect(text).toContain("UNUSED MANIFEST CATEGORY EXAMPLES");
        expect(text).toContain("- abilities:Ability_A ref[0] raw-fallback-ref Shared_Key (raw fallback; ambiguous: heroes, units)");
        expect(text).toContain("- abilities:Ability_A ref[2] resolved-typed-ref codex:heroes%3AHero_A (duplicate of #1)");
        expect(text).toContain("- abilities:Ability_A ref[3] unresolved-imported-domain-ref Unit_MissingImported (imported: unit)");
        expect(text).toContain("- abilities:Ability_A descriptionLine[0] entity-like-token Unit_MissingImported (entity-like: unit)");
        expect(text).toContain("- abilities:Ability_A descriptionLine[1] malformed-token DustColored line (reason: unclosed-token)");
    });

    it("formats empty reports without special casing callers", () => {
        const text = formatCodexDiagnosticsReport(createCodexDiagnosticsReport([]));

        expect(text).toContain("REFERENCE DETAILS\n-----------------\n- none");
        expect(text).toContain("DESCRIPTOR DETAILS\n------------------\n- none");
    });
});
