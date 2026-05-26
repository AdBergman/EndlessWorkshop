import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import QuestExplorerPage from "./QuestExplorerPage";
import { buildLoreChronicleStream } from "@/features/quests/questPathFlow";
import {
    progressionQuestline,
    questEntry,
    testBranch,
    testObjective,
    testRequirement,
    testReward,
} from "@/features/quests/testUtils/questExplorerFixtures";
import { useQuestStore } from "@/stores/questStore";
import type { QuestExplorerResponse } from "@/types/questTypes";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { Faction } from "@/types/dataTypes";

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

const minorVariantPayload: QuestExplorerResponse = {
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

const repeatedChoicePayload: QuestExplorerResponse = {
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

const choiceResetPayload: QuestExplorerResponse = {
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

const strategyDossierMarkerPayload: QuestExplorerResponse = {
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

const continuousLorePayload: QuestExplorerResponse = (() => {
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

const scopedReaderPayload: QuestExplorerResponse = {
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

const choiceKeyScopedPayload: QuestExplorerResponse = {
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

const serializedContinuationPayload: QuestExplorerResponse = {
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

const projectedLocalContinuationQuestline = progressionQuestline({
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

const projectedLocalContinuationPayload: QuestExplorerResponse = {
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

const projectedLocalContinuationWithoutRevealPayload: QuestExplorerResponse = {
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

const nextChapterQuestline = progressionQuestline({
    title: "Opening the Tide",
    steps: [
        { stepNumber: 1, stepOrder: 1, title: "Archive of the First Tide", detailEntryKey: "Quest_A" },
    ],
});

const nextChapterPayload: QuestExplorerResponse = {
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

const unresolvedChoicePayload: QuestExplorerResponse = {
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

const gatedContinuationPayload: QuestExplorerResponse = {
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

const ungatedContinuationPayload: QuestExplorerResponse = {
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

const branchVariantProjectionPayload: QuestExplorerResponse = {
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

const artifactCleanupPayload: QuestExplorerResponse = {
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

const stagedContinuationPayload: QuestExplorerResponse = {
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

const choiceResetWithWorldPayload: QuestExplorerResponse = {
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

function renderPage(initialEntry = "/quests") {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/quests/*" element={<><LocationProbe /><QuestExplorerPage /></>} />
            </Routes>
        </MemoryRouter>
    );
}

function renderPageWithHistory(initialEntries: string[], initialIndex = initialEntries.length - 1) {
    return render(
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <Routes>
                <Route path="/quests/*" element={<><HistoryBackButton /><LocationProbe /><QuestExplorerPage /></>} />
            </Routes>
        </MemoryRouter>
    );
}

function LocationProbe() {
    const location = useLocation();
    return <output data-testid="route-location">{`${location.pathname}${location.search}`}</output>;
}

function HistoryBackButton() {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate(-1)}>Back</button>;
}

type MockIntersectionObserverRecord = {
    callback: IntersectionObserverCallback;
    elements: Element[];
    observer: IntersectionObserver;
};

function stubIntersectionObservers(): MockIntersectionObserverRecord[] {
    const observers: MockIntersectionObserverRecord[] = [];
    class MockIntersectionObserver implements IntersectionObserver {
        readonly root: Element | Document | null = null;
        readonly rootMargin = "";
        readonly thresholds: ReadonlyArray<number> = [];
        elements: Element[] = [];

        constructor(callback: IntersectionObserverCallback) {
            observers.push({ callback, elements: this.elements, observer: this });
        }

        observe = (target: Element) => {
            this.elements.push(target);
        };

        unobserve = (target: Element) => {
            this.elements = this.elements.filter((element) => element !== target);
        };

        disconnect = () => {
            this.elements = [];
        };

        takeRecords = () => [];
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    return observers;
}

function intersectLoreSegment(observers: MockIntersectionObserverRecord[], railEntryKey: string) {
    const segment = document.querySelector(`[data-rail-entry-key="${railEntryKey}"]`);
    expect(segment).not.toBeNull();
    const observerRecord = observers.at(-1);
    expect(observerRecord).toBeDefined();
    act(() => {
        observerRecord!.callback([{
            boundingClientRect: { top: 0 } as DOMRectReadOnly,
            intersectionRatio: 0.8,
            intersectionRect: {} as DOMRectReadOnly,
            isIntersecting: true,
            rootBounds: null,
            target: segment!,
            time: 0,
        }], observerRecord!.observer);
    });
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

function QuestRouteHarness() {
    const navigate = useNavigate();

    return (
        <>
            <button type="button" onClick={() => navigate("/quests/Quest_B")}>
                Open second tide
            </button>
            <QuestExplorerPage />
        </>
    );
}

function expectElementBefore(first: Element, second: Element) {
    expect(Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
}

function getStepHeaderLabel(container: HTMLElement, label: string) {
    const stepLabel = within(container)
        .getAllByText(label)
        .find((element) => element.closest(".questExplorer-stepLabel"));
    if (!stepLabel) throw new Error(`Expected progression header label ${label}`);
    return stepLabel;
}

describe("QuestExplorerPage", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("hydrates an alias route and renders lore mode", async () => {
        renderPage("/quests/FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.getByText("The tide record begins.")).toBeInTheDocument();
        expect(screen.getByText("We follow the old marker.")).toBeInTheDocument();
        expect(screen.getByText("Follow the marker")).toBeInTheDocument();
        expect(screen.queryByText("Objectives")).not.toBeInTheDocument();
        expect(screen.queryByText("Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Rewards")).not.toBeInTheDocument();
        expect(screen.queryByText("Visit the first marker.")).not.toBeInTheDocument();
    });

    it("hydrates the quest query parameter for legacy links", async () => {
        renderPage("/quests?quest=FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("keeps progression debug hidden by default", async () => {
        renderPage("/quests/Quest_A");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Quest progression debug" })).not.toBeInTheDocument();
        expect(screen.queryByText("stepKey")).not.toBeInTheDocument();
    });

    it("renders progression debug from the URL param without changing choice behavior", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        const debugValue = (label: string) => {
            const row = Array.from(debugPanel.querySelectorAll(".questExplorer-debugRows > div"))
                .find((candidate) => candidate.querySelector("dt")?.textContent === label);
            return row?.querySelector("dd")?.textContent ?? "";
        };

        expect(within(debugPanel).getByText("Debug progression")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "Show raw hidden rows" })).not.toBeChecked();
        expect(within(debugPanel).getAllByText("stepKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("Line_First_Tide:Faction_Kin:chapter-1:step-1")).toBeInTheDocument();
        expect(within(debugPanel).getAllByText("detailEntryKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("projectionKind").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("sourceEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("aliasEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("variant keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("continuation keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("active mode")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active branch sequence")).toBeInTheDocument();
        expect(within(debugPanel).getByText("Strategy selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("Lore selection trace")).toBeInTheDocument();
        expect(within(debugPanel).getByText("unresolved continuation")).toBeInTheDocument();
        expect(screen.getByText(/shown at Chapter 1 Step 1; owner Chapter 1 Step 1 .* branch -> Chapter 1 Step 2/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));

        await waitFor(() => {
            expect(within(debugPanel).getAllByText(/choiceId=branch:Branch_A/).length).toBeGreaterThan(0);
        });
        expect(debugValue("active mode")).toBe("lore");
        expect(debugValue("active branch sequence")).toContain("Branch_A");
        expect(debugValue("Strategy selection trace")).toBe("none");
        expect(debugValue("Lore selection trace")).toContain("Branch_A");
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("derives stable lore chronicle stream segment identities", () => {
        const chapterOne = progressionQuestline({
            title: "Stream Opening",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
            ],
        }).chapters[0];
        const chapterTwo = progressionQuestline({
            chapterNumber: 2,
            chapterOrder: 2,
            title: "Stream Continuation",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Continuation", detailEntryKey: "Quest_Stream_B" },
            ],
        }).chapters[0];
        const questline = progressionQuestline({
            title: "Stream Opening",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
            ],
        });
        const fullProgression = {
            questlines: [{ ...questline, chapters: [chapterOne, chapterTwo] }],
            debugSummary: null,
        };
        const entries = [
            questEntry({
                entryKey: "Quest_Stream_A",
                title: "Stream Opening",
                branches: [{
                    ...testBranch("Branch_Stream_Next", "Continue to chapter two"),
                    nextEntryKeys: ["Quest_Stream_B"],
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
                navigation: {
                    chapter: 2,
                    chapterLabel: "Chapter 2",
                    chapterOrder: 2,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 1,
                    previousEntryKeys: ["Quest_Stream_A"],
                },
            }),
        ];
        const entriesByKey = Object.fromEntries(entries.map((entry) => [entry.entryKey, entry]));
        const selectedProgression = {
            questline: fullProgression.questlines[0],
            chapter: chapterOne,
            activeStepKeys: new Set<string>([chapterOne.steps[0].stepKey]),
            activeVariantEntryKeys: new Set<string>(),
            focusedStepIndex: 0,
        };

        const initialStream = buildLoreChronicleStream({
            selectedProgression,
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });
        const selectedContextKey = initialStream.selectedContextKey ?? "";

        expect(initialStream.segments).toHaveLength(1);
        expect(initialStream.segments[0].contextKey).toBe(selectedContextKey);
        expect(initialStream.segments[0].railEntryKey).toBe("Quest_Stream_A");

        const selectedStream = buildLoreChronicleStream({
            selectedProgression,
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {
                [selectedContextKey]: [{
                    stepKey: chapterOne.steps[0].stepKey,
                    choiceId: "branch:Branch_Stream_Next",
                    branchKey: "Branch_Stream_Next",
                    choiceKey: null,
                    sectionRole: null,
                    semanticStageKind: "unknown",
                    choiceGroupKey: null,
                    branchStepOrder: null,
                    hasDependentContinuations: false,
                    label: "Continue to chapter two",
                    targetEntryKey: "Quest_Stream_B",
                    nextEntryKeys: ["Quest_Stream_B"],
                }],
            },
            showRawHiddenRows: false,
        });

        expect(selectedStream.segments).toHaveLength(2);
        expect(selectedStream.segments.map((segment) => segment.railEntryKey)).toEqual(["Quest_Stream_A", "Quest_Stream_B"]);

        const renamedStream = buildLoreChronicleStream({
            selectedProgression: {
                ...selectedProgression,
                chapter: { ...chapterOne, title: "Renamed Stream Opening" },
            },
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });

        expect(renamedStream.selectedContextKey).toBe(selectedContextKey);
    });

    it("renders lore as a continuous selected-path chronicle and stops at the next unresolved choice", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(within(chronicle).queryByText("Stream Continuation")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Stream Ending")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("heading", { name: "Continue the chronicle" })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("heading", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Next Choices")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        expect(within(chronicle).getByText("Stream Continuation")).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter three/ })).toBeInTheDocument();
        expect(within(chronicle).queryByText("Stream Ending")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter three/ }));

        expect(within(chronicle).getByText("Stream Ending")).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
    });

    it("lets the left rail follow the visible lore segment without mutating selected entry", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);

        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByRole("button", { name: /Stream Opening\s+Chapter 1\s+1 step/ })).toHaveAttribute("aria-current", "page");

        intersectLoreSegment(observers, "Quest_Stream_B");

        expect(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ })).toHaveAttribute("aria-current", "page");
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter three/ })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
        });
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");

        await user.click(screen.getByRole("button", { name: "Lore" }));

        const restoredChronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(restoredChronicle).getByText("Stream Continuation")).toBeInTheDocument();
        expect(within(restoredChronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");
    });

    it("treats a left rail click as canonical navigation rather than passive Lore scroll", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
        expect(await screen.findByRole("heading", { name: "Stream Continuation" })).toBeInTheDocument();
    });

    it("promotes a passively highlighted rail item to canonical navigation when clicked", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });
        intersectLoreSegment(observers, "Quest_Stream_B");

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
    });

    it("replaces passive Lore scroll URL updates without adding a rollback history entry", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPageWithHistory([
            "/quests/Quest_Stream_C?mode=lore",
            "/quests/Quest_Stream_A?mode=lore",
        ]);

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });
        intersectLoreSegment(observers, "Quest_Stream_B");

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Back" }));

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_C?mode=lore");
        });
        expect(await screen.findByRole("heading", { name: "Stream Ending" })).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_C");
    });

    it("restores the canonical entry when browser back leaves a rail navigation", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPageWithHistory([
            "/quests/Quest_Stream_C?mode=lore",
            "/quests/Quest_Stream_A?mode=lore",
        ]);

        expect(await screen.findByRole("heading", { name: "Stream Opening" })).toBeInTheDocument();

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");

        await user.click(screen.getByRole("button", { name: "Back" }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A?mode=lore");
        expect(await screen.findByRole("heading", { name: "Stream Opening" })).toBeInTheDocument();
    });

    it("renders one-option strategy mode as the current task without choice framing", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const currentTask = within(chronicle).getByRole("region", { name: "Current task" });
        expect(within(chronicle).queryByRole("region", { name: "Compact Objective" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Active Decision" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Available Paths" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(currentTask).getByText("Follow the marker")).toBeInTheDocument();
        expect(within(currentTask).getByText("Choose the marker path.")).toBeInTheDocument();
        expect(within(currentTask).getAllByText("Visit the first marker.")).toHaveLength(1);
        expect(within(currentTask).getAllByText("Gain Dust.")).toHaveLength(1);
        expect(within(currentTask).getByText("Continuation")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in Chapter 1: Second Tide")).toBeInTheDocument();
        expect(screen.queryByText("The tide record begins.")).not.toBeInTheDocument();
        expect(screen.queryByText("We follow the old marker.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Follow the marker/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(chronicle.querySelector(".questExplorer-strategyProgressionDetails")).toBeNull();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("renders strategy branch comparison with per-branch tradeoffs and preserves alternatives after selection", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(strategyDossierMarkerPayload);
        renderPage("/quests/Quest_StrategyMarkers?mode=strategy");

        await screen.findByRole("heading", { name: "Marker Brief" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const comparison = within(chronicle).getByRole("region", { name: "Choose a path" });
        const riskOption = within(comparison).getByRole("button", { name: /Risk the breach/ });
        const rejoinOption = within(comparison).getByRole("button", { name: /Rejoin the line/ });

        expect(within(chronicle).getByRole("region", { name: "Current task" })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Compact Objective" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(within(comparison).getByRole("region", { name: "Command Posture" })).toBeInTheDocument();
        expect(within(riskOption).getByText("Accept the failed advance risk.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Spend Influence to force the breach.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Gain emergency command authority.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Failure")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Return to the main operation.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Hold the line for one more turn.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Preserve veteran readiness.")).toBeInTheDocument();
        expect(within(rejoinOption).getByText("Converges")).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();

        await user.click(riskOption);

        expect(riskOption).toHaveAttribute("aria-current", "true");
        expect(within(comparison).getByRole("button", { name: /Rejoin the line/ })).toBeInTheDocument();
        expect(within(riskOption).getByText("Selected")).toBeInTheDocument();
        expect(within(riskOption).getByText("Accept the failed advance risk.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Spend Influence to force the breach.")).toBeInTheDocument();
        expect(within(riskOption).getByText("Gain emergency command authority.")).toBeInTheDocument();
        expect(within(riskOption).getAllByText("Spend Influence to force the breach.")).toHaveLength(1);
        expect(within(riskOption).getAllByText("Gain emergency command authority.")).toHaveLength(1);
        const riskResult = within(chronicle).getByRole("region", { name: "Choosing Risk the breach leads to" });
        expect(within(riskOption).queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(within(riskOption).queryByText("Projected Rewards")).not.toBeInTheDocument();
        expect(within(riskOption).queryByText("Fails at Chapter 1: Failed Advance")).not.toBeInTheDocument();
        expect(within(riskResult).getByText("Fails at Chapter 1: Failed Advance")).toBeInTheDocument();
        expect(chronicle.querySelector(".questExplorer-strategyProgressionDetails")).toBeNull();
        expect(within(chronicle).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Selected Option Summary" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();
    });

    it("renders strategy dossier failure and convergence markers when a simulated branch exposes them", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(strategyDossierMarkerPayload);
        renderPage("/quests/Quest_StrategyMarkers?mode=strategy");

        await screen.findByRole("heading", { name: "Marker Brief" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Risk the breach/ }));

        let selectedOption = within(chronicle).getByRole("button", { name: /Risk the breach/ });
        let selectedResult = within(chronicle).getByRole("region", { name: "Choosing Risk the breach leads to" });
        expect(selectedOption).not.toHaveTextContent("Fails at Chapter 1: Failed Advance");
        expect(selectedResult).toHaveTextContent("Fails at Chapter 1: Failed Advance");
        expect(selectedResult.querySelector(".questExplorer-strategyNextStatus--failure")).not.toBeNull();
        expect(within(chronicle).queryByRole("region", { name: "Path Markers" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Continuity Strip" })).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Rejoin the line/ }));

        selectedOption = within(chronicle).getByRole("button", { name: /Rejoin the line/ });
        selectedResult = within(chronicle).getByRole("region", { name: "Choosing Rejoin the line leads to" });
        expect(selectedOption).not.toHaveTextContent("Rejoins progression at Chapter 1: Main Line");
        expect(selectedResult).toHaveTextContent("Rejoins progression at Chapter 1: Main Line");
        expect(selectedResult.querySelector(".questExplorer-strategyNextStatus--converges")).not.toBeNull();
    });

    it("scopes strategy content to the focused step before rendering choices", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(scopedReaderPayload);
        renderPage("/quests/Quest_Scoped");

        await screen.findByRole("heading", { name: "Forked Chronicle" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Hold the first line.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Secure the ash road.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Negotiate the coral road.")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Take the ash road/ })).toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Take the ash road/ }));

        expect(within(chronicle).getAllByText("Choose the ash road.").length).toBeGreaterThan(0);
        expect(within(chronicle).queryByText("Ash road later objective must wait.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Coral road outcome.")).not.toBeInTheDocument();
    });

    it("scopes lore content to the focused step before rendering choices", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(scopedReaderPayload);
        renderPage("/quests/Quest_Scoped");

        await screen.findByRole("heading", { name: "Forked Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Shared opening belongs before the choice.")).toBeInTheDocument();
        expect(within(chronicle).getByText("Step one lore belongs before the choice.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Future untagged lore must wait for the path.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Step two lore must wait for a selected sequence.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Step three lore must not pre-render.")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Take the ash road/ })).toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Take the ash road/ }));

        expect(within(chronicle).getByText("Only ash road lore is revealed.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Ash road later lore remains hidden.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Coral road lore remains hidden.")).not.toBeInTheDocument();
    });

    it("uses choice continuity metadata to prevent same-step future lore from leaking", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceKeyScopedPayload);
        renderPage("/quests/Quest_Keyed");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current resolution belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Find Pryzja/ }));

        const selectedChoice = within(chronicle).getByRole("button", { name: /Find Pryzja/ });
        const nextChoice = within(chronicle).getByRole("button", { name: /Eliminate the threat/ });

        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(nextChoice).toBeInTheDocument();
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expectElementBefore(selectedChoice, nextChoice);
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
    });

    it("keeps passive setup lore scoped before carried continuation choices", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current resolution belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getByRole("button", { name: /Eliminate the threat/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Find Pryzja/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
    });

    it("keeps raw Lore diagnostics available while duplicate body ownership is guarded", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(screen.getByRole("region", { name: "Quest progression debug" })).toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByRole("checkbox", { name: "Show raw hidden rows" })).toBeChecked();
        expect(screen.getByRole("region", { name: "Quest progression debug" })).toBeInTheDocument();
        expect(within(chronicle).getAllByRole("button", { name: /Find Pryzja/ }).length).toBeGreaterThan(0);
    });

    it("uses choice continuity metadata to prevent same-step future objectives from leaking", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceKeyScopedPayload);
        renderPage("/quests/Quest_Keyed?mode=strategy");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const currentTask = within(chronicle).getByRole("region", { name: "Current task" });
        expect(within(currentTask).getByText("Find Pryzja")).toBeInTheDocument();
        expect(within(currentTask).getByText("Find Pryzja.")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in this chapter")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the current beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Select a path to preview its result and next destination.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("No path is being simulated yet.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Find Pryzja/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Eliminate the threat/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();
    });

    it("keeps same-entry serial continuations as active strategy decisions", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed?mode=strategy");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("Step 2").length).toBeGreaterThan(0);
        expect(within(chronicle).getByText("of 3")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();

        const currentTask = within(chronicle).getByRole("region", { name: "Current task" });
        expect(within(currentTask).getByText("Eliminate the threat")).toBeInTheDocument();
        expect(within(currentTask).getByText("Eliminate the threat.")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in this chapter")).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Eliminate the threat/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Rebuild the city/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Rebuild the city")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the future beat.")).not.toBeInTheDocument();
    });

    it("reveals projected local continuation steps from explicit reveal metadata", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationPayload);
        renderPage("/quests/Quest_Projector?mode=strategy");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("Step 1").length).toBeGreaterThan(0);
        expect(within(chronicle).queryByText("Step 2")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried future beat.")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        const selectedChoice = within(chronicle).getByRole("button", { name: /Search/ });

        expect(within(chronicle).queryByText("Resolve the carried current beat.")).not.toBeInTheDocument();
        expect(selectedChoice).toHaveAttribute("aria-current", "true");
        expect(selectedChoice).toHaveTextContent("Search");
        expect(within(chronicle).queryByText("Resolve the carried next beat.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried future beat.")).not.toBeInTheDocument();
        expect(screen.queryByText(/continues in Chapter 3/)).not.toBeInTheDocument();
    });

    it("does not bridge projected local steps without explicit reveal metadata", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationWithoutRevealPayload);
        renderPage("/quests/Quest_Projector?mode=strategy");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        expect(within(chronicle).queryByText("Step 2")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Resolve the carried next beat.")).not.toBeInTheDocument();
        const selectedChoice = within(chronicle).getByRole("button", { name: /Search/ });
        const selectedResult = within(chronicle).getByRole("region", { name: "Choosing Search leads to" });
        expect(selectedChoice).not.toHaveTextContent("Rejoins progression at Chapter 3: Next Chapter");
        expect(selectedResult).toHaveTextContent("Rejoins progression at Chapter 3: Next Chapter");
    });

    it("keeps revealedBy lore sections hidden until their owner branch is selected", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationPayload);
        renderPage("/quests/Quest_Projector?mode=lore");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).queryByText("The carried next beat is now readable.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The carried future beat resolves the local chapter.")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        expect(within(chronicle).getByText("The carried next beat is now readable.")).toBeInTheDocument();
        expect(within(chronicle).getByText("The carried future beat resolves the local chapter.")).toBeInTheDocument();
    });

    it("renders minor faction objective variants without aggregate overview", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(minorVariantPayload);
        renderPage("/quests");

        await user.click(await screen.findByRole("radio", { name: /^Minor Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Ancient Graveyard" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByLabelText("Strategy overview")).not.toBeInTheDocument();
        expect(screen.getByText("Objective 1")).toBeInTheDocument();
        expect(screen.getByText("Objective 2")).toBeInTheDocument();
        expect(screen.getByText("The divining ritual depends on a rare material.")).toBeInTheDocument();
        expect(screen.getByText("Travelers can contain useful clues.")).toBeInTheDocument();
        expect(screen.getByText("Maintain the required empire value.")).toBeInTheDocument();
        expect(screen.getByText("Gain Glassteel.")).toBeInTheDocument();
    });

    it("groups minor faction lore by shared opening, objective variants, and shared resolution", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(minorVariantPayload);
        renderPage("/quests");

        await user.click(await screen.findByRole("radio", { name: /^Minor Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Ancient Graveyard" })).toBeInTheDocument();

        expect(screen.getAllByRole("heading", { name: "Opening" })).toHaveLength(1);
        expect(screen.getByText("A somber atmosphere hangs over the settlement.")).toBeInTheDocument();
        expect(screen.getByText("Objective 1")).toBeInTheDocument();
        expect(screen.getByText("Objective 2")).toBeInTheDocument();
        expect(screen.getByText("The ground speaks, but we cannot hear it.")).toBeInTheDocument();
        expect(screen.getByText("A trading post is certain to bring us news.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Resolution" })).toBeInTheDocument();
        expect(screen.getByText("Thanks to your help, we know the way back.")).toBeInTheDocument();
    });

    it("changing an earlier choice resets downstream revealed content", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveTextContent("Read the shore signs.");

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Read the shore signs.").length).toBeGreaterThan(0);
        expect(shoreChoice).toHaveTextContent("Read the shore signs.");
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("keeps Strategy and Lore semantic selections independent while preserving each tab", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const loreShoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(loreShoreChoice);
        expect(loreShoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Continuation revealed")).not.toBeInTheDocument();

        const markerChoice = screen.getByRole("button", { name: /Follow the marker/ });
        await user.click(markerChoice);
        expect(markerChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Lore" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);
    });

    it("preserves a Lore selected sequence across Lore to Strategy to Lore", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Study the shore/ }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Lore" }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);
    });

    it("preserves a Strategy selected simulation across Strategy to Lore to Strategy", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Lore" }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);
    });

    it("keeps lore choices from selecting strategy choice cards", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
    });

    it("preserves Lore selections by chapter context while Strategy remains entry-scoped", async () => {
        const user = userEvent.setup();
        const baseProgression = choiceResetPayload.progression!;
        const baseQuestline = baseProgression.questlines[0]!;
        const secondChapter = progressionQuestline({
            chapterNumber: 2,
            chapterOrder: 2,
            title: "Later Archive",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Later Archive", detailEntryKey: "Quest_D" },
                { stepNumber: 2, stepOrder: 2, title: "Later Result", detailEntryKey: "Quest_E" },
            ],
        }).chapters[0];
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            ...choiceResetPayload,
            entries: [
                ...choiceResetPayload.entries,
                questEntry({
                    entryKey: "Quest_D",
                    title: "Later Archive",
                    summaryLines: ["Another chapter waits."],
                    navigation: {
                        chapter: 2,
                        chapterLabel: "Chapter 2",
                        chapterOrder: 2,
                        step: 1,
                        stepLabel: "Step 1",
                        stepOrder: 1,
                        sequenceIndex: 3,
                        previousEntryKeys: [],
                        nextEntryKeys: [],
                    },
                    branches: [{
                        ...testBranch("Branch_D", "Open later record"),
                        groupLabel: "Later Archive",
                        nextEntryKeys: ["Quest_E"],
                        lore: { outcomePreviewLines: ["The later continuation opens."] },
                    }],
                    strategyView: { objectives: [testObjective("Objective_D", "Hold the later archive.")] },
                }),
                questEntry({
                    entryKey: "Quest_E",
                    title: "Later Result",
                    summaryLines: ["The later continuation opens."],
                    navigation: {
                        chapter: 2,
                        chapterLabel: "Chapter 2",
                        chapterOrder: 2,
                        step: 2,
                        stepLabel: "Step 2",
                        stepOrder: 2,
                        sequenceIndex: 4,
                        previousEntryKeys: ["Quest_D"],
                        nextEntryKeys: [],
                    },
                    strategyView: { objectives: [testObjective("Objective_E", "Resolve the later archive.")] },
                }),
            ],
            progression: {
                debugSummary: baseProgression.debugSummary,
                questlines: [{ ...baseQuestline, chapters: [...baseQuestline.chapters, secondChapter] }],
            },
        });
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Study the shore/ }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: /Later Archive/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_D"));
        expect(screen.queryByRole("button", { name: /Follow the marker/ })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Later Archive", level: 2 })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lore" }));
        const laterChoice = screen.getByRole("button", { name: /Open later record/ });
        await user.click(laterChoice);
        expect(laterChoice).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: /Archive of the First Tide/ }));
        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A"));

        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lore" }));
        await user.click(screen.getByRole("button", { name: /Later Archive/ }));
        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_D"));
        expect(screen.getByRole("button", { name: /Open later record/ })).toHaveAttribute("aria-current", "true");
    });

    it("clears an incompatible semantic selection after category changes away and back", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetWithWorldPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByLabelText(/World Quests/));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: /^Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("hides unresolved non-final main faction choices outside debug mode", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
    });

    it("hides ungated continuation rows from normal choices until raw debug is requested", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(ungatedContinuationPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Noisy Chronicle" });

        expect(screen.getByRole("button", { name: /Choose the first path/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Future-looking continuation/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/continuation row waits for a selected branch sequence/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByRole("button", { name: /Future-looking continuation/ })).toBeInTheDocument();
        expect(screen.getByText(/continuation row waits for a selected branch sequence/)).toBeInTheDocument();
    });

    it("keeps branch variant projections out of normal choices when entry-backed branches exist", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(branchVariantProjectionPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Projected Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByRole("button", { name: /Claim Lands/ })).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Seek Facility/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Projected Future/ })).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(within(chronicle).getByRole("button", { name: /Projected Future/ })).toBeInTheDocument();
    });

    it("stops gracefully in debug mode when a modeled choice lacks explicit continuation keys", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/hidden in normal UI: no modeled continuation before final chapter/)).not.toBeInTheDocument();
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByText(/hidden in normal UI: no modeled continuation before final chapter/)).toBeInTheDocument();
        const currentTask = screen.getByRole("region", { name: "Current task" });
        expect(within(currentTask).getByText("Take the unknown road")).toBeInTheDocument();
        expect(within(currentTask).getByText("Unknown continuation")).toBeInTheDocument();
        expect(within(currentTask).queryByText("No explicit continuation is recorded for this stage.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("gates continuation branches until their prerequisite branch is selected", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(gatedContinuationPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "The Hunt" });

        expect(screen.getByRole("button", { name: /Track/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Lure/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Capture the rogue Lieutenant/ })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Choose a path" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Track/ }));

        expect(screen.queryByText("Continue Selected Path")).not.toBeInTheDocument();
        const trackButton = screen.getByRole("button", { name: /Track/ });
        const continuationRevealed = screen.getByText("Continuation revealed");
        expect(continuationRevealed).toBeInTheDocument();
        expect(screen.getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();
        const revealedOutcome = screen.getByText("The quarry is cornered.");
        expect(revealedOutcome).toBeInTheDocument();
        expectElementBefore(trackButton, continuationRevealed);
        expectElementBefore(continuationRevealed, revealedOutcome);
        expect(screen.queryByRole("button", { name: /Capture the rogue Lieutenant/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/does not identify the next continuation/)).not.toBeInTheDocument();

        expect(screen.getByText("The hunt resolves.")).toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("hides duplicate no-link artifact rows beside true choices outside debug mode", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(artifactCleanupPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Final Choice" });

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(1);
        expect(screen.queryByText("Artifact Reclaim")).not.toBeInTheDocument();
        expect(screen.queryByText("Artifact Reject")).not.toBeInTheDocument();
    });

    it("keeps artifact cleanup diagnostics readable in debug and reveals raw rows on demand", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(artifactCleanupPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Final Choice" });

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(1);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(1);
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        expect(within(debugPanel).getByText("normal visible semantic row count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("debug visible semantic row count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("hidden artifact count")).toBeInTheDocument();
        expect(within(debugPanel).getByText("active branch sequence")).toBeInTheDocument();
        expect(screen.queryByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getAllByRole("button", { name: /Reclaim/ })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: /Reject/ })).toHaveLength(2);
        expect(screen.getAllByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).toHaveLength(2);
    });

    it("collapses staged continuation convergence rows outside debug mode", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedContinuationPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "A Gamble" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(screen.queryByText("Continue Selected Path")).not.toBeInTheDocument();
        expect(screen.getByText("Possible continuations")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(screen.queryByText("Next Choices")).not.toBeInTheDocument();
        expect(screen.queryByText("Continuations")).not.toBeInTheDocument();
        expect(within(chronicle).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);
        expect(screen.queryByText("Far Pious")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Open")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Bold")).not.toBeInTheDocument();
    });

    it("keeps staged continuation diagnostics readable in debug and reveals raw convergence rows on demand", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedContinuationPayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "A Gamble" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(within(chronicle).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);
        expect(screen.queryByText(/hidden in normal UI: later convergence row collapsed behind nearer continuation choice/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(within(chronicle).getAllByRole("button", { name: /Pious/ }).length).toBeGreaterThanOrEqual(2);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ }).length).toBeGreaterThanOrEqual(2);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ }).length).toBeGreaterThanOrEqual(2);
        const debugPanel = screen.getByRole("region", { name: "Quest progression debug" });
        expect(within(debugPanel).getByText("hidden staged continuation count")).toBeInTheDocument();
    });

    it("shows a one-option chapter exit in strategy without mutating the selected entry", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(nextChapterPayload);
        renderPage("/quests/Quest_A?mode=strategy");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const currentTask = within(chronicle).getByRole("region", { name: "Current task" });
        const rail = screen.getByRole("complementary");
        expect(within(currentTask).getByText("Continue to chapter two")).toBeInTheDocument();
        expect(within(currentTask).getByText("Continues in Chapter 2: Chapter Two Rising")).toBeInTheDocument();
        expect(within(chronicle).queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Continue to chapter two/ })).not.toBeInTheDocument();
        expect(within(rail).getByRole("button", { name: /Archive of the First Tide\s+Chapter 1\s+1 step/ })).toHaveAttribute("aria-current", "page");
        expect(within(rail).getByRole("button", { name: /Chapter Two Rising\s+Chapter 2\s+1 step/ })).not.toHaveAttribute("aria-current", "page");
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
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
        expect(within(chronicle).queryByText("virtual_alias_expanded")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("branch_variant")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Pious/ })).toHaveAttribute("aria-current", "true");
        expect(useQuestStore.getState().selectedEntryKey).toBe("FactionQuest_Mukag_Chapter02_Step02_Choice01");
    });

    it("focuses repeated detailEntryKey alias routes on their selected virtual step", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedDetailPayload);
        renderPage("/quests/Quest_Shared_Alias_Step02");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Step 2")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Step 1")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Chronicle Checkpoint")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("virtual_alias_expanded")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("repeated detail content")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Entry-backed")).not.toBeInTheDocument();
        expect(screen.getAllByText("The same chronicle page carries both steps.")).toHaveLength(1);
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Shared");
    });

    it("does not repeat branch rows for repeated detailEntryKey projection stages", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedChoicePayload);
        renderPage("/quests/Quest_Shared?debugQuestProgression=true");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByRole("button", { name: /Open the sealed page/ })).toHaveLength(1);
        expect(within(chronicle).queryByText("Step 2")).not.toBeInTheDocument();
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
