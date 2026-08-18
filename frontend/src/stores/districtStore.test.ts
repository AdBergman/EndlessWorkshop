import { apiClient } from "@/api/apiClient";
import { useDistrictStore } from "@/stores/districtStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getDistricts: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("useDistrictStore", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        mockedApiClient.getDistricts.mockReset();
    });

    it("indexes districts by normalized key", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: " District_City_Center ",
                displayName: "City Center",
                category: " City ",
                tier: 1,
                constructibleLevel: 0,
                descriptionLines: ["Capital district."],
                constructionCost: [" 120 Industry ", ""],
                descriptorKeys: [" Tag_District_City ", " "],
                referenceKeys: [" Tech_City_Planning "],
                unlockTechnologyKeys: [" Technology_City_Planning ", "", " "],
                isFactionSpecific: false,
                factionKey: " Faction_Aspect ",
                isVariant: true,
                isPlayerFacing: true,
                levelUp: {
                    targetDistrictKey: " District_Tier2_City_Center ",
                    requiredAdjacentDistrictCount: 2,
                    validNeighbourDescriptorKeys: [" Tag_CountInDistrictLevelUp "],
                    validNeighbourUiMapperKey: " District_City_Neighbour ",
                    requiredFactionTraitKeys: [" FactionTrait_City "],
                },
                placementPrerequisites: {
                    neighbourTiles: {
                        operator: " AnyTile ",
                        territoryConstraint: " SameRegion ",
                        ignoreCliff: true,
                    },
                    terrain: {
                        constraint: " Forbidden ",
                        terrainTypeKeys: [" TerrainType_Ocean ", "", " TerrainType_Lake "],
                        canBuildOnWasteland: false,
                        canBuildOnMud: false,
                    },
                    river: {
                        constraint: " NoRiver ",
                    },
                    pointOfInterest: {
                        constraint: " Authorized ",
                        pointOfInterestKeys: [" POI_ResourceDepositLuxury01 ", " "],
                    },
                },
            },
        ]);

        await useDistrictStore.getState().loadDistricts();

        const state = useDistrictStore.getState();
        const district = state.getDistrictByKey("District_City_Center");
        expect(district?.displayName).toBe("City Center");
        expect(district?.category).toBe("City");
        expect(district?.tier).toBe(1);
        expect(district?.constructionCost).toEqual(["120 Industry"]);
        expect(district?.descriptorKeys).toEqual(["Tag_District_City"]);
        expect(district?.referenceKeys).toEqual(["Tech_City_Planning"]);
        expect(district?.isFactionSpecific).toBe(false);
        expect(district?.factionKey).toBe("Faction_Aspect");
        expect(district?.isVariant).toBe(true);
        expect(district?.isPlayerFacing).toBe(true);
        expect(district?.unlockTechnologyKeys).toEqual([
            "Technology_City_Planning",
        ]);
        expect(district?.levelUp).toEqual({
            targetDistrictKey: "District_Tier2_City_Center",
            requiredAdjacentDistrictCount: 2,
            validNeighbourDescriptorKeys: ["Tag_CountInDistrictLevelUp"],
            validNeighbourUiMapperKey: "District_City_Neighbour",
            requiredFactionTraitKeys: ["FactionTrait_City"],
        });
        expect(district?.placementPrerequisites).toEqual({
            neighbourTiles: {
                operator: "AnyTile",
                territoryConstraint: "SameRegion",
                ignoreCliff: true,
            },
            terrain: {
                constraint: "Forbidden",
                terrainTypeKeys: ["TerrainType_Ocean", "TerrainType_Lake"],
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
        });
        expect(state.districtKeys).toEqual(["District_City_Center"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing district lookups", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: " ",
                displayName: "Invalid District",
                descriptionLines: [],
            },
        ]);

        await useDistrictStore.getState().loadDistricts();

        const state = useDistrictStore.getState();
        expect(state.districts).toHaveLength(0);
        expect(state.getDistrictByKey("Missing_District")).toBeUndefined();
    });

    it("keeps duplicate district keys unique and exposes duplicate diagnostics", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: "District_Shared",
                displayName: "First District",
                descriptionLines: [],
            },
            {
                districtKey: "District_Shared",
                displayName: "Second District",
                descriptionLines: [],
            },
        ]);

        await useDistrictStore.getState().loadDistricts();

        const state = useDistrictStore.getState();
        expect(state.districtKeys).toEqual(["District_Shared"]);
        expect(state.duplicateDistrictKeys).toEqual(["District_Shared"]);
        expect(state.getDistrictByKey("District_Shared")?.displayName).toBe("Second District");
    });

    it("avoids duplicate district loads until invalidated or refreshed", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([]);

        await useDistrictStore.getState().loadDistricts();
        await useDistrictStore.getState().loadDistricts();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(1);

        useDistrictStore.getState().invalidateDistricts();
        await useDistrictStore.getState().loadDistricts();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(2);

        await useDistrictStore.getState().refreshDistricts();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(3);
    });
});
