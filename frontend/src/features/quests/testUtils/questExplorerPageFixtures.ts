import type { QuestExplorerResponse } from "@/types/questTypes";
import {
    progressionQuestline,
    questEntry,
    testBranch,
    testObjective,
    testRequirement,
    testReward,
} from "@/features/quests/testUtils/questExplorerFixtures";

export const payload: QuestExplorerResponse = {
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

export const mixedPayload: QuestExplorerResponse = {
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

export const minorVariantPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "MinorFaction_SpecificQuest_Ametrine01",
            title: "Ancient Graveyard",
            questType: "Minor Faction Quest",
            summaryLines: ["The Ametrine seek their lost reliquaries."],
            navigation: {
                factionKey: "MinorFaction_Ametrine",
                factionName: "Ametrine",
                questLineKey: "MinorFaction_SpecificQuest_Ametrine",
                questLineName: "Ametrine",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 0,
                chapterOrder: null,
                stepOrder: null,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
            },
            loreView: {
                sections: [
                    {
                        sectionKey: "ametrine:lore:setup",
                        phase: "start",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: null, role: "narrator", text: "A somber atmosphere hangs over the settlement." }],
                    },
                    {
                        sectionKey: "ametrine:lore:path-1",
                        phase: "start",
                        choiceKey: "AmetrineChoice",
                        stepIndex: 0,
                        objectiveKey: "Objective_Ametrine_1",
                        lines: [{ speakerLabel: null, role: "character", text: "The ground speaks, but we cannot hear it." }],
                    },
                    {
                        sectionKey: "ametrine:lore:success",
                        phase: "success",
                        choiceKey: "AmetrineChoice",
                        stepIndex: 0,
                        objectiveKey: "Objective_Ametrine_1",
                        lines: [{ speakerLabel: null, role: "character", text: "Thanks to your help, we know the way back." }],
                    },
                    {
                        sectionKey: "ametrine:lore:path-2",
                        phase: "start",
                        choiceKey: "AmetrineChoice",
                        stepIndex: 1,
                        objectiveKey: "Objective_Ametrine_2",
                        lines: [{ speakerLabel: null, role: "character", text: "A trading post is certain to bring us news." }],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    {
                        ...payload.entries[0].strategyView.objectives[0],
                        objectiveKey: "Objective_Ametrine_1",
                        text: "The divining ritual depends on a rare material.",
                        requirements: [
                            {
                                ...payload.entries[0].strategyView.objectives[0].requirements[0],
                                requirementKey: "Requirement_Ametrine_1",
                                displayText: "Maintain the required empire value.",
                            },
                        ],
                        rewards: [
                            {
                                ...payload.entries[0].strategyView.objectives[0].rewards[0],
                                rewardKey: "Reward_Ametrine_1",
                                displayText: "Gain Archite Plate.",
                            },
                        ],
                    },
                    {
                        ...payload.entries[0].strategyView.objectives[0],
                        objectiveKey: "Objective_Ametrine_2",
                        text: "Travelers can contain useful clues.",
                        requirements: [
                            {
                                ...payload.entries[0].strategyView.objectives[0].requirements[0],
                                requirementKey: "Requirement_Ametrine_2",
                                displayText: "Have 1 trading post for 5 turns.",
                            },
                        ],
                        rewards: [
                            {
                                ...payload.entries[0].strategyView.objectives[0].rewards[0],
                                rewardKey: "Reward_Ametrine_2",
                                displayText: "Gain Glassteel.",
                            },
                        ],
                    },
                ],
            },
        }),
    ],
    progression: { questlines: [], debugSummary: null },
};

export const branchPayload: QuestExplorerResponse = {
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

export const repeatedDetailPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Shared",
            title: "Shared Chronicle",
            summaryLines: ["The same chronicle page carries both steps."],
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

export const repeatedChoicePayload: QuestExplorerResponse = {
    ...repeatedDetailPayload,
    entries: [
        {
            ...repeatedDetailPayload.entries[0],
            branches: [
                {
                    ...testBranch("Branch_Shared", "Open the sealed page"),
                    groupLabel: "Shared Line",
                    lore: { outcomePreviewLines: ["The shared page opens."] },
                    strategy: { conditions: ["Commit to the shared page."], requirements: [], rewards: [] },
                },
            ],
        },
    ],
};

export const choiceResetPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Archive of the First Tide",
            summaryLines: ["A recovered strategic record."],
            aliases: ["FactionQuest_Alias"],
            loreView: payload.entries[0].loreView,
            strategyView: payload.entries[0].strategyView,
            branches: [
                {
                    ...testBranch("Branch_Marker", "Follow the marker"),
                    groupLabel: "First Tide",
                    nextEntryKeys: ["Quest_B"],
                    lore: { outcomePreviewLines: ["The marker path opens."] },
                    strategy: { conditions: ["Secure the old marker."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Shore", "Study the shore"),
                    groupLabel: "First Tide",
                    nextEntryKeys: ["Quest_C"],
                    lore: { outcomePreviewLines: ["The shore path opens."] },
                    strategy: { conditions: ["Read the shore signs."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                nextEntryKeys: ["Quest_B", "Quest_C"],
            },
        }),
        questEntry({
            entryKey: "Quest_B",
            title: "Second Tide",
            summaryLines: ["The marker path opens."],
            strategyView: { objectives: [testObjective("Objective_B", "Secure the marker path.")] },
            branches: [],
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
            },
        }),
        questEntry({
            entryKey: "Quest_C",
            title: "Shore Reading",
            summaryLines: ["The shore path opens."],
            strategyView: { objectives: [testObjective("Objective_C", "Read the shore signs.")] },
            branches: [],
            navigation: {
                sequenceIndex: 2,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: "Quest_B",
                branchLabel: "First Tide",
                branchOrder: 2,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Archive of the First Tide", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "Second Tide", detailEntryKey: "Quest_B", variantEntryKeys: ["Quest_C"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const strategyDossierMarkerPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_StrategyMarkers",
            title: "Marker Brief",
            summaryLines: ["Command must choose whether to risk or rejoin."],
            strategyView: { objectives: [testObjective("Objective_Markers", "Choose the command posture.")] },
            branches: [
                {
                    ...testBranch("Branch_Risk", "Risk the breach"),
                    groupLabel: "Command Posture",
                    choiceGroupKey: "Quest_StrategyMarkers:choice-group:posture",
                    failureEntryKeys: ["Quest_FailedAdvance"],
                    strategy: {
                        conditions: ["Accept the failed advance risk."],
                        requirements: [testRequirement("Requirement_Risk", "Spend Influence to force the breach.")],
                        rewards: [testReward("Reward_Risk", "Gain emergency command authority.")],
                    },
                },
                {
                    ...testBranch("Branch_Rejoin", "Rejoin the line"),
                    groupLabel: "Command Posture",
                    choiceGroupKey: "Quest_StrategyMarkers:choice-group:posture",
                    convergesIntoEntryKeys: ["Quest_MainLine"],
                    convergenceGroupKey: "Quest_StrategyMarkers:convergence:Quest_MainLine",
                    strategy: {
                        conditions: ["Return to the main operation."],
                        requirements: [testRequirement("Requirement_Rejoin", "Hold the line for one more turn.")],
                        rewards: [testReward("Reward_Rejoin", "Preserve veteran readiness.")],
                    },
                },
            ],
        }),
        questEntry({
            entryKey: "Quest_FailedAdvance",
            title: "Failed Advance",
            summaryLines: ["The failed path is documented."],
            strategyView: { objectives: [testObjective("Objective_Failure", "Recover from the failed advance.")] },
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                previousEntryKeys: ["Quest_StrategyMarkers"],
            },
        }),
        questEntry({
            entryKey: "Quest_MainLine",
            title: "Main Line",
            summaryLines: ["The path rejoins the main line."],
            strategyView: { objectives: [testObjective("Objective_MainLine", "Continue the main operation.")] },
            navigation: {
                sequenceIndex: 2,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                previousEntryKeys: ["Quest_StrategyMarkers"],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Marker Brief",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Marker Brief", detailEntryKey: "Quest_StrategyMarkers" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const continuousLorePayload: QuestExplorerResponse = (() => {
    const openingChapter = progressionQuestline({
        title: "Stream Opening",
        steps: [
            { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
        ],
    }).chapters[0];
    const continuationChapter = progressionQuestline({
        chapterNumber: 2,
        chapterOrder: 2,
        title: "Stream Continuation",
        steps: [
            { stepNumber: 1, stepOrder: 1, title: "Stream Continuation", detailEntryKey: "Quest_Stream_B" },
        ],
    }).chapters[0];
    const endingChapter = progressionQuestline({
        chapterNumber: 3,
        chapterOrder: 3,
        title: "Stream Ending",
        steps: [
            { stepNumber: 1, stepOrder: 1, title: "Stream Ending", detailEntryKey: "Quest_Stream_C" },
        ],
    }).chapters[0];
    const questline = progressionQuestline({
        title: "Stream Opening",
        steps: [
            { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
        ],
    });

    return {
        ...payload,
        entries: [
            questEntry({
                entryKey: "Quest_Stream_A",
                title: "Stream Opening",
                summaryLines: ["The stream begins."],
                branches: [{
                    ...testBranch("Branch_Stream_Next", "Continue to chapter two"),
                    nextEntryKeys: ["Quest_Stream_B"],
                    lore: { outcomePreviewLines: ["The stream opens into chapter two."] },
                }],
                navigation: {
                    chapter: 1,
                    chapterLabel: "Chapter 1",
                    chapterOrder: 1,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 0,
                    nextEntryKeys: ["Quest_Stream_B"],
                },
            }),
            questEntry({
                entryKey: "Quest_Stream_B",
                title: "Stream Continuation",
                summaryLines: ["The stream continues."],
                branches: [{
                    ...testBranch("Branch_Stream_End", "Continue to chapter three"),
                    nextEntryKeys: ["Quest_Stream_C"],
                    lore: { outcomePreviewLines: ["The stream opens into chapter three."] },
                }],
                navigation: {
                    chapter: 2,
                    chapterLabel: "Chapter 2",
                    chapterOrder: 2,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 1,
                    previousEntryKeys: ["Quest_Stream_A"],
                    nextEntryKeys: ["Quest_Stream_C"],
                },
            }),
            questEntry({
                entryKey: "Quest_Stream_C",
                title: "Stream Ending",
                summaryLines: ["The stream ends."],
                navigation: {
                    chapter: 3,
                    chapterLabel: "Chapter 3",
                    chapterOrder: 3,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 2,
                    previousEntryKeys: ["Quest_Stream_B"],
                    nextEntryKeys: [],
                },
            }),
        ],
        progression: {
            questlines: [{ ...questline, chapters: [openingChapter, continuationChapter, endingChapter] }],
            debugSummary: null,
        },
    };
})();

export const scopedReaderPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Scoped",
            title: "Forked Chronicle",
            summaryLines: ["The first decision belongs to this moment."],
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Scoped:lore:opening",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Shared opening belongs before the choice." }],
                    },
                    {
                        sectionKey: "Quest_Scoped:lore:step-1",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: 0,
                        objectiveKey: "Scoped_Objective_1",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Step one lore belongs before the choice." }],
                    },
                    {
                        sectionKey: "Quest_Scoped:lore:future-untagged",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Future untagged lore must wait for the path." }],
                    },
                    {
                        sectionKey: "Quest_Scoped:lore:step-2",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: 1,
                        objectiveKey: "Scoped_Objective_2",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Step two lore must wait for a selected sequence." }],
                    },
                    {
                        sectionKey: "Quest_Scoped:lore:step-3",
                        phase: "success",
                        choiceKey: null,
                        stepIndex: 2,
                        objectiveKey: "Scoped_Objective_3",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Step three lore must not pre-render." }],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    testObjective("Scoped_Objective_1", "Hold the first line."),
                    testObjective("Scoped_Objective_2", "Secure the ash road."),
                    testObjective("Scoped_Objective_3", "Negotiate the coral road."),
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_Ash", "Take the ash road"),
                    nextEntryKeys: ["Quest_Ash"],
                    lore: { outcomePreviewLines: ["The ash road opens."] },
                    strategy: { conditions: ["Choose the ash road."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Coral", "Take the coral road"),
                    nextEntryKeys: ["Quest_Coral"],
                    lore: { outcomePreviewLines: ["The coral road opens."] },
                    strategy: { conditions: ["Choose the coral road."], requirements: [], rewards: [] },
                },
            ],
        }),
        questEntry({
            entryKey: "Quest_Ash",
            title: "Ash Road",
            summaryLines: ["Only the ash road is now being read."],
            strategyView: {
                objectives: [
                    testObjective("Objective_Ash", "Ash road outcome."),
                    testObjective("Objective_Ash_Later", "Ash road later objective must wait."),
                ],
            },
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Ash:lore",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: 1,
                        objectiveKey: "Objective_Ash",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Only ash road lore is revealed." }],
                    },
                    {
                        sectionKey: "Quest_Ash:lore:later",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: 2,
                        objectiveKey: "Objective_Ash_Later",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Ash road later lore remains hidden." }],
                    },
                ],
            },
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                previousEntryKeys: ["Quest_Scoped"],
                nextEntryKeys: [],
            },
        }),
        questEntry({
            entryKey: "Quest_Coral",
            title: "Coral Road",
            summaryLines: ["The coral road remains unselected."],
            strategyView: { objectives: [testObjective("Objective_Coral", "Coral road outcome.")] },
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Coral:lore",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: 1,
                        objectiveKey: "Objective_Coral",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "Coral road lore remains hidden." }],
                    },
                ],
            },
            navigation: {
                sequenceIndex: 2,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: "Quest_Ash",
                branchLabel: "Forked Chronicle",
                branchOrder: 2,
                previousEntryKeys: ["Quest_Scoped"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Forked Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Forked Chronicle", detailEntryKey: "Quest_Scoped" },
                    { stepNumber: 2, stepOrder: 2, title: "Ash Road", detailEntryKey: "Quest_Ash", variantEntryKeys: ["Quest_Coral"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const choiceKeyScopedPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Keyed",
            title: "Keyed Chronicle",
            summaryLines: ["The current beat should not read the whole chapter."],
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Keyed:lore:opening",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The shared setup belongs before the first choice." }],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:current",
                        phase: "intro",
                        choiceKey: "Choice_Current",
                        stepIndex: 0,
                        objectiveKey: "Objective_Current",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The current beat belongs before the first choice." }],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:current-resolution",
                        phase: "success",
                        choiceKey: "Choice_Current",
                        stepIndex: 0,
                        objectiveKey: "Objective_Current",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The current resolution belongs before the first choice." }],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:next",
                        phase: "intro",
                        choiceKey: "Choice_Next",
                        stepIndex: 0,
                        objectiveKey: "Objective_Next",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The next beat waits for the selected continuation." }],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:future",
                        phase: "intro",
                        choiceKey: "Choice_Future",
                        stepIndex: 0,
                        objectiveKey: "Objective_Future",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The future beat must not leak." }],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    testObjective("Objective_Current", "Resolve the current beat."),
                    testObjective("Objective_Next", "Resolve the next beat."),
                    testObjective("Objective_Future", "Resolve the future beat."),
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_Current", "Find Pryzja"),
                    choiceKey: "Choice_Current",
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    strategy: { conditions: ["Find Pryzja."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Next", "Eliminate the threat"),
                    choiceKey: "Choice_Next",
                    sectionRole: "continuation",
                    branchStepOrder: 2,
                    parentBranchKey: "Branch_Current",
                    prerequisiteBranchKeys: ["Branch_Current"],
                    strategy: { conditions: ["Eliminate the threat."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Future", "Rebuild the city"),
                    choiceKey: "Choice_Future",
                    sectionRole: "continuation",
                    branchStepOrder: 3,
                    parentBranchKey: "Branch_Next",
                    prerequisiteBranchKeys: ["Branch_Current", "Branch_Next"],
                    strategy: { conditions: ["Rebuild the city."], requirements: [], rewards: [] },
                },
            ],
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Keyed Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Keyed Chronicle", detailEntryKey: "Quest_Keyed" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const loreChronologyPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Chronology",
            title: "Stable Chronicle",
            summaryLines: ["The branch consequence must read forward from the choice."],
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Chronology:lore:opening",
                        phase: "intro",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Archivist", role: "narrator", text: "Shared opening remains before the choice." }],
                    },
                    {
                        sectionKey: "Quest_Chronology:lore:ash",
                        phase: "intro",
                        choiceKey: "Choice_Ash",
                        stepIndex: 0,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Archivist", role: "narrator", text: "Ash branch consequence appends after the choice." }],
                    },
                    {
                        sectionKey: "Quest_Chronology:lore:coral",
                        phase: "intro",
                        choiceKey: "Choice_Coral",
                        stepIndex: 0,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Archivist", role: "narrator", text: "Coral branch consequence remains hidden." }],
                    },
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_Ash", "Take the ash road"),
                    choiceKey: "Choice_Ash",
                    choiceGroupKey: "Quest_Chronology:choice-group:step:1",
                    sectionRole: "true_choice",
                    nextEntryKeys: ["Quest_Ash_After"],
                    lore: { outcomePreviewLines: ["The ash road opens."] },
                },
                {
                    ...testBranch("Branch_Coral", "Take the coral road"),
                    choiceKey: "Choice_Coral",
                    choiceGroupKey: "Quest_Chronology:choice-group:step:1",
                    sectionRole: "true_choice",
                    nextEntryKeys: ["Quest_Coral_After"],
                    lore: { outcomePreviewLines: ["The coral road opens."] },
                },
            ],
        }),
        questEntry({
            entryKey: "Quest_Ash_After",
            title: "Ash Aftermath",
            summaryLines: ["The ash aftermath follows."],
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                previousEntryKeys: ["Quest_Chronology"],
            },
        }),
        questEntry({
            entryKey: "Quest_Coral_After",
            title: "Coral Aftermath",
            summaryLines: ["The coral aftermath follows."],
            navigation: {
                sequenceIndex: 2,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: "Quest_Chronology",
                branchLabel: "Stable Chronicle",
                branchOrder: 2,
                previousEntryKeys: ["Quest_Chronology"],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Stable Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Stable Chronicle", detailEntryKey: "Quest_Chronology" },
                    { stepNumber: 2, stepOrder: 2, title: "Ash Aftermath", detailEntryKey: "Quest_Ash_After", variantEntryKeys: ["Quest_Coral_After"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const stagedNecroLorePayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Necro_Ch6",
            title: "A Bitter Truth",
            summaryLines: ["The final Necrophage chronicle must read forward."],
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Necro_Ch6:lore:opening",
                        phase: "start",
                        choiceKey: null,
                        stepIndex: null,
                        objectiveKey: null,
                        lines: [{ speakerLabel: "Prime", role: "character", text: "The swarm learns the bitter truth." }],
                    },
                    {
                        sectionKey: "Quest_Necro_Ch6:lore:first",
                        phase: "success",
                        choiceKey: "Choice_First",
                        stepIndex: 0,
                        objectiveKey: "Objective_First",
                        lines: [{ speakerLabel: "Prime", role: "character", text: "The first battle is over." }],
                    },
                    {
                        sectionKey: "Quest_Necro_Ch6:lore:site-a",
                        phase: "start",
                        choiceKey: "Choice_Site",
                        stepIndex: 0,
                        objectiveKey: "Objective_Site_A",
                        lines: [{ speakerLabel: "Oroyo", role: "character", text: "The old site opens after the chosen continuation." }],
                    },
                    {
                        sectionKey: "Quest_Necro_Ch6:lore:site-b",
                        phase: "success",
                        choiceKey: "Choice_Site",
                        stepIndex: 1,
                        objectiveKey: "Objective_Site_B",
                        lines: [{ speakerLabel: "Prime", role: "character", text: "The relic is recovered before the next choice." }],
                    },
                    {
                        sectionKey: "Quest_Necro_Ch6:lore:save",
                        phase: "success",
                        choiceKey: "Choice_Save",
                        stepIndex: 0,
                        objectiveKey: "Objective_Save",
                        lines: [{ speakerLabel: "Prime", role: "character", text: "The saved girl path remains hidden until selected." }],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    { ...testObjective("Objective_First", "The first battle is over."), choiceKey: "Choice_First" },
                    { ...testObjective("Objective_Site_A", "Open the old site."), choiceKey: "Choice_Site" },
                    { ...testObjective("Objective_Site_B", "Recover the relic."), choiceKey: "Choice_Site" },
                    { ...testObjective("Objective_Enhance", "Enhance the hero."), choiceKey: "Choice_Enhance" },
                    { ...testObjective("Objective_Save", "Save the girl."), choiceKey: "Choice_Save" },
                    { ...testObjective("Objective_Rehabilitate", "Rehabilitate Kazra."), choiceKey: "Choice_Rehabilitate" },
                    { ...testObjective("Objective_Release", "Release Kazra."), choiceKey: "Choice_Release" },
                    { ...testObjective("Objective_Execute", "Execute Kazra."), choiceKey: "Choice_Execute" },
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_First", "A Bitter Truth"),
                    choiceKey: "Choice_First",
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                },
                {
                    ...testBranch("Branch_Site", "Interact with Site of the Ancients using a hero"),
                    choiceKey: "Choice_Site",
                    sectionRole: "continuation",
                    branchStepOrder: 2,
                    parentBranchKey: "Branch_First",
                    prerequisiteBranchKeys: ["Branch_First"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:2:after:Branch_First",
                },
                {
                    ...testBranch("Branch_Enhance", "Enhance Hero"),
                    choiceKey: "Choice_Enhance",
                    sectionRole: "continuation",
                    branchStepOrder: 3,
                    parentBranchKey: "Branch_Site",
                    prerequisiteBranchKeys: ["Branch_First", "Branch_Site"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:3:after:Branch_Site",
                },
                {
                    ...testBranch("Branch_Save", "Save Girl"),
                    choiceKey: "Choice_Save",
                    sectionRole: "continuation",
                    branchStepOrder: 3,
                    parentBranchKey: "Branch_Site",
                    prerequisiteBranchKeys: ["Branch_First", "Branch_Site"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:3:after:Branch_Site",
                },
                {
                    ...testBranch("Branch_Rehabilitate", "Rehabilitate Kazra"),
                    choiceKey: "Choice_Rehabilitate",
                    sectionRole: "continuation",
                    branchStepOrder: 4,
                    parentBranchKey: "Branch_Enhance",
                    prerequisiteBranchKeys: ["Branch_First", "Branch_Site", "Branch_Enhance"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:4:after:Branch_Enhance",
                },
                {
                    ...testBranch("Branch_Release", "Release Kazra"),
                    choiceKey: "Choice_Release",
                    sectionRole: "continuation",
                    branchStepOrder: 4,
                    parentBranchKey: "Branch_Save",
                    prerequisiteBranchKeys: ["Branch_First", "Branch_Site", "Branch_Save"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:4:after:Branch_Save",
                },
                {
                    ...testBranch("Branch_Execute", "Execute Kazra"),
                    choiceKey: "Choice_Execute",
                    sectionRole: "continuation",
                    branchStepOrder: 4,
                    parentBranchKey: "Branch_Site",
                    prerequisiteBranchKeys: ["Branch_First", "Branch_Site"],
                    choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:4:after:Branch_Site",
                },
            ],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "FactionQuest_Kin",
                questLineName: "Kin",
                chapter: 6,
                chapterLabel: "Chapter 6",
                chapterOrder: 6,
                step: 1,
                stepLabel: "Step 1",
                stepOrder: 1,
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "A Bitter Truth",
                questLineKey: "FactionQuest_Kin",
                questLineFamilyKey: "FactionQuest_Kin",
                questLineName: "Kin",
                factionKey: "Faction_Kin",
                factionFamilyKey: "Faction_Kin",
                factionName: "Kin",
                chapterNumber: 6,
                chapterOrder: 6,
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "A Bitter Truth", detailEntryKey: "Quest_Necro_Ch6" },
                    { stepNumber: 2, stepOrder: 2, title: "A Bitter Truth", detailEntryKey: "Quest_Necro_Ch6" },
                    { stepNumber: 3, stepOrder: 3, title: "A Bitter Truth", detailEntryKey: "Quest_Necro_Ch6" },
                    { stepNumber: 4, stepOrder: 4, title: "A Bitter Truth", detailEntryKey: "Quest_Necro_Ch6" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const serializedContinuationPayload: QuestExplorerResponse = {
    ...choiceKeyScopedPayload,
    entries: choiceKeyScopedPayload.entries.map((entry) => (
        entry.entryKey === "Quest_Keyed"
            ? {
                ...entry,
                branches: entry.branches.map((branch) => (
                    branch.branchKey === "Branch_Future"
                        ? { ...branch, nextEntryKeys: ["Quest_Complete"] }
                        : branch
                )),
            }
            : entry
    )),
    progression: {
        questlines: [
            progressionQuestline({
                title: "Keyed Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Keyed Chronicle", detailEntryKey: "Quest_Keyed" },
                    { stepNumber: 2, stepOrder: 2, title: "Keyed Chronicle", detailEntryKey: "Quest_Keyed" },
                    { stepNumber: 3, stepOrder: 3, title: "Keyed Chronicle", detailEntryKey: "Quest_Keyed" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const projectedLocalContinuationQuestline = progressionQuestline({
    questLineKey: "Line_Projected_Local",
    questLineFamilyKey: "Line_Projected_Local",
    questLineName: "Projected Local",
    chapterNumber: 2,
    chapterOrder: 2,
    title: "Projected Setup",
    steps: [
        { stepNumber: 1, stepOrder: 1, title: "Projected Setup", detailEntryKey: "Quest_Projector" },
        { stepNumber: 2, stepOrder: 2, title: "Carried Chronicle", detailEntryKey: "Quest_Carried" },
        { stepNumber: 3, stepOrder: 3, title: "Carried Chronicle", detailEntryKey: "Quest_Carried" },
    ],
});

export const projectedLocalContinuationPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_Projector",
            title: "Projected Setup",
            summaryLines: ["The first choice points onward, but local projected beats remain."],
            strategyView: { objectives: [testObjective("Objective_Projector", "Choose the projected path.")] },
            branches: [
                {
                    ...testBranch("Branch_Search", "Search"),
                    choiceKey: "Choice_Search",
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_Projector:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_NextChapter"],
                    convergesIntoEntryKeys: ["Quest_NextChapter"],
                    strategy: { conditions: ["Search for Garin."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Build", "Build"),
                    choiceKey: "Choice_Build",
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_Projector:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_NextChapter"],
                    convergesIntoEntryKeys: ["Quest_NextChapter"],
                    strategy: { conditions: ["Build the settlement."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                questLineKey: "Line_Projected_Local",
                questLineName: "Projected Local",
                chapter: 2,
                chapterLabel: "Chapter 2",
                chapterOrder: 2,
                stepOrder: 1,
                nextEntryKeys: ["Quest_NextChapter"],
                convergesIntoEntryKeys: ["Quest_NextChapter"],
            },
        }),
        questEntry({
            entryKey: "Quest_Carried",
            title: "Carried Chronicle",
            summaryLines: ["A projected local beat follows the first choice."],
            strategyView: {
                objectives: [
                    testObjective("Objective_Carry_Current", "Resolve the carried current beat."),
                    {
                        ...testObjective("Objective_Carry_Next", "Resolve the carried next beat."),
                        revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                        revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                        revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                    },
                    {
                        ...testObjective("Objective_Carry_Future", "Resolve the carried future beat."),
                        revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                        revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                        revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                    },
                ],
            },
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Carried:lore:current",
                        phase: "intro",
                        choiceKey: "Choice_Carry_Current",
                        stepIndex: 0,
                        objectiveKey: "Objective_Carry_Current",
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The carried current beat is now readable." }],
                    },
                    {
                        sectionKey: "Quest_Carried:lore:next",
                        phase: "intro",
                        choiceKey: "Choice_Carry_Next",
                        stepIndex: 0,
                        objectiveKey: "Objective_Carry_Next",
                        revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                        revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                        revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The carried next beat is now readable." }],
                    },
                    {
                        sectionKey: "Quest_Carried:lore:future",
                        phase: "intro",
                        choiceKey: "Choice_Carry_Future",
                        stepIndex: 0,
                        objectiveKey: "Objective_Carry_Future",
                        revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                        revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                        revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                        lines: [{ speakerLabel: "Scout", role: "character", text: "The carried future beat resolves the local chapter." }],
                    },
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_Carry_Current", "Inspect the signal"),
                    choiceKey: "Choice_Carry_Current",
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    strategy: { conditions: ["Inspect the signal."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Carry_Next", "Secure the signal"),
                    choiceKey: "Choice_Carry_Next",
                    sectionRole: "continuation",
                    branchStepOrder: 2,
                    parentBranchKey: "Branch_Carry_Current",
                    prerequisiteBranchKeys: ["Branch_Carry_Current"],
                    revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                    revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                    revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                    strategy: { conditions: ["Secure the signal."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Carry_Future", "Report onward"),
                    choiceKey: "Choice_Carry_Future",
                    sectionRole: "continuation",
                    branchStepOrder: 3,
                    parentBranchKey: "Branch_Carry_Next",
                    prerequisiteBranchKeys: ["Branch_Carry_Current", "Branch_Carry_Next"],
                    revealedByBranchKeys: ["Branch_Search", "Branch_Build"],
                    revealedByChoiceKeys: ["Choice_Search", "Choice_Build"],
                    revealedByBranchPathAlternatives: [["Branch_Search"], ["Branch_Build"]],
                    nextEntryKeys: ["Quest_NextChapter"],
                    strategy: { conditions: ["Report onward."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                questLineKey: "Line_Projected_Local",
                questLineName: "Projected Local",
                chapter: 2,
                chapterLabel: "Chapter 2",
                chapterOrder: 2,
                stepOrder: 2,
                previousEntryKeys: ["Quest_Projector"],
                nextEntryKeys: ["Quest_NextChapter"],
            },
        }),
        questEntry({
            entryKey: "Quest_NextChapter",
            title: "Next Chapter",
            summaryLines: ["The next chapter waits."],
            strategyView: { objectives: [testObjective("Objective_NextChapter", "Continue onward.")] },
            navigation: {
                questLineKey: "Line_Projected_Local",
                questLineName: "Projected Local",
                chapter: 3,
                chapterLabel: "Chapter 3",
                chapterOrder: 3,
                step: 1,
                stepLabel: "Step 1",
                stepOrder: 1,
                previousEntryKeys: ["Quest_Projector", "Quest_Carried"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            {
                ...projectedLocalContinuationQuestline,
                chapters: [
                    {
                        ...projectedLocalContinuationQuestline.chapters[0],
                        steps: projectedLocalContinuationQuestline.chapters[0].steps.map((step, index) => (
                            index === 0
                                ? {
                                    ...step,
                                    sourceEntryKeys: ["Quest_Projector", "Quest_Carried"],
                                    variants: [
                                        {
                                            entryKey: "Quest_Projector",
                                            title: "Projected Setup",
                                            variantKind: "entry",
                                            branchGroupKey: null,
                                            branchLabel: null,
                                            branchOrder: null,
                                            previousEntryKeys: [],
                                            nextEntryKeys: ["Quest_NextChapter"],
                                            failureEntryKeys: [],
                                            convergesIntoEntryKeys: ["Quest_NextChapter"],
                                        },
                                        {
                                            entryKey: "Quest_Carried",
                                            title: "Carried Chronicle",
                                            variantKind: "entry",
                                            branchGroupKey: null,
                                            branchLabel: null,
                                            branchOrder: null,
                                            previousEntryKeys: ["Quest_Projector"],
                                            nextEntryKeys: ["Quest_NextChapter"],
                                            failureEntryKeys: [],
                                            convergesIntoEntryKeys: [],
                                        },
                                    ],
                                }
                                : step
                        )),
                    },
                    {
                        chapterNumber: 3,
                        chapterOrder: 3,
                        title: "Next Chapter",
                        steps: [
                            {
                                stepKey: "Line_Projected_Local:Faction_Kin:chapter-3:step-1",
                                stepNumber: 1,
                                stepOrder: 1,
                                title: "Next Chapter",
                                projectionKind: "real_entry_backed",
                                detailEntryKey: "Quest_NextChapter",
                                sourceEntryKeys: ["Quest_NextChapter"],
                                aliasEntryKeys: [],
                                variants: [
                                    {
                                        entryKey: "Quest_NextChapter",
                                        title: "Next Chapter",
                                        variantKind: "entry",
                                        branchGroupKey: null,
                                        branchLabel: null,
                                        branchOrder: null,
                                        previousEntryKeys: ["Quest_Projector", "Quest_Carried"],
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

export const projectedLocalContinuationWithoutRevealPayload: QuestExplorerResponse = {
    ...projectedLocalContinuationPayload,
    entries: projectedLocalContinuationPayload.entries.map((entry) => ({
        ...entry,
        loreView: {
            sections: entry.loreView.sections.map((section) => {
                const {
                    revealedByBranchKeys,
                    revealedByChoiceKeys,
                    revealedByBranchPathAlternatives,
                    ...rest
                } = section;
                return rest;
            }),
        },
        strategyView: {
            objectives: entry.strategyView.objectives.map((objective) => {
                const {
                    revealedByBranchKeys,
                    revealedByChoiceKeys,
                    revealedByBranchPathAlternatives,
                    ...rest
                } = objective;
                return rest;
            }),
        },
        branches: entry.branches.map((branch) => {
            const {
                revealedByBranchKeys,
                revealedByChoiceKeys,
                revealedByBranchPathAlternatives,
                ...rest
            } = branch;
            return rest;
        }),
    })),
};

export const nextChapterQuestline = progressionQuestline({
    title: "Opening the Tide",
    steps: [
        { stepNumber: 1, stepOrder: 1, title: "Archive of the First Tide", detailEntryKey: "Quest_A" },
    ],
});

export const nextChapterPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Archive of the First Tide",
            summaryLines: ["A recovered strategic record."],
            loreView: payload.entries[0].loreView,
            strategyView: payload.entries[0].strategyView,
            branches: [
                {
                    ...testBranch("Branch_NextChapter", "Continue to chapter two"),
                    groupLabel: "First Tide",
                    nextEntryKeys: ["Quest_Next"],
                    lore: { outcomePreviewLines: ["A new chapter opens."] },
                    strategy: { conditions: ["Commit to the next chapter."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                nextEntryKeys: ["Quest_Next"],
            },
        }),
        questEntry({
            entryKey: "Quest_Next",
            title: "Chapter Two Rising",
            questType: "Faction Quest",
            summaryLines: ["The next chapter answers."],
            branches: [],
            navigation: {
                sequenceIndex: 1,
                chapter: 2,
                chapterLabel: "Chapter 2",
                chapterOrder: 2,
                step: 1,
                stepLabel: "Step 1",
                stepOrder: 1,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            {
                ...nextChapterQuestline,
                chapters: [
                    nextChapterQuestline.chapters[0],
                    {
                        chapterNumber: 2,
                        chapterOrder: 2,
                        title: "Chapter Two Rising",
                        steps: [
                            {
                                stepKey: "Line_First_Tide:Faction_Kin:chapter-2:step-1",
                                stepNumber: 1,
                                stepOrder: 1,
                                title: "Chapter Two Rising",
                                projectionKind: "real_entry_backed",
                                detailEntryKey: "Quest_Next",
                                sourceEntryKeys: ["Quest_Next"],
                                aliasEntryKeys: [],
                                variants: [
                                    {
                                        entryKey: "Quest_Next",
                                        title: "Chapter Two Rising",
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

export const unresolvedChoicePayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Archive of the First Tide",
            summaryLines: ["A recovered strategic record."],
            loreView: payload.entries[0].loreView,
            strategyView: payload.entries[0].strategyView,
            branches: [
                {
                    ...testBranch("Branch_Unknown", "Take the unknown road"),
                    groupLabel: "First Tide",
                    lore: { outcomePreviewLines: ["The archive does not know where this road lands."] },
                    strategy: { conditions: ["Choose the road."], requirements: [], rewards: [] },
                },
            ],
        }),
        questEntry({
            entryKey: "Quest_B",
            title: "Second Tide",
            summaryLines: ["This should not be revealed without an explicit continuation."],
            strategyView: { objectives: [testObjective("Objective_B", "Hidden objective.")] },
            branches: [],
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
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
        ],
        debugSummary: null,
    },
};

export const terminalNoLinkPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "End of the Chronicle",
            summaryLines: ["The current archive records no later quest step."],
            loreView: payload.entries[0].loreView,
            strategyView: payload.entries[0].strategyView,
            branches: [
                {
                    ...testBranch("Branch_Final", "End the story"),
                    groupLabel: "Final Tide",
                    lore: { outcomePreviewLines: ["The story rests here."] },
                    strategy: { conditions: ["Choose the final oath."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                chapter: 6,
                chapterLabel: "Chapter 6",
                chapterOrder: 6,
                step: 1,
                stepLabel: "Step 1",
                stepOrder: 1,
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                chapterNumber: 6,
                chapterOrder: 6,
                title: "Chapter 6",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "End of the Chronicle", detailEntryKey: "Quest_A" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const gatedContinuationPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "The Hunt",
            summaryLines: ["A forked hunt begins."],
            loreView: payload.entries[0].loreView,
            strategyView: payload.entries[0].strategyView,
            branches: [
                {
                    ...testBranch("Branch_Track", "Track"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    groupLabel: "The Hunt",
                    lore: { outcomePreviewLines: ["Track the quarry."] },
                    strategy: { conditions: ["Follow the trail."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Capture_Track", "Capture the rogue Lieutenant."),
                    sectionRole: "continuation",
                    parentBranchKey: "Branch_Track",
                    prerequisiteBranchKeys: ["Branch_Track"],
                    prerequisiteBranchPath: ["Branch_Track"],
                    choiceGroupKey: "Quest_A:choice-group:step:2:after:Branch_Track",
                    convergenceGroupKey: "Quest_A:convergence:Quest_B",
                    branchStepOrder: 2,
                    groupLabel: "The Hunt",
                    nextEntryKeys: ["Quest_B"],
                    lore: { outcomePreviewLines: ["The quarry is cornered."] },
                    strategy: { conditions: ["Commit to the capture."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Lure", "Lure"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    groupLabel: "The Hunt",
                    lore: { outcomePreviewLines: ["Set a careful trap."] },
                    strategy: { conditions: ["Prepare the lure."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Capture_Lure", "Capture the rogue Lieutenant."),
                    sectionRole: "continuation",
                    parentBranchKey: "Branch_Lure",
                    prerequisiteBranchKeys: ["Branch_Lure"],
                    prerequisiteBranchPath: ["Branch_Lure"],
                    choiceGroupKey: "Quest_A:choice-group:step:2:after:Branch_Lure",
                    convergenceGroupKey: "Quest_A:convergence:Quest_B",
                    branchStepOrder: 2,
                    groupLabel: "The Hunt",
                    nextEntryKeys: ["Quest_B"],
                    lore: { outcomePreviewLines: ["The trap closes."] },
                    strategy: { conditions: ["Spring the trap."], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                nextEntryKeys: [],
            },
        }),
        questEntry({
            entryKey: "Quest_B",
            title: "The Kin's Fate",
            summaryLines: ["The hunt resolves."],
            strategyView: { objectives: [testObjective("Objective_B", "Resolve the hunt.")] },
            branches: [],
            navigation: {
                sequenceIndex: 1,
                step: 2,
                stepLabel: "Step 2",
                stepOrder: 2,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: ["Quest_A"],
                nextEntryKeys: [],
            },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "The Hunt",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "The Hunt", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "The Kin's Fate", detailEntryKey: "Quest_B" },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const ungatedContinuationPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Noisy Chronicle",
            summaryLines: ["Only the first decision is ready."],
            strategyView: { objectives: [testObjective("Objective_A", "Begin the chronicle.")] },
            branches: [
                {
                    ...testBranch("Branch_First", "Choose the first path"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_B"],
                    strategy: { conditions: ["Make the first choice."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Future", "Future-looking continuation"),
                    sectionRole: "continuation",
                    choiceGroupKey: "Quest_A:choice-group:step:2",
                    branchStepOrder: 2,
                    nextEntryKeys: ["Quest_C"],
                    strategy: { conditions: ["This belongs after a selected sequence."], requirements: [], rewards: [] },
                },
            ],
        }),
        questEntry({ entryKey: "Quest_B", title: "Chosen Path", summaryLines: ["The chosen path resolves."] }),
        questEntry({ entryKey: "Quest_C", title: "Future Path", summaryLines: ["This future path should not leak."] }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Noisy Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Noisy Chronicle", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "Chosen Path", detailEntryKey: "Quest_B", variantEntryKeys: ["Quest_C"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const branchVariantProjectionPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Projected Chronicle",
            summaryLines: ["The real decision rows should own the reader surface."],
            strategyView: { objectives: [testObjective("Objective_A", "Choose the live branch.")] },
            branches: [
                {
                    ...testBranch("Branch_Claim", "Claim Lands"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_B"],
                    strategy: { conditions: ["Claim the territory."], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Seek", "Seek Facility"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_C"],
                    strategy: { conditions: ["Seek the facility."], requirements: [], rewards: [] },
                },
            ],
        }),
        questEntry({ entryKey: "Quest_B", title: "Claimed Path", summaryLines: ["The claimed path opens."] }),
        questEntry({ entryKey: "Quest_C", title: "Projected Future", summaryLines: ["This projection should only be visible in raw debug."] }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                title: "Projected Chronicle",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Projected Chronicle", detailEntryKey: "Quest_A", variantEntryKeys: ["Quest_C"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const artifactCleanupPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "Final Choice",
            summaryLines: ["The final judgment is recorded."],
            branches: [
                {
                    ...testBranch("Branch_Reclaim_Artifact", "Reclaim"),
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    strategy: { conditions: ["Artifact Reclaim"], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Reclaim", "Reclaim"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_B"],
                    strategy: { conditions: ["True Reclaim"], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Reject_Artifact", "Reject"),
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    strategy: { conditions: ["Artifact Reject"], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Reject", "Reject"),
                    sectionRole: "true_choice",
                    choiceGroupKey: "Quest_A:choice-group:step:1",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_C"],
                    strategy: { conditions: ["True Reject"], requirements: [], rewards: [] },
                },
            ],
            navigation: {
                chapter: 6,
                chapterLabel: "Chapter 6",
                chapterOrder: 6,
                nextEntryKeys: ["Quest_B", "Quest_C"],
            },
        }),
        questEntry({
            entryKey: "Quest_B",
            title: "Reclaimed",
            summaryLines: ["Reclaim resolves."],
            navigation: { sequenceIndex: 1, chapter: 6, chapterOrder: 6, step: 2, stepOrder: 2 },
        }),
        questEntry({
            entryKey: "Quest_C",
            title: "Rejected",
            summaryLines: ["Reject resolves."],
            navigation: { sequenceIndex: 2, chapter: 6, chapterOrder: 6, step: 2, stepOrder: 2 },
        }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                chapterNumber: 6,
                chapterOrder: 6,
                title: "Chapter 6",
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "Final Choice", detailEntryKey: "Quest_A" },
                    { stepNumber: 2, stepOrder: 2, title: "Resolution", detailEntryKey: "Quest_B", variantEntryKeys: ["Quest_C"] },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const stagedContinuationPayload: QuestExplorerResponse = {
    ...payload,
    entries: [
        questEntry({
            entryKey: "Quest_A",
            title: "A Gamble",
            summaryLines: ["A staged continuation begins."],
            branches: [
                {
                    ...testBranch("Branch_Gamble", "A Gamble"),
                    sectionRole: "artifact",
                    branchStepOrder: 1,
                    strategy: { conditions: ["Make the gamble."], requirements: [], rewards: [] },
                },
                ...["Pious", "Open", "Bold"].flatMap((label, index) => ([
                    {
                        ...testBranch(`Branch_${label}_Near`, label),
                        sectionRole: "continuation",
                        parentBranchKey: "Branch_Gamble",
                        prerequisiteBranchKeys: ["Branch_Gamble"],
                        prerequisiteBranchPath: ["Branch_Gamble"],
                        choiceGroupKey: "Quest_A:choice-group:step:2:after:Branch_Gamble",
                        branchStepOrder: 2,
                        nextEntryKeys: [`Quest_${label}`],
                        orderIndex: index * 2 + 2,
                        strategy: { conditions: [`Near ${label}`], requirements: [], rewards: [] },
                    },
                    {
                        ...testBranch(`Branch_${label}_Far`, label),
                        sectionRole: "continuation",
                        parentBranchKey: "Branch_Gamble",
                        prerequisiteBranchKeys: ["Branch_Gamble"],
                        prerequisiteBranchPath: ["Branch_Gamble"],
                        choiceGroupKey: "Quest_A:choice-group:step:2:after:Branch_Gamble",
                        convergenceGroupKey: "Quest_A:convergence:Quest_Final",
                        branchStepOrder: 2,
                        nextEntryKeys: ["Quest_Final"],
                        orderIndex: index * 2 + 3,
                        strategy: { conditions: [`Far ${label}`], requirements: [], rewards: [] },
                    },
                ])),
            ],
        }),
        questEntry({ entryKey: "Quest_Pious", title: "Pious Path", summaryLines: ["Pious next step."] }),
        questEntry({ entryKey: "Quest_Open", title: "Open Path", summaryLines: ["Open next step."] }),
        questEntry({ entryKey: "Quest_Bold", title: "Bold Path", summaryLines: ["Bold next step."] }),
        questEntry({ entryKey: "Quest_Final", title: "Final Convergence", summaryLines: ["The convergence resolves."] }),
    ],
    progression: {
        questlines: [
            progressionQuestline({
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: "A Gamble", detailEntryKey: "Quest_A" },
                    {
                        stepNumber: 2,
                        stepOrder: 2,
                        title: "Staged Choice",
                        detailEntryKey: "Quest_Pious",
                        variantEntryKeys: ["Quest_Open", "Quest_Bold"],
                    },
                ],
            }),
        ],
        debugSummary: null,
    },
};

export const choiceResetWithWorldPayload: QuestExplorerResponse = {
    ...choiceResetPayload,
    entries: [
        ...choiceResetPayload.entries,
        questEntry({
            entryKey: "Quest_World",
            title: "Lost Curiosity",
            questType: "Curiosity",
            navigation: {
                factionKey: null,
                factionName: null,
                questLineKey: "WorldQuest_Curiosity",
                questLineName: "World",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 3,
                chapterOrder: null,
                stepOrder: null,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
            },
        }),
    ],
};
