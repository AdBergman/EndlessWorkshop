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
                descriptionLines: ["Capital district."],
            },
        ]);

        await useDistrictStore.getState().loadDistricts();

        const state = useDistrictStore.getState();
        expect(state.getDistrictByKey("District_City_Center")?.displayName).toBe("City Center");
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
