import { createContext, useContext } from "react";
import {District, Improvement, Tech, Unit} from "@/types/dataTypes";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
    units: Map<string, Unit>;

    selectedFaction: string;
    setSelectedFaction: (faction: string) => void;

    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;

    createSavedTechBuild?: (name: string, selectedFaction: string, techIds: string[]) => Promise<{ uuid: string }>;
    getSavedBuild?: (uuid: string) => Promise<{ uuid: string; name: string; selectedFaction: string; techIds: string[]; createdAt: string }>;
}

const GameDataContext = createContext<GameDataContextType>({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    units: new Map(),
    selectedFaction: "Kin",
    setSelectedFaction: () => {},
    selectedTechs: [],
    setSelectedTechs: () => {},
    createSavedTechBuild: async () => ({ uuid: "" }),
    getSavedBuild: async () => ({ uuid: "", name: "", selectedFaction: "", techIds: [], createdAt: "" }),
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;
