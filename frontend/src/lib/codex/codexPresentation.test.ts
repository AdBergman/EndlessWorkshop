import {
    createCodexSummaryEntry,
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexDescriptionPreviewText,
    getCodexEntryLabel,
    getCodexEntryPreview,
    getCodexQuestNodeLabel,
    getCodexSecondaryContext,
    humanizeCodexEntryKey,
    isCodexSummaryEntry,
    parseCodexQuestContext,
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

    it("adds stable quest step context for duplicate quest titles", () => {
        expect(
            getCodexSecondaryContext({
                exportKind: "quests",
                entryKey: "FactionQuest_Necrophage02_Chapter06_Step03_Choice01",
                category: "MajorFaction",
                kind: "Quest",
                descriptionLines: [],
                referenceKeys: [],
            })
        ).toBe("Necrophage Alternate Questline 2 / Chapter 06 Step 03 Choice 01 / Major Faction / Quest");
    });

    it("keeps the full nested choice path for branch quest nodes", () => {
        const entry = {
            exportKind: "quests",
            entryKey: "FactionQuest_KinOfSheredyn02_Chapter01_Step02_Choice01_Choice02",
            displayName: "Stirrings",
            category: "MajorFaction",
            kind: "Quest",
        };

        expect(getCodexQuestNodeLabel({ ...entry, descriptionLines: [], referenceKeys: [] })).toBe(
            "Step 2 · Choice 1 · Choice 2"
        );
        expect(parseCodexQuestContext(entry)?.choiceKeys).toEqual(["01", "02"]);
        expect(parseCodexQuestContext(entry)?.choiceLabels).toEqual(["Choice 1", "Choice 2"]);
    });

    it("uses readable labels for numbered faction quest roots", () => {
        const context = parseCodexQuestContext({
            exportKind: "quests",
            entryKey: "FactionQuest_Necrophage02_Chapter06_Step01",
            displayName: "A Bitter Truth",
            category: "MajorFaction",
            kind: "Quest",
        });

        expect(context?.groupContext).toBe("Necrophage · Chapter 6");
        expect(context?.variantLabel).toBe("Alternate questline 2");
        expect(context?.relatedContext).toBe("Quest · Necrophage · Chapter 6 · Alternate questline 2 · Step 1");
    });

    it("uses entry-key context when source kind is the only discriminator", () => {
        expect(
            getCodexSecondaryContext({
                exportKind: "tech",
                entryKey: "Technology_District_Tier1_Population_ea4",
                category: null,
                kind: "Technology",
                descriptionLines: [],
                referenceKeys: [],
            })
        ).toBe("Tier1 Population Ea4");
    });
});
