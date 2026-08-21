import { vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useFactionStore } from "@/stores/factionStore";
import { useHeroStore } from "@/stores/heroStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useSkillStore } from "@/stores/skillStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import {
    buildCodexIdentityIndexes,
    buildEntriesByKey,
    buildEntriesByKindKey,
    codexIdentityFromEntry,
} from "@/lib/codex/codexRefs";
import { seedDefaultCodexStore } from "@/pages/testUtils/codexPageTestUtils";
import type {
    CodexEntry,
    District,
    Hero,
    HeroSkill,
    Improvement,
    RichFaction,
    Skills,
    SkillTier,
    SkillTree,
    Tech,
    Unit,
} from "@/types/dataTypes";

export function seedCodexEntries(entries: CodexEntry[]) {
    const identities = entries.map(codexIdentityFromEntry);
    useCodexStore.setState({
        identities,
        ...buildCodexIdentityIndexes(identities),
        identityLoaded: true,
        identityLoading: false,
        identityError: null,
        entries,
        entriesByKey: buildEntriesByKey(entries),
        entriesByKind: entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
            acc[entry.exportKind] = [...(acc[entry.exportKind] ?? []), entry];
            return acc;
        }, {}),
        entriesByKindKey: buildEntriesByKindKey(entries),
        loading: false,
        error: null,
        fullLoaded: true,
    });
}

export function getSummaryRowForButton(button: HTMLElement): HTMLElement {
    const row = button.closest(".codex-summaryList__item");
    if (!(row instanceof HTMLElement)) {
        throw new Error("Expected summary button to be inside a summary row.");
    }

    return row;
}

export const richTech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Current",
    name: "Current Tech",
    era: 1,
    type: "Discovery",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

export const richUnit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Current",
    displayName: "Current Unit",
    artId: null,
    faction: null,
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: "Land",
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    unitClassDisplayName: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

export const richDistrict = (overrides: Partial<District>): District => ({
    districtKey: "District_Current",
    displayName: "Current District",
    descriptionLines: [],
    unlockTechnologyKeys: [],
    levelUp: null,
    placementPrerequisites: null,
    ...overrides,
});

export const richImprovement = (overrides: Partial<Improvement>): Improvement => ({
    improvementKey: "Improvement_Current",
    displayName: "Current Improvement",
    descriptionLines: [],
    unique: "City",
    cost: [],
    unlockTechnologyKeys: [],
    placementPrerequisites: null,
    ...overrides,
});

export const richFaction = (overrides: Partial<RichFaction>): RichFaction => ({
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

export const heroFixture = (overrides: Partial<Hero>): Hero => ({
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

export const heroSkillTree = (overrides: Partial<SkillTree>): SkillTree => ({
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

export const heroSkillTier = (overrides: Partial<SkillTier>): SkillTier => ({
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

export const heroSkill = (overrides: Partial<HeroSkill>): HeroSkill => ({
    skillKey: "HeroSkill_Archer02",
    entryKey: "HeroSkill_Archer02",
    kind: "HeroSkill",
    displayName: "HeroSkill_Archer02",
    publicDisplayName: "Terrain Logistics",
    primaryAbilityKey: "UnitAbility_Hero_Archer02",
    descriptionLines: [],
    resolvedDisplayName: "Terrain Logistics",
    resolvedSummaryLines: ["Gain 5 [Experience] Experience to all Units of the Army"],
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

export function seedRichUnits(units: Unit[]) {
    useUnitStore.setState({
        units,
        unitsByKey: units.reduce<Record<string, Unit>>((acc, unit) => {
            acc[unit.unitKey] = unit;
            return acc;
        }, {}),
        unitKeys: units.map((unit) => unit.unitKey),
        duplicateUnitKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

export function seedRichDistricts(districts: District[]) {
    useDistrictStore.setState({
        districts,
        districtsByKey: districts.reduce<Record<string, District>>((acc, district) => {
            acc[district.districtKey] = district;
            return acc;
        }, {}),
        districtKeys: districts.map((district) => district.districtKey),
        duplicateDistrictKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

export function seedRichImprovements(improvements: Improvement[]) {
    useImprovementStore.setState({
        improvements,
        improvementsByKey: improvements.reduce<Record<string, Improvement>>((acc, improvement) => {
            acc[improvement.improvementKey] = improvement;
            return acc;
        }, {}),
        improvementKeys: improvements.map((improvement) => improvement.improvementKey),
        duplicateImprovementKeys: [],
        loading: false,
        loaded: true,
        error: null,
    });
}

export function seedRichFactions(factions: RichFaction[]) {
    useFactionStore.getState().replaceFactions(factions);
}

export function seedHeroes(heroes: Hero[]) {
    useHeroStore.getState().replaceHeroes(heroes);
}

export function seedSkills(skills: Partial<Skills>) {
    useSkillStore.getState().replaceSkills({
        skillTrees: [],
        skillTiers: [],
        skills: [],
        heroSkillDefaults: [],
        ...skills,
    });
}

export function seedShallowReferenceLayoutEntries() {
    seedCodexEntries([
        {
            exportKind: "councilors",
            entryKey: "Councilor_Atea",
            displayName: "Atea",
            category: "Defense",
            kind: "Councilor",
            descriptionLines: ["Public councilor."],
            referenceKeys: [],
            publicContextKeys: [
                "CouncilorEffect_Defense21",
                "PartnerEffect_Hydracorn_PartnerTrait01",
            ],
        },
        {
            exportKind: "councilorEffects",
            entryKey: "CouncilorEffect_Defense21",
            displayName: "Travels Well",
            category: "Defense",
            kind: "Councilor Effect",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Role", value: "Defense" },
                { label: "Kind", value: "Councilor Effect" },
            ],
            sections: [{
                title: "Effects",
                lines: ["+100% [HealthRegen] Health Regeneration in Guard stance"],
            }],
            publicContextKeys: ["CouncilorEffect_Defense21"],
        },
        {
            exportKind: "partnerEffects",
            entryKey: "PartnerEffect_Hydracorn_PartnerTrait01",
            displayName: "Hopeless Romantic",
            category: "Hero",
            kind: "Partner Effect",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Scope", value: "Hero" },
                { label: "Kind", value: "Partner Effect" },
            ],
            sections: [{
                title: "Effects",
                lines: ["+1 [MovementPoints] Movement Points outside battle"],
            }],
            publicContextKeys: ["PartnerEffect_Hydracorn_PartnerTrait01"],
        },
        {
            exportKind: "resources",
            entryKey: "Resource_Luxury01",
            displayName: "Klax",
            category: null,
            kind: "Resource",
            descriptionLines: [],
            referenceKeys: [],
            facts: [{ label: "Type", value: "Luxury resource" }],
            sections: [{ title: "Effects", lines: ["+15 [PublicOrderColored] Approval on City"] }],
        },
        {
            exportKind: "traits",
            entryKey: "Trait_DaughterOfBor",
            displayName: "Fierce Independence",
            category: "Protectorate",
            kind: "Trait",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Trait" },
                { label: "Trait type", value: "Protectorate" },
            ],
            sections: [{ title: "Effects", lines: ["+3 [Defense] Defense on Unit"] }],
        },
        {
            exportKind: "traits",
            entryKey: "Trait_HarmoniousTactics",
            displayName: "Harmonious Tactics",
            category: "Faction",
            kind: "Trait",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Trait" },
                { label: "Trait type", value: "Faction" },
            ],
            sections: [{
                title: "Effects",
                lines: ["Allied Units get [Damage] Damage bonus until the end of the round."],
            }],
        },
        {
            exportKind: "tech",
            entryKey: "Technology_Test",
            displayName: "Test Technology",
            descriptionLines: ["Unlocks a test technology."],
            referenceKeys: [],
        },
        {
            exportKind: "modifiers",
            entryKey: "Modifier_Test",
            displayName: "Hidden Modifier",
            descriptionLines: [],
            referenceKeys: [],
        },
    ]);
}

export function seedActionArchiveEntries() {
    seedCodexEntries([
        {
            exportKind: "actions",
            entryKey: "ActionTypeBuildBridge",
            displayName: "Build Bridge",
            category: "Action",
            kind: "Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Action" },
                { label: "Category", value: "Action" },
            ],
            sections: [{
                title: "Action mechanics",
                items: [{
                    label: "Money cost multiplier",
                    facts: [
                        { label: "Affected cost", value: "Money" },
                        { label: "Modifier", value: "-100%" },
                    ],
                }],
            }],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeKinBuildChosen",
            displayName: "Kin Build Chosen",
            category: "Faction Action",
            kind: "Faction Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Faction Action" },
                { label: "Category", value: "Faction Action" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeMukagLight01",
            displayName: "Mukag Light",
            category: "Empire Action",
            kind: "Empire Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Empire Action" },
                { label: "Category", value: "Empire Action" },
                { label: "UI category", value: "Light" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeRepairDistrict",
            displayName: "Repair District",
            category: "Constructible Action",
            kind: "Constructible Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Constructible Action" },
                { label: "Category", value: "Constructible Action" },
                { label: "Action type", value: "Repair District" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeTerraformationEnrich",
            displayName: "Terraformation Enrich",
            category: "Terraforming Action",
            kind: "Terraforming Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Terraforming Action" },
                { label: "Category", value: "Terraforming Action" },
                { label: "Action type", value: "Terraformation Enrich" },
            ],
        },
        {
            exportKind: "actions",
            entryKey: "ActionTypeMove",
            displayName: "Move",
            category: "Army Action",
            kind: "Army Action",
            descriptionLines: [],
            referenceKeys: [],
            facts: [
                { label: "Kind", value: "Army Action" },
                { label: "Category", value: "Army Action" },
            ],
        },
        {
            exportKind: "tech",
            entryKey: "Technology_Test",
            displayName: "Test Technology",
            descriptionLines: ["Unlocks a test technology."],
            referenceKeys: [],
        },
    ]);
}
export function resetCodexPageStores() {
    useCodexStore.getState().reset();
    useDistrictStore.getState().reset();
    useFactionStore.getState().reset();
    useHeroStore.getState().reset();
    useImprovementStore.getState().reset();
    useSkillStore.getState().reset();
    useTechStore.getState().reset();
    useUnitStore.getState().reset();
    seedRichDistricts([]);
    seedRichImprovements([]);
    seedRichFactions([]);
    seedHeroes([]);
    seedSkills({});
    seedDefaultCodexStore();
}

export function mockDefaultCodexPageApi() {
    vi.spyOn(apiClient, "getCodexIdentities").mockResolvedValue([]);
    vi.spyOn(apiClient, "getDataFreshness").mockResolvedValue({
        available: false,
        latestImportAtUtc: null,
        game: null,
        gameVersion: null,
        exporterVersion: null,
        exportedAtUtc: null,
        sourceLabel: null,
        importedFileCount: 0,
        importedKinds: [],
        note: null,
    });
    vi.spyOn(apiClient, "getCodexSummary").mockResolvedValue([]);
}

export function resetCodexPageTestState() {
    resetCodexPageStores();
    mockDefaultCodexPageApi();
}

export function cleanupCodexPageStores() {
    useCodexStore.getState().reset();
    useDistrictStore.getState().reset();
    useFactionStore.getState().reset();
    useHeroStore.getState().reset();
    useImprovementStore.getState().reset();
    useSkillStore.getState().reset();
    useTechStore.getState().reset();
    useUnitStore.getState().reset();
}
