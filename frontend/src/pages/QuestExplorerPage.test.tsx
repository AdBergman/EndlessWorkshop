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
});
