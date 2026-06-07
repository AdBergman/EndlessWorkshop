import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { payload } from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
    MissingRouteHarness,
    mockedApiClient,
    renderPage,
} from "@/features/quests/testUtils/questExplorerPageTestUtils";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

describe("QuestExplorerPage route and deep-link hydration", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("hydrates an alias route and renders lore mode", async () => {
        renderPage("/quests/FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.getByText("The tide record begins.")).toBeInTheDocument();
        expect(screen.getByText("We follow the old marker.")).toBeInTheDocument();
        expect(screen.getByText("Follow the marker")).toBeInTheDocument();
        expect(screen.queryByText("Objectives")).not.toBeInTheDocument();
        expect(screen.queryByText("Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Rewards")).not.toBeInTheDocument();
        expect(screen.queryByText("Visit the first marker.")).not.toBeInTheDocument();
    });

    it("requests quest explorer data on page mount without relying on app bootstrap", async () => {
        renderPage("/quests");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);
    });

    it("hydrates the quest key from nested Quest Explorer paths", async () => {
        renderPage("/quests/FactionQuest_Alias/Branch_A/step-1?mode=strategy");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Selected progression" })).toHaveTextContent("Reach the marker.");
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("hydrates the quest query parameter for legacy links", async () => {
        renderPage("/quests?quest=FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("clears the selected entry when navigation lands on a missing alias", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/quests/Quest_A"]}>
                <Routes>
                    <Route path="/quests/*" element={<MissingRouteHarness />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Missing route" }));

        expect(await screen.findByText(/No quest entry or alias matches/)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Archive of the First Tide" })).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBeNull();
    });
});
