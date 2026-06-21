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
}

export type CodexEntry = Codex;

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
