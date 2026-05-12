import type { SavedTechBuild } from "@/api/apiClient";
import type { FactionInfo } from "@/types/dataTypes";
import { useGameData } from "./GameDataContext";

type CreateSavedTechBuild = (
    name: string,
    selectedFaction: FactionInfo,
    techIds: string[]
) => Promise<SavedTechBuild>;

type GetSavedBuild = (uuid: string) => Promise<SavedTechBuild>;

export type AppOrchestration = {
    isProcessingSharedBuild: boolean;
};

export type SavedTechBuildCommands = {
    createSavedTechBuild?: CreateSavedTechBuild;
    getSavedBuild?: GetSavedBuild;
};

export function useAppOrchestration(): AppOrchestration {
    const { isProcessingSharedBuild } = useGameData();

    return {
        isProcessingSharedBuild,
    };
}

export function useShareProcessingGate(): boolean {
    return useAppOrchestration().isProcessingSharedBuild;
}

export function useSavedTechBuildCommands(): SavedTechBuildCommands {
    const { createSavedTechBuild, getSavedBuild } = useGameData();

    return {
        createSavedTechBuild,
        getSavedBuild,
    };
}
