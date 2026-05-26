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

describe("buildStrategyFlowModel semantic view models", () => {
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
