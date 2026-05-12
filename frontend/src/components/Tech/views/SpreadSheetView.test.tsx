import { render, screen } from "@testing-library/react";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useTechStore } from "@/stores/techStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useUnitStore } from "@/stores/unitStore";
import { type Tech } from "@/types/dataTypes";

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

describe("SpreadSheetView passive tech reads", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();
        useTechPlannerStore.getState().reset();
        useFactionSelectionStore.getState().reset();

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

        useTechPlannerStore.getState().setSelectedTechs(["Tech_Store_Selected"]);
    });

    afterEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();
        useTechPlannerStore.getState().reset();
        useFactionSelectionStore.getState().reset();
    });

    it("resolves selected tech records from techStore and selected keys from techPlannerStore", () => {
        render(<SpreadSheetView />);

        expect(screen.getByText("Store Selected")).toBeInTheDocument();
        expect(screen.getByText("Improvement:")).toBeInTheDocument();
        expect(screen.getByText("Market")).toBeInTheDocument();
        expect(screen.queryByText("No techs selected")).not.toBeInTheDocument();
    });
});
