import { getRawIcon } from "./iconManifest";

const CODEX_KIND_ICON_RAW_KEYS: Record<string, string> = {
    actions: "allArmiesSortStance",
    action: "allArmiesSortStance",
    abilities: "reminderTypeHeroSpecializationAvailable",
    ability: "reminderTypeHeroSpecializationAvailable",
    councilors: "reminderTypeMandatoryCouncilReshufflePending",
    councilor: "reminderTypeMandatoryCouncilReshufflePending",
    districts: "factionTrait_Custom_Specific38",
    district: "factionTrait_Custom_Specific38",
    diplomatictreaties: "factionTrait_Diplomacy_Belligerent",
    diplomatictreaty: "factionTrait_Diplomacy_Belligerent",
    extractors: "factionTrait_Common_StartingResources",
    extractor: "factionTrait_Common_StartingResources",
    equipment: "addRandomEquipmentRewardTypeNothingShared",
    factions: "questCategoryTypeMajorFaction",
    faction: "questCategoryTypeMajorFaction",
    heroes: "aspect_EraEffectDefinition_Hero_00",
    hero: "aspect_EraEffectDefinition_Hero_00",
    improvements: "cityConstructionModeImprovement",
    improvement: "cityConstructionModeImprovement",
    minorfactions: "reminderTypeProtectorateAvailable",
    minorfaction: "reminderTypeProtectorateAvailable",
    populations: "status_PublicOpinion_DivinePopulation",
    population: "status_PublicOpinion_DivinePopulation",
    quests: "hudWindowEmpireControlsQuest",
    quest: "hudWindowEmpireControlsQuest",
    tech: "aspect_Technology_00",
    techs: "aspect_Technology_00",
    technology: "aspect_Technology_00",
    technologies: "aspect_Technology_00",
    traits: "breakdownSourcesTypesDeeds",
    trait: "breakdownSourcesTypesDeeds",
    units: "resourceUnit",
    unit: "resourceUnit",
};

function normalizeCodexKind(kind: string): string {
    return kind.trim().toLowerCase();
}

export function getCodexKindIconPath(kind: string): string | null {
    const rawKey = CODEX_KIND_ICON_RAW_KEYS[normalizeCodexKind(kind)];
    return rawKey ? getRawIcon(rawKey) : null;
}

export function getConfiguredCodexKindIconPaths(): string[] {
    return Array.from(new Set(Object.values(CODEX_KIND_ICON_RAW_KEYS).map(getRawIcon).filter((path): path is string => !!path)));
}
