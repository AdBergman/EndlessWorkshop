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

        expect(within(debugPanel).getByText("Debug progression")).toBeInTheDocument();
        expect(within(debugPanel).getAllByText("stepKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("Line_First_Tide:Faction_Kin:chapter-1:step-1")).toBeInTheDocument();
        expect(within(debugPanel).getAllByText("detailEntryKey").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("projectionKind").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("sourceEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("aliasEntryKeys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("variant keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getAllByText("continuation keys").length).toBeGreaterThan(0);
        expect(within(debugPanel).getByText("selected choice path")).toBeInTheDocument();
        expect(within(debugPanel).getByText("unresolved continuation")).toBeInTheDocument();
        expect(screen.getByText(/shown at Chapter 1 Step 1; owner Chapter 1 Step 1 .* branch -> Chapter 1 Step 2/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));

        await waitFor(() => {
            expect(within(debugPanel).getAllByText(/choiceId=branch:Branch_A/).length).toBeGreaterThan(0);
        });
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("renders strategy mode and reveals the next step after a modeled choice", async () => {
        const user = userEvent.setup();
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getAllByText("Reach the marker.").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Visit the first marker.").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Gain Dust.").length).toBeGreaterThan(0);
        expect(screen.queryByText("The tide record begins.")).not.toBeInTheDocument();
        expect(screen.queryByText("We follow the old marker.")).not.toBeInTheDocument();
        expect(screen.getByText("This step will be revealed after you make your choice.")).toBeInTheDocument();

        const choice = screen.getByRole("button", { name: /Follow the marker/ });
        await user.click(choice);

        expect(choice).toHaveAttribute("aria-current", "true");
        expect(screen.getByText("No strategy objectives are attached to this step.")).toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
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
        expect(screen.getByText("Secure the marker path.")).toBeInTheDocument();
        expect(screen.queryByText("Read the shore signs.")).not.toBeInTheDocument();

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getByText("Read the shore signs.")).toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("preserves the selected progression path when switching strategy and lore modes", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const markerChoice = screen.getByRole("button", { name: /Follow the marker/ });
        await user.click(markerChoice);
        expect(markerChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getByText("Secure the marker path.")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lore" }));

        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getByText("Secure the marker path.")).toBeInTheDocument();
    });

    it("uses one choice path for lore branch moments and strategy choice cards", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getByText("Read the shore signs.")).toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
    });

    it("clears an incompatible choice path when navigation changes to another quest in the same chapter", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);

        render(
            <MemoryRouter initialEntries={["/quests/Quest_A"]}>
                <Routes>
                    <Route path="/quests/*" element={<QuestRouteHarness />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Open second tide" }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_B"));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current");
        expect(screen.getAllByText("The marker path opens.").length).toBeGreaterThan(0);
    });

    it("clears an incompatible choice path after category changes away and back", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetWithWorldPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByText("Secure the marker path.")).toBeInTheDocument();

        await user.click(screen.getByLabelText(/World Quests/));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: /^Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(screen.getByText("This step will be revealed after you make your choice.")).toBeInTheDocument();
    });

    it("hides unresolved non-final main faction choices outside debug mode", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.queryByRole("button", { name: /Take the unknown road/ })).not.toBeInTheDocument();
        expect(screen.getByText("This step will be revealed after you make your choice.")).toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
    });

    it("stops gracefully in debug mode when a modeled choice lacks explicit continuation keys", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(unresolvedChoicePayload);
        renderPage("/quests/Quest_A?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByText("This step will be revealed after you make your choice.")).toBeInTheDocument();
        expect(screen.getByText(/hidden in normal UI: no modeled continuation before final chapter/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /Take the unknown road/ }));

        expect(screen.getByText("Path Continues")).toBeInTheDocument();
        expect(screen.getByText(/does not identify the next continuation step/)).toBeInTheDocument();
        expect(screen.queryByText("Hidden objective.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("updates the active rail chapter when a modeled choice reaches the next chapter", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(nextChapterPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: /Continue to chapter two/ }));

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByRole("button", { name: /Chapter Two Rising\s+Chapter 2\s+1 step/ })).toHaveAttribute("aria-current", "page");
        expect(screen.getByText("Next Chapter Reached")).toBeInTheDocument();
        expect(screen.getByText("Chapter Two Rising is now the active rail context.")).toBeInTheDocument();
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

    it("renders repeated detailEntryKey virtual steps without parser labels", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedDetailPayload);
        renderPage("/quests/Quest_Shared_Alias_Step02");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Step 1")).toBeInTheDocument();
        expect(within(chronicle).getByText("Step 2")).toBeInTheDocument();
        expect(within(chronicle).queryByText("virtual_alias_expanded")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("repeated detail content")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Entry-backed")).not.toBeInTheDocument();
        expect(screen.getAllByText("The same chronicle page carries both steps.")).toHaveLength(1);
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Shared");
    });

    it("does not repeat branch choices for repeated detailEntryKey projection steps", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(repeatedChoicePayload);
        renderPage("/quests/Quest_Shared?debugQuestProgression=true");

        expect(await screen.findByRole("heading", { name: "Shared Chronicle" })).toBeInTheDocument();

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
