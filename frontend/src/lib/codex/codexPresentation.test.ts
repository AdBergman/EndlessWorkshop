import {
    createCodexSummaryEntry,
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexDescriptionPreviewText,
    getCodexEntryLabel,
    getCodexEntryPreview,
    getCodexDetailContextLines,
    getCodexRelatedContext,
    getCodexSecondaryContext,
    humanizeCodexEntryKey,
    isCodexSummaryEntry,
} from "@/lib/codex/codexPresentation";

describe("codexPresentation", () => {
    it("humanizes technical entry keys for UI fallbacks", () => {
        expect(humanizeCodexEntryKey("UnitAbility_Blossom_2")).toBe("Blossom 2");
        expect(humanizeCodexEntryKey("Equipment_Accessory_03_Definition")).toBe("Accessory 03");
        expect(humanizeCodexEntryKey("Faction_Mukag")).toBe("Tahuk");
        expect(humanizeCodexEntryKey("Faction_KinOfSheredyn")).toBe("Kin of Sheredyn");
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

        expect(
            getCodexEntryLabel({
                displayName: "Necrophage",
                entryKey: "Faction_Necrophage",
            })
        ).toBe("Necrophages");
    });

    it("normalizes public major faction labels in codex-only description text", () => {
        expect(getCodexDescriptionPreviewLine(["Faction: Mukag"])).toBe("Faction: Tahuk");
        expect(getCodexDescriptionPreviewLine(["Affinity: Necrophage"])).toBe("Affinity: Necrophages");
        expect(getCodexDescriptionPreviewText(["KinOfSheredyn can expand.", "Affinity: Tahuks"])).toBe(
            "Kin of Sheredyn can expand. Affinity: Tahuk"
        );
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
        const summaryEntry = createCodexSummaryEntry("districts", "Districts", 4);
        expect(summaryEntry.displayName).toBe("All Districts");
        expect(summaryEntry.descriptionLines).toEqual([]);
        expect(isCodexSummaryEntry(summaryEntry)).toBe(true);
    });

    it("formats known singular, plural, and compact codex kind labels", () => {
        expect(formatCodexKindLabel("quests")).toBe("Quests");
        expect(formatCodexKindLabel("quest")).toBe("Quests");
        expect(formatCodexKindLabel("traits")).toBe("Traits");
        expect(formatCodexKindLabel("population")).toBe("Populations");
        expect(formatCodexKindLabel("minorfactions")).toBe("Minor Factions");
        expect(formatCodexKindLabel("extractors")).toBe("Extractors");
        expect(formatCodexKindLabel("techs")).toBe("Tech");
        expect(formatCodexKindLabel("actions")).toBe("Actions");
        expect(formatCodexKindLabel("bonuses")).toBe("Bonuses");
        expect(formatCodexKindLabel("modifiers")).toBe("Modifiers");
        expect(formatCodexKindLabel("statuses")).toBe("Statuses");
        expect(formatCodexKindLabel("resources")).toBe("Resources");
        expect(formatCodexKindLabel("councilorEffects")).toBe("Councilor Effects");
        expect(formatCodexKindLabel("partnerEffects")).toBe("Partner Effects");
        expect(formatCodexKindLabel("diplomatictreaties")).toBe("Diplomacy");
        expect(formatCodexKindLabel("diplomaticTreaties")).toBe("Diplomacy");
    });

    it("uses exported Quest facts for Codex context instead of key-derived step paths", () => {
        const questEntry = {
            exportKind: "quests",
            entryKey: "FactionQuest_Necrophage02_Chapter06_Step03_Choice01",
            displayName: "A Choice",
            category: "MajorFaction",
            kind: "Quest",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Quest" },
                { label: "Category", value: "MajorFaction" },
                { label: "Chapter", value: "6" },
                { label: "Mandatory", value: "Yes" },
            ],
        };

        expect(getCodexSecondaryContext(questEntry)).toBe("Major Faction / Chapter 6 / Mandatory");
        expect(getCodexDetailContextLines(questEntry)).toEqual(["Major Faction", "Chapter 6", "Mandatory"]);
        expect(getCodexRelatedContext(questEntry)).toBe("Quest · Major Faction · Chapter 6 · Mandatory");
    });

    it("normalizes inferred major faction context from codex keys and descriptions", () => {
        expect(
            getCodexSecondaryContext({
                exportKind: "units",
                entryKey: "Unit_Devotee",
                category: "Mukag",
                kind: "Unit",
                descriptionLines: ["Faction: Mukag"],
                referenceKeys: ["Faction_Mukag"],
            })
        ).toBe("Tahuk / Unit");
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
