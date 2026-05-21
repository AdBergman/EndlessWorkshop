import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import QuestExplorerPage from "./QuestExplorerPage";
import { useQuestStore } from "@/stores/questStore";
import type { QuestExplorerProgression, QuestExplorerResponse } from "@/types/questTypes";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction } from "@/types/dataTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const progressionQuestline = ({
    questLineKey = "Line_First_Tide",
    questLineFamilyKey = questLineKey,
    questLineName = "First Tide",
    factionKey = "Faction_Kin",
    factionFamilyKey = factionKey,
    factionName = "Kin",
    chapterNumber = 1,
    chapterOrder = 1,
    title = "Archive of the First Tide",
    steps,
}: {
    questLineKey?: string;
    questLineFamilyKey?: string;
    questLineName?: string;
    factionKey?: string;
    factionFamilyKey?: string;
    factionName?: string;
    chapterNumber?: number;
    chapterOrder?: number;
    title?: string;
    steps: Array<{
        stepNumber: number;
        stepOrder: number;
        title: string;
        detailEntryKey: string;
        variantEntryKeys?: string[];
    }>;
}): QuestExplorerProgression["questlines"][number] => ({
    questLineKey,
    questLineFamilyKey,
    questLineName,
    factionKey,
    factionFamilyKey,
    factionName,
    sourceQuestLineKeys: [questLineKey],
    sourceFactionKeys: [factionKey],
    chapters: [
        {
            chapterNumber,
            chapterOrder,
            title,
            steps: steps.map((step) => ({
                stepKey: `${questLineFamilyKey}:${factionFamilyKey}:chapter-${chapterOrder}:step-${step.stepOrder}`,
                stepNumber: step.stepNumber,
                stepOrder: step.stepOrder,
                title: step.title,
                projectionKind: step.variantEntryKeys?.length ? "virtual_alias_expanded" : "real_entry_backed",
                detailEntryKey: step.detailEntryKey,
                sourceEntryKeys: [step.detailEntryKey, ...(step.variantEntryKeys ?? [])],
                aliasEntryKeys: step.variantEntryKeys?.length ? [`${step.detailEntryKey}:alias`] : [],
                variants: [step.detailEntryKey, ...(step.variantEntryKeys ?? [])].map((entryKey, index) => ({
                    entryKey,
                    title: index === 0 ? step.title : entryKey,
                    variantKind: index === 0 ? "entry" : "branch_variant",
                    branchGroupKey: index === 0 ? null : step.detailEntryKey,
                    branchLabel: index === 0 ? null : title,
                    branchOrder: index === 0 ? null : index,
                    previousEntryKeys: [],
                    nextEntryKeys: [],
                    failureEntryKeys: [],
                    convergesIntoEntryKeys: [],
                })),
            })),
        },
    ],
});

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
            questType: "Faction Quest",
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
            questType: "Faction Quest",
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
    progression: {
        questlines: [
            progressionQuestline({
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Archive of the First Tide", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "Second Tide", detailEntryKey: "Quest_B" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

type QuestEntryOverride = Partial<Omit<QuestExplorerResponse["entries"][number], "navigation">> & {
    navigation?: Partial<QuestExplorerResponse["entries"][number]["navigation"]>;
};

const questEntry = ({
    navigation,
    ...overrides
}: QuestEntryOverride = {}): QuestExplorerResponse["entries"][number] => ({
    ...payload.entries[0],
    entryKey: overrides.entryKey ?? "Quest_Custom",
    title: overrides.title ?? "Custom Quest",
    summaryLines: overrides.summaryLines ?? [],
    aliases: overrides.aliases ?? [],
    loreView: overrides.loreView ?? { sections: [] },
    strategyView: overrides.strategyView ?? { objectives: [] },
    branches: overrides.branches ?? [],
    quality: overrides.quality ?? null,
    ...overrides,
    navigation: {
        ...payload.entries[0].navigation,
        ...navigation,
    },
});

const testObjective = (objectiveKey: string, text = objectiveKey) => ({
    objectiveKey,
    text,
    phase: "completion",
    requirements: [],
    rewards: [],
});

const testBranch = (branchKey: string, label = branchKey) => ({
    branchKey,
    choiceKey: null,
    label,
    orderIndex: null,
    groupKey: null,
    groupLabel: null,
    nextEntryKeys: [],
    failureEntryKeys: [],
    convergesIntoEntryKeys: [],
    lore: null,
    strategy: null,
});

const mixedPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        payload.entries[0],
        payload.entries[1],
        questEntry({
            entryKey: "Quest_Lords",
            title: "Last Lords Accord",
            questType: "Major Faction",
            navigation: {
                factionKey: "Faction_LastLord",
                factionName: "Last Lords",
                questLineKey: "FactionQuest_LastLord",
                questLineName: "Last Lords",
                sequenceIndex: 2,
            },
        }),
        questEntry({
            entryKey: "Quest_Minor",
            title: "Ametrine Envoy",
            questType: "Minor Faction Quest",
            navigation: {
                factionKey: "MinorFaction_Ametrine",
                factionName: "Ametrine",
                questLineKey: "MinorQuest_Ametrine",
                questLineName: "Ametrine",
                sequenceIndex: 3,
            },
        }),
        questEntry({
            entryKey: "Quest_World",
            title: "Lost Curiosity",
            questType: "Curiosity",
            navigation: {
                factionKey: null,
                factionName: null,
                questLineKey: "WorldQuest_Curiosity",
                questLineName: "World",
                sequenceIndex: 4,
            },
        }),
        questEntry({
            entryKey: "Quest_Other",
            title: "Final Reckoning",
            questType: "End Game",
            navigation: {
                factionKey: null,
                factionName: null,
                questLineKey: "EndGameQuest",
                questLineName: "End Game",
                sequenceIndex: 5,
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Archive of the First Tide", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "Second Tide", detailEntryKey: "Quest_B" },
                ],
            }),
            progressionQuestline({
                questLineKey: "FactionQuest_LastLord",
                questLineFamilyKey: "FactionQuest_LastLord",
                questLineName: "Last Lords",
                factionKey: "Faction_LastLord",
                factionFamilyKey: "Faction_LastLord",
                factionName: "Last Lords",
                title: "Last Lords Accord",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Last Lords Accord", detailEntryKey: "Quest_Lords" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

const branchPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step01",
            title: "Forgotten Power",
            aliases: ["ForgottenPower_Alias"],
            strategyView: {
                objectives: [
                    testObjective("Objective_A"),
                    testObjective("Objective_B"),
                    testObjective("Objective_C"),
                ],
            },
            branches: [
                testBranch("Branch_A"),
                testBranch("Branch_B"),
            ],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "FactionQuest_Mukag",
                questLineName: "Tahuks",
                chapter: 2,
                chapterLabel: "Chapter 2",
                step: 0,
                stepLabel: "Step 0",
                sequenceIndex: 0,
                stepOrder: 1,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: [],
                nextEntryKeys: ["FactionQuest_Mukag_Chapter02_Step02_Choice01"],
            },
        }),
        questEntry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "FactionQuest_Mukag",
                questLineName: "Tahuks",
                chapter: 2,
                chapterLabel: "Chapter 2",
                step: 2,
                stepLabel: "Step 2",
                sequenceIndex: 1,
                stepOrder: 20,
                branchGroupKey: "FactionQuest_Mukag_Chapter02_Step02",
                branchLabel: "Forgotten Power",
                branchOrder: 1,
                previousEntryKeys: ["FactionQuest_Mukag_Chapter02_Step01"],
                nextEntryKeys: [],
            },
        }),
        questEntry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step04",
            title: "Forgotten Power",
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "FactionQuest_Mukag",
                questLineName: "Tahuks",
                chapter: 2,
                chapterLabel: "Chapter 2",
                step: 4,
                stepLabel: "Step 4",
                sequenceIndex: 2,
                stepOrder: 3,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: ["FactionQuest_Mukag_Chapter02_Step02_Choice01"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                questLineKey: "FactionQuest_Mukag",
                questLineFamilyKey: "FactionQuest_Mukag",
                questLineName: "Tahuks",
                factionKey: "Faction_Kin",
                factionFamilyKey: "Faction_Kin",
                factionName: "Kin",
                chapterNumber: 2,
                chapterOrder: 2,
                title: "Forgotten Power",
                steps: [
                    {
                        stepNumber: 1,
                        stepOrder: 1,
                        title: "Forgotten Power",
                        detailEntryKey: "FactionQuest_Mukag_Chapter02_Step01",
                    },
                    {
                        stepNumber: 2,
                        stepOrder: 2,
                        title: "Forgotten Power",
                        detailEntryKey: "FactionQuest_Mukag_Chapter02_Step02",
                        variantEntryKeys: ["FactionQuest_Mukag_Chapter02_Step02_Choice01"],
                    },
                    {
                        stepNumber: 3,
                        stepOrder: 3,
                        title: "Forgotten Power",
                        detailEntryKey: "FactionQuest_Mukag_Chapter02_Step04",
                    },
                ],
            }),
        ],
        debugSummary: null,
    },
};

const repeatedDetailPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Shared",
            title: "Shared Chronicle",
            summaryLines: ["The same chronicle page carries both beats."],
            aliases: ["Quest_Shared_Alias_Step02"],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "Line_Shared",
                questLineName: "Shared Line",
                chapter: 4,
                chapterLabel: "Chapter 4",
                step: 1,
                stepLabel: "Step 1",
                sequenceIndex: 0,
                chapterOrder: 4,
                stepOrder: 1,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            {
                questLineKey: "Line_Shared",
                questLineFamilyKey: "Line_Shared",
                questLineName: "Shared Line",
                factionKey: "Faction_Kin",
                factionFamilyKey: "Faction_Kin",
                factionName: "Kin",
                sourceQuestLineKeys: ["Line_Shared"],
                sourceFactionKeys: ["Faction_Kin"],
                chapters: [
                    {
                        chapterNumber: 4,
                        chapterOrder: 4,
                        title: "Shared Chronicle",
                        steps: [
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-1",
                                stepNumber: 1,
                                stepOrder: 1,
                                title: "Shared Chronicle",
                                projectionKind: "real_entry_backed",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: [],
                                variants: [
                                    {
                                        entryKey: "Quest_Shared",
                                        title: "Shared Chronicle",
                                        variantKind: "entry",
                                        branchGroupKey: null,
                                        branchLabel: null,
                                        branchOrder: null,
                                        previousEntryKeys: [],
                                        nextEntryKeys: [],
                                        failureEntryKeys: [],
                                        convergesIntoEntryKeys: [],
                                    },
                                ],
                            },
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-2",
                                stepNumber: 2,
                                stepOrder: 2,
                                title: "Shared Chronicle Echo",
                                projectionKind: "virtual_alias_expanded",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: ["Quest_Shared_Alias_Step02"],
                                variants: [
                                    {
                                        entryKey: "Quest_Shared",
                                        title: "Shared Chronicle",
                                        variantKind: "entry",
                                        branchGroupKey: null,
                                        branchLabel: null,
                                        branchOrder: null,
                                        previousEntryKeys: [],
                                        nextEntryKeys: [],
                                        failureEntryKeys: [],
                                        convergesIntoEntryKeys: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        debugSummary: null,
    },
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
        useFactionSelectionStore.getState().reset();
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
        expect(within(chronicle).getByText("Alias beat")).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Branch variant\s+Pious/ })).toHaveAttribute("aria-current", "true");
        expect(useQuestStore.getState().selectedEntryKey).toBe("FactionQuest_Mukag_Chapter02_Step02_Choice01");
    });

    it("renders repeated detailEntryKey virtual steps as shared progression beats without duplicate content", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedDetailPayload);
        renderPage("/quests/Quest_Shared_Alias_Step02");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Step 1")).toBeInTheDocument();
        expect(within(chronicle).getByText("Step 2")).toBeInTheDocument();
        expect(within(chronicle).getByText("Alias beat")).toBeInTheDocument();
        expect(within(chronicle).getAllByText("Shared content")).toHaveLength(2);
        expect(screen.getAllByText("The same chronicle page carries both beats.")).toHaveLength(1);
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
