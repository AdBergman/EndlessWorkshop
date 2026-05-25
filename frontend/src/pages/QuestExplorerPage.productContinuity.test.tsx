import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";
import { Faction } from "@/types/dataTypes";
import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerResponse,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionVariant,
} from "@/types/questTypes";
import QuestExplorerPage from "./QuestExplorerPage";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const factions: Record<string, { enumFaction: Faction; label: string; questLineName: string }> = {
    Faction_KinOfSheredyn: { enumFaction: Faction.KIN, label: "Kin", questLineName: "Kin of Sheredyn" },
    Faction_Necrophage: { enumFaction: Faction.NECROPHAGES, label: "Necrophages", questLineName: "Necrophage" },
    Faction_Mukag: { enumFaction: Faction.TAHUK, label: "Tahuks", questLineName: "Tahuks" },
    Faction_LastLord: { enumFaction: Faction.LORDS, label: "Last Lords", questLineName: "Last Lords" },
};

type EntryInput = {
    entryKey: string;
    title: string;
    factionKey: keyof typeof factions;
    questLineKey: string;
    chapterOrder: number | null;
    stepOrder: number | null;
    sequenceIndex: number;
    branches?: QuestBranch[];
    aliases?: string[];
    summaryLines?: string[];
    branchGroupKey?: string | null;
    branchLabel?: string | null;
    branchOrder?: number | null;
    previousEntryKeys?: string[];
    nextEntryKeys?: string[];
};

type BranchInput = Partial<QuestBranch> & {
    conditions?: string[];
};

function productEntry({
    entryKey,
    title,
    factionKey,
    questLineKey,
    chapterOrder,
    stepOrder,
    sequenceIndex,
    branches = [],
    aliases = [],
    summaryLines,
    branchGroupKey = null,
    branchLabel = null,
    branchOrder = null,
    previousEntryKeys = [],
    nextEntryKeys = [],
}: EntryInput): QuestExplorerEntry {
    const faction = factions[factionKey];

    return {
        entryKey,
        title,
        summaryLines: summaryLines ?? [`${title} product fixture summary.`],
        questType: "Major Faction",
        isMandatory: true,
        isKeyNarrativeBeat: null,
        aliases,
        navigation: {
            factionKey,
            factionName: faction.label,
            questLineKey,
            questLineName: faction.questLineName,
            chapter: chapterOrder,
            chapterLabel: chapterOrder == null ? null : `Chapter ${chapterOrder}`,
            step: stepOrder,
            stepLabel: stepOrder == null ? null : `Step ${stepOrder}`,
            sequenceIndex,
            chapterOrder,
            stepOrder,
            branchGroupKey,
            branchLabel,
            branchOrder,
            isBranchStart: null,
            isBranchEnd: null,
            previousEntryKeys,
            nextEntryKeys,
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: { sections: [] },
        strategyView: { objectives: [] },
        branches,
        quality: null,
    };
}

function productBranch(ownerKey: string, index: number, label: string, input: BranchInput = {}): QuestBranch {
    const { conditions = [], ...overrides } = input;

    return {
        branchKey: `${ownerKey}:branch:${index}`,
        choiceKey: null,
        label,
        orderIndex: index,
        groupKey: null,
        groupLabel: null,
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
        lore: null,
        strategy: { conditions, requirements: [], rewards: [] },
        ...overrides,
    };
}

function variant(
    entryKey: string,
    title: string,
    variantKind: "entry" | "branch_variant" = "entry",
    branchOrder: number | null = null
): QuestProgressionVariant {
    return {
        entryKey,
        title,
        variantKind,
        branchGroupKey: variantKind === "branch_variant" ? entryKey.replace(/_Choice\d+$/, "") : null,
        branchLabel: null,
        branchOrder,
        previousEntryKeys: [],
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
    };
}

function chapter(
    questLineKey: string,
    factionKey: keyof typeof factions,
    chapterOrder: number,
    title: string,
    steps: Array<{
        stepNumber: number;
        stepOrder: number;
        title: string;
        detailEntryKey: string;
        sourceEntryKeys?: string[];
        aliasEntryKeys?: string[];
        variants?: QuestProgressionVariant[];
        projectionKind?: string;
    }>
): QuestProgressionChapter {
    return {
        chapterNumber: chapterOrder,
        chapterOrder,
        title,
        steps: steps.map((step) => ({
            stepKey: `${questLineKey}:${factionKey}:chapter-${chapterOrder}:step-${step.stepOrder}`,
            stepNumber: step.stepNumber,
            stepOrder: step.stepOrder,
            title: step.title,
            projectionKind: step.projectionKind ?? "real_entry_backed",
            detailEntryKey: step.detailEntryKey,
            sourceEntryKeys: step.sourceEntryKeys ?? [step.detailEntryKey],
            aliasEntryKeys: step.aliasEntryKeys ?? [],
            variants: step.variants ?? [variant(step.detailEntryKey, step.title)],
        })),
    };
}

function questline(
    questLineKey: string,
    factionKey: keyof typeof factions,
    chapters: QuestProgressionChapter[]
): QuestProgressionQuestline {
    const faction = factions[factionKey];

    return {
        questLineKey,
        questLineFamilyKey: questLineKey,
        questLineName: faction.questLineName,
        factionKey,
        factionFamilyKey: factionKey,
        factionName: faction.label,
        sourceQuestLineKeys: [questLineKey],
        sourceFactionKeys: [factionKey],
        chapters,
    };
}

const kinCh0 = "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01";
const kinCh4 = "FactionQuest_KinOfSheredyn_Chapter04_Step01";
const necroCh3 = "FactionQuest_Necrophage_Chapter03_Step01";
const mukagCh2 = "FactionQuest_Mukag_Chapter02_Step01";
const mukagCh4 = "FactionQuest_Mukag_Chapter04_Step00";
const lastLordCh6A = "FactionQuest_LastLord_Chapter06A_Step01";
const lastLordCh6B = "FactionQuest_LastLord_Chapter06B_Step01";

const productContinuityPayload: QuestExplorerResponse = {
    gameVersion: "0.80",
    exporterVersion: "product-continuity-fixture",
    exportedAtUtc: "2026-05-24T05:30:13Z",
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    entries: [
        productEntry({
            entryKey: kinCh0,
            title: "A New Home",
            factionKey: "Faction_KinOfSheredyn",
            questLineKey: "FactionQuest_KinOfSheredyn",
            chapterOrder: 0,
            stepOrder: 0,
            sequenceIndex: 1,
            branches: [
                productBranch(kinCh0, 1, "Found a home for the surviving Kin.", {
                    choiceKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01ChoiceDefinition",
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                    conditions: ["Found your Capital City."],
                }),
                productBranch(kinCh0, 2, "Start the task of rebuilding your Empire.", {
                    choiceKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step02ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${kinCh0}:branch:1`,
                    parentChoiceKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01ChoiceDefinition",
                    prerequisiteBranchKeys: [`${kinCh0}:branch:1`],
                    prerequisiteBranchPath: [`${kinCh0}:branch:1`],
                    choiceGroupKey: `${kinCh0}:choice-group:step:2:after:${kinCh0}:branch:1`,
                    sectionRole: "continuation",
                    conditions: ["Build 1 District of any type in your Capital City Garin's Rest."],
                }),
                productBranch(kinCh0, 3, "Find local allies to join your ranks.", {
                    choiceKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step03ChoiceDefinition",
                    branchStepOrder: 3,
                    parentBranchKey: `${kinCh0}:branch:2`,
                    parentChoiceKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step02ChoiceDefinition",
                    prerequisiteBranchKeys: [`${kinCh0}:branch:1`, `${kinCh0}:branch:2`],
                    prerequisiteBranchPath: [`${kinCh0}:branch:1`, `${kinCh0}:branch:2`],
                    choiceGroupKey: `${kinCh0}:choice-group:step:3:after:${kinCh0}:branch:2`,
                    sectionRole: "continuation",
                    conditions: ["Assimilate 1 minor faction"],
                }),
            ],
        }),
        productEntry({
            entryKey: kinCh4,
            title: "The Hunt",
            factionKey: "Faction_KinOfSheredyn",
            questLineKey: "FactionQuest_KinOfSheredyn",
            chapterOrder: 4,
            stepOrder: 0,
            sequenceIndex: 40,
            nextEntryKeys: ["FactionQuest_KinOfSheredyn_Chapter05_Step01"],
            branches: [
                productBranch(kinCh4, 1, "Track", {
                    choiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step01_Choice01ChoiceDefinition",
                    branchStepOrder: 1,
                    choiceGroupKey: `${kinCh4}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    conditions: ["Pay the invoice at the quest location", "Defeat Brezvez's Guard"],
                }),
                productBranch(kinCh4, 2, "Capture the rogue Lieutenant.", {
                    choiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step02_Choice01ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${kinCh4}:branch:1`,
                    parentChoiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step01_Choice01ChoiceDefinition",
                    prerequisiteBranchKeys: [`${kinCh4}:branch:1`],
                    prerequisiteBranchPath: [`${kinCh4}:branch:1`],
                    choiceGroupKey: `${kinCh4}:choice-group:step:2:after:${kinCh4}:branch:1`,
                    convergenceGroupKey: `${kinCh4}:convergence:FactionQuest_KinOfSheredyn_Chapter05_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_KinOfSheredyn_Chapter05_Step01"],
                    conditions: ["Defeat Lieutenant Brezvez"],
                }),
                productBranch(kinCh4, 3, "Lure", {
                    choiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step01_Choice02ChoiceDefinition",
                    branchStepOrder: 1,
                    choiceGroupKey: `${kinCh4}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    conditions: ["Collect 2 pieces of pryzja's Trinket ( Curiosity) with a hero", "Have 4 councilors for 5 turns"],
                }),
                productBranch(kinCh4, 4, "Capture the rogue Lieutenant.", {
                    choiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step02_Choice02ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${kinCh4}:branch:3`,
                    parentChoiceKey: "FactionQuest_KinOfSheredyn_Chapter04_Step01_Choice02ChoiceDefinition",
                    prerequisiteBranchKeys: [`${kinCh4}:branch:3`],
                    prerequisiteBranchPath: [`${kinCh4}:branch:3`],
                    choiceGroupKey: `${kinCh4}:choice-group:step:2:after:${kinCh4}:branch:3`,
                    convergenceGroupKey: `${kinCh4}:convergence:FactionQuest_KinOfSheredyn_Chapter05_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_KinOfSheredyn_Chapter05_Step01"],
                    conditions: ["Defeat Lieutenant Brezvez"],
                }),
            ],
        }),
        productEntry({
            entryKey: "FactionQuest_KinOfSheredyn_Chapter05_Step01",
            title: "The Kin's Fate",
            factionKey: "Faction_KinOfSheredyn",
            questLineKey: "FactionQuest_KinOfSheredyn",
            chapterOrder: 5,
            stepOrder: 0,
            sequenceIndex: 50,
            previousEntryKeys: [kinCh4],
        }),
        productEntry({
            entryKey: necroCh3,
            title: "Virgin Lands",
            factionKey: "Faction_Necrophage",
            questLineKey: "FactionQuest_Necrophage",
            chapterOrder: 3,
            stepOrder: 0,
            sequenceIndex: 130,
            branches: [
                productBranch(necroCh3, 1, "Claim Lands", {
                    groupKey: "FactionQuest_Necrophage_Chapter01_Step03",
                    groupLabel: "Brave New World",
                    branchStepOrder: 1,
                    choiceGroupKey: `${necroCh3}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_Necrophage_Chapter03_Step02_Choice1"],
                    conditions: ["Use Strip Tile 3 times", "Claim a territory", "Use Sack in this territory"],
                }),
                productBranch(necroCh3, 2, "Virgin Lands", {
                    groupKey: "FactionQuest_Necrophage_Chapter01_Step03",
                    groupLabel: "Brave New World",
                    branchStepOrder: 2,
                    parentBranchKey: `${necroCh3}:branch:1`,
                    prerequisiteBranchKeys: [`${necroCh3}:branch:1`],
                    prerequisiteBranchPath: [`${necroCh3}:branch:1`],
                    choiceGroupKey: `${necroCh3}:choice-group:step:2:after:${necroCh3}:branch:1`,
                    convergenceGroupKey: `${necroCh3}:convergence:FactionQuest_Necrophage_Chapter04_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Necrophage_Chapter04_Step01"],
                    conditions: ["Collect 3 collectibles"],
                }),
                productBranch(necroCh3, 3, "Seek Facility", {
                    groupKey: "FactionQuest_Necrophage_Chapter01_Step03",
                    groupLabel: "Brave New World",
                    branchStepOrder: 1,
                    choiceGroupKey: `${necroCh3}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_Necrophage_Chapter03_Step02_Choice2"],
                    conditions: ["Clear the dungeon", "Win 25 battles"],
                }),
                productBranch(necroCh3, 4, "Virgin Lands", {
                    groupKey: "FactionQuest_Necrophage_Chapter01_Step03",
                    groupLabel: "Brave New World",
                    branchStepOrder: 2,
                    parentBranchKey: `${necroCh3}:branch:3`,
                    prerequisiteBranchKeys: [`${necroCh3}:branch:3`],
                    prerequisiteBranchPath: [`${necroCh3}:branch:3`],
                    choiceGroupKey: `${necroCh3}:choice-group:step:2:after:${necroCh3}:branch:3`,
                    convergenceGroupKey: `${necroCh3}:convergence:FactionQuest_Necrophage_Chapter04_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Necrophage_Chapter04_Step01"],
                    conditions: ["Reach 500 fortification for 5 turns"],
                }),
            ],
        }),
        productEntry({
            entryKey: mukagCh2,
            title: "Forgotten Power",
            factionKey: "Faction_Mukag",
            questLineKey: "FactionQuest_Mukag",
            chapterOrder: 2,
            stepOrder: 0,
            sequenceIndex: 220,
            nextEntryKeys: [
                "FactionQuest_Mukag_Chapter02_Step02_Choice01",
                "FactionQuest_Mukag_Chapter02_Step02_Choice02",
                "FactionQuest_Mukag_Chapter02_Step02_Choice03",
                "FactionQuest_Mukag_Chapter03_Step01",
            ],
            branches: [
                productBranch(mukagCh2, 1, "Forgotten Power", {
                    choiceKey: "FactionQuest_Mukag_Chapter02_Step01ChoiceDefinition",
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                    conditions: ["Maintain the required empire value for 5 turns", "Evolve unit: Fanatic once", "Use Build Bridge twice"],
                }),
                ...[
                    ["Pious", "01", "1", "Use faction action: Mukag Monsoon Festival twice"],
                    ["Open", "02", "2", "Have 15 researched technologies for 5 turns"],
                    ["Bold", "03", "3", "Maintain the required empire value for 5 turns"],
                ].flatMap(([label, padded, bare, condition], index) => ([
                    productBranch(mukagCh2, index * 2 + 2, label, {
                        choiceKey: `FactionQuest_Mukag_Chapter02_Step02_Choice${padded}EffectChoiceDefinition`,
                        branchStepOrder: 2,
                        parentBranchKey: `${mukagCh2}:branch:1`,
                        parentChoiceKey: "FactionQuest_Mukag_Chapter02_Step01ChoiceDefinition",
                        prerequisiteBranchKeys: [`${mukagCh2}:branch:1`],
                        prerequisiteBranchPath: [`${mukagCh2}:branch:1`],
                        choiceGroupKey: `${mukagCh2}:choice-group:step:2:after:${mukagCh2}:branch:1`,
                        sectionRole: "continuation",
                        nextEntryKeys: [`FactionQuest_Mukag_Chapter02_Step02_Choice${padded}`],
                    }),
                    productBranch(mukagCh2, index * 2 + 3, label, {
                        choiceKey: `FactionQuest_Mukag_Chapter02_Step02_Choice${bare}ChoiceDefinition`,
                        branchStepOrder: 2,
                        parentBranchKey: `${mukagCh2}:branch:1`,
                        parentChoiceKey: "FactionQuest_Mukag_Chapter02_Step01ChoiceDefinition",
                        prerequisiteBranchKeys: [`${mukagCh2}:branch:1`],
                        prerequisiteBranchPath: [`${mukagCh2}:branch:1`],
                        choiceGroupKey: `${mukagCh2}:choice-group:step:2:after:${mukagCh2}:branch:1`,
                        convergenceGroupKey: `${mukagCh2}:convergence:FactionQuest_Mukag_Chapter03_Step01`,
                        sectionRole: "continuation",
                        nextEntryKeys: ["FactionQuest_Mukag_Chapter03_Step01"],
                        conditions: [condition],
                    }),
                ])),
            ],
        }),
        ...[
            ["FactionQuest_Mukag_Chapter02_Step02_Choice01", "Pious", 221, 2],
            ["FactionQuest_Mukag_Chapter02_Step02_Choice02", "Open", 222, 3],
            ["FactionQuest_Mukag_Chapter02_Step02_Choice03", "Bold", 223, 4],
        ].map(([entryKey, title, sequenceIndex, stepOrder]) => productEntry({
            entryKey: String(entryKey),
            title: String(title),
            factionKey: "Faction_Mukag",
            questLineKey: "FactionQuest_Mukag",
            chapterOrder: 2,
            stepOrder: Number(stepOrder),
            sequenceIndex: Number(sequenceIndex),
            branchGroupKey: "FactionQuest_Mukag_Chapter02_Step02",
            branchLabel: "Forgotten Power",
            branchOrder: Number(stepOrder) - 1,
            previousEntryKeys: [mukagCh2],
        })),
        productEntry({
            entryKey: mukagCh4,
            title: "A Gamble",
            factionKey: "Faction_Mukag",
            questLineKey: "FactionQuest_Mukag",
            chapterOrder: 4,
            stepOrder: 0,
            sequenceIndex: 240,
            nextEntryKeys: [
                "FactionQuest_Mukag_Chapter04_Step02_Choice01",
                "FactionQuest_Mukag_Chapter04_Step02_Choice02",
                "FactionQuest_Mukag_Chapter05_Step01",
            ],
            branches: [
                productBranch(mukagCh4, 1, "A Gamble", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step00ChoiceDefinition",
                    sectionRole: "artifact",
                    conditions: ["Have hero equipment equipped: Hood of Inscriptions"],
                }),
                productBranch(mukagCh4, 2, "A Gamble", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step01ChoiceDefinition",
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                }),
                productBranch(mukagCh4, 3, "Pious", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice01EffectChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter04_Step02_Choice01"],
                }),
                productBranch(mukagCh4, 4, "Pious", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice1ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    convergenceGroupKey: `${mukagCh4}:convergence:FactionQuest_Mukag_Chapter05_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter05_Step01"],
                    conditions: ["Assign settlement population: Called Population 5 times"],
                }),
                productBranch(mukagCh4, 5, "Open", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice02EffectChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    convergenceGroupKey: `${mukagCh4}:convergence:FactionQuest_Mukag_Chapter04_Step02_Choice02`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter04_Step02_Choice02"],
                }),
                productBranch(mukagCh4, 6, "Open", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice2ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    convergenceGroupKey: `${mukagCh4}:convergence:FactionQuest_Mukag_Chapter05_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter05_Step01"],
                    conditions: ["Reach the required empire value"],
                }),
                productBranch(mukagCh4, 7, "Bold", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice03EffectChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    convergenceGroupKey: `${mukagCh4}:convergence:FactionQuest_Mukag_Chapter04_Step02_Choice02`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter04_Step02_Choice02"],
                }),
                productBranch(mukagCh4, 8, "Bold", {
                    choiceKey: "FactionQuest_Mukag_Chapter04_Step02_Choice3ChoiceDefinition",
                    branchStepOrder: 2,
                    parentBranchKey: `${mukagCh4}:branch:2`,
                    prerequisiteBranchKeys: [`${mukagCh4}:branch:2`],
                    prerequisiteBranchPath: [`${mukagCh4}:branch:2`],
                    choiceGroupKey: `${mukagCh4}:choice-group:step:2:after:${mukagCh4}:branch:2`,
                    convergenceGroupKey: `${mukagCh4}:convergence:FactionQuest_Mukag_Chapter05_Step01`,
                    sectionRole: "continuation",
                    nextEntryKeys: ["FactionQuest_Mukag_Chapter05_Step01"],
                    conditions: ["Have 5 missionary populations for 5 turns"],
                }),
            ],
        }),
        ...[
            ["FactionQuest_Mukag_Chapter04_Step02_Choice01", "Pious", 241, 3],
            ["FactionQuest_Mukag_Chapter04_Step02_Choice02", "Bold", 242, 4],
            ["FactionQuest_Mukag_Chapter04_Step02_Choice03", "Open", 243, 5],
        ].map(([entryKey, title, sequenceIndex, stepOrder]) => productEntry({
            entryKey: String(entryKey),
            title: String(title),
            factionKey: "Faction_Mukag",
            questLineKey: "FactionQuest_Mukag",
            chapterOrder: 4,
            stepOrder: Number(stepOrder),
            sequenceIndex: Number(sequenceIndex),
            branchGroupKey: "FactionQuest_Mukag_Chapter04_Step02",
            branchLabel: "A Gamble",
            branchOrder: Number(stepOrder) - 2,
            previousEntryKeys: [mukagCh4],
        })),
        productEntry({
            entryKey: lastLordCh6A,
            title: "A Mortal Life?",
            factionKey: "Faction_LastLord",
            questLineKey: "FactionQuest_LastLord",
            chapterOrder: 6,
            stepOrder: 0,
            sequenceIndex: 360,
            nextEntryKeys: [
                "FactionQuest_LastLord_Chapter06A_Step02_Choice1",
                "FactionQuest_LastLord_Chapter06A_Step02_Choice2",
            ],
            branches: [
                productBranch(lastLordCh6A, 1, "Reclaim", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                    conditions: ["Defeat Archimedias, the Seer"],
                }),
                productBranch(lastLordCh6A, 2, "Reclaim", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 1,
                    choiceGroupKey: `${lastLordCh6A}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_LastLord_Chapter06A_Step02_Choice1"],
                }),
                productBranch(lastLordCh6A, 3, "A Mortal Life?", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 2,
                    parentBranchKey: `${lastLordCh6A}:branch:2`,
                    prerequisiteBranchKeys: [`${lastLordCh6A}:branch:2`],
                    prerequisiteBranchPath: [`${lastLordCh6A}:branch:2`],
                    choiceGroupKey: `${lastLordCh6A}:choice-group:step:2:after:${lastLordCh6A}:branch:2`,
                    sectionRole: "continuation",
                    conditions: ["Defeat Aspects' Army"],
                }),
                productBranch(lastLordCh6A, 4, "Reject", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                    conditions: ["Defeat Galardi's Rebels"],
                }),
                productBranch(lastLordCh6A, 5, "Reject", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 1,
                    choiceGroupKey: `${lastLordCh6A}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_LastLord_Chapter06A_Step02_Choice2"],
                }),
                productBranch(lastLordCh6A, 6, "A Mortal Life?", {
                    groupKey: "FactionQuest_LastLord_Chapter03A_Step02",
                    groupLabel: "The Fork in the Road",
                    branchStepOrder: 2,
                    parentBranchKey: `${lastLordCh6A}:branch:5`,
                    prerequisiteBranchKeys: [`${lastLordCh6A}:branch:5`],
                    prerequisiteBranchPath: [`${lastLordCh6A}:branch:5`],
                    choiceGroupKey: `${lastLordCh6A}:choice-group:step:2:after:${lastLordCh6A}:branch:5`,
                    sectionRole: "continuation",
                    conditions: ["Have 4 protectorate slots for 10 turns"],
                }),
            ],
        }),
        productEntry({
            entryKey: lastLordCh6B,
            title: "Welcome Back, Faithful Friend",
            factionKey: "Faction_LastLord",
            questLineKey: "FactionQuest_LastLord",
            chapterOrder: 6,
            stepOrder: 0,
            sequenceIndex: 361,
            nextEntryKeys: [
                "FactionQuest_LastLord_Chapter06B_Step02_Choice1",
                "FactionQuest_LastLord_Chapter06B_Step02_Choice2",
            ],
            branches: [
                productBranch(lastLordCh6B, 1, "Forgive", {
                    branchStepOrder: 1,
                    choiceGroupKey: `${lastLordCh6B}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_LastLord_Chapter06B_Step02_Choice1"],
                    conditions: ["Claim a territory"],
                }),
                productBranch(lastLordCh6B, 2, "Welcome Back, Faithful Friend", {
                    branchStepOrder: 2,
                    parentBranchKey: `${lastLordCh6B}:branch:1`,
                    prerequisiteBranchKeys: [`${lastLordCh6B}:branch:1`],
                    prerequisiteBranchPath: [`${lastLordCh6B}:branch:1`],
                    choiceGroupKey: `${lastLordCh6B}:choice-group:step:2:after:${lastLordCh6B}:branch:1`,
                    sectionRole: "continuation",
                    conditions: ["Pay the invoice at the quest location", "Settlement reaches status: City"],
                }),
                productBranch(lastLordCh6B, 3, "Punish", {
                    branchStepOrder: 1,
                    sectionRole: "artifact",
                    conditions: ["Defeat Suluzzo's Loyalists"],
                }),
                productBranch(lastLordCh6B, 4, "Punish", {
                    branchStepOrder: 1,
                    choiceGroupKey: `${lastLordCh6B}:choice-group:step:1`,
                    sectionRole: "true_choice",
                    nextEntryKeys: ["FactionQuest_LastLord_Chapter06B_Step02_Choice2"],
                }),
                productBranch(lastLordCh6B, 5, "Welcome Back, Faithful Friend", {
                    branchStepOrder: 2,
                    parentBranchKey: `${lastLordCh6B}:branch:4`,
                    prerequisiteBranchKeys: [`${lastLordCh6B}:branch:4`],
                    prerequisiteBranchPath: [`${lastLordCh6B}:branch:4`],
                    choiceGroupKey: `${lastLordCh6B}:choice-group:step:2:after:${lastLordCh6B}:branch:4`,
                    sectionRole: "continuation",
                    conditions: ["Interact with Archimedias' Workshop"],
                }),
            ],
        }),
    ],
    progression: {
        questlines: [
            questline("FactionQuest_KinOfSheredyn", "Faction_KinOfSheredyn", [
                chapter("FactionQuest_KinOfSheredyn", "Faction_KinOfSheredyn", 0, "Tutorial", [
                    { stepNumber: 1, stepOrder: 0, title: "A New Home", detailEntryKey: kinCh0 },
                ]),
                chapter("FactionQuest_KinOfSheredyn", "Faction_KinOfSheredyn", 4, "The Hunt", [
                    { stepNumber: 1, stepOrder: 0, title: "The Hunt", detailEntryKey: kinCh4 },
                    {
                        stepNumber: 2,
                        stepOrder: 1,
                        title: "The Hunt",
                        detailEntryKey: kinCh4,
                        projectionKind: "virtual_alias_expanded",
                        sourceEntryKeys: [kinCh4],
                        variants: [variant(kinCh4, "The Hunt")],
                    },
                ]),
                chapter("FactionQuest_KinOfSheredyn", "Faction_KinOfSheredyn", 5, "The Kin's Fate", [
                    { stepNumber: 1, stepOrder: 0, title: "The Kin's Fate", detailEntryKey: "FactionQuest_KinOfSheredyn_Chapter05_Step01" },
                ]),
            ]),
            questline("FactionQuest_Necrophage", "Faction_Necrophage", [
                chapter("FactionQuest_Necrophage", "Faction_Necrophage", 3, "Virgin Lands", [
                    { stepNumber: 1, stepOrder: 0, title: "Virgin Lands", detailEntryKey: necroCh3 },
                ]),
            ]),
            questline("FactionQuest_Mukag", "Faction_Mukag", [
                chapter("FactionQuest_Mukag", "Faction_Mukag", 2, "Forgotten Power", [
                    { stepNumber: 1, stepOrder: 0, title: "Forgotten Power", detailEntryKey: mukagCh2 },
                    {
                        stepNumber: 2,
                        stepOrder: 1,
                        title: "Forgotten Power",
                        detailEntryKey: mukagCh2,
                        projectionKind: "virtual_alias_expanded",
                        sourceEntryKeys: [
                            mukagCh2,
                            "FactionQuest_Mukag_Chapter02_Step02_Choice01",
                            "FactionQuest_Mukag_Chapter02_Step02_Choice02",
                            "FactionQuest_Mukag_Chapter02_Step02_Choice03",
                        ],
                        aliasEntryKeys: ["FactionQuest_Mukag_Chapter02_Step02"],
                        variants: [
                            variant(mukagCh2, "Forgotten Power"),
                            variant("FactionQuest_Mukag_Chapter02_Step02_Choice01", "Pious", "branch_variant", 1),
                            variant("FactionQuest_Mukag_Chapter02_Step02_Choice02", "Open", "branch_variant", 2),
                            variant("FactionQuest_Mukag_Chapter02_Step02_Choice03", "Bold", "branch_variant", 3),
                        ],
                    },
                ]),
                chapter("FactionQuest_Mukag", "Faction_Mukag", 4, "A Gamble", [
                    { stepNumber: 1, stepOrder: 0, title: "A Gamble", detailEntryKey: mukagCh4 },
                    {
                        stepNumber: 2,
                        stepOrder: 1,
                        title: "A Gamble",
                        detailEntryKey: mukagCh4,
                        projectionKind: "virtual_alias_expanded",
                        sourceEntryKeys: [
                            mukagCh4,
                            "FactionQuest_Mukag_Chapter04_Step02_Choice01",
                            "FactionQuest_Mukag_Chapter04_Step02_Choice02",
                            "FactionQuest_Mukag_Chapter04_Step02_Choice03",
                        ],
                        aliasEntryKeys: ["FactionQuest_Mukag_Chapter04_Step02"],
                        variants: [
                            variant(mukagCh4, "A Gamble"),
                            variant("FactionQuest_Mukag_Chapter04_Step02_Choice01", "Pious", "branch_variant", 1),
                            variant("FactionQuest_Mukag_Chapter04_Step02_Choice02", "Bold", "branch_variant", 2),
                            variant("FactionQuest_Mukag_Chapter04_Step02_Choice03", "Open", "branch_variant", 3),
                        ],
                    },
                ]),
            ]),
            questline("FactionQuest_LastLord", "Faction_LastLord", [
                chapter("FactionQuest_LastLord", "Faction_LastLord", 6, "A Mortal Life?", [
                    { stepNumber: 1, stepOrder: 0, title: "A Mortal Life?", detailEntryKey: lastLordCh6A },
                ]),
                chapter("FactionQuest_LastLord", "Faction_LastLord", 6, "Welcome Back, Faithful Friend", [
                    { stepNumber: 1, stepOrder: 1, title: "Welcome Back, Faithful Friend", detailEntryKey: lastLordCh6B },
                ]),
            ]),
        ],
        debugSummary: null,
    },
};

function selectFaction(faction: Faction, uiLabel: string) {
    useFactionSelectionStore.getState().setSelectedFaction({
        isMajor: true,
        enumFaction: faction,
        uiLabel,
        minorName: null,
    });
}

function renderProductQuest(entryKey: string, faction: Faction, uiLabel: string, debug = false) {
    selectFaction(faction, uiLabel);
    const route = `/quests/${entryKey}${debug ? "?debugQuestProgression=true" : ""}`;

    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/quests/*" element={<QuestExplorerPage />} />
            </Routes>
        </MemoryRouter>
    );
}

function chronicle() {
    return screen.getByRole("region", { name: "Selected progression" });
}

function chronicleButtons() {
    return within(chronicle()).getAllByRole("button");
}

function queryChronicleButton(name: RegExp) {
    return within(chronicle()).queryByRole("button", { name });
}

function queryChronicleButtons(name: RegExp) {
    return within(chronicle()).queryAllByRole("button", { name });
}

function debugValue(label: string) {
    const panel = screen.getByRole("region", { name: "Quest progression debug" });
    const labelElement = within(panel).getByText(label);
    const value = labelElement.closest("div")?.querySelector("dd")?.textContent;
    expect(value).toBeDefined();
    return value ?? "";
}

function firstDebugStepValue(label: string) {
    return debugStepValue(0, label);
}

function debugStepValue(stepIndex: number, label: string) {
    const panel = screen.getByRole("region", { name: "Quest progression debug" });
    const step = panel.querySelectorAll(".questExplorer-debugStep")[stepIndex];
    expect(step).not.toBeNull();
    const labelElement = within(step as HTMLElement).getByText(label);
    const value = labelElement.closest("div")?.querySelector("dd")?.textContent;
    expect(value).toBeDefined();
    return value ?? "";
}

describe("QuestExplorerPage product continuity fixture", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(productContinuityPayload);
    });

    it("lets Kin Ch0 Lore advance through same-entry continuation beats", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh0, Faction.KIN, "kin", true);

        expect(await screen.findByRole("heading", { name: "A New Home" })).toBeInTheDocument();
        expect(within(chronicle()).getByRole("button", { name: /Found a home for the surviving Kin/ })).toBeInTheDocument();
        expect(queryChronicleButton(/Start the task of rebuilding/)).not.toBeInTheDocument();

        await user.click(within(chronicle()).getByRole("button", { name: /Found a home for the surviving Kin/ }));

        expect(within(chronicle()).getByRole("button", { name: /Start the task of rebuilding your Empire/ })).toBeInTheDocument();
        expect(screen.queryByText("Path Revealed")).not.toBeInTheDocument();
        expect(debugValue("active selected branch path")).toContain(`${kinCh0}:branch:1`);

        await user.click(within(chronicle()).getByRole("button", { name: /Start the task of rebuilding your Empire/ }));

        expect(within(chronicle()).getByRole("button", { name: /Find local allies to join your ranks/ })).toBeInTheDocument();
        expect(debugValue("active selected branch path")).toContain(`${kinCh0}:branch:1, ${kinCh0}:branch:2`);
    });

    it("renders Kin Ch0 Strategy as a required path without duplicate projected requirements", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh0, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "A New Home" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicleRegion = chronicle();
        expect(within(chronicleRegion).getByRole("region", { name: "Compact Objective" })).toBeInTheDocument();
        const requiredPath = within(chronicleRegion).getByRole("region", { name: "Required Path" });
        expect(within(requiredPath).queryByText("Alternative")).not.toBeInTheDocument();

        const homeChoice = within(requiredPath).getByRole("button", { name: /Found a home for the surviving Kin/ });
        expect(within(homeChoice).getByText("Required Path")).toBeInTheDocument();
        await user.click(homeChoice);

        expect(homeChoice).toHaveAttribute("aria-current", "true");
        expect(within(homeChoice).getByText("No further branch is recorded")).toBeInTheDocument();
        expect(within(homeChoice).queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(within(homeChoice).queryByText("Projected Rewards")).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(within(chronicleRegion).queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        const progressionDetails = chronicleRegion.querySelector(".questExplorer-strategyProgressionDetails");
        expect(progressionDetails).not.toBeNull();
        expect(progressionDetails).not.toHaveAttribute("open");
    });

    it("locks Kin Ch4 continuation gating counts and active selected branch path", async () => {
        const user = userEvent.setup();
        const normalRender = renderProductQuest(kinCh4, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);

        await user.click(within(chronicle()).getByRole("button", { name: /Track/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);
        expect(within(chronicle()).getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();

        normalRender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(kinCh4, Faction.KIN, "kin", true);

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("4");
        expect(firstDebugStepValue("hidden artifact count")).toBe("0");
        expect(debugValue("active selected branch path")).toBe("none");

        await user.click(within(chronicle()).getByRole("button", { name: /Track/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("4");
        expect(debugValue("active selected branch path")).toContain(`${kinCh4}:branch:1`);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(0);
        expect(within(chronicle()).getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();
        expect(screen.queryByText(/prerequisite branch path not selected/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(4);
        expect(queryChronicleButtons(/Capture the rogue Lieutenant/)).toHaveLength(2);
        expect(screen.getByText(/prerequisite branch path not selected/)).toBeInTheDocument();
    });

    it("locks Necrophage Ch3 continuation gating counts", async () => {
        const user = userEvent.setup();
        const normalRender = renderProductQuest(necroCh3, Faction.NECROPHAGES, "necrophages");

        expect(await screen.findByRole("heading", { name: "Virgin Lands" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();

        await user.click(within(chronicle()).getByRole("button", { name: /Claim Lands/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();
        expect(within(chronicle()).getByText("Collect 3 collectibles")).toBeInTheDocument();

        normalRender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(necroCh3, Faction.NECROPHAGES, "necrophages", true);

        expect(await screen.findByRole("heading", { name: "Virgin Lands" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("4");

        await user.click(within(chronicle()).getByRole("button", { name: /Claim Lands/ }));

        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("4");
        expect(debugValue("active selected branch path")).toContain(`${necroCh3}:branch:1`);
        expect(queryChronicleButton(/Collect 3 collectibles/)).not.toBeInTheDocument();
        expect(within(chronicle()).getByText("Collect 3 collectibles")).toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(4);
    });

    it("locks Mukag Ch2 and Ch4 staged continuation cleanup counts", async () => {
        const user = userEvent.setup();
        const ch2Render = renderProductQuest(mukagCh2, Faction.TAHUK, "mukag");

        expect(await screen.findByRole("heading", { name: "Forgotten Power" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(3);
        expect(queryChronicleButton(/Maintain the required empire value/)).not.toBeInTheDocument();
        expect(within(chronicle()).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle()).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle()).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);

        ch2Render.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(mukagCh4, Faction.TAHUK, "mukag", true);
        expect(await screen.findByRole("heading", { name: "A Gamble" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(3);
        expect(firstDebugStepValue("normal visible choice count")).toBe("0");
        expect(firstDebugStepValue("debug visible choice count")).toBe("8");
        expect(firstDebugStepValue("hidden artifact count")).toBe("2");
        expect(debugStepValue(1, "normal visible choice count")).toBe("4");
        expect(debugStepValue(1, "debug visible choice count")).toBe("7");
        expect(debugStepValue(1, "hidden staged continuation count")).toBe("3");
        expect(debugValue("active selected branch path")).toBe("none");
        expect(screen.queryByText(/hidden in normal UI: later convergence row collapsed behind nearer continuation choice/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(8);
    });

    it("reports Kin Ch4 Strategy as a chapter exit instead of complete", async () => {
        const user = userEvent.setup();
        renderProductQuest(kinCh4, Faction.KIN, "kin");

        expect(await screen.findByRole("heading", { name: "The Hunt" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        const chronicleRegion = chronicle();
        expect(within(chronicleRegion).getAllByRole("region", { name: "Compact Objective" })).toHaveLength(1);
        await user.click(within(chronicleRegion).getByRole("button", { name: /Track/ }));

        const trackChoice = within(chronicleRegion).getByRole("button", { name: /Track/ });
        expect(trackChoice).toHaveTextContent("Continues in Chapter 5: The Kin's Fate");
        expect(trackChoice).not.toHaveTextContent("No further branch is recorded");
        expect(useQuestStore.getState().selectedEntryKey).toBe(kinCh4);
    });

    it("locks Last Lord Ch6A and Ch6B duplicate artifact cleanup counts", async () => {
        const user = userEvent.setup();
        const ch6ARender = renderProductQuest(lastLordCh6A, Faction.LORDS, "lords", true);

        expect(await screen.findByRole("heading", { name: "A Mortal Life?" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("6");
        expect(firstDebugStepValue("hidden artifact count")).toBe("2");
        expect(screen.queryByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(chronicleButtons()).toHaveLength(6);
        expect(screen.getAllByText(/hidden in normal UI: duplicate no-link artifact beside true choices/)).toHaveLength(2);

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));
        await user.click(within(chronicle()).getByRole("button", { name: /Reclaim/ }));

        expect(firstDebugStepValue("normal visible choice count")).toBe("3");
        expect(debugValue("active selected branch path")).toContain(`${lastLordCh6A}:branch:2`);
        expect(queryChronicleButton(/Defeat Aspects' Army/)).toBeInTheDocument();

        ch6ARender.unmount();
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();

        renderProductQuest(lastLordCh6B, Faction.LORDS, "lords", true);
        expect(await screen.findByRole("heading", { name: "Welcome Back, Faithful Friend" })).toBeInTheDocument();
        expect(chronicleButtons()).toHaveLength(2);
        expect(firstDebugStepValue("normal visible choice count")).toBe("2");
        expect(firstDebugStepValue("debug visible choice count")).toBe("5");
        expect(firstDebugStepValue("hidden artifact count")).toBe("1");

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));
        expect(chronicleButtons()).toHaveLength(5);
        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        await user.click(within(chronicle()).getByRole("button", { name: /Forgive/ }));

        expect(firstDebugStepValue("normal visible choice count")).toBe("3");
        expect(debugValue("active selected branch path")).toContain(`${lastLordCh6B}:branch:1`);
        expect(queryChronicleButton(/Pay the invoice at the quest location/)).toBeInTheDocument();
    });
});
