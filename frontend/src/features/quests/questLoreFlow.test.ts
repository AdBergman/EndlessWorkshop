import { describe, expect, it } from "vitest";
import { buildLoreFlowModel } from "@/features/quests/questLoreFlow";
import type { QuestDetailProgression } from "@/features/quests/questPathFlow";
import {
    progressionQuestline,
    questEntry,
    testBranch,
    testObjective,
} from "@/features/quests/testUtils/questExplorerFixtures";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
} from "@/types/questTypes";

function detailProgressionFrom(
    progression: QuestExplorerProgression,
    focusedStepIndex = 0
): QuestDetailProgression {
    const questline = progression.questlines[0];
    const chapter = questline.chapters[0];
    const focusedStep = chapter.steps[focusedStepIndex] ?? chapter.steps[0];

    return {
        questline,
        chapter,
        activeStepKeys: focusedStep ? new Set([focusedStep.stepKey]) : new Set(),
        activeVariantEntryKeys: new Set(),
        focusedStepIndex,
    };
}

function keyedContinuationEntry(): QuestExplorerEntry {
    return questEntry({
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
                    lines: [{ speakerLabel: "Scout", role: "character", text: "The next beat waits for the selected path." }],
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
                nextEntryKeys: ["Quest_Complete"],
                strategy: { conditions: ["Rebuild the city."], requirements: [], rewards: [] },
            },
        ],
    });
}

function keyedContinuationProgression(): QuestExplorerProgression {
    return {
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
}

function loreTexts(model: ReturnType<typeof buildLoreFlowModel>): string[] {
    return model.segments.flatMap((segment) => (
        segment.loreSteps.flatMap((step) => (
            (step.loreSections ?? []).flatMap((section) => section.lines.map((line) => line.text))
        ))
    ));
}

describe("buildLoreFlowModel", () => {
    it("claims repeated narrative ownership once while leaving later continuation choices available", () => {
        const entry = keyedContinuationEntry();
        const progression = keyedContinuationProgression();
        const model = buildLoreFlowModel({
            selectedProgression: detailProgressionFrom(progression),
            fullProgression: progression,
            entriesByKey: { [entry.entryKey]: entry },
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });

        const texts = loreTexts(model);
        expect(texts.filter((text) => text === "The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(texts.filter((text) => text === "The current beat belongs before the first choice.")).toHaveLength(1);
        expect(texts.filter((text) => text === "The current resolution belongs before the first choice.")).toHaveLength(1);
        expect(texts).not.toContain("The next beat waits for the selected path.");
        expect(texts).not.toContain("The future beat must not leak.");

        const continuationStep = model.segments
            .flatMap((segment) => segment.loreSteps)
            .find((step) => step.renderedStep.choices.some((choice) => choice.label === "Eliminate the threat"));
        expect(continuationStep).toBeDefined();
        expect(continuationStep?.loreSections).toEqual([]);
        expect(continuationStep?.loreSectionsWereSuppressed).toBe(true);
    });

    it("does not dedupe distinct bodies that share the same rendered section title", () => {
        const entry = questEntry({
            entryKey: "Quest_Shared_Title",
            title: "Shared Title Chronicle",
            questType: "Side Quest",
            loreView: {
                sections: [
                    {
                        sectionKey: "Quest_Shared_Title:lore:first",
                        phase: "intro",
                        choiceKey: "Choice_First",
                        stepIndex: 0,
                        objectiveKey: null,
                        lines: [{ speakerLabel: null, role: "narrator", text: "The first same-titled body remains visible." }],
                    },
                    {
                        sectionKey: "Quest_Shared_Title:lore:second",
                        phase: "intro",
                        choiceKey: "Choice_Second",
                        stepIndex: 0,
                        objectiveKey: null,
                        lines: [{ speakerLabel: null, role: "narrator", text: "The second same-titled body remains visible." }],
                    },
                ],
            },
            branches: [
                {
                    ...testBranch("Branch_First", "First route"),
                    choiceKey: "Choice_First",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_First_Destination"],
                },
                {
                    ...testBranch("Branch_Second", "Second route"),
                    choiceKey: "Choice_Second",
                    branchStepOrder: 1,
                    nextEntryKeys: ["Quest_Second_Destination"],
                },
            ],
        });
        const progression: QuestExplorerProgression = {
            questlines: [
                progressionQuestline({
                    title: "Shared Title Chronicle",
                    steps: [
                        { stepNumber: 1, stepOrder: 1, title: "Shared Title Chronicle", detailEntryKey: entry.entryKey },
                    ],
                }),
            ],
            debugSummary: null,
        };

        const model = buildLoreFlowModel({
            selectedProgression: detailProgressionFrom(progression),
            fullProgression: progression,
            entriesByKey: { [entry.entryKey]: entry },
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });

        expect(loreTexts(model)).toEqual([
            "The first same-titled body remains visible.",
            "The second same-titled body remains visible.",
        ]);
    });
});
