import { apiClient } from "@/api/apiClient";
import { useRichHeroStore } from "@/stores/richHeroStore";
import type { RichHero } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getHeroes: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const hero = (overrides: Partial<RichHero>): RichHero => ({
    unitKey: "Hero_KinOfSheredyn_Archer_2",
    displayName: "Lieutenant Brezvez",
    faction: "Kin",
    factionKey: "Faction_KinOfSheredyn",
    isMajorFaction: true,
    heroKey: "Hero_KinOfSheredyn_Archer_2",
    heroClassKey: "HeroClass_Archer",
    originKind: "majorFaction",
    originFactionKey: "Faction_KinOfSheredyn",
    minorFactionKey: null,
    unitClassKey: "UnitClass_Ranged_Hero",
    attackSkillKey: null,
    ownAbilityKeys: [],
    abilityKeys: [],
    combatAbilityKeys: [],
    tacticalAbilityKeys: [],
    passiveAbilityKeys: [],
    mechanicalAbilityKeys: [],
    classRuleAbilityKeys: [],
    hiddenHelperAbilityKeys: [],
    defaultSkillKeys: [],
    applicableSkillTreeKeys: [],
    descriptionLines: [],
    referenceKeys: [],
    ...overrides,
});

describe("useRichHeroStore", () => {
    beforeEach(() => {
        useRichHeroStore.getState().reset();
        mockedApiClient.getHeroes.mockReset();
    });

    it("indexes rich heroes by unitKey and preserves exact relationship arrays", async () => {
        mockedApiClient.getHeroes.mockResolvedValue([
            hero({
                unitKey: " Hero_KinOfSheredyn_Archer_2 ",
                defaultSkillKeys: [" HeroSkill_Archer02 ", ""],
                applicableSkillTreeKeys: [" HeroSkillTree_Archer "],
                hiddenHelperAbilityKeys: [" UnitAbility_Prototype_HeroUnit "],
                referenceKeys: [" HeroSkill_Archer02 "],
            }),
        ]);

        await useRichHeroStore.getState().loadHeroes();

        const state = useRichHeroStore.getState();
        expect(state.getHeroByKey("Hero_KinOfSheredyn_Archer_2")?.displayName).toBe("Lieutenant Brezvez");
        expect(state.heroesByKey.Hero_KinOfSheredyn_Archer_2?.defaultSkillKeys).toEqual(["HeroSkill_Archer02"]);
        expect(state.heroesByKey.Hero_KinOfSheredyn_Archer_2?.applicableSkillTreeKeys).toEqual(["HeroSkillTree_Archer"]);
        expect(state.heroesByKey.Hero_KinOfSheredyn_Archer_2?.hiddenHelperAbilityKeys)
            .toEqual(["UnitAbility_Prototype_HeroUnit"]);
        expect(state.heroesByKey.Hero_KinOfSheredyn_Archer_2?.referenceKeys).toEqual(["HeroSkill_Archer02"]);
        expect(state.heroKeys).toEqual(["Hero_KinOfSheredyn_Archer_2"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank hero keys and exposes duplicate diagnostics", async () => {
        mockedApiClient.getHeroes.mockResolvedValue([
            hero({ unitKey: " " }),
            hero({ unitKey: "Hero_Shared", displayName: "First" }),
            hero({ unitKey: "Hero_Shared", displayName: "Second" }),
        ]);

        await useRichHeroStore.getState().loadHeroes();

        const state = useRichHeroStore.getState();
        expect(state.heroKeys).toEqual(["Hero_Shared"]);
        expect(state.duplicateHeroKeys).toEqual(["Hero_Shared"]);
        expect(state.getHeroByKey("Hero_Shared")?.displayName).toBe("Second");
        expect(state.getHeroByKey("Missing_Hero")).toBeUndefined();
    });
});
