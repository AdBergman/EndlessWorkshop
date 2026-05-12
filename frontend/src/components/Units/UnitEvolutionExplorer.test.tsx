import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GameDataProvider from "@/context/GameDataProvider";
import { UnitEvolutionExplorer } from "@/components/Units/UnitEvolutionExplorer";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import type { Unit } from "@/types/dataTypes";

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

describe("/units smoke behavior", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();

        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
        mockedApiClient.getTechs.mockReset();
        mockedApiClient.getUnits.mockReset();
        mockedApiClient.getCodex.mockReset();
        mockedApiClient.getSavedBuild.mockReset();
        mockedApiClient.createSavedBuild.mockReset();

        mockedApiClient.getDistricts.mockResolvedValue([]);
        mockedApiClient.getImprovements.mockResolvedValue([]);
        mockedApiClient.getTechs.mockResolvedValue([]);
        mockedApiClient.getCodex.mockResolvedValue([]);
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_Kin_Root",
                displayName: "Kin Root",
                nextEvolutionUnitKeys: ["Unit_Kin_Evolved"],
            }),
            unit({
                unitKey: "Unit_Kin_Evolved",
                displayName: "Kin Evolved",
                previousUnitKey: "Unit_Kin_Root",
                evolutionTierIndex: 1,
            }),
        ]);
    });

    it("hydrates selected unit URL params and renders the evolution chain from context adapter units", async () => {
        render(
            <MemoryRouter initialEntries={["/units?faction=kin&unitKey=Unit_Kin_Root"]}>
                <GameDataProvider>
                    <UnitEvolutionExplorer />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("Loading units...")).not.toBeInTheDocument();
            expect(screen.getAllByText("Kin Root").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Kin Evolved").length).toBeGreaterThan(0);
        });
    });
});
