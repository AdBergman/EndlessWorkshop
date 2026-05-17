import type { QuestStepDto } from "@/types/questTypes";
import { buildQuestStepSemanticGroups, isThresholdLikeLine } from "./questStepSemantics";

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Attempt to dislodge Xenos' memories.",
    nextQuestKey: "Quest_Next",
    failQuestKey: null,
    descriptionLines: [],
    completionPrerequisiteLines: [],
    failurePrerequisiteLines: [],
    forbiddenPrerequisiteLines: [],
    selectionPrerequisiteLines: [],
    rewardDisplayLines: [],
    referenceKeys: [],
    dialogBlockIdentities: ["Quest_A|Choice_A|0|Dialog_Start|start", "Quest_A|Choice_A|0|Dialog_End|success"],
    ...overrides,
});

describe("questStepSemantics", () => {
    it("recognizes threshold-like prerequisite lines", () => {
        expect(isThresholdLikeLine("Explore world: 20%")).toBe(true);
        expect(isThresholdLikeLine("Property requirement: Fortification = 750")).toBe(true);
        expect(isThresholdLikeLine("Descriptor requirement: GreaterOrEqual 3")).toBe(true);
        expect(isThresholdLikeLine("Have {0} Laboratories (/{0})")).toBe(true);
        expect(isThresholdLikeLine("Hold the old archive.")).toBe(false);
    });

    it("groups Xenos-like explore thresholds into one progress gate", () => {
        const groups = buildQuestStepSemanticGroups([
            step({
                stepIndex: 0,
                selectionPrerequisiteLines: ["Explore world: 1%"],
                completionPrerequisiteLines: ["Explore world: 20%"],
                forbiddenPrerequisiteLines: ["Explore world: 20%"],
            }),
            step({
                stepIndex: 1,
                selectionPrerequisiteLines: ["Explore world: 21%"],
                completionPrerequisiteLines: ["Explore world: 30%"],
                forbiddenPrerequisiteLines: ["Explore world: 30%"],
                dialogBlockIdentities: [
                    "Quest_A|Choice_A|1|Dialog_Start|start",
                    "Quest_A|Choice_A|1|Dialog_End|success",
                ],
            }),
            step({
                stepIndex: 2,
                selectionPrerequisiteLines: ["Explore world: 31%"],
                completionPrerequisiteLines: ["Explore world: 40%"],
                forbiddenPrerequisiteLines: ["Explore world: 40%"],
                dialogBlockIdentities: [
                    "Quest_A|Choice_A|2|Dialog_Start|start",
                    "Quest_A|Choice_A|2|Dialog_End|success",
                ],
            }),
        ]);

        expect(groups).toEqual([
            {
                id: "progressGate:0-1-2",
                kind: "progressGate",
                title: "Attempt to dislodge Xenos' memories.",
                representativeStepIndex: 0,
                stepIndexes: [0, 1, 2],
                nextQuestKey: "Quest_Next",
                failQuestKey: null,
                variants: [
                    {
                        stepIndex: 0,
                        selectionLines: ["Explore world: 1%"],
                        completionLines: ["Explore world: 20%"],
                        failureLines: [],
                        forbiddenLines: ["Explore world: 20%"],
                        rewardLines: [],
                    },
                    {
                        stepIndex: 1,
                        selectionLines: ["Explore world: 21%"],
                        completionLines: ["Explore world: 30%"],
                        failureLines: [],
                        forbiddenLines: ["Explore world: 30%"],
                        rewardLines: [],
                    },
                    {
                        stepIndex: 2,
                        selectionLines: ["Explore world: 31%"],
                        completionLines: ["Explore world: 40%"],
                        failureLines: [],
                        forbiddenLines: ["Explore world: 40%"],
                        rewardLines: [],
                    },
                ],
            },
        ]);
    });

    it("groups repeated numeric property requirement thresholds into one progress gate", () => {
        const groups = buildQuestStepSemanticGroups([
            step({
                stepIndex: 0,
                objectiveText: "Strengthen the settlements' defenses.",
                completionPrerequisiteLines: ["Property requirement: Fortification = 750"],
                forbiddenPrerequisiteLines: ["Property requirement: Fortification = 750"],
            }),
            step({
                stepIndex: 1,
                objectiveText: "Strengthen the settlements' defenses.",
                selectionPrerequisiteLines: ["Property requirement: Fortification = 750"],
                completionPrerequisiteLines: ["Property requirement: Fortification = 1000"],
                forbiddenPrerequisiteLines: ["Property requirement: Fortification = 1000"],
                dialogBlockIdentities: [
                    "Quest_A|Choice_A|1|Dialog_Start|start",
                    "Quest_A|Choice_A|1|Dialog_End|success",
                ],
            }),
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0]).toMatchObject({
            kind: "progressGate",
            title: "Strengthen the settlements' defenses.",
            stepIndexes: [0, 1],
        });
    });

    it("keeps repeated objectives separate when transitions differ", () => {
        const groups = buildQuestStepSemanticGroups([
            step({ stepIndex: 0, completionPrerequisiteLines: ["Explore world: 20%"], nextQuestKey: "Quest_A" }),
            step({ stepIndex: 1, completionPrerequisiteLines: ["Explore world: 30%"], nextQuestKey: "Quest_B" }),
        ]);

        expect(groups.map((group) => group.kind)).toEqual(["objective", "objective"]);
        expect(groups.map((group) => group.stepIndexes)).toEqual([[0], [1]]);
    });

    it("collapses unresolved and resolved requirement display variants into one objective", () => {
        const groups = buildQuestStepSemanticGroups([
            step({
                stepIndex: 0,
                objectiveText: "Start seeking answers to the Lords' curse.",
                completionPrerequisiteLines: ["Clear dungeon: MyTargetDungeon"],
                rewardDisplayLines: ["Equipment reward: The Adjudicator"],
                nextQuestKey: "Quest_FollowUp",
            }),
            step({
                stepIndex: 1,
                objectiveText: "Start seeking answers to the Lords' curse.",
                completionPrerequisiteLines: ["Clear dungeons: 1"],
                rewardDisplayLines: ["Equipment reward: The Adjudicator"],
                nextQuestKey: "Quest_FollowUp",
                dialogBlockIdentities: [
                    "Quest_A|Choice_A|1|Dialog_Start|start",
                    "Quest_A|Choice_A|1|Dialog_End|success",
                ],
            }),
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0]).toMatchObject({
            id: "objective:0-1",
            kind: "objective",
            representativeStepIndex: 1,
            stepIndexes: [0, 1],
            nextQuestKey: "Quest_FollowUp",
        });
    });

    it("keeps same-title objectives separate when rewards differ", () => {
        const groups = buildQuestStepSemanticGroups([
            step({
                stepIndex: 0,
                completionPrerequisiteLines: ["Clear dungeon: MyTargetDungeon"],
                rewardDisplayLines: ["Equipment reward: The Adjudicator"],
            }),
            step({
                stepIndex: 1,
                completionPrerequisiteLines: ["Clear dungeons: 1"],
                rewardDisplayLines: ["Equipment reward: Vane of the Noble"],
                dialogBlockIdentities: [
                    "Quest_A|Choice_A|1|Dialog_Start|start",
                    "Quest_A|Choice_A|1|Dialog_End|success",
                ],
            }),
        ]);

        expect(groups.map((group) => group.stepIndexes)).toEqual([[0], [1]]);
    });
});
