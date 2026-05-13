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
            "entity-like-token": 2,
            "known-style-token": 1,
            "malformed-token": 1,
            "unknown-token": 1,
        });
        expect(report.signalCounts).toEqual({
            "expected-style-token": 1,
            "high-signal-warning": 1,
            other: 9,
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
                "entity-like-token": 1,
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

    it("formats a deterministic developer-facing text report", () => {
        const text = formatCodexDiagnosticsReport(createCodexDiagnosticsReport(entries));

        expect(text).toContain("CODEX DIAGNOSTICS REPORT");
        expect(text).toContain("- raw-fallback-ref: 1");
        expect(text).toContain("- duplicate references: 1");
        expect(text).toContain("DIAGNOSTIC SIGNAL SUMMARY");
        expect(text).toContain("- high-signal warnings: 1");
        expect(text).toContain("- expected style tokens: 1");
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
