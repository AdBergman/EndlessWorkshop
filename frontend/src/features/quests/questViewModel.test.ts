import { buildQuestExplorerViewModel } from "./questViewModel";
import type {
    QuestChoiceDto,
    QuestDialogBlockDto,
    QuestDto,
    QuestStepDto,
} from "@/types/questTypes";

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

describe("questViewModel", () => {
    it("orders quests and falls back to the first valid selection", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_B",
                    displayName: "Second Quest",
                    chapterIndex: 0,
                    questSequenceIndex: 2,
                }),
                quest({
                    questKey: "Quest_A",
                    displayName: "First Quest",
                    chapterIndex: 0,
                    questSequenceIndex: 1,
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Missing_Quest",
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.status).toBe("ready");
        expect(model.selection.questKey).toBe("Quest_A");
        expect(model.rail.items.map((item) => item.questKey)).toEqual(["Quest_A", "Quest_B"]);
        expect(model.chronicle?.title).toBe("First Quest");
    });

    it("builds choice, step, metadata, link, and transcript props from real quest data", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Archive Start",
                    descriptionLines: ["Opening archive note."],
                    mandatory: true,
                    chapterNumber: 1,
                    categoryType: "Curiosity",
                    inferredFactionKey: "Faction_Kin",
                    inferredQuestLineKey: "QuestLine_Kin",
                    nextQuestKeys: ["Quest_B"],
                    rootDialogBlockIdentities: ["Root_Block"],
                    choices: [
                        choice({
                            choiceKey: "Choice_B",
                            choiceOrder: 2,
                            displayName: "Second Choice",
                            steps: [step({ stepIndex: 2, stepOrder: 2 })],
                        }),
                        choice({
                            choiceKey: "Choice_A",
                            choiceOrder: 1,
                            displayName: "First Choice",
                            completionPrerequisiteLines: ["Hold the archive."],
                            rewardDisplayLines: ["Gain Dust."],
                            nextQuestKeys: ["Quest_B"],
                            steps: [
                                step({
                                    stepIndex: 1,
                                    stepOrder: 1,
                                    objectiveText: "Secure the ruin.",
                                    selectionPrerequisiteLines: ["Have a hero."],
                                    rewardDisplayLines: ["Unlock path."],
                                    nextQuestKey: "Quest_B",
                                    dialogBlockIdentities: ["Step_Block"],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_B", displayName: "Follow Up" }),
            ],
            dialogBlocksByIdentity: {
                Root_Block: dialogBlock({ identity: "Root_Block", phase: "intro", blockOrder: 0 }),
                Step_Block: dialogBlock({
                    identity: "Step_Block",
                    parentScope: "STEP",
                    phase: "objective",
                    blockOrder: 1,
                    lines: [
                        {
                            lineOrder: 0,
                            sourceLineIndex: 8,
                            role: "character",
                            speakerLabel: "Archivist",
                            text: "The ruin answers.",
                        },
                    ],
                }),
            },
            selection: {
                questKey: "Quest_A",
                choiceKey: "Choice_A",
                stepIndex: 1,
            },
        });

        expect(model.selection).toEqual({
            questKey: "Quest_A",
            choiceKey: "Choice_A",
            stepIndex: 1,
        });
        expect(model.chronicle?.choices.map((item) => item.choiceKey)).toEqual(["Choice_A", "Choice_B"]);
        expect(model.chronicle?.selectedChoice?.requirementGroups[0]?.lines).toEqual(["Hold the archive."]);
        expect(model.chronicle?.selectedChoice?.nextQuestLinks).toEqual([
            {
                questKey: "Quest_B",
                label: "Follow Up",
                contextLabel: null,
                debugLabel: null,
                provenance: "choiceNext",
                provenanceLabel: "Choice",
            },
        ]);
        expect(model.chronicle?.selectedStep?.requirementGroups[0]?.label).toBe("Selection");
        expect(model.chronicle?.selectedStep?.nextQuestLink).toEqual({
            questKey: "Quest_B",
            label: "Follow Up",
            contextLabel: null,
            debugLabel: null,
            provenance: "stepNext",
            provenanceLabel: "Step",
        });
        expect(model.chronicle?.transcriptBlocks.map((block) => block.identity)).toEqual([
            "Root_Block",
            "Step_Block",
        ]);
        expect(model.chronicle?.transcriptBlocks[1]?.lines[0]).toMatchObject({
            speakerLabel: "Archivist",
            text: "The ruin answers.",
        });
        expect(model.metadata?.flags).toEqual(["Mandatory"]);
        expect(model.metadata?.sections.find((section) => section.id === "archive")?.items).toContainEqual({
            label: "Archive ID",
            value: "Quest A",
        });
        expect(model.metadata?.nextQuestLinks).toEqual([
            {
                questKey: "Quest_B",
                label: "Follow Up",
                contextLabel: null,
                debugLabel: null,
                provenance: "questNext",
                provenanceLabel: "Quest graph",
            },
        ]);
    });

    it("disambiguates repeated quest titles and preserves graph link provenance", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Archive Start",
                    previousQuestKeys: ["Quest_Previous"],
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
                    questKey: "Quest_Previous",
                    displayName: "Before",
                }),
                quest({
                    questKey: "Quest_Target_A",
                    displayName: "A Bitter Truth",
                    chapterNumber: 2,
                    questSequenceIndex: 4,
                    branchLabel: "Branch A",
                    inferredFactionKey: "Faction_Kin",
                }),
                quest({
                    questKey: "Quest_Target_B",
                    displayName: "A Bitter Truth",
                    chapterNumber: 2,
                    questSequenceIndex: 5,
                    branchLabel: "Branch B",
                    inferredFactionKey: "Faction_Kin",
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Quest_A",
                choiceKey: "Choice_A",
                stepIndex: 0,
            },
        });

        expect(model.metadata?.previousQuestLinks[0]).toMatchObject({
            label: "Before",
            contextLabel: null,
            provenance: "questPrevious",
            provenanceLabel: "Quest previous",
        });
        expect(model.metadata?.nextQuestLinks[0]).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Seq 4 · Branch A",
            provenance: "questNext",
            provenanceLabel: "Quest graph",
        });
        expect(model.metadata?.convergesIntoQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Seq 5 · Branch B",
            provenance: "converges",
            provenanceLabel: "Converges",
        });
        expect(model.chronicle?.selectedChoice?.nextQuestLinks[0]).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Seq 5 · Branch B",
            provenance: "choiceNext",
            provenanceLabel: "Choice",
        });
        expect(model.chronicle?.selectedStep?.nextQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Seq 4 · Branch A",
            provenance: "stepNext",
            provenanceLabel: "Step",
        });
        expect(model.chronicle?.selectedStep?.failQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Seq 5 · Branch B",
            provenance: "stepFailure",
            provenanceLabel: "Failure",
        });
    });

    it("returns an empty model when no quests are available", () => {
        const model = buildQuestExplorerViewModel({
            quests: [],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: null,
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.status).toBe("empty");
        expect(model.rail.items).toEqual([]);
        expect(model.chronicle).toBeNull();
        expect(model.metadata).toBeNull();
    });
});
