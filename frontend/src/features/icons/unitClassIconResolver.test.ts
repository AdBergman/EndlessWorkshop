import { describe, expect, it } from "vitest";
import { getUnitClassIcons } from "./unitClassIconResolver";

describe("unitClassIconResolver", () => {
    it("maps infantry to the melee constructible icon", () => {
        expect(getUnitClassIcons("UnitClass_Infantry")).toEqual([
            expect.objectContaining({
                classKey: "infantry",
                label: "Infantry",
                path: "/svg/constructibles/UI_UnitItem_UnitClass_Melee.svg",
                bonusAbilityKey: "UnitAbility_Class_BonusVsRanged",
                bonusTargetLabel: "Ranged",
            }),
        ]);
    });

    it("splits dual class units into readable class icons", () => {
        expect(getUnitClassIcons("UnitClass_JuggernaughtRanged", "Juggernaught Ranged")).toEqual([
            expect.objectContaining({
                classKey: "juggernaught",
                label: "Juggernaught",
                path: "/svg/units/UI_UnitItem_UnitClass_Juggernaught.svg",
                bonusAbilityKey: "UnitAbility_Class_BonusVsHero",
                bonusTargetLabel: "Hero",
            }),
            expect.objectContaining({
                classKey: "ranged",
                label: "Ranged",
                path: "/svg/units/UI_UnitItem_UnitClass_Ranged.svg",
                bonusAbilityKey: "UnitAbility_Class_BonusVsFlying",
                bonusTargetLabel: "Flying",
            }),
        ]);
    });
});
