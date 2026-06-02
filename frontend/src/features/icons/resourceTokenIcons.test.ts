import { getExtractorResourceIconPath, getResourceTokenIconPath } from "./resourceTokenIcons";

describe("resourceTokenIcons", () => {
    it("resolves exact luxury resource tokens through extractor raw icons", () => {
        expect(getResourceTokenIconPath("LuxuryResource01")).toBe(
            "/svg/constructibles/UI_Resource_Luxury_Klak.svg"
        );
        expect(getResourceTokenIconPath("[LuxuryResource16]")).toBe(
            "/svg/constructibles/UI_Resource_Luxury_FlowerSpirit.svg"
        );
    });

    it("resolves exact strategic resource tokens through extractor raw icons", () => {
        expect(getResourceTokenIconPath("StrategicResource01")).toBe(
            "/svg/constructibles/UI_Resource_Strategic_Titanium.svg"
        );
        expect(getResourceTokenIconPath("[StrategicResource06]")).toBe(
            "/svg/constructibles/UI_Resource_Strategic_Tthalitine.svg"
        );
    });

    it("resolves extractor entry keys to exact resource icons", () => {
        expect(getExtractorResourceIconPath("Extractor_Luxury01")).toBe(
            "/svg/constructibles/UI_Resource_Luxury_Klak.svg"
        );
        expect(getExtractorResourceIconPath("Extractor_Strategic02")).toBe(
            "/svg/constructibles/UI_Resource_Strategic_Glasteel.svg"
        );
    });

    it("returns null for unsupported resource tokens and extractor keys", () => {
        expect(getResourceTokenIconPath("FoodColored")).toBeNull();
        expect(getResourceTokenIconPath("LuxuryResource99")).toBeNull();
        expect(getExtractorResourceIconPath("Extractor_Unknown01")).toBeNull();
    });
});
