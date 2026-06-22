export type TechCoords = {
    xPct: number;
    yPct: number;
};

export type TechUnlockRef = {
    unlockType: string;
    unlockKey: string;
    unlockCategory?: string | null;
    constructibleKind?: string | null;
    fallbackDescriptionLines?: string[] | null;
};

export interface Unit {
    unitKey: string;
    displayName: string;
    artId: string | null;

    faction: string | null;
    isMajorFaction: boolean;

    isHero: boolean;
    isChosen: boolean;

    spawnType: string | null;

    previousUnitKey: string | null;
    nextEvolutionUnitKeys: string[];

    evolutionTierIndex: number | null;

    unitClassKey: string | null;
    unitClassDisplayName?: string | null;
    attackSkillKey: string | null;

    abilityKeys: string[];
    descriptionLines: string[];
    veterancyProgressionLines?: string[];
}

export interface Tech {
    techKey: string;
    name: string;
    era: number;
    type: string;

    unlocks: TechUnlockRef[];
    descriptionLines: string[];

    prereq: string | null;
    factions: string[];
    excludes: string | null;
    technologyPrerequisiteTechKeys?: string[] | null;
    exclusiveTechnologyPrerequisiteTechKeys?: string[] | null;

    coords: TechCoords;
}

export interface Improvement {
    improvementKey: string;
    displayName: string;
    descriptionLines: string[];
    unique: "City" | "District";
    cost: string[];
}

export interface District {
    districtKey: string;
    displayName: string;
    descriptionLines: string[];
}

export interface CodexMetadataFact {
    label: string;
    value: string;
    referenceKey?: string | null;
}

export interface CodexMetadataSectionItem {
    label: string;
    referenceKey?: string | null;
    facts?: CodexMetadataFact[];
    lines?: string[];
}

export interface CodexMetadataSection {
    title: string;
    lines?: string[];
    items?: CodexMetadataSectionItem[];
}

export interface CodexSvgIcon {
    source: string;
    key: string;
}

export interface Codex {
    exportKind: string;
    entryKey: string;
    displayName: string;
    category?: string | null;
    kind?: string | null;
    descriptionLines: string[];
    referenceKeys: string[];
    facts?: CodexMetadataFact[];
    sections?: CodexMetadataSection[];
    publicContextKeys?: string[];
    svgIcon?: CodexSvgIcon | null;
}

export type CodexEntry = Codex;

export interface RichFaction {
    factionKey: string;
    publicDisplayName: string;
    lore: string | null;
    factionKind: string | null;
    affinityKey: string | null;
    affinityType: string | null;
    traitKeys: string[];
    populationKeys: string[];
    unitKeys: string[];
    baseUnitKeys: string[];
    heroKeys: string[];
    gatedTechnologyKeys: string[];
    startingFactionQuestKey: string | null;
    specificQuestKeys: string[];
    protectorateTraitKeys: string[];
}

export interface RichHero {
    unitKey: string;
    displayName: string;
    faction: string | null;
    factionKey: string | null;
    isMajorFaction: boolean | null;
    heroKey: string | null;
    heroClassKey: string | null;
    originKind: string | null;
    originFactionKey: string | null;
    minorFactionKey: string | null;
    unitClassKey: string | null;
    attackSkillKey: string | null;
    ownAbilityKeys: string[];
    abilityKeys: string[];
    combatAbilityKeys: string[];
    tacticalAbilityKeys: string[];
    passiveAbilityKeys: string[];
    mechanicalAbilityKeys: string[];
    classRuleAbilityKeys: string[];
    hiddenHelperAbilityKeys: string[];
    defaultSkillKeys: string[];
    applicableSkillTreeKeys: string[];
    descriptionLines: string[];
    referenceKeys: string[];
}

export interface RichSkillTree {
    treeKey: string;
    treeType: string | null;
    isHidden: boolean | null;
    tierPlacementKeys: string[];
    tierKeys: string[];
    skillKeys: string[];
    referenceKeys: string[];
    classPrerequisiteKey: string | null;
    factionPrerequisiteKey: string | null;
}

export interface RichSkillTier {
    tierPlacementKey: string;
    tierKey: string | null;
    treeKey: string | null;
    treeType: string | null;
    tierIndex: number | null;
    levelPrerequisite: number | null;
    skillKeys: string[];
    referenceKeys: string[];
}

export interface RichHeroSkill {
    skillKey: string;
    entryKey: string | null;
    kind: string | null;
    displayName: string | null;
    publicDisplayName: string | null;
    primaryAbilityKey: string | null;
    descriptionLines: string[];
    resolvedDisplayName: string | null;
    resolvedSummaryLines: string[];
    resolvedMechanicKind: string | null;
    resolvedMechanicTags: string[];
    isObsolete: boolean | null;
    isActive: boolean | null;
    isPassive: boolean | null;
    placements: Array<Record<string, unknown>>;
    prerequisiteSkillKeys: string[];
    inhibitedBySkillKeys: string[];
    lockedBySkillKeys: string[];
    effects: Array<Record<string, unknown>>;
    unitAbilityKeys: string[];
    battleSkillKeys: string[];
    battleAbilityKeys: string[];
    descriptorKeys: string[];
    unitAbilityEventKeys: string[];
    rewardPerKillInBattleEffectKeys: string[];
    statAffinityNames: string[];
    defaultForHeroKeys: string[];
    referenceKeys: string[];
}

export interface RichHeroSkillDefault {
    heroKey: string;
    defaultSkillKeys: string[];
    referenceKeys: string[];
    factionKey: string | null;
    classKey: string | null;
}

export interface RichSkills {
    skillTrees: RichSkillTree[];
    skillTiers: RichSkillTier[];
    skills: RichHeroSkill[];
    heroSkillDefaults: RichHeroSkillDefault[];
}

export const ERA_THRESHOLDS: Record<number, number> = {
    1: 0,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
};

export enum Faction {
    KIN = "KIN",
    LORDS = "LORDS",
    ASPECTS = "ASPECTS",
    NECROPHAGES = "NECROPHAGES",
    TAHUK = "TAHUK"
}

export interface FactionInfo {
    isMajor: boolean;
    enumFaction: Faction | null;
    uiLabel: string;
    minorName: string | null;
}
