import { describe, expect, it } from "vitest";
import { factionInfoForKey, factionMatchesSelection, factionRouteValue } from "./factionIdentity";
import { getBackgroundUrl } from "./getBackgroundUrl";
describe("imported faction identity", () => {
    it("matches arbitrary faction keys and compatibility display strings", () => {
        const sand = factionInfoForKey("Faction_SandShaper");
        expect(factionMatchesSelection("Sand Shaper", sand)).toBe(true);
        expect(factionMatchesSelection("Faction_SandShaper", sand)).toBe(true);
        expect(factionMatchesSelection("Kin", sand)).toBe(false);
        expect(factionMatchesSelection("Kin of Sheredyn", factionInfoForKey("KIN"))).toBe(true);
    });

    it("keeps alternate identity distinct even when its public label matches the base faction", () => {
        const alternate = factionInfoForKey("Faction_KinOfSheredyn02", "Kin");
        expect(factionMatchesSelection("Kin Of Sheredyn02", alternate)).toBe(true);
        expect(factionMatchesSelection("Kin", alternate)).toBe(false);
        expect(factionRouteValue(alternate)).toBe("Faction_KinOfSheredyn02");
    });

    it("preserves legacy route slugs and supplies existing background assets for unfamiliar factions", () => {
        expect(factionRouteValue(factionInfoForKey("Faction_KinOfSheredyn"))).toBe("kin");
        expect(getBackgroundUrl("Faction_LastLord", 2)).toContain("lords_era_2.webp");
        expect(getBackgroundUrl("Sand Shaper", 2)).toContain("kin_era_2.webp");
    });
});
