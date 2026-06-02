import { buildUnitDetailsPath, getUnitRouteFaction } from "./unitRoutes";
import type { Unit } from "@/types/dataTypes";

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_KinOfSheredyn_Archer",
    displayName: "Explorer",
    artId: null,
    faction: "KinOfSheredyn",
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    unitClassDisplayName: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("unitRoutes", () => {
    it("builds /units links from the target unit faction and unitKey", () => {
        expect(buildUnitDetailsPath(unit({}))).toBe(
            "/units?faction=kinofsheredyn&unitKey=Unit_KinOfSheredyn_Archer"
        );
    });

    it("includes minor-unit hydration params for minor faction units", () => {
        expect(buildUnitDetailsPath(unit({
            unitKey: "Unit_MinorFaction_Ametrine",
            faction: "Ametrine",
            isMajorFaction: false,
        }))).toBe("/units?faction=ametrine&unitKey=Unit_MinorFaction_Ametrine&origin=ametrine&minor=1");
    });

    it("normalizes faction route tokens", () => {
        expect(getUnitRouteFaction(unit({ faction: "Kin Of Sheredyn" }))).toBe("kinofsheredyn");
        expect(getUnitRouteFaction(unit({ faction: null }))).toBeNull();
    });
});
