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
                provenanceLabel: "Leads to",
            },
        ]);
        expect(model.chronicle?.selectedStep?.requirementGroups[0]?.label).toBe("Selection");
        expect(model.chronicle?.selectedStep?.nextQuestLink).toEqual({
            questKey: "Quest_B",
            label: "Follow Up",
            contextLabel: null,
            debugLabel: null,
            provenance: "stepNext",
            provenanceLabel: "Continues",
        });
        expect(model.chronicle?.transcriptBlocks.map((block) => block.identity)).toEqual([
            "Root_Block",
            "Step_Block",
        ]);
        expect(model.chronicle?.transcriptBlocks[1]?.lines[0]).toMatchObject({
            speakerLabel: "Archivist",
            text: "The ruin answers.",
        });
        expect(model.metadata?.flags).toEqual(["Required"]);
        expect(model.metadata?.sections.find((section) => section.id === "archive")?.items).toContainEqual({
            label: "Faction",
            value: "Kin",
        });
        expect(model.metadata?.sections.find((section) => section.id === "archive")?.items).not.toContainEqual(
            expect.objectContaining({ label: "Archive ID" })
        );
        expect(model.metadata?.nextQuestLinks).toEqual([
            {
                questKey: "Quest_B",
                label: "Follow Up",
                contextLabel: null,
                debugLabel: null,
                provenance: "questNext",
                provenanceLabel: "Continues",
            },
        ]);
    });

    it("disambiguates repeated quest titles without raw sequence labels", () => {
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
            provenanceLabel: "Previous",
        });
        expect(model.metadata?.nextQuestLinks[0]).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Path A · Kin",
            provenance: "questNext",
            provenanceLabel: "Continues",
        });
        expect(model.metadata?.convergesIntoQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Path B · Kin",
            provenance: "converges",
            provenanceLabel: "Converges",
        });
        expect(model.chronicle?.selectedChoice?.nextQuestLinks[0]).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Path B · Kin",
            provenance: "choiceNext",
            provenanceLabel: "Leads to",
        });
        expect(model.chronicle?.selectedStep?.nextQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Path A · Kin",
            provenance: "stepNext",
            provenanceLabel: "Continues",
        });
        expect(model.chronicle?.selectedStep?.failQuestLink).toMatchObject({
            label: "A Bitter Truth",
            contextLabel: "Chapter 2 · Path B · Kin",
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
                                    rewardDisplayLines: ["Science reward: 10"],
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
                                    rewardDisplayLines: ["Science reward: 10"],
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
            summaryLabel: "2 thresholds",
            rewardLines: ["Science reward: 10"],
            isSelected: false,
        });
        expect(model.chronicle?.objectiveGroups[0]?.gateRows).toEqual([
            expect.objectContaining({
                stepIndex: 0,
                selectionLines: ["Explore world: 1%"],
                completionLines: ["Explore world: 20%"],
                forbiddenLines: ["Explore world: 20%"],
                rewardLines: [],
            }),
            expect.objectContaining({
                stepIndex: 1,
                selectionLines: ["Explore world: 21%"],
                completionLines: ["Explore world: 30%"],
                forbiddenLines: ["Explore world: 30%"],
                rewardLines: [],
            }),
        ]);
    });

    it("classifies Brave New World-style mixed variants as completion options", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "Brave New World",
                    choices: [
                        choice({
                            choiceKey: "Choice_A",
                            displayName: "Brave New World",
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    selectionPrerequisiteLines: ["Descriptor requirement: GreaterOrEqual 2"],
                                    completionPrerequisiteLines: ["Evolve unit: Spitter x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                    failQuestKey: "Quest_Previous",
                                }),
                                step({
                                    stepIndex: 1,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    selectionPrerequisiteLines: ["Descriptor requirement: GreaterOrEqual 2"],
                                    completionPrerequisiteLines: ["Evolve unit: Necrodrone x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                }),
                                step({
                                    stepIndex: 2,
                                    objectiveText: "With the Kin routed, strengthen the swarm's weakest.",
                                    completionPrerequisiteLines: ["Evolve unit: Feeder x2"],
                                    rewardDisplayLines: ["Cadaver reward: 20 + 10 * Technology Era"],
                                    nextQuestKey: "Quest_B",
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Previous", displayName: "Brave New World" }),
                quest({ questKey: "Quest_B", displayName: "You Scratch My Back" }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Quest_A",
                choiceKey: "Choice_A",
                stepIndex: null,
            },
        });

        expect(model.chronicle?.objectiveGroups).toHaveLength(2);
        expect(model.chronicle?.objectiveGroups[0]).toMatchObject({
            kind: "objective",
            stepIndexes: [0],
        });
        expect(model.chronicle?.objectiveGroups[1]).toMatchObject({
            kind: "completionOption",
            title: "With the Kin routed, strengthen the swarm's weakest.",
            stepIndexes: [1, 2],
            summaryLabel: "2 options",
            rewardLines: ["Cadaver reward: 20 + 10 * Technology Era"],
        });
        expect(model.chronicle?.objectiveGroups[1]?.gateRows).toEqual([
            expect.objectContaining({
                stepIndex: 1,
                selectionLines: ["Descriptor requirement: GreaterOrEqual 2"],
                completionLines: ["Evolve unit: Necrodrone x2"],
                rewardLines: [],
            }),
            expect.objectContaining({
                stepIndex: 2,
                selectionLines: [],
                completionLines: ["Evolve unit: Feeder x2"],
                rewardLines: [],
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
                            nextQuestKeys: ["Quest_Pious"],
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: null,
                                    descriptionLines: [],
                                    completionPrerequisiteLines: [],
                                    selectionPrerequisiteLines: [],
                                    nextQuestKey: "Quest_Pious",
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
                                }),
                            ],
                        }),
                    ],
                }),
                quest({ questKey: "Quest_Pious", displayName: "Pious" }),
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
        expect(model.chronicle?.choices.map((item) => item.title)).toEqual(["Pious", "Open"]);
        expect(model.chronicle?.choices.map((item) => item.choiceKey)).not.toContain(duplicateChoiceKey);
        expect(model.chronicle?.selectedObjectiveGroup?.title).toBe(
            "Use the Holy Oculum to observe its abilities."
        );
        expect(model.chronicle?.selectedObjectiveGroup?.title).not.toBe("Step 1");
        expect(model.chronicle?.selectedChoice?.nextQuestLinks.map((link) => link.questKey)).toEqual(["Quest_Next"]);
    });

    it("suppresses synthetic titles for single-path quests with redundant or raw choice labels", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Collectible_Quest_001",
                    displayName: "A Bloody Trail",
                    choices: [
                        choice({
                            choiceKey: "Collectible_Quest_001_ChoiceDefinition",
                            displayName: "A Bloody Trail",
                            steps: [
                                step({
                                    objectiveText: "Follow the tracks of the assailants.",
                                    descriptionLines: ["Follow the tracks of the assailants."],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Collectible_Quest_001",
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.chronicle?.choices).toHaveLength(1);
        expect(model.chronicle?.choices[0]).toMatchObject({
            choiceKey: "Collectible_Quest_001_ChoiceDefinition",
            title: null,
            subtitle: "Follow the tracks of the assailants.",
        });
        expect(model.chronicle?.selectedChoice?.title).toBeNull();
    });

    it("keeps meaningful single-path choice titles available for selected branch context", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "Quest_A",
                    displayName: "The Oath",
                    choices: [
                        choice({
                            choiceKey: "Quest_A_Choice01ChoiceDefinition",
                            displayName: "Scholar Variant",
                        }),
                    ],
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "Quest_A",
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.chronicle?.choices[0]?.title).toBe("Scholar Variant");
        expect(model.chronicle?.selectedChoice?.title).toBe("Scholar Variant");
    });

    it("collapses objective display variants and shows the cleaner requirement line", () => {
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "FactionQuest_LastLord_Chapter03_Step01",
                    displayName: "The Fork in the Road",
                    choices: [
                        choice({
                            choiceKey: "FactionQuest_LastLord_Chapter03A_Step01ChoiceDefinition",
                            displayName: "The Fork in the Road",
                            steps: [
                                step({
                                    stepIndex: 0,
                                    objectiveText: "Start seeking answers to the Lords' curse.",
                                    descriptionLines: ["Start seeking answers to the Lords' curse."],
                                    completionPrerequisiteLines: ["Clear dungeon: MyTargetDungeon"],
                                    rewardDisplayLines: ["Equipment reward: The Adjudicator"],
                                    nextQuestKey: "FactionQuest_LastLord_Chapter03A_Step02",
                                    dialogBlockIdentities: [
                                        "FactionQuest_LastLord_Chapter03_Step01|FactionQuest_LastLord_Chapter03A_Step01ChoiceDefinition|0|Start|start",
                                        "FactionQuest_LastLord_Chapter03_Step01|FactionQuest_LastLord_Chapter03A_Step01ChoiceDefinition|0|End|success",
                                    ],
                                }),
                                step({
                                    stepIndex: 1,
                                    objectiveText: "Start seeking answers to the Lords' curse.",
                                    descriptionLines: ["Start seeking answers to the Lords' curse."],
                                    completionPrerequisiteLines: ["Clear dungeons: 1"],
                                    rewardDisplayLines: ["Equipment reward: The Adjudicator"],
                                    nextQuestKey: "FactionQuest_LastLord_Chapter03A_Step02",
                                    dialogBlockIdentities: [
                                        "FactionQuest_LastLord_Chapter03_Step01|FactionQuest_LastLord_Chapter03A_Step01ChoiceDefinition|1|Start|start",
                                        "FactionQuest_LastLord_Chapter03_Step01|FactionQuest_LastLord_Chapter03A_Step01ChoiceDefinition|1|End|success",
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                quest({
                    questKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    displayName: "A Fruitful Alliance",
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: "FactionQuest_LastLord_Chapter03_Step01",
                choiceKey: null,
                stepIndex: null,
            },
        });

        expect(model.chronicle?.objectiveGroups).toHaveLength(1);
        expect(model.chronicle?.selectedObjectiveGroup).toMatchObject({
            kind: "objective",
            representativeStepIndex: 1,
            stepIndexes: [0, 1],
            rewardLines: ["Equipment reward: The Adjudicator"],
        });
        expect(model.chronicle?.selectedObjectiveGroup?.requirementGroups).toEqual([
            {
                id: "objective:1:completion",
                label: "Completion",
                lines: ["Clear dungeons: 1"],
            },
        ]);
    });

    it("groups major faction rail entries without breaking member quest deep links", () => {
        const hiddenMemberQuestKey = "FactionQuest_Necrophage_Chapter06_Step03_Choice01";
        const model = buildQuestExplorerViewModel({
            quests: [
                quest({
                    questKey: "FactionQuest_Necrophage_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    categoryType: "MajorFaction",
                    mandatory: true,
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_Necrophage",
                }),
                quest({
                    questKey: hiddenMemberQuestKey,
                    displayName: "A Bitter Truth",
                    categoryType: "MajorFaction",
                    mandatory: true,
                    chapterNumber: 6,
                    branchGroupKey: "FactionQuest_Necrophage_Chapter06_Step03",
                    inferredQuestLineKey: "FactionQuest_Necrophage",
                }),
                quest({
                    questKey: "FactionQuest_Necrophage02_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    categoryType: "MajorFaction",
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_Necrophage02",
                }),
                quest({
                    questKey: "FactionQuest_KinOfSheredyn_Chapter06_Step01",
                    displayName: "A Bitter Truth",
                    categoryType: "MajorFaction",
                    chapterNumber: 6,
                    inferredQuestLineKey: "FactionQuest_KinOfSheredyn",
                }),
                quest({
                    questKey: "Quest_Curiosity_A_Branch01",
                    displayName: "A Bitter Truth",
                    categoryType: "Curiosity",
                    chapterNumber: 6,
                }),
            ],
            dialogBlocksByIdentity: {},
            selection: {
                questKey: hiddenMemberQuestKey,
                choiceKey: null,
                stepIndex: null,
            },
        });

        const groupedRailItem = model.rail.items.find((item) =>
            item.memberQuestKeys.includes(hiddenMemberQuestKey)
        );

        expect(model.selection.questKey).toBe(hiddenMemberQuestKey);
        expect(model.chronicle?.questKey).toBe(hiddenMemberQuestKey);
        expect(model.rail.questCount).toBe(3);
        expect(model.rail.items.some((item) => item.questKey === hiddenMemberQuestKey)).toBe(false);
        expect(groupedRailItem).toMatchObject({
            questKey: "FactionQuest_Necrophage_Chapter06_Step01",
            memberCount: 3,
            title: "A Bitter Truth",
            chapterLabel: "Chapter 6",
            subtitle: "Necrophage · 3 entries",
            branchLabel: "2 variants",
            flags: ["Required"],
            isSelected: true,
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
