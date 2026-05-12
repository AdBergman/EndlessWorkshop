import { apiClient } from "@/api/apiClient";
import { getTechsByKeys, useTechStore } from "@/stores/techStore";
import type { Tech } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getTechs: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

describe("useTechStore", () => {
    beforeEach(() => {
        useTechStore.getState().reset();
        mockedApiClient.getTechs.mockReset();
    });

    it("indexes techs by normalized key", async () => {
        mockedApiClient.getTechs.mockResolvedValue([
            tech({
                techKey: " Tech_Kin_Workshop ",
                name: "Kin Workshop",
                factions: ["kin"],
                descriptionLines: ["Build better tools."],
            }),
        ]);

        await useTechStore.getState().loadTechs();

        const state = useTechStore.getState();
        expect(state.getTechByKey("Tech_Kin_Workshop")?.name).toBe("Kin Workshop");
        expect(state.techsByKey.Tech_Kin_Workshop?.factions).toEqual(["KIN"]);
        expect(state.techKeys).toEqual(["Tech_Kin_Workshop"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing tech lookups", async () => {
        mockedApiClient.getTechs.mockResolvedValue([
            tech({
                techKey: " ",
                name: "Invalid Tech",
            }),
        ]);

        await useTechStore.getState().loadTechs();

        const state = useTechStore.getState();
        expect(state.techs).toHaveLength(0);
        expect(state.getTechByKey("Missing_Tech")).toBeUndefined();
        expect(state.getTechByKey(" ")).toBeUndefined();
    });

    it("derives tech records from key lists without owning selection state", async () => {
        mockedApiClient.getTechs.mockResolvedValue([
            tech({
                techKey: "Tech_First",
                name: "First Tech",
            }),
            tech({
                techKey: "Tech_Second",
                name: "Second Tech",
            }),
        ]);

        await useTechStore.getState().loadTechs();

        expect(
            getTechsByKeys(["Tech_Second", "Missing_Tech", " Tech_First "], useTechStore.getState().techsByKey)
                .map((resolvedTech) => resolvedTech.name)
        ).toEqual(["Second Tech", "First Tech"]);
    });

    it("keeps duplicate tech keys unique and exposes duplicate diagnostics", async () => {
        mockedApiClient.getTechs.mockResolvedValue([
            tech({
                techKey: "Tech_Shared",
                name: "First Tech",
            }),
            tech({
                techKey: "Tech_Shared",
                name: "Second Tech",
            }),
        ]);

        await useTechStore.getState().loadTechs();

        const state = useTechStore.getState();
        expect(state.techKeys).toEqual(["Tech_Shared"]);
        expect(state.duplicateTechKeys).toEqual(["Tech_Shared"]);
        expect(state.getTechByKey("Tech_Shared")?.name).toBe("Second Tech");
    });

    it("avoids duplicate tech loads until invalidated or refreshed", async () => {
        mockedApiClient.getTechs.mockResolvedValue([]);

        await useTechStore.getState().loadTechs();
        await useTechStore.getState().loadTechs();

        expect(mockedApiClient.getTechs).toHaveBeenCalledTimes(1);

        useTechStore.getState().invalidateTechs();
        await useTechStore.getState().loadTechs();

        expect(mockedApiClient.getTechs).toHaveBeenCalledTimes(2);

        await useTechStore.getState().refreshTechs();

        expect(mockedApiClient.getTechs).toHaveBeenCalledTimes(3);
    });
});
