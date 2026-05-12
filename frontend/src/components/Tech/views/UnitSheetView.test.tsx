import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnitSheetView from "@/components/Tech/views/UnitSheetView";
import { useCodexStore } from "@/stores/codexStore";
import type { Unit } from "@/types/dataTypes";

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Scout",
    displayName: "Scout",
    artId: null,
    faction: "Kin",
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 1,
    unitClassKey: "UnitClass_Ranged",
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("UnitSheetView ability tooltip behavior", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useCodexStore.setState({
            entriesByKindKey: {
                abilities: {
                    Ability_Scouting: {
                        exportKind: "abilities",
                        entryKey: "Ability_Scouting",
                        displayName: "Scouting",
                        descriptionLines: ["Reveals nearby terrain."],
                        referenceKeys: [],
                    },
                },
            },
        });
    });

    it("shows ability labels and keeps their skill tooltip hoverable", async () => {
        const user = userEvent.setup();

        render(
            <UnitSheetView
                units={[
                    {
                        ...unit({
                            abilityKeys: ["Ability_Scouting", "Ability_Missing"],
                        }),
                        era: 1,
                    },
                ]}
            />
        );

        expect(screen.getByText("Scouting")).toBeInTheDocument();
        expect(screen.queryByText("Ability_Missing")).not.toBeInTheDocument();

        await user.hover(screen.getByText("Scouting"));

        expect(await screen.findByText("Reveals nearby terrain.")).toBeInTheDocument();
    });
});
