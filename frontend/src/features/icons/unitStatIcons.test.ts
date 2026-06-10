import { getUnitCardStatIconPath } from "./unitStatIcons";
import { expectSourceToExclude, readSource } from "../../tests/sourceGuardTestUtils";

describe("unitStatIcons", () => {
    it("resolves unit card stat icons from the narrow description-token registry", () => {
        expect(getUnitCardStatIconPath("damage")).toBe("/svg/heroes/UI_UnitItem_Damage.svg");
        expect(getUnitCardStatIconPath("health")).toBe("/svg/units/UI_UnitItem_Health.svg");
        expect(getUnitCardStatIconPath("defense")).toBe("/svg/abilities/UI_UnitItem_Defense.svg");
        expect(getUnitCardStatIconPath("movement")).toBe("/svg/status-effects/UI_UnitItem_MovementPoints.svg");
        expect(getUnitCardStatIconPath("focus")).toBe("/svg/units/UI_UnitItem_Focus.svg");
        expect(getUnitCardStatIconPath("upkeep")).toBe("/svg/resources/UI_Common_Resource_Money.svg");
    });

    it("keeps unit card stat icons independent from broad SVG manifests", () => {
        const source = readSource("src", "features/icons/unitStatIcons.ts");

        expectSourceToExclude(source, [/iconManifest/, /semantic-manifest\.json/, /manifest\.json/]);
    });
});
