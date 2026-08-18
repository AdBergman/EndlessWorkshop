import {
    DEFAULT_DISTRICT_ARCHIVE_FILTERS,
    buildDistrictArchiveFamilies,
    buildDistrictArchiveFilterGroups,
    filterDistrictEntriesByArchiveFilters,
    getDistrictFamilyDisplayName,
} from "@/lib/codex/codexDistrictArchiveFilters";
import type { CodexEntry, District } from "@/types/dataTypes";

function districtEntry(overrides: Partial<CodexEntry>): CodexEntry {
    return {
        exportKind: "districts",
        entryKey: "District_Current",
        displayName: "Current District",
        descriptionLines: [],
        referenceKeys: [],
        facts: [
            { label: "Category", value: "Food" },
            { label: "Tier", value: "1" },
        ],
        sections: [],
        ...overrides,
    };
}

function richDistrict(overrides: Partial<District>): District {
    return {
        districtKey: "District_Current",
        displayName: "Current District",
        descriptionLines: [],
        unlockTechnologyKeys: [],
        levelUp: null,
        placementPrerequisites: null,
        ...overrides,
    };
}

describe("codexDistrictArchiveFilters", () => {
    it("builds player-facing District families instead of exported tier rows", () => {
        const entries = [
            districtEntry({ entryKey: "District_Tier1_Food", displayName: "Farm" }),
            districtEntry({
                entryKey: "District_Tier2_Food",
                displayName: "Advanced Farm",
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "2" },
                ],
            }),
            districtEntry({
                entryKey: "District_Tier3_Food",
                displayName: "Grand Farm",
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "3" },
                ],
            }),
            districtEntry({
                entryKey: "Necrophage_District_Tier1_Food",
                displayName: "Farm",
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({
                exportKind: "extractors",
                entryKey: "Extractor_Luxury01",
                displayName: "[Luxury01] Klax Extractor",
                facts: [
                    { label: "Category", value: "Resource" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({
                exportKind: "extractors",
                entryKey: "Extractor_Luxury02",
                displayName: "[Luxury02] Hydromiel Extractor",
                facts: [
                    { label: "Category", value: "Resource" },
                    { label: "Tier", value: "1" },
                ],
            }),
        ];
        const richDistrictByKey = {
            District_Tier1_Food: richDistrict({
                districtKey: "District_Tier1_Food",
                levelUp: {
                    targetDistrictKey: "District_Tier2_Food",
                    requiredAdjacentDistrictCount: 4,
                },
            }),
            District_Tier2_Food: richDistrict({
                districtKey: "District_Tier2_Food",
                tier: 2,
                levelUp: {
                    targetDistrictKey: "District_Tier3_Food",
                    requiredAdjacentDistrictCount: 6,
                },
            }),
            District_Tier3_Food: richDistrict({
                districtKey: "District_Tier3_Food",
                tier: 3,
            }),
            Necrophage_District_Tier1_Food: richDistrict({
                districtKey: "Necrophage_District_Tier1_Food",
                factionKey: "Necrophage",
                isFactionSpecific: true,
            }),
            Extractor_Luxury01: richDistrict({
                districtKey: "Extractor_Luxury01",
                category: "Resource",
            }),
            Extractor_Luxury02: richDistrict({
                districtKey: "Extractor_Luxury02",
                category: "Resource",
            }),
        };

        const families = buildDistrictArchiveFamilies(entries, richDistrictByKey);
        expect(families.map((family) => family.displayName).sort()).toEqual([
            "Extractor",
            "Farm",
            "Farm",
        ]);

        const universalFarm = families.find((family) =>
            family.displayName === "Farm" && family.group === "core"
        );
        expect(universalFarm?.entries.map((entry) => entry.entryKey)).toEqual([
            "District_Tier1_Food",
            "District_Tier2_Food",
            "District_Tier3_Food",
        ]);

        const groups = buildDistrictArchiveFilterGroups(
            entries,
            DEFAULT_DISTRICT_ARCHIVE_FILTERS,
            richDistrictByKey
        );
        expect(groups).toEqual([{
            key: "family",
            label: "Family",
            options: [
                { value: "core", label: "Core", count: 1 },
                { value: "infrastructure", label: "Infrastructure", count: 1 },
                { value: "necrophages", label: "Necrophages", count: 1 },
            ],
        }]);

        expect(filterDistrictEntriesByArchiveFilters(
            entries,
            { family: "core" },
            null,
            richDistrictByKey
        ).map((entry) => entry.entryKey)).toEqual(["District_Tier1_Food"]);

        expect(getDistrictFamilyDisplayName(entries[4], richDistrictByKey)).toBe("Extractor");
    });

    it("keeps bounded presentation mappings for named upgrade families", () => {
        const habitation = districtEntry({
            entryKey: "District_Tier2_City",
            displayName: "Advanced Habitations",
            facts: [{ label: "Category", value: "City" }],
        });
        const oculum = districtEntry({
            entryKey: "District_Tier2_Science",
            displayName: "Sacred Oculum",
            facts: [{ label: "Category", value: "Science" }],
        });

        expect(getDistrictFamilyDisplayName(habitation)).toBe("Communal Habitations");
        expect(getDistrictFamilyDisplayName(oculum)).toBe("Holy Oculum");
    });
});
