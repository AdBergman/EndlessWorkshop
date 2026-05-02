import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import GameDataContext from "@/context/GameDataContext";
import { Faction } from "@/types/dataTypes";
import ModsPage from "./ModsPage";

function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

const gameDataContextValue = {
    districts: new Map(),
    improvements: new Map(),
    techs: new Map(),
    units: new Map(),
    codexByKindKey: new Map(),
    selectedFaction: {
        isMajor: true,
        enumFaction: Faction.KIN,
        minorName: null,
        uiLabel: "Kin",
    },
    setSelectedFaction: () => {},
    selectedTechs: [],
    setSelectedTechs: () => {},
    isProcessingSharedBuild: false,
};

describe("ModsPage", () => {
    it("renders a practical mods index with row sections and installation guidance", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/mods"]}>
                <Routes>
                    <Route path="/mods" element={<ModsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: "Mods" })).toBeInTheDocument();
        expect(screen.getByText("Small open-source Endless Legend 2 mods and tools.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Essentials Mod Pack" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "EL2 Essentials Pack" })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Support Tools / Misc" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Get BepInEx" })).toHaveAttribute(
            "href",
            "https://github.com/BepInEx/BepInEx/releases"
        );

        const includedMods = screen.getByLabelText("Included mods");
        expect(within(includedMods).getByRole("heading", { name: "WorldGen" })).toBeInTheDocument();
        expect(
            within(includedMods).getByText(
                "More varied map generation, slightly larger worlds, and persistent water after the final monsoon."
            )
        ).toBeInTheDocument();
        expect(within(includedMods).getAllByRole("link", { name: "Download pack v1.0.0" })).toHaveLength(3);

        await user.click(screen.getByRole("button", { name: "Enlarge WorldGen preview" }));

        expect(screen.getByRole("dialog", { name: "WorldGen preview" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close preview" })).toBeInTheDocument();
    });

    it("adds a working Mods nav entry in the top container", async () => {
        const user = userEvent.setup();

        render(
            <GameDataContext.Provider value={gameDataContextValue}>
                <MemoryRouter initialEntries={["/tech"]}>
                    <LocationProbe />
                    <TopContainer />
                    <Routes>
                        <Route path="/tech" element={<div>Tech Page</div>} />
                        <Route path="/mods" element={<ModsPage />} />
                    </Routes>
                </MemoryRouter>
            </GameDataContext.Provider>
        );

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/tech");

        await user.click(screen.getByRole("link", { name: "Mods" }));

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/mods");
        expect(screen.getByRole("heading", { name: "Essentials Mod Pack" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Included mods")).getByRole("heading", { name: "WorldGen" })).toBeInTheDocument();
    });
});
