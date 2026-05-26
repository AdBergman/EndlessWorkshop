import { describe, expect, it } from "vitest";
import {
    createLoreChronologySnapshot,
    diffLoreChronologySnapshots,
    formatLoreChronologyDiff,
    formatLoreChronologySnapshot,
} from "@/features/quests/questLoreChronologyDiagnostic";
import { buildLoreFlowModel } from "@/features/quests/questLoreFlow";
import {
    progressionContextKey,
    selectionForChoice,
    type QuestDetailProgression,
    type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
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

function branchChronologyEntry(): QuestExplorerEntry {
    return questEntry({
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
    });
}

function branchChronologyProgression(entry: QuestExplorerEntry): QuestExplorerProgression {
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

function stagedNecrophageContinuationEntry(): QuestExplorerEntry {
    return questEntry({
        entryKey: "Quest_Necro_Ch6",
        title: "A Bitter Truth",
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
                    sectionKey: "Quest_Necro_Ch6:lore:enhance",
                    phase: "success",
                    choiceKey: "Choice_Enhance",
                    stepIndex: 0,
                    objectiveKey: "Objective_Enhance",
                    lines: [{ speakerLabel: "Prime", role: "character", text: "The enhanced warrior path resolves." }],
                },
                {
                    sectionKey: "Quest_Necro_Ch6:lore:save",
                    phase: "success",
                    choiceKey: "Choice_Save",
                    stepIndex: 0,
                    objectiveKey: "Objective_Save",
                    lines: [{ speakerLabel: "Prime", role: "character", text: "The saved girl path resolves." }],
                },
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
                ...testBranch("Branch_Execute", "Execute Kazra"),
                choiceKey: "Choice_Execute",
                sectionRole: "continuation",
                branchStepOrder: 4,
                parentBranchKey: "Branch_Site",
                prerequisiteBranchKeys: ["Branch_First", "Branch_Site"],
                choiceGroupKey: "Quest_Necro_Ch6:choice-group:step:4:after:Branch_Site",
            },
        ],
    });
}

function repeatedEntryProgression(entry: QuestExplorerEntry, stepCount: number): QuestExplorerProgression {
    return {
        questlines: [
            progressionQuestline({
                title: entry.title,
                steps: Array.from({ length: stepCount }, (_, index) => ({
                    stepNumber: index + 1,
                    stepOrder: index + 1,
                    title: entry.title,
                    detailEntryKey: entry.entryKey,
                })),
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

function buildLoreModelFor(
    entry: QuestExplorerEntry,
    progression: QuestExplorerProgression,
    choicePath: QuestPathChoiceSelection[] = []
): ReturnType<typeof buildLoreFlowModel> {
    const selectedProgression = detailProgressionFrom(progression);
    const contextKey = progressionContextKey(selectedProgression, entry.entryKey);

    return buildLoreFlowModel({
        selectedProgression,
        fullProgression: progression,
        entriesByKey: { [entry.entryKey]: entry },
        loreChoicePathsByContext: choicePath.length > 0 ? { [contextKey]: choicePath } : {},
        showRawHiddenRows: false,
    });
}

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

function firstChronicleStage(
    entry: QuestExplorerEntry,
    options: { showRawHiddenRows?: boolean } = {}
) {
    const progression = singleEntryProgression(entry);
    return buildLoreFlowModel({
        selectedProgression: detailProgressionFrom(progression),
        fullProgression: progression,
        entriesByKey: { [entry.entryKey]: entry },
        loreChoicePathsByContext: {},
        showRawHiddenRows: options.showRawHiddenRows ?? false,
    }).segments[0]?.loreSteps[0];
}

describe("buildLoreFlowModel", () => {
    it("diagnoses branch chronology as a stable read-choose-append transcript", () => {
        const entry = branchChronologyEntry();
        const progression = branchChronologyProgression(entry);
        const beforeModel = buildLoreModelFor(entry, progression);
        const stage = beforeModel.segments[0]?.loreSteps[0];
        const ashChoice = stage?.branchMoment?.decisionChoices
            .find((choiceItem) => choiceItem.choice.label === "Take the ash road")
            ?.choice;
        if (!stage || !ashChoice) throw new Error("Expected ash branch choice in chronology fixture.");

        const before = createLoreChronologySnapshot(beforeModel, "before branch selection");
        const afterModel = buildLoreModelFor(entry, progression, [
            selectionForChoice(stage.step.stepKey, ashChoice),
        ]);
        const after = createLoreChronologySnapshot(afterModel, "after branch selection");
        const diff = diffLoreChronologySnapshots(before, after);

        if (diff.preChoiceMutations.length > 0 || diff.removedBlocks.length > 0 || diff.duplicateStableKeysAfter.length > 0) {
            throw new Error([
                formatLoreChronologySnapshot(before),
                formatLoreChronologySnapshot(after),
                formatLoreChronologyDiff(diff),
            ].join("\n\n"));
        }

        const sharedOpening = after.blocks.find((block) => block.text === "Shared opening remains before the choice.");
        const ashChoiceNode = after.blocks.find((block) => block.group === "choice_node" && block.text === "Take the ash road");
        const ashConsequence = after.blocks.find((block) => block.text === "Ash branch consequence appends after the choice.");

        expect(before.blocks.map((block) => block.text)).toEqual([
            "Shared opening remains before the choice.",
            "Take the ash road",
            "Take the coral road",
        ]);
        expect(after.blocks.filter((block) => block.text === "Shared opening remains before the choice.")).toHaveLength(1);
        expect(after.blocks.some((block) => block.text === "Coral branch consequence remains hidden.")).toBe(false);
        expect(sharedOpening?.chronologyIndex).toBeLessThan(ashChoiceNode?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(ashChoiceNode?.chronologyIndex).toBeLessThan(ashConsequence?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(ashConsequence).toEqual(expect.objectContaining({
            group: "post_choice",
            source: "stage.selectedChoiceLoreSections",
            choiceKey: "Choice_Ash",
        }));
        expect(formatLoreChronologySnapshot(after)).toContain("[post_choice] stage.selectedChoiceLoreSections");
    });

    it("keeps deterministic continuation collapse in forward chronology order", () => {
        const entry = keyedContinuationEntry();
        const progression = keyedContinuationProgression();
        const model = buildLoreModelFor(entry, progression);
        const snapshot = createLoreChronologySnapshot(model, "deterministic continuation");

        const sharedSetup = snapshot.blocks.find((block) => block.text === "The shared setup belongs before the first choice.");
        const currentBeat = snapshot.blocks.find((block) => block.text === "The current beat belongs before the first choice.");
        const currentResolution = snapshot.blocks.find((block) => block.text === "The current resolution belongs before the first choice.");
        const continuation = snapshot.blocks.find((block) => (
            block.source === "branchMoment.continuation"
            && block.text === "Eliminate the threat"
        ));

        expect(snapshot.blocks.filter((block) => block.text === "The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(snapshot.blocks.some((block) => block.text === "The next beat waits for the selected continuation.")).toBe(false);
        expect(snapshot.blocks.some((block) => block.text === "The future beat must not leak.")).toBe(false);
        expect(sharedSetup?.chronologyIndex).toBeLessThan(currentBeat?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(currentBeat?.chronologyIndex).toBeLessThan(currentResolution?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(currentResolution?.chronologyIndex).toBeLessThan(continuation?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        if (!continuation) throw new Error(formatLoreChronologySnapshot(snapshot));
        expect(continuation).toEqual(expect.objectContaining({
            group: "choice_node",
            ownershipSource: expect.stringContaining("semantic=deterministic_continuation"),
        }));
    });

    it("anchors staged continuation branches after the selected choice instead of rewriting the choice node", () => {
        const entry = stagedNecrophageContinuationEntry();
        const progression = repeatedEntryProgression(entry, 4);
        const beforeModel = buildLoreModelFor(entry, progression);
        const continuationStage = beforeModel.segments[0]?.loreSteps
            .find((stage) => stage.branchMoment?.continuationChoices.some((choiceItem) => (
                choiceItem.choice.label === "Interact with Site of the Ancients using a hero"
            )));
        const siteChoice = continuationStage?.branchMoment?.continuationChoices[0]?.choice;
        if (!continuationStage || !siteChoice) throw new Error("Expected staged site continuation.");

        const afterModel = buildLoreModelFor(entry, progression, [
            selectionForChoice(continuationStage.step.stepKey, siteChoice),
        ]);
        const after = createLoreChronologySnapshot(afterModel, "after site continuation");
        const selectedStage = afterModel.segments[0]?.loreSteps
            .find((stage) => stage.renderedStep.selectedChoice?.choiceKey === "Choice_Site");
        const nextChoiceStage = afterModel.segments[0]?.loreSteps
            .find((stage) => stage.branchMoment?.branchingContinuationChoices.some((choiceItem) => (
                choiceItem.choice.label === "Enhance Hero"
            )));

        expect(selectedStage?.branchMoment?.continuationChoices.map((choiceItem) => choiceItem.choice.label)).toEqual([
            "Interact with Site of the Ancients using a hero",
        ]);
        expect(selectedStage?.branchMoment?.branchingContinuationChoices.map((choiceItem) => choiceItem.choice.label)).toEqual([]);
        expect(selectedStage?.selectedChoiceLoreSections.map((section) => section.lines.map((line) => line.text).join(" "))).toEqual([
            "The old site opens after the chosen continuation.",
            "The relic is recovered before the next choice.",
        ]);
        expect(nextChoiceStage?.branchMoment?.branchingContinuationChoices.map((choiceItem) => choiceItem.choice.label)).toEqual([
            "Enhance Hero",
            "Save Girl",
            "Execute Kazra",
        ]);

        const selectedChoiceBlock = after.blocks.find((block) => block.text === "Interact with Site of the Ancients using a hero");
        const selectedLoreBlock = after.blocks.find((block) => block.text === "The old site opens after the chosen continuation.");
        const futureChoiceBlock = after.blocks.find((block) => block.text === "Enhance Hero");

        expect(selectedChoiceBlock?.chronologyIndex).toBeLessThan(selectedLoreBlock?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(selectedLoreBlock?.chronologyIndex).toBeLessThan(futureChoiceBlock?.chronologyIndex ?? Number.MAX_SAFE_INTEGER);
        expect(after.blocks.filter((block) => block.text === "The swarm learns the bitter truth.")).toHaveLength(1);
        expect(after.blocks.some((block) => block.text === "The saved girl path resolves.")).toBe(false);
    });

    it("claims repeated narrative ownership once while leaving later continuation stages available", () => {
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
        expect(texts).not.toContain("The next beat waits for the selected continuation.");
        expect(texts).not.toContain("The future beat must not leak.");

        const continuationStep = model.segments
            .flatMap((segment) => segment.loreSteps)
            .find((step) => step.renderedStep.choices.some((choice) => choice.label === "Eliminate the threat"));
        expect(continuationStep).toBeDefined();
        expect(continuationStep?.loreSections).toEqual([]);
        expect(continuationStep?.loreSectionsWereSuppressed).toBe(true);
        expect(continuationStep?.kind).toBe("continuation");
        expect(continuationStep?.branchMoment).toEqual(expect.objectContaining({
            title: "Continue the chronicle",
            decisionChoices: [],
            continuationChoices: [
                expect.objectContaining({
                    stageLabel: "Continuation",
                    choice: expect.objectContaining({
                        label: "Eliminate the threat",
                        semanticStageKind: "deterministic_continuation",
                    }),
                }),
            ],
        }));
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

    it("emits decision-oriented chronicle stages only for explicit decision groups", () => {
        const entry = questEntry({
            entryKey: "Quest_Explicit_Decision",
            title: "Explicit Decision",
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
        });

        const stage = firstChronicleStage(entry);

        expect(stage?.kind).toBe("decision");
        expect(stage?.branchMoment).toEqual(expect.objectContaining({
            title: "Choose a path",
            continuationChoices: [],
            branchingContinuationChoices: [],
        }));
        expect(stage?.branchMoment?.decisionChoices.map((item) => ({
            label: item.choice.label,
            tone: item.tone,
            semanticStageKind: item.choice.semanticStageKind,
        }))).toEqual([
            { label: "Aid the scouts", tone: "decision", semanticStageKind: "explicit_decision_option" },
            { label: "Hold the gate", tone: "decision", semanticStageKind: "explicit_decision_option" },
        ]);
    });

    it("keeps non-true-choice topology forks separate from explicit decisions", () => {
        const entry = questEntry({
            entryKey: "Quest_Topology_Fork",
            title: "Topology Fork",
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
        });

        const stage = firstChronicleStage(entry);

        expect(stage?.kind).toBe("branching_continuation");
        expect(stage?.branchMoment).toEqual(expect.objectContaining({
            title: "Possible continuations",
            decisionChoices: [],
            continuationChoices: [],
        }));
        expect(stage?.branchMoment?.branchingContinuationChoices.map((item) => ({
            label: item.choice.label,
            tone: item.tone,
            stageLabel: item.stageLabel,
            semanticStageKind: item.choice.semanticStageKind,
        }))).toEqual([
            {
                label: "Northern continuation",
                tone: "branching_continuation",
                stageLabel: "Possible continuation",
                semanticStageKind: "topology_fork_option",
            },
            {
                label: "Southern continuation",
                tone: "branching_continuation",
                stageLabel: "Possible continuation",
                semanticStageKind: "topology_fork_option",
            },
        ]);
    });

    it("preserves unresolved and terminal chronicle stage kinds through adapter conversion", () => {
        const unresolvedStage = firstChronicleStage(questEntry({
            entryKey: "Quest_Unresolved",
            title: "Unresolved Future",
            branches: [
                {
                    ...testBranch("Branch_Unresolved", "Follow the rumor"),
                    sectionRole: "unresolved",
                },
            ],
        }), { showRawHiddenRows: true });
        const terminalStage = firstChronicleStage(questEntry({
            entryKey: "Quest_Terminal",
            title: "Terminal Future",
            branches: [
                {
                    ...testBranch("Branch_Terminal", "Hold the ending"),
                    sectionRole: "terminal",
                },
            ],
        }), { showRawHiddenRows: true });

        expect(unresolvedStage?.kind).toBe("unresolved");
        expect(unresolvedStage?.branchMoment?.continuationChoices[0]).toEqual(expect.objectContaining({
            stageLabel: "Unresolved continuation",
        }));
        expect(terminalStage?.kind).toBe("terminal");
        expect(terminalStage?.branchMoment?.continuationChoices[0]).toEqual(expect.objectContaining({
            stageLabel: "Ending",
        }));
    });
});
