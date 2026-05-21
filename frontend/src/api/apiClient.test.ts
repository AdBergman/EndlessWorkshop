import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";

describe("apiClient quest explorer", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("fetches the quest_explorer.v3 API endpoint", async () => {
        const payload = {
            exportKind: "quest_explorer",
            schemaVersion: "quest_explorer.v3",
            entries: [],
        };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(payload),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiClient.getQuestExplorer()).resolves.toEqual(payload);

        expect(fetchMock).toHaveBeenCalledWith("/api/quests/explorer", undefined);
    });
});
