import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import GameDataContext, { type GameDataContextType } from "@/context/GameDataContext";
import TechTree from "@/components/Tech/TechTree";
import TopContainer from "@/components/TopContainer/TopContainer";
import { Faction, type FactionInfo, type Tech } from "@/types/dataTypes";

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: ["KIN"],
    excludes: null,
    coords: { xPct: 10, yPct: 20 },
    ...overrides,
});

const kinFaction: FactionInfo = {
    isMajor: true,
    enumFaction: Faction.KIN,
    minorName: null,
    uiLabel: "Kin",
};

const baseTechs = new Map<string, Tech>([
    [
        "Tech_First",
        tech({
            techKey: "Tech_First",
            name: "First",
            coords: { xPct: 10, yPct: 20 },
        }),
    ],
    [
        "Tech_Second",
        tech({
            techKey: "Tech_Second",
            name: "Second",
            coords: { xPct: 20, yPct: 30 },
        }),
    ],
]);

function StatefulGameData({
    children,
    initialSelectedTechs = [],
}: {
    children: React.ReactNode;
    initialSelectedTechs?: string[];
}) {
    const [selectedFaction, setSelectedFaction] = useState<FactionInfo>(kinFaction);
    const [selectedTechs, setSelectedTechs] = useState<string[]>(initialSelectedTechs);

    const value: GameDataContextType = {
        districts: new Map(),
        improvements: new Map(),
        techs: baseTechs,
        codexByKindKey: new Map(),
        selectedFaction,
        setSelectedFaction,
        selectedTechs,
        setSelectedTechs,
        createSavedTechBuild: vi.fn(),
        getSavedBuild: vi.fn(),
        isProcessingSharedBuild: false,
    };

    return (
        <GameDataContext.Provider value={value}>
            {children}
            <div data-testid="selected-techs">{selectedTechs.join(",")}</div>
            <div data-testid="selected-faction">{selectedFaction.uiLabel}</div>
        </GameDataContext.Provider>
    );
}

describe("TechTree selected tech interactions", () => {
    it("toggles tech selection on click while preserving selected order", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <StatefulGameData>
                    <TechTree era={1} maxUnlockedEra={1} onEraChange={vi.fn()} />
                </StatefulGameData>
            </MemoryRouter>
        );

        const nodes = screen.getAllByTestId("tech-node");

        await user.click(nodes[0]);
        expect(screen.getByTestId("selected-techs")).toHaveTextContent("Tech_First");

        await user.click(nodes[1]);
        expect(screen.getByTestId("selected-techs")).toHaveTextContent("Tech_First,Tech_Second");

        await user.click(nodes[0]);
        expect(screen.getByTestId("selected-techs")).toHaveTextContent("Tech_Second");
    });

    it("selects all selectable techs in era order", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <StatefulGameData>
                    <TechTree era={1} maxUnlockedEra={1} onEraChange={vi.fn()} />
                </StatefulGameData>
            </MemoryRouter>
        );

        await user.click(screen.getByTestId("select-all-button"));

        expect(screen.getByTestId("selected-techs")).toHaveTextContent("Tech_First,Tech_Second");
    });

    it("clears all selected techs", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <StatefulGameData initialSelectedTechs={["Tech_First", "Tech_Second"]}>
                    <TechTree era={1} maxUnlockedEra={1} onEraChange={vi.fn()} />
                </StatefulGameData>
            </MemoryRouter>
        );

        await user.click(screen.getByTestId("clear-all-button"));

        expect(screen.getByTestId("selected-techs")).toBeEmptyDOMElement();
    });

    it("keeps faction switching clearing selected techs", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <StatefulGameData initialSelectedTechs={["Tech_First"]}>
                    <TopContainer />
                </StatefulGameData>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Lords" }));

        expect(screen.getByTestId("selected-techs")).toBeEmptyDOMElement();
        expect(screen.getByTestId("selected-faction")).toHaveTextContent("Lords");
    });
});
