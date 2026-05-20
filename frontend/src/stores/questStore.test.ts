import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import { useQuestStore } from "./questStore";
import type { QuestChronicleDto } from "@/types/questTypes";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestChronicle: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

const chronicle = (): QuestChronicleDto => ({
    game: "Endless Legend 2",
    gameVersion: "0.80",
    exporterVersion: "0.1.0",
    exportedAtUtc: "now",
    exportKind: "quest_chronicle",
    schemaVersion: "1",
    contractSurface: "questChronicle",
    entries: [
        {
            entryKey: "Quest_A",
            primaryQuestKey: "Source_A",
            sourceQuestKeys: ["Source_A", "Legacy_A"],
            groupingKey: null,
            groupingReason: null,
            title: "First Quest",
            summaryLines: [],
            questType: "Curiosity",
            mandatory: false,
            keyNarrativeBeat: false,
            factionKey: null,
            questLineKey: null,
            chapter: null,
            chapterLabel: null,
            step: null,
            stepLabel: null,
            branchKey: null,
            branchLabel: null,
            nextEntryKeys: [],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
            objectives: [],
            paths: [],
            transcriptBlocks: [],
        },
    ],
});

describe("questStore chronicle loading", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        mockedApiClient.getQuestChronicle.mockReset();
    });

    it("loads entries and indexes sourceQuestKeys as route aliases", async () => {
        mockedApiClient.getQuestChronicle.mockResolvedValue(chronicle());

        await useQuestStore.getState().loadQuestExplorer();
        const state = useQuestStore.getState();

        expect(mockedApiClient.getQuestChronicle).toHaveBeenCalledTimes(1);
        expect(state.entries).toHaveLength(1);
        expect(state.getQuestByKey("Quest_A")?.title).toBe("First Quest");
        expect(state.getQuestByKey("Legacy_A")?.entryKey).toBe("Quest_A");
    });
});
