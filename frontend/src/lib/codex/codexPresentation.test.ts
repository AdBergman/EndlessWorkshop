import {
    createCodexSummaryEntry,
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexDescriptionPreviewText,
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

    it("builds first-line previews with mixed styled and entity-like tokens stripped", () => {
        expect(
            getCodexDescriptionPreviewLine([
                "[DustColored] [Unit_Necro_Larva] Larva consumes [PopulationCategory_03].",
                "Fallback line",
            ])
        ).toBe("Larva consumes .");
    });

    it("keeps malformed bracket fragments in previews to preserve strip behavior", () => {
        expect(getCodexDescriptionPreviewText(["Broken [DustColored line", "Unexpected Dust] marker"])).toBe(
            "Broken [DustColored line Unexpected Dust] marker"
        );
    });

    it("ignores stripped-empty lines when selecting a preview line", () => {
        expect(getCodexDescriptionPreviewLine(["[DustColored] [Unit_A]", "Visible text"])).toBe("Visible text");
    });

    it("creates synthetic summary entries for kind overviews", () => {
        const summaryEntry = createCodexSummaryEntry("districts", "Districts", 4, "");
        expect(summaryEntry.displayName).toBe("All Districts");
        expect(isCodexSummaryEntry(summaryEntry)).toBe(true);
    });

    it("formats known singular, plural, and compact codex kind labels", () => {
        expect(formatCodexKindLabel("quests")).toBe("Quests");
        expect(formatCodexKindLabel("quest")).toBe("Quests");
        expect(formatCodexKindLabel("traits")).toBe("Traits");
        expect(formatCodexKindLabel("population")).toBe("Populations");
        expect(formatCodexKindLabel("minorfactions")).toBe("Minor Factions");
        expect(formatCodexKindLabel("techs")).toBe("Tech");
    });
});
