// GameDataContext.ts
import { createContext, useContext } from "react";
import type React from "react";
import { District, Improvement, Tech, Unit, Faction, FactionInfo } from "@/types/dataTypes";
import type { SavedTechBuild } from "@/api/apiClient";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
    units: Map<string, Unit>;

    // Optional setters (useful for refresh flows)
    setTechs?: React.Dispatch<React.SetStateAction<Map<string, Tech>>>;

    // Used after admin save so TechTree base state updates immediately
    refreshTechs?: () => Promise<void>;

    selectedFaction: FactionInfo;
    setSelectedFaction: (faction: FactionInfo) => void;

    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;

    createSavedTechBuild?: (
        name: string,
        selectedFaction: FactionInfo,
        techIds: string[]
    ) => Promise<SavedTechBuild>;

    getSavedBuild?: (uuid: string) => Promise<SavedTechBuild>;

    isProcessingSharedBuild: boolean;
}

const DEFAULT_FACTION: FactionInfo = {
    isMajor: true,
    enumFaction: Faction.KIN,
    minorName: null,
    uiLabel: "kin",
};

const GameDataContext = createContext<GameDataContextType>({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    units: new Map(),

    setTechs: undefined,
    refreshTechs: undefined,

    selectedFaction: DEFAULT_FACTION,
    setSelectedFaction: () => {},

    selectedTechs: [],
    setSelectedTechs: () => {},

    // Return an empty SavedTechBuild-shaped object to satisfy callers.
    // (Provider overrides these anyway.)
    createSavedTechBuild: async () =>
        ({
            uuid: "",
            name: "",
            selectedFaction: "",
            techIds: [],
            createdAt: "",
        } as SavedTechBuild),

    getSavedBuild: async () =>
        ({
            uuid: "",
            name: "",
            selectedFaction: "",
            techIds: [],
            createdAt: "",
        } as SavedTechBuild),

    isProcessingSharedBuild: false,
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;