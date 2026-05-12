import { formatTechUnlocks } from "@/components/Tech/views/SpreadsheetToolbar";
import type { District, Improvement, Tech, Unit } from "@/types/dataTypes";

const baseTech: Tech = {
    techKey: "Tech_Test",
    name: "Test Tech",
    era: 1,
    type: "Empire",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
};

describe("formatTechUnlocks", () => {
    it("preserves spreadsheet unlock labels through normalized district and improvement joins", () => {
        const districtsByKey: Record<string, District> = {
            District_Harbor: {
                districtKey: "District_Harbor",
                displayName: "Harbor",
                descriptionLines: [],
            },
        };
        const improvementsByKey: Record<string, Improvement> = {
            Improvement_Market: {
                improvementKey: "Improvement_Market",
                displayName: "Market",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
        };
        const units = new Map<string, Unit>([
            [
                "Unit_Scout",
                {
                    unitKey: "Unit_Scout",
                    displayName: "Scout",
                    artId: null,
                    faction: null,
                    isMajorFaction: true,
                    isHero: false,
                    isChosen: false,
                    spawnType: null,
                    previousUnitKey: null,
                    nextEvolutionUnitKeys: [],
                    evolutionTierIndex: null,
                    unitClassKey: null,
                    attackSkillKey: null,
                    abilityKeys: [],
                    descriptionLines: [],
                },
            ],
        ]);

        const tech: Tech = {
            ...baseTech,
            unlocks: [
                { unlockType: "Constructible", unlockKey: "Unit_Scout" },
                { unlockType: "Constructible", unlockKey: "District_Harbor" },
                { unlockType: "Constructible", unlockKey: "Improvement_Market" },
                { unlockType: "Constructible", unlockKey: "Missing_Key" },
                { unlockType: "Action", unlockKey: "Action_Cut_Forest" },
            ],
        };

        expect(formatTechUnlocks(tech, { districtsByKey, improvementsByKey, units })).toBe(
            "Unit: Scout; District: Harbor; Improvement: Market"
        );
    });

    it("uses backend unlockCategory when formatting same-key exports", () => {
        const districtsByKey: Record<string, District> = {
            Shared_Key: {
                districtKey: "Shared_Key",
                displayName: "Shared District",
                descriptionLines: [],
            },
        };
        const improvementsByKey: Record<string, Improvement> = {
            Shared_Key: {
                improvementKey: "Shared_Key",
                displayName: "Shared Improvement",
                descriptionLines: [],
                unique: "City",
                cost: [],
            },
        };
        const tech: Tech = {
            ...baseTech,
            unlocks: [
                {
                    unlockType: "Constructible",
                    unlockKey: "Shared_Key",
                    unlockCategory: "Improvement",
                },
            ],
        };

        expect(formatTechUnlocks(tech, { districtsByKey, improvementsByKey, units: new Map() })).toBe(
            "Improvement: Shared Improvement"
        );
    });
});
