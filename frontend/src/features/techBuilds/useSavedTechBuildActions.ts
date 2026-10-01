import { useCallback } from "react";
import { apiClient, type SavedTechBuild } from "@/api/apiClient";
import { Faction, type FactionInfo } from "@/types/dataTypes";
import { factionInfoForKey } from "@/utils/factionIdentity";
import { selectSelectedTechs, selectSetSelectedTechs, useTechPlannerStore } from "@/stores/techPlannerStore";
import {
    selectSelectedFaction,
    selectSetSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";

export const toFactionInfoFromSavedValue = (faction: string): FactionInfo => {
    const info = factionInfoForKey(faction);
    return Object.values(Faction).includes(info.enumFaction as Faction)
        ? { ...info, uiLabel: info.uiLabel.toLowerCase() }
        : info;
};

export function useSavedTechBuildActions() {
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const setSelectedFaction = useFactionSelectionStore(selectSetSelectedFaction);
    const selectedTechs = useTechPlannerStore(selectSelectedTechs);
    const setSelectedTechs = useTechPlannerStore(selectSetSelectedTechs);

    const applySavedTechBuild = useCallback(
        (saved: SavedTechBuild) => {
            setSelectedFaction(toFactionInfoFromSavedValue(saved.selectedFaction));
            setSelectedTechs(saved.techIds);
        },
        [setSelectedFaction, setSelectedTechs]
    );

    const createSavedTechBuild = useCallback(
        async (
            name: string,
            faction: FactionInfo = selectedFaction,
            techIds: string[] = selectedTechs
        ): Promise<SavedTechBuild> => {
            return await apiClient.createSavedBuild(name, faction.factionKey ?? faction.enumFaction ?? faction.uiLabel, techIds);
        },
        [selectedFaction, selectedTechs]
    );

    const getSavedBuild = useCallback(
        async (uuid: string): Promise<SavedTechBuild> => {
            const saved = await apiClient.getSavedBuild(uuid);

            applySavedTechBuild(saved);

            return saved;
        },
        [applySavedTechBuild]
    );

    return {
        applySavedTechBuild,
        createSavedTechBuild,
        getSavedBuild,
    };
}
