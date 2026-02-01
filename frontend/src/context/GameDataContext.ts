import { createContext, useContext } from "react";
import type React from "react";
import { District, Improvement, Tech, Unit, Faction } from "@/types/dataTypes";
import { FactionInfo } from "@/utils/factionIdentity";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
    units: Map<string, Unit>;

    // Optional setters (useful for refresh flows)
    setTechs?: React.Dispatch<React.SetStateAction<Map<string, Tech>>>;

    // NEW: used after admin save so TechTree base state updates immediately
    refreshTechs?: () => Promise<void>;

    selectedFaction: FactionInfo;
    setSelectedFaction: (faction: FactionInfo) => void;

    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;

    createSavedTechBuild?: (
        name: string,
        selectedFaction: FactionInfo,
        techIds: string[]
    ) => Promise<{ uuid: string }>;

    getSavedBuild?: (
        uuid: string
    ) => Promise<{
        uuid: string;
        name: string;
        selectedFaction: FactionInfo;
        techIds: string[];
        createdAt: string;
    }>;

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

    // default no-ops (provider will override)
    setTechs: undefined,
    refreshTechs: undefined,

    selectedFaction: DEFAULT_FACTION,
    setSelectedFaction: () => {},

    selectedTechs: [],
    setSelectedTechs: () => {},

    createSavedTechBuild: async () => ({ uuid: "" }),
    getSavedBuild: async () => ({
        uuid: "",
        name: "",
        selectedFaction: DEFAULT_FACTION,
        techIds: [],
        createdAt: "",
    }),

    isProcessingSharedBuild: false,
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;