import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { useQuestStore } from "@/stores/questStore";
import type {
    QuestChoiceDto,
    QuestDialogBlockDto,
    QuestDto,
    QuestExplorerDto,
    QuestStepDto,
} from "@/types/questTypes";
import QuestExplorerPage from "./QuestExplorerPage";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Secure the archive.",
    nextQuestKey: null,
    failQuestKey: null,
    descriptionLines: ["Read the old record."],
    completionPrerequisiteLines: ["Complete the survey."],
    failurePrerequisiteLines: [],
    forbiddenPrerequisiteLines: [],
    selectionPrerequisiteLines: ["Have a hero."],
    rewardDisplayLines: ["Gain influence."],
    referenceKeys: [],
    dialogBlockIdentities: ["Step_Block_A"],
    ...overrides,
});

const choice = (overrides: Partial<QuestChoiceDto> = {}): QuestChoiceDto => ({
    choiceKey: "Choice_A",
    displayName: "Archive Route",
    choiceOrder: 0,
    descriptionLines: ["Follow the archive route."],
    completionPrerequisiteLines: ["Hold the archive."],
    failurePrerequisiteLines: [],
    rewardDisplayLines: ["Gain Dust."],
    nextQuestKeys: [],
    referenceKeys: [],
    steps: [step()],
    ...overrides,
});

const quest = (overrides: Partial<QuestDto> = {}): QuestDto => ({
    questKey: "Quest_A",
    displayName: "First Quest",
    descriptionLines: ["The archive opens."],
    categoryKey: null,
    categoryType: "Curiosity",
    branchStart: false,
    branchEnd: false,
    mandatory: false,
    keyNarrativeBeat: false,
    narrativeVictoryPathChoice: false,
    chapterKey: "Chapter_A",
    chapterIndex: 0,
    chapterNumber: 1,
    questSequenceIndex: 1,
    branchGroupKey: null,
    branchLabel: null,
    inferredFactionKey: "Faction_Kin",
    inferredQuestLineKey: "QuestLine_Kin",
    convergesIntoQuestKey: null,
    previousQuestKeys: [],
    nextQuestKeys: [],
    referenceKeys: [],
    rootDialogBlockIdentities: ["Root_Block_A"],
    choices: [choice()],
    ...overrides,
});

const dialogBlock = (overrides: Partial<QuestDialogBlockDto> = {}): QuestDialogBlockDto => ({
    identity: "Root_Block_A",
    questKey: "Quest_A",
    choiceKey: null,
    stepIndex: null,
    parentScope: "QUEST",
    dialogKey: "Dialog_A",
    phase: "intro",
    expectedLineCount: 1,
    blockOrder: 0,
    lines: [
        {
            lineOrder: 0,
            sourceLineIndex: 4,
            role: "narrator",
            speakerLabel: "Archivist",
            text: "The first record is restored.",
        },
    ],
    ...overrides,
});

function explorerFixture(): QuestExplorerDto {
    return {
        quests: [
            quest({
                questKey: "Quest_A",
                displayName: "First Quest",
                questSequenceIndex: 1,
                nextQuestKeys: ["Quest_B"],
            }),
            quest({
                questKey: "Quest_B",
                displayName: "Second Quest",
                questSequenceIndex: 2,
                rootDialogBlockIdentities: ["Root_Block_B"],
                choices: [
                    choice({
                        choiceKey: "Choice_B",
                        displayName: "Second Route",
                        steps: [
                            step({
                                stepIndex: 1,
                                stepOrder: 1,
                                objectiveText: "Follow the second record.",
                                dialogBlockIdentities: ["Step_Block_B"],
                            }),
                        ],
                    }),
                ],
            }),
        ],
        dialogBlocks: [
            dialogBlock({ identity: "Root_Block_A", questKey: "Quest_A" }),
            dialogBlock({
                identity: "Step_Block_A",
                questKey: "Quest_A",
                parentScope: "STEP",
                phase: "objective",
                blockOrder: 1,
                lines: [
                    {
                        lineOrder: 0,
                        sourceLineIndex: 7,
                        role: "character",
                        speakerLabel: "Scout",
                        text: "The trail is readable.",
                    },
                ],
            }),
            dialogBlock({
                identity: "Root_Block_B",
                questKey: "Quest_B",
                phase: "intro",
                blockOrder: 0,
                lines: [
                    {
                        lineOrder: 0,
                        sourceLineIndex: 11,
                        role: "narrator",
                        speakerLabel: null,
                        text: "A second record waits.",
                    },
                ],
            }),
            dialogBlock({
                identity: "Step_Block_B",
                questKey: "Quest_B",
                parentScope: "STEP",
                phase: "objective",
                blockOrder: 1,
                lines: [
                    {
                        lineOrder: 0,
                        sourceLineIndex: 12,
                        role: "character",
                        speakerLabel: "Archivist",
                        text: "The second branch is active.",
                    },
                ],
            }),
        ],
    };
}

async function renderQuestExplorer(initialEntry = "/quests") {
    let result: ReturnType<typeof render> | null = null;

    await act(async () => {
        result = render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path="/quests"
                        element={
                            <>
                                <LocationProbe />
                                <QuestExplorerPage />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );
    });
    await act(async () => {
        await Promise.resolve();
    });

    return result!;
}

describe("QuestExplorerPage", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(explorerFixture());
    });

    afterEach(() => {
        cleanup();
        useQuestStore.getState().reset();
    });

    it("loads quest explorer data on mount and renders the skeleton panels", async () => {
        await renderQuestExplorer();

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText("Quest archive")).toBeInTheDocument();
        expect(screen.getByLabelText("Quest branches")).toBeInTheDocument();
        expect(screen.getByText("The archive opens.")).toBeInTheDocument();
        expect(screen.getByText("The first record is restored.")).toBeInTheDocument();
        expect(screen.getByText("The trail is readable.")).toBeInTheDocument();
        expect(screen.queryByText("Root_Block_A")).not.toBeInTheDocument();
        expect(screen.queryByText("Step_Block_A")).not.toBeInTheDocument();
    });

    it("defaults to strategy mode and switches mode in route-local query state", async () => {
        const user = userEvent.setup();

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        expect(screen.getByLabelText("Quest branches")).toBeInTheDocument();

        const modeSwitch = screen.getByLabelText("Quest Explorer mode");
        expect(within(modeSwitch).getByRole("button", { name: "Strategy" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );

        await user.click(within(modeSwitch).getByRole("button", { name: "Lore" }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("quest=Quest_A");
            expect(screen.getByTestId("location-probe")).toHaveTextContent("mode=lore");
        });

        const loreChronicle = screen.getByRole("article", { name: "First Quest" });
        expect(screen.queryByLabelText("Quest branches")).not.toBeInTheDocument();
        expect(within(loreChronicle).getByText("Lore Chronicle")).toBeInTheDocument();
        expect(within(loreChronicle).getByLabelText("Lore transcript")).toBeInTheDocument();
        expect(within(loreChronicle).getByText("Story Branches")).toBeInTheDocument();
        expect(within(loreChronicle).getByText("Strategy Notes")).toBeInTheDocument();

        await user.click(within(modeSwitch).getByRole("button", { name: "Strategy" }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("mode=strategy");
        });
        expect(screen.getByLabelText("Quest branches")).toBeInTheDocument();
    });

    it("reads lore mode from the URL while preserving canonical quest selection", async () => {
        await renderQuestExplorer("/quests?mode=lore");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("mode=lore");
            expect(screen.getByTestId("location-probe")).toHaveTextContent("quest=Quest_A");
        });
        expect(screen.getByLabelText("Quest archive")).toBeInTheDocument();
        expect(screen.queryByLabelText("Quest branches")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Lore transcript")).toBeInTheDocument();
    });

    it("keeps archive, selected content, and strategy outcome panels scoped to their responsibilities", async () => {
        const user = userEvent.setup();

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        const archiveRail = screen.getByLabelText("Quest archive");
        const chronicle = screen.getByRole("article", { name: "First Quest" });
        const pathPanel = screen.getByLabelText("Quest branches");

        expect(within(archiveRail).getByLabelText("Search quest archive")).toBeInTheDocument();
        expect(within(chronicle).getByText("Strategic Chronicle")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Record Context")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Reference Trail")).not.toBeInTheDocument();
        expect(within(pathPanel).getByText("Branches")).toBeInTheDocument();
        expect(within(pathPanel).getByText("Selected Branch")).toBeInTheDocument();
        expect(within(pathPanel).queryByText("Record Context")).not.toBeInTheDocument();
        expect(within(pathPanel).getByText("Reference Trail")).toBeInTheDocument();

        await user.click(within(screen.getByLabelText("Quest Explorer mode")).getByRole("button", { name: "Lore" }));

        const loreChronicle = await screen.findByRole("article", { name: "First Quest" });
        expect(screen.queryByLabelText("Quest branches")).not.toBeInTheDocument();
        expect(within(loreChronicle).getByText("Lore Chronicle")).toBeInTheDocument();
        expect(within(loreChronicle).getByLabelText("Lore transcript")).toBeInTheDocument();
    });

    it("updates the selected quest URL param from the progression rail", async () => {
        const user = userEvent.setup();

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();

        await user.click(within(screen.getByLabelText("Quest archive")).getByRole("button", {
            name: /Second Quest/i,
        }));

        expect(await screen.findByRole("heading", { name: "Second Quest" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/quests?quest=Quest_B");
        });
        expect(screen.getByText("The second branch is active.")).toBeInTheDocument();
    });

    it("searches the archive rail while leaving hidden selected content visible", async () => {
        const user = userEvent.setup();

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        const rail = screen.getByLabelText("Quest archive");

        await user.type(within(rail).getByLabelText("Search quest archive"), "Quest_B");

        expect(within(rail).getByText("1 group / 1 entry")).toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /Second Quest/i })).toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /First Quest/i })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        expect(within(rail).queryByText("Selected quest is outside the current archive filters.")).not.toBeInTheDocument();
        expect(within(rail).getAllByRole("button", { name: "Clear filters" })).toHaveLength(1);

        await user.click(within(rail).getByRole("button", { name: "Clear filters" }));

        expect(within(rail).getByRole("button", { name: /First Quest/i })).toHaveAttribute("aria-pressed", "true");
    });

    it("filters the archive by the selected faction dropdown", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "First Quest",
                    inferredFactionKey: "Faction_Kin",
                    inferredQuestLineKey: "FactionQuest_Kin",
                }),
                quest({
                    questKey: "Quest_B",
                    displayName: "Second Quest",
                    inferredFactionKey: "Faction_Lords",
                    inferredQuestLineKey: "FactionQuest_Lords",
                    questSequenceIndex: 2,
                    rootDialogBlockIdentities: [],
                    choices: [],
                }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        const rail = screen.getByLabelText("Quest archive");
        expect(within(rail).getByRole("option", { name: "All" })).toBeInTheDocument();
        expect(within(rail).getByRole("option", { name: "Kin (1)" })).toBeInTheDocument();
        expect(within(rail).getByRole("option", { name: "Lords (1)" })).toBeInTheDocument();

        await user.selectOptions(within(rail).getByLabelText("Faction"), "Lords");

        expect(within(rail).getByRole("button", { name: /Second Quest/i })).toBeInTheDocument();
        expect(within(rail).queryByRole("button", { name: /First Quest/i })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "First Quest" })).toBeInTheDocument();
    });

    it("falls back safely when the quest URL param does not resolve", async () => {
        await renderQuestExplorer("/quests?quest=Missing_Quest");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/quests?quest=Quest_A");
        });
    });

    it("groups major faction rail rows while preserving hidden member deep links", async () => {
        const hiddenMemberQuestKey = "FactionQuest_Necrophage_Chapter06_Step03_Choice01";
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "FactionQuest_Necrophage_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    descriptionLines: ["Canonical entry."],
                    categoryType: "MajorFaction",
                    mandatory: true,
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_Necrophage",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
                quest({
                    questKey: hiddenMemberQuestKey,
                    displayName: "A Bitter Truth",
                    descriptionLines: ["Hidden member entry."],
                    categoryType: "MajorFaction",
                    mandatory: true,
                    chapterNumber: 6,
                    branchGroupKey: "FactionQuest_Necrophage_Chapter06_Step03",
                    inferredQuestLineKey: "FactionQuest_Necrophage",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
                quest({
                    questKey: "FactionQuest_Necrophage02_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    descriptionLines: ["Alternate entry."],
                    categoryType: "MajorFaction",
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_Necrophage02",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
                quest({
                    questKey: "FactionQuest_KinOfSheredyn_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    categoryType: "MajorFaction",
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_KinOfSheredyn",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
                quest({
                    questKey: "Quest_Curiosity_A_Branch01",
                    displayName: "A Bitter Truth",
                    categoryType: "Curiosity",
                    chapterNumber: 6,
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer(`/quests?quest=${hiddenMemberQuestKey}`);

        expect(await screen.findByText("Hidden member entry.")).toBeInTheDocument();
        const rail = screen.getByLabelText("Quest archive");
        expect(within(rail).getAllByRole("button", { name: /A Bitter Truth/i })).toHaveLength(3);
        expect(within(rail).getByText("Necrophage · 3 entries")).toBeInTheDocument();
        expect(within(rail).getByText("2 variants")).toBeInTheDocument();
    });

    it("renders provenance and compact disambiguators for duplicate quest link titles", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Archive Start",
                    nextQuestKeys: ["Quest_Target_A"],
                    convergesIntoQuestKey: "Quest_Target_B",
                    choices: [
                        choice({
                            nextQuestKeys: ["Quest_Target_B"],
                            steps: [
                                step({
                                    nextQuestKey: "Quest_Target_A",
                                    failQuestKey: "Quest_Target_B",
                                }),
                            ],
                        }),
                    ],
                }),
                quest({
                    questKey: "Quest_Target_A",
                    displayName: "A Bitter Truth",
                    chapterNumber: 2,
                    questSequenceIndex: 4,
                    branchLabel: "Branch A",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
                quest({
                    questKey: "Quest_Target_B",
                    displayName: "A Bitter Truth",
                    chapterNumber: 2,
                    questSequenceIndex: 5,
                    branchLabel: "Branch B",
                    choices: [],
                    rootDialogBlockIdentities: [],
                }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "Archive Start" })).toBeInTheDocument();
        const chronicle = screen.getByRole("article", { name: "Archive Start" });
        const pathPanel = screen.getByLabelText("Quest branches");
        expect(within(chronicle).queryByText("Reference Trail")).not.toBeInTheDocument();
        expect(within(pathPanel).getByText("Reference Trail")).toBeInTheDocument();
        expect(screen.queryByText("Quest graph next")).not.toBeInTheDocument();
        expect(screen.queryByText("Converges into")).not.toBeInTheDocument();
        expect(screen.getAllByText("A Bitter Truth").length).toBeGreaterThanOrEqual(4);
        expect(screen.getAllByText("Chapter 2 · Path A · Kin").length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText("Chapter 2 · Path B · Kin").length).toBeGreaterThanOrEqual(3);
        expect(screen.queryByText("Quest graph")).not.toBeInTheDocument();
        expect(screen.queryByText("Step")).not.toBeInTheDocument();
        expect(screen.queryByText("Converges")).not.toBeInTheDocument();
    });

    it("renders repeated threshold steps as one progress gate ladder", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Not of the Chorus",
                    choices: [
                        choice({
                            choiceKey: "Choice_A",
                            displayName: "Dislodge Memories",
                            completionPrerequisiteLines: ["Explore world: 20%", "Explore world: 30%"],
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: "Attempt to dislodge Xenos' memories.",
                                    selectionPrerequisiteLines: ["Explore world: 1%"],
                                    completionPrerequisiteLines: ["Explore world: 20%"],
                                    forbiddenPrerequisiteLines: ["Explore world: 20%"],
                                    dialogBlockIdentities: [
                                        "Quest_A|Choice_A|0|Dialog_Start|start",
                                        "Quest_A|Choice_A|0|Dialog_End|success",
                                    ],
                                }),
                                step({
                                    stepIndex: 1,
                                    objectiveText: "Attempt to dislodge Xenos' memories.",
                                    selectionPrerequisiteLines: ["Explore world: 21%"],
                                    completionPrerequisiteLines: ["Explore world: 30%"],
                                    forbiddenPrerequisiteLines: ["Explore world: 30%"],
                                    dialogBlockIdentities: [
                                        "Quest_A|Choice_A|1|Dialog_Start|start",
                                        "Quest_A|Choice_A|1|Dialog_End|success",
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "Not of the Chorus" })).toBeInTheDocument();
        const pathPanel = screen.getByLabelText("Quest branches");
        const chronicle = screen.getByRole("article", { name: "Not of the Chorus" });
        expect(within(pathPanel).getByText("Branches")).toBeInTheDocument();
        expect(within(pathPanel).getByText("Selected Branch")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Branches")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Selected Branch")).not.toBeInTheDocument();
        expect(screen.getByText("Progress Gates")).toBeInTheDocument();
        expect(screen.queryByText("Progress Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Selected Progress Gate")).not.toBeInTheDocument();
        expect(screen.getAllByText("Attempt to dislodge Xenos' memories.").length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByRole("button", { name: /Attempt to dislodge Xenos' memories/i })).not.toBeInTheDocument();
        expect(screen.getByText("2 thresholds")).toBeInTheDocument();
        expect(screen.queryByText("2 gate variants")).not.toBeInTheDocument();
        expect(screen.getByText("Threshold 1")).toBeInTheDocument();
        expect(screen.getByText("Threshold 2")).toBeInTheDocument();
        expect(screen.queryByText("Gate 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Gate 2")).not.toBeInTheDocument();
        expect(screen.getByText("Explore world: 1%")).toBeInTheDocument();
        expect(screen.getAllByText("Explore world: 20%").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Explore world: 21%")).toBeInTheDocument();
        expect(screen.getAllByText("Explore world: 30%").length).toBeGreaterThanOrEqual(1);
    });

    it("renders same-objective completion variants as completion options", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Brave New World",
                    choices: [
                        choice({
                            choiceKey: "Choice_A",
                            displayName: "Brave New World",
                            completionPrerequisiteLines: [
                                "Evolve unit: Spitter x2",
                                "Evolve unit: Necrodrone x2",
                                "Evolve unit: Feeder x2",
                            ],
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    selectionPrerequisiteLines: ["Descriptor requirement: GreaterOrEqual 2"],
                                    completionPrerequisiteLines: ["Evolve unit: Spitter x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                    failQuestKey: "Quest_Previous",
                                    dialogBlockIdentities: [],
                                }),
                                step({
                                    stepIndex: 1,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    selectionPrerequisiteLines: ["Descriptor requirement: GreaterOrEqual 2"],
                                    completionPrerequisiteLines: ["Evolve unit: Necrodrone x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                    dialogBlockIdentities: [],
                                }),
                                step({
                                    stepIndex: 2,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    selectionPrerequisiteLines: [],
                                    completionPrerequisiteLines: ["Evolve unit: Feeder x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                    dialogBlockIdentities: [],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Previous", displayName: "Brave New World" }),
                quest({ questKey: "Quest_B", displayName: "You Scratch My Back" }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "Brave New World" })).toBeInTheDocument();
        expect(screen.queryByText("Progress Gates")).not.toBeInTheDocument();
        expect(screen.getByText("Completion Options")).toBeInTheDocument();
        expect(screen.getByText("2 options")).toBeInTheDocument();
        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
        expect(screen.queryByText("Threshold 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Threshold 2")).not.toBeInTheDocument();
        expect(screen.getAllByText("Descriptor requirement: GreaterOrEqual 2").length).toBeGreaterThanOrEqual(1);

        const completionOptionsSection = screen.getByText("Completion Options").closest("section");
        expect(completionOptionsSection).not.toBeNull();
        if (!completionOptionsSection) throw new Error("Expected completion options section");
        expect(
            within(completionOptionsSection).getAllByText("Cadaver reward: 20 + 10 * Technology Era")
        ).toHaveLength(1);
    });

    it("does not render internal effect choices as primary paths or fallback objectives", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: "FactionQuest_Mukag_Chapter02_Step02",
                    displayName: "Forgotten Power",
                    choices: [
                        choice({
                            choiceKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01EffectChoiceDefinition",
                            displayName: "Forgotten Power",
                            choiceOrder: 0,
                            nextQuestKeys: ["Quest_Pious"],
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: null,
                                    descriptionLines: [],
                                    completionPrerequisiteLines: [],
                                    selectionPrerequisiteLines: [],
                                    nextQuestKey: "Quest_Pious",
                                    dialogBlockIdentities: [],
                                }),
                            ],
                        }),
                        choice({
                            choiceKey: "FactionQuest_Mukag_Chapter02_Step02_Choice1ChoiceDefinition",
                            displayName: "Forgotten Power",
                            choiceOrder: 1,
                            nextQuestKeys: ["Quest_Next"],
                            steps: [
                                step({
                                    stepIndex: 1,
                                    objectiveText: "Use the Holy Oculum to observe its abilities.",
                                    descriptionLines: ["Use the Holy Oculum to observe its abilities."],
                                    completionPrerequisiteLines: ["Use faction action: Mukag Monsoon Festival x2"],
                                    nextQuestKey: "Quest_Next",
                                    dialogBlockIdentities: [],
                                }),
                            ],
                        }),
                        choice({
                            choiceKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01ChoiceDefinition",
                            displayName: "Forgotten Power",
                            choiceOrder: 2,
                            nextQuestKeys: ["Quest_Next"],
                            steps: [
                                step({
                                    stepIndex: 1,
                                    objectiveText: "Use the Holy Oculum to observe its abilities.",
                                    descriptionLines: ["Use the Holy Oculum to observe its abilities."],
                                    completionPrerequisiteLines: ["Use faction action: Mukag Monsoon Festival x2"],
                                    nextQuestKey: "Quest_Next",
                                    dialogBlockIdentities: ["Forgotten_Path_Dialog"],
                                }),
                            ],
                        }),
                        choice({
                            choiceKey: "FactionQuest_Mukag_Chapter02_Step02_Choice02ChoiceDefinition",
                            displayName: "Open Interpretation",
                            choiceOrder: 3,
                            nextQuestKeys: ["Quest_Other"],
                            steps: [
                                step({
                                    stepIndex: 2,
                                    objectiveText: "Choose the open interpretation.",
                                    descriptionLines: ["Choose the open interpretation."],
                                    completionPrerequisiteLines: ["Property requirement: Faith = 2"],
                                    nextQuestKey: "Quest_Other",
                                    dialogBlockIdentities: [],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Pious", displayName: "Pious", choices: [], rootDialogBlockIdentities: [] }),
                quest({ questKey: "Quest_Next", displayName: "Next Target", choices: [], rootDialogBlockIdentities: [] }),
                quest({ questKey: "Quest_Other", displayName: "Other Target", choices: [], rootDialogBlockIdentities: [] }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=FactionQuest_Mukag_Chapter02_Step02");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();
        expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
        expect(screen.getAllByText("Use the Holy Oculum to observe its abilities.").length).toBeGreaterThanOrEqual(1);

        const pathsSection = within(screen.getByLabelText("Quest branches")).getByText("Branches").closest("section");
        expect(pathsSection).not.toBeNull();
        expect(within(pathsSection!).queryByRole("button", { name: /Forgotten Power/i })).not.toBeInTheDocument();
        expect(within(pathsSection!).getByRole("button", { name: /^Pious$/i })).toBeInTheDocument();
        expect(within(pathsSection!).getByRole("button", { name: /^Open$/i })).toBeInTheDocument();
    });
});
