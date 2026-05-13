import { cleanup, render, screen } from "@testing-library/react";
import UnitTooltip from "@/components/Tooltips/UnitTooltip";
import { useUnitStore } from "@/stores/unitStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction, Unit } from "@/types/dataTypes";

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Kin_Root",
    displayName: "Kin Root",
    artId: null,
    faction: "Kin",
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("UnitTooltip", () => {
    beforeEach(() => {
        useUnitStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        useFactionSelectionStore.getState().setSelectedFaction({
            isMajor: true,
            enumFaction: Faction.KIN,
            minorName: null,
            uiLabel: "kin",
        });
    });

    afterEach(() => {
        cleanup();
        useUnitStore.getState().reset();
        useFactionSelectionStore.getState().reset();
    });

    it("resolves evolution labels through the normalized unit store", () => {
        useUnitStore.setState({
            unitsByKey: {
                Unit_Kin_Evolved: unit({
                    unitKey: "Unit_Kin_Evolved",
                    displayName: "Kin Evolved",
                    previousUnitKey: "Unit_Kin_Root",
                    evolutionTierIndex: 1,
                }),
            },
        });

        render(
            <UnitTooltip
                hoveredUnit={{
                    data: unit({
                        nextEvolutionUnitKeys: ["Unit_Kin_Evolved"],
                    }),
                    coords: { x: 10, y: 10, mode: "pixel" },
                }}
            />
        );

        expect(screen.getByText("Evolves to:")).toBeInTheDocument();
        expect(screen.getByText("Kin Evolved")).toBeInTheDocument();
    });

    it("falls back to missing evolution keys without throwing", () => {
        render(
            <UnitTooltip
                hoveredUnit={{
                    data: unit({
                        nextEvolutionUnitKeys: ["Unit_Missing"],
                    }),
                    coords: { x: 10, y: 10, mode: "pixel" },
                }}
            />
        );

        expect(screen.getByText("Unit_Missing")).toBeInTheDocument();
    });
});
