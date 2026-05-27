import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    artifactCleanupPayload,
    branchVariantProjectionPayload,
    payload,
    repeatedChoicePayload,
    stagedContinuationPayload,
    ungatedContinuationPayload,
    unresolvedChoicePayload,
} from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
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

describe("QuestExplorerPage debug and progression tooling", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("keeps progression debug hidden by default", async () => {
        renderPage("/quests/Quest_A");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Quest progression debug" })).not.toBeInTheDocument();
        expect(screen.queryByText("stepKey")).not.toBeInTheDocument();
    });

    it("renders progression debug from the URL param without changing decision behavior", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        const debugValue = (label: string) => {
            const row = Array.from(debugPanel.querySelectorAll(".questExplorer-debugRows > div"))
                .find((candidate) => candidate.querySelector("dt")?.textContent === label);
            return row?.querySelector("dd")?.textContent ?? "";
        };

        expect(within(debugPanel).getByText("Debug progression")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Show raw hidden rows" })).not.toBeChecked();
        expect(within(debugPanel).getAllByText("stepKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("Line_First_Tide:Faction_Kin:chapter-1:step-1")).toBeInTheDocument();
        expect(within(debugPanel).getAllByText("detailEntryKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("projectionKind").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("sourceEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("aliasEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("variant keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("continuation keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("active mode")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active branch sequence")).toBeInTheDocument();
        expect(within(debugPanel).getByText("Strategy selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("Lore selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("unresolved continuation")).toBeInTheDocument();
        expect(screen.getByText(/shown at Chapter 1 Step 1; owner Chapter 1 Step 1 .* branch -> Chapter 1 Step 2/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));

        await waitFor(() => {
            expect(within(debugPanel).getAllByText(/choiceId=branch:Branch_A/).length).toBeGreaterThan(0);
        });
        expect(debugValue("active mode")).toBe("lore");
        expect(debugValue("active branch sequence")).toContain("Branch_A");
        expect(debugValue("Strategy selection trace")).toBe("none");
        expect(debugValue("Lore selection trace")).toContain("Branch_A");
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("hides unresolved non-final main faction rows outside debug mode", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
    });

    it("hides ungated continuation rows from normal stage groups until raw debug is requested", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(ungatedContinuationPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Noisy Chronicle" });

        expect(screen.getByRole("button", { name: /Choose the first path/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Future-looking continuation/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/continuation row waits for a selected branch sequence/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByRole("button", { name: /Future-looking continuation/ })).toBeInTheDocument();
        expect(screen.getByText(/continuation row waits for a selected branch sequence/)).toBeInTheDocument();
    });

    it("keeps branch variant projections out of normal stage groups when entry-backed branches exist", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(branchVariantProjectionPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Projected Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByRole("button", { name: /Claim Lands/ })).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Seek Facility/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Projected Future/ })).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(within(chronicle).getByRole("button", { name: /Projected Future/ })).toBeInTheDocument();
    });

    it("stops gracefully in debug mode when a modeled row lacks explicit continuation keys", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/hidden in normal UI: no modeled continuation before final chapter/)).not.toBeInTheDocument();
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByText(/hidden in normal UI: no modeled continuation before final chapter/)).toBeInTheDocument();
        const chapterPlan = screen.getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 2: Take the unknown road" });
        expect(within(currentTask).getByText("Take the unknown road")).toBeInTheDocument();
        expect(within(currentTask).getByText("Unknown continuation")).toBeInTheDocument();
        expect(within(currentTask).queryByText("No explicit continuation is recorded for this stage.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("hides duplicate no-link artifact rows beside true choices outside debug mode", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(artifactCleanupPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Final Choice" });

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(1);
        expect(screen.queryByText("Artifact Reclaim")).not.toBeInTheDocument();
        expect(screen.queryByText("Artifact Reject")).not.toBeInTheDocument();
    });

    it("keeps artifact cleanup diagnostics readable in debug and reveals raw rows on demand", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(artifactCleanupPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Final Choice" });

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(1);
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        expect(within(debugPanel).getByText("normal visible semantic row count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("debug visible semantic row count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("hidden artifact count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active branch sequence")).toBeInTheDocument();
        expect(screen.queryByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(2);
        expect(screen.getAllByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).toHaveLength(2);
    });

    it("keeps staged continuation diagnostics readable in debug and reveals raw convergence rows on demand", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedContinuationPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "A Gamble" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(within(chronicle).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);
        expect(screen.queryByText(/hidden in normal UI: later convergence row collapsed behind nearer continuation choice/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(within(chronicle).getAllByRole("button", { name: /Pious/ }).length).toBeGreaterThanOrEqual(2);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ }).length).toBeGreaterThanOrEqual(2);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ }).length).toBeGreaterThanOrEqual(2);
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        expect(within(debugPanel).getByText("hidden staged continuation count")).toBeInTheDocument();
    });

    it("does not repeat branch rows for repeated detailEntryKey projection stages", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedChoicePayload);
        renderPage("/quests/Quest_Shared?debugQuestProgression=true");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByRole("button", { name: /Open the sealed page/ })).toHaveLength(1);
        expect(within(chronicle).queryByText("Step 2")).not.toBeInTheDocument();
    });
});
