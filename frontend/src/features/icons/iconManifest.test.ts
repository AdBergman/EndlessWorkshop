import {
    getIconByDescriptionToken,
    getIconPath,
    getRawIcon,
    getSemanticIcon,
    getStatIconByGameplayProperty,
} from "./iconManifest";

describe("iconManifest", () => {
    it("resolves direct semantic icon paths from the public SVG manifest", () => {
        expect(getIconPath("resources", "food")).toBe("/svg/constructibles/UI_Common_Resource_Food.svg");
        expect(getIconPath("resources", "influence")).toBe("/svg/resources/UI_Common_Resource_Influence.svg");
        expect(getIconPath("stats", "damage")).toBe("/svg/heroes/UI_UnitItem_Damage.svg");
        expect(getIconPath("stats", "health")).toBe("/svg/units/UI_UnitItem_Health.svg");
    });

    it("resolves gameplay properties through the semantic lookup index", () => {
        expect(getStatIconByGameplayProperty("FoodProduced")?.key).toBe("food");
        expect(getStatIconByGameplayProperty("DamageMin")?.key).toBe("damage");
        expect(getStatIconByGameplayProperty("CultureNet")?.key).toBe("influence");
        expect(getStatIconByGameplayProperty("InfluenceProduced")?.key).toBe("influence");
    });

    it("resolves bracket-description tokens using manifest symbols", () => {
        expect(getIconByDescriptionToken("DustColored")?.path).toBe("/svg/resources/UI_Common_Resource_Dust.svg");
        expect(getIconByDescriptionToken("[Health]")?.path).toBe("/svg/units/UI_UnitItem_Health.svg");
        expect(getIconByDescriptionToken("[FoodColored]")?.key).toBe("food");
        expect(getIconByDescriptionToken("[CultureColored]")?.key).toBe("influence");
    });

    it("keeps raw icon lookup explicit and fallback-only", () => {
        expect(getRawIcon("battleAbility_BloodMending_1")).toBe(
            "/svg/battle-abilities/UI_UnitAbility_BloodMending_1.svg"
        );
        expect(getRawIcon("missingRawIconKey")).toBeNull();
    });

    it("returns sanitized semantic entries without exporter internals", () => {
        const entry = getSemanticIcon("stats", "damage");

        expect(entry).toEqual({
            section: "stats",
            key: "damage",
            path: "/svg/heroes/UI_UnitItem_Damage.svg",
            color: "#C872FCFF",
            symbol: "[Damage]",
            gameplayProperties: ["DamageMin", "DamageMax", "DamageBonusFlat", "DamageBonusModifier"],
        });
        expect(entry).not.toHaveProperty("sourceMapperName");
        expect(entry).not.toHaveProperty("sourceMapperType");
        expect(entry).not.toHaveProperty("imageKey");
    });

    it("returns null for unknown semantic sections and keys", () => {
        expect(getSemanticIcon("unknown", "food")).toBeNull();
        expect(getSemanticIcon("resources", "unknown")).toBeNull();
        expect(getIconByDescriptionToken("[UnknownToken]")).toBeNull();
        expect(getStatIconByGameplayProperty("UnknownProperty")).toBeNull();
    });
});
