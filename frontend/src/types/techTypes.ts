// Game data: comes from techtree.json
export interface Tech {
    name: string;
    era: number;
    type: string;
    unlocks: string;
    effect: string[];
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