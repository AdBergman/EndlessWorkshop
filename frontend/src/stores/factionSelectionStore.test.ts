import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction, type FactionInfo } from "@/types/dataTypes";

const lordsFaction: FactionInfo = {
    isMajor: true,
    enumFaction: Faction.LORDS,
    minorName: null,
    uiLabel: "Lords",
};

describe("useFactionSelectionStore", () => {
    beforeEach(() => {
        useFactionSelectionStore.getState().reset();
    });

    it("defaults to Kin without depending on context", () => {
        expect(useFactionSelectionStore.getState().selectedFaction).toEqual({
            isMajor: true,
            enumFaction: Faction.KIN,
            uiLabel: "kin",
            minorName: null,
        });
    });

    it("sets the selected faction object exactly as provided", () => {
        useFactionSelectionStore.getState().setSelectedFaction(lordsFaction);

        expect(useFactionSelectionStore.getState().selectedFaction).toBe(lordsFaction);
    });

    it("can reset to the default selected faction", () => {
        useFactionSelectionStore.getState().setSelectedFaction(lordsFaction);

        useFactionSelectionStore.getState().reset();

        expect(useFactionSelectionStore.getState().selectedFaction.enumFaction).toBe(Faction.KIN);
        expect(useFactionSelectionStore.getState().selectedFaction.uiLabel).toBe("kin");
    });
});
