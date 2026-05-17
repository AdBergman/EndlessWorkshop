import type { QuestChoiceDto, QuestDto, QuestStepDto } from "@/types/questTypes";
import { diagnoseQuestGraph } from "./questGraphDiagnostics";

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Hold the archive.",
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

describe("questGraphDiagnostics", () => {
    it("reports dangling graph refs across quest, choice, step, failure, and converge fields", () => {
        const diagnostics = diagnoseQuestGraph([
            quest({
                questKey: "Quest_A",
                nextQuestKeys: ["Missing_Quest_Next"],
                previousQuestKeys: ["Missing_Quest_Previous"],
                convergesIntoQuestKey: "Missing_Quest_Converge",
                choices: [
                    choice({
                        nextQuestKeys: ["Missing_Quest_Choice"],
                        steps: [
                            step({
                                nextQuestKey: "Missing_Quest_Step",
                                failQuestKey: "Missing_Quest_Fail",
                            }),
                        ],
                    }),
                ],
            }),
        ]);

        expect(diagnostics.danglingEdges.map((edge) => edge.field)).toEqual([
            "previousQuestKeys",
            "nextQuestKeys",
            "convergesIntoQuestKey",
            "choice.nextQuestKeys",
            "step.nextQuestKey",
            "step.failQuestKey",
        ]);
    });

    it("reports duplicate titles and references that need compact disambiguation", () => {
        const diagnostics = diagnoseQuestGraph([
            quest({ questKey: "Quest_Source", displayName: "Source", nextQuestKeys: ["Quest_Target_A"] }),
            quest({ questKey: "Quest_Target_A", displayName: "A Bitter Truth", questSequenceIndex: 2 }),
            quest({ questKey: "Quest_Target_B", displayName: "A Bitter Truth", questSequenceIndex: 4 }),
        ]);

        expect(diagnostics.duplicateTitleGroups).toEqual([
            {
                title: "A Bitter Truth",
                questKeys: ["Quest_Target_A", "Quest_Target_B"],
            },
        ]);
        expect(diagnostics.refsToDuplicateTitles).toHaveLength(1);
        expect(diagnostics.refsToDuplicateTitles[0]).toMatchObject({
            sourceQuestKey: "Quest_Source",
            targetQuestKey: "Quest_Target_A",
            targetTitleDuplicateCount: 2,
        });
    });

    it("reports self refs, convergence overlaps, and previous/next reciprocity gaps", () => {
        const diagnostics = diagnoseQuestGraph([
            quest({
                questKey: "Quest_A",
                nextQuestKeys: ["Quest_A", "Quest_B"],
                convergesIntoQuestKey: "Quest_B",
            }),
            quest({
                questKey: "Quest_B",
                previousQuestKeys: ["Quest_C"],
            }),
            quest({
                questKey: "Quest_C",
            }),
        ]);

        expect(diagnostics.selfReferences.map((edge) => edge.targetQuestKey)).toEqual(["Quest_A"]);
        expect(diagnostics.convergeOverlaps).toHaveLength(1);
        expect(diagnostics.convergeOverlaps[0]).toMatchObject({
            sourceQuestKey: "Quest_A",
            targetQuestKey: "Quest_B",
            kind: "converges",
        });
        expect(diagnostics.questNextWithoutPreviousEdges.map((edge) => edge.targetQuestKey)).toEqual([
            "Quest_A",
            "Quest_B",
        ]);
        expect(diagnostics.previousWithoutQuestNextEdges.map((edge) => edge.sourceQuestKey)).toEqual(["Quest_B"]);
    });

    it("reports quest-level next links that diverge from choice and step success targets", () => {
        const diagnostics = diagnoseQuestGraph([
            quest({
                questKey: "Quest_A",
                nextQuestKeys: ["Quest_Choice_Node", "Quest_B"],
                choices: [
                    choice({
                        nextQuestKeys: ["Quest_B", "Quest_C"],
                        steps: [step({ nextQuestKey: "Quest_B" })],
                    }),
                ],
            }),
            quest({ questKey: "Quest_Choice_Node", displayName: "Choice Node" }),
            quest({ questKey: "Quest_B", displayName: "Branch B" }),
            quest({ questKey: "Quest_C", displayName: "Branch C" }),
        ]);

        expect(diagnostics.questNextMismatches).toEqual([
            {
                questKey: "Quest_A",
                title: "A Quest",
                questNextKeys: ["Quest_Choice_Node", "Quest_B"],
                interactiveNextKeys: ["Quest_B", "Quest_C"],
                questOnlyKeys: ["Quest_Choice_Node"],
                interactiveOnlyKeys: ["Quest_C"],
            },
        ]);
    });
});
