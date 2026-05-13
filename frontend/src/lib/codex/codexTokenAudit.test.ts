import { createCodexDiagnosticsReportText, createCodexTokenAuditText } from "./codexTokenAudit";

describe("codexTokenAudit", () => {
    it("builds a small text audit with unknown and known token counts sorted by occurrences", () => {
        const text = createCodexTokenAuditText([
            {
                exportKind: "improvements",
                entryKey: "Improvement_AuricCoral",
                displayName: "[LuxuryResource01] Auric Coral",
                descriptionLines: [
                    "Gain [DustColored] on approval.",
                    "Gain [DustColored] again.",
                ],
                referenceKeys: [],
            },
            {
                exportKind: "improvements",
                entryKey: "Improvement_Filtered",
                displayName: "[TBD] Internal",
                descriptionLines: ["Should still surface [LuxuryResource01] and [PopulationCategory_03]."],
                referenceKeys: [],
            },
        ]);

        expect(text).toBe(
            [
                "UNKNOWN TOKENS",
                "--------------",
                "LuxuryResource01 (2)",
                "PopulationCategory_03 (1)",
                "TBD (1)",
                "",
                "KNOWN TOKENS",
                "------------",
                "DustColored (2)",
            ].join("\n")
        );
    });

    it("keeps entity-like references in the unknown token section", () => {
        const text = createCodexTokenAuditText([
            {
                exportKind: "units",
                entryKey: "Unit_Necro_Larva",
                displayName: "[Unit_Necro_Larva] Larva",
                descriptionLines: [
                    "Evolves through [Unit_Necro_Drone].",
                    "Consumes [PopulationCategory_03].",
                ],
                referenceKeys: [],
            },
        ]);

        expect(text).toBe(
            [
                "UNKNOWN TOKENS",
                "--------------",
                "PopulationCategory_03 (1)",
                "Unit_Necro_Drone (1)",
                "Unit_Necro_Larva (1)",
                "",
                "KNOWN TOKENS",
                "------------",
            ].join("\n")
        );
    });

    it("ignores malformed bracket diagnostics to preserve token audit output", () => {
        const text = createCodexTokenAuditText([
            {
                exportKind: "improvements",
                entryKey: "Improvement_Malformed",
                displayName: "[   ] Internal",
                descriptionLines: ["Broken [DustColored line", "Unexpected Dust] marker"],
                referenceKeys: [],
            },
        ]);

        expect(text).toBe(
            [
                "UNKNOWN TOKENS",
                "--------------",
                "",
                "KNOWN TOKENS",
                "------------",
            ].join("\n")
        );
    });

    it("formats the codex diagnostics report from raw codex entries", () => {
        const text = createCodexDiagnosticsReportText([
            {
                exportKind: "abilities",
                entryKey: "UnitAbility_Blossom",
                displayName: "Blossom",
                descriptionLines: ["Gain [DustColored] near [Unit_Necro_Drone]."],
                referenceKeys: ["Unit_Necro_Drone", "Unit_Necro_Drone", "Unknown_Key", "Imported:Missing_Domain"],
            },
            {
                exportKind: "units",
                entryKey: "Unit_Necro_Drone",
                displayName: "[Unit_Necro_Drone] Drone",
                descriptionLines: ["Broken [DustColored line"],
                referenceKeys: [],
            },
        ]);

        expect(text).toContain("CODEX DIAGNOSTICS REPORT");
        expect(text).toContain("- duplicate references: 1");
        expect(text).toContain("duplicate of #0");
        expect(text).toContain("unresolved-ref Unknown_Key");
        expect(text).toContain("malformed-token DustColored line");
        expect(text).toContain("entity-like-token Unit_Necro_Drone");
    });
});
