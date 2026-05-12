import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import GameDataProvider from "@/context/GameDataProvider";
import { useGameData } from "@/context/GameDataContext";
import { useAppOrchestration, useSavedTechBuildCommands } from "@/context/appOrchestration";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import { useTechStore } from "@/stores/techStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction } from "@/types/dataTypes";

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

const StoreProbe = () => {
    const districtsByKey = useDistrictStore((state) => state.districtsByKey);
    const improvementsByKey = useImprovementStore((state) => state.improvementsByKey);
    const techsByKey = useTechStore((state) => state.techsByKey);
    const selectedTechs = useTechPlannerStore((state) => state.selectedTechs);
    const selectedFaction = useFactionSelectionStore((state) => state.selectedFaction);
    const { isProcessingSharedBuild } = useAppOrchestration();

    return (
        <div>
            <div data-testid="district-label">
                {districtsByKey.District_City_Center?.displayName ?? "missing"}
            </div>
            <div data-testid="improvement-label">
                {improvementsByKey.Improvement_Public_Library?.displayName ?? "missing"}
            </div>
            <div data-testid="tech-count">{Object.keys(techsByKey).length}</div>
            <div data-testid="tech-label">{techsByKey.Tech_Kin_Workshop?.name ?? "missing"}</div>
            <div data-testid="selected-tech-count">{selectedTechs.length}</div>
            <div data-testid="selected-faction">{selectedFaction.uiLabel}</div>
            <div data-testid="share-processing">{String(isProcessingSharedBuild)}</div>
        </div>
    );
};

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

describe("GameDataProvider orchestration boundary", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();
        useTechPlannerStore.getState().reset();
        useFactionSelectionStore.getState().reset();
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
        mockedApiClient.getTechs.mockResolvedValue([
            {
                techKey: "Tech_Kin_Workshop",
                name: "Kin Workshop",
                era: 1,
                type: "Industry",
                unlocks: [],
                descriptionLines: ["Build better tools."],
                prereq: null,
                factions: ["kin"],
                excludes: null,
                coords: { xPct: 10, yPct: 20 },
            },
        ]);
        mockedApiClient.getUnits.mockResolvedValue([
            {
                unitKey: "Unit_Kin_Scout",
                displayName: "Kin Scout",
                artId: null,
                faction: "Kin",
                isMajorFaction: true,
                isHero: false,
                isChosen: false,
                spawnType: null,
                previousUnitKey: null,
                nextEvolutionUnitKeys: [],
                evolutionTierIndex: 1,
                unitClassKey: null,
                attackSkillKey: null,
                abilityKeys: [],
                descriptionLines: [],
            },
        ]);
        mockedApiClient.getCodex.mockResolvedValue([]);
    });

    it("keeps startup loads flowing into the normalized stores", async () => {
        render(
            <MemoryRouter>
                <GameDataProvider>
                    <StoreProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("district-label")).toHaveTextContent("City Center");
            expect(screen.getByTestId("improvement-label")).toHaveTextContent("Public Library");
            expect(screen.getByTestId("tech-label")).toHaveTextContent("Kin Workshop");
        });

        expect(screen.getByTestId("tech-count")).toHaveTextContent("1");
        expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("selected-faction")).toHaveTextContent("kin");
    });

    it("keeps the public context surface limited to orchestration commands and share gating", () => {
        const ContextShapeProbe = () => {
            const gameData = useGameData() as unknown as Record<string, unknown>;

            return (
                <div>
                    <div data-testid="has-districts">{String("districts" in gameData)}</div>
                    <div data-testid="has-improvements">{String("improvements" in gameData)}</div>
                    <div data-testid="has-techs">{String("techs" in gameData)}</div>
                    <div data-testid="has-selected-techs">{String("selectedTechs" in gameData)}</div>
                    <div data-testid="has-set-selected-techs">{String("setSelectedTechs" in gameData)}</div>
                    <div data-testid="has-selected-faction">{String("selectedFaction" in gameData)}</div>
                    <div data-testid="has-set-selected-faction">{String("setSelectedFaction" in gameData)}</div>
                    <div data-testid="has-create-saved">{String("createSavedTechBuild" in gameData)}</div>
                    <div data-testid="has-get-saved">{String("getSavedBuild" in gameData)}</div>
                    <div data-testid="has-share-gate">{String("isProcessingSharedBuild" in gameData)}</div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <ContextShapeProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId("has-districts")).toHaveTextContent("false");
        expect(screen.getByTestId("has-improvements")).toHaveTextContent("false");
        expect(screen.getByTestId("has-techs")).toHaveTextContent("false");
        expect(screen.getByTestId("has-selected-techs")).toHaveTextContent("false");
        expect(screen.getByTestId("has-set-selected-techs")).toHaveTextContent("false");
        expect(screen.getByTestId("has-selected-faction")).toHaveTextContent("false");
        expect(screen.getByTestId("has-set-selected-faction")).toHaveTextContent("false");
        expect(screen.getByTestId("has-create-saved")).toHaveTextContent("true");
        expect(screen.getByTestId("has-get-saved")).toHaveTextContent("true");
        expect(screen.getByTestId("has-share-gate")).toHaveTextContent("true");
    });

    it("exposes saved-build creation through the narrow command hook", async () => {
        const user = userEvent.setup();
        mockedApiClient.createSavedBuild.mockResolvedValue({
            uuid: "saved-build-id",
            name: "My Build",
            selectedFaction: "LORDS",
            techIds: ["Tech_Store_Selected"],
            createdAt: "2026-05-12T00:00:00Z",
        });

        const CommandProbe = () => {
            const { createSavedTechBuild } = useSavedTechBuildCommands();

            return (
                <button
                    type="button"
                    onClick={() =>
                        void createSavedTechBuild?.(
                            "My Build",
                            {
                                isMajor: true,
                                enumFaction: Faction.LORDS,
                                minorName: null,
                                uiLabel: "lords",
                            },
                            ["Tech_Store_Selected"]
                        )
                    }
                >
                    Save build
                </button>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <CommandProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Save build" }));

        expect(mockedApiClient.createSavedBuild).toHaveBeenCalledWith(
            "My Build",
            "LORDS",
            ["Tech_Store_Selected"]
        );
    });

    it("keeps getSavedBuild writing loaded faction and selected techs into stores", async () => {
        const user = userEvent.setup();
        mockedApiClient.getSavedBuild.mockResolvedValue({
            uuid: "saved-build-id",
            name: "Saved Build",
            selectedFaction: "Aspects",
            techIds: ["Tech_Shared_First", "Tech_Shared_Second"],
            createdAt: "2026-05-12T00:00:00Z",
        });

        const CommandProbe = () => {
            const { getSavedBuild } = useSavedTechBuildCommands();

            return (
                <button type="button" onClick={() => void getSavedBuild?.("saved-build-id")}>
                    Load build
                </button>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <CommandProbe />
                    <StoreProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Load build" }));

        await waitFor(() => {
            expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("2");
            expect(screen.getByTestId("selected-faction")).toHaveTextContent("aspects");
        });
        expect(mockedApiClient.getSavedBuild).toHaveBeenCalledWith("saved-build-id");
    });

    it("preserves shared-build loading into selected faction and selected techs", async () => {
        window.history.pushState({}, "", "/tech?share=shared-build-id");
        mockedApiClient.getSavedBuild.mockResolvedValue({
            uuid: "shared-build-id",
            name: "Shared Build",
            selectedFaction: "Aspects",
            techIds: ["Tech_Shared_First", "Tech_Shared_Second"],
            createdAt: "2026-05-12T00:00:00Z",
        });

        render(
            <MemoryRouter initialEntries={["/tech?share=shared-build-id"]}>
                <GameDataProvider>
                    <StoreProbe />
                    <LocationProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("2");
            expect(screen.getByTestId("selected-faction")).toHaveTextContent("aspects");
            expect(screen.getByTestId("share-processing")).toHaveTextContent("false");
        });

        expect(screen.getByTestId("location")).toHaveTextContent("/tech");
        expect(mockedApiClient.getSavedBuild).toHaveBeenCalledWith("shared-build-id");

        window.history.pushState({}, "", "/");
    });

    it("keeps identical district and improvement keys separated in their stores", async () => {
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
            const districtsByKey = useDistrictStore((state) => state.districtsByKey);
            const improvementsByKey = useImprovementStore((state) => state.improvementsByKey);

            return (
                <div>
                    <div data-testid="shared-district">
                        {districtsByKey.Shared_Constructible_Key?.displayName ?? "missing"}
                    </div>
                    <div data-testid="shared-improvement">
                        {improvementsByKey.Shared_Constructible_Key?.displayName ?? "missing"}
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

    it("leaves selected tech and faction state owned by their stores", () => {
        act(() => {
            useTechPlannerStore.getState().setSelectedTechs(["Tech_Selected"]);
            useFactionSelectionStore.getState().setSelectedFaction({
                isMajor: true,
                enumFaction: Faction.LORDS,
                minorName: null,
                uiLabel: "lords",
            });
        });

        expect(useTechPlannerStore.getState().selectedTechs).toEqual(["Tech_Selected"]);
        expect(useFactionSelectionStore.getState().selectedFaction.enumFaction).toBe(Faction.LORDS);
        expect("selectedFaction" in useTechPlannerStore.getState()).toBe(false);
        expect("selectedTechs" in useFactionSelectionStore.getState()).toBe(false);
    });
});
