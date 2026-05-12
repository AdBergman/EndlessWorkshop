import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import GameDataProvider from "@/context/GameDataProvider";
import { useGameData } from "@/context/GameDataContext";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import { useTechStore } from "@/stores/techStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
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

const Probe = () => {
    const { districts, improvements, techs, selectedTechs, selectedFaction } = useGameData();

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
            <div data-testid="tech-label">
                {techs.get("Tech_Kin_Workshop")?.name ?? "missing"}
            </div>
            <div data-testid="selected-tech-count">{selectedTechs.length}</div>
            <div data-testid="selected-faction">{selectedFaction.uiLabel}</div>
        </div>
    );
};

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

describe("GameDataProvider normalized store compatibility adapter", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechStore.getState().reset();
        useTechPlannerStore.getState().reset();
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

        expect(screen.getByTestId("tech-count")).toHaveTextContent("1");
        expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("selected-faction")).toHaveTextContent("kin");
    });

    it("continues to expose techStore-owned techs through the legacy context Map adapter", async () => {
        render(
            <MemoryRouter>
                <GameDataProvider>
                    <Probe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("tech-label")).toHaveTextContent("Kin Workshop");
        });

        expect(screen.getByTestId("tech-count")).toHaveTextContent("1");
        expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("selected-faction")).toHaveTextContent("kin");
    });

    it("keeps the legacy setTechs adapter backed by techStore without moving selection state", async () => {
        const user = userEvent.setup();

        const AdapterProbe = () => {
            const { techs, setTechs, selectedTechs, selectedFaction } = useGameData();

            return (
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            setTechs?.((prev) => {
                                const next = new Map(prev);
                                next.set("Tech_Adapter_Insert", {
                                    techKey: "Tech_Adapter_Insert",
                                    name: "Adapter Insert",
                                    era: 1,
                                    type: "Industry",
                                    unlocks: [],
                                    descriptionLines: [],
                                    prereq: null,
                                    factions: ["KIN"],
                                    excludes: null,
                                    coords: { xPct: 1, yPct: 2 },
                                });
                                return next;
                            })
                        }
                    >
                        Insert tech
                    </button>
                    <div data-testid="adapter-tech-label">
                        {techs.get("Tech_Adapter_Insert")?.name ?? "missing"}
                    </div>
                    <div data-testid="adapter-store-label">
                        {useTechStore.getState().getTechByKey("Tech_Adapter_Insert")?.name ?? "missing"}
                    </div>
                    <div data-testid="adapter-selected-tech-count">{selectedTechs.length}</div>
                    <div data-testid="adapter-selected-faction">{selectedFaction.uiLabel}</div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <AdapterProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Insert tech" }));

        await waitFor(() => {
            expect(screen.getByTestId("adapter-tech-label")).toHaveTextContent("Adapter Insert");
        });

        expect(screen.getByTestId("adapter-store-label")).toHaveTextContent("Adapter Insert");
        expect(screen.getByTestId("adapter-selected-tech-count")).toHaveTextContent("0");
        expect(screen.getByTestId("adapter-selected-faction")).toHaveTextContent("kin");
    });

    it("exposes selectedTechs from techPlannerStore through the legacy context adapter", async () => {
        act(() => {
            useTechPlannerStore.getState().setSelectedTechs(["Tech_Store_Selected"]);
        });

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <Probe />
                </GameDataProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("1");
        await waitFor(() => {
            expect(screen.getByTestId("tech-count")).toHaveTextContent("1");
        });
    });

    it("writes setSelectedTechs calls through to techPlannerStore", async () => {
        const user = userEvent.setup();

        const SelectionProbe = () => {
            const { selectedTechs, setSelectedTechs } = useGameData();

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => setSelectedTechs((prev) => [...prev, "Tech_From_Context"])}
                    >
                        Select from context
                    </button>
                    <div data-testid="context-selected-techs">{selectedTechs.join(",")}</div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <SelectionProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Select from context" }));

        expect(screen.getByTestId("context-selected-techs")).toHaveTextContent("Tech_From_Context");
        expect(useTechPlannerStore.getState().selectedTechs).toEqual(["Tech_From_Context"]);
    });

    it("keeps selectedFaction context-owned while selectedTechs are store-backed", async () => {
        const user = userEvent.setup();

        const FactionProbe = () => {
            const { selectedFaction, selectedTechs, setSelectedFaction, setSelectedTechs } = useGameData();

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTechs(["Tech_Selected"]);
                            setSelectedFaction({
                                isMajor: true,
                                enumFaction: Faction.LORDS,
                                minorName: null,
                                uiLabel: "lords",
                            });
                        }}
                    >
                        Change faction
                    </button>
                    <div data-testid="context-faction">{selectedFaction.uiLabel}</div>
                    <div data-testid="context-selected-count">{selectedTechs.length}</div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <GameDataProvider>
                    <FactionProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Change faction" }));

        expect(screen.getByTestId("context-faction")).toHaveTextContent("lords");
        expect(screen.getByTestId("context-selected-count")).toHaveTextContent("1");
        expect("selectedFaction" in useTechPlannerStore.getState()).toBe(false);
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
                    <Probe />
                    <LocationProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("selected-tech-count")).toHaveTextContent("2");
            expect(screen.getByTestId("selected-faction")).toHaveTextContent("aspects");
        });

        expect(screen.getByTestId("location")).toHaveTextContent("/tech");
        expect(mockedApiClient.getSavedBuild).toHaveBeenCalledWith("shared-build-id");

        window.history.pushState({}, "", "/");
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
