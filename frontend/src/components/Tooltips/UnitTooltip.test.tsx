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
    unitClassDisplayName: null,
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

    it("uses stored class display labels before falling back to raw class keys", () => {
        render(
            <UnitTooltip
                hoveredUnit={{
                    data: unit({
                        evolutionTierIndex: 2,
                        unitClassKey: "UnitClass_JuggernaughtRanged",
                        unitClassDisplayName: "Juggernaught Ranged",
                    }),
                    coords: { x: 10, y: 10, mode: "pixel" },
                }}
            />
        );

        expect(screen.getByText("Tier II Juggernaught Ranged")).toBeInTheDocument();
        expect(screen.queryByText(/JuggernaughtRanged/)).not.toBeInTheDocument();
    });

    it("splits camel-case fallback class keys when display labels are absent", () => {
        render(
            <UnitTooltip
                hoveredUnit={{
                    data: unit({
                        evolutionTierIndex: 2,
                        unitClassKey: "UnitClass_CavalryRanged_Hero",
                    }),
                    coords: { x: 10, y: 10, mode: "pixel" },
                }}
            />
        );

        expect(screen.getByText("Tier II Cavalry Ranged Hero")).toBeInTheDocument();
    });

    it("renders manifest-backed stat icons in unit description lines", () => {
        render(
            <UnitTooltip
                hoveredUnit={{
                    data: unit({
                        descriptionLines: ["+10 [Health] Health and +2 [Defense] Defense"],
                    }),
                    coords: { x: 10, y: 10, mode: "pixel" },
                }}
            />
        );

        expect(screen.getByRole("img", { name: "Health" })).toHaveAttribute(
            "src",
            "/svg/units/UI_UnitItem_Health.svg"
        );
        expect(screen.getByRole("img", { name: "Defense" })).toHaveAttribute(
            "src",
            "/svg/abilities/UI_UnitItem_Defense.svg"
        );
    });
});
