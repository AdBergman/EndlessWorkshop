export type TechCoords = {
    xPct: number;
    yPct: number;
};

export type TechUnlockRef = {
    unlockType: string;
    unlockKey: string;
};

export interface Unit {
    unitKey: string;
    displayName: string;
    artId: string | null;

    isHero: boolean;
    isChosen: boolean;

    spawnType: string | null;

    previousUnitKey: string | null;
    nextEvolutionUnitKeys: string[];

    evolutionTierIndex: number | null;

    unitClassKey: string | null;
    attackSkillKey: string | null;

    abilityKeys: string[];
    descriptionLines: string[];
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