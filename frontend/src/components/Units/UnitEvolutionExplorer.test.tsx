import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import GameDataProvider from "@/context/GameDataProvider";
import { UnitEvolutionExplorer } from "@/components/Units/UnitEvolutionExplorer";
import TopContainer from "@/components/TopContainer/TopContainer";
import { apiClient } from "@/api/apiClient";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction, type Unit } from "@/types/dataTypes";

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

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}{location.search}</div>;
};

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
    const renderExplorer = (initialPath: string) =>
        render(
            <MemoryRouter initialEntries={[initialPath]}>
                <GameDataProvider>
                    <UnitEvolutionExplorer />
                    <LocationProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

    beforeEach(() => {
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useTechPlannerStore.getState().reset();
        useFactionSelectionStore.getState().reset();

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
        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "abilities",
                entryKey: "Ability_Cautious_Strike",
                displayName: "Cautious Strike",
                descriptionLines: ["A precise opening attack."],
                referenceKeys: [],
            },
        ]);
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_Kin_Root",
                displayName: "Kin Root",
                nextEvolutionUnitKeys: ["Unit_Kin_Evolved"],
                abilityKeys: ["Ability_Cautious_Strike"],
            }),
            unit({
                unitKey: "Unit_Kin_Evolved",
                displayName: "Kin Evolved",
                previousUnitKey: "Unit_Kin_Root",
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_Kin_Archer",
                displayName: "Kin Archer",
                nextEvolutionUnitKeys: ["Unit_Kin_Archer_Evolved"],
            }),
            unit({
                unitKey: "Unit_Kin_Archer_Evolved",
                displayName: "Kin Archer Evolved",
                previousUnitKey: "Unit_Kin_Archer",
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_Lords_Root",
                displayName: "Lords Root",
                faction: "Lords",
                nextEvolutionUnitKeys: ["Unit_Lords_Evolved"],
            }),
            unit({
                unitKey: "Unit_Lords_Evolved",
                displayName: "Lords Evolved",
                faction: "Lords",
                previousUnitKey: "Unit_Lords_Root",
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_Minor_Root",
                displayName: "Ametrine Root",
                faction: "Ametrine",
                isMajorFaction: false,
                nextEvolutionUnitKeys: ["Unit_Minor_Evolved"],
            }),
            unit({
                unitKey: "Unit_Minor_Evolved",
                displayName: "Ametrine Evolved",
                faction: "Ametrine",
                isMajorFaction: false,
                previousUnitKey: "Unit_Minor_Root",
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_Chosen_Root",
                displayName: "Chosen Root",
                isChosen: true,
                nextEvolutionUnitKeys: ["Unit_Chosen_Evolved"],
            }),
            unit({
                unitKey: "Unit_Chosen_Evolved",
                displayName: "Chosen Evolved",
                isChosen: true,
                previousUnitKey: "Unit_Chosen_Root",
                evolutionTierIndex: 1,
            }),
        ]);
    });

    it("hydrates selected unit URL params and renders the evolution chain from unitStore records", async () => {
        renderExplorer("/units?faction=kin&unitKey=Unit_Kin_Root");

        await waitFor(() => {
            expect(screen.queryByText("Loading units...")).not.toBeInTheDocument();
            expect(screen.getAllByText("Kin Root").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Kin Evolved").length).toBeGreaterThan(0);
        });
    });

    it("looks up the selected root by unitKey without rendering another root's evolution chain", async () => {
        const { container } = renderExplorer("/units?faction=kin&unitKey=Unit_Kin_Archer");

        await waitFor(() => {
            const tree = container.querySelector(".evolutionTreeWrapper");
            expect(tree).toHaveTextContent("Kin Archer Evolved");
            expect(tree).not.toHaveTextContent("Kin Evolved");
        });
    });

    it("falls back to the first faction root when the requested unit key is missing", async () => {
        renderExplorer("/units?faction=kin&unitKey=Unit_Does_Not_Exist");

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=kin&unitKey=Unit_Kin_Root"
            );
        });
    });

    it("preserves minor origin filtering and renders the minor evolution chain", async () => {
        const { container } = renderExplorer(
            "/units?faction=kin&unitKey=Unit_Minor_Root&origin=ametrine&minor=1"
        );

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=kin&unitKey=Unit_Minor_Root&origin=ametrine&minor=1"
            );
            expect(container.querySelector(".horizontalEvolution")).toHaveTextContent("Ametrine Evolved");
        });
    });

    it("keeps chosen units on the horizontal evolution layout", async () => {
        const { container } = renderExplorer("/units?faction=kin&unitKey=Unit_Chosen_Root");

        await waitFor(() => {
            expect(container.querySelector(".horizontalEvolution")).toHaveTextContent("Chosen Evolved");
            expect(container.querySelector(".evolutionTreeWrapper")).not.toBeInTheDocument();
        });
    });

    it("keeps ability tooltip rendering intact after the unitStore migration", async () => {
        renderExplorer("/units?faction=kin&unitKey=Unit_Kin_Root");

        await waitFor(() => {
            expect(screen.getByText("Cautious Strike")).toBeInTheDocument();
        });

        fireEvent.mouseEnter(screen.getByText("Cautious Strike"), {
            clientX: 20,
            clientY: 20,
        });

        await waitFor(() => {
            expect(screen.getByText("A precise opening attack.")).toBeInTheDocument();
        });
    });

    it("keeps /units faction selection writing through stores and updating the unit route", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/units?faction=kin&unitKey=Unit_Kin_Root"]}>
                <GameDataProvider>
                    <TopContainer />
                    <UnitEvolutionExplorer />
                    <LocationProbe />
                </GameDataProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("Loading units...")).not.toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: "Lords" }));

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=lords&unitKey=Unit_Lords_Root"
            );
        });

        expect(screen.getAllByText("Lords Root").length).toBeGreaterThan(0);
        expect(useFactionSelectionStore.getState().selectedFaction.enumFaction).toBe(Faction.LORDS);
    });
});
