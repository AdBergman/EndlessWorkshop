import { describe, expect, it } from "vitest";
import type { QuestExplorerEntry, QuestExplorerProgression } from "@/types/questTypes";
import {
    buildQuestRailGroups,
    getRailProgressionEntries,
    getVisibleRailEntries,
    isBranchRailEntry,
    resolveRailSelectionKey,
} from "./questRail";

const objective = (objectiveKey: string, text = objectiveKey) => ({
    objectiveKey,
    text,
    phase: "Objective",
    requirements: [],
    rewards: [],
});

const branch = (branchKey: string) => ({
    branchKey,
    choiceKey: null,
    label: branchKey,
    orderIndex: null,
    groupKey: null,
    groupLabel: null,
    nextEntryKeys: [],
    failureEntryKeys: [],
    convergesIntoEntryKeys: [],
    lore: null,
    strategy: null,
});

const entry = (overrides: Partial<QuestExplorerEntry> = {}): QuestExplorerEntry => ({
    entryKey: "FactionQuest_Mukag_Chapter02_Step01",
    title: "Forgotten Power",
    summaryLines: [],
    questType: "Faction Quest",
    isMandatory: true,
    isKeyNarrativeBeat: false,
    aliases: [],
    navigation: {
        factionKey: "Faction_Mukag",
        factionName: "Tahuks",
        questLineKey: "FactionQuest_Mukag",
        questLineName: "Tahuks",
        chapter: 2,
        chapterLabel: "Chapter 2",
        step: 1,
        stepLabel: "Step 1",
        sequenceIndex: 1,
        chapterOrder: 2,
        stepOrder: 1,
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        isBranchStart: null,
        isBranchEnd: null,
        previousEntryKeys: [],
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
    },
    loreView: { sections: [] },
    strategyView: { objectives: [] },
    branches: [],
    quality: null,
    ...overrides,
});

const testProgression = ({
    questLineKey = "FactionQuest_Mukag",
    questLineFamilyKey = "FactionQuest_Mukag",
    questLineName = "Tahuks",
    factionKey = "Faction_Mukag",
    factionFamilyKey = "Faction_Mukag",
    factionName = "Tahuks",
    chapterNumber = 2,
    chapterOrder = 2,
    title = "Forgotten Power",
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
}): QuestExplorerProgression => ({
    questlines: [
        {
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
        },
    ],
    debugSummary: null,
});

describe("quest rail projection", () => {
    it("hides backend branch variants from the left rail without choice-key inference", () => {
        const canonical = entry();
        const branchOutcome = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                ...entry().navigation,
                sequenceIndex: 2,
                branchGroupKey: "FactionQuest_Mukag_Chapter02_Step01",
                branchLabel: "Forgotten Power",
                branchOrder: 1,
            },
        });
        const choicePermutation = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice1",
            title: "Use the Holy Oculum to observe its abilities.",
            navigation: {
                ...entry().navigation,
                sequenceIndex: 3,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
            },
        });
        const progression = testProgression({
            steps: [
                {
                    stepNumber: 1,
                    stepOrder: 1,
                    title: "Forgotten Power",
                    detailEntryKey: canonical.entryKey,
                    variantEntryKeys: [branchOutcome.entryKey, choicePermutation.entryKey],
                },
            ],
        });

        expect(isBranchRailEntry(branchOutcome, progression)).toBe(true);
        expect(isBranchRailEntry(choicePermutation, progression)).toBe(true);
        expect(getVisibleRailEntries([
            canonical,
            branchOutcome,
            choicePermutation,
        ], progression)).toEqual([canonical]);
        expect(getRailProgressionEntries([
            canonical,
            branchOutcome,
            choicePermutation,
        ], progression)).toEqual([canonical]);
    });

    it("uses backend progression step counts instead of objectives, branches, or entry step orders", () => {
        const first = entry({
            strategyView: {
                objectives: [
                    objective("Objective_A"),
                    objective("Objective_B"),
                    objective("Objective_C"),
                ],
            },
            branches: [branch("Branch_A"), branch("Branch_B")],
        });
        const branchVariant = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                ...entry().navigation,
                sequenceIndex: 2,
                stepOrder: 99,
                branchGroupKey: first.entryKey,
                branchLabel: "Forgotten Power",
                branchOrder: 1,
            },
        });
        const later = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step04",
            title: "Forgotten Power",
            navigation: {
                ...entry().navigation,
                sequenceIndex: 3,
                step: 4,
                stepOrder: 400,
            },
        });
        const progression = testProgression({
            steps: [
                {
                    stepNumber: 1,
                    stepOrder: 1,
                    title: "Forgotten Power",
                    detailEntryKey: first.entryKey,
                    variantEntryKeys: [branchVariant.entryKey],
                },
                {
                    stepNumber: 2,
                    stepOrder: 2,
                    title: "Forgotten Power",
                    detailEntryKey: later.entryKey,
                },
            ],
        });

        const groups = buildQuestRailGroups([first, branchVariant, later], progression);

        expect(groups[0].items).toHaveLength(1);
        expect(groups[0].items[0].title).toBe("Forgotten Power");
        expect(groups[0].items[0].chapterLabel).toBe("Chapter 2");
        expect(groups[0].items[0].metaLabel).toBe("2 steps");
    });

    it("does not collapse numeric questline variants unless the backend progression already did", () => {
        const base = entry({
            entryKey: "FactionQuest_Necrophage_Chapter03_Step01",
            title: "Virgin Lands",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_Necrophage",
                questLineKey: "FactionQuest_Necrophage",
                chapter: 3,
                chapterLabel: "Chapter 3",
                chapterOrder: 3,
                sequenceIndex: 10,
            },
        });
        const variant = entry({
            entryKey: "FactionQuest_Necrophage02_Chapter03_Step01",
            title: "Virgin Lands",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_Necrophage02",
                questLineKey: "FactionQuest_Necrophage02",
                chapter: 3,
                chapterLabel: "Chapter 3",
                chapterOrder: 3,
                sequenceIndex: 11,
            },
        });
        const progression: QuestExplorerProgression = {
            questlines: [
                testProgression({
                    questLineKey: "FactionQuest_Necrophage",
                    questLineFamilyKey: "FactionQuest_Necrophage",
                    questLineName: "Necrophages",
                    factionKey: "Faction_Necrophage",
                    factionFamilyKey: "Faction_Necrophage",
                    factionName: "Necrophages",
                    chapterNumber: 3,
                    chapterOrder: 3,
                    title: "Virgin Lands",
                    steps: [{ stepNumber: 1, stepOrder: 1, title: "Virgin Lands", detailEntryKey: base.entryKey }],
                }).questlines[0],
                testProgression({
                    questLineKey: "FactionQuest_Necrophage02",
                    questLineFamilyKey: "FactionQuest_Necrophage02",
                    questLineName: "Necrophages",
                    factionKey: "Faction_Necrophage02",
                    factionFamilyKey: "Faction_Necrophage02",
                    factionName: "Necrophages",
                    chapterNumber: 3,
                    chapterOrder: 3,
                    title: "Virgin Lands",
                    steps: [{ stepNumber: 1, stepOrder: 1, title: "Virgin Lands", detailEntryKey: variant.entryKey }],
                }).questlines[0],
            ],
            debugSummary: null,
        };

        const groups = buildQuestRailGroups([base, variant], progression);

        expect(groups[0].items).toHaveLength(2);
        expect(groups[0].items.map((item) => item.entry.entryKey)).toEqual([
            base.entryKey,
            variant.entryKey,
        ]);
    });

    it("maps a selected hidden branch entry back through backend step variants", () => {
        const parent = entry();
        const hiddenBranch = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                ...entry().navigation,
                sequenceIndex: 2,
                branchGroupKey: parent.entryKey,
                branchLabel: "Forgotten Power",
                branchOrder: 1,
            },
        });
        const progression = testProgression({
            steps: [
                {
                    stepNumber: 1,
                    stepOrder: 1,
                    title: "Forgotten Power",
                    detailEntryKey: parent.entryKey,
                    variantEntryKeys: [hiddenBranch.entryKey],
                },
            ],
        });
        const groups = buildQuestRailGroups([parent, hiddenBranch], progression, new Set([hiddenBranch.entryKey]));

        expect(groups[0].items).toHaveLength(1);
        expect(groups[0].items[0].entry.entryKey).toBe(parent.entryKey);
        expect(resolveRailSelectionKey(hiddenBranch, groups)).toBe(parent.entryKey);
    });
});
