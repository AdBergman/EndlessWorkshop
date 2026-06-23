import {
    buildCodexHeroRichEnrichment,
    getCodexHeroRichEnrichmentEntryKeys,
    hasCodexHeroRichEnrichment,
} from "@/lib/codex/codexHeroRichEnrichment";
import type { CodexEntry, Hero, HeroSkill, HeroSkillDefault, SkillTree } from "@/types/dataTypes";

const codexHero = (entryKey: string, displayName: string): CodexEntry => ({
    exportKind: "heroes",
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
    facts: [{ label: "Class", value: "Archer" }],
});

const codexEntry = (entryKey: string, displayName: string, exportKind = "abilities"): CodexEntry => ({
    exportKind,
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const hero = (overrides: Partial<Hero>): Hero => ({
    unitKey: "Hero_Current",
    displayName: "Current Hero",
    faction: null,
    factionKey: null,
    isMajorFaction: true,
    heroKey: "Hero_Current",
    heroClassKey: "HeroClass_Archer",
    originKind: "majorFaction",
    originFactionKey: "Faction_Kin",
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

const skillTree = (overrides: Partial<SkillTree>): SkillTree => ({
    treeKey: "HeroSkillTree_Archer",
    treeType: "Class",
    isHidden: false,
    tierPlacementKeys: [],
    tierKeys: [],
    skillKeys: [],
    referenceKeys: [],
    classPrerequisiteKey: null,
    factionPrerequisiteKey: null,
    ...overrides,
});

const skill = (overrides: Partial<HeroSkill>): HeroSkill => ({
    skillKey: "HeroSkill_Archer02",
    entryKey: "HeroSkill_Archer02",
    kind: "HeroSkill",
    displayName: "HeroSkill_Archer02",
    publicDisplayName: "Terrain Logistics",
    primaryAbilityKey: "UnitAbility_Hero_Archer02",
    descriptionLines: [],
    resolvedDisplayName: "Terrain Logistics",
    resolvedSummaryLines: ["Gain 5 [Experience] Experience"],
    resolvedMechanicKind: "reaction",
    resolvedMechanicTags: [],
    isObsolete: false,
    isActive: false,
    isPassive: true,
    placements: [],
    prerequisiteSkillKeys: [],
    inhibitedBySkillKeys: [],
    lockedBySkillKeys: [],
    effects: [],
    unitAbilityKeys: [],
    battleSkillKeys: [],
    battleAbilityKeys: [],
    descriptorKeys: [],
    unitAbilityEventKeys: [],
    rewardPerKillInBattleEffectKeys: [],
    statAffinityNames: [],
    defaultForHeroKeys: [],
    referenceKeys: [],
    ...overrides,
});

const skillDefault = (overrides: Partial<HeroSkillDefault>): HeroSkillDefault => ({
    heroKey: "Hero_Current",
    defaultSkillKeys: ["HeroSkill_Archer02"],
    referenceKeys: [],
    factionKey: null,
    classKey: null,
    ...overrides,
});

describe("codexHeroRichEnrichment", () => {
    it("builds a compact Hero profile from exact rich hero and skill data", () => {
        const current = codexHero("Hero_Current", "Current Hero");
        const origin = codexEntry("Faction_Kin", "Kin of Sheredyn", "factions");
        const ability = codexEntry("UnitAbility_Hero_Archer02", "Terrain Logistics", "abilities");

        const enrichment = buildCodexHeroRichEnrichment(
            current,
            {
                Hero_Current: hero({
                    applicableSkillTreeKeys: [
                        "HeroSkillTree_Archer",
                        "HeroSkillTree_Faction",
                        "HeroSkillTree_Synergy",
                    ],
                }),
            },
            {
                HeroSkillTree_Archer: skillTree({ treeKey: "HeroSkillTree_Archer", treeType: "Class" }),
                HeroSkillTree_Faction: skillTree({ treeKey: "HeroSkillTree_Faction", treeType: "Faction" }),
                HeroSkillTree_Synergy: skillTree({ treeKey: "HeroSkillTree_Synergy", treeType: "Synergy" }),
            },
            {
                HeroSkill_Archer02: skill({}),
            },
            {
                Hero_Current: skillDefault({}),
            },
            [current, origin, ability]
        );

        expect(enrichment.origin?.label).toBe("Kin of Sheredyn");
        expect(enrichment.classLabel).toBe("Archer");
        expect(enrichment.skillPathTypes).toEqual(["Class", "Faction", "Synergy"]);
        expect(enrichment.startingSkills.map((defaultSkill) => defaultSkill.label)).toEqual(["Terrain Logistics"]);
        expect(enrichment.startingSkills[0]?.primaryAbility?.label).toBe("Terrain Logistics");
        expect(hasCodexHeroRichEnrichment(enrichment)).toBe(true);
        expect(getCodexHeroRichEnrichmentEntryKeys(enrichment)).toEqual([
            "Faction_Kin",
            "UnitAbility_Hero_Archer02",
        ]);
    });

    it("fails closed for missing rich data, wrong-kind links, hidden abilities, and raw skill labels", () => {
        const current = codexHero("Hero_Current", "Current Hero");
        const wrongKindOrigin = codexEntry("Faction_Kin", "Wrong Kind", "tech");
        const wrongKindAbility = codexEntry("UnitAbility_Hero_Archer02", "Wrong Kind Ability", "statuses");

        expect(
            hasCodexHeroRichEnrichment(buildCodexHeroRichEnrichment(current, {}, {}, {}, {}, [current]))
        ).toBe(false);

        const enrichment = buildCodexHeroRichEnrichment(
            current,
            {
                Hero_Current: hero({
                    hiddenHelperAbilityKeys: ["UnitAbility_Hero_Archer02"],
                    applicableSkillTreeKeys: ["HeroSkillTree_Hidden", "HeroSkillTree_Class"],
                }),
            },
            {
                HeroSkillTree_Hidden: skillTree({
                    treeKey: "HeroSkillTree_Hidden",
                    treeType: "Hidden",
                    isHidden: true,
                }),
                HeroSkillTree_Class: skillTree({ treeKey: "HeroSkillTree_Class", treeType: "Class" }),
            },
            {
                HeroSkill_Raw: skill({
                    skillKey: "HeroSkill_Raw",
                    publicDisplayName: null,
                    resolvedDisplayName: "HeroSkill_Raw",
                    primaryAbilityKey: "UnitAbility_Hero_Archer02",
                }),
                HeroSkill_Archer02: skill({ primaryAbilityKey: "UnitAbility_Hero_Archer02" }),
            },
            {
                Hero_Current: skillDefault({ defaultSkillKeys: ["HeroSkill_Raw", "HeroSkill_Archer02"] }),
            },
            [current, wrongKindOrigin, wrongKindAbility]
        );

        expect(enrichment.origin).toBeNull();
        expect(enrichment.skillPathTypes).toEqual(["Class"]);
        expect(enrichment.startingSkills.map((defaultSkill) => defaultSkill.label)).toEqual(["Terrain Logistics"]);
        expect(enrichment.startingSkills[0]?.primaryAbility).toBeNull();
    });
});
