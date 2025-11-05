export interface Unit {
    name: string;
    description: string;
    type: string;
    health: number;
    defense: number;
    minDamage: number;
    maxDamage: number;
    movementPoints: number;
    costs: string[];
    skills: string[];
    faction: string;
    tier: number;
    upkeep: number;
    upgradesTo: string[];
    artId: string | null;
}

export interface Tech {
    name: string;
    era: number;
    type: string;
    unlocks: string[];
    effects: string[];
    prereq: string;
    factions: string[];
    excludes: string;
    coords: { xPct: number; yPct: number };
}

export interface Improvement {
    name: string;
    effects: string[];
    unique: "City" | "District";
    industryCost?: number; // optional, if you later track it
    cost: string[];        // strategic resource costs only
}

export interface District {
    name: string;                   // e.g., "Marketplace"
    info?: [string]
    effect?: string;              // e.g., ["+10 Happiness", "+5 Gold"]
    tileBonus?: string[];             // e.g., ["+2 Food on Plains"]
    adjacencyBonus?: string[];       // e.g., ["+1 Gold for adjacent Market"]
    placementPrereq?: string;       // optional, e.g., "Adjacent to River"
}

export const ERA_THRESHOLDS: Record<number, number> = {
    1: 0,   // Era 1 is always unlocked
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
};