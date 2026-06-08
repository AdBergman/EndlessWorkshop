import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { apiClient } from "@/api/apiClient";
import { payload as questPayload } from "@/features/quests/testUtils/questExplorerPageFixtures";
import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useQuestStore } from "@/stores/questStore";
import { useTechPlannerStore } from "@/stores/techPlannerStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";
import type { CodexEntry, Unit } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getDistricts: vi.fn(),
        getImprovements: vi.fn(),
        getTechs: vi.fn(),
        getUnits: vi.fn(),
        getCodex: vi.fn(),
        getQuestExplorer: vi.fn(),
        getSavedBuild: vi.fn(),
        createSavedBuild: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const codexEntries: CodexEntry[] = [
    {
        exportKind: "districts",
        entryKey: "District_MarketSquare",
        displayName: "Market Square",
        descriptionLines: ["Centralized trade district."],
        referenceKeys: [],
    },
];

const units: Unit[] = [
    {
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
        unitClassDisplayName: null,
        attackSkillKey: null,
        abilityKeys: [],
        descriptionLines: [],
    },
];

describe("App route data hydration", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useQuestStore.getState().reset();
        useTechPlannerStore.getState().reset();
        useTechStore.getState().reset();
        useUnitStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        mockedApiClient.getDistricts.mockReset();
        mockedApiClient.getImprovements.mockReset();
        mockedApiClient.getTechs.mockReset();
        mockedApiClient.getUnits.mockReset();
        mockedApiClient.getCodex.mockReset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getSavedBuild.mockReset();
        mockedApiClient.createSavedBuild.mockReset();

        mockedApiClient.getDistricts.mockResolvedValue([]);
        mockedApiClient.getImprovements.mockResolvedValue([]);
        mockedApiClient.getTechs.mockResolvedValue([]);
        mockedApiClient.getUnits.mockResolvedValue(units);
        mockedApiClient.getCodex.mockResolvedValue(codexEntries);
        mockedApiClient.getQuestExplorer.mockResolvedValue(questPayload);
    });

    function renderFromInfoRoute() {
        return render(
            <MemoryRouter initialEntries={["/info"]}>
                <AppRoutes />
            </MemoryRouter>
        );
    }

    it("loads codex data on the first Codex navigation instead of rendering a permanent empty result", async () => {
        const user = userEvent.setup();

        renderFromInfoRoute();

        await user.click(screen.getByRole("link", { name: "Codex" }));

        expect(await screen.findByRole("heading", { name: "Codex Overview" })).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /districts 1/i }).length).toBeGreaterThan(0);
        expect(mockedApiClient.getCodex).toHaveBeenCalledTimes(1);
    });

    it("loads units data on the first Units navigation", async () => {
        const user = userEvent.setup();

        renderFromInfoRoute();

        await user.click(screen.getByRole("link", { name: "Units" }));

        expect((await screen.findAllByText("Kin Root")).length).toBeGreaterThan(0);
        expect(mockedApiClient.getUnits).toHaveBeenCalledTimes(1);
    });

    it("loads quest explorer data on the first Quests navigation", async () => {
        const user = userEvent.setup();

        renderFromInfoRoute();

        await user.click(screen.getByRole("link", { name: "Quests" }));

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);
    });
});
