import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import TechContainer from "@/components/Tech/TechContainer";
import GameDataProvider from "@/context/GameDataProvider";
import { useGameData } from "@/context/GameDataContext";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import type { Tech } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getDistricts: vi.fn(),
        getImprovements: vi.fn(),
        getTechs: vi.fn(),
        getUnits: vi.fn(),
        getCodex: vi.fn(),
        getSavedBuild: vi.fn(),
        createSavedBuild: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

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

const Probe = () => {
    const { selectedFaction, selectedTechs } = useGameData();
    const location = useLocation();

    return (
        <div>
            <div data-testid="selected-techs">{selectedTechs.join(",")}</div>
            <div data-testid="selected-faction">{selectedFaction.uiLabel}</div>
            <div data-testid="location">{`${location.pathname}${location.search}`}</div>
            <div data-testid="location-state">{JSON.stringify(location.state ?? null)}</div>
        </div>
    );
};

describe("TechContainer routing regressions", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();
        useTechPlannerStore.getState().reset();

        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
        mockedApiClient.getTechs.mockReset();
        mockedApiClient.getUnits.mockReset();
        mockedApiClient.getCodex.mockReset();
        mockedApiClient.getSavedBuild.mockReset();
        mockedApiClient.createSavedBuild.mockReset();

        mockedApiClient.getDistricts.mockResolvedValue([]);
        mockedApiClient.getImprovements.mockResolvedValue([]);
        mockedApiClient.getUnits.mockResolvedValue([]);
        mockedApiClient.getCodex.mockResolvedValue([]);
        mockedApiClient.getTechs.mockResolvedValue([]);

        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Workshop",
                name: "Workshop",
                era: 2,
            }),
            tech({
                techKey: "Tech_Summary_First",
                name: "Summary First",
                era: 1,
            }),
            tech({
                techKey: "Tech_Summary_Second",
                name: "Summary Second",
                era: 3,
            }),
        ]);
    });

    it("hydrates faction and selected tech from faction/tech deep links without changing URL semantics", async () => {
        window.history.pushState({}, "", "/tech?faction=kin&tech=workshop");

        render(
            <MemoryRouter initialEntries={["/tech?faction=kin&tech=workshop"]}>
                <GameDataProvider>
                    <TechContainer />
                    <Probe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("selected-techs")).toHaveTextContent("Tech_Workshop");
        });

        expect(screen.getByTestId("selected-faction")).toHaveTextContent("kin");
        expect(window.location.pathname + window.location.search).toBe("/tech");

        window.history.pushState({}, "", "/");
    });

    it("hydrates selected techs from summary route state and clears that state", async () => {
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/tech",
                        state: {
                            source: "gamesummary",
                            mode: "global",
                            empireIndex: 0,
                            factionKeyHint: "kin",
                            techKeys: ["Tech_Summary_First", "Tech_Summary_Second"],
                            focusTechKey: "Tech_Summary_Second",
                        },
                    },
                ]}
            >
                <GameDataProvider>
                    <TechContainer />
                    <Probe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("selected-techs")).toHaveTextContent(
                "Tech_Summary_First,Tech_Summary_Second"
            );
        });

        expect(screen.getByTestId("selected-faction")).toHaveTextContent("Kin");
        expect(screen.getByTestId("location")).toHaveTextContent("/tech");
        expect(screen.getByTestId("location-state")).toHaveTextContent("null");
    });
});
