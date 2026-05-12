import { apiClient } from "@/api/apiClient";
import { useUnitStore } from "@/stores/unitStore";
import type { Unit } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getUnits: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Scout",
    displayName: "Scout",
    artId: null,
    faction: null,
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: null,
    unitClassKey: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("useUnitStore", () => {
    beforeEach(() => {
        useUnitStore.getState().reset();
        mockedApiClient.getUnits.mockReset();
    });

    it("indexes units by normalized key", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: " Unit_Kin_Scout ",
                displayName: "Kin Scout",
                abilityKeys: ["Ability_Scouting"],
            }),
        ]);

        await useUnitStore.getState().loadUnits();

        const state = useUnitStore.getState();
        expect(state.getUnitByKey("Unit_Kin_Scout")?.displayName).toBe("Kin Scout");
        expect(state.unitsByKey.Unit_Kin_Scout?.abilityKeys).toEqual(["Ability_Scouting"]);
        expect(state.unitKeys).toEqual(["Unit_Kin_Scout"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank keys and returns undefined for missing unit lookups", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: " ",
                displayName: "Invalid Unit",
            }),
        ]);

        await useUnitStore.getState().loadUnits();

        const state = useUnitStore.getState();
        expect(state.units).toHaveLength(0);
        expect(state.getUnitByKey("Missing_Unit")).toBeUndefined();
    });

    it("keeps duplicate unit keys unique and exposes duplicate diagnostics", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_Shared",
                displayName: "First Unit",
            }),
            unit({
                unitKey: "Unit_Shared",
                displayName: "Second Unit",
            }),
        ]);

        await useUnitStore.getState().loadUnits();

        const state = useUnitStore.getState();
        expect(state.unitKeys).toEqual(["Unit_Shared"]);
        expect(state.duplicateUnitKeys).toEqual(["Unit_Shared"]);
        expect(state.getUnitByKey("Unit_Shared")?.displayName).toBe("Second Unit");
    });

    it("avoids duplicate unit loads until invalidated or refreshed", async () => {
        mockedApiClient.getUnits.mockResolvedValue([]);

        await useUnitStore.getState().loadUnits();
        await useUnitStore.getState().loadUnits();

        expect(mockedApiClient.getUnits).toHaveBeenCalledTimes(1);

        useUnitStore.getState().invalidateUnits();
        await useUnitStore.getState().loadUnits();

        expect(mockedApiClient.getUnits).toHaveBeenCalledTimes(2);

        await useUnitStore.getState().refreshUnits();

        expect(mockedApiClient.getUnits).toHaveBeenCalledTimes(3);
    });
});
