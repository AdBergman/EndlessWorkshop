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

    it("resolves minor unit-facing faction names through their manifest aliases", () => {
        expect(getFactionIconPath("Ametrine")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Ametrine.svg");
        expect(getFactionIconPath("Blackhammers")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Blackhammer.svg");
        expect(getFactionIconPath("Daughters of Bor")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_DaughterBor.svg");
        expect(getFactionIconPath("Foundlings")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Foundling.svg");
        expect(getFactionIconPath("Gorog")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Gorog.svg");
        expect(getFactionIconPath("Green Scions")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_GreenScion.svg");
        expect(getFactionIconPath("Hoy and Ladhran")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_HoyLadran.svg");
        expect(getFactionIconPath("Hydracorn")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Hydracorn.svg");
        expect(getFactionIconPath("Noquensii")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Noquensii.svg");
        expect(getFactionIconPath("Ochling")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Ochling.svg");
        expect(getFactionIconPath("Oneiroi")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Oneiroi.svg");
        expect(getFactionIconPath("Sollusk")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Sollusk.svg");
        expect(getFactionIconPath("Consortium")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Consortium.svg");
        expect(getFactionIconPath("Unseeing Seers")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_UnseeingSeer.svg");
        expect(getFactionIconPath("Xavius")).toBe("/svg/hero-skills/UI_MinorEmpireSymbol_Xavius.svg");
    });

    it("returns null for unknown factions", () => {
        expect(getFactionIconPath("Faction_UnknownFuture")).toBeNull();
        expect(getFactionIconPath("")).toBeNull();
    });
});
