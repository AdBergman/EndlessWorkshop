import { describe, expect, it } from "vitest";
import type { QuestExplorerEntry } from "@/types/questTypes";
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
        step: 0,
        stepLabel: "Step 0",
        sequenceIndex: 1,
        chapterOrder: 2,
        stepOrder: 0,
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

describe("quest rail projection", () => {
    it("hides clear branch entries and choice permutations from the left rail", () => {
        const canonical = entry();
        const branchOutcome = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                ...entry().navigation,
                step: 2,
                stepLabel: "Step 2",
                sequenceIndex: 2,
                branchGroupKey: "FactionQuest_Mukag_Chapter02_Step02",
                branchLabel: "Forgotten Power",
                branchOrder: 1,
                previousEntryKeys: ["FactionQuest_Mukag_Chapter02_Step01"],
            },
        });
        const choicePermutation = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice1",
            title: "Use the Holy Oculum to observe its abilities.",
            navigation: {
                ...entry().navigation,
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 3,
            },
        });
        const factionEntryWithoutChapter = entry({
            entryKey: "FactionQuest_KinOfSheredyn_Chapter00_Step00",
            title: "Pryzja, a Kin youth, is missing.",
            navigation: {
                ...entry().navigation,
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 4,
            },
        });

        expect(isBranchRailEntry(branchOutcome)).toBe(true);
        expect(isBranchRailEntry(choicePermutation)).toBe(true);
        expect(getVisibleRailEntries([
            canonical,
            branchOutcome,
            choicePermutation,
            factionEntryWithoutChapter,
        ])).toEqual([canonical]);
        expect(getRailProgressionEntries([
            canonical,
            branchOutcome,
            choicePermutation,
            factionEntryWithoutChapter,
        ])).toEqual([canonical]);
    });

    it("uses objective and branch counts as rail metadata instead of synthetic steps", () => {
        const groups = buildQuestRailGroups([
            entry({
                strategyView: {
                    objectives: [
                        objective("Objective_A"),
                        objective("Objective_B"),
                        objective("Objective_C"),
                    ],
                },
                branches: [branch("Branch_A"), branch("Branch_B")],
            }),
            entry({
                entryKey: "FactionQuest_Mukag_Chapter03_Step01",
                title: "Precious Find",
                navigation: {
                    ...entry().navigation,
                    chapter: 3,
                    chapterLabel: "Chapter 3",
                    sequenceIndex: 2,
                },
                strategyView: { objectives: [objective("Objective_D")] },
            }),
        ]);

        expect(groups[0].items.map((item) => item.metaLabel)).toEqual([
            "3 objectives · 2 branches",
            "1 objective",
        ]);
    });

    it("collapses Necrophage numeric questline variants that represent the same titled chapter", () => {
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

        const groups = buildQuestRailGroups([base, variant]);

        expect(groups[0].items).toHaveLength(1);
        expect(groups[0].items[0].entry.entryKey).toBe(base.entryKey);
        expect(groups[0].items[0].canonicalEntryKeys).toEqual([
            base.entryKey,
            variant.entryKey,
        ]);
    });

    it("collapses Kin swapped-order variants by questline family and title while preferring the base questline entry", () => {
        const missingYouth = entry({
            entryKey: "FactionQuest_KinOfSheredyn_Chapter01_Step01",
            title: "The Missing Youth",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_KinOfSheredyn",
                questLineKey: "FactionQuest_KinOfSheredyn",
                chapter: 1,
                chapterLabel: "Chapter 1",
                chapterOrder: 1,
                sequenceIndex: 1,
            },
        });
        const stirringsVariant = entry({
            entryKey: "FactionQuest_KinOfSheredyn02_Chapter01_Step01",
            title: "Stirrings",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_KinOfSheredyn02",
                questLineKey: "FactionQuest_KinOfSheredyn02",
                chapter: 1,
                chapterLabel: "Chapter 1",
                chapterOrder: 1,
                sequenceIndex: 2,
            },
        });
        const stirringsBase = entry({
            entryKey: "FactionQuest_KinOfSheredyn_Chapter02_Step01",
            title: "Stirrings",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_KinOfSheredyn",
                questLineKey: "FactionQuest_KinOfSheredyn",
                chapter: 2,
                chapterLabel: "Chapter 2",
                chapterOrder: 2,
                sequenceIndex: 3,
            },
        });
        const missingYouthVariant = entry({
            entryKey: "FactionQuest_KinOfSheredyn02_Chapter02_Step01",
            title: "The Missing Youth",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_KinOfSheredyn02",
                questLineKey: "FactionQuest_KinOfSheredyn02",
                chapter: 2,
                chapterLabel: "Chapter 2",
                chapterOrder: 2,
                sequenceIndex: 4,
            },
        });

        const groups = buildQuestRailGroups([
            missingYouth,
            stirringsVariant,
            stirringsBase,
            missingYouthVariant,
        ]);

        expect(groups[0].items.map((item) => item.entry.entryKey)).toEqual([
            missingYouth.entryKey,
            stirringsBase.entryKey,
        ]);
        expect(groups[0].items.map((item) => item.title)).toEqual([
            "The Missing Youth",
            "Stirrings",
        ]);
        expect(groups[0].items[0].canonicalEntryKeys).toContain(missingYouthVariant.entryKey);
        expect(groups[0].items[1].canonicalEntryKeys).toContain(stirringsVariant.entryKey);
    });

    it("respects questline family boundaries when titles match", () => {
        const necrophage = entry({
            entryKey: "FactionQuest_Necrophage_Chapter06_Step01",
            title: "A Bitter Truth",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_Necrophage",
                questLineKey: "FactionQuest_Necrophage",
                chapter: 6,
                chapterLabel: "Chapter 6",
                sequenceIndex: 1,
            },
        });
        const otherQuestline = entry({
            entryKey: "FactionQuest_Other_Chapter06_Step01",
            title: "A Bitter Truth",
            navigation: {
                ...entry().navigation,
                factionKey: "Faction_Other",
                questLineKey: "FactionQuest_Other",
                chapter: 6,
                chapterLabel: "Chapter 6",
                sequenceIndex: 2,
            },
        });

        const groups = buildQuestRailGroups([necrophage, otherQuestline]);

        expect(groups[0].items.map((item) => item.entry.entryKey)).toEqual([
            necrophage.entryKey,
            otherQuestline.entryKey,
        ]);
    });

    it("does not let _Choice fallback collapse unrelated questlines", () => {
        const first = entry({
            entryKey: "FactionQuest_A_Chapter02_Step01",
            title: "Shared Choice Title",
            navigation: {
                ...entry().navigation,
                questLineKey: "FactionQuest_A",
                sequenceIndex: 1,
            },
        });
        const second = entry({
            entryKey: "FactionQuest_B_Chapter02_Step01",
            title: "Shared Choice Title",
            navigation: {
                ...entry().navigation,
                questLineKey: "FactionQuest_B",
                sequenceIndex: 2,
            },
        });

        expect(buildQuestRailGroups([first, second])[0].items).toHaveLength(2);
    });

    it("maps a selected hidden branch entry back to its visible rail parent through entry aliases", () => {
        const parent = entry({
            aliases: ["FactionQuest_Mukag_Chapter02_Step02"],
        });
        const hiddenBranch = entry({
            entryKey: "FactionQuest_Mukag_Chapter02_Step02_Choice01",
            title: "Pious",
            navigation: {
                ...entry().navigation,
                branchGroupKey: "FactionQuest_Mukag_Chapter02_Step02",
                branchOrder: 1,
                previousEntryKeys: [parent.entryKey],
            },
        });
        const groups = buildQuestRailGroups([parent, hiddenBranch]);

        expect(resolveRailSelectionKey(hiddenBranch, groups, {
            [parent.entryKey]: parent,
            [hiddenBranch.entryKey]: hiddenBranch,
        })).toBe(parent.entryKey);
    });
});
