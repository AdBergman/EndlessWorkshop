import {
    DEFAULT_DISTRICT_ARCHIVE_FILTERS,
    buildDistrictArchiveFilterGroups,
    filterDistrictEntriesByArchiveFilters,
} from "@/lib/codex/codexDistrictArchiveFilters";
import type { CodexEntry, District } from "@/types/dataTypes";

function districtEntry(overrides: Partial<CodexEntry>): CodexEntry {
    return {
        exportKind: "districts",
        entryKey: "District_Current",
        displayName: "Current District",
        descriptionLines: [],
        referenceKeys: [],
        facts: [
            { label: "Category", value: "Food" },
            { label: "Tier", value: "1" },
        ],
        ...overrides,
    };
}

function richDistrict(overrides: Partial<District>): District {
    return {
        districtKey: "District_Current",
        displayName: "Current District",
        descriptionLines: [],
        unlockTechnologyKeys: [],
        levelUp: null,
        placementPrerequisites: null,
        ...overrides,
    };
}

describe("codexDistrictArchiveFilters", () => {
    it("builds and applies placement filters from rich District placement fields", () => {
        const entries = [
            districtEntry({ entryKey: "District_Farm", displayName: "Farm" }),
            districtEntry({
                entryKey: "Extractor_Luxury01",
                displayName: "Klax Extractor",
                facts: [
                    { label: "Category", value: "Resource" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({ entryKey: "District_River", displayName: "River Port" }),
        ];
        const richDistrictByKey = {
            District_Farm: richDistrict({
                districtKey: "District_Farm",
                isFactionSpecific: false,
                placementPrerequisites: {
                    neighbourTiles: {
                        operator: "AnyTile",
                        territoryConstraint: "SameRegion",
                        ignoreCliff: true,
                    },
                    terrain: {
                        constraint: "Forbidden",
                        terrainTypeKeys: ["TerrainTypeOcean"],
                        canBuildOnWasteland: false,
                        canBuildOnMud: false,
                    },
                },
            }),
            Extractor_Luxury01: richDistrict({
                districtKey: "Extractor_Luxury01",
                isFactionSpecific: true,
                factionKey: "Necrophage",
                placementPrerequisites: {
                    pointOfInterest: {
                        constraint: "Authorized",
                        pointOfInterestKeys: ["POI_ResourceDepositLuxury01"],
                    },
                },
            }),
            District_River: richDistrict({
                districtKey: "District_River",
                isFactionSpecific: false,
                placementPrerequisites: {
                    river: { constraint: "RiverNormal" },
                },
            }),
        };

        const groups = buildDistrictArchiveFilterGroups(
            entries,
            DEFAULT_DISTRICT_ARCHIVE_FILTERS,
            richDistrictByKey
        );
        const typeGroup = groups.find((group) => group.key === "type");
        const placementGroup = groups.find((group) => group.key === "placement");
        const factionGroup = groups.find((group) => group.key === "faction");

        expect(typeGroup?.options).toEqual([
            { value: "coreYield", label: "Core yield", count: 2 },
            { value: "resourceExtractor", label: "Resource extractor", count: 1 },
        ]);

        expect(placementGroup?.options).toEqual([
            { value: "normalExpansion", label: "Normal expansion", count: 1 },
            { value: "river", label: "River", count: 1 },
            { value: "resourceDeposit", label: "Resource deposit", count: 1 },
            { value: "pointOfInterest", label: "Point of interest", count: 1 },
            { value: "terrainRestricted", label: "Terrain restricted", count: 1 },
        ]);
        expect(factionGroup?.options).toEqual([
            { value: "universal", label: "Universal", count: 2 },
            { value: "Necrophage", label: "Necrophages", count: 1 },
        ]);

        expect(filterDistrictEntriesByArchiveFilters(
            entries,
            { ...DEFAULT_DISTRICT_ARCHIVE_FILTERS, placement: "resourceDeposit" },
            null,
            richDistrictByKey
        ).map((entry) => entry.entryKey)).toEqual(["Extractor_Luxury01"]);
    });
});
