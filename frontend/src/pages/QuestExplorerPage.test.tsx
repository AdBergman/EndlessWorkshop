import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import QuestExplorerPage from "./QuestExplorerPage";
import { useQuestStore } from "@/stores/questStore";
import type { QuestExplorerResponse } from "@/types/questTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const payload: QuestExplorerResponse = {
    gameVersion: "0.80",
    exporterVersion: "0.1.0",
    exportedAtUtc: "now",
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    entries: [
        {
            entryKey: "Quest_A",
            title: "Archive of the First Tide",
            summaryLines: ["A recovered strategic record."],
            questType: "Faction",
            isMandatory: true,
            isKeyNarrativeBeat: true,
            aliases: ["FactionQuest_Alias"],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "Line_First_Tide",
                questLineName: "First Tide",
                chapter: 1,
                chapterLabel: "Chapter 1",
                step: 1,
                stepLabel: "Step 1",
                sequenceIndex: 0,
                chapterOrder: 1,
                stepOrder: 1,
                branchGroupKey: "Branch_First_Tide",
                branchLabel: "First Tide",
                branchOrder: 1,
                isBranchStart: true,
                isBranchEnd: false,
                previousEntryKeys: [],
                nextEntryKeys: ["Quest_B"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_A:start",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [
                            { speakerLabel: "Archive", role: "narrator", text: "The tide record begins." },
                            { speakerLabel: "Envoy", role: "character", text: "We follow the old marker." },
                        ],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    {
                        objectiveKey: "Objective_A",
                        text: "Reach the marker.",
                        phase: "completion",
                        requirements: [
                            {
                                requirementKey: "Requirement_A",
                                kind: "Location",
                                displayText: "Visit the first marker.",
                                polarity: null,
                                groupLabel: "Marker",
                                groupOrder: 1,
                                targetRole: null,
                                targetLabel: "First marker",
                                requiredCount: null,
                                durationTurns: null,
                                state: null,
                                referenceKind: null,
                                referenceKey: null,
                                referenceDisplayName: null,
                                codexEntryKey: null,
                            },
                        ],
                        rewards: [
                            {
                                rewardKey: "Reward_A",
                                kind: "Resource",
                                displayText: "Gain Dust.",
                                amount: 40,
                                groupLabel: "Reward",
                                groupOrder: 1,
                                formulaText: null,
                                assetKind: null,
                                assetKey: null,
                                assetDisplayName: "Dust",
                                referenceKind: null,
                                referenceKey: null,
                                referenceDisplayName: null,
                                codexEntryKey: null,
                                targetScopeLabel: null,
                            },
                        ],
                    },
                ],
            },
            branches: [
                {
                    branchKey: "Branch_A",
                    choiceKey: "Choice_A",
                    label: "Follow the marker",
                    orderIndex: 1,
                    groupKey: "Branch_First_Tide",
                    groupLabel: "First Tide",
                    nextEntryKeys: ["Quest_B"],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                    lore: { outcomePreviewLines: ["The path continues."] },
                    strategy: { conditions: ["Choose the marker path."], requirements: [], rewards: [] },
                },
            ],
            quality: { warnings: [] },
        },
        {
            entryKey: "Quest_B",
            title: "Second Tide",
            summaryLines: [],
            questType: "Faction",
            isMandatory: false,
            isKeyNarrativeBeat: false,
            aliases: [],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "Line_First_Tide",
                questLineName: "First Tide",
                chapter: 1,
                chapterLabel: "Chapter 1",
                step: 2,
                stepLabel: "Step 2",
                sequenceIndex: 1,
                chapterOrder: 1,
                stepOrder: 2,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                isBranchStart: false,
                isBranchEnd: false,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: { sections: [] },
            strategyView: { objectives: [] },
            branches: [],
            quality: null,
        },
    ],
};

function renderPage(initialEntry = "/quests") {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/quests/*" element={<QuestExplorerPage />} />
            </Routes>
        </MemoryRouter>
    );
}

function MissingRouteHarness() {
    const navigate = useNavigate();

    return (
        <>
            <button type="button" onClick={() => navigate("/quests/MissingAlias")}>
                Missing route
            </button>
            <QuestExplorerPage />
        </>
    );
}

describe("QuestExplorerPage", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    it("hydrates an alias route and renders lore mode", async () => {
        renderPage("/quests/FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.getByText("The tide record begins.")).toBeInTheDocument();
        expect(screen.getByText("We follow the old marker.")).toBeInTheDocument();
        expect(screen.getByText("Follow the marker")).toBeInTheDocument();
    });

    it("hydrates the quest query parameter for legacy links", async () => {
        renderPage("/quests?quest=FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("renders strategy mode and branch navigation from backend arrays", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByText("Reach the marker.")).toBeInTheDocument();
        expect(screen.getByText("Visit the first marker.")).toBeInTheDocument();
        expect(screen.getByText("Gain Dust.")).toBeInTheDocument();

        await user.click(screen.getAllByRole("button", { name: "Second Tide" })[0]);
        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_B"));
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
