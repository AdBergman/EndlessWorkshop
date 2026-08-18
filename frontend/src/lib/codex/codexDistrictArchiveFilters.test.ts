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
            "Farm (Necrophages)",
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

    it("collapses production-shaped category splits while disambiguating faction-owned duplicates", () => {
        const entries = [
            districtEntry({
                entryKey: "DistrictDefinition_District_Tier1_DivinePopMonument",
                displayName: "Divined Monument",
                facts: [
                    { label: "Category", value: "City" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({
                entryKey: "DistrictDefinition_District_Tier3_DivinePopMonument",
                displayName: "Grand Divined Monument",
                facts: [
                    { label: "Category", value: "ArtificialWonder" },
                    { label: "Tier", value: "3" },
                ],
            }),
            districtEntry({
                entryKey: "LastLord_District_Repository00",
                displayName: "Soul Repository",
                facts: [{ label: "Category", value: "Resource" }],
            }),
            districtEntry({
                entryKey: "LastLord_District_Repository00_Tier1",
                displayName: "Soul Repository",
                facts: [
                    { label: "Category", value: "City" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({
                entryKey: "Necrophage_District_Tier1_Food_v2",
                displayName: "Farm",
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "1" },
                ],
            }),
            districtEntry({
                entryKey: "District_Tier1_Food",
                displayName: "Farm",
                facts: [
                    { label: "Category", value: "Food" },
                    { label: "Tier", value: "1" },
                ],
            }),
        ];
        const richDistrictByKey = {
            DistrictDefinition_District_Tier1_DivinePopMonument: richDistrict({
                districtKey: "DistrictDefinition_District_Tier1_DivinePopMonument",
                category: "City",
                levelUp: {
                    targetDistrictKey: "DistrictDefinition_District_Tier3_DivinePopMonument",
                    requiredAdjacentDistrictCount: 4,
                },
            }),
            DistrictDefinition_District_Tier3_DivinePopMonument: richDistrict({
                districtKey: "DistrictDefinition_District_Tier3_DivinePopMonument",
                category: "ArtificialWonder",
                tier: 3,
            }),
            LastLord_District_Repository00: richDistrict({
                districtKey: "LastLord_District_Repository00",
                category: "Resource",
                factionKey: "LastLord",
                isFactionSpecific: true,
            }),
            LastLord_District_Repository00_Tier1: richDistrict({
                districtKey: "LastLord_District_Repository00_Tier1",
                category: "City",
                factionKey: "LastLord",
                isFactionSpecific: true,
                tier: 1,
            }),
            Necrophage_District_Tier1_Food_v2: richDistrict({
                districtKey: "Necrophage_District_Tier1_Food_v2",
                category: "Food",
                factionKey: "Necrophage",
                isFactionSpecific: true,
            }),
            District_Tier1_Food: richDistrict({
                districtKey: "District_Tier1_Food",
                category: "Food",
            }),
        };

        const families = buildDistrictArchiveFamilies(entries, richDistrictByKey);
        const displayNames = families.map((family) => family.displayName).sort();
        expect(displayNames).toEqual([
            "Divined Monument",
            "Farm",
            "Farm (Necrophages)",
            "Soul Repository",
        ]);
        expect(new Set(displayNames.map((value) => value.toLowerCase())).size).toBe(displayNames.length);
        expect(families.find((family) => family.displayName === "Divined Monument")?.entries)
            .toHaveLength(2);
        expect(families.find((family) => family.displayName === "Soul Repository")?.entries)
            .toHaveLength(2);
    });
});
