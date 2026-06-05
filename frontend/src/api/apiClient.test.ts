import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, type SeoRegenerationResult, type TechAdminDto } from "./apiClient";

function jsonResponse(payload: unknown, init: Partial<Response> = {}) {
    return {
        ok: init.ok ?? true,
        status: init.status ?? 200,
        json: vi.fn().mockResolvedValue(payload),
        text: vi.fn().mockResolvedValue(""),
    };
}

function textResponse(body: string, status = 500) {
    return {
        ok: false,
        status,
        json: vi.fn(),
        text: vi.fn().mockResolvedValue(body),
    };
}

function noContentResponse() {
    return {
        ok: true,
        status: 204,
        json: vi.fn(),
        text: vi.fn(),
    };
}

function stubFetch(response: unknown) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("apiClient contract", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it.each([
        ["getDistricts", () => apiClient.getDistricts(), "/api/districts"],
        ["getImprovements", () => apiClient.getImprovements(), "/api/improvements"],
        ["getTechs", () => apiClient.getTechs(), "/api/techs"],
        ["getUnits", () => apiClient.getUnits(), "/api/units"],
        ["getCodex", () => apiClient.getCodex(), "/api/codex"],
        ["getQuestExplorer", () => apiClient.getQuestExplorer(), "/api/quests/explorer"],
        ["getSavedBuild", () => apiClient.getSavedBuild("saved-build-id"), "/api/builds/saved-build-id"],
    ])("fetches %s from the expected read endpoint", async (_name, callClient, expectedUrl) => {
        const payload = [{ id: "payload" }];
        const fetchMock = stubFetch(jsonResponse(payload));

        await expect(callClient()).resolves.toBe(payload);

        expect(fetchMock).toHaveBeenCalledWith(expectedUrl, undefined);
    });

    it("creates saved builds with the expected POST contract", async () => {
        const payload = {
            uuid: "saved-build-id",
            name: "Rush Build",
            selectedFaction: "KIN",
            techIds: ["Tech_A", "Tech_B"],
            createdAt: "2026-06-05T00:00:00Z",
        };
        const fetchMock = stubFetch(jsonResponse(payload));

        await expect(apiClient.createSavedBuild("Rush Build", "KIN", ["Tech_A", "Tech_B"]))
            .resolves.toBe(payload);

        expect(fetchMock).toHaveBeenCalledWith("/api/builds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Rush Build",
                selectedFaction: "KIN",
                techIds: ["Tech_A", "Tech_B"],
            }),
        });
    });

    it("saves admin tech placements with the admin token header and no response body requirement", async () => {
        const placements: TechAdminDto[] = [{
            techKey: "Tech_Kin_Workshop",
            name: "Kin Workshop",
            era: 1,
            type: "Industry",
            coords: { xPct: 12, yPct: 34 },
        }];
        const fetchMock = stubFetch(noContentResponse());

        await expect(apiClient.saveTechPlacementsAdmin(placements, "admin-token"))
            .resolves.toBeUndefined();

        expect(fetchMock).toHaveBeenCalledWith("/api/admin/techs/placements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Token": "admin-token",
            },
            body: JSON.stringify(placements),
        });
    });

    it("regenerates SEO pages with the admin token header", async () => {
        const payload: SeoRegenerationResult = {
            generatedCount: 2,
            generatedRoutes: ["/codex/a", "/units/b"],
            skippedCount: 0,
            skippedByReason: {},
            warnings: [],
            errors: [],
            sitemapUpdated: true,
        };
        const fetchMock = stubFetch(jsonResponse(payload));

        await expect(apiClient.regenerateSeoPagesAdmin("admin-token")).resolves.toBe(payload);

        expect(fetchMock).toHaveBeenCalledWith("/api/admin/seo/regenerate", {
            method: "POST",
            headers: {
                "X-Admin-Token": "admin-token",
            },
        });
    });

    it("returns undefined for 204 JSON endpoints without parsing a body", async () => {
        const response = noContentResponse();
        stubFetch(response);

        await expect(apiClient.getSavedBuild("empty-result")).resolves.toBeUndefined();

        expect(response.json).not.toHaveBeenCalled();
    });

    it("includes response text in thrown HTTP errors", async () => {
        stubFetch(textResponse("validation failed", 422));

        await expect(apiClient.getUnits()).rejects.toThrow(
            "HTTP error! status: 422, body: validation failed"
        );
    });
});
