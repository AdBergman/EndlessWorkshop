import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
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

const BackButton = () => {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate(-1)}>Back</button>;
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

const veteranSmokeDescriptionLines = [
    "+40 [Damage] Damage",
    "+80 [Health] Health",
    "+6 [Defense] Defense",
    "+3 [MovementPoints] Movement",
    "+1 [Focus] Critical Chance",
    "4 [DustColored] Upkeep",
];

function getActiveCarouselStats(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll(".carouselItem.active .statsBox .stat span"))
        .map((element) => element.textContent?.trim() ?? "");
}

const majorFactionSmokeCases = [
    ["Kin", "kin", "Unit_Kin_VetSmoke"],
    ["Lords", "lords", "Unit_Lords_VetSmoke"],
    ["Tahuk", "tahuk", "Unit_Tahuk_VetSmoke"],
    ["Aspects", "aspects", "Unit_Aspects_VetSmoke"],
    ["Necrophages", "necrophages", "Unit_Necrophages_VetSmoke"],
] as const;

function majorFactionVeterancySmokeUnits(): Unit[] {
    return majorFactionSmokeCases.map(([faction, , unitKey]) =>
        unit({
            unitKey,
            displayName: `${faction} Lens Scout`,
            faction,
            descriptionLines: veteranSmokeDescriptionLines,
        })
    );
}

describe("/units smoke behavior", () => {
    const renderExplorer = (initialPath: string) =>
        render(
            <MemoryRouter initialEntries={[initialPath]}>
                <UnitEvolutionExplorer />
                <LocationProbe />
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
        const cautiousStrike = {
            exportKind: "abilities",
            entryKey: "Ability_Cautious_Strike",
            displayName: "Cautious Strike",
            descriptionLines: ["A precise opening attack."],
            referenceKeys: [],
        };
        useCodexStore.setState({
            entries: [cautiousStrike],
            entriesByKey: {
                Ability_Cautious_Strike: cautiousStrike,
            },
            entriesByKind: {
                abilities: [cautiousStrike],
            },
            entriesByKindKey: {
                abilities: {
                    Ability_Cautious_Strike: cautiousStrike,
                },
            },
            loading: false,
            error: null,
        });
        mockedApiClient.getCodex.mockResolvedValue([]);
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

    it("requests units on page mount without relying on app bootstrap", async () => {
        renderExplorer("/units");

        await waitFor(() => {
            expect(mockedApiClient.getUnits).toHaveBeenCalledTimes(1);
        });
    });

    it("shows an explicit empty state when the units endpoint returns no records", async () => {
        mockedApiClient.getUnits.mockResolvedValue([]);

        renderExplorer("/units");

        expect(await screen.findByText("No units are available.")).toBeInTheDocument();
        expect(screen.queryByText("Loading units...")).not.toBeInTheDocument();
    });

    it("shows a units API error instead of a permanent loading state", async () => {
        mockedApiClient.getUnits.mockRejectedValue(new Error("units endpoint failed"));

        renderExplorer("/units");

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Failed to load units: units endpoint failed"
        );
        expect(screen.queryByText("Loading units...")).not.toBeInTheDocument();
    });

    it("looks up the selected root by unitKey without rendering another root's evolution chain", async () => {
        const { container } = renderExplorer("/units?faction=kin&unitKey=Unit_Kin_Archer");

        await waitFor(() => {
            const tree = container.querySelector(".evolutionTreeWrapper");
            expect(tree).toHaveTextContent("Kin Archer Evolved");
            expect(tree).not.toHaveTextContent("Kin Evolved");
        });
    });

    it("hydrates target-unit faction route params used by tech unlock links", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_KinOfSheredyn_Archer",
                displayName: "Explorer",
                faction: "KinOfSheredyn",
                nextEvolutionUnitKeys: ["Unit_KinOfSheredyn_Archer_Upgrade01"],
            }),
            unit({
                unitKey: "Unit_KinOfSheredyn_Archer_Upgrade01",
                displayName: "Pathfinder",
                faction: "KinOfSheredyn",
                previousUnitKey: "Unit_KinOfSheredyn_Archer",
                evolutionTierIndex: 1,
            }),
        ]);

        const { container } = renderExplorer("/units?faction=kinofsheredyn&unitKey=Unit_KinOfSheredyn_Archer");

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=kinofsheredyn&unitKey=Unit_KinOfSheredyn_Archer"
            );
            expect(container.querySelector(".evolutionTreeWrapper")).toHaveTextContent("Pathfinder");
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

    it("shows minor faction chains whose base unit is absent from the visible unit set", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
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
                unitKey: "Unit_MinorFaction_Xavius_Upgraded",
                displayName: "Mighty Pantinel",
                faction: "Xavius",
                isMajorFaction: false,
                previousUnitKey: "Unit_MinorFaction_Xavius",
                nextEvolutionUnitKeys: ["Unit_MinorFaction_Xavius_Final"],
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_MinorFaction_Xavius_Final",
                displayName: "Elite Pantinel",
                faction: "Xavius",
                isMajorFaction: false,
                previousUnitKey: "Unit_MinorFaction_Xavius_Upgraded",
                evolutionTierIndex: 2,
            }),
        ]);

        const { container } = renderExplorer(
            "/units?faction=kin&unitKey=Unit_MinorFaction_Xavius_Upgraded&origin=xavius&minor=1"
        );

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=kin&unitKey=Unit_MinorFaction_Xavius_Upgraded&origin=xavius&minor=1"
            );
            expect(container.querySelector(".horizontalEvolution")).toHaveTextContent("Elite Pantinel");
        });

        expect(screen.getAllByText("Mighty Pantinel").length).toBeGreaterThan(0);
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

    it("uses the Veterancy Lens to preview Kin carousel stats at levels 0, 1, and 5", async () => {
        const user = userEvent.setup();
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_Kin_Root",
                displayName: "Kin Root",
                nextEvolutionUnitKeys: ["Unit_Kin_Evolved"],
                descriptionLines: veteranSmokeDescriptionLines,
            }),
            unit({
                unitKey: "Unit_Kin_Evolved",
                displayName: "Kin Evolved",
                previousUnitKey: "Unit_Kin_Root",
                evolutionTierIndex: 1,
            }),
        ]);

        const { container } = renderExplorer("/units?faction=kin&unitKey=Unit_Kin_Root");

        await waitFor(() => {
            expect(screen.getByRole("radio", { name: "Base stats" })).toHaveAttribute("aria-checked", "true");
            expect(getActiveCarouselStats(container)).toEqual(["40", "80", "6", "3", "1", "4"]);
        });

        await user.click(screen.getByRole("radio", { name: "Veterancy level 1" }));

        expect(screen.getByText("Level 1")).toBeInTheDocument();
        expect(getActiveCarouselStats(container)).toEqual(["42", "84", "8", "3", "1", "4"]);

        await user.click(screen.getByRole("radio", { name: "Veterancy level 5" }));

        expect(screen.getByText("Level 5")).toBeInTheDocument();
        expect(getActiveCarouselStats(container)).toEqual(["50", "100", "16", "3", "1", "4"]);
    });

    it.each(majorFactionSmokeCases)(
        "previews level 5 veterancy stats for a representative %s unit",
        async (_faction, routeFaction, unitKey) => {
            const user = userEvent.setup();
            mockedApiClient.getUnits.mockResolvedValue(majorFactionVeterancySmokeUnits());

            const { container } = renderExplorer(`/units?faction=${routeFaction}&unitKey=${unitKey}`);

            await waitFor(() => {
                expect(screen.getByRole("radio", { name: "Base stats" })).toHaveAttribute("aria-checked", "true");
                expect(getActiveCarouselStats(container)).toEqual(["40", "80", "6", "3", "1", "4"]);
            });

            await user.click(screen.getByRole("radio", { name: "Veterancy level 5" }));

            expect(screen.getByText("Level 5")).toBeInTheDocument();
            expect(getActiveCarouselStats(container)).toEqual(["50", "100", "16", "3", "1", "4"]);
        }
    );

    it("renders unit class display labels without collapsing camel-case words", async () => {
        mockedApiClient.getUnits.mockResolvedValue([
            unit({
                unitKey: "Unit_LastLord_DustBishopChariot_Upgrade01",
                displayName: "Leeching Palanquin",
                faction: "Lords",
                isMajorFaction: true,
                previousUnitKey: "Unit_LastLord_DustBishopChariot",
                unitClassKey: "UnitClass_JuggernaughtRanged",
                unitClassDisplayName: "Juggernaught Ranged",
                evolutionTierIndex: 1,
            }),
            unit({
                unitKey: "Unit_LastLord_DustBishopChariot",
                displayName: "Palanquin of the Profane",
                faction: "Lords",
                isMajorFaction: true,
                nextEvolutionUnitKeys: ["Unit_LastLord_DustBishopChariot_Upgrade01"],
                unitClassKey: "UnitClass_JuggernaughtRanged",
                unitClassDisplayName: "Juggernaught Ranged",
                evolutionTierIndex: 0,
            }),
        ]);

        renderExplorer("/units?faction=lords&unitKey=Unit_LastLord_DustBishopChariot_Upgrade01");

        expect((await screen.findAllByLabelText("Juggernaught Ranged")).length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText("Tier I").length).toBeGreaterThan(0);
        expect(screen.queryByText(/Juggernaughtranged/i)).not.toBeInTheDocument();
    });

    it("keeps /units faction selection writing through stores and updating the unit route", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/units?faction=kin&unitKey=Unit_Kin_Root"]}>
                <TopContainer />
                <UnitEvolutionExplorer />
                <LocationProbe />
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

    it("rehydrates unit selection when browser history changes the copied route params", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter
                initialEntries={[
                    "/units?faction=kin&unitKey=Unit_Kin_Root",
                    "/units?faction=lords&unitKey=Unit_Lords_Root",
                ]}
                initialIndex={1}
            >
                <BackButton />
                <UnitEvolutionExplorer />
                <LocationProbe />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=lords&unitKey=Unit_Lords_Root"
            );
            expect(screen.getAllByText("Lords Root").length).toBeGreaterThan(0);
        });

        await user.click(screen.getByRole("button", { name: "Back" }));

        await waitFor(() => {
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/units?faction=kin&unitKey=Unit_Kin_Root"
            );
            expect(screen.getAllByText("Kin Root").length).toBeGreaterThan(0);
        });
    });
});
