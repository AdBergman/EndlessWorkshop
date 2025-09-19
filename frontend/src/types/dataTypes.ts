// Game data: comes from techTree.json
export interface Tech {
    name: string;
    era: number;
    type: string;
    unlocks: string[];
    effects: string[];
    prereq: string;
    faction: string;
}

// UI data: comes from techUI.json
export interface TechUIItem {
    name: string;
    coords: { xPct: number; yPct: number };
}

export interface TechUI {
    boxSize: { widthPct: number; heightPct: number };
    items: TechUIItem[];
}

export interface NavigationButtons {
    boxSize: { widthPct: number; heightPct: number };
    previous: { xPct: number; yPct: number };
    next: { xPct: number; yPct: number };
}

// Wrapper for the full tech UI JSON
export interface TechUIData {
    techs: TechUI;
    navigationButtons: NavigationButtons;
}

export interface Improvement {
    name: string;
    era?: number;          // optional if you link it to tech era
    effects: string[];
    unique: "City" | "District";
    industryCost?: number; // optional, if you later track it
    cost: string[];        // strategic resource costs only
}