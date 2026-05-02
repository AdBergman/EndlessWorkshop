import {
    createCodexSummaryEntry,
    getCodexEntryLabel,
    getCodexEntryPreview,
    humanizeCodexEntryKey,
    isCodexSummaryEntry,
} from "@/lib/codex/codexPresentation";

describe("codexPresentation", () => {
    it("humanizes technical entry keys for UI fallbacks", () => {
        expect(humanizeCodexEntryKey("UnitAbility_Blossom_2")).toBe("Blossom 2");
        expect(humanizeCodexEntryKey("Equipment_Accessory_03_Definition")).toBe("Accessory 03");
    });

    it("prefers display names unless they look technical", () => {
        expect(
            getCodexEntryLabel({
                displayName: "Wild Walker",
                entryKey: "Unit_WildWalker",
            })
        ).toBe("Wild Walker");

        expect(
            getCodexEntryLabel({
                displayName: "UnitAbility_Blossom_2",
                entryKey: "UnitAbility_Blossom_2",
            })
        ).toBe("Blossom 2");
    });

    it("builds compact summary previews from description lines", () => {
        expect(
            getCodexEntryPreview({
                descriptionLines: ["Adds [FoodColored] to the city.", "Improves seasonal output."],
            })
        ).toBe("Adds to the city. Improves seasonal output.");
    });

    it("creates synthetic summary entries for kind overviews", () => {
        const summaryEntry = createCodexSummaryEntry("districts", "Districts", 4, "");
        expect(summaryEntry.displayName).toBe("All Districts");
        expect(isCodexSummaryEntry(summaryEntry)).toBe(true);
    });
});
