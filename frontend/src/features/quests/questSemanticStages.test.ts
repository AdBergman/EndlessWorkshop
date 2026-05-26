import { describe, expect, it } from "vitest";

import { choicesForStep } from "@/features/quests/questPathFlow";
import {
    classifyQuestBranchSemanticStage,
    type QuestSemanticStageKind,
} from "@/features/quests/questSemanticStages";
import {
    progressionQuestline,
    questEntry,
    testBranch,
} from "@/features/quests/testUtils/questExplorerFixtures";
import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestProgressionStep,
} from "@/types/questTypes";

function branch(overrides: Partial<QuestBranch> & Pick<QuestBranch, "branchKey">): QuestBranch {
    return {
        ...testBranch(overrides.branchKey, overrides.label ?? overrides.branchKey),
        orderIndex: overrides.orderIndex ?? 1,
        groupKey: overrides.groupKey ?? "Group_Test",
        groupLabel: overrides.groupLabel ?? "Test Group",
        nextEntryKeys: overrides.nextEntryKeys ?? [],
        failureEntryKeys: overrides.failureEntryKeys ?? [],
        convergesIntoEntryKeys: overrides.convergesIntoEntryKeys ?? [],
        ...overrides,
    };
}

function stepForEntry(entryKey: string): QuestProgressionStep {
    const questline = progressionQuestline({
        steps: [{
            stepNumber: 1,
            stepOrder: 1,
            title: "Opening Task",
            detailEntryKey: entryKey,
        }],
    });

    return questline.chapters[0].steps[0];
}

function semanticKindsForEntry(entry: QuestExplorerEntry): QuestSemanticStageKind[] {
    const step = stepForEntry(entry.entryKey);
    return choicesForStep(step, entry, { [entry.entryKey]: entry }).map((choice) => choice.semanticStageKind);
}

describe("quest semantic stage classification", () => {
    it("maps explicit exporter section roles to canonical semantic stage kinds", () => {
        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Setup",
            sectionRole: "artifact",
        }))).toBe("setup_task");

        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Continue",
            sectionRole: "continuation",
            parentBranchKey: "Branch_Root",
            prerequisiteBranchKeys: ["Branch_Root"],
            nextEntryKeys: ["Quest_Next"],
        }))).toBe("deterministic_continuation");

        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Converge",
            sectionRole: "convergence",
            convergesIntoEntryKeys: ["Quest_Shared"],
        }))).toBe("convergence");

        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Terminal",
            sectionRole: "terminal",
        }))).toBe("terminal");

        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Unresolved",
            sectionRole: "unresolved",
        }))).toBe("unresolved");
    });

    it("keeps a one-option continuation deterministic instead of decision-shaped", () => {
        const entry = questEntry({
            entryKey: "Quest_Continuation",
            branches: [
                branch({
                    branchKey: "Branch_Continuation",
                    sectionRole: "continuation",
                    choiceGroupKey: "ChoiceGroup_Continuation",
                    parentBranchKey: "Branch_Root",
                    prerequisiteBranchKeys: ["Branch_Root"],
                    branchStepOrder: 2,
                    nextEntryKeys: ["Quest_Next"],
                }),
            ],
        });

        expect(semanticKindsForEntry(entry)).toEqual(["deterministic_continuation"]);
    });

    it("classifies shared true-choice groups as explicit decision options", () => {
        const entry = questEntry({
            entryKey: "Quest_Decision",
            branches: [
                branch({
                    branchKey: "Branch_Track",
                    choiceKey: "Choice_Track",
                    label: "Track the target",
                    sectionRole: "true_choice",
                    choiceGroupKey: "ChoiceGroup_Root",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_Track"],
                }),
                branch({
                    branchKey: "Branch_Lure",
                    choiceKey: "Choice_Lure",
                    label: "Set a lure",
                    sectionRole: "true_choice",
                    choiceGroupKey: "ChoiceGroup_Root",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_Lure"],
                }),
            ],
        });

        expect(semanticKindsForEntry(entry)).toEqual([
            "explicit_decision_option",
            "explicit_decision_option",
        ]);
    });

    it("separates non-true-choice topology forks from explicit decisions", () => {
        const forks = [
            branch({
                branchKey: "Branch_LeftTopology",
                label: "Left topology row",
                sectionRole: null,
                choiceGroupKey: "ChoiceGroup_Topology",
                nextEntryKeys: ["Quest_Left"],
            }),
            branch({
                branchKey: "Branch_RightTopology",
                label: "Right topology row",
                sectionRole: null,
                choiceGroupKey: "ChoiceGroup_Topology",
                nextEntryKeys: ["Quest_Right"],
            }),
        ];

        expect(forks.map((candidate) => classifyQuestBranchSemanticStage(candidate, forks))).toEqual([
            "topology_fork_option",
            "topology_fork_option",
        ]);
    });

    it("classifies branch variants as internal variants in adapter output", () => {
        const entry = questEntry({ entryKey: "Quest_WithVariant" });
        const questline = progressionQuestline({
            steps: [{
                stepNumber: 1,
                stepOrder: 1,
                title: "Variant Step",
                detailEntryKey: entry.entryKey,
                variantEntryKeys: ["Quest_WithVariant_B"],
            }],
        });
        const step = questline.chapters[0].steps[0];
        const variantEntry = questEntry({ entryKey: "Quest_WithVariant_B", title: "Variant B" });

        expect(choicesForStep(step, entry, {
            [entry.entryKey]: entry,
            [variantEntry.entryKey]: variantEntry,
        }).map((choice) => choice.semanticStageKind)).toContain("internal_variant");
    });

    it("classifies primary failure links narrowly as failure stages", () => {
        expect(classifyQuestBranchSemanticStage(branch({
            branchKey: "Branch_Failure",
            failureEntryKeys: ["Quest_Failed"],
        }))).toBe("failure");
    });
});
