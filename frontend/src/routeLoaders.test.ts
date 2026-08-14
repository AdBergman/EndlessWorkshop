import { describe, expect, it } from "vitest";
import { getPrimaryRoutePreloadPaths } from "./routeLoaders";

describe("route chunk warmup planning", () => {
    it("warms secondary interactive routes from lightweight shell routes", () => {
        expect(getPrimaryRoutePreloadPaths("/tech")).toEqual([
            "/units",
            "/codex",
            "/quests",
            "/mods",
        ]);
    });

    it("does not re-warm the active route chunk", () => {
        expect(getPrimaryRoutePreloadPaths("/units?faction=kin")).toEqual([
            "/codex",
            "/quests",
            "/mods",
        ]);
    });

    it.each(["/codex", "/codex?category=districts", "/quests", "/quests/Quest_A", "/summary"])(
        "skips background route warming on heavyweight startup route %s",
        (path) => {
            expect(getPrimaryRoutePreloadPaths(path)).toEqual([]);
        }
    );

    it.each([
        { saveData: true },
        { effectiveType: "slow-2g" },
        { effectiveType: "2g" },
    ])("skips background route warming on constrained connections %#", (connection) => {
        expect(getPrimaryRoutePreloadPaths("/tech", connection)).toEqual([]);
    });
});
