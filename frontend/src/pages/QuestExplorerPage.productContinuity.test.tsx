import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import {
    aspectCh6A,
    kinCh0,
    kinCh1,
    kinCh4,
    kinCh6A,
    lastLordCh6A,
    lastLordCh6B,
    mukagCh2,
    mukagCh4,
    necroCh3,
    necroCh4,
    necroCh5,
    necroNavigationPayload,
    productContinuityPayload,
} from "@/features/quests/testUtils/questExplorerProductContinuityFixtures";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";
import { Faction } from "@/types/dataTypes";
import QuestExplorerPage from "./QuestExplorerPage";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

function selectFaction(faction: Faction, uiLabel: string) {
    useFactionSelectionStore.getState().setSelectedFaction({
        isMajor: true,
        enumFaction: faction,
        uiLabel,
        minorName: null,
    });
}

function renderProductQuest(entryKey: string, faction: Faction, uiLabel: string, debug = false) {
    selectFaction(faction, uiLabel);
    const route = `/quests/${entryKey}${debug ? "?debugQuestProgression=true" : ""}`;

    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/quests/*" element={<QuestExplorerPage />} />
            </Routes>
        </MemoryRouter>
    );
}

function chronicle() {
    return screen.getByRole("region", { name: "Selected progression" });
}

function chronicleButtons() {
    return within(chronicle()).getAllByRole("button");
}

function queryChronicleButton(name: RegExp) {
    return within(chronicle()).queryByRole("button", { name });
}

function queryChronicleButtons(name: RegExp) {
    return within(chronicle()).queryAllByRole("button", { name });
}

type MockIntersectionObserverRecord = {
    callback: IntersectionObserverCallback;
    elements: Set<Element>;
};

function stubIntersectionObservers(): MockIntersectionObserverRecord[] {
    const observers: MockIntersectionObserverRecord[] = [];
    class MockIntersectionObserver implements IntersectionObserver {
        readonly root = null;
        readonly rootMargin = "0px";
        readonly thresholds = [0];
        readonly elements = new Set<Element>();

        constructor(public callback: IntersectionObserverCallback) {
            observers.push({ callback, elements: this.elements });
        }

        disconnect() {
            this.elements.clear();
        }

        observe(element: Element) {
            this.elements.add(element);
        }

        takeRecords(): IntersectionObserverEntry[] {
            return [];
        }

        unobserve(element: Element) {
            this.elements.delete(element);
        }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    return observers;
}

function intersectLoreSegment(observers: MockIntersectionObserverRecord[], railEntryKey: string) {
    const target = observers.flatMap((observer) => [...observer.elements])
        .find((element) => element.getAttribute("data-rail-entry-key") === railEntryKey);
    expect(target).toBeDefined();
    observers.forEach((observer) => {
        if (!target || !observer.elements.has(target)) return;
        observer.callback([{
            boundingClientRect: { top: 0 } as DOMRectReadOnly,
            intersectionRatio: 1,
            isIntersecting: true,
            target,
        } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
}

function debugValue(label: string) {
    const panel = screen.getByRole("region", { name: "Quest progression debug" });
    const labelElement = within(panel).getByText(label);
    const value = labelElement.closest("div")?.querySelector("dd")?.textContent;
    expect(value).toBeDefined();
    return value ?? "";
}

function firstDebugStepValue(label: string) {
    return debugStepValue(0, label);
}

function debugStepValue(stepIndex: number, label: string) {
    const panel = screen.getByRole("region", { name: "Quest progression debug" });
    const step = panel.querySelectorAll(".questExplorer-debugStep")[stepIndex];
    expect(step).not.toBeNull();
    const labelElement = within(step as HTMLElement).getByText(label);
    const value = labelElement.closest("div")?.querySelector("dd")?.textContent;
    expect(value).toBeDefined();
    return value ?? "";
}

describe("QuestExplorerPage product continuity fixture", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(productContinuityPayload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("lets Kin Ch0 Lore read the deterministic tutorial chain without repeated clicks", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh0, Faction.KIN, "kin", true);

        expect(await screen.findByRole("heading", { name: "A New Home" })).toBeInTheDocument();
        expect(queryChronicleButton(/Found a home for the surviving Kin/)).not.toBeInTheDocument();
        expect(queryChronicleButton(/Start the task of rebuilding/)).not.toBeInTheDocument();
        expect(queryChronicleButton(/Find local allies/)).not.toBeInTheDocument();
        expect(within(chronicle()).getByText("Found a home for the surviving Kin.")).toBeInTheDocument();
        expect(within(chronicle()).getByText("Start the task of rebuilding your Empire.")).toBeInTheDocument();
        expect(within(chronicle()).getByText("Find local allies to join your ranks.")).toBeInTheDocument();
        expect(within(chronicle()).getByText("The Missing Youth")).toBeInTheDocument();
        expect(within(chronicle()).queryByText("Chronicle pauses")).not.toBeInTheDocument();
        expect(debugValue("reached continuation entry")).toBe(kinCh1);

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(within(chronicle()).getByRole("button", { name: /Found a home for the surviving Kin/ })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Start the task of rebuilding your Empire/ })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Find local allies to join your ranks/ })).toBeInTheDocument();
    });

    it("renders Kin Ch0 Strategy as a chapter-plan task without duplicate projected requirements", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh0, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "A New Home" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicleRegion = chronicle();
        const chapterPlan = within(chronicleRegion).getByRole("region", { name: "Chapter plan" });
        const currentTask = within(chapterPlan).getByRole("region", { name: "Step 1 of 1: Found a home for the surviving Kin." });
        expect(within(chronicleRegion).queryByRole("region", { name: "Current task" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Compact Objective" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(currentTask).queryByText("Alternative")).not.toBeInTheDocument();
        expect(within(currentTask).queryByText("Required Path")).not.toBeInTheDocument();
        expect(within(currentTask).getByText(/Found a home for the surviving Kin/)).toBeInTheDocument();
        expect(within(currentTask).getByText("Continuation")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in Chapter 1: The Missing Youth")).toBeInTheDocument();
        expect(within(currentTask).queryByText("Continues in this chapter")).not.toBeInTheDocument();
        expect(within(currentTask).queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(within(currentTask).queryByText("Projected Rewards")).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("button", { name: /Found a home for the surviving Kin/ })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(chronicleRegion.querySelector(".questExplorer-strategyProgressionDetails")).toBeNull();
    });

    it("surfaces Kin Ch6 terminal Leave and Stay objectives in Strategy while Lore keeps both choices", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh6A, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "A Place Called Home" })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Leave/ })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Stay/ })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicleRegion = chronicle();
        const decision = within(chronicleRegion).getByRole("region", { name: "Choose a path" });

        expect(within(chronicleRegion).queryByText("Step 1 of 1")).not.toBeInTheDocument();
        expect(within(decision).getByRole("button", { name: /Leave/ })).toBeInTheDocument();
        expect(within(decision).getByRole("button", { name: /Stay/ })).toBeInTheDocument();
        expect(decision).toHaveTextContent("Study the starfarers vessel.");
        expect(decision).toHaveTextContent("Build interstellar communications.");
        expect(decision).toHaveTextContent("Help the Kin embrace Saiadha as their home.");
        expect(decision).toHaveTextContent("Strengthen the Kin settlements.");
    });

    it("locks Kin Ch4 continuation gating counts and active branch sequence", async () => {
        const user = userEvent.setup();
        const normalRender = renderProductQuest(kinCh4, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);

        await user.click(within(chronicle()).getByRole("button", { name: /Track/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);
        expect(within(chronicle()).getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();

        normalRender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(kinCh4, Faction.KIN, "kin", true);

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("4");
        expect(firstDebugStepValue("hidden artifact count")).toBe("0");
        expect(debugValue("active branch sequence")).toBe("none");

        await user.click(within(chronicle()).getByRole("button", { name: /Track/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("4");
        expect(debugValue("active branch sequence")).toContain(`${kinCh4}:branch:1`);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);
        expect(within(chronicle()).getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();
        expect(screen.queryByText(/prerequisite branch path not selected/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(4);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(2);
        expect(screen.getByText(/prerequisite branch path not selected/)).toBeInTheDocument();
    });

    it("locks Necrophage Ch3 continuation gating counts", async () => {
        const user = userEvent.setup();
        const normalRender = renderProductQuest(necroCh3, Faction.NECROPHAGES, "necrophages");

        expect(await screen.findByRole("heading", { name: "Virgin Lands" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();

        await user.click(within(chronicle()).getByRole("button", { name: /Claim Lands/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();
        expect(within(chronicle()).getByText("Collect 3 collectibles")).toBeInTheDocument();

        normalRender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(necroCh3, Faction.NECROPHAGES, "necrophages", true);

        expect(await screen.findByRole("heading", { name: "Virgin Lands" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("4");

        await user.click(within(chronicle()).getByRole("button", { name: /Claim Lands/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("4");
        expect(debugValue("active branch sequence")).toContain(`${necroCh3}:branch:1`);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();
        expect(within(chronicle()).getByText("Collect 3 collectibles")).toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(4);
    });

    it("returns cleanly to Necrophage Ch3 after Lore choices in Ch4 and Ch5", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(necroNavigationPayload());
        renderProductQuest(necroCh4, Faction.NECROPHAGES, "necrophages");

        expect(await screen.findByRole("heading", { name: "A Fresh Lead" })).toBeInTheDocument();

        await user.click(within(chronicle()).getByRole("button", { name: /Follow the lead/ }));
        await user.click(within(chronicle()).getByRole("button", { name: /Help/ }));
        act(() => intersectLoreSegment(observers, necroCh5));
        await user.click(within(chronicle()).getByRole("button", { name: /Find the holy grail/ }));

        expect(useQuestStore.getState().selectedEntryKey).toBe(necroCh4);
        expect(screen.getByRole("button", { name: /The Holy Grail Chapter 5 3 steps/ })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Virgin Lands Chapter 3 1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe(necroCh3));
        expect(screen.getByRole("heading", { name: "Virgin Lands" })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Claim Lands/ })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Seek Facility/ })).toBeInTheDocument();
        expect(within(chronicle()).queryByRole("button", { name: /Help/ })).not.toBeInTheDocument();
        expect(within(chronicle()).queryByRole("button", { name: /Find the holy grail/ })).not.toBeInTheDocument();
    });

    it("locks Mukag Ch2 and Ch4 staged continuation cleanup counts", async () => {
        const user = userEvent.setup();
        const ch2Render = renderProductQuest(mukagCh2, Faction.TAHUK, "mukag");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(3);
        expect(queryChronicleButton(/Maintain the required empire value/)).not.toBeInTheDocument();
        expect(within(chronicle()).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle()).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle()).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);

        ch2Render.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(mukagCh4, Faction.TAHUK, "mukag", true);
        expect(await screen.findByRole("heading", { name: "A Gamble" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(3);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("0");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("8");
        expect(firstDebugStepValue("hidden artifact count")).toBe("2");
        expect(debugStepValue(1, "normal visible semantic row count")).toBe("4");
        expect(debugStepValue(1, "debug visible semantic row count")).toBe("7");
        expect(debugStepValue(1, "hidden staged continuation count")).toBe("3");
        expect(debugValue("active branch sequence")).toBe("none");
        expect(screen.queryByText(/hidden in normal UI: later convergence row collapsed behind nearer continuation choice/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(8);
    });

    it("reports Kin Ch4 Strategy as a chapter exit instead of complete", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh4, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicleRegion = chronicle();
        expect(within(chronicleRegion).getAllByRole("region", { name: "Chapter plan" })).toHaveLength(1);
        expect(within(chronicleRegion).queryByRole("region", { name: "Current task" })).not.toBeInTheDocument();
        await user.click(within(chronicleRegion).getByRole("button", { name: /Track/ }));

        const trackChoice = within(chronicleRegion).getByRole("button", { name: /Track/ });
        const trackResult = within(chronicleRegion).getByRole("region", { name: /Choosing .*Track.* leads to/ });
        expect(trackChoice).not.toHaveTextContent("Continues in Chapter 5: The Kin's Fate");
        expect(trackResult).toHaveTextContent("Continues in Chapter 5: The Kin's Fate");
        expect(trackChoice).not.toHaveTextContent("No further continuation is recorded");
        expect(useQuestStore.getState().selectedEntryKey).toBe(kinCh4);
    });

    it("locks Last Lord Ch6A and Ch6B duplicate artifact cleanup counts", async () => {
        const user = userEvent.setup();
        const ch6ARender = renderProductQuest(lastLordCh6A, Faction.LORDS, "lords", true);

        expect(await screen.findByRole("heading", { name: "A Mortal Life?" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("6");
        expect(firstDebugStepValue("hidden artifact count")).toBe("2");
        expect(screen.queryByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(6);
        expect(screen.getAllByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).toHaveLength(2);

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));
        await user.click(within(chronicle()).getByRole("button", { name: /Reclaim/ }));

        expect(firstDebugStepValue("normal visible semantic row count")).toBe("3");
        expect(debugValue("active branch sequence")).toContain(`${lastLordCh6A}:branch:2`);
        expect(queryChronicleButton(/Defeat Aspects' Army/)).toBeInTheDocument();

        ch6ARender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(lastLordCh6B, Faction.LORDS, "lords", true);
        expect(await screen.findByRole("heading", { name: "Welcome Back, Faithful Friend" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible semantic row count")).toBe("2");
        expect(firstDebugStepValue("debug visible semantic row count")).toBe("5");
        expect(firstDebugStepValue("hidden artifact count")).toBe("1");

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));
        expect(chronicleButtons()).toHaveLength(5);
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        await user.click(within(chronicle()).getByRole("button", { name: /Forgive/ }));

        expect(firstDebugStepValue("normal visible semantic row count")).toBe("3");
        expect(debugValue("active branch sequence")).toContain(`${lastLordCh6B}:branch:1`);
        expect(queryChronicleButton(/Pay the invoice at the quest location/)).toBeInTheDocument();
    });

    it("renders Last Lord Ch6 repeated-detail continuation lore before the final ending", async () => {
        const user = userEvent.setup();
        renderProductQuest(lastLordCh6A, Faction.LORDS, "lords");

        expect(await screen.findByRole("heading", { name: "A Mortal Life?" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Lore" }));
        await user.click(within(chronicle()).getByRole("button", { name: /Reclaim/ }));
        await user.click(within(chronicle()).getByRole("button", { name: /Defeat Aspects' Army/ }));

        const chronicleRegion = chronicle();
        expect(within(chronicleRegion).getByText("Archimedias' rebels make their final stand against Tyabana's mortal cure.")).toBeInTheDocument();
        expect(within(chronicleRegion).getByText("The Lords choose mortality, and the old curse loosens its hold.")).toBeInTheDocument();
        expect(within(chronicleRegion).getByRole("region", { name: "Chronicle conclusion" })).toHaveTextContent(
            /The story concludes here with\s+"Defeat Aspects' Army"\./
        );
        expect(within(chronicleRegion).getByText("The End")).toBeInTheDocument();
        expect(within(chronicleRegion).queryByText("Chronicle carry-forward")).not.toBeInTheDocument();
    });

    it("renders Aspect Ch6 repeated-detail finale lore before the final ending", async () => {
        const user = userEvent.setup();
        renderProductQuest(aspectCh6A, Faction.ASPECTS, "aspects");

        expect(await screen.findByRole("heading", { name: "Siblings' Fury" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Lore" }));
        await user.click(within(chronicle()).getByRole("button", { name: /Eliminate the last Xenos holdouts/ }));

        const chronicleRegion = chronicle();
        expect(within(chronicleRegion).getByText("Crytelon asks for every last sibling to be accounted for.")).toBeInTheDocument();
        expect(within(chronicleRegion).getByText("Xenos' clan is gone, and the Aspect chronicle falls quiet.")).toBeInTheDocument();
        expect(within(chronicleRegion).getByRole("region", { name: "Chronicle conclusion" })).toHaveTextContent(
            /The story concludes here with\s+"Eliminate the last Xenos holdouts\."/
        );
        expect(within(chronicleRegion).getByText("The End")).toBeInTheDocument();
        expect(within(chronicleRegion).queryByText("Chronicle carry-forward")).not.toBeInTheDocument();
    });
});
