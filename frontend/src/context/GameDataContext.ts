import { createContext, useContext } from "react";
import { District, Improvement, Tech } from "@/types/dataTypes";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;

    selectedFaction: string;
    setSelectedFaction: (faction: string) => void;

    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;

    createSavedTechBuild?: (name: string, techIds: string[]) => Promise<{ uuid: string }>;
    getSavedBuild?: (uuid: string) => Promise<{ uuid: string; name: string; techIds: string[]; createdAt: string }>;
}

const GameDataContext = createContext<GameDataContextType>({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    selectedFaction: "Kin",
    setSelectedFaction: () => {},
    selectedTechs: [],
    setSelectedTechs: () => {},
    createSavedTechBuild: async () => ({ uuid: "" }),
    getSavedBuild: async () => ({ uuid: "", name: "", techIds: [], createdAt: "" }),
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;
