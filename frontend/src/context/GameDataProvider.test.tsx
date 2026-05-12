import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GameDataProvider from "@/context/GameDataProvider";
import { useGameData } from "@/context/GameDataContext";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";

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

const Probe = () => {
    const { districts, improvements, techs, units, selectedTechs, selectedFaction } = useGameData();

    return (
        <div>
            <div data-testid="district-map">{String(districts instanceof Map)}</div>
            <div data-testid="improvement-map">{String(improvements instanceof Map)}</div>
            <div data-testid="district-label">
                {districts.get("District_City_Center")?.displayName ?? "missing"}
            </div>
            <div data-testid="improvement-label">
                {improvements.get("Improvement_Public_Library")?.displayName ?? "missing"}
            </div>
            <div data-testid="tech-count">{techs.size}</div>
            <div data-testid="unit-count">{units.size}</div>
            <div data-testid="selected-tech-count">{selectedTechs.length}</div>
            <div data-testid="selected-faction">{selectedFaction.uiLabel}</div>
        </div>
    );
};

describe("GameDataProvider district/improvement compatibility adapter", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useCodexStore.getState().reset();
        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
        mockedApiClient.getTechs.mockReset();
        mockedApiClient.getUnits.mockReset();
        mockedApiClient.getCodex.mockReset();
        mockedApiClient.getSavedBuild.mockReset();
        mockedApiClient.createSavedBuild.mockReset();

        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: "District_City_Center",
                displayName: "City Center",
                descriptionLines: ["Capital district."],
            },
        ]);
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: "Improvement_Public_Library",
                displayName: "Public Library",
                descriptionLines: ["+10 Science"],
                unique: "City",
                cost: ["100 Industry"],
            },
        ]);
        mockedApiClient.getTechs.mockResolvedValue([]);
        mockedApiClient.getUnits.mockResolvedValue([]);
        mockedApiClient.getCodex.mockResolvedValue([]);
    });

    it("continues to expose districts and improvements as keyed Map values without changing unrelated state", async () => {
        render(
            <MemoryRouter>
                <GameDataProvider>
                    <Probe />
                </GameDataProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId("district-map")).toHaveTextContent("true");
        expect(screen.getByTestId("improvement-map")).toHaveTextContent("true");

        await waitFor(() => {
            expect(screen.getByTestId("district-label")).toHaveTextContent("City Center");
            expect(screen.getByTestId("improvement-label")).toHaveTextContent("Public Library");
        });

        expect(screen.getByTestId("tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("unit-count")).toHaveTextContent("0");
        expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("selected-faction")).toHaveTextContent("kin");
    });

    it("keeps identical district and improvement keys in separate context maps", async () => {
        mockedApiClient.getDistricts.mockResolvedValue([
            {
                districtKey: "Shared_Constructible_Key",
                displayName: "Shared District",
                descriptionLines: ["District text"],
            },
        ]);
        mockedApiClient.getImprovements.mockResolvedValue([
            {
                improvementKey: "Shared_Constructible_Key",
                displayName: "Shared Improvement",
                descriptionLines: ["Improvement text"],
                unique: "City",
                cost: [],
            },
        ]);

        const SharedProbe = () => {
            const { districts, improvements } = useGameData();

            return (
                <div>
                    <div data-testid="shared-district">
                        {districts.get("Shared_Constructible_Key")?.displayName ?? "missing"}
                    </div>
                    <div data-testid="shared-improvement">
                        {improvements.get("Shared_Constructible_Key")?.displayName ?? "missing"}
                    </div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <SharedProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("shared-district")).toHaveTextContent("Shared District");
            expect(screen.getByTestId("shared-improvement")).toHaveTextContent("Shared Improvement");
        });
    });
});
