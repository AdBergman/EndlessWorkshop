import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    branchPayload,
    mixedPayload,
    payload,
    projectedLocalContinuationPayload,
    projectedLocalContinuationWithoutRevealPayload,
    repeatedDetailPayload,
} from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
    mockedApiClient,
    renderPage,
} from "@/features/quests/testUtils/questExplorerPageTestUtils";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";
import { Faction } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

describe("QuestExplorerPage filtering, projection, and rail navigation", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("reveals projected local continuation steps from explicit reveal metadata", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationPayload);
        renderPage("/quests/Quest_Projector?mode=strategy");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const initialChapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        expect(within(initialChapterPlan).getByRole("region", { name: "Step 1 of 3: Projected Setup" })).toBeInTheDocument();
        expect(within(initialChapterPlan).queryByRole("region", { name: "Step 2 of 3: Inspect the signal" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried future beat.")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        const selectedChoice = within(chronicle).getByRole("button", { name: /Search/ });

        expect(selectedChoice).toHaveAttribute("aria-current", "true");
        expect(selectedChoice).toHaveTextContent("Search");
        const selectedChapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        expect(within(selectedChapterPlan).getByRole("region", { name: "Step 2 of 3: Inspect the signal" })).toBeInTheDocument();
        expect(within(selectedChapterPlan).getByRole("region", { name: "Step 3 of 3: Report onward" })).toBeInTheDocument();
        expect(within(chronicle).getByText("Resolve the carried current beat.")).toBeInTheDocument();
        expect(within(chronicle).getByText("Resolve the carried next beat.")).toBeInTheDocument();
        expect(within(chronicle).getByText("Resolve the carried future beat.")).toBeInTheDocument();
        expect(screen.getByText(/Continues in Chapter 3/)).toBeInTheDocument();
    });

    it("does not bridge projected local steps without explicit reveal metadata", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationWithoutRevealPayload);
        renderPage("/quests/Quest_Projector?mode=strategy");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        expect(within(chronicle).queryByText("Step 2")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried next beat.")).not.toBeInTheDocument();
        const selectedChoice = within(chronicle).getByRole("button", { name: /Search/ });
        const selectedResult = within(chronicle).getByRole("region", { name: "Choosing Search leads to" });
        expect(selectedChoice).not.toHaveTextContent("Rejoins progression at Chapter 3: Next Chapter");
        expect(selectedResult).toHaveTextContent("Rejoins progression at Chapter 3: Next Chapter");
    });

    it("renders a lightweight single-category selector without duplicated faction filters", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(mixedPayload);
        renderPage("/quests");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        const categoryGroup = screen.getByRole("group", { name: "Category" });
        expect(within(categoryGroup).getByRole("radio", { name: /^Faction Quests\s+\d+$/ })).toBeChecked();
        expect(within(categoryGroup).getByRole("radio", { name: /^Minor Faction Quests\s+\d+$/ })).toBeInTheDocument();
        expect(within(categoryGroup).getByRole("radio", { name: /^World Quests\s+\d+$/ })).toBeInTheDocument();
        expect(within(categoryGroup).getByRole("radio", { name: /^Other Quests\s+\d+$/ })).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText("Major Faction")).not.toBeInTheDocument();
    });

    it("combines search with category filtering", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(mixedPayload);
        renderPage("/quests");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByLabelText(/World Quests/));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();

        await user.type(screen.getByLabelText("Search"), "missing");
        expect(screen.getByText("No quests match these filters.")).toBeInTheDocument();
        expect(screen.getByText("No quest matches the current filters.")).toBeInTheDocument();
    });

    it("uses the global faction context for faction quests while keeping world quests accessible", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(mixedPayload);
        renderPage("/quests");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        act(() => {
            useFactionSelectionStore.getState().setSelectedFaction({
                isMajor: true,
                enumFaction: Faction.LORDS,
                uiLabel: "Lords",
                minorName: null,
            });
        });

        expect(await screen.findByRole("heading", { name: "Last Lords Accord" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Archive of the First Tide/ })).not.toBeInTheDocument();

        await user.click(screen.getByLabelText(/World Quests/));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();
    });

    it("falls back to a visible quest and replaces the route when filters hide the selected quest", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(mixedPayload);
        renderPage("/quests/Quest_A");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        await user.click(screen.getByLabelText(/World Quests/));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_World"));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Archive of the First Tide" })).not.toBeInTheDocument();
    });

    it("renders chapter records with step metadata and hides branch outcomes from the progression rail", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(branchPayload);
        renderPage("/quests");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByText("Forgotten Power")).toBeInTheDocument();
        expect(within(rail).getByText("Chapter 2")).toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /Forgotten Power\s+Chapter 2\s+3 steps/ })).toBeInTheDocument();
        expect(within(rail).getByText("3 steps")).toBeInTheDocument();
        expect(within(rail).queryByText(/objectives|branches/)).not.toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /Step 1/ })).not.toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /Step 2/ })).not.toBeInTheDocument();
        expect(within(rail).queryByText("Step 0")).not.toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /Pious/ })).not.toBeInTheDocument();
        expect(within(rail).queryByText("FactionQuest_Mukag")).not.toBeInTheDocument();
    });

    it("keeps branch deep links in the content pane while selecting their visible rail context", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(branchPayload);
        renderPage("/quests/FactionQuest_Mukag_Chapter02_Step02_Choice01");

        expect(await screen.findByRole("heading", { name: "Pious" })).toBeInTheDocument();

        const rail = screen.getByRole("complementary");
        expect(within(rail).queryByRole("button", { name: /Pious/ })).not.toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /Forgotten Power\s+Chapter 2\s+3 steps/ })).toHaveAttribute("aria-current", "page");
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Step 2")).toBeInTheDocument();
        expect(within(chronicle).queryByText("virtual_alias_expanded")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("branch_variant")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Pious/ })).toHaveAttribute("aria-current", "true");
        expect(useQuestStore.getState().selectedEntryKey).toBe("FactionQuest_Mukag_Chapter02_Step02_Choice01");
    });

    it("focuses repeated detailEntryKey alias routes on their selected virtual step", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedDetailPayload);
        renderPage("/quests/Quest_Shared_Alias_Step02");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Step 2")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Step 1")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Chronicle Checkpoint")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("virtual_alias_expanded")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("repeated detail content")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Entry-backed")).not.toBeInTheDocument();
        expect(screen.getAllByText("The same chronicle page carries both steps.")).toHaveLength(1);
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Shared");
    });

    it("keeps a later canonical step selected in content while illuminating its chapter record", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(branchPayload);
        renderPage("/quests/FactionQuest_Mukag_Chapter02_Step04");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByRole("button", { name: /Forgotten Power\s+Chapter 2\s+3 steps/ })).toHaveAttribute("aria-current", "page");
        expect(useQuestStore.getState().selectedEntryKey).toBe("FactionQuest_Mukag_Chapter02_Step04");
    });
});
