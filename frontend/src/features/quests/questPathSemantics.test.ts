import type { QuestChoiceDto, QuestStepDto } from "@/types/questTypes";
import { buildUserFacingQuestChoices, isInternalEffectChoice } from "./questPathSemantics";

const step = (overrides: Partial<QuestStepDto> = {}): QuestStepDto => ({
    stepIndex: 0,
    stepOrder: 0,
    objectiveText: "Use the Holy Oculum to observe its abilities.",
    nextQuestKey: "Quest_Next",
    failQuestKey: null,
    descriptionLines: ["Use the Holy Oculum to observe its abilities."],
    completionPrerequisiteLines: ["Use faction action: Mukag Monsoon Festival x2"],
    failurePrerequisiteLines: [],
    forbiddenPrerequisiteLines: [],
    selectionPrerequisiteLines: [],
    rewardDisplayLines: [],
    referenceKeys: [],
    dialogBlockIdentities: [],
    ...overrides,
});

const choice = (overrides: Partial<QuestChoiceDto> = {}): QuestChoiceDto => ({
    choiceKey: "Quest_Choice1ChoiceDefinition",
    displayName: "Forgotten Power",
    choiceOrder: 0,
    descriptionLines: ["Meng has grand ambitions."],
    completionPrerequisiteLines: ["Use faction action: Mukag Monsoon Festival x2"],
    failurePrerequisiteLines: [],
    rewardDisplayLines: [],
    nextQuestKeys: ["Quest_Next"],
    referenceKeys: [],
    steps: [step()],
    ...overrides,
});

describe("questPathSemantics", () => {
    it("detects internal effect choices by key", () => {
        expect(isInternalEffectChoice(choice({
            choiceKey: "Quest_Choice01EffectChoiceDefinition",
            steps: [step({ objectiveText: null, descriptionLines: [], completionPrerequisiteLines: [] })],
        }))).toBe(true);
        expect(isInternalEffectChoice(choice({ choiceKey: "Quest_Choice01ChoiceDefinition" }))).toBe(false);
    });

    it("filters internal effect choices out of visible paths", () => {
        const visibleChoices = buildUserFacingQuestChoices([
            choice({
                choiceKey: "Quest_Choice01EffectChoiceDefinition",
                steps: [step({ objectiveText: null, descriptionLines: [], completionPrerequisiteLines: [] })],
                nextQuestKeys: ["Quest_Internal"],
            }),
            choice({ choiceKey: "Quest_Choice01ChoiceDefinition" }),
        ]);

        expect(visibleChoices.map((item) => item.choiceKey)).toEqual(["Quest_Choice01ChoiceDefinition"]);
    });

    it("deduplicates equivalent raw choices and prefers the version with dialog refs", () => {
        const visibleChoices = buildUserFacingQuestChoices([
            choice({
                choiceKey: "Quest_Choice1ChoiceDefinition",
                steps: [step({ dialogBlockIdentities: [] })],
            }),
            choice({
                choiceKey: "Quest_Choice01ChoiceDefinition",
                steps: [step({ dialogBlockIdentities: ["Quest|Choice|0|Dialog_Start|start"] })],
            }),
            choice({
                choiceKey: "Quest_Choice2ChoiceDefinition",
                completionPrerequisiteLines: ["Property requirement: Camp Count = 2"],
                nextQuestKeys: ["Quest_Next"],
                steps: [
                    step({
                        objectiveText: "Satisfy Ksana with a Councilor well-versed in science.",
                        descriptionLines: ["Satisfy Ksana with a Councilor well-versed in science."],
                        completionPrerequisiteLines: ["Property requirement: Camp Count = 2"],
                    }),
                ],
            }),
        ]);

        expect(visibleChoices.map((item) => item.choiceKey)).toEqual([
            "Quest_Choice01ChoiceDefinition",
            "Quest_Choice2ChoiceDefinition",
        ]);
    });
});
