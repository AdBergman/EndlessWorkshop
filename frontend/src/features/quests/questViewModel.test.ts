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
                provenanceLabel: "Path",
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
            provenanceLabel: "Path",
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

    it("groups repeated threshold steps into one progress gate model", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Not of the Chorus",
                    choices: [
                        choice({
                            choiceKey: "Choice_A",
                            displayName: "Dislodge Memories",
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: "Attempt to dislodge Xenos' memories.",
                                    selectionPrerequisiteLines: ["Explore world: 1%"],
                                    completionPrerequisiteLines: ["Explore world: 20%"],
                                    forbiddenPrerequisiteLines: ["Explore world: 20%"],
                                    nextQuestKey: "Quest_B",
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
                                    nextQuestKey: "Quest_B",
                                    dialogBlockIdentities: [
                                        "Quest_A|Choice_A|1|Dialog_Start|start",
                                        "Quest_A|Choice_A|1|Dialog_End|success",
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_B", displayName: "Follow Up" }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Quest_A",
                choiceKey: "Choice_A",
                stepIndex: null,
            },
        });

        expect(model.chronicle?.steps).toHaveLength(2);
        expect(model.chronicle?.objectiveGroups).toHaveLength(1);
        expect(model.chronicle?.selectedObjectiveGroup).toBeNull();
        expect(model.chronicle?.objectiveGroups[0]).toMatchObject({
            kind: "progressGate",
            title: "Attempt to dislodge Xenos' memories.",
            stepIndexes: [0, 1],
            representativeStepIndex: 0,
            debugLabel: "2 gate variants",
            isSelected: false,
        });
        expect(model.chronicle?.objectiveGroups[0]?.gateRows).toEqual([
            expect.objectContaining({
                stepIndex: 0,
                selectionLines: ["Explore world: 1%"],
                completionLines: ["Explore world: 20%"],
                forbiddenLines: ["Explore world: 20%"],
            }),
            expect.objectContaining({
                stepIndex: 1,
                selectionLines: ["Explore world: 21%"],
                completionLines: ["Explore world: 30%"],
                forbiddenLines: ["Explore world: 30%"],
            }),
        ]);
    });

    it("filters internal effect choices and deduplicates visible paths before resolving selection", () => {
        const visibleChoiceKey = "FactionQuest_Mukag_Chapter02_Step02_Choice01ChoiceDefinition";
        const duplicateChoiceKey = "FactionQuest_Mukag_Chapter02_Step02_Choice1ChoiceDefinition";
        const otherChoiceKey = "FactionQuest_Mukag_Chapter02_Step02_Choice02ChoiceDefinition";

        const model = buildQuestExplorerViewModel({
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
                                }),
                            ],
                        }),
                        choice({
                            choiceKey: duplicateChoiceKey,
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
                                }),
                            ],
                        }),
                        choice({
                            choiceKey: visibleChoiceKey,
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
                            choiceKey: otherChoiceKey,
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
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Internal", displayName: "Internal Target" }),
                quest({ questKey: "Quest_Next", displayName: "Next Target" }),
                quest({ questKey: "Quest_Other", displayName: "Other Target" }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "FactionQuest_Mukag_Chapter02_Step02",
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.selection).toEqual({
            questKey: "FactionQuest_Mukag_Chapter02_Step02",
            choiceKey: visibleChoiceKey,
            stepIndex: 1,
        });
        expect(model.chronicle?.choices.map((item) => item.choiceKey)).toEqual([
            visibleChoiceKey,
            otherChoiceKey,
        ]);
        expect(model.chronicle?.choices.map((item) => item.choiceKey)).not.toContain(duplicateChoiceKey);
        expect(model.chronicle?.selectedObjectiveGroup?.title).toBe(
            "Use the Holy Oculum to observe its abilities."
        );
        expect(model.chronicle?.selectedObjectiveGroup?.title).not.toBe("Step 1");
        expect(model.chronicle?.selectedChoice?.nextQuestLinks.map((link) => link.questKey)).toEqual(["Quest_Next"]);
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
