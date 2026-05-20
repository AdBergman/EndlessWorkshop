import { describe, expect, it } from "vitest";
import type { QuestChronicleEntryDto } from "@/types/questTypes";
import { buildQuestExplorerViewModel } from "./questViewModel";

const entry = (overrides: Partial<QuestChronicleEntryDto> = {}): QuestChronicleEntryDto => ({
    entryKey: "Quest_A",
    primaryQuestKey: "Source_Quest_A",
    sourceQuestKeys: ["Source_Quest_A"],
    groupingKey: null,
    groupingReason: null,
    title: "First Quest",
    summaryLines: ["A recovered strategic record."],
    questType: "Curiosity",
    mandatory: true,
    keyNarrativeBeat: false,
    factionKey: "Faction_Kin",
    questLineKey: "FactionQuest_Kin",
    chapter: 1,
    chapterLabel: "Chapter 1",
    step: 1,
    stepLabel: "Step 1",
    branchKey: null,
    branchLabel: null,
    nextEntryKeys: ["Quest_B"],
    failureEntryKeys: [],
    convergesIntoEntryKeys: [],
    objectives: [
        {
            objectiveText: "Find the archive.",
            sourceQuestKey: "Source_Quest_A",
            choiceKey: "Choice_A",
            stepIndex: 0,
            descriptionLines: ["Find the archive."],
            completionLines: ["Visit the ruin."],
            failureLines: [],
            forbiddenLines: [],
            selectionLines: ["Reach recess 2."],
            rewardLines: ["Gain Dust."],
            completionRequirements: [],
            failureRequirements: [],
            forbiddenRequirements: [],
            selectionRequirements: [],
            rewards: [],
        },
    ],
    paths: [
        {
            pathKey: "Choice_A",
            label: "First Quest",
            labelSource: "choiceDisplayName",
            choiceOrdinal: 1,
            sourceQuestKey: "Source_Quest_A",
            choiceKey: "Choice_A",
            conditionLines: ["Visit the ruin."],
            rewardLines: ["Gain Dust."],
            nextEntryKeys: ["Quest_B"],
            failureEntryKeys: [],
            requirements: [],
            rewards: [],
        },
    ],
    transcriptBlocks: [
        {
            dialogKey: "Quest_A_Start",
            phase: "start",
            sourceQuestKey: "Source_Quest_A",
            choiceKey: "Choice_A",
            stepIndex: 0,
            lines: [{ lineIndex: 0, role: "narrator", speakerLabel: null, text: "The archive opens." }],
        },
    ],
    ...overrides,
});

describe("questViewModel chronicle mapping", () => {
    it("resolves route aliases through sourceQuestKeys and renders chronicle fields", () => {
        const model = buildQuestExplorerViewModel({
            quests: [entry(), entry({ entryKey: "Quest_B", sourceQuestKeys: ["Source_Quest_B"], title: "Second Quest" })],
            selection: { questKey: "Source_Quest_A", choiceKey: null, stepIndex: null },
        });

        expect(model.status).toBe("ready");
        expect(model.selection.questKey).toBe("Quest_A");
        expect(model.chronicle?.title).toBe("First Quest");
        expect(model.chronicle?.selectedObjectiveGroup?.requirementGroups[0]?.lines).toEqual(["Reach recess 2."]);
        expect(model.chronicle?.selectedChoice?.rewardLines).toEqual(["Gain Dust."]);
        expect(model.chronicle?.transcriptBlocks[0]?.lines[0]?.text).toBe("The archive opens.");
        expect(model.metadata?.nextQuestLinks[0]).toMatchObject({ questKey: "Quest_B", label: "Second Quest" });
    });
});
