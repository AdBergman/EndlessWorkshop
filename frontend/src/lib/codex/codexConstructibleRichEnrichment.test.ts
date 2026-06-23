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
    it("resolves district unlock tech and upgrade links from exact public Codex entries", () => {
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
                    },
                }),
            },
            {},
            entries
        );

        expect(enrichment.unlockedBy.map((link) => link.label)).toEqual(["Irrigation"]);
        expect(enrichment.upgradesInto.map((link) => link.label)).toEqual(["Grand Canal"]);
        expect(enrichment.upgradesInto[0]?.note).toBe("3 adjacent districts");
        expect(enrichment.placementLines).toEqual(["Adjacent tile in same region"]);
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

        expect(enrichment).toEqual({ unlockedBy: [], upgradesInto: [], placementLines: [] });
        expect(hasCodexConstructibleRichEnrichment(enrichment)).toBe(false);
    });
});
