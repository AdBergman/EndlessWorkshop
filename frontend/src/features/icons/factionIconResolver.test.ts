import { getFactionIconPath } from "./factionIconResolver";

describe("factionIconResolver", () => {
    it("resolves major faction keys and public aliases through faction icons", () => {
        expect(getFactionIconPath("Faction_KinOfSheredyn")).toBe(
            "/svg/factions/UI_Faction_KinOfSheredyn.svg"
        );
        expect(getFactionIconPath("Tahuk")).toBe("/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg");
        expect(getFactionIconPath("Faction_Tahuk")).toBe("/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg");
        expect(getFactionIconPath("Faction_Mukag")).toBe("/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg");
        expect(getFactionIconPath("Necrophages")).toBe("/svg/factions/UI_Faction_Necrophage.svg");
    });

    it("resolves minor faction keys through faction affinity icons", () => {
        expect(getFactionIconPath("MinorFaction_Ametrine")).toBe(
            "/svg/hero-skills/UI_MinorEmpireSymbol_Ametrine.svg"
        );
        expect(getFactionIconPath("MinorFaction_Gorog")).toBe(
            "/svg/hero-skills/UI_MinorEmpireSymbol_Gorog.svg"
        );
    });

    it("returns null for unknown factions", () => {
        expect(getFactionIconPath("Faction_UnknownFuture")).toBeNull();
        expect(getFactionIconPath("")).toBeNull();
    });
});
