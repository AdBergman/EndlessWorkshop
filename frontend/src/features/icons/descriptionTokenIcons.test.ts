import { getDescriptionTokenIcon, resolveDescriptionTokenIconVariant } from "./descriptionTokenIcons";

describe("descriptionTokenIcons", () => {
    it("resolves description tokens through the temporary semantic manifest provider", () => {
        expect(getDescriptionTokenIcon("Health")?.path).toBe("/svg/units/UI_UnitItem_Health.svg");
        expect(getDescriptionTokenIcon("[Damage]")?.path).toBe("/svg/heroes/UI_UnitItem_Damage.svg");
        expect(getDescriptionTokenIcon("FoodColored")?.path).toBe("/svg/constructibles/UI_Common_Resource_Food.svg");
        expect(getDescriptionTokenIcon("[LuxuryResource01]")?.path).toBe(
            "/svg/constructibles/UI_Resource_Luxury_Klak.svg"
        );
    });

    it("returns null for tokens not present in the current provider", () => {
        expect(getDescriptionTokenIcon("AttackRange")).toBeNull();
        expect(getDescriptionTokenIcon("[UnknownToken]")).toBeNull();
    });

    it("accepts future variant context without inventing icons before exporter support arrives", () => {
        expect(
            getDescriptionTokenIcon("AttackRange", {
                line: "+3 [AttackRange] Attack Range",
                tokenIndex: 3,
            })
        ).toBeNull();
    });

    it("selects numeric token variants from the value immediately before the token", () => {
        const icon = resolveDescriptionTokenIconVariant(
            {
                path: "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg",
                variants: {
                    "3": { path: "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg" },
                    "7": { path: "/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg" },
                },
            },
            {
                line: "+7 [AttackRange] Attack Range",
                tokenIndex: 3,
            }
        );

        expect(icon.path).toBe("/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg");
    });

    it("keeps the base token icon when no numeric variant matches", () => {
        const icon = resolveDescriptionTokenIconVariant(
            {
                path: "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg",
                variants: {
                    "3": { path: "/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg" },
                },
            },
            {
                line: "+3.5 [AttackRange] Attack Range",
                tokenIndex: 5,
            }
        );

        expect(icon.path).toBe("/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg");
    });
});
