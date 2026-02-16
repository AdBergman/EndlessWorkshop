import { createContext, useContext } from "react";
import type React from "react";
import { District, Improvement, Tech, Unit, Faction, FactionInfo } from "@/types/dataTypes";
import type { SavedTechBuild } from "@/api/apiClient";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
    units: Map<string, Unit>;

    setTechs?: React.Dispatch<React.SetStateAction<Map<string, Tech>>>;
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

const EMPTY_SAVED_BUILD: SavedTechBuild = {
    uuid: "",
    name: "",
    selectedFaction: "",
    techIds: [],
    createdAt: "",
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

    createSavedTechBuild: async () => EMPTY_SAVED_BUILD,
    getSavedBuild: async () => EMPTY_SAVED_BUILD,

    isProcessingSharedBuild: false,
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;