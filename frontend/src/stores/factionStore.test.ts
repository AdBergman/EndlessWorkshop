import { apiClient } from "@/api/apiClient";
import { useFactionStore } from "@/stores/factionStore";
import type { RichFaction } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getFactions: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const faction = (overrides: Partial<RichFaction>): RichFaction => ({
    factionKey: "Faction_Aspect",
    publicDisplayName: "Aspects",
    lore: null,
    factionKind: "major",
    affinityKey: null,
    affinityType: null,
    traitKeys: [],
    populationKeys: [],
    unitKeys: [],
    baseUnitKeys: [],
    heroKeys: [],
    gatedTechnologyKeys: [],
    startingFactionQuestKey: null,
    specificQuestKeys: [],
    protectorateTraitKeys: [],
    ...overrides,
});

describe("useFactionStore", () => {
    beforeEach(() => {
        useFactionStore.getState().reset();
        mockedApiClient.getFactions.mockReset();
    });

    it("indexes rich factions by normalized key and preserves exact relationship keys", async () => {
        mockedApiClient.getFactions.mockResolvedValue([
            faction({
                factionKey: " Faction_Aspect ",
                publicDisplayName: "Aspects",
                traitKeys: [" Trait_Aspect_Cohabitation ", ""],
                populationKeys: ["Population_Aspect"],
                unitKeys: ["Unit_Aspect_Scout"],
                baseUnitKeys: ["Unit_Aspect_Scout"],
                heroKeys: ["Hero_Aspect_Archer_0"],
                gatedTechnologyKeys: ["Aspect_Technology_00"],
                startingFactionQuestKey: " FactionQuest_Aspect_Chapter01_Step01 ",
                specificQuestKeys: [" FactionQuest_Aspect_Chapter02_Step01 "],
                protectorateTraitKeys: [" Trait_Protectorate_Coral "],
            }),
        ]);

        await useFactionStore.getState().loadFactions();

        const state = useFactionStore.getState();
        expect(state.getFactionByKey("Faction_Aspect")?.publicDisplayName).toBe("Aspects");
        expect(state.factionsByKey.Faction_Aspect?.traitKeys).toEqual(["Trait_Aspect_Cohabitation"]);
        expect(state.factionsByKey.Faction_Aspect?.populationKeys).toEqual(["Population_Aspect"]);
        expect(state.factionsByKey.Faction_Aspect?.unitKeys).toEqual(["Unit_Aspect_Scout"]);
        expect(state.factionsByKey.Faction_Aspect?.baseUnitKeys).toEqual(["Unit_Aspect_Scout"]);
        expect(state.factionsByKey.Faction_Aspect?.heroKeys).toEqual(["Hero_Aspect_Archer_0"]);
        expect(state.factionsByKey.Faction_Aspect?.gatedTechnologyKeys).toEqual(["Aspect_Technology_00"]);
        expect(state.factionsByKey.Faction_Aspect?.startingFactionQuestKey)
            .toBe("FactionQuest_Aspect_Chapter01_Step01");
        expect(state.factionsByKey.Faction_Aspect?.specificQuestKeys)
            .toEqual(["FactionQuest_Aspect_Chapter02_Step01"]);
        expect(state.factionsByKey.Faction_Aspect?.protectorateTraitKeys).toEqual(["Trait_Protectorate_Coral"]);
        expect(state.factionKeys).toEqual(["Faction_Aspect"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing faction lookups", async () => {
        mockedApiClient.getFactions.mockResolvedValue([
            faction({
                factionKey: " ",
                publicDisplayName: "Invalid Faction",
            }),
        ]);

        await useFactionStore.getState().loadFactions();

        const state = useFactionStore.getState();
        expect(state.factions).toHaveLength(0);
        expect(state.getFactionByKey("Missing_Faction")).toBeUndefined();
    });

    it("keeps duplicate faction keys unique and exposes duplicate diagnostics", async () => {
        mockedApiClient.getFactions.mockResolvedValue([
            faction({
                factionKey: "Faction_Shared",
                publicDisplayName: "First Faction",
            }),
            faction({
                factionKey: "Faction_Shared",
                publicDisplayName: "Second Faction",
            }),
        ]);

        await useFactionStore.getState().loadFactions();

        const state = useFactionStore.getState();
        expect(state.factionKeys).toEqual(["Faction_Shared"]);
        expect(state.duplicateFactionKeys).toEqual(["Faction_Shared"]);
        expect(state.getFactionByKey("Faction_Shared")?.publicDisplayName).toBe("Second Faction");
    });

    it("avoids duplicate faction loads until invalidated or refreshed", async () => {
        mockedApiClient.getFactions.mockResolvedValue([]);

        await useFactionStore.getState().loadFactions();
        await useFactionStore.getState().loadFactions();

        expect(mockedApiClient.getFactions).toHaveBeenCalledTimes(1);

        useFactionStore.getState().invalidateFactions();
        await useFactionStore.getState().loadFactions();

        expect(mockedApiClient.getFactions).toHaveBeenCalledTimes(2);

        await useFactionStore.getState().refreshFactions();

        expect(mockedApiClient.getFactions).toHaveBeenCalledTimes(3);
    });
});
