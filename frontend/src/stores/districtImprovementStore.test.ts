import { apiClient } from "@/api/apiClient";
import { useDistrictImprovementStore } from "@/stores/districtImprovementStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getDistricts: vi.fn(),
        getImprovements: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("useDistrictImprovementStore", () => {
    beforeEach(() => {
        useDistrictImprovementStore.getState().reset();
        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
    });

    it("indexes districts and improvements by normalized key", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: " District_City_Center ",
                displayName: "City Center",
                descriptionLines: ["Capital district."],
            },
        ]);
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: " Improvement_Public_Library ",
                displayName: "Public Library",
                descriptionLines: ["+10 Science"],
                unique: "City",
                cost: ["100 Industry"],
            },
        ]);

        await useDistrictImprovementStore.getState().load();

        const state = useDistrictImprovementStore.getState();
        expect(state.getDistrictByKey("District_City_Center")?.displayName).toBe("City Center");
        expect(state.getImprovementByKey("Improvement_Public_Library")?.displayName).toBe("Public Library");
        expect(state.districtKeys).toEqual(["District_City_Center"]);
        expect(state.improvementKeys).toEqual(["Improvement_Public_Library"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing lookups", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: " ",
                displayName: "Invalid District",
                descriptionLines: [],
            },
        ]);
        mockedApiClient.getImprovements.mockResolvedValue([]);

        await useDistrictImprovementStore.getState().load();

        const state = useDistrictImprovementStore.getState();
        expect(state.districts).toHaveLength(0);
        expect(state.getDistrictByKey("Missing_District")).toBeUndefined();
        expect(state.getImprovementByKey("Missing_Improvement")).toBeUndefined();
    });

    it("keeps duplicate keys unique and exposes duplicate diagnostics", async () => {
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
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: "Improvement_Shared",
                displayName: "First Improvement",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
            {
                improvementKey: "Improvement_Shared",
                displayName: "Second Improvement",
                descriptionLines: [],
                unique: "District",
                cost: [],
            },
        ]);

        await useDistrictImprovementStore.getState().load();

        const state = useDistrictImprovementStore.getState();
        expect(state.districtKeys).toEqual(["District_Shared"]);
        expect(state.improvementKeys).toEqual(["Improvement_Shared"]);
        expect(state.duplicateDistrictKeys).toEqual(["District_Shared"]);
        expect(state.duplicateImprovementKeys).toEqual(["Improvement_Shared"]);
        expect(state.getDistrictByKey("District_Shared")?.displayName).toBe("Second District");
        expect(state.getImprovementByKey("Improvement_Shared")?.displayName).toBe("Second Improvement");
    });

    it("keeps equal district and improvement keys in separate domain indexes", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: "Shared_Constructible_Key",
                displayName: "Shared District",
                descriptionLines: ["District text"],
            },
        ]);
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: "Shared_Constructible_Key",
                displayName: "Shared Improvement",
                descriptionLines: ["Improvement text"],
                unique: "City",
                cost: [],
            },
        ]);

        await useDistrictImprovementStore.getState().load();

        const state = useDistrictImprovementStore.getState();
        expect(state.getDistrictByKey("Shared_Constructible_Key")?.displayName).toBe("Shared District");
        expect(state.getImprovementByKey("Shared_Constructible_Key")?.displayName).toBe("Shared Improvement");
        expect(state.districtsByKey.Shared_Constructible_Key).toMatchObject({
            districtKey: "Shared_Constructible_Key",
        });
        expect(state.improvementsByKey.Shared_Constructible_Key).toMatchObject({
            improvementKey: "Shared_Constructible_Key",
        });
        expect(state.duplicateDistrictKeys).toEqual([]);
        expect(state.duplicateImprovementKeys).toEqual([]);
    });

    it("avoids duplicate loads until invalidated or refreshed", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([]);
        mockedApiClient.getImprovements.mockResolvedValue([]);

        await useDistrictImprovementStore.getState().load();
        await useDistrictImprovementStore.getState().load();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(1);
        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(1);

        useDistrictImprovementStore.getState().invalidate();
        await useDistrictImprovementStore.getState().load();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(2);
        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(2);

        await useDistrictImprovementStore.getState().refresh();

        expect(mockedApiClient.getDistricts).toHaveBeenCalledTimes(3);
        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(3);
    });
});
