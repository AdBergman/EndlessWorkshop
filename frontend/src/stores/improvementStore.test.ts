import { apiClient } from "@/api/apiClient";
import { useImprovementStore } from "@/stores/improvementStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getImprovements: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("useImprovementStore", () => {
    beforeEach(() => {
        useImprovementStore.getState().reset();
        mockedApiClient.getImprovements.mockReset();
    });

    it("indexes improvements by normalized key", async () => {
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: " Improvement_Public_Library ",
                displayName: "Public Library",
                descriptionLines: ["+10 Science"],
                unique: "City",
                cost: ["100 Industry"],
            },
        ]);

        await useImprovementStore.getState().loadImprovements();

        const state = useImprovementStore.getState();
        expect(state.getImprovementByKey("Improvement_Public_Library")?.displayName).toBe(
            "Public Library"
        );
        expect(state.improvementKeys).toEqual(["Improvement_Public_Library"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing improvement lookups", async () => {
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: " ",
                displayName: "Invalid Improvement",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
        ]);

        await useImprovementStore.getState().loadImprovements();

        const state = useImprovementStore.getState();
        expect(state.improvements).toHaveLength(0);
        expect(state.getImprovementByKey("Missing_Improvement")).toBeUndefined();
    });

    it("keeps duplicate improvement keys unique and exposes duplicate diagnostics", async () => {
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

        await useImprovementStore.getState().loadImprovements();

        const state = useImprovementStore.getState();
        expect(state.improvementKeys).toEqual(["Improvement_Shared"]);
        expect(state.duplicateImprovementKeys).toEqual(["Improvement_Shared"]);
        expect(state.getImprovementByKey("Improvement_Shared")?.displayName).toBe(
            "Second Improvement"
        );
    });

    it("avoids duplicate improvement loads until invalidated or refreshed", async () => {
        mockedApiClient.getImprovements.mockResolvedValue([]);

        await useImprovementStore.getState().loadImprovements();
        await useImprovementStore.getState().loadImprovements();

        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(1);

        useImprovementStore.getState().invalidateImprovements();
        await useImprovementStore.getState().loadImprovements();

        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(2);

        await useImprovementStore.getState().refreshImprovements();

        expect(mockedApiClient.getImprovements).toHaveBeenCalledTimes(3);
    });
});
