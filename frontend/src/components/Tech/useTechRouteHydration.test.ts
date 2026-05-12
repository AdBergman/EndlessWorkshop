import {
    formatImportedTechToast,
    resolveDeepLinkedTech,
    resolveFactionFromKeyHint,
    resolveImportedTechKeys,
} from "@/components/Tech/useTechRouteHydration";
import { Faction, type Tech } from "@/types/dataTypes";

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: ["KIN"],
    excludes: null,
    coords: { xPct: 10, yPct: 20 },
    ...overrides,
});

describe("tech route hydration helpers", () => {
    it("resolves summary faction hints without coupling to tech data", () => {
        expect(resolveFactionFromKeyHint("kin_of_sheredyn")?.enumFaction).toBe(Faction.KIN);
        expect(resolveFactionFromKeyHint("last-lords")?.enumFaction).toBe(Faction.LORDS);
        expect(resolveFactionFromKeyHint("necrophages")?.enumFaction).toBe(Faction.NECROPHAGES);
        expect(resolveFactionFromKeyHint("unknown")).toBeNull();
    });

    it("resolves imported tech keys in incoming order and counts missing keys", () => {
        const result = resolveImportedTechKeys(
            ["Tech_First", " ", "Tech_Missing", "Tech_Second"],
            {
                Tech_First: tech({ techKey: "Tech_First" }),
                Tech_Second: tech({ techKey: "Tech_Second" }),
            }
        );

        expect(result.incomingTechKeys).toEqual(["Tech_First", "Tech_Missing", "Tech_Second"]);
        expect(result.resolvedTechKeys).toEqual(["Tech_First", "Tech_Second"]);
        expect(result.missingCount).toBe(1);
    });

    it("keeps current summary import toast copy stable", () => {
        expect(formatImportedTechToast(2, 2, 0)).toBe("Loaded 2 techs.");
        expect(formatImportedTechToast(1, 2, 1)).toBe("Loaded 1/2 techs.");
    });

    it("resolves deep links by tech key or normalized display name", () => {
        const allTechs = [
            tech({ techKey: "Tech_Workshop", name: "Workshop" }),
            tech({ techKey: "Tech_Kin_Trade_Routes", name: "Kin Trade Routes" }),
        ];

        expect(resolveDeepLinkedTech(allTechs, "Tech_Workshop")?.techKey).toBe("Tech_Workshop");
        expect(resolveDeepLinkedTech(allTechs, "kin_trade_routes")?.techKey).toBe("Tech_Kin_Trade_Routes");
        expect(resolveDeepLinkedTech(allTechs, "missing")).toBeUndefined();
    });
});
