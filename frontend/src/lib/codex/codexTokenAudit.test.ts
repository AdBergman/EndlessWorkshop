import { createCodexTokenAuditText } from "./codexTokenAudit";

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
});
