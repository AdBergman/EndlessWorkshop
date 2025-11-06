import { createContext, useContext } from "react";
import {District, Improvement, Tech, Unit, Faction} from "@/types/dataTypes";
import { FactionInfo } from "@/utils/factionIdentity";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
    units: Map<string, Unit>;

    selectedFaction: FactionInfo;
    setSelectedFaction: (faction: FactionInfo) => void;

    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;

    createSavedTechBuild?: (name: string, selectedFaction: FactionInfo, techIds: string[]) => Promise<{ uuid: string }>;
    getSavedBuild?: (uuid: string) => Promise<{ uuid: string; name: string; selectedFaction: FactionInfo; techIds: string[]; createdAt: string }>;
}

const GameDataContext = createContext<GameDataContextType>({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    units: new Map(),
    selectedFaction: { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "kin" },
    setSelectedFaction: () => {},
    selectedTechs: [],
    setSelectedTechs: () => {},
    createSavedTechBuild: async () => ({ uuid: "" }),
    getSavedBuild: async () => ({ uuid: "", name: "", selectedFaction: { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "kin" }, techIds: [], createdAt: "" }),
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;
