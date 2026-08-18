import {
    buildCodexConstructibleRichEnrichment,
    getCodexConstructibleRichEnrichmentEntryKeys,
    hasCodexConstructibleRichEnrichment,
} from "@/lib/codex/codexConstructibleRichEnrichment";
import type { CodexEntry, District, Improvement } from "@/types/dataTypes";

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

const richImprovement = (overrides: Partial<Improvement>): Improvement => ({
    improvementKey: "Improvement_Current",
    displayName: "Current Improvement",
    descriptionLines: [],
    unique: "City",
    cost: [],
    unlockTechnologyKeys: [],
    placementPrerequisites: null,
    ...overrides,
});

describe("buildCodexConstructibleRichEnrichment", () => {
    it("resolves district unlock tech and upgrade links from exact public Codex entries for legacy callers", () => {
        const currentEntry = codexEntry({
            exportKind: "districts",
            entryKey: "District_Current",
        });
        const entries = [
            currentEntry,
            codexEntry({
                exportKind: "tech",
                entryKey: "Tech_Irrigation",
                displayName: "Irrigation",
            }),
            codexEntry({
                exportKind: "districts",
                entryKey: "District_GrandCanal",
                displayName: "Grand Canal",
            }),
        ];

        const enrichment = buildCodexConstructibleRichEnrichment(
            currentEntry,
            {
                District_Current: richDistrict({
                    districtKey: "District_Current",
                    tier: 1,
                    constructibleLevel: 2,
                    constructionCost: ["120 Industry"],
                    isFactionSpecific: true,
                    unlockTechnologyKeys: ["Tech_Irrigation", "Tech_Missing"],
                    levelUp: {
                        targetDistrictKey: "District_GrandCanal",
                        requiredAdjacentDistrictCount: 3,
                    },
                    placementPrerequisites: {
                        neighbourTiles: {
                            operator: "AnyTile",
                            territoryConstraint: "SameRegion",
                            ignoreCliff: true,
                        },
                        terrain: {
                            constraint: "Forbidden",
                            terrainTypeKeys: ["TerrainType_Ocean", "TerrainType_CoastalWater"],
                            canBuildOnWasteland: false,
                            canBuildOnMud: false,
                        },
                        river: {
                            constraint: "NoRiver",
                        },
                        pointOfInterest: {
                            constraint: "NoResourceDeposit",
                            pointOfInterestKeys: [],
                        },
                    },
                }),
            },
            {},
            entries
        );

        expect(enrichment.profileLines).toEqual([
            "Tier 1",
            "Constructible level 2",
            "Faction-specific variant",
            "Cost: 120 Industry",
        ]);
        expect(enrichment.unlockedBy.map((link) => link.label)).toEqual(["Irrigation"]);
        expect(enrichment.upgradesInto.map((link) => link.label)).toEqual(["Grand Canal"]);
        expect(enrichment.upgradesInto[0]?.note).toBe("3 adjacent districts");
        expect(enrichment.placementLines).toEqual([
            "Adjacent tile in same region",
            "Forbidden terrain: Ocean, Coastal Water",
            "Cannot build on wasteland",
            "Cannot build on mud",
            "No river",
            "No resource deposit",
        ]);
        expect(getCodexConstructibleRichEnrichmentEntryKeys(enrichment)).toEqual([
            "Tech_Irrigation",
            "District_GrandCanal",
        ]);
        expect(hasCodexConstructibleRichEnrichment(enrichment)).toBe(true);
    });

    it("resolves improvement unlock tech while omitting unsafe placement and unresolved links", () => {
        const currentEntry = codexEntry({
            exportKind: "improvements",
            entryKey: "Improvement_Current",
        });
        const entries = [
            currentEntry,
            codexEntry({
                exportKind: "tech",
                entryKey: "Tech_Gardening",
                displayName: "Gardening",
            }),
            codexEntry({
                exportKind: "districts",
                entryKey: "District_NotAnImprovementLink",
                displayName: "Not an improvement link",
            }),
        ];

        const enrichment = buildCodexConstructibleRichEnrichment(
            currentEntry,
            {},
            {
                Improvement_Current: richImprovement({
                    improvementKey: "Improvement_Current",
                    unlockTechnologyKeys: ["Tech_Gardening", "District_NotAnImprovementLink"],
                    placementPrerequisites: {
                        neighbourTiles: {
                            operator: "SpecificTerrain",
                            territoryConstraint: "SameRegion",
                            ignoreCliff: null,
                        },
                    },
                }),
            },
            entries
        );

        expect(enrichment.unlockedBy.map((link) => link.label)).toEqual(["Gardening"]);
        expect(enrichment.upgradesInto).toEqual([]);
        expect(enrichment.placementLines).toEqual([]);
    });

    it("renders authorized point-of-interest placement from rich extractor data", () => {
        const currentEntry = codexEntry({
            exportKind: "districts",
            entryKey: "Extractor_Luxury01",
            displayName: "[Luxury01] Klax Extractor",
        });

        const enrichment = buildCodexConstructibleRichEnrichment(
            currentEntry,
            {
                Extractor_Luxury01: richDistrict({
                    districtKey: "Extractor_Luxury01",
                    placementPrerequisites: {
                        terrain: {
                            constraint: "Forbidden",
                            terrainTypeKeys: ["TerrainType_River"],
                            canBuildOnWasteland: false,
                            canBuildOnMud: false,
                        },
                        river: {
                            constraint: "NoRiver",
                        },
                        pointOfInterest: {
                            constraint: "Authorized",
                            pointOfInterestKeys: ["POI_ResourceDepositLuxury01"],
                        },
                    },
                }),
            },
            {},
            [currentEntry]
        );

        expect(enrichment.placementLines).toEqual([
            "Forbidden terrain: River",
            "Cannot build on wasteland",
            "Cannot build on mud",
            "No river",
            "Requires: Resource Deposit Luxury 01",
        ]);
    });

    it("fails closed when the rich record is missing", () => {
        const currentEntry = codexEntry({
            exportKind: "districts",
            entryKey: "District_Current",
        });

        const enrichment = buildCodexConstructibleRichEnrichment(
            currentEntry,
            {},
            {},
            [currentEntry]
        );

        expect(enrichment).toEqual({ profileLines: [], unlockedBy: [], upgradesInto: [], placementLines: [] });
        expect(hasCodexConstructibleRichEnrichment(enrichment)).toBe(false);
    });
});
