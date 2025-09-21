// Game data: comes from techTree.json
export interface Tech {
    name: string;
    era: number;
    type: string;
    unlocks: string[];
    effects: string[];
    prereq: string;
    faction: string[];
    excludes: string;
    coords: { xPct: number; yPct: number };
}

export interface Improvement {
    name: string;
    era?: number;          // optional if you link it to tech era
    effects: string[];
    unique: "City" | "District";
    industryCost?: number; // optional, if you later track it
    cost: string[];        // strategic resource costs only
}

export const ERA_THRESHOLDS: Record<number, number> = {
    1: 0,   // Era 1 is always unlocked
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
};