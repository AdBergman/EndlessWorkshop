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
        expect(screen.getByLabelText("Quest progression")).toBeInTheDocument();
        expect(screen.getByLabelText("Quest metadata")).toBeInTheDocument();
        expect(screen.getByText("The archive opens.")).toBeInTheDocument();
        expect(screen.getByText("The first record is restored.")).toBeInTheDocument();
        expect(screen.getByText("The trail is readable.")).toBeInTheDocument();
        expect(screen.queryByText("Root_Block_A")).not.toBeInTheDocument();
        expect(screen.queryByText("Step_Block_A")).not.toBeInTheDocument();
    });

    it("updates the selected quest URL param from the progression rail", async () => {
        const user = userEvent.setup();

        await renderQuestExplorer("/quests?quest=Quest_A");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();

        await user.click(within(screen.getByLabelText("Quest progression")).getByRole("button", {
            name: /Second Quest/i,
        }));

        expect(await screen.findByRole("heading", { name: "Second Quest" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/quests?quest=Quest_B");
        });
        expect(screen.getByText("The second branch is active.")).toBeInTheDocument();
    });

    it("falls back safely when the quest URL param does not resolve", async () => {
        await renderQuestExplorer("/quests?quest=Missing_Quest");

        expect(await screen.findByRole("heading", { name: "First Quest" })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/quests?quest=Quest_A");
        });
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
        expect(screen.getByText("Quest graph next")).toBeInTheDocument();
        expect(screen.getByText("Converges into")).toBeInTheDocument();
        expect(screen.getAllByText("A Bitter Truth").length).toBeGreaterThanOrEqual(4);
        expect(screen.getAllByText("Chapter 2 · Seq 4 · Branch A").length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText("Chapter 2 · Seq 5 · Branch B").length).toBeGreaterThanOrEqual(3);
        expect(screen.getByText("Quest graph")).toBeInTheDocument();
        expect(screen.getByText("Path")).toBeInTheDocument();
        expect(screen.getByText("Step")).toBeInTheDocument();
        expect(screen.getByText("Failure")).toBeInTheDocument();
        expect(screen.getByText("Converges")).toBeInTheDocument();
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
        expect(screen.getByText("Paths")).toBeInTheDocument();
        expect(screen.getByText("Selected Path")).toBeInTheDocument();
        expect(screen.getByText("Progress Requirements")).toBeInTheDocument();
        expect(screen.queryByText("Progress Gates")).not.toBeInTheDocument();
        expect(screen.queryByText("Selected Progress Gate")).not.toBeInTheDocument();
        expect(screen.getAllByText("Attempt to dislodge Xenos' memories.")).toHaveLength(1);
        expect(screen.queryByRole("button", { name: /Attempt to dislodge Xenos' memories/i })).not.toBeInTheDocument();
        expect(screen.getByText("2 gate variants")).toBeInTheDocument();
        expect(screen.getByText("Gate 1")).toBeInTheDocument();
        expect(screen.getByText("Gate 2")).toBeInTheDocument();
        expect(screen.getByText("Explore world: 1%")).toBeInTheDocument();
        expect(screen.getAllByText("Explore world: 20%").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Explore world: 21%")).toBeInTheDocument();
        expect(screen.getAllByText("Explore world: 30%").length).toBeGreaterThanOrEqual(1);
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
                            nextQuestKeys: ["Quest_Internal"],
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: null,
                                    descriptionLines: [],
                                    completionPrerequisiteLines: [],
                                    selectionPrerequisiteLines: [],
                                    nextQuestKey: "Quest_Internal",
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
                            displayName: "Pious Interpretation",
                            choiceOrder: 3,
                            nextQuestKeys: ["Quest_Other"],
                            steps: [
                                step({
                                    stepIndex: 2,
                                    objectiveText: "Choose the pious interpretation.",
                                    descriptionLines: ["Choose the pious interpretation."],
                                    completionPrerequisiteLines: ["Property requirement: Faith = 2"],
                                    nextQuestKey: "Quest_Other",
                                    dialogBlockIdentities: [],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Next", displayName: "Next Target", choices: [], rootDialogBlockIdentities: [] }),
                quest({ questKey: "Quest_Other", displayName: "Other Target", choices: [], rootDialogBlockIdentities: [] }),
            ],
            dialogBlocks: [],
        });

        await renderQuestExplorer("/quests?quest=FactionQuest_Mukag_Chapter02_Step02");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();
        expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
        expect(screen.getAllByText("Use the Holy Oculum to observe its abilities.").length).toBeGreaterThanOrEqual(1);

        const pathsSection = screen.getByText("Paths").closest("section");
        expect(pathsSection).not.toBeNull();
        expect(within(pathsSection!).getAllByRole("button", { name: /Forgotten Power/i })).toHaveLength(1);
        expect(within(pathsSection!).getByRole("button", { name: /Pious Interpretation/i })).toBeInTheDocument();
    });
});
