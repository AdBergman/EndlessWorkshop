import { apiClient } from "@/api/apiClient";
import {
    getDialogBlocksForStep,
    getRootDialogBlocksForQuest,
    selectDialogBlocksForStep,
    selectQuestByKey,
    selectRootDialogBlocksForQuest,
    useQuestStore,
} from "@/stores/questStore";
import type {
    QuestChoiceDto,
    QuestDialogBlockDto,
    QuestDto,
    QuestExplorerDto,
    QuestStepDto,
} from "@/types/questTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const emptyExplorer = (): QuestExplorerDto => ({
    quests: [],
    dialogBlocks: [],
});

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Find the trail.",
    nextQuestKey: null,
    failQuestKey: null,
    descriptionLines: [],
    completionPrerequisiteLines: [],
    failurePrerequisiteLines: [],
    forbiddenPrerequisiteLines: [],
    selectionPrerequisiteLines: [],
    rewardDisplayLines: [],
    referenceKeys: [],
    dialogBlockIdentities: [],
    ...overrides,
});

const choice = (overrides: Partial<QuestChoiceDto> = {}): QuestChoiceDto => ({
    choiceKey: "Choice_A",
    displayName: "Choice A",
    choiceOrder: 0,
    descriptionLines: [],
    completionPrerequisiteLines: [],
    failurePrerequisiteLines: [],
    rewardDisplayLines: [],
    nextQuestKeys: [],
    referenceKeys: [],
    steps: [],
    ...overrides,
});

const quest = (overrides: Partial<QuestDto> = {}): QuestDto => ({
    questKey: "Quest_A",
    displayName: "A Quest",
    descriptionLines: [],
    categoryKey: null,
    categoryType: null,
    branchStart: false,
    branchEnd: false,
    mandatory: false,
    keyNarrativeBeat: false,
    narrativeVictoryPathChoice: false,
    chapterKey: null,
    chapterIndex: null,
    chapterNumber: null,
    questSequenceIndex: null,
    branchGroupKey: null,
    branchLabel: null,
    inferredFactionKey: null,
    inferredQuestLineKey: null,
    convergesIntoQuestKey: null,
    previousQuestKeys: [],
    nextQuestKeys: [],
    referenceKeys: [],
    rootDialogBlockIdentities: [],
    choices: [],
    ...overrides,
});

const dialogBlock = (overrides: Partial<QuestDialogBlockDto> = {}): QuestDialogBlockDto => ({
    identity: "Dialog_Block_A",
    questKey: "Quest_A",
    choiceKey: null,
    stepIndex: null,
    parentScope: "QUEST",
    dialogKey: "Dialog_A",
    phase: "start",
    expectedLineCount: 1,
    blockOrder: 0,
    lines: [
        {
            lineOrder: 0,
            sourceLineIndex: 3,
            role: "narrator",
            speakerLabel: null,
            text: "We begin.",
        },
    ],
    ...overrides,
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

describe("useQuestStore", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
    });

    it("loads and indexes quests and dialog blocks by normalized keys", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({
                    questKey: " Quest_A ",
                    rootDialogBlockIdentities: [" Root_Block "],
                    choices: [
                        choice({
                            choiceKey: " Choice_A ",
                            steps: [
                                step({
                                    dialogBlockIdentities: [" Step_Block "],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
            dialogBlocks: [
                dialogBlock({ identity: " Root_Block ", parentScope: "QUEST" }),
                dialogBlock({
                    identity: " Step_Block ",
                    choiceKey: "Choice_A",
                    stepIndex: 0,
                    parentScope: "STEP",
                }),
            ],
        });

        await useQuestStore.getState().loadQuestExplorer();

        const state = useQuestStore.getState();
        const loadedQuest = state.getQuestByKey("Quest_A");
        const loadedStep = loadedQuest?.choices[0]?.steps[0];

        expect(state.questKeys).toEqual(["Quest_A"]);
        expect(loadedQuest?.questKey).toBe("Quest_A");
        expect(loadedQuest?.rootDialogBlockIdentities).toEqual(["Root_Block"]);
        expect(loadedStep?.dialogBlockIdentities).toEqual(["Step_Block"]);
        expect(state.dialogBlockIdentities).toEqual(["Root_Block", "Step_Block"]);
        expect(state.getDialogBlockByIdentity("Step_Block")?.parentScope).toBe("STEP");
        expect(selectQuestByKey(" Quest_A ")(state)?.displayName).toBe("A Quest");
        expect(selectRootDialogBlocksForQuest("Quest_A")(state).map((block) => block.identity)).toEqual([
            "Root_Block",
        ]);
        expect(selectDialogBlocksForStep("Quest_A", "Choice_A", 0)(state).map((block) => block.identity)).toEqual([
            "Step_Block",
        ]);
        expect(getRootDialogBlocksForQuest(loadedQuest, state.dialogBlocksByIdentity).map((block) => block.identity)).toEqual([
            "Root_Block",
        ]);
        expect(getDialogBlocksForStep(loadedStep, state.dialogBlocksByIdentity).map((block) => block.identity)).toEqual([
            "Step_Block",
        ]);
        expect(state.loaded).toBe(true);
        expect(state.error).toBeNull();
    });

    it("drops blank quest and dialog block keys", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [quest({ questKey: " " })],
            dialogBlocks: [dialogBlock({ identity: " " })],
        });

        await useQuestStore.getState().loadQuestExplorer();

        const state = useQuestStore.getState();
        expect(state.quests).toHaveLength(0);
        expect(state.dialogBlocks).toHaveLength(0);
        expect(state.getQuestByKey(" ")).toBeUndefined();
        expect(state.getDialogBlockByIdentity(" ")).toBeUndefined();
    });

    it("keeps duplicate keys unique and exposes duplicate diagnostics", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            quests: [
                quest({ questKey: "Quest_Shared", displayName: "First Quest" }),
                quest({ questKey: " Quest_Shared ", displayName: "Second Quest" }),
            ],
            dialogBlocks: [
                dialogBlock({ identity: "Block_Shared", dialogKey: "Dialog_First" }),
                dialogBlock({ identity: " Block_Shared ", dialogKey: "Dialog_Second" }),
            ],
        });

        await useQuestStore.getState().loadQuestExplorer();

        const state = useQuestStore.getState();
        expect(state.questKeys).toEqual(["Quest_Shared"]);
        expect(state.duplicateQuestKeys).toEqual(["Quest_Shared"]);
        expect(state.getQuestByKey("Quest_Shared")?.displayName).toBe("Second Quest");
        expect(state.dialogBlockIdentities).toEqual(["Block_Shared"]);
        expect(state.duplicateDialogBlockIdentities).toEqual(["Block_Shared"]);
        expect(state.getDialogBlockByIdentity("Block_Shared")?.dialogKey).toBe("Dialog_Second");
    });

    it("avoids duplicate quest loads until invalidated or refreshed", async () => {
        const pending = deferred<QuestExplorerDto>();
        mockedApiClient.getQuestExplorer.mockReturnValueOnce(pending.promise);

        const firstLoad = useQuestStore.getState().loadQuestExplorer();
        const secondLoad = useQuestStore.getState().loadQuestExplorer();

        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);

        pending.resolve(emptyExplorer());
        await Promise.all([firstLoad, secondLoad]);

        await useQuestStore.getState().loadQuestExplorer();
        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);

        mockedApiClient.getQuestExplorer.mockResolvedValue(emptyExplorer());

        useQuestStore.getState().invalidateQuestExplorer();
        await useQuestStore.getState().loadQuestExplorer();

        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(2);

        await useQuestStore.getState().refreshQuestExplorer();

        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(3);
    });

    it("stores a readable error and clears loaded data when loading fails", async () => {
        mockedApiClient.getQuestExplorer.mockRejectedValue(new Error("backend unavailable"));

        await useQuestStore.getState().loadQuestExplorer();

        const state = useQuestStore.getState();
        expect(state.loading).toBe(false);
        expect(state.loaded).toBe(false);
        expect(state.quests).toEqual([]);
        expect(state.dialogBlocks).toEqual([]);
        expect(state.error).toBe("Failed to load quests: backend unavailable");
        expect(state.lastLoadedAt).toBeDefined();
    });
});
