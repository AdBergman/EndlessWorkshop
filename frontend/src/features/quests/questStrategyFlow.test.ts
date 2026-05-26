import { describe, expect, it } from "vitest";

import {
    buildStrategyFlowModel,
    type StrategyFlowModel,
} from "@/features/quests/questStrategyFlow";
import type { QuestDetailProgression } from "@/features/quests/questPathFlow";
import {
    progressionQuestline,
    questEntry,
    testBranch,
    testObjective,
    testRequirement,
    testReward,
} from "@/features/quests/testUtils/questExplorerFixtures";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
} from "@/types/questTypes";

function singleEntryProgression(entry: QuestExplorerEntry): QuestExplorerProgression {
    return {
        questlines: [
            progressionQuestline({
                title: entry.title,
                steps: [
                    { stepNumber: 1, stepOrder: 1, title: entry.title, detailEntryKey: entry.entryKey },
                ],
            }),
        ],
        debugSummary: null,
    };
}

function detailProgressionFrom(progression: QuestExplorerProgression): QuestDetailProgression {
    const questline = progression.questlines[0];
    const chapter = questline.chapters[0];
    const focusedStep = chapter.steps[0];

    return {
        questline,
        chapter,
        activeStepKeys: focusedStep ? new Set([focusedStep.stepKey]) : new Set(),
        activeVariantEntryKeys: new Set(),
        focusedStepIndex: 0,
    };
}

function strategyModelForEntry(
    entry: QuestExplorerEntry,
    options: { showRawHiddenRows?: boolean } = {}
): StrategyFlowModel {
    const progression = singleEntryProgression(entry);
    const model = buildStrategyFlowModel({
        progression: detailProgressionFrom(progression),
        fullProgression: progression,
        entriesByKey: { [entry.entryKey]: entry },
        choicePath: [],
        showRawHiddenRows: options.showRawHiddenRows ?? false,
    });

    if (!model) throw new Error("Expected strategy model for test progression.");
    return model;
}

function strategyModelForProgression(
    entries: QuestExplorerEntry[],
    progression: QuestExplorerProgression,
    options: { showRawHiddenRows?: boolean; focusedStepIndex?: number } = {}
): StrategyFlowModel {
    const selectedProgression = detailProgressionFrom(progression);
    const focusedStep = selectedProgression.chapter.steps[options.focusedStepIndex ?? 0]
        ?? selectedProgression.chapter.steps[0];
    selectedProgression.focusedStepIndex = options.focusedStepIndex ?? 0;
    selectedProgression.activeStepKeys = focusedStep ? new Set([focusedStep.stepKey]) : new Set();

    const model = buildStrategyFlowModel({
        progression: selectedProgression,
        fullProgression: progression,
        entriesByKey: Object.fromEntries(entries.map((entry) => [entry.entryKey, entry])),
        choicePath: [],
        showRawHiddenRows: options.showRawHiddenRows ?? false,
    });

    if (!model) throw new Error("Expected strategy model for test progression.");
    return model;
}

describe("buildStrategyFlowModel semantic view models", () => {
    it("builds a full chapter task plan instead of exposing only the active continuation", () => {
        const entry = questEntry({
            entryKey: "Quest_Keyed",
            title: "Keyed Chronicle",
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Keyed:lore:current",
                        phase: "intro",
                        choiceKey: "Choice_Current",
                        stepIndex: 0,
                        objectiveKey: "Objective_Current",
                        lines: [],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:next",
                        phase: "intro",
                        choiceKey: "Choice_Next",
                        stepIndex: 1,
                        objectiveKey: "Objective_Next",
                        lines: [],
                    },
                    {
                        sectionKey: "Quest_Keyed:lore:future",
                        phase: "intro",
                        choiceKey: "Choice_Future",
                        stepIndex: 2,
                        objectiveKey: "Objective_Future",
                        lines: [],
                    },
                ],
            },
            strategyView: {
                objectives: [
                    { ...testObjective("Objective_Current", "Resolve the current beat."), choiceKey: "Choice_Current" },
                    { ...testObjective("Objective_Next", "Resolve the next beat."), choiceKey: "Choice_Next" },
                    { ...testObjective("Objective_Future", "Resolve the future beat."), choiceKey: "Choice_Future" },
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
        });
        const progression = {
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
        };

        const model = strategyModelForProgression([entry], progression);

        expect(model.activeStage?.stepIndex).toBe(1);
        expect(model.chapterTasks.map((task) => [task.stageLabel, task.title])).toEqual([
            ["Step 1 of 3", "Find Pryzja"],
            ["Step 2 of 3", "Eliminate the threat"],
            ["Step 3 of 3", "Rebuild the city"],
        ]);
        expect(model.chapterTasks.map((task) => task.objectives.map((objective) => objective.text))).toEqual([
            ["Resolve the current beat."],
            ["Resolve the next beat."],
            ["Resolve the future beat."],
        ]);
    });

    it("deduplicates grouped continuation completion choices in the chapter plan", () => {
        const entry = questEntry({
            entryKey: "Quest_Gamble",
            title: "A Gamble",
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
                        choiceGroupKey: "Quest_Gamble:choice-group:completion",
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
                        choiceGroupKey: "Quest_Gamble:choice-group:completion",
                        convergenceGroupKey: "Quest_Gamble:convergence:Final",
                        branchStepOrder: 2,
                        nextEntryKeys: ["Quest_Final"],
                        orderIndex: index * 2 + 3,
                        strategy: { conditions: [`Far ${label}`], requirements: [], rewards: [] },
                    },
                ])),
            ],
        });
        const progression = {
            questlines: [
                progressionQuestline({
                    title: "A Gamble",
                    steps: [
                        { stepNumber: 1, stepOrder: 1, title: "A Gamble", detailEntryKey: "Quest_Gamble" },
                        { stepNumber: 2, stepOrder: 2, title: "Outcome", detailEntryKey: "Quest_Pious", variantEntryKeys: ["Quest_Open", "Quest_Bold"] },
                    ],
                }),
            ],
            debugSummary: null,
        };

        const model = strategyModelForProgression([
            entry,
            questEntry({ entryKey: "Quest_Pious", title: "Pious Path" }),
            questEntry({ entryKey: "Quest_Open", title: "Open Path" }),
            questEntry({ entryKey: "Quest_Bold", title: "Bold Path" }),
            questEntry({ entryKey: "Quest_Final", title: "Final" }),
        ], progression);
        const rawModel = strategyModelForProgression([
            entry,
            questEntry({ entryKey: "Quest_Pious", title: "Pious Path" }),
            questEntry({ entryKey: "Quest_Open", title: "Open Path" }),
            questEntry({ entryKey: "Quest_Bold", title: "Bold Path" }),
            questEntry({ entryKey: "Quest_Final", title: "Final" }),
        ], progression, { showRawHiddenRows: true });

        expect(model.decisionPoints).toHaveLength(1);
        expect(model.decisionPoints[0].kind).toBe("completion_choice");
        expect(model.decisionPoints[0].options.map((option) => option.label)).toEqual(["Pious", "Open", "Bold"]);
        expect(model.decisionPoints[0].options.map((option) => option.outcomeLines[0])).toEqual([
            "Near Pious",
            "Near Open",
            "Near Bold",
        ]);
        expect(rawModel.decisionPoints[0].options.map((option) => option.label)).toEqual([
            "Pious",
            "Pious",
            "Open",
            "Open",
            "Bold",
            "Bold",
        ]);
    });

    it("wraps deterministic continuations as active Strategy stages without decision comparison semantics", () => {
        const model = strategyModelForEntry(questEntry({
            entryKey: "Quest_Strategy_Continuation",
            title: "Strategy Continuation",
            branches: [
                {
                    ...testBranch("Branch_Continue", "Secure the relay"),
                    sectionRole: "continuation",
                    nextEntryKeys: ["Quest_Next"],
                },
            ],
        }), { showRawHiddenRows: true });

        expect(model.activeStage).toEqual(expect.objectContaining({
            kind: "continuation",
            stageLabel: "Continuation",
            title: "Strategy Continuation",
            totalStages: 1,
        }));
        expect(model.activeStage?.currentTask).toEqual(expect.objectContaining({
            label: "Secure the relay",
        }));
        expect(model.activeStage?.continuation).toEqual(expect.objectContaining({
            label: "Secure the relay",
        }));
        expect(model.activeStage?.decisionGroup.groups).toHaveLength(0);
        expect(model.dossier).toBe(model.activeStage?.dossier);
        expect(model.renderedStep).toBe(model.activeStage?.renderedStep);
    });

    it("emits explicit decision groups as Strategy decision stages", () => {
        const model = strategyModelForEntry(questEntry({
            entryKey: "Quest_Strategy_Decision",
            title: "Strategy Decision",
            branches: [
                {
                    ...testBranch("Branch_Left", "Aid the scouts"),
                    choiceKey: "Choice_Left",
                    sectionRole: "true_choice",
                    choiceGroupKey: "Decision_Test",
                    groupKey: "Decision_Test",
                    groupLabel: "Decision Options",
                    nextEntryKeys: ["Quest_Left"],
                },
                {
                    ...testBranch("Branch_Right", "Hold the gate"),
                    choiceKey: "Choice_Right",
                    sectionRole: "true_choice",
                    choiceGroupKey: "Decision_Test",
                    groupKey: "Decision_Test",
                    groupLabel: "Decision Options",
                    nextEntryKeys: ["Quest_Right"],
                },
            ],
        }));

        expect(model.activeStage?.kind).toBe("decision");
        expect(model.activeStage?.decisionGroup.groups[0]?.options.map((option) => option.label)).toEqual([
            "Aid the scouts",
            "Hold the gate",
        ]);
        expect(model.activeStage?.continuation).toBeNull();
        expect(model.activeStage?.topologyAlternatives).toHaveLength(0);
    });

    it("surfaces terminal branch objectives as comparable Chapter 6 decision outcomes", () => {
        const entry = questEntry({
            entryKey: "Quest_Kin_Final",
            title: "A Place Called Home",
            strategyView: {
                objectives: [
                    {
                        ...testObjective("Objective_Leave_Study", "Study the starfarers vessel."),
                        choiceKey: "Choice_Leave",
                        requirements: [testRequirement("Requirement_Leave_Study", "Discover natural wonder: Stellar Ship")],
                        rewards: [testReward("Reward_Leave", "Gain faction trait: Supreme Commandments")],
                    },
                    {
                        ...testObjective("Objective_Leave_Contact", "Build interstellar communications."),
                        choiceKey: "Choice_Leave",
                        requirements: [testRequirement("Requirement_Leave_Contact", "Build constructible: Martial Discipline once")],
                        rewards: [testReward("Reward_Leave", "Gain faction trait: Supreme Commandments")],
                    },
                    {
                        ...testObjective("Objective_Stay_Claim", "Help the Kin embrace Saiadha as their home."),
                        choiceKey: "Choice_Stay",
                        requirements: [testRequirement("Requirement_Stay_Claim", "Claim a territory")],
                        rewards: [testReward("Reward_Stay", "Unlock constructible: Reservists Authority")],
                    },
                    {
                        ...testObjective("Objective_Stay_Settle", "Strengthen the Kin settlements."),
                        choiceKey: "Choice_Stay",
                        requirements: [testRequirement("Requirement_Stay_Settle", "Have 3 cities at level 3 for 5 turns")],
                        rewards: [testReward("Reward_Stay", "Unlock constructible: Reservists Authority")],
                    },
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_Leave", "Leave"),
                    choiceKey: "Choice_Leave",
                    sectionRole: "terminal",
                    branchStepOrder: 1,
                    strategy: { conditions: [], requirements: [], rewards: [] },
                },
                {
                    ...testBranch("Branch_Stay", "Stay"),
                    choiceKey: "Choice_Stay",
                    sectionRole: "terminal",
                    branchStepOrder: 1,
                    strategy: { conditions: [], requirements: [], rewards: [] },
                },
            ],
        });
        const progression = {
            questlines: [
                progressionQuestline({
                    title: "A Place Called Home",
                    chapterNumber: 6,
                    chapterOrder: 6,
                    steps: [
                        { stepNumber: 1, stepOrder: 1, title: "A Place Called Home", detailEntryKey: "Quest_Kin_Final" },
                    ],
                }),
            ],
            debugSummary: null,
        };

        const model = strategyModelForProgression([entry], progression);

        expect(model.chapterTasks).toHaveLength(0);
        expect(model.decisionPoints).toHaveLength(1);
        expect(model.decisionPoints[0]).toEqual(expect.objectContaining({
            kind: "explicit_choice",
            title: "Choose a path",
        }));
        expect(model.decisionPoints[0].options.map((option) => option.label)).toEqual(["Leave", "Stay"]);
        expect(model.decisionPoints[0].options[0].outcomeLines).toEqual([
            "Study the starfarers vessel.",
            "Build interstellar communications.",
        ]);
        expect(model.decisionPoints[0].options[0].requirements).toEqual([
            "Discover natural wonder: Stellar Ship",
            "Build constructible: Martial Discipline once",
        ]);
        expect(model.decisionPoints[0].options[1].outcomeLines).toEqual([
            "Help the Kin embrace Saiadha as their home.",
            "Strengthen the Kin settlements.",
        ]);
        expect(model.decisionPoints[0].options[1].requirements).toEqual([
            "Claim a territory",
            "Have 3 cities at level 3 for 5 turns",
        ]);
    });

    it("keeps topology alternatives separate from explicit Strategy decisions", () => {
        const model = strategyModelForEntry(questEntry({
            entryKey: "Quest_Strategy_Topology",
            title: "Strategy Topology",
            branches: [
                {
                    ...testBranch("Branch_North", "Northern continuation"),
                    choiceGroupKey: "Topology_Test",
                    groupKey: "Topology_Test",
                    groupLabel: "Continuation Options",
                    nextEntryKeys: ["Quest_North"],
                },
                {
                    ...testBranch("Branch_South", "Southern continuation"),
                    choiceGroupKey: "Topology_Test",
                    groupKey: "Topology_Test",
                    groupLabel: "Continuation Options",
                    nextEntryKeys: ["Quest_South"],
                },
            ],
        }));

        expect(model.activeStage?.kind).toBe("topology_alternative");
        expect(model.activeStage?.stageLabel).toBe("Possible continuations");
        expect(model.activeStage?.decisionGroup.groups).toHaveLength(0);
        expect(model.activeStage?.topologyAlternatives.map((option) => option.label)).toEqual([
            "Northern continuation",
            "Southern continuation",
        ]);
    });

    it("preserves terminal and unresolved Strategy stage kinds through the active stage wrapper", () => {
        const terminalModel = strategyModelForEntry(questEntry({
            entryKey: "Quest_Strategy_Terminal",
            title: "Strategy Terminal",
            branches: [
                {
                    ...testBranch("Branch_Terminal", "Hold the ending"),
                    sectionRole: "terminal",
                },
            ],
        }), { showRawHiddenRows: true });
        const unresolvedModel = strategyModelForEntry(questEntry({
            entryKey: "Quest_Strategy_Unresolved",
            title: "Strategy Unresolved",
            branches: [
                {
                    ...testBranch("Branch_Unresolved", "Follow the rumor"),
                    sectionRole: "unresolved",
                },
            ],
        }), { showRawHiddenRows: true });

        expect(terminalModel.activeStage?.kind).toBe("terminal");
        expect(terminalModel.activeStage?.currentTask?.choice.semanticStageKind).toBe("terminal");
        expect(unresolvedModel.activeStage?.kind).toBe("unresolved");
        expect(unresolvedModel.activeStage?.currentTask?.choice.semanticStageKind).toBe("unresolved");
    });
});
