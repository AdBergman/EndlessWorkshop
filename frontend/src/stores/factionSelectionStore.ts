import { create } from "zustand";
import { Faction, type FactionInfo } from "@/types/dataTypes";

const defaultFaction = (): FactionInfo => ({
    isMajor: true,
    enumFaction: Faction.KIN,
    uiLabel: "kin",
    minorName: null,
});

type FactionSelectionStore = {
    selectedFaction: FactionInfo;
    setSelectedFaction: (faction: FactionInfo) => void;
    reset: () => void;
};

export const useFactionSelectionStore = create<FactionSelectionStore>((set) => ({
    selectedFaction: defaultFaction(),

    setSelectedFaction: (faction) => {
        set({ selectedFaction: faction });
    },

    reset: () => {
        set({ selectedFaction: defaultFaction() });
    },
}));

export const selectSelectedFaction = (state: FactionSelectionStore) => state.selectedFaction;
export const selectSetSelectedFaction = (state: FactionSelectionStore) => state.setSelectedFaction;
