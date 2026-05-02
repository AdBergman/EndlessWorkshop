import { buildEntriesByKey, resolveRelatedEntries } from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

describe("resolveRelatedEntries", () => {
    it("keeps only resolved references, removes self references, and de-duplicates keys", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Ability_A", "Hero_A", "Hero_A", "Missing_Key", "Unit_A"],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_A",
                displayName: "Unit A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const byKey = buildEntriesByKey(entries);
        const related = resolveRelatedEntries(entries[0], byKey);

        expect(related.map((entry) => entry.entryKey)).toEqual(["Hero_A", "Unit_A"]);
    });
});
