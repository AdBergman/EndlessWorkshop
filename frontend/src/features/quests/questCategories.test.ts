import { describe, expect, it } from "vitest";
import { Faction } from "@/types/dataTypes";
import type { QuestExplorerEntry } from "@/types/questTypes";
import {
    getQuestCategoryKey,
    getQuestCategoryLabel,
    questMatchesSelectedMajorFaction,
} from "./questCategories";

const entry = (overrides: Partial<QuestExplorerEntry> = {}): QuestExplorerEntry => ({
    entryKey: "FactionQuest_KinOfSheredyn_Chapter01_Step01",
    title: "First Tide",
    summaryLines: [],
    questType: "Faction Quest",
    isMandatory: true,
    isKeyNarrativeBeat: false,
    aliases: [],
    navigation: {
        factionKey: "Faction_KinOfSheredyn",
        factionName: "Kin of Sheredyn",
        questLineKey: "FactionQuest_KinOfSheredyn",
        questLineName: "Kin of Sheredyn",
        chapter: 1,
        chapterLabel: "Chapter 1",
        step: 1,
        stepLabel: "Step 1",
        sequenceIndex: 0,
        chapterOrder: 1,
        stepOrder: 1,
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        isBranchStart: true,
        isBranchEnd: false,
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

describe("quest category mapping", () => {
    it.each([
        ["Faction Quest", "faction", "Faction Quests"],
        ["Major Faction", "faction", "Faction Quests"],
        ["Minor Faction", "minorFaction", "Minor Faction Quests"],
        ["Minor Faction Quest", "minorFaction", "Minor Faction Quests"],
        ["Curiosity", "world", "World Quests"],
        ["End Game", "other", "Other Quests"],
        ["Future Exporter Value", "other", "Other Quests"],
        [null, "other", "Other Quests"],
    ] as const)("maps %s to %s", (questType, key, label) => {
        expect(getQuestCategoryKey(questType)).toBe(key);
        expect(getQuestCategoryLabel(questType)).toBe(label);
    });

    it("matches faction quests against the selected global major faction aliases", () => {
        expect(questMatchesSelectedMajorFaction(entry(), {
            isMajor: true,
            enumFaction: Faction.KIN,
            uiLabel: "Kin",
            minorName: null,
        })).toBe(true);

        expect(questMatchesSelectedMajorFaction(entry(), {
            isMajor: true,
            enumFaction: Faction.LORDS,
            uiLabel: "Lords",
            minorName: null,
        })).toBe(false);
    });

    it("does not faction-scope world, minor, or other quest categories", () => {
        expect(questMatchesSelectedMajorFaction(entry({ questType: "Curiosity" }), {
            isMajor: true,
            enumFaction: Faction.LORDS,
            uiLabel: "Lords",
            minorName: null,
        })).toBe(true);
    });
});
