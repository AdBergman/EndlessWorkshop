import { apiClient } from "@/api/apiClient";
import { useRichSkillStore } from "@/stores/richSkillStore";
import type { RichSkills } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getSkills: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const richSkills = (overrides: Partial<RichSkills> = {}): RichSkills => ({
    skillTrees: [],
    skillTiers: [],
    skills: [],
    heroSkillDefaults: [],
    ...overrides,
});

describe("useRichSkillStore", () => {
    beforeEach(() => {
        useRichSkillStore.getState().reset();
        mockedApiClient.getSkills.mockReset();
    });

    it("indexes skill trees and skills while preserving publicDisplayName and exact refs", async () => {
        mockedApiClient.getSkills.mockResolvedValue(richSkills({
            skillTrees: [{
                treeKey: " HeroSkillTree_Archer ",
                treeType: "Class",
                isHidden: false,
                tierPlacementKeys: ["HeroSkillTree_Archer::HeroSkillTier_Archer_1"],
                tierKeys: ["HeroSkillTier_Archer_1"],
                skillKeys: ["HeroSkill_Archer02"],
                referenceKeys: ["HeroClass_Archer"],
                classPrerequisiteKey: " HeroClass_Archer ",
                factionPrerequisiteKey: null,
            }],
            skills: [{
                skillKey: " HeroSkill_Archer02 ",
                entryKey: "HeroSkill_Archer02",
                kind: "HeroSkill",
                displayName: "HeroSkill_Archer02",
                publicDisplayName: "Terrain Logistics",
                primaryAbilityKey: " UnitAbility_Hero_Archer02 ",
                descriptionLines: [],
                resolvedDisplayName: "Terrain Logistics",
                resolvedSummaryLines: ["[DoubleArrow] Gain 5 [Experience] Experience"],
                resolvedMechanicKind: "reaction",
                resolvedMechanicTags: ["hero"],
                isObsolete: false,
                isActive: false,
                isPassive: true,
                placements: [{ treeKey: "HeroSkillTree_Archer", tierIndex: 0 }],
                prerequisiteSkillKeys: [],
                inhibitedBySkillKeys: [],
                lockedBySkillKeys: [],
                effects: [{ typeName: "SimulationEventEffect_ApplyUnitAbilityOnHero" }],
                unitAbilityKeys: ["UnitAbility_Hero_Archer02"],
                battleSkillKeys: [],
                battleAbilityKeys: [],
                descriptorKeys: [],
                unitAbilityEventKeys: ["UnitAbility_Hero_EventDefinition_Archer02"],
                rewardPerKillInBattleEffectKeys: [],
                statAffinityNames: [],
                defaultForHeroKeys: ["Hero_KinOfSheredyn_Archer_2"],
                referenceKeys: ["UnitAbility_Hero_Archer02"],
            }],
            heroSkillDefaults: [{
                heroKey: " Hero_KinOfSheredyn_Archer_2 ",
                defaultSkillKeys: [" HeroSkill_Archer02 "],
                referenceKeys: [" Faction_KinOfSheredyn "],
                factionKey: " Faction_KinOfSheredyn ",
                classKey: " HeroClass_Archer ",
            }],
        }));

        await useRichSkillStore.getState().loadSkills();

        const state = useRichSkillStore.getState();
        expect(state.getSkillTreeByKey("HeroSkillTree_Archer")?.classPrerequisiteKey).toBe("HeroClass_Archer");
        expect(state.getSkillByKey("HeroSkill_Archer02")?.publicDisplayName).toBe("Terrain Logistics");
        expect(state.getSkillByKey("HeroSkill_Archer02")?.primaryAbilityKey).toBe("UnitAbility_Hero_Archer02");
        expect(state.getSkillByKey("HeroSkill_Archer02")?.placements).toEqual([
            { treeKey: "HeroSkillTree_Archer", tierIndex: 0 },
        ]);
        expect(state.heroSkillDefaultsByHeroKey.Hero_KinOfSheredyn_Archer_2?.defaultSkillKeys)
            .toEqual(["HeroSkill_Archer02"]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });
});
