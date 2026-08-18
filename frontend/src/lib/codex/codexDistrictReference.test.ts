import {
    buildCodexDistrictReferenceModel,
    getCodexDistrictReferenceEntryKeys,
    hasCodexDistrictReferenceModel,
} from "@/lib/codex/codexDistrictReference";
import type { CodexEntry, District } from "@/types/dataTypes";

const codexEntry = (overrides: Partial<CodexEntry>): CodexEntry => ({
    exportKind: "districts",
    entryKey: "District_Current",
    displayName: "Current District",
    descriptionLines: [],
    referenceKeys: [],
    ...overrides,
});

const richDistrict = (overrides: Partial<District>): District => ({
    districtKey: "District_Current",
    displayName: "Current District",
    descriptionLines: [],
    unlockTechnologyKeys: [],
    levelUp: null,
    placementPrerequisites: null,
    ...overrides,
});

describe("buildCodexDistrictReferenceModel", () => {
    it("builds a planning-first district reference model from exact public and rich links", () => {
        const currentEntry = codexEntry({
            facts: [
                { label: "Category", value: "Money" },
                { label: "Tier", value: "1" },
            ],
            sections: [
                { title: "Effects", lines: ["+6 [DustColored] Dust per District Level"] },
                {
                    title: "Extracted resource",
                    items: [{ label: "Klax", referenceKey: "Resource_Luxury01" }],
                },
            ],
        });
        const previousEntry = codexEntry({
            entryKey: "District_Previous",
            displayName: "Previous District",
        });
        const nextEntry = codexEntry({
            entryKey: "District_Next",
            displayName: "Next District",
        });
        const techEntry = codexEntry({
            exportKind: "tech",
            entryKey: "Tech_Market",
            displayName: "Market Economy",
        });
        const resourceEntry = codexEntry({
            exportKind: "resources",
            entryKey: "Resource_Luxury01",
            displayName: "Klax",
        });
        const entries = [currentEntry, previousEntry, nextEntry, techEntry, resourceEntry];

        const model = buildCodexDistrictReferenceModel(
            currentEntry,
            {
                District_Current: richDistrict({
                    category: "Money",
                    tier: 1,
                    constructibleLevel: 2,
                    constructionCost: ["120 Industry"],
                    isFactionSpecific: true,
                    unlockTechnologyKeys: ["Tech_Market", "Tech_Missing"],
                    levelUp: {
                        targetDistrictKey: "District_Next",
                        requiredAdjacentDistrictCount: 6,
                        validNeighbourDescriptorKeys: ["Tag_CountInDistrictLevelUp"],
                        requiredFactionTraitKeys: ["FactionTrait_AdvancedDistricts"],
                    },
                    placementPrerequisites: {
                        neighbourTiles: {
                            operator: "AnyTile",
                            territoryConstraint: "SameRegion",
                            ignoreCliff: true,
                        },
                    },
                }),
                District_Previous: richDistrict({
                    districtKey: "District_Previous",
                    levelUp: {
                        targetDistrictKey: "District_Current",
                        requiredAdjacentDistrictCount: 4,
                    },
                }),
            },
            entries
        );

        expect(model.profileItems).toEqual([
            "Dust",
            "Tier 1",
            "Constructible level 2",
            "Faction-specific",
            "Cost: 120 Industry",
        ]);
        expect(model.effectLines).toEqual(["+6 [DustColored] Dust per District Level"]);
        expect(model.extractedResources.map((link) => link.label)).toEqual(["Klax"]);
        expect(model.unlockedBy.map((link) => link.label)).toEqual(["Market Economy"]);
        expect(model.upgradesFrom.map((link) => link.label)).toEqual(["Previous District"]);
        expect(model.upgradesFrom[0]?.note).toBe("4 adjacent districts");
        expect(model.upgradesInto.map((link) => link.label)).toEqual(["Next District"]);
        expect(model.upgradesInto[0]?.note).toBe("6 adjacent districts");
        expect(model.placementLines).toEqual([
            "Adjacent tile in same region",
            "Cliffs ignored for adjacency",
        ]);
        expect(model.recordNotes).toEqual([
            "Next upgrade has an additional faction trait prerequisite.",
        ]);
        expect(getCodexDistrictReferenceEntryKeys(model)).toEqual([
            "Resource_Luxury01",
            "Tech_Market",
            "District_Previous",
            "District_Next",
        ]);
        expect(hasCodexDistrictReferenceModel(model)).toBe(true);
    });

    it("keeps thin and partially exported district records honest", () => {
        const currentEntry = codexEntry({
            facts: [{ label: "Category", value: "Bridge" }],
        });

        const model = buildCodexDistrictReferenceModel(
            currentEntry,
            {},
            [currentEntry]
        );

        expect(model.profileItems).toEqual(["Bridge"]);
        expect(model.effectLines).toEqual([]);
        expect(model.placementLines).toEqual([
            "Specific terrain, river, and POI restrictions are not available in this view.",
        ]);
        expect(model.recordNotes).toEqual([
            "No public effects exported for this district record.",
            "No public tier exported; archive browsing treats tierless rows as Tier 1.",
            "Rich planning profile is not available for this district.",
        ]);
    });

    it("keeps public description lines when no Effects section exists", () => {
        const currentEntry = codexEntry({
            descriptionLines: ["Level up when surrounded by 4 Districts (Level 2)"],
            facts: [
                { label: "Category", value: "City" },
                { label: "Tier", value: "2" },
            ],
        });

        const model = buildCodexDistrictReferenceModel(
            currentEntry,
            {},
            [currentEntry]
        );

        expect(model.effectLines).toEqual(["Level up when surrounded by 4 Districts (Level 2)"]);
        expect(model.recordNotes).toEqual([
            "Rich planning profile is not available for this district.",
        ]);
    });

    it("does not show missing rich-data notes while district profiles are still loading", () => {
        const currentEntry = codexEntry({
            facts: [{ label: "Category", value: "Bridge" }],
        });

        const model = buildCodexDistrictReferenceModel(
            currentEntry,
            {},
            [currentEntry],
            { richDistrictsLoaded: false }
        );

        expect(model.placementLines).toEqual([]);
        expect(model.recordNotes).toEqual([
            "No public effects exported for this district record.",
            "No public tier exported; archive browsing treats tierless rows as Tier 1.",
        ]);
    });
});
