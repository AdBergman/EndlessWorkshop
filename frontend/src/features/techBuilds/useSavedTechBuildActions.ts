import { useCallback } from "react";
import { apiClient, type SavedTechBuild } from "@/api/apiClient";
import { Faction, type FactionInfo } from "@/types/dataTypes";
import { selectSelectedTechs, selectSetSelectedTechs, useTechPlannerStore } from "@/stores/techPlannerStore";
import {
    selectSelectedFaction,
    selectSetSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";

const toFactionInfoFromEnum = (faction: Faction): FactionInfo => ({
    isMajor: true,
    enumFaction: faction,
    uiLabel: String(faction).toLowerCase(),
    minorName: null,
});

export const toFactionInfoFromSavedValue = (faction: string): FactionInfo => {
    const label = String(faction ?? "").trim();
    const enumKey = label.toUpperCase().replace(/[\s-]+/g, "_") as keyof typeof Faction;
    const knownFaction = Faction[enumKey];

    if (knownFaction) return toFactionInfoFromEnum(knownFaction);

    return {
        isMajor: true,
        enumFaction: label as Faction,
        uiLabel: label,
        minorName: null,
    };
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
            return await apiClient.createSavedBuild(name, faction.enumFaction!.toString(), techIds);
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
