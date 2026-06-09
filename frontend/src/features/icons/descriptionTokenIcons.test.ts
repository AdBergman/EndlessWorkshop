import { existsSync } from "node:fs";
import { resolve } from "node:path";
import descriptionTokenIconsJson from "../../../public/svg/description-token-icons.json";
import { expectSourceToExclude, readSource } from "../../tests/sourceGuardTestUtils";
import { getDescriptionTokenIcon, resolveDescriptionTokenIconVariant } from "./descriptionTokenIcons";

describe("descriptionTokenIcons", () => {
    it("resolves description tokens through the runtime token icon registry", () => {
        expect(getDescriptionTokenIcon("Health")?.path).toBe("/svg/units/UI_UnitItem_Health.svg");
        expect(getDescriptionTokenIcon("[Damage]")?.path).toBe("/svg/heroes/UI_UnitItem_Damage.svg");
        expect(getDescriptionTokenIcon("FoodColored")?.path).toBe("/svg/constructibles/UI_Common_Resource_Food.svg");
        expect(getDescriptionTokenIcon("[LuxuryResource01]")?.path).toBe(
            "/svg/constructibles/UI_Resource_Luxury_Klak.svg"
        );
    });

    it("returns null for tokens not present in the current provider", () => {
        expect(getDescriptionTokenIcon("DEPRECATED")).toBeNull();
        expect(getDescriptionTokenIcon("[UnknownToken]")).toBeNull();
    });

    it("resolves hero attribute aliases through raw manifest keys", () => {
        expect(getDescriptionTokenIcon("Might")?.path).toBe(
            "/svg/unit-abilities/UI_HeroStatistic_StrengthAttribute.svg"
        );
        expect(getDescriptionTokenIcon("Intuition")?.path).toBe(
            "/svg/unit-abilities/UI_HeroStatistic_IntellectAttribute.svg"
        );
        expect(getDescriptionTokenIcon("Intuiton")?.path).toBe(
            "/svg/unit-abilities/UI_HeroStatistic_IntellectAttribute.svg"
        );
        expect(getDescriptionTokenIcon("Resilience")?.path).toBe(
            "/svg/unit-abilities/UI_HeroStatistic_ConstitutionAttribute.svg"
        );
        expect(getDescriptionTokenIcon("Determination")?.path).toBe(
            "/svg/unit-abilities/UI_HeroStatistic_DexterityAttribute.svg"
        );
    });

    it("resolves current codex resource and category aliases", () => {
        expect(getDescriptionTokenIcon("Money")?.path).toBe("/svg/resources/UI_Common_Resource_Money.svg");
        expect(getDescriptionTokenIcon("Influence")?.path).toBe("/svg/resources/UI_Common_Resource_Influence.svg");
        expect(getDescriptionTokenIcon("Food")?.path).toBe("/svg/constructibles/UI_Common_Resource_Food.svg");
        expect(getDescriptionTokenIcon("PublicOrder")?.path).toBe("/svg/resources/UI_Common_Resource_PublicOrder.svg");
        expect(getDescriptionTokenIcon("MilitaryColored")?.path).toBe(
            "/svg/technologies/UI_Technology_UnlockCategory_DistrictImprovement_Military.svg"
        );
        expect(getDescriptionTokenIcon("CadaversColored")?.path).toBe(
            "/svg/constructibles/UI_SpecialResources_Cadavers.svg"
        );
        expect(getDescriptionTokenIcon("Coral")?.path).toBe("/svg/resources/UI_SpecialResources_Coral.svg");
        expect(getDescriptionTokenIcon("Technology")?.path).toBe("/svg/common/UI_Common_Technology.svg");
        expect(getDescriptionTokenIcon("ResourceAll")?.path).toBe("/svg/resources/UI_Resource_Strategic_Any.svg");
        expect(getDescriptionTokenIcon("Luxury")?.path).toBe("/svg/resources/UI_Common_LuxuryResource.svg");
        expect(getDescriptionTokenIcon("ResourceLuxury")?.path).toBe("/svg/resources/UI_Common_LuxuryResource.svg");
    });

    it("resolves shorthand resource-number aliases from codex descriptions", () => {
        expect(getDescriptionTokenIcon("Luxury01")?.path).toBe("/svg/constructibles/UI_Resource_Luxury_Klak.svg");
        expect(getDescriptionTokenIcon("Luxury16")?.path).toBe(
            "/svg/constructibles/UI_Resource_Luxury_FlowerSpirit.svg"
        );
        expect(getDescriptionTokenIcon("Strategic01Colored")?.path).toBe(
            "/svg/constructibles/UI_Resource_Strategic_Titanium.svg"
        );
        expect(getDescriptionTokenIcon("Strategic06Colored")?.path).toBe(
            "/svg/constructibles/UI_Resource_Strategic_Tthalitine.svg"
        );
    });

    it("does not invent population category fallbacks when no safe registry path exists", () => {
        expect(getDescriptionTokenIcon("PopulationCategory_01")).toBeNull();
        expect(getDescriptionTokenIcon("PopulationCategory_02")).toBeNull();
        expect(getDescriptionTokenIcon("PopulationCategory_Homeless")).toBeNull();

        expect(getDescriptionTokenIcon("PopulationCategory_03")?.path).toBe(
            "/svg/populations/UI_PopulationCategory_3.svg"
        );
    });

    it("resolves attack range variants from the nearest integer before the token", () => {
        expect(
            getDescriptionTokenIcon("AttackRange", {
                line: "+3 [AttackRange] Attack Range",
                tokenIndex: 3,
            })?.path
        ).toBe("/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg");
        expect(
            getDescriptionTokenIcon("AttackRange", {
                line: "+7 [AttackRange] Attack Range",
                tokenIndex: 3,
            })?.path
        ).toBe("/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg");
        expect(getDescriptionTokenIcon("AttackRange")?.path).toBe("/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg");
    });

    it("does not resolve exporter formatting markers to borrowed gameplay icons", () => {
        expect(getDescriptionTokenIcon("DoubleArrow")).toBeNull();
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

    it("keeps runtime token lookup independent from the broad semantic manifest", () => {
        const source = readSource("src", "features/icons/descriptionTokenIcons.ts");

        expectSourceToExclude(source, [/semanticIconManifest/, /semantic-manifest\.json/]);
    });

    it("validates exported token registry paths used by the frontend", () => {
        const registry = descriptionTokenIconsJson as Record<string, {
            path: string;
            variants?: Record<string, { path: string }>;
        }>;
        const requiredTokens = [
            "foodColored",
            "industryColored",
            "dustColored",
            "scienceColored",
            "cultureColored",
            "publicOrderColored",
            "health",
            "damage",
            "defense",
            "attackRange",
            "movementPoints",
            "visionRange",
        ];

        for (const token of requiredTokens) {
            expect(registry[token]?.path, token).toMatch(/^\/svg\//);
            expect(existsSync(resolve("public", registry[token].path.slice(1))), token).toBe(true);
        }

        expect(Object.keys(registry.attackRange.variants ?? {})).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
        for (const range of ["1", "3", "7"]) {
            const path = registry.attackRange.variants?.[range]?.path;
            expect(path, `AttackRange.${range}`).toMatch(/^\/svg\//);
            expect(existsSync(resolve("public", path!.slice(1))), `AttackRange.${range}`).toBe(true);
        }
    });
});
