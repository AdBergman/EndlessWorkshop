import { render, screen } from "@testing-library/react";
import GameDataContext, { type GameDataContextType } from "@/context/GameDataContext";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import { Faction, type Tech } from "@/types/dataTypes";

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

const contextValue = (overrides: Partial<GameDataContextType> = {}): GameDataContextType => ({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    selectedFaction: {
        isMajor: true,
        enumFaction: Faction.KIN,
        minorName: null,
        uiLabel: "kin",
    },
    setSelectedFaction: vi.fn(),
    selectedTechs: ["Tech_Store_Selected"],
    setSelectedTechs: vi.fn(),
    createSavedTechBuild: vi.fn(),
    getSavedBuild: vi.fn(),
    isProcessingSharedBuild: false,
    ...overrides,
});

describe("SpreadSheetView passive tech reads", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();

        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Store_Selected",
                name: "Store Selected",
                unlocks: [
                    {
                        unlockType: "Constructible",
                        unlockKey: "Improvement_Market",
                        unlockCategory: "Improvement",
                    },
                ],
            }),
        ]);

        useImprovementStore.setState({
            improvementsByKey: {
                Improvement_Market: {
                    improvementKey: "Improvement_Market",
                    displayName: "Market",
                    descriptionLines: [],
                    unique: "City",
                    cost: [],
                },
            },
        });
    });

    it("resolves selected tech records from techStore while selection stays in context", () => {
        render(
            <GameDataContext.Provider value={contextValue({ techs: new Map() })}>
                <SpreadSheetView />
            </GameDataContext.Provider>
        );

        expect(screen.getByText("Store Selected")).toBeInTheDocument();
        expect(screen.getByText("Improvement:")).toBeInTheDocument();
        expect(screen.getByText("Market")).toBeInTheDocument();
        expect(screen.queryByText("No techs selected")).not.toBeInTheDocument();
    });
});
