import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    branchPayload,
    choiceKeyScopedPayload,
    choiceResetPayload,
    kinChapterTwoStaticStrategyPayload,
    kinChapterThreeStagedStrategyPayload,
    lastLordChapterThreeStrategyPayload,
    minorVariantPayload,
    nextChapterPayload,
    payload,
    scopedReaderPayload,
    serializedContinuationPayload,
    stagedNecroLorePayload,
    stagedContinuationPayload,
    strategyDossierMarkerPayload,
    terminalNoLinkPayload,
} from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
    mockedApiClient,
    renderPage,
} from "@/features/quests/testUtils/questExplorerPageTestUtils";
import { Faction } from "@/types/dataTypes";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

describe("QuestExplorerPage Strategy planner behavior", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("renders one-option strategy mode as a chapter-plan task without choice framing", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 2: Follow the marker" });
        expect(within(chronicle).queryByRole("region", { name: "Current task" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Compact Objective" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Active Decision" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Available Paths" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(currentTask).getByText("Follow the marker")).toBeInTheDocument();
        expect(within(currentTask).getByText("Choose the marker path.")).toBeInTheDocument();
        expect(within(currentTask).getByText("Reach the marker.")).toBeInTheDocument();
        expect(within(currentTask).getAllByText("Visit the first marker.")).toHaveLength(1);
        expect(within(currentTask).getAllByText("Gain Dust.")).toHaveLength(1);
        expect(within(currentTask).getByText("Continuation")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in Chapter 1: Second Tide")).toBeInTheDocument();
        expect(screen.queryByText("The tide record begins.")).not.toBeInTheDocument();
        expect(screen.queryByText("We follow the old marker.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Follow the marker/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(chronicle.querySelector(".questExplorer-strategyProgressionDetails")).toBeNull();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("renders strategy branch comparison with per-branch tradeoffs and preserves alternatives after selection", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(strategyDossierMarkerPayload);
        renderPage("/quests/Quest_StrategyMarkers?mode=strategy");

        await screen.findByRole("heading", { name: "Marker Brief" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const comparison = within(chronicle).getByRole("region", { name: "Choose a path" });
        const riskOption = within(comparison).getByRole("button", { name: /Risk the breach/ });
        const rejoinOption = within(comparison).getByRole("button", { name: /Rejoin the line/ });

        expect(within(chronicle).getByRole("region", { name: "Chapter plan" })).toBeInTheDocument();
        expect(within(chronicle).getByRole("region", { name: "Step 1 of 1: Marker Brief" })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Current task" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Compact Objective" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(within(comparison).getByRole("region", { name: "Command Posture" })).toBeInTheDocument();
        expect(within(riskOption).getByText("Accept the failed advance risk.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Spend Influence to force the breach.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Gain emergency command authority.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Failure")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Return to the main operation.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Hold the line for one more turn.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Preserve veteran readiness.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Converges")).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();

        await user.click(riskOption);

        expect(riskOption).toHaveAttribute("aria-current", "true");
        expect(within(comparison).getByRole("button", { name: /Rejoin the line/ })).toBeInTheDocument();
        expect(within(riskOption).getByText("Selected")).toBeInTheDocument();
        expect(within(riskOption).getByText("Accept the failed advance risk.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Spend Influence to force the breach.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Gain emergency command authority.")).toBeInTheDocument();
        expect(within(riskOption).getAllByText("Spend Influence to force the breach.")).toHaveLength(1);
        expect(within(riskOption).getAllByText("Gain emergency command authority.")).toHaveLength(1);
        const riskResult = within(chronicle).getByRole("region", { name: "Choosing Risk the breach leads to" });
        expect(within(riskOption).queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(within(riskOption).queryByText("Projected Rewards")).not.toBeInTheDocument();
        expect(within(riskOption).queryByText("Fails at Chapter 1: Failed Advance")).not.toBeInTheDocument();
        expect(within(riskResult).getByText("Fails at Chapter 1: Failed Advance")).toBeInTheDocument();
        expect(chronicle.querySelector(".questExplorer-strategyProgressionDetails")).toBeNull();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Option Summary" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();
    });

    it("renders strategy dossier failure and convergence markers when a simulated branch exposes them", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(strategyDossierMarkerPayload);
        renderPage("/quests/Quest_StrategyMarkers?mode=strategy");

        await screen.findByRole("heading", { name: "Marker Brief" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Risk the breach/ }));

        let selectedOption = within(chronicle).getByRole("button", { name: /Risk the breach/ });
        let selectedResult = within(chronicle).getByRole("region", { name: "Choosing Risk the breach leads to" });
        expect(selectedOption).not.toHaveTextContent("Fails at Chapter 1: Failed Advance");
        expect(selectedResult).toHaveTextContent("Fails at Chapter 1: Failed Advance");
        expect(selectedResult.querySelector(".questExplorer-strategyNextStatus--failure")).not.toBeNull();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Rejoin the line/ }));

        selectedOption = within(chronicle).getByRole("button", { name: /Rejoin the line/ });
        selectedResult = within(chronicle).getByRole("region", { name: "Choosing Rejoin the line leads to" });
        expect(selectedOption).not.toHaveTextContent("Rejoins progression at Chapter 1: Main Line");
        expect(selectedResult).toHaveTextContent("Rejoins progression at Chapter 1: Main Line");
        expect(selectedResult.querySelector(".questExplorer-strategyNextStatus--converges")).not.toBeNull();
    });

    it("renders strategy as a chapter plan while keeping unselected variants out of task details", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(scopedReaderPayload);
        renderPage("/quests/Quest_Scoped");

        await screen.findByRole("heading", { name: "Forked Chronicle" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Hold the first line.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Secure the ash road.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Negotiate the coral road.")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Take the ash road/ })).toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Take the ash road/ }));

        expect(within(chronicle).getAllByText("Choose the ash road.").length).toBeGreaterThan(0);
        expect(within(chronicle).queryByText("Ash road later objective must wait.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Coral road outcome.")).not.toBeInTheDocument();
    });

    it("uses branch continuity metadata to prevent same-step future objectives from leaking", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceKeyScopedPayload);
        renderPage("/quests/Quest_Keyed?mode=strategy");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 1: Find Pryzja" });
        expect(within(currentTask).getByText("Find Pryzja")).toBeInTheDocument();
        expect(within(currentTask).getByText("Find Pryzja.")).toBeInTheDocument();
        expect(within(currentTask).queryByText("Continues in this chapter")).not.toBeInTheDocument();
        expect(within(currentTask).getByText("Resolve the current beat.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Select a path to preview its result and next destination.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("No path is being simulated yet.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Find Pryzja/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Eliminate the threat/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();
    });

    it("keeps same-entry serial continuations as active strategy decisions", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed?mode=strategy");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByRole("region", { name: "Chapter plan" })).toBeInTheDocument();
        expect(within(chronicle).getByText("3 steps")).toBeInTheDocument();

        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const setupTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 3: Find Pryzja" });
        const nextTask = within(chapterPlan).getByRole("region", { name: "Step 2 of 3: Eliminate the threat" });
        const futureTask = within(chapterPlan).getByRole("region", { name: "Step 3 of 3: Rebuild the city" });
        expect(within(setupTask).getByText("Find Pryzja")).toBeInTheDocument();
        expect(within(setupTask).getByText("Find Pryzja.")).toBeInTheDocument();
        expect(within(setupTask).getByText("Resolve the current beat.")).toBeInTheDocument();
        expect(within(setupTask).queryByText("Available")).not.toBeInTheDocument();
        expect(within(nextTask).getByText("Eliminate the threat")).toBeInTheDocument();
        expect(within(nextTask).getByText("Eliminate the threat.")).toBeInTheDocument();
        expect(within(nextTask).getByText("Resolve the next beat.")).toBeInTheDocument();
        expect(within(nextTask).queryByText("Continues in this chapter")).not.toBeInTheDocument();
        expect(within(nextTask).queryByText("Selected")).not.toBeInTheDocument();
        expect(within(futureTask).getByText("Rebuild the city")).toBeInTheDocument();
        expect(within(futureTask).getByText("Rebuild the city.")).toBeInTheDocument();
        expect(within(futureTask).getByText("Resolve the future beat.")).toBeInTheDocument();
        expect(within(futureTask).queryByText("Preview")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Eliminate the threat/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Rebuild the city/ })).not.toBeInTheDocument();
    });

    it("keeps Necrophage future endings out of the active Strategy choice set until the next branch stage", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedNecroLorePayload);
        renderPage("/quests/Quest_Necro_Ch6?mode=strategy");

        await screen.findByRole("heading", { name: "A Bitter Truth" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const enhanceChoice = within(chronicle).getByRole("button", { name: /Enhance Hero/ });
        expect(enhanceChoice).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Save Girl/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Execute Kazra/ })).not.toBeInTheDocument();

        await user.click(enhanceChoice);

        expect(within(chronicle).queryByRole("button", { name: /Rehabilitate Kazra/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Execute Kazra/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Release Kazra/ })).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Save Girl/ }));

        expect(within(chronicle).getByRole("button", { name: /Save Girl/ })).toHaveAttribute("aria-current", "true");
        expect(within(chronicle).getByRole("button", { name: /Release Kazra/ })).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Rehabilitate Kazra/ })).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Execute Kazra/ })).toBeInTheDocument();
    });

    it("keeps Kin Chapter 2 static Strategy tasks visible before and after choosing Search or Build", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(kinChapterTwoStaticStrategyPayload);
        renderPage("/quests/FactionQuest_KinOfSheredyn_Chapter02_Step01?mode=strategy");

        await screen.findByRole("heading", { name: "Stirrings" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        expect(within(chapterPlan).getByRole("region", { name: "Step 2 of 3: Interact with Mosaic Halls" })).toBeInTheDocument();
        expect(within(chapterPlan).getByRole("region", { name: "Step 3 of 3: Assign settlement population: Artisans 3 times" })).toBeInTheDocument();
        expect(within(chronicle).getByText("Eliminate the Necrophage threat.")).toBeInTheDocument();
        expect(within(chronicle).getByText("The Kin's inner strength must be bolstered.")).toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Build/ }));

        const selectedChapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        expect(within(chronicle).getByRole("button", { name: /Build/ })).toHaveAttribute("aria-current", "true");
        expect(within(selectedChapterPlan).getByRole("region", { name: "Step 2 of 3: Interact with Mosaic Halls" })).toBeInTheDocument();
        expect(within(selectedChapterPlan).getByRole("region", { name: "Step 3 of 3: Assign settlement population: Artisans 3 times" })).toBeInTheDocument();
        expect(within(chronicle).getAllByText("Eliminate the Necrophage threat.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The Kin's inner strength must be bolstered.")).toHaveLength(1);
    });

    it("renders Kin Chapter 3 Strategy as chronological branch-owned objectives without route duplication", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(kinChapterThreeStagedStrategyPayload);
        renderPage("/quests/FactionQuest_KinOfSheredyn_Chapter03_Step01?mode=strategy");

        await screen.findByRole("heading", { name: "What Lies Beneath" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        expect(within(chapterPlan).getByRole("region", {
            name: "Step 1 of 3: Rzeld's offered to be a guide to the site. Pay him.",
        })).toBeInTheDocument();
        expect(within(chapterPlan).getByRole("region", { name: "Step 2 of 3: Choose a path" })).toBeInTheDocument();
        expect(within(chapterPlan).getByRole("button", { name: /Quiet/ })).toBeInTheDocument();
        expect(within(chapterPlan).getByRole("button", { name: /Noisy/ })).toBeInTheDocument();
        expect(within(chapterPlan).queryByText("Objective routes")).not.toBeInTheDocument();
        expect(within(chapterPlan).queryByText("Route 1")).not.toBeInTheDocument();
        expect(within(chapterPlan).queryByText("Discover who among the Kin has been using the mine-and why.")).not.toBeInTheDocument();
        expect(within(chapterPlan).queryByText("Rescue Pryzja from the abandoned mine.")).not.toBeInTheDocument();

        await user.click(within(chapterPlan).getByRole("button", { name: /Noisy/ }));

        const selectedChapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const stepThree = within(selectedChapterPlan).getByRole("region", { name: "Step 3 of 3: Noisy path objectives" });
        expect(within(stepThree).getByText("Objectives")).toBeInTheDocument();
        expect(within(stepThree).getByText("Objective 1")).toBeInTheDocument();
        expect(within(stepThree).getByText("Objective 2")).toBeInTheDocument();
        expect(within(stepThree).getByText("Rescue Pryzja from the abandoned mine.")).toBeInTheDocument();
        expect(within(stepThree).getByText("Fight off the merc attack.")).toBeInTheDocument();
        expect(within(stepThree).queryByText("Route 1")).not.toBeInTheDocument();
        expect(within(stepThree).queryByText("Objective routes")).not.toBeInTheDocument();
        expect(within(stepThree).getAllByText("Clear the dungeon")).toHaveLength(1);
        expect(within(stepThree).getAllByText("Gain hero: Pryzja")).toHaveLength(2);
        expect(within(stepThree).queryByText("Discover who among the Kin has been using the mine-and why.")).not.toBeInTheDocument();
    });

    it("renders Last Lords Chapter 3 continuation objectives as path-specific Strategy requirements", async () => {
        const user = userEvent.setup();
        useFactionSelectionStore.getState().setSelectedFaction({
            isMajor: true,
            enumFaction: Faction.LORDS,
            uiLabel: "Last Lords",
            minorName: null,
        });
        mockedApiClient.getQuestExplorer.mockResolvedValue(lastLordChapterThreeStrategyPayload);
        renderPage("/quests/FactionQuest_LastLord_Chapter03_Step01?mode=strategy");

        await screen.findByRole("heading", { name: "The Fork in the Road" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Sanction/ }));

        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const continuation = within(chapterPlan).getByRole("region", { name: "Step 2 of 2: Follow the sanction path." });
        expect(within(continuation).getByText("Objectives")).toBeInTheDocument();
        expect(within(continuation).queryByText("Route 1")).not.toBeInTheDocument();
        expect(within(continuation).getByText("De Suluzzo advises strengthening our military.")).toBeInTheDocument();
        expect(within(continuation).getByText("Build: Stalwart 3 times")).toBeInTheDocument();
        expect(within(continuation).queryByText("Build constructible: Stalwart 3 times")).not.toBeInTheDocument();
        expect(within(continuation).getByText("Amass more Dust to further strengthen the Lords.")).toBeInTheDocument();
        expect(within(continuation).getByText("Maintain the required empire value for 5 turns")).toBeInTheDocument();
        expect(within(continuation).getByText("De Suluzzo counsels securing more lands to cement power.")).toBeInTheDocument();
        expect(within(continuation).getByText("Control 10 territories for 5 turns")).toBeInTheDocument();
        expect(within(continuation).queryByText("Aggregate sanction requirement")).not.toBeInTheDocument();
        expect(within(continuation).queryByText("Question the locals to discover the explorer's identity.")).not.toBeInTheDocument();
    });

    it("renders minor faction objective variants without aggregate overview", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(minorVariantPayload);
        renderPage("/quests");

        await user.click(await screen.findByRole("radio", { name: /^Minor Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Ancient Graveyard" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByLabelText("Strategy overview")).not.toBeInTheDocument();
        expect(screen.getByText("Objective 1")).toBeInTheDocument();
        expect(screen.getByText("Objective 2")).toBeInTheDocument();
        expect(screen.getByText("The divining ritual depends on a rare material.")).toBeInTheDocument();
        expect(screen.getByText("Travelers can contain useful clues.")).toBeInTheDocument();
        expect(screen.getByText("Maintain the required empire value.")).toBeInTheDocument();
        expect(screen.getByText("Gain Glassteel.")).toBeInTheDocument();
    });

    it("resets Strategy and Lore semantic selections on mode switches", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const loreShoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(loreShoreChoice);
        expect(loreShoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Continuation revealed")).not.toBeInTheDocument();

        const markerChoice = screen.getByRole("button", { name: /Follow the marker/ });
        await user.click(markerChoice);
        expect(markerChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Lore" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByRole("region", { name: "Choosing Follow the marker leads to" })).not.toBeInTheDocument();
    });

    it("returns to the selected chapter beginning when Strategy is reopened", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Lore" }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByRole("region", { name: "Choosing Follow the marker leads to" })).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("renders terminal no-link Strategy outcomes as a final story state", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(terminalNoLinkPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        expect(await screen.findByRole("heading", { name: "End of the Chronicle" })).toBeInTheDocument();
        const chapterPlan = screen.getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 1: End the story" });

        expect(within(currentTask).getByText("Final outcome")).toBeInTheDocument();
        expect(within(currentTask).getByText("Story currently ends here")).toBeInTheDocument();
        expect(within(currentTask).queryByText("Unknown continuation")).not.toBeInTheDocument();
    });

    it("surfaces staged continuation path variants once in Strategy mode without false choice controls", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedContinuationPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        await screen.findByRole("heading", { name: "A Gamble" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(screen.getByText("Path variants")).toBeInTheDocument();
        expect(within(chronicle).getByRole("article", { name: "Pious path variant" })).toBeInTheDocument();
        expect(within(chronicle).getByRole("article", { name: "Open path variant" })).toBeInTheDocument();
        expect(within(chronicle).getByRole("article", { name: "Bold path variant" })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Pious/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Open/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Bold/ })).not.toBeInTheDocument();
        expect(screen.queryByText("Far Pious")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Open")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Bold")).not.toBeInTheDocument();
    });

    it("keeps the Strategy rail on the selected chapter when a one-option chapter exits immediately", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(nextChapterPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const chapterPlan = within(chronicle).getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 1: Continue to chapter two" });
        const rail = screen.getByRole("complementary");
        expect(within(currentTask).getByText("Continue to chapter two")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in Chapter 2: Chapter Two Rising")).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Continue to chapter two/ })).not.toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /Archive of the First Tide\s+Chapter 1\s+1 step/ })).toHaveAttribute("aria-current", "page");
        expect(within(rail).getByRole("button", { name: /Chapter Two Rising\s+Chapter 2\s+1 step/ })).not.toHaveAttribute("aria-current", "page");
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_A?mode=strategy");
    });
});
