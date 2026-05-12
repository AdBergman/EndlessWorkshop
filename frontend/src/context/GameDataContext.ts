import { createContext, useContext } from "react";
import type { SavedTechBuild } from "@/api/apiClient";
import type { FactionInfo } from "@/types/dataTypes";

export interface GameDataContextType {
    createSavedTechBuild?: (
        name: string,
        faction: FactionInfo,
        techIds: string[]
    ) => Promise<SavedTechBuild>;

    getSavedBuild?: (uuid: string) => Promise<SavedTechBuild>;

    isProcessingSharedBuild: boolean;
}

const EMPTY_SAVED_BUILD: SavedTechBuild = {
    uuid: "",
    name: "",
    selectedFaction: "",
    techIds: [],
    createdAt: "",
};

const GameDataContext = createContext<GameDataContextType>({
    createSavedTechBuild: async () => EMPTY_SAVED_BUILD,
    getSavedBuild: async () => EMPTY_SAVED_BUILD,

    isProcessingSharedBuild: false,
});

export const useGameData = () => useContext(GameDataContext);
export default GameDataContext;
