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
});
