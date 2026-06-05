import { describe, expect, it } from "vitest";
import { getUnitClassIcons } from "./unitClassIconResolver";

describe("unitClassIconResolver", () => {
    it("maps infantry to the melee constructible icon", () => {
        expect(getUnitClassIcons("UnitClass_Infantry")).toEqual([
            {
                label: "Infantry",
                path: "/svg/constructibles/UI_UnitItem_UnitClass_Melee.svg",
            },
        ]);
    });

    it("splits dual class units into readable class icons", () => {
        expect(getUnitClassIcons("UnitClass_JuggernaughtRanged", "Juggernaught Ranged")).toEqual([
            {
                label: "Juggernaught",
                path: "/svg/units/UI_UnitItem_UnitClass_Juggernaught.svg",
            },
            {
                label: "Ranged",
                path: "/svg/units/UI_UnitItem_UnitClass_Ranged.svg",
            },
        ]);
    });
});
