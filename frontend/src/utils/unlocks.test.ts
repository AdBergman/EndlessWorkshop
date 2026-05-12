import {
    getUnlockedDistrictsByKey,
    getUnlockedImprovementsByKey,
} from "@/utils/unlocks";
import type { District, Improvement, Tech } from "@/types/dataTypes";

const tech = (techKey: string, era: number, unlockKeys: string[]): Tech => ({
    techKey,
    name: techKey,
    era,
    type: "Empire",
    unlocks: unlockKeys.map((unlockKey) => ({
        unlockType: "Constructible",
        unlockKey,
    })),
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
});

describe("district and improvement unlock joins", () => {
    it("resolves selected tech unlock keys through normalized lookup maps", () => {
        const districtsByKey: Record<string, District> = {
            District_City_Center: {
                districtKey: "District_City_Center",
                displayName: "City Center",
                descriptionLines: ["Core district"],
            },
        };
        const improvementsByKey: Record<string, Improvement> = {
            Improvement_Public_Library: {
                improvementKey: "Improvement_Public_Library",
                displayName: "Public Library",
                descriptionLines: ["+10 Science"],
                unique: "City",
                cost: ["100 Industry"],
            },
        };

        const selectedTechs = [
            tech("Tech_Era_2", 2, [
                "District_City_Center",
                "Improvement_Public_Library",
                "Missing_Constructible",
            ]),
        ];

        expect(getUnlockedDistrictsByKey(selectedTechs, districtsByKey)).toEqual([
            {
                ...districtsByKey.District_City_Center,
                era: 2,
            },
        ]);
        expect(getUnlockedImprovementsByKey(selectedTechs, improvementsByKey)).toEqual([
            {
                ...improvementsByKey.Improvement_Public_Library,
                era: 2,
            },
        ]);
    });

    it("keeps the earliest unlock era and sorts by era then display name", () => {
        const improvementsByKey: Record<string, Improvement> = {
            Improvement_Archives: {
                improvementKey: "Improvement_Archives",
                displayName: "Archives",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
            Improvement_Bazaar: {
                improvementKey: "Improvement_Bazaar",
                displayName: "Bazaar",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
        };

        const selectedTechs = [
            tech("Tech_Era_3", 3, ["Improvement_Bazaar", "Improvement_Archives"]),
            tech("Tech_Era_1", 1, ["Improvement_Bazaar"]),
        ];

        expect(getUnlockedImprovementsByKey(selectedTechs, improvementsByKey).map((item) => ({
            key: item.improvementKey,
            era: item.era,
        }))).toEqual([
            { key: "Improvement_Bazaar", era: 1 },
            { key: "Improvement_Archives", era: 3 },
        ]);
    });
});

