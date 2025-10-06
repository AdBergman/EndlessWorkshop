import { createContext, useContext } from "react";
import { District, Improvement, Tech } from "@/types/dataTypes";

export interface GameDataContextType {
    districts: Map<string, District>;
    improvements: Map<string, Improvement>;
    techs: Map<string, Tech>;
}

// empty initial context
const GameDataContext = createContext<GameDataContextType>({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;
