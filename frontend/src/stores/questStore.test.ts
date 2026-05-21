import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import {
    QUEST_FILTER_ALL,
    selectVisibleQuestEntries,
    useQuestStore,
} from "./questStore";
import type { QuestExplorerResponse } from "@/types/questTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const entry = (overrides: Partial<QuestExplorerResponse["entries"][number]> = {}): QuestExplorerResponse["entries"][number] => ({
    entryKey: "Quest_A",
    title: "First Quest",
    summaryLines: ["The archive opens."],
    questType: "Faction",
    isMandatory: true,
    isKeyNarrativeBeat: false,
    aliases: ["Legacy_A", "FactionQuest_A"],
    navigation: {
        factionKey: "Faction_A",
        factionName: "Faction A",
        questLineKey: "Line_A",
        questLineName: "Line A",
        chapter: 1,
        chapterLabel: "Chapter 1",
        step: 2,
        stepLabel: "Step 2",
        sequenceIndex: 2,
        chapterOrder: 1,
        stepOrder: 2,
        branchGroupKey: null,
        branchLabel: null,
        branchOrder: null,
        isBranchStart: false,
        isBranchEnd: false,
        previousEntryKeys: [],
        nextEntryKeys: ["Quest_B"],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
    },
    loreView: {
        sections: [
            {
                sectionKey: "Quest_A:start",
                phase: "start",
                choiceKey: null,
                stepIndex: null,
                objectiveKey: null,
                lines: [{ speakerLabel: "Archive", role: "narrator", text: "The archive opens." }],
            },
        ],
    },
    strategyView: {
        objectives: [
            {
                objectiveKey: "Quest_A:objective",
                text: "Reach the archive.",
                phase: "completion",
                requirements: [
                    {
                        requirementKey: "Req_A",
                        kind: "Population",
                        displayText: "Reach population 3.",
                        polarity: null,
                        groupLabel: "City",
                        groupOrder: 1,
                        targetRole: null,
                        targetLabel: "Capital",
                        requiredCount: 3,
                        durationTurns: null,
                        state: null,
                        referenceKind: null,
                        referenceKey: null,
                        referenceDisplayName: null,
                        codexEntryKey: null,
                    },
                ],
                rewards: [
                    {
                        rewardKey: "Reward_A",
                        kind: "Resource",
                        displayText: "Gain Dust.",
                        amount: 25,
                        groupLabel: "Reward",
                        groupOrder: 1,
                        formulaText: null,
                        assetKind: null,
                        assetKey: null,
                        assetDisplayName: "Dust",
                        referenceKind: null,
                        referenceKey: null,
                        referenceDisplayName: null,
                        codexEntryKey: null,
                        targetScopeLabel: null,
                    },
                ],
            },
        ],
    },
    branches: [],
    quality: { warnings: [] },
    ...overrides,
});

const explorer = (): QuestExplorerResponse => ({
    gameVersion: "0.80",
    exporterVersion: "0.1.0",
    exportedAtUtc: "now",
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    entries: [
        entry(),
        entry({
            entryKey: "Quest_B",
            title: "Second Quest",
            aliases: ["Legacy_B"],
            questType: "Curiosity",
            navigation: {
                ...entry().navigation,
                factionKey: "Minor_B",
                factionName: "Minor B",
                questLineKey: "Line_B",
                questLineName: "Line B",
                sequenceIndex: 1,
                nextEntryKeys: [],
            },
        }),
    ],
});

describe("questStore quest explorer loading", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
    });

    it("loads entries, sorts by navigation sequence, and indexes aliases", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(explorer());

        await useQuestStore.getState().loadQuestExplorer();
        const state = useQuestStore.getState();

        expect(mockedApiClient.getQuestExplorer).toHaveBeenCalledTimes(1);
        expect(state.entries.map((item) => item.entryKey)).toEqual(["Quest_B", "Quest_A"]);
        expect(state.getQuestByKey("Quest_A")?.title).toBe("First Quest");
        expect(state.getQuestByKey("Legacy_A")?.entryKey).toBe("Quest_A");
        expect(state.aliasToEntryKey.FactionQuest_A).toBe("Quest_A");
    });

    it("filters by search, faction, questline, and type", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(explorer());
        await useQuestStore.getState().loadQuestExplorer();

        useQuestStore.getState().setFilters({
            searchText: "dust",
            faction: "Faction_A",
            questLine: "Line_A",
            questType: "Faction",
        });

        expect(selectVisibleQuestEntries(useQuestStore.getState()).map((item) => item.entryKey)).toEqual(["Quest_A"]);

        useQuestStore.getState().setFilters({ questType: "Curiosity" });
        expect(selectVisibleQuestEntries(useQuestStore.getState())).toEqual([]);

        useQuestStore.getState().clearFilters();
        expect(useQuestStore.getState().filters.faction).toBe(QUEST_FILTER_ALL);
    });

    it("stores load errors without keeping stale entries", async () => {
        mockedApiClient.getQuestExplorer.mockRejectedValue(new Error("offline"));

        await useQuestStore.getState().loadQuestExplorer();

        expect(useQuestStore.getState().loaded).toBe(false);
        expect(useQuestStore.getState().entries).toEqual([]);
        expect(useQuestStore.getState().error).toContain("offline");
    });
});
