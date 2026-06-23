import {
    buildCodexHeroRichEnrichment,
    getCodexHeroRichEnrichmentEntryKeys,
    hasCodexHeroRichEnrichment,
} from "@/lib/codex/codexHeroRichEnrichment";
import type { CodexEntry, Hero, HeroSkill, HeroSkillDefault, SkillTier, SkillTree } from "@/types/dataTypes";

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
    tierPlacementKeys: ["HeroSkillTree_Archer::HeroSkillTier_Archer_1"],
    tierKeys: ["HeroSkillTier_Archer_1"],
    skillKeys: ["HeroSkill_Archer02"],
    referenceKeys: [],
    classPrerequisiteKey: null,
    factionPrerequisiteKey: null,
    ...overrides,
});

const skillTier = (overrides: Partial<SkillTier>): SkillTier => ({
    tierPlacementKey: "HeroSkillTree_Archer::HeroSkillTier_Archer_1",
    tierKey: "HeroSkillTier_Archer_1",
    treeKey: "HeroSkillTree_Archer",
    treeType: "Class",
    tierIndex: 0,
    levelPrerequisite: 0,
    skillKeys: ["HeroSkill_Archer02"],
    referenceKeys: [],
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
                HeroSkillTree_Faction: skillTree({
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierPlacementKeys: [
                        "HeroSkillTree_Faction::HeroSkillTier_Faction_2",
                        "HeroSkillTree_Faction::HeroSkillTier_Common_2",
                    ],
                }),
                HeroSkillTree_Synergy: skillTree({
                    treeKey: "HeroSkillTree_Synergy",
                    treeType: "Synergy",
                    tierPlacementKeys: [],
                }),
            },
            {
                "HeroSkillTree_Archer::HeroSkillTier_Archer_1": skillTier({}),
                "HeroSkillTree_Faction::HeroSkillTier_Faction_2": skillTier({
                    tierPlacementKey: "HeroSkillTree_Faction::HeroSkillTier_Faction_2",
                    tierKey: "HeroSkillTier_Faction_2",
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierIndex: 1,
                    levelPrerequisite: 4,
                    skillKeys: ["HeroSkill_Faction02"],
                }),
                "HeroSkillTree_Faction::HeroSkillTier_Common_2": skillTier({
                    tierPlacementKey: "HeroSkillTree_Faction::HeroSkillTier_Common_2",
                    tierKey: "HeroSkillTier_Common_2",
                    treeKey: "HeroSkillTree_Faction",
                    treeType: "Faction",
                    tierIndex: 4,
                    levelPrerequisite: 4,
                    skillKeys: ["HeroSkill_Common02"],
                }),
            },
            {
                HeroSkill_Archer02: skill({}),
                HeroSkill_Faction02: skill({
                    skillKey: "HeroSkill_Faction02",
                    publicDisplayName: "Patient Mentor",
                    primaryAbilityKey: "UnitAbility_Missing",
                    resolvedSummaryLines: ["Gain 5 [Experience] Experience"],
                }),
                HeroSkill_Common02: skill({
                    skillKey: "HeroSkill_Common02",
                    publicDisplayName: "Tireless Pace",
                    primaryAbilityKey: null,
                    resolvedSummaryLines: ["Gain 1 [Movement] Movement"],
                }),
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
        expect(enrichment.skillOptions.map((tree) => tree.label)).toEqual(["Class", "Faction"]);
        expect(enrichment.skillOptions[0]?.unlockGroups[0]).toMatchObject({
            unlockThreshold: 0,
        });
        expect(enrichment.skillOptions[0]?.unlockGroups[0]?.skills[0]?.label).toBe("Terrain Logistics");
        expect(enrichment.skillOptions[1]?.unlockGroups).toHaveLength(1);
        expect(enrichment.skillOptions[1]?.unlockGroups[0]).toMatchObject({
            unlockThreshold: 4,
        });
        expect(enrichment.skillOptions[1]?.unlockGroups[0]?.skills.map((option) => option.label)).toEqual([
            "Patient Mentor",
            "Tireless Pace",
        ]);
        expect(enrichment.skillOptions[1]?.unlockGroups[0]?.skills[0]?.primaryAbility).toBeNull();
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
            hasCodexHeroRichEnrichment(buildCodexHeroRichEnrichment(current, {}, {}, {}, {}, {}, [current]))
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
                HeroSkillTree_Class: skillTree({
                    treeKey: "HeroSkillTree_Class",
                    treeType: "Class",
                    tierPlacementKeys: ["HeroSkillTree_Class::HeroSkillTier_Class_1"],
                }),
            },
            {
                "HeroSkillTree_Class::HeroSkillTier_Class_1": skillTier({
                    tierPlacementKey: "HeroSkillTree_Class::HeroSkillTier_Class_1",
                    treeKey: "HeroSkillTree_Class",
                    skillKeys: ["HeroSkill_Raw", "HeroSkill_Archer02"],
                }),
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
        expect(enrichment.skillOptions.map((tree) => tree.label)).toEqual(["Class"]);
        expect(enrichment.skillOptions[0]?.unlockGroups[0]?.skills.map((option) => option.label)).toEqual([
            "Terrain Logistics",
        ]);
        expect(enrichment.skillOptions[0]?.unlockGroups[0]?.skills[0]?.primaryAbility).toBeNull();
    });
});
