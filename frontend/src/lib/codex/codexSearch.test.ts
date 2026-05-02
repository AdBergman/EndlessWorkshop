import { filterCodexEntries, getAutocompleteEntries } from "@/lib/codex/codexSearch";
import type { CodexEntry } from "@/types/dataTypes";

const sampleEntries: CodexEntry[] = [
    {
        exportKind: "units",
        entryKey: "Unit_B",
        displayName: "Auriga Knight",
        descriptionLines: ["Fast strike unit"],
        referenceKeys: [],
    },
    {
        exportKind: "abilities",
        entryKey: "Ability_A",
        displayName: "Blossom",
        descriptionLines: ["Adds [FoodColored] to the empire."],
        referenceKeys: [],
    },
    {
        exportKind: "abilities",
        entryKey: "Ability_B",
        displayName: "Blossom",
        descriptionLines: ["Secondary bloom effect."],
        referenceKeys: [],
    },
];

describe("filterCodexEntries", () => {
    it("sorts by displayName with entryKey as a stable fallback", () => {
        const result = filterCodexEntries(sampleEntries);
        expect(result.map((entry) => entry.entryKey)).toEqual(["Unit_B", "Ability_A", "Ability_B"]);
    });

    it("searches across displayName, entryKey, exportKind, and descriptionLines", () => {
        expect(filterCodexEntries(sampleEntries, { query: "auriga" })).toHaveLength(1);
        expect(filterCodexEntries(sampleEntries, { query: "ability_b" })).toHaveLength(1);
        expect(filterCodexEntries(sampleEntries, { query: "units" })).toHaveLength(1);
        expect(filterCodexEntries(sampleEntries, { query: "foodcolored" })).toHaveLength(1);
    });

    it("applies kind filtering before sorting", () => {
        const result = filterCodexEntries(sampleEntries, { kind: "abilities" });
        expect(result.map((entry) => entry.entryKey)).toEqual(["Ability_A", "Ability_B"]);
    });

    it("prioritizes displayName matches over entryKey and description matches", () => {
        const result = filterCodexEntries(
            [
                {
                    exportKind: "units",
                    entryKey: "Bloom_Soldier",
                    displayName: "Auriga Knight",
                    descriptionLines: ["Frontline specialist"],
                    referenceKeys: [],
                },
                {
                    exportKind: "abilities",
                    entryKey: "Ability_A",
                    displayName: "Bloom Burst",
                    descriptionLines: ["Secondary effect"],
                    referenceKeys: [],
                },
                {
                    exportKind: "tech",
                    entryKey: "Tech_A",
                    displayName: "Harvest Doctrine",
                    descriptionLines: ["Improves bloom output"],
                    referenceKeys: [],
                },
            ],
            { query: "bloom" }
        );

        expect(result.map((entry) => entry.entryKey)).toEqual(["Ability_A", "Bloom_Soldier", "Tech_A"]);
    });

    it("returns a limited autocomplete list for non-empty queries", () => {
        const result = getAutocompleteEntries(sampleEntries, { query: "blossom", limit: 1 });
        expect(result).toHaveLength(1);
        expect(result[0].entryKey).toBe("Ability_A");
    });
});
