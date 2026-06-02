import { getAbilityIconPath } from "./abilityIconResolver";

describe("abilityIconResolver", () => {
    it("resolves direct unit ability icons from raw manifest keys", () => {
        expect(getAbilityIconPath("UnitAbility_Ranged_3")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Fly")).toBe("/svg/unit-abilities/UI_UnitAbility_Fly.svg");
        expect(getAbilityIconPath("UnitAbility_DefenseExpert_1")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_DefenseExpert_1.svg"
        );
    });

    it("resolves known descriptor and status-backed ability aliases", () => {
        expect(getAbilityIconPath("UnitAbility_Aware")).toBe("/svg/unit-abilities/UI_UnitAbility_Aware.svg");
        expect(getAbilityIconPath("UnitAbility_BreakRangedUnitDamage")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_IgnoreRangedBreakDamage.svg"
        );
        expect(getAbilityIconPath("UnitAbility_Patroller_1")).toBe(
            "/svg/unit-abilities/UI_UnitAbility_Patroller_1.svg"
        );
    });

    it("returns null when the current manifest has no safe ability match", () => {
        expect(getAbilityIconPath("UnitAbility_Prototype_LandUnit")).toBeNull();
        expect(getAbilityIconPath("")).toBeNull();
    });
});

