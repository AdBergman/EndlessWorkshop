export type StepMode = "pct" | "px";
export type AdminCoords = { xPct: number; yPct: number };

export type AdminPlacementDraft = {
    techKey: string; // identity (not displayed)
    name: string;    // display
    type: string;
    era: number;
    coords: AdminCoords;
};

export type AdminStagedRow = {
    techKey: string; // identity (not displayed)
    name: string;    // display
    summary?: string;
};

export type AdminSaveMessage = {
    kind: "idle" | "ok" | "err";
    text: string;
};