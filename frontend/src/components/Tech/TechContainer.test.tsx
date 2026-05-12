import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GameDataContext, { type GameDataContextType } from "@/context/GameDataContext";
import TechContainer from "@/components/Tech/TechContainer";
import { useTechStore } from "@/stores/techStore";
import { Faction, type Tech } from "@/types/dataTypes";

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
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

const contextValue = (overrides: Partial<GameDataContextType> = {}): GameDataContextType => ({
    districts: new Map(),
    improvements: new Map(),
    techs: new Map([
        [
            "Tech_Context_Only",
            tech({
                techKey: "Tech_Context_Only",
                name: "Context Only",
            }),
        ],
    ]),
    codexByKindKey: new Map(),
    setTechs: vi.fn(),
    refreshTechs: vi.fn(),
    selectedFaction: {
        isMajor: true,
        enumFaction: Faction.KIN,
        minorName: null,
        uiLabel: "kin",
    },
    setSelectedFaction: vi.fn(),
    selectedTechs: ["Tech_Context_Only"],
    setSelectedTechs: vi.fn(),
    createSavedTechBuild: vi.fn(),
    getSavedBuild: vi.fn(),
    isProcessingSharedBuild: false,
    ...overrides,
});

describe("TechContainer passive tech reads", () => {
    beforeEach(() => {
        useTechStore.getState().reset();
        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Store_Only",
                name: "Store Only",
            }),
        ]);
    });

    it("renders SEO hidden tech labels from techStore without using context techs", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/tech"]}>
                <GameDataContext.Provider value={contextValue()}>
                    <TechContainer />
                </GameDataContext.Provider>
            </MemoryRouter>
        );

        const seoText = container.querySelector(".seo-hidden[aria-hidden='true']")?.textContent ?? "";

        expect(seoText).toContain("Store Only.");
        expect(seoText).not.toContain("Context Only.");
    });
});
