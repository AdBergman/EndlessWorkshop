import { getTechUnlockIconPath } from "./techUnlockIcons";

describe("techUnlockIcons", () => {
    it("resolves resolved constructible kinds to stable category icons", () => {
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Unit_A" }, "Unit"))
            .toBe("/svg/common/UI_Common_Unit.svg");
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "District_A" }, "District"))
            .toBe("/svg/factions/UI_Common_District.svg");
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Improvement_A" }, "Improvement"))
            .toBe("/svg/constructibles/UI_CityConstructionMode_Improvement.svg");
    });

    it("uses unlock categories when no concrete resolved kind is available", () => {
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Food_A", unlockCategory: "Food" }))
            .toBe("/svg/technologies/UI_Technology_UnlockCategory_DistrictImprovement_Food.svg");
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Science_A", unlockCategory: "Science" }))
            .toBe("/svg/technologies/UI_Technology_UnlockCategory_DistrictImprovement_Science.svg");
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Military_A", unlockCategory: "Military" }))
            .toBe("/svg/technologies/UI_Technology_UnlockCategory_DistrictImprovement_Military.svg");
    });

    it("falls back to the technology icon for unknown constructible-like rows", () => {
        expect(getTechUnlockIconPath({ unlockType: "Constructible", unlockKey: "Unknown_A" }))
            .toBe("/svg/common/UI_Common_Technology.svg");
    });
});

